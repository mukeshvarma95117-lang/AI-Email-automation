import dbHelper from '../database/db.js';
import { resolveVariables, extractVariables } from '../services/variableResolver.js';
import { sendEmail } from '../services/emailService.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';
import { sendSms } from '../services/smsService.js';
import {
  cancelScheduledMessage,
  deleteScheduledMessage,
  clearCancelledScheduledMessages,
  parseToUtc,
  sendScheduledNow,
  checkScheduledQueue
} from '../services/schedulerService.js';

/**
 * Send Message Immediately
 */
export async function sendMessage(req, res) {
  try {
    const {
      prompt,
      subject,
      body,
      short_version,
      cta,
      channel = 'email',
      recipientIds = [],
      groupId = null,
      sendToAll = false,
      customRecipients = [],
      globalVars = {}
    } = req.body;

    // Safety validation: Empty body
    if (!body || !body.trim()) {
      return res.status(400).json({ error: 'Message content cannot be empty.' });
    }

    if (channel === 'email' && (!subject || !subject.trim())) {
      return res.status(400).json({ error: 'Subject is required for email messages.' });
    }

    // Resolve target contacts
    let targetContacts = [];
    if (groupId && groupId !== 'all') {
      targetContacts = dbHelper.all(
        `SELECT c.*, g.name as group_name 
         FROM contacts c 
         LEFT JOIN groups_table g ON c.group_id = g.id 
         WHERE c.group_id = ?`,
        [groupId]
      );
    } else if (Array.isArray(recipientIds) && recipientIds.length > 0) {
      const placeholders = recipientIds.map(() => '?').join(',');
      targetContacts = dbHelper.all(
        `SELECT c.*, g.name as group_name 
         FROM contacts c 
         LEFT JOIN groups_table g ON c.group_id = g.id 
         WHERE c.id IN (${placeholders})`,
        recipientIds
      );
    } else if (Array.isArray(customRecipients) && customRecipients.length > 0) {
      targetContacts = customRecipients.map((cr, idx) => ({
        id: -(idx + 1),
        name: cr.name || 'Recipient',
        email: cr.email || null,
        phone: cr.phone || null,
        custom_fields: cr.custom_fields || {}
      }));
    } else if (groupId === 'all' || sendToAll || (!groupId && !recipientIds?.length && !customRecipients?.length)) {
      // Fallback: broadcast to all contacts
      targetContacts = dbHelper.all(
        `SELECT c.*, g.name as group_name 
         FROM contacts c 
         LEFT JOIN groups_table g ON c.group_id = g.id`
      );
    }

    if (targetContacts.length === 0) {
      return res.status(400).json({ error: 'No recipients selected. Please choose at least one contact or group.' });
    }

    // Check Demo Mode setting
    const demoModeSetting = dbHelper.get("SELECT value FROM settings WHERE key = 'demo_mode'");
    const isDemo = demoModeSetting?.value === 'true';

    // Insert master message record
    const recipientTargets = targetContacts.map(c => channel === 'email' ? c.email : c.phone).filter(Boolean);
    const msgInsert = dbHelper.run(
      `INSERT INTO messages (user_id, prompt, subject, body, short_version, cta, channel, recipient_count, recipients_json, status, is_demo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user?.id || null,
        prompt || '',
        subject || '',
        body,
        short_version || '',
        cta || '',
        channel,
        targetContacts.length,
        JSON.stringify(recipientTargets),
        'sending',
        isDemo ? 1 : 0
      ]
    );
    const messageId = msgInsert.lastInsertRowid;

    const deliveryResults = [];
    let successCount = 0;
    let failCount = 0;

    for (const contact of targetContacts) {
      // Personalize variables
      const { text: renderedBody, unresolvedVariables: unresolvedBody } = resolveVariables(body, contact, globalVars);
      const { text: renderedSubject, unresolvedVariables: unresolvedSubj } = resolveVariables(subject || '', contact, globalVars);

      const unresolved = Array.from(new Set([...unresolvedBody, ...unresolvedSubj]));

      let target = '';
      let sendResult = { success: false, status: 'Failed', error: 'Missing contact address' };

      if (channel === 'email') {
        target = contact.email;
        if (!target) {
          sendResult = { success: false, status: 'Failed', error: 'Missing email address' };
        } else {
          sendResult = await sendEmail({ to: target, subject: renderedSubject, body: renderedBody, cta });
        }
      } else if (channel === 'whatsapp') {
        target = contact.phone;
        if (!target) {
          sendResult = { success: false, status: 'Failed', error: 'Missing phone number' };
        } else {
          sendResult = await sendWhatsAppMessage({ to: target, body: renderedBody });
        }
      } else if (channel === 'sms') {
        target = contact.phone;
        if (!target) {
          sendResult = { success: false, status: 'Failed', error: 'Missing phone number' };
        } else {
          sendResult = await sendSms({ to: target, body: renderedBody });
        }
      }

      const logStatus = sendResult.success ? (sendResult.isDemo ? 'Demo Sent' : 'Sent') : 'Failed';
      if (sendResult.success) successCount++;
      else failCount++;

      // Log delivery
      dbHelper.run(
        `INSERT INTO message_logs (message_id, contact_id, contact_name, contact_target, channel, rendered_subject, rendered_body, status, is_demo, error_message, delivery_timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          messageId,
          contact.id > 0 ? contact.id : null,
          contact.name,
          target || 'N/A',
          channel,
          renderedSubject,
          renderedBody,
          logStatus,
          sendResult.isDemo ? 1 : 0,
          sendResult.error || (sendResult.messageId ? `Message ID: ${sendResult.messageId}` : (unresolved.length > 0 ? `Unresolved: {{${unresolved.join('}}, {{')}}}` : null))
        ]
      );

      deliveryResults.push({
        contactName: contact.name,
        target,
        status: logStatus,
        isDemo: sendResult.isDemo,
        unresolvedVariables: unresolved,
        error: sendResult.error
      });
    }

    // Update master message status
    const overallStatus = failCount === 0 ? 'sent' : (successCount > 0 ? 'partially_sent' : 'failed');
    dbHelper.run('UPDATE messages SET status = ? WHERE id = ?', [overallStatus, messageId]);

    return res.json({
      success: true,
      messageId,
      totalRecipients: targetContacts.length,
      successCount,
      failCount,
      isDemo,
      deliveryResults
    });
  } catch (err) {
    console.error('sendMessage error:', err);
    return res.status(500).json({ error: err.message || 'Failed to dispatch messages.' });
  }
}

