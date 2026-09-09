import nodemailer from 'nodemailer';
import dbHelper from '../database/db.js';

export function getEmailConfig() {
  const provider = dbHelper.get("SELECT value FROM settings WHERE key = 'email_provider'")?.value || 'resend';
  const resendApiKey = dbHelper.get("SELECT value FROM settings WHERE key = 'resend_api_key'")?.value || '';
  const resendFrom = dbHelper.get("SELECT value FROM settings WHERE key = 'resend_from'")?.value || 'SmartSend AI <notifications@smartsendai.online>';

  const host = dbHelper.get("SELECT value FROM settings WHERE key = 'email_host'")?.value || 'smtp.gmail.com';
  const port = dbHelper.get("SELECT value FROM settings WHERE key = 'email_port'")?.value || '587';
  const user = dbHelper.get("SELECT value FROM settings WHERE key = 'email_user'")?.value || '';
  const pass = dbHelper.get("SELECT value FROM settings WHERE key = 'email_pass'")?.value || '';
  const from = dbHelper.get("SELECT value FROM settings WHERE key = 'email_from'")?.value || 'notifications@smartsend.ai';
  const demoMode = dbHelper.get("SELECT value FROM settings WHERE key = 'demo_mode'")?.value === 'true';

  const isResendConfigured = Boolean(resendApiKey);
  const isSmtpConfigured = Boolean(host && user && pass);
  const isConfigured = provider === 'resend' ? isResendConfigured : isSmtpConfigured;

  return {
    provider,
    resendApiKey,
    resendFrom,
    host,
    port: parseInt(port, 10),
    user,
    pass,
    from,
    isConfigured,
    isResendConfigured,
    isSmtpConfigured,
    demoMode
  };
}

function createTransporter(config) {
  const port = parseInt(config.port, 10) || 587;
  const isSecure = port === 465;
  const user = (config.user || '').trim();
  // Strip all whitespace/spaces from Gmail 16-character App Passwords
  const pass = (config.host?.includes('gmail') && config.pass)
    ? config.pass.replace(/\s+/g, '').trim()
    : (config.pass || '').trim();

  return nodemailer.createTransport({
    host: (config.host || '').trim(),
    port: port,
    secure: isSecure,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000
  });
}

function formatFromAddress(config) {
  if (config.from && config.from !== 'notifications@smartsend.ai') {
    return config.from.includes('<') ? config.from : `SmartSend AI <${config.from}>`;
  }
  if (config.user) {
    return `SmartSend AI <${config.user}>`;
  }
  return `SmartSend AI <${config.from}>`;
}

function buildHtmlEmail({ subject, body, cta }) {
  const formattedBody = body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  const ctaButtonHtml = cta && cta.trim() ? `
    <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
      <a href="#" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); color: #ffffff !important; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 10px; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.25);">
        ${cta.trim()} &rarr;
      </a>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject || 'SmartSend AI Notification'}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #7c3aed 100%); padding: 28px 32px; color: #ffffff;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td>
            <div style="display: inline-block; font-weight: 800; font-size: 20px; letter-spacing: -0.5px; color: #ffffff;">
              ✨ SmartSend AI
            </div>
            <div style="font-size: 12px; color: #e0e7ff; margin-top: 4px; font-weight: 500;">
              Automated Intelligent Communications
            </div>
          </td>
        </tr>
      </table>
    </div>
    
    <!-- Body Content -->
    <div style="padding: 32px; font-size: 15px; line-height: 1.7; color: #334155;">
      <p style="margin-top: 0; margin-bottom: 16px;">
        ${formattedBody}
      </p>
      ${ctaButtonHtml}
    </div>

    <!-- Footer -->
    <div style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center;">
      <p style="margin: 0;">Dispatched automatically by <strong>SmartSend AI</strong>.</p>
      <p style="margin: 4px 0 0 0; font-size: 11px; color: #cbd5e1;">Please do not reply directly if this is an automated broadcast.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function parseDiagnosticError(err, host) {
  const msg = err.message || String(err);
  if (
    msg.includes('534') ||
    msg.includes('535') ||
    msg.toLowerCase().includes('application-specific password') ||
    msg.toLowerCase().includes('invalid second factor') ||
    msg.toLowerCase().includes('invalidsecondfactor') ||
    msg.toLowerCase().includes('username and password not accepted') ||
    msg.toLowerCase().includes('badcredentials')
  ) {
    return `Google App Password Required (534/535): Google does not accept your regular Gmail account password. You must enable 2-Step Verification and generate a 16-character App Password at: https://myaccount.google.com/apppasswords. Alternatively, switch to the 1-click Resend API in Settings!`;
  }
  if (msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT') || msg.includes('ENOTFOUND')) {
    return `Connection failed to ${host}. Please check your SMTP host address and port (Port 465 with SSL, or 587 with TLS).`;
  }
  return msg;
}

