// Vercel Serverless Function for Live Delivery & Multi-Channel Message Dispatch
const DEFAULT_RESEND_KEY = Buffer.from('cmVfVzdNcmtOWWRfUTJWQ1N0OHZoSDhDWVlIQ2dNeG5GaFNp', 'base64').toString('utf-8');
const DEFAULT_FROM = process.env.RESEND_FROM || 'SmartSend AI <notifications@smartsendai.online>';
const RESEND_FALLBACK = 'SmartSend AI <onboarding@resend.dev>';

function resolveVariables(text, contact = {}) {
  if (!text) return '';
  const fullName = contact.name || 'Friend';
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || fullName;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  const customFields = typeof contact.custom_fields === 'object' && contact.custom_fields ? contact.custom_fields : {};

  const vars = {
    name: fullName,
    firstname: firstName,
    first_name: firstName,
    lastname: lastName,
    last_name: lastName,
    email: contact.email || '',
    phone: contact.phone || '',
    group: contact.group_name || 'General',
    group_name: contact.group_name || 'General',
    company: contact.company || 'SmartSend AI',
    event: contact.event || 'AI Workshop',
    date: contact.date || 'tomorrow',
    time: contact.time || '10:00 AM',
    ...customFields,
    ...contact
  };

  return text.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (match, key) => {
    const lowerKey = key.toLowerCase();
    for (const [k, v] of Object.entries(vars)) {
      if (k.toLowerCase() === lowerKey && v !== null && v !== undefined) {
        return String(v);
      }
    }
    return match;
  });
}

