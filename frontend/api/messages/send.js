// Vercel Serverless Function for Live Delivery & Message Dispatch
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
      isDemo = false
    } = req.body || {};

    // Build contacts list
    let targetContacts = [];
    if (Array.isArray(recipients) && recipients.length > 0) {
      targetContacts = recipients;
    } else if (Array.isArray(customRecipients) && customRecipients.length > 0) {
      targetContacts = customRecipients;
    }

    if (targetContacts.length === 0) {
      targetContacts = [{
        name: 'Mukesh Varma',
        email: 'mukeshvarma95117@gmail.com',
        company: 'SmartSend AI',
        event: 'AI Workshop'
      }];
    }

    // DEMO MODE
    if (isDemo) {
      return res.status(200).json({
        success: true,
        successCount: targetContacts.length,
        failCount: 0,
        isDemo: true,
        message: 'Message dispatched successfully (Demo Simulation Mode)',
        deliveryResults: targetContacts.map(c => ({
          contact_name: c.name,
          target: c.email || 'N/A',
          renderedSubject: resolveVariables(subject, c),
          renderedBody: resolveVariables(body, c),
          status: 'Demo Sent',
          isDemo: true,
          resendId: 'demo-' + Date.now()
        }))
      });
    }

    // LIVE DELIVERY MODE
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
