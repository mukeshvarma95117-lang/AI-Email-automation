import dbHelper from '../database/db.js';

function getWhatsAppData() {
  const token = dbHelper.get("SELECT value FROM settings WHERE key = 'whatsapp_token'")?.value;
  const phoneId = dbHelper.get("SELECT value FROM settings WHERE key = 'whatsapp_phone_number_id'")?.value;
  const demoMode = dbHelper.get("SELECT value FROM settings WHERE key = 'demo_mode'")?.value === 'true';

  const isConfigured = Boolean(token && phoneId);
  return { token, phoneId, isConfigured, demoMode };
}

export async function sendWhatsAppMessage({ to, body }) {
  const config = getWhatsAppData();

  // Clean phone number: remove non-numeric except leading +
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
    await new Promise(res => setTimeout(res, 250));
    return {
      success: true,
      isDemo: true,
      status: 'Demo Sent',
      messageId: `demo-wa-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      recipient: cleanPhone,
      info: config.isConfigured ? 'Dispatched in Demo Mode' : 'Simulated (WhatsApp API Credentials Not Configured)'
    };
  }

  // Real Meta WhatsApp Cloud API request
  try {
    const formattedRecipient = cleanPhone.replace(/^\+/, '');
    const response = await fetch(`https://graph.facebook.com/v20.0/${config.phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedRecipient,
        type: 'text',
        text: { preview_url: true, body }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || `WhatsApp API error: ${response.status}`);
    }

    return {
      success: true,
      isDemo: false,
      status: 'Sent',
      messageId: data.messages?.[0]?.id || `wa-${Date.now()}`,
      recipient: cleanPhone
    };
  } catch (err) {
    console.error(`WhatsApp delivery error to ${to}:`, err.message);
    return {
      success: false,
      isDemo: false,
      status: 'Failed',
      recipient: cleanPhone,
      error: err.message
    };
  }
}

export async function verifyWhatsAppConfig() {
  const config = getWhatsAppData();
  if (!config.isConfigured) {
    return { configured: false, message: 'WhatsApp Access Token or Phone Number ID not configured.' };
  }
  return { configured: true, valid: true, message: 'WhatsApp configuration format valid.' };
}