function buildHtmlEmail({ subject, body, cta }) {
  const formattedBody = (body || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  const ctaButtonHtml = cta && cta.trim() ? `
    <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
      <a href="#" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); color: #ffffff !important; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 10px;">
        ${cta.trim()} &rarr;
      </a>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${subject || 'SmartSend AI Notification'}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #7c3aed 100%); padding: 28px 32px; color: #ffffff;">
      <div style="font-weight: 800; font-size: 20px;">SmartSend AI</div>
      <div style="font-size: 12px; color: #e0e7ff; margin-top: 4px;">Automated Intelligent Communications</div>
    </div>
    <div style="padding: 32px; font-size: 15px; line-height: 1.7; color: #334155;">
      <p style="margin-top: 0; margin-bottom: 16px;">${formattedBody}</p>
      ${ctaButtonHtml}
    </div>
    <div style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center;">
      <p style="margin: 0;">Dispatched automatically by SmartSend AI.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      prompt,
      subject,
      body,
      cta,
      channel = 'email',
      recipients,
      customRecipients,
      isDemo = false,
      smsAccountSid,
      smsAuthToken,
      smsFromNumber,
      whatsappToken,
      whatsappPhoneNumberId
    } = req.body || {};

    // Build contacts list
    let targetContacts = [];
    if (Array.isArray(recipients) && recipients.length > 0) {
      targetContacts = recipients;
    } else if (Array.isArray(customRecipients) && customRecipients.length > 0) {
      targetContacts = customRecipients;
    }

    // If only recipientIds provided, resolve from Supabase
    if (targetContacts.length === 0 && Array.isArray(req.body?.recipientIds) && req.body.recipientIds.length > 0) {
      const SUPABASE_URL = process.env.SUPABASE_URL || 'https://joqherfotksjlpyztcdc.supabase.co';
      const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvcWhlcmZvdGtzamxweXp0Y2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MzMzMDgsImV4cCI6MjEwNDQwOTMwOH0.6CNA9387QAW47khchSbyOGocMUHu4_YMIhwigv432mA';
      try {
        const idList = req.body.recipientIds.map(encodeURIComponent).join(',');
        const sRes = await fetch(`${SUPABASE_URL}/rest/v1/contacts?id=in.(${idList})`, {
          headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` }
        });
        if (sRes.ok) {
          const fetched = await sRes.json();
          if (Array.isArray(fetched) && fetched.length > 0) {
            targetContacts = fetched;
          }
        }
      } catch (e) {
        console.warn('Failed to resolve recipientIds from Supabase in serverless handler:', e);
      }
    }

    if (targetContacts.length === 0) {
      return res.status(400).json({ error: 'No recipients specified. Please select a contact or enter a recipient target.' });
    }

    // DEMO SIMULATION MODE (Supports Email, SMS, WhatsApp)
    if (isDemo) {
      return res.status(200).json({
        success: true,
        successCount: targetContacts.length,
        failCount: 0,
        isDemo: true,
        channel,
        message: `${channel.toUpperCase()} dispatched successfully (Demo Simulation Mode)`,
        deliveryResults: targetContacts.map(c => ({
          contact_name: c.name || 'Recipient',
          target: (channel === 'email' ? c.email : c.phone) || (channel === 'email' ? 'demo@smartsendai.online' : '+1 555-0100'),
          renderedSubject: resolveVariables(subject || '', c),
          renderedBody: resolveVariables(body || '', c),
          status: 'Demo Sent',
          isDemo: true,
          channel,
          resendId: channel === 'email' ? 'demo-email-' + Date.now() : null,
          smsId: channel === 'sms' ? 'demo-sms-' + Date.now() : null,
          whatsappId: channel === 'whatsapp' ? 'demo-wa-' + Date.now() : null
        }))
      });
    }

    // ==========================================
    // LIVE DELIVERY MODE - SMS CHANNEL (TWILIO)
    // ==========================================
    if (channel === 'sms') {
      const twilioSid = (req.body?.smsAccountSid || process.env.TWILIO_ACCOUNT_SID || '').trim();
      const twilioToken = (req.body?.smsAuthToken || process.env.TWILIO_AUTH_TOKEN || '').trim();
      const twilioFrom = (req.body?.smsFromNumber || process.env.TWILIO_FROM_NUMBER || '+15550100').trim();

      if (!twilioSid || !twilioToken) {
        return res.status(400).json({
          error: 'Twilio SMS Gateway is not configured in Settings. To send real SMS messages to mobile devices, configure your Twilio Account SID and Auth Token in Settings, or switch to Demo Simulation Mode.'
        });
      }

      const results = [];
      let successCount = 0;
      let failCount = 0;

      for (const contact of targetContacts) {
        const cleanPhone = (contact.phone || '').replace(/[^\d+]/g, '');
        if (!cleanPhone) {
          failCount++;
          results.push({
            contact_name: contact.name || 'Recipient',
            target: 'Missing Phone Number',
            status: 'Failed',
            error: 'No phone number provided for contact',
            isDemo: false
          });
          continue;
        }

        const renderedBody = resolveVariables(body || '', contact);
        try {
          const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
          const formData = new URLSearchParams();
          formData.append('To', cleanPhone);
          formData.append('From', twilioFrom);
          formData.append('Body', renderedBody);

          const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
          });

          const twilioData = await twilioRes.json();
          if (twilioRes.ok && twilioData.sid) {
            successCount++;
            results.push({
              contact_name: contact.name || 'Recipient',
              target: cleanPhone,
              renderedBody,
              status: 'Sent',
              isDemo: false,
              smsId: twilioData.sid
            });
          } else {
            failCount++;
            results.push({
              contact_name: contact.name || 'Recipient',
              target: cleanPhone,
              renderedBody,
              status: 'Failed',
              error: twilioData.message || 'Twilio SMS delivery failed',
              isDemo: false
            });
          }
        } catch (smsErr) {
          failCount++;
          results.push({
            contact_name: contact.name || 'Recipient',
            target: cleanPhone,
            renderedBody,
            status: 'Failed',
            error: smsErr.message || 'Twilio connection failed',
            isDemo: false
          });
        }
      }

      const firstSuccess = results.find(r => r.smsId);
      return res.status(200).json({
        success: successCount > 0,
        successCount,
        failCount,
        isDemo: false,
        channel: 'sms',
        smsId: firstSuccess?.smsId || null,
        deliveryResults: results,
        message: successCount > 0
          ? `Live SMS delivered via Twilio to ${results.filter(r => r.status === 'Sent').map(r => r.target).join(', ')}`
          : `Failed to deliver SMS: ${results[0]?.error || 'Unknown error'}`
      });
    }

    // ==========================================
    // LIVE DELIVERY MODE - WHATSAPP CHANNEL
    // ==========================================
    if (channel === 'whatsapp') {
      const waToken = (req.body?.whatsappToken || process.env.WHATSAPP_TOKEN || '').trim();
      const waPhoneId = (req.body?.whatsappPhoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();

      if (!waToken || !waPhoneId) {
        return res.status(400).json({
          error: 'WhatsApp Cloud API is not configured in Settings. To send real WhatsApp messages, configure your Token and Phone Number ID in Settings, or switch to Demo Simulation Mode.'
        });
      }

      const results = [];
      let successCount = 0;
      let failCount = 0;

      for (const contact of targetContacts) {
        const cleanPhone = (contact.phone || '').replace(/[^\d+]/g, '');
        if (!cleanPhone) {
          failCount++;
          results.push({
            contact_name: contact.name || 'Recipient',
            target: 'Missing Phone Number',
            status: 'Failed',
            error: 'No phone number provided for contact',
            isDemo: false
          });
          continue;
        }

        const renderedBody = resolveVariables(body || '', contact);
        const formattedRecipient = cleanPhone.replace(/^\+/, '');

        try {
          const waRes = await fetch(`https://graph.facebook.com/v20.0/${waPhoneId}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${waToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: formattedRecipient,
              type: 'text',
              text: { preview_url: true, body: renderedBody }
            })
          });

          const waData = await waRes.json();
          if (waRes.ok && waData.messages?.[0]?.id) {
            successCount++;
            results.push({
              contact_name: contact.name || 'Recipient',
              target: cleanPhone,
              renderedBody,
              status: 'Sent',
              isDemo: false,
              whatsappId: waData.messages[0].id
            });
          } else {
            failCount++;
            results.push({
              contact_name: contact.name || 'Recipient',
              target: cleanPhone,
              renderedBody,
              status: 'Failed',
              error: waData.error?.message || 'WhatsApp Cloud API delivery failed',
              isDemo: false
            });
          }
        } catch (waErr) {
          failCount++;
          results.push({
            contact_name: contact.name || 'Recipient',
            target: cleanPhone,
            renderedBody,
            status: 'Failed',
            error: waErr.message || 'WhatsApp connection failed',
            isDemo: false
          });
        }
      }

      return res.status(200).json({
        success: successCount > 0,
        successCount,
        failCount,
        isDemo: false,
        channel: 'whatsapp',
        deliveryResults: results,
        message: successCount > 0
          ? `Live WhatsApp message delivered to ${results.filter(r => r.status === 'Sent').map(r => r.target).join(', ')}`
          : `Failed to deliver WhatsApp message: ${results[0]?.error || 'Unknown error'}`
      });
    }

    // ==========================================
    // LIVE DELIVERY MODE - EMAIL CHANNEL (RESEND)
    // ==========================================
    const apiKey = (process.env.RESEND_API_KEY || req.body?.resendApiKey || DEFAULT_RESEND_KEY).trim();
    let fromAddress = req.body?.resendFrom || DEFAULT_FROM;

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const contact of targetContacts) {
      const targetEmail = contact.email;
      if (!targetEmail) {
        failCount++;
        results.push({
          contact_name: contact.name || 'Unknown',
          target: 'Missing Email',
          status: 'Failed',
          error: 'No email address provided',
          isDemo: false
        });
        continue;
      }

      const renderedSubject = resolveVariables(subject || 'Notification from SmartSend AI', contact);
      const renderedBody = resolveVariables(body || '', contact);
      const htmlContent = buildHtmlEmail({ subject: renderedSubject, body: renderedBody, cta });

      let resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [targetEmail],
          subject: renderedSubject,
          html: htmlContent,
          text: renderedBody
        })
      });

      let resendData = await resendResponse.json();

      // If custom domain verification failed on Resend, fallback to onboarding@resend.dev
      if (!resendResponse.ok && resendData.message && resendData.message.toLowerCase().includes('not verified')) {
        fromAddress = RESEND_FALLBACK;
        resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [targetEmail],
            subject: renderedSubject,
            html: htmlContent,
            text: renderedBody
          })
        });
        resendData = await resendResponse.json();
      }

      if (resendResponse.ok && resendData.id) {
        successCount++;
        results.push({
          contact_name: contact.name || 'Recipient',
          target: targetEmail,
          renderedSubject,
          renderedBody,
          status: 'Sent',
          isDemo: false,
          resendId: resendData.id
        });
      } else {
        failCount++;
        results.push({
          contact_name: contact.name || 'Recipient',
          target: targetEmail,
          renderedSubject,
          renderedBody,
          status: 'Failed',
          error: resendData.message || 'Resend delivery failed',
          isDemo: false
        });
      }
    }

    const firstSuccess = results.find(r => r.resendId);

    return res.status(200).json({
      success: successCount > 0,
      successCount,
      failCount,
      isDemo: false,
      channel: 'email',
      resendId: firstSuccess?.resendId || null,
      from: fromAddress,
      deliveryResults: results,
      message: successCount > 0
        ? `Live email delivered via Resend to ${results.filter(r => r.status === 'Sent').map(r => r.target).join(', ')}`
        : `Failed to deliver email: ${results[0]?.error || 'Unknown error'}`
    });
  } catch (err) {
    console.error('Serverless send handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
