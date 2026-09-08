import dbHelper from '../database/db.js';
import { verifyEmailConfig, sendEmail, setupEtherealAccount, verifyResendConfig } from '../services/emailService.js';
import { verifyWhatsAppConfig, sendWhatsAppMessage } from '../services/whatsappService.js';
import { verifySmsConfig, sendSms } from '../services/smsService.js';

// Sensitive keys to mask when sending to browser
const SENSITIVE_KEYS = ['llm_api_key', 'resend_api_key', 'email_pass', 'whatsapp_token', 'sms_auth_token'];

export function getSettings(req, res) {
  try {
    const rows = dbHelper.all("SELECT key, value FROM settings WHERE key NOT LIKE '%_is_set'");
    const settings = {};

    for (const r of rows) {
      if (SENSITIVE_KEYS.includes(r.key)) {
        settings[r.key] = r.value ? '••••••••••••' : '';
        settings[`${r.key}_is_set`] = Boolean(r.value);
      } else {
        settings[r.key] = r.value;
      }
    }

    return res.json({ settings });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve settings.' });
  }
}

export function updateSettings(req, res) {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Invalid settings payload.' });
    }

    for (const [key, val] of Object.entries(updates)) {
      if (key.endsWith('_is_set')) continue;
      // Don't overwrite with masked string
      if (SENSITIVE_KEYS.includes(key) && val === '••••••••••••') {
        continue;
      }

      const strVal = String(val !== null && val !== undefined ? val : '');
      const existing = dbHelper.get('SELECT key FROM settings WHERE key = ?', [key]);
      if (existing) {
        dbHelper.run("UPDATE settings SET value = ?, updated_at = datetime('now') WHERE key = ?", [strVal, key]);
      } else {
        dbHelper.run("INSERT INTO settings (key, value) VALUES (?, ?)", [key, strVal]);
      }
    }

    return res.json({ message: 'Settings successfully updated.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save settings.' });
  }
}

export async function testLlmConnection(req, res) {
  try {
    const { apiKey, baseUrl, model } = req.body;

    const testKey = apiKey && apiKey !== '••••••••••••' 
      ? apiKey 
      : dbHelper.get("SELECT value FROM settings WHERE key = 'llm_api_key'")?.value;
    const testUrl = baseUrl || dbHelper.get("SELECT value FROM settings WHERE key = 'llm_base_url'")?.value || 'https://api.openai.com/v1';
    const testModel = model || dbHelper.get("SELECT value FROM settings WHERE key = 'llm_model'")?.value || 'gpt-4o-mini';

    if (!testKey) {
      return res.json({
        success: false,
        message: 'No API key provided. SmartSend is operating in Built-in Smart Engine Fallback mode.'
      });
    }

    const response = await fetch(`${testUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testKey}`
      },
      body: JSON.stringify({
        model: testModel,
        messages: [{ role: 'user', content: 'Reply with "SmartSend AI Connected!"' }],
        max_tokens: 15
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(400).json({ success: false, error: `LLM API Error ${response.status}: ${err}` });
    }

    const data = await response.json();
    return res.json({
      success: true,
      message: `Successfully connected to ${testModel}! Response: "${data.choices?.[0]?.message?.content?.trim()}"`
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: `Connection failed: ${err.message}` });
  }
}

export async function verifySmtp(req, res) {
  try {
    const { host, port, user, pass } = req.body || {};

    const testHost = host || dbHelper.get("SELECT value FROM settings WHERE key = 'email_host'")?.value;
    const testPort = port || dbHelper.get("SELECT value FROM settings WHERE key = 'email_port'")?.value || '587';
    const testUser = user || dbHelper.get("SELECT value FROM settings WHERE key = 'email_user'")?.value;
    const testPass = pass && pass !== '••••••••••••'
      ? pass
      : dbHelper.get("SELECT value FROM settings WHERE key = 'email_pass'")?.value;

    const result = await verifyEmailConfig({
      host: testHost,
      port: parseInt(testPort, 10),
      user: testUser,
      pass: testPass
    });

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ configured: true, valid: false, message: `SMTP verification failed: ${err.message}` });
  }
}

export async function verifyResend(req, res) {
  try {
    const { apiKey, from } = req.body || {};
    const testKey = apiKey && apiKey !== '••••••••••••'
      ? apiKey
      : dbHelper.get("SELECT value FROM settings WHERE key = 'resend_api_key'")?.value;
    const testFrom = from || dbHelper.get("SELECT value FROM settings WHERE key = 'resend_from'")?.value;

    const result = await verifyResendConfig({
      resendApiKey: testKey,
      resendFrom: testFrom
    });

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ configured: true, valid: false, message: `Resend verification failed: ${err.message}` });
  }
}

export async function testChannel(req, res) {
  try {
    const { channel, testRecipient, forceReal = false } = req.body;

    if (!testRecipient) {
      return res.status(400).json({ error: 'Test recipient is required.' });
    }

    let result;
    if (channel === 'email') {
      result = await sendEmail({
        to: testRecipient,
        subject: '✨ SmartSend AI: Test Email Verification',
        body: `Congratulations! Your email delivery configuration is working perfectly.\n\nThis real test email was dispatched by SmartSend AI to confirm that your SMTP connection is active and capable of reaching real inboxes.\n\nYou can now send automated reminders, campaigns, and broadcasts to real recipients with complete confidence.`,
        cta: 'Open SmartSend Portal',
        forceReal: Boolean(forceReal)
      });
    } else if (channel === 'whatsapp') {
      result = await sendWhatsAppMessage({
        to: testRecipient,
        body: '📌 *SmartSend AI:* This is a test message to verify your WhatsApp integration.'
      });
    } else if (channel === 'sms') {
      result = await sendSms({
        to: testRecipient,
        body: 'SmartSend AI: Test message to verify SMS configuration.'
      });
    } else {
      return res.status(400).json({ error: 'Invalid channel specified.' });
    }

    return res.json({ success: result.success, result });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to send test message.' });
  }
}

export async function setupTestSmtp(req, res) {
  try {
    const config = await setupEtherealAccount();
    for (const [key, val] of Object.entries(config)) {
      const existing = dbHelper.get('SELECT key FROM settings WHERE key = ?', [key]);
      if (existing) {
        dbHelper.run("UPDATE settings SET value = ?, updated_at = datetime('now') WHERE key = ?", [val, key]);
      } else {
        dbHelper.run("INSERT INTO settings (key, value) VALUES (?, ?)", [key, val]);
      }
    }
    return res.json({
      success: true,
      message: 'Instant Test SMTP configured with free Ethereal service! Real SMTP delivery is now active.',
      config: {
        email_host: config.email_host,
        email_port: config.email_port,
        email_user: config.email_user,
        email_from: config.email_from
      }
    });
  } catch (err) {
    return res.status(500).json({ error: `Failed to create test SMTP: ${err.message}` });
  }
}

