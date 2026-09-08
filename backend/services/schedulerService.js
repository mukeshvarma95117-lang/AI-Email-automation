import dbHelper from '../database/db.js';
import { resolveVariables } from './variableResolver.js';
import { sendEmail } from './emailService.js';
import { sendWhatsAppMessage } from './whatsappService.js';
import { sendSms } from './smsService.js';

let schedulerInterval = null;

/**
 * Converts a local datetime string (e.g. 2026-09-08T13:09:00) in any IANA timezone (e.g. Asia/Kolkata)
 * accurately into a UTC Date object.
 */
export function parseToUtc(dateTimeStr, timeZone) {
  if (!dateTimeStr) return new Date();
  const trimmed = String(dateTimeStr).trim();

  // If already ends with Z or has timezone offset
  if (/Z|[+-]\d{2}(?::?\d{2})?$/.test(trimmed)) {
    return new Date(trimmed);
  }

  try {
    const tz = timeZone || 'UTC';
    const [datePart, timePart] = trimmed.split('T');
    const [y, m, d] = datePart.split('-').map(Number);
    const [hr, min, sec] = (timePart || '00:00:00').split(':').map(Number);

    const utcBaseline = new Date(Date.UTC(y, m - 1, d, hr, min, sec || 0));

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false
    });

    const parts = formatter.formatToParts(utcBaseline);
    const p = {};
    parts.forEach(({ type, value }) => { p[type] = value; });
    const tzYear = Number(p.year);
    const tzMonth = Number(p.month);
    const tzDay = Number(p.day);
    const tzHour = Number(p.hour === '24' ? 0 : p.hour);
    const tzMinute = Number(p.minute);
    const tzSecond = Number(p.second);

    const asLocalInUtc = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute, tzSecond);
    const offsetMs = asLocalInUtc - utcBaseline.getTime();

    return new Date(utcBaseline.getTime() - offsetMs);
  } catch (err) {
    console.warn('TZ parse fallback:', err.message);
    return new Date(trimmed);
  }
}

export function startScheduler() {
  if (schedulerInterval) return;

  console.log('Starting SmartSend AI Background Message Scheduler (15s tick)...');

  // Check immediately, then every 15 seconds
  checkScheduledQueue();
  schedulerInterval = setInterval(checkScheduledQueue, 15000);
}

export function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}

/**
 * Process a single scheduled message job
 */
