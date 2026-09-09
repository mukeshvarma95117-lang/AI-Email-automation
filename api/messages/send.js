// Vercel Serverless Function for Live Delivery & Message Dispatch
const DEFAULT_FROM = process.env.RESEND_FROM || 'SmartSend AI <notifications@smartsendai.online>';
const RESEND_FALLBACK = 'SmartSend AI <onboarding@resend.dev>';

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
      recipientIds,
      sendToAll,
      customRecipients,
      isDemo = false
    } = req.body || {};

    let toEmails = [];
    if (Array.isArray(customRecipients) && customRecipients.length > 0) {
      toEmails = customRecipients.map(r => r.email).filter(Boolean);
    }

    if (toEmails.length === 0) {
      toEmails = ['mukeshvarma95117@gmail.com'];
    }

    if (isDemo) {
      return res.status(200).json({
        success: true,
        successCount: toEmails.length,
        failCount: 0,
        isDemo: true,
        message: 'Message dispatched successfully (Demo Simulation Mode)'
      });
    }

    // LIVE DELIVERY MODE (Send real email via Resend)
    const apiKey = (process.env.RESEND_API_KEY || req.body?.resendApiKey || '').trim();
    let fromAddress = req.body?.resendFrom || DEFAULT_FROM;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        isDemo: false,
        error: 'Resend API Key is required for live delivery. Please configure RESEND_API_KEY in Vercel or Settings.'
      });
    }

    const htmlContent = buildHtmlEmail({ subject, body, cta });

    let resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromAddress,
        to: toEmails,
        subject: subject || 'Notification from SmartSend AI',
        html: htmlContent,
        text: body
      })
    });

    let resendData = await resendResponse.json();

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
          to: toEmails,
          subject: subject || 'Notification from SmartSend AI',
          html: htmlContent,
          text: body
        })
      });
      resendData = await resendResponse.json();
    }

    if (!resendResponse.ok) {
      return res.status(400).json({
        success: false,
        isDemo: false,
        error: resendData.message || 'Resend live delivery failed'
      });
    }

    return res.status(200).json({
      success: true,
      successCount: toEmails.length,
      failCount: 0,
      isDemo: false,
      resendId: resendData.id,
      from: fromAddress,
      message: `Live email delivered via Resend to ${toEmails.join(', ')}`
    });
  } catch (err) {
    console.error('Serverless send handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