/**
 * Schedule Message for Future Delivery
 */
export async function scheduleMessage(req, res) {
  try {
    const {
      prompt,
      subject,
      body,
      short_version,
      cta,
      channel = 'email',
      recipientIds = [],
      groupId = null,
      sendToAll = false,
      scheduled_time,
      timezone = 'UTC'
    } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({ error: 'Message body is required.' });
    }

    if (!scheduled_time) {
      return res.status(400).json({ error: 'Scheduled time is required.' });
    }

    // Resolve recipient IDs
    let finalIds = [...(recipientIds || [])];
    if (groupId && groupId !== 'all') {
      const groupContacts = dbHelper.all('SELECT id FROM contacts WHERE group_id = ?', [groupId]);
      finalIds = groupContacts.map(c => c.id);
    } else if (groupId === 'all' || sendToAll || finalIds.length === 0) {
      const allContacts = dbHelper.all('SELECT id FROM contacts');
      finalIds = allContacts.map(c => c.id);
    }

    if (finalIds.length === 0) {
      return res.status(400).json({ error: 'No recipients selected for scheduling.' });
    }

    const demoModeSetting = dbHelper.get("SELECT value FROM settings WHERE key = 'demo_mode'");
    const isDemo = demoModeSetting?.value === 'true' ? 1 : 0;

    // Create message entry
    const msg = dbHelper.run(
      `INSERT INTO messages (user_id, prompt, subject, body, short_version, cta, channel, recipient_count, recipients_json, status, is_demo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user?.id || null,
        prompt || '',
        subject || '',
        body,
        short_version || '',
        cta || '',
        channel,
        finalIds.length,
        JSON.stringify(finalIds),
        'scheduled',
        isDemo
      ]
    );

    // Normalize scheduled_time to UTC ISO string
    const utcScheduledTime = parseToUtc(scheduled_time, timezone).toISOString();

    // Create scheduled_messages entry
    const sched = dbHelper.run(
      `INSERT INTO scheduled_messages (message_id, channel, subject, body, recipients_json, scheduled_time, timezone, status, is_demo)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', ?)`,
      [
        msg.lastInsertRowid,
        channel,
        subject || '',
        body,
        JSON.stringify(finalIds),
        utcScheduledTime,
        timezone,
        isDemo
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Message successfully scheduled for dispatch.',
      scheduledId: sched.lastInsertRowid,
      scheduled_time: utcScheduledTime,
      recipientCount: finalIds.length
    });
  } catch (err) {
    console.error('scheduleMessage error:', err);
    return res.status(500).json({ error: 'Failed to schedule message.' });
  }
}