export async function processScheduledJob(job) {
  // Mark as processing to prevent race conditions
  dbHelper.run(
    "UPDATE scheduled_messages SET status = 'processing' WHERE id = ?",
    [job.id]
  );

  let recipientIds = [];
  try {
    recipientIds = JSON.parse(job.recipients_json || '[]');
  } catch (e) {
    recipientIds = [];
  }

  // Fetch master message to get CTA button and prompt if available
  const masterMsg = job.message_id
    ? dbHelper.get('SELECT * FROM messages WHERE id = ?', [job.message_id])
    : null;
  const cta = masterMsg?.cta || '';

  // Fetch contacts
  let contacts = [];
  if (recipientIds.length > 0) {
    const placeholders = recipientIds.map(() => '?').join(',');
    contacts = dbHelper.all(
      `SELECT c.*, g.name as group_name 
       FROM contacts c 
       LEFT JOIN groups_table g ON c.group_id = g.id 
       WHERE c.id IN (${placeholders})`,
      recipientIds
    );
  }

  let successCount = 0;
  let failCount = 0;

  if (contacts.length === 0) {
    console.warn(`Scheduled job ${job.id} has no matching contacts in DB (recipients: ${job.recipients_json})`);
    dbHelper.run("UPDATE scheduled_messages SET status = 'failed' WHERE id = ?", [job.id]);
    if (job.message_id) {
      dbHelper.run("UPDATE messages SET status = 'failed' WHERE id = ?", [job.message_id]);
    }
    return { success: false, error: 'No matching contacts found.' };
  }

  for (const contact of contacts) {
    const { text: renderedBody } = resolveVariables(job.body, contact);
    const { text: renderedSubject } = resolveVariables(job.subject || '', contact);

    let target = '';
    let sendResult = { success: false, status: 'Failed', error: 'No target address' };

    if (job.channel === 'email') {
      target = contact.email;
      if (target) {
        sendResult = await sendEmail({
          to: target,
          subject: renderedSubject,
          body: renderedBody,
          cta,
          forceReal: job.is_demo === 0
        });
      }
    } else if (job.channel === 'whatsapp') {
      target = contact.phone;
      if (target) {
        sendResult = await sendWhatsAppMessage({ to: target, body: renderedBody });
      }
    } else if (job.channel === 'sms') {
      target = contact.phone;
      if (target) {
        sendResult = await sendSms({ to: target, body: renderedBody });
      }
    }

    if (sendResult.success) successCount++;
    else failCount++;

    // Log delivery record
    dbHelper.run(
      `INSERT INTO message_logs 
       (message_id, contact_id, contact_name, contact_target, channel, rendered_subject, rendered_body, status, is_demo, error_message, delivery_timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        job.message_id || null,
        contact.id,
        contact.name,
        target || 'Unknown',
        job.channel,
        renderedSubject,
        renderedBody,
        sendResult.status || (sendResult.success ? 'Sent' : 'Failed'),
        sendResult.isDemo ? 1 : 0,
        sendResult.error || null
      ]
    );
  }

  // Mark job as completed
  const finalStatus = failCount > 0 && successCount === 0 ? 'failed' : 'completed';
  dbHelper.run(
    "UPDATE scheduled_messages SET status = ? WHERE id = ?",
    [finalStatus, job.id]
  );

  // Also update master messages table
  if (job.message_id) {
    const overallMsgStatus = finalStatus === 'completed' ? 'sent' : (successCount > 0 ? 'partially_sent' : 'failed');
    dbHelper.run("UPDATE messages SET status = ? WHERE id = ?", [overallMsgStatus, job.message_id]);
  }

  console.log(`Scheduled message ID ${job.id} executed (${successCount} succeeded, ${failCount} failed).`);
  return { success: true, successCount, failCount, finalStatus };
}

/**
 * Check and process all due scheduled messages
 */
export async function checkScheduledQueue() {
  try {
    const pendingJobs = dbHelper.all(
      "SELECT * FROM scheduled_messages WHERE status = 'scheduled'"
    );

    if (!pendingJobs || pendingJobs.length === 0) return { processed: 0 };

    const now = new Date();
    let processed = 0;

    for (const job of pendingJobs) {
      const dueUtc = parseToUtc(job.scheduled_time, job.timezone);
      if (dueUtc <= now) {
        console.log(`Processing due scheduled message ID ${job.id} (due ${dueUtc.toISOString()}, now ${now.toISOString()})...`);
        await processScheduledJob(job);
        processed++;
      }
    }

    return { processed };
  } catch (err) {
    console.error('Error in checkScheduledQueue:', err);
    return { error: err.message };
  }
}

/**
 * Force-send a scheduled message immediately
 */
export async function sendScheduledNow(id) {
  const job = dbHelper.get('SELECT * FROM scheduled_messages WHERE id = ?', [id]);
  if (!job) {
    return { success: false, error: 'Scheduled message not found.' };
  }
  if (job.status === 'completed') {
    return { success: false, error: 'This message has already been sent.' };
  }

  return processScheduledJob(job);
}

export function cancelScheduledMessage(id) {
  const existing = dbHelper.get('SELECT * FROM scheduled_messages WHERE id = ?', [id]);
  if (!existing) {
    return { success: false, error: 'Scheduled message not found' };
  }
  if (existing.status === 'completed') {
    return { success: false, error: 'Cannot cancel an already completed message' };
  }

  dbHelper.run("UPDATE scheduled_messages SET status = 'cancelled' WHERE id = ?", [id]);
  if (existing.message_id) {
    dbHelper.run("UPDATE messages SET status = 'cancelled' WHERE id = ?", [existing.message_id]);
  }
  return { success: true, message: 'Scheduled message successfully cancelled.' };
}

export function deleteScheduledMessage(id) {
  const existing = dbHelper.get('SELECT * FROM scheduled_messages WHERE id = ?', [id]);
  if (!existing) {
    return { success: false, error: 'Scheduled message not found' };
  }

  dbHelper.run('DELETE FROM scheduled_messages WHERE id = ?', [id]);
  return { success: true, message: 'Scheduled message permanently deleted.' };
}

export function clearCancelledScheduledMessages() {
  const countRow = dbHelper.get("SELECT count(*) as count FROM scheduled_messages WHERE status = 'cancelled'");
  const count = countRow?.count || 0;
  dbHelper.run("DELETE FROM scheduled_messages WHERE status = 'cancelled'");
  return { success: true, count, message: `Successfully cleared ${count} cancelled scheduled message${count !== 1 ? 's' : ''}.` };
}
