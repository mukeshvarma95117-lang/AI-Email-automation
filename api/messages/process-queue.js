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
    const twilioSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
    const twilioToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
    const twilioFrom = (process.env.TWILIO_FROM_NUMBER || '+15550100').trim();

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

        const channel = job.channel || 'email';
        const isDemo = Boolean(job.is_demo);
        let sentSuccess = true;

        if (channel === 'sms') {
          // Extract phone targets
          let targetPhones = [];
          if (Array.isArray(recipients) && recipients.length > 0) {
            for (const r of recipients) {
              if (typeof r === 'string' && !r.includes('@')) {
                targetPhones.push({ name: 'Recipient', phone: r.replace(/[^\d+]/g, '') });
              } else if (typeof r === 'object') {
                const p = (r.phone || '').replace(/[^\d+]/g, '');
                if (p) targetPhones.push({ name: r.name || 'Recipient', phone: p });
              }
            }
          }

          if (targetPhones.length === 0) {
            targetPhones = [{ name: 'Recipient', phone: '+15550100' }];
          }

          for (const item of targetPhones) {
            if (isDemo) {
              // Simulated SMS Dispatch
              await supabase.from('message_logs').insert([{
                channel: 'sms',
                contact_name: item.name,
                contact_target: item.phone,
                rendered_subject: job.subject || '',
                rendered_body: job.body || '',
                status: 'Demo Sent',
                is_demo: 1,
                error_message: 'Delivered via Demo Simulation',
                delivery_timestamp: new Date().toISOString()
              }]);
            } else {
              // Real Twilio SMS Dispatch
              if (!twilioSid || !twilioToken) {
                sentSuccess = false;
                await supabase.from('message_logs').insert([{
                  channel: 'sms',
                  contact_name: item.name,
                  contact_target: item.phone,
                  rendered_subject: job.subject || '',
                  rendered_body: job.body || '',
                  status: 'Failed',
                  is_demo: 0,
                  error_message: 'Twilio SMS Gateway not configured in Settings',
                  delivery_timestamp: new Date().toISOString()
                }]);
              } else {
                try {
                  const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
                  const formData = new URLSearchParams();
                  formData.append('To', item.phone);
                  formData.append('From', twilioFrom);
                  formData.append('Body', job.body || '');

                  const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
                    method: 'POST',
                    headers: {
                      'Authorization': authHeader,
                      'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formData.toString()
                  });
                  const twilioData = await twilioRes.json();
                  const ok = twilioRes.ok && Boolean(twilioData.sid);
                  if (!ok) sentSuccess = false;

                  await supabase.from('message_logs').insert([{
                    channel: 'sms',
                    contact_name: item.name,
                    contact_target: item.phone,
                    rendered_subject: job.subject || '',
                    rendered_body: job.body || '',
                    status: ok ? 'Sent' : 'Failed',
                    is_demo: 0,
                    error_message: ok ? `Twilio SMS SID: ${twilioData.sid}` : (twilioData.message || 'Twilio delivery failed'),
                    delivery_timestamp: new Date().toISOString()
                  }]);
                } catch (err) {
                  sentSuccess = false;
                  await supabase.from('message_logs').insert([{
                    channel: 'sms',
                    contact_name: item.name,
                    contact_target: item.phone,
                    rendered_subject: job.subject || '',
                    rendered_body: job.body || '',
                    status: 'Failed',
                    is_demo: 0,
                    error_message: err.message || 'Twilio network error',
                    delivery_timestamp: new Date().toISOString()
                  }]);
                }
              }
            }
          }
        } else {
          // Email channel
          let targetEmails = [];
          if (Array.isArray(recipients) && recipients.length > 0) {
            for (const r of recipients) {
              if (typeof r === 'string' && r.includes('@')) {
                targetEmails.push({ name: 'Recipient', email: r });
              } else if (typeof r === 'object' && r.email) {
                targetEmails.push({ name: r.name || 'Recipient', email: r.email });
              }
            }
          }

          if (targetEmails.length === 0) {
            targetEmails = [{ name: 'Recipient', email: 'mukeshvarma95117@gmail.com' }];
          }

          for (const item of targetEmails) {
            if (isDemo) {
              await supabase.from('message_logs').insert([{
                channel: 'email',
                contact_name: item.name,
                contact_target: item.email,
                rendered_subject: job.subject || '',
                rendered_body: job.body || '',
                status: 'Demo Sent',
                is_demo: 1,
                error_message: 'Delivered via Demo Simulation',
                delivery_timestamp: new Date().toISOString()
              }]);
            } else {
              try {
                const resp = await fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    from: DEFAULT_FROM,
                    to: [item.email],
                    subject: job.subject || 'Scheduled Notification from SmartSend AI',
                    text: job.body || ''
                  })
                });

                const data = await resp.json();
                if (!resp.ok) sentSuccess = false;

                await supabase.from('message_logs').insert([{
                  channel: 'email',
                  contact_name: item.name,
                  contact_target: item.email,
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
