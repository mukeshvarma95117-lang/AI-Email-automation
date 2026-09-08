import dbHelper from '../database/db.js';

function getSmsConfig() {
  const sid = dbHelper.get("SELECT value FROM settings WHERE key = 'sms_account_sid'")?.value;
  const token = dbHelper.get("SELECT value FROM settings WHERE key = 'sms_auth_token'")?.value;
  const from = dbHelper.get("SELECT value FROM settings WHERE key = 'sms_from_number'")?.value || '+15550100';
  const demoMode = dbHelper.get("SELECT value FROM settings WHERE key = 'demo_mode'")?.value === 'true';

  const isConfigured = Boolean(sid && token);
  return { sid, token, from, isConfigured, demoMode };
}

export async function sendSms({ to, body }) {
  const config = getSmsConfig();
  const cleanPhone = (to || '').replace(/[^\d+]/g, '');

  if (!cleanPhone) {
    return {
      success: false,
      isDemo: config.demoMode || !config.isConfigured,
      status: 'Failed',
      recipient: to,
      error: 'Invalid or missing phone number'
    };
  }

  // Demo Mode or unconfigured
  if (config.demoMode || !config.isConfigured) {
    await new Promise(res => setTimeout(res, 200));
    return {
      success: true,
      isDemo: true,
      status: 'Demo Sent',
      messageId: `demo-sms-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      recipient: cleanPhone,
      info: config.isConfigured ? 'Dispatched in Demo Mode' : 'Simulated (SMS Gateway Credentials Not Configured)'
    };
  }

  // Real Twilio API delivery
  try {
    const authHeader = 'Basic ' + Buffer.from(`${config.sid}:${config.token}`).toString('base64');
    const formData = new URLSearchParams();
    formData.append('To', cleanPhone);
    formData.append('From', config.from);
    formData.append('Body', body);

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.sid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Twilio SMS error: ${response.status}`);
    }

    return {
      success: true,
      isDemo: false,
      status: 'Sent',
      messageId: data.sid || `sms-${Date.now()}`,
      recipient: cleanPhone
    };
  } catch (err) {
    console.error(`SMS delivery error to ${to}:`, err.message);
    return {
      success: false,
      isDemo: false,
      status: 'Failed',
      recipient: cleanPhone,
      error: err.message
    };
  }
}

export async function verifySmsConfig() {
  const config = getSmsConfig();
  if (!config.isConfigured) {
    return { configured: false, message: 'SMS Account SID or Auth Token not configured.' };
  }
  return { configured: true, valid: true, message: 'SMS configuration format valid.' };
}