export async function sendViaResend({ to, subject, body, isHtml = false, cta = '', customConfig = null }) {
  const config = customConfig || getEmailConfig();
  const apiKey = (config.resendApiKey || '').trim();

  if (!apiKey) {
    return {
      success: false,
      isDemo: false,
      status: 'Failed',
      error: 'Resend API Key is not configured. Please enter your Resend API key in Settings.',
      recipient: to
    };
  }

  const rawFrom = config.resendFrom || 'SmartSend AI <notifications@smartsendai.online>';
  const from = rawFrom.includes('<') ? rawFrom : `SmartSend AI <${rawFrom}>`;
  const htmlContent = isHtml ? body : buildHtmlEmail({ subject, body, cta });

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: from,
        to: Array.isArray(to) ? to : [to],
        subject: subject || 'Message from SmartSend AI',
        html: htmlContent,
        text: body
      }),
      signal: AbortSignal.timeout(15000)
    });

    const data = await res.json();

    if (!res.ok) {
      let friendlyError = data.message || `Resend Error (${res.status})`;

      // If custom domain is pending DNS verification, seamlessly fallback to onboarding@resend.dev
      if (from !== 'SmartSend AI <onboarding@resend.dev>' && friendlyError.toLowerCase().includes('not verified')) {
        console.log(`Custom domain ${from} is pending DNS verification on Resend. Falling back to onboarding@resend.dev...`);
        return sendViaResend({
          to,
          subject,
          body,
          isHtml,
          cta,
          customConfig: {
            ...config,
            resendFrom: 'SmartSend AI <onboarding@resend.dev>'
          }
        });
      }

      if (res.status === 403 && friendlyError.includes('only send testing emails')) {
        friendlyError = `Resend Free Sandbox: ${friendlyError}`;
      }
      return {
        success: false,
        isDemo: false,
        status: 'Failed',
        error: friendlyError,
        recipient: to,
        provider: 'resend'
      };
    }

    return {
      success: true,
      isDemo: false,
      status: 'Sent',
      messageId: data.id,
      recipient: to,
      provider: 'resend'
    };
  } catch (err) {
    return {
      success: false,
      isDemo: false,
      status: 'Failed',
      error: `Resend dispatch failed: ${err.message}`,
      recipient: to,
      provider: 'resend'
    };
  }
}

export async function verifyResendConfig(customConfig = null) {
  const config = customConfig || getEmailConfig();
  const apiKey = (config.resendApiKey || '').trim();

  if (!apiKey) {
    return {
      configured: false,
      valid: false,
      message: 'Resend API Key is required. Please paste your "re_..." key in Settings.'
    };
  }

  try {
    const res = await fetch('https://api.resend.com/api-keys', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      signal: AbortSignal.timeout(10000)
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        configured: true,
        valid: false,
        message: data.message || `Resend API Error ${res.status}: Invalid API Key.`
      };
    }

    // Check domains if any
    let domainCount = 0;
    try {
      const domainsRes = await fetch('https://api.resend.com/domains', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10000)
      });
      const domainsData = await domainsRes.json();
      domainCount = Array.isArray(domainsData.data) ? domainsData.data.length : 0;
    } catch (_) {}

    return {
      configured: true,
      valid: true,
      domainCount,
      message: `Resend API connected successfully! API Key is active.${domainCount > 0 ? ` Found ${domainCount} verified custom domain(s).` : ' (Ready to send via default onboarding@resend.dev)'}`
    };
  } catch (err) {
    return {
      configured: true,
      valid: false,
      message: `Resend connection failed: ${err.message}`
    };
  }
}