/**
 * Get Message History
 */
export function getMessages(req, res) {
  try {
    const { channel, status, search, limit = 50, offset = 0 } = req.query;

    let sql = `SELECT * FROM messages WHERE 1=1`;
    const params = [];

    if (channel && channel !== 'all') {
      sql += ` AND channel = ?`;
      params.push(channel);
    }

    if (status && status !== 'all') {
      sql += ` AND status = ?`;
      params.push(status);
    }

    if (search && search.trim()) {
      sql += ` AND (subject LIKE ? OR body LIKE ? OR prompt LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const messages = dbHelper.all(sql, params);
    const totalRow = dbHelper.get('SELECT count(*) as count FROM messages');

    return res.json({ messages, total: totalRow?.count || 0 });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch messages.' });
  }
}

/**
 * Get Single Message Details with Delivery Logs
 */
export function getMessageById(req, res) {
  try {
    const { id } = req.params;
    const message = dbHelper.get('SELECT * FROM messages WHERE id = ?', [id]);
    if (!message) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    const logs = dbHelper.all('SELECT * FROM message_logs WHERE message_id = ? ORDER BY id ASC', [id]);

    return res.json({ message, logs });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch message details.' });
  }
}

/**
 * Get All Scheduled Messages
 */
export function getScheduledMessages(req, res) {
  try {
    const scheduled = dbHelper.all(`
      SELECT s.*, m.prompt, m.recipient_count 
      FROM scheduled_messages s 
      LEFT JOIN messages m ON s.message_id = m.id 
      ORDER BY s.scheduled_time ASC
    `);
    return res.json({ scheduled });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch scheduled messages.' });
  }
}

/**
 * Cancel Scheduled Message
 */
export function cancelScheduled(req, res) {
  try {
    const { id } = req.params;
    const result = cancelScheduledMessage(id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to cancel scheduled message.' });
  }
}

/**
 * Delete Scheduled Message (Permanently remove from queue)
 */
export function deleteScheduled(req, res) {
  try {
    const { id } = req.params;
    if (id === 'clear-cancelled') {
      const result = clearCancelledScheduledMessages();
      return res.json(result);
    }
    const result = deleteScheduledMessage(id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete scheduled message.' });
  }
}

/**
 * Trigger Immediate Send for a Scheduled Message
 */
export async function triggerSendNow(req, res) {
  try {
    const { id } = req.params;
    const result = await sendScheduledNow(id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to trigger scheduled dispatch.' });
  }
}

/**
 * Force Process Scheduled Queue Immediately
 */
export async function processQueueNow(req, res) {
  try {
    const result = await checkScheduledQueue();
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to process scheduled queue.' });
  }
}

/**
 * Get All Delivery Logs (for History page)
 */
export function getDeliveryLogs(req, res) {
  try {
    const { channel, status, search, limit = 100, offset = 0 } = req.query;

    let sql = `SELECT * FROM message_logs WHERE 1=1`;
    const params = [];

    if (channel && channel !== 'all') {
      sql += ` AND channel = ?`;
      params.push(channel);
    }

    if (status && status !== 'all') {
      sql += ` AND status = ?`;
      params.push(status);
    }

    if (search && search.trim()) {
      sql += ` AND (contact_name LIKE ? OR contact_target LIKE ? OR rendered_subject LIKE ? OR rendered_body LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const logs = dbHelper.all(sql, params);
    const countRow = dbHelper.get('SELECT count(*) as count FROM message_logs');

    return res.json({ logs, total: countRow?.count || 0 });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch delivery logs.' });
  }
}

/**
 * Delete a Single Delivery Log
 */
export function deleteDeliveryLog(req, res) {
  try {
    const { id } = req.params;
    const existing = dbHelper.get('SELECT id FROM message_logs WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Delivery log record not found.' });
    }

    dbHelper.run('DELETE FROM message_logs WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Delivery log record deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete delivery log record.' });
  }
}

/**
 * Clear Multiple or All Delivery Logs
 */
export function clearDeliveryLogs(req, res) {
  try {
    const { channel, status } = req.query;

    let sql = 'DELETE FROM message_logs WHERE 1=1';
    const params = [];

    if (channel && channel !== 'all') {
      sql += ' AND channel = ?';
      params.push(channel);
    }

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    dbHelper.run(sql, params);
    return res.json({ success: true, message: 'Delivery history cleared successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to clear delivery history.' });
  }
}


