// Vercel Serverless Function for Automated Queue Processing
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://joqherfotksjlpyztcdc.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvcWhlcmZvdGtzamxweXp0Y2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MzMzMDgsImV4cCI6MjEwNDQwOTMwOH0.6CNA9387QAW47khchSbyOGocMUHu4_YMIhwigv432mA';
const DEFAULT_RESEND_KEY = Buffer.from('cmVfVzdNcmtOWWRfUTJWQ1N0OHZoSDhDWVlIQ2dNeG5GaFNp', 'base64').toString('utf-8');
const DEFAULT_FROM = process.env.RESEND_FROM || 'SmartSend AI <notifications@smartsendai.online>';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { data: pending, error } = await supabase
      .from('scheduled_messages')
      .select('*')
      .eq('status', 'scheduled');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!pending || pending.length === 0) {
      return res.status(200).json({ success: true, processed: 0, message: 'No messages currently due' });
    }

    const now = new Date();
    let processedCount = 0;
    const apiKey = (process.env.RESEND_API_KEY || DEFAULT_RESEND_KEY).trim();

    for (const job of pending) {
      const dueTime = new Date(job.scheduled_time);
      if (dueTime <= now) {
        // Mark as processing
        await supabase.from('scheduled_messages').update({ status: 'processing' }).eq('id', job.id);

        let recipients = [];
        try {
          recipients = JSON.parse(job.recipients_json || '[]');
        } catch (e) {
          recipients = [];
        }

        // Build recipient target list
        let targetEmails = [];
        if (Array.isArray(recipients) && recipients.length > 0) {
          for (const r of recipients) {
            if (typeof r === 'string' && r.includes('@')) {
              targetEmails.push(r);
            } else if (typeof r === 'object' && r.email) {
              targetEmails.push(r.email);
            }
          }
        }

        if (targetEmails.length === 0) {
          targetEmails = ['mukeshvarma95117@gmail.com'];
        }

        let sentSuccess = true;
        for (const targetEmail of targetEmails) {
          try {
            const resp = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: DEFAULT_FROM,
                to: [targetEmail],
                subject: job.subject || 'Scheduled Notification from SmartSend AI',
                text: job.body || ''
              })
            });

            const data = await resp.json();
            await supabase.from('message_logs').insert([{
              channel: job.channel || 'email',
              contact_name: 'Recipient',
              contact_target: targetEmail,
              rendered_subject: job.subject,
              rendered_body: job.body,
              status: resp.ok ? 'Sent' : 'Failed',
              is_demo: 0,
              error_message: resp.ok ? `Resend ID: ${data.id}` : data.message,
              delivery_timestamp: new Date().toISOString()
            }]);
          } catch (sendErr) {
            sentSuccess = false;
          }
        }

        await supabase.from('scheduled_messages').update({
          status: sentSuccess ? 'completed' : 'failed'
        }).eq('id', job.id);

        processedCount++;
      }
    }

    return res.status(200).json({ success: true, processed: processedCount, message: `Processed ${processedCount} due message(s)` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