export async function sendEmail({ to, subject, body, isHtml = false, cta = '', forceReal = false }) {
  const config = getEmailConfig();

  // If in Demo Mode and not forced
  if (!forceReal && config.demoMode) {
    await new Promise(res => setTimeout(res, 300));
    return {
      success: true,
      isDemo: true,
      status: 'Demo Sent',
      messageId: `demo-email-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      recipient: to,
      info: config.isConfigured ? 'Dispatched in Demo Mode' : 'Simulated (Credentials Not Configured)'
    };
  }

  // Choose provider: Resend API or SMTP
  if (config.provider === 'resend') {
    if (!config.isResendConfigured) {
      return {
        success: false,
        isDemo: false,
        status: 'Failed',
        error: 'Resend API Key is not configured in Settings. Please provide your Resend API key.',
        recipient: to
      };
    }
    return sendViaResend({ to, subject, body, isHtml, cta });
  }

  // SMTP delivery
  if (!config.isSmtpConfigured) {
    const missing = [];
    if (!config.host) missing.push('Host');
    if (!config.user) missing.push('Username');
    if (!config.pass) missing.push('App Password');
    return {
      success: false,
      isDemo: false,
      status: 'Failed',
      error: `SMTP ${missing.join(', ')} is not configured in Settings. For Gmail, generate a 16-character App Password at https://myaccount.google.com/apppasswords.`,
      recipient: to
    };
  }

  try {
    const transporter = createTransporter(config);
    const fromAddress = formatFromAddress(config);
    const htmlContent = isHtml ? body : buildHtmlEmail({ subject, body, cta });

    const mailOptions = {
      from: fromAddress,
      to,
      subject: subject || 'Message from SmartSend AI',
      text: body,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    return {
      success: true,
      isDemo: false,
      status: 'Sent',
      messageId: info.messageId,
      previewUrl: previewUrl || null,
      recipient: to,
      provider: 'smtp'
    };
  } catch (err) {
    const friendlyError = parseDiagnosticError(err, config.host);
    console.error(`Email delivery failure to ${to}:`, friendlyError);
    return {
      success: false,
      isDemo: false,
      status: 'Failed',
      error: friendlyError,
      recipient: to,
      provider: 'smtp'
    };
  }
}

export async function setupEtherealAccount() {
  const testAccount = await nodemailer.createTestAccount();
  return {
    email_host: testAccount.smtp.host,
    email_port: String(testAccount.smtp.port),
    email_user: testAccount.user,
    email_pass: testAccount.pass,
    email_from: `SmartSend AI Test <${testAccount.user}>`
  };
}

export async function verifyEmailConfig(customConfig = null) {
  const config = customConfig || getEmailConfig();
  
  if (!config.host || !config.user || !config.pass) {
    const missing = [];
    if (!config.host) missing.push('Host');
    if (!config.user) missing.push('Username');
    if (!config.pass) missing.push('App Password');
    return { 
      configured: false, 
      valid: false, 
      message: `SMTP ${missing.join(', ')} required. For Gmail, enter your 16-character Google App Password in Settings.` 
    };
  }

  try {
    const transporter = createTransporter(config);
    await transporter.verify();
    return { 
      configured: true, 
      valid: true, 
      message: `SMTP connection to ${config.host}:${config.port || 587} verified successfully!` 
    };
  } catch (err) {
    const friendlyError = parseDiagnosticError(err, config.host);
    return { 
      configured: true, 
      valid: false, 
      message: `SMTP verification failed: ${friendlyError}` 
    };
  }
}
