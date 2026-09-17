import dbHelper from '../database/db.js';
import { generateMultilingualMessage, translateToLanguage } from './multilingualTemplates.js';

function getLlmConfig() {
  const apiKeyRow = dbHelper.get("SELECT value FROM settings WHERE key = 'llm_api_key'");
  const baseUrlRow = dbHelper.get("SELECT value FROM settings WHERE key = 'llm_base_url'");
  const modelRow = dbHelper.get("SELECT value FROM settings WHERE key = 'llm_model'");

  return {
    apiKey: process.env.OPENAI_API_KEY || apiKeyRow?.value || '',
    baseUrl: process.env.OPENAI_BASE_URL || baseUrlRow?.value || 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL || modelRow?.value || 'gpt-4o-mini'
  };
}

/**
 * Intelligent built-in Mock & Smart Template Engine
 * Accurately analyzes prompts, tone, language, and actions when live LLM key is absent.
 * Supports 23 major global and regional languages.
 */
function mockGenerate(params) {
  return generateMultilingualMessage(params);
}

/**
 * Main AI Message Generation
 */
export async function generateMessage(params) {
  const { prompt, tone = 'Professional', language = 'English', channel = 'email', length = 'Medium', type = 'Reminder' } = params;
  const config = getLlmConfig();

  if (!config.apiKey) {
    return mockGenerate(params);
  }

  try {
    const systemPrompt = `You are SmartSend AI, an expert messaging and copy generation agent for multi-channel communications (Email, WhatsApp, SMS).
Your task is to take a user's instruction and generate high-converting, personalized, and channel-appropriate message copy.

CRITICAL LANGUAGE REQUIREMENT:
You MUST generate the ENTIRE message (subject, body, short_version, cta) natively, fluently, and idiomatically in the requested language: ${language}.
Do NOT write English unless the requested language is English!
All headings, greeting, body copy, session details, and signoffs must be in ${language}.

Additional Requirements:
1. Dynamic Personalization:
   - Always incorporate {{name}} for the recipient's personal name.
   - For campaign specifics (such as event/topic, date, time, location, deadlines), if the user prompt provides them (e.g. 'tomorrow at 11 AM', 'AI workshop'), write those exact details DIRECTLY into the message copy so the output explicitly reflects the user's instructions.
   - Do NOT output {{time}}, {{date}}, or {{event}} placeholders when the user has provided specific times, dates, or topics in the prompt.
2. Respect the selected Tone: ${tone}.
3. Optimize format for Channel: ${channel}
   - For Email: Create a compelling subject line, formatted email body, short preview text, and Call-To-Action (CTA).
   - For WhatsApp: Use WhatsApp markdown (*bold*, _italic_), emojis appropriately, concise paragraphs, and clear CTA. Subject is optional or a title.
   - For SMS: Keep under 160 characters if possible or compact, clear, with immediate CTA. Subject is not applicable.
4. Respect desired length: ${length}.
5. Message Type: ${type}.

You MUST return ONLY a valid JSON object matching this schema with no markdown ticks outside it:
{
  "subject": "...",
  "body": "...",
  "short_version": "...",
  "cta": "..."
}`;

    const userMessage = `User instruction: "${prompt}"\nTone: ${tone}\nLanguage: ${language}\nChannel: ${channel}\nLength: ${length}\nType: ${type}`;

    const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 800
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`LLM API returned ${response.status}: ${errText}. Falling back to smart engine.`);
      return mockGenerate(params);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';

    // Extract JSON
    let parsed;
    try {
      const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch (parseError) {
      console.warn('Failed to parse LLM JSON response, fallback to raw text parsing');
      parsed = {
        subject: channel === 'email' ? 'Important Notification' : '',
        body: rawContent,
        short_version: rawContent.slice(0, 120),
        cta: 'View Details'
      };
    }

    return {
      subject: parsed.subject || '',
      body: parsed.body || '',
      short_version: parsed.short_version || '',
      cta: parsed.cta || 'Learn More',
      tone,
      channel,
      language,
      isMock: false,
      modelUsed: config.model
    };
  } catch (error) {
    console.error('AI Generation API error:', error.message);
    return mockGenerate(params);
  }
}

/**
 * AI Message Rewriter / Quick Adjustments
 * Supports: 'shorter', 'longer', 'professional', 'friendlier', 'improve'
 */
export async function rewriteMessage({ text, action, tone, channel = 'email' }) {
  const config = getLlmConfig();

  const instructions = {
    shorter: 'Make the text more concise and brief, retaining essential details and {{variables}}.',
    longer: 'Elaborate on the message, adding courteous context, preparation advice, and clear instructions while preserving {{variables}}.',
    professional: 'Rewrite the message in an executive, formal, and polished professional tone while preserving {{variables}}.',
    friendlier: 'Rewrite the message in a warm, enthusiastic, and approachable tone with welcoming language while preserving {{variables}}.',
    improve: 'Polish the grammar, flow, impact, and clarity of the message while preserving all {{variables}}.'
  };

  const instructionText = instructions[action] || `Refine the text: ${action}`;

  if (!config.apiKey) {
    // Smart fallback rewrite
    let modified = text;
    if (action === 'shorter') {
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      modified = lines.slice(0, Math.max(2, Math.floor(lines.length * 0.6))).join('\n\n');
    } else if (action === 'longer') {
      modified = `${text}\n\nPlease take a moment to review all accompanying materials prior to {{time}}. Should you need any special accommodations or guidance, our team is readily available to assist you.`;
    } else if (action === 'professional') {
      modified = text.replace(/Hi|Hey|Hello/gi, 'Dear')
                     .replace(/Cheers|Thanks|Catch you soon/gi, 'Sincerely, Event Administration');
    } else if (action === 'friendlier') {
      modified = text.replace(/Dear|Respected/gi, 'Hi there')
                     .replace(/Sincerely/gi, 'Warmly and best regards');
      if (!modified.includes('😊') && !modified.includes('👋')) {
        modified = `👋 ${modified}\n\nCan’t wait to see you there! ✨`;
      }
    } else if (action === 'improve') {
      modified = `${text}\n\n*Note: High priority session. Please ensure your setup is verified.*`;
    }

    return {
      body: modified,
      isMock: true,
      actionApplied: action
    };
  }

  try {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: `You are an AI messaging editor. Your task: ${instructionText}.
Do NOT remove or alter variable placeholders like {{name}}, {{event}}, {{date}}, {{time}}, {{location}}. Return only the revised message text.`
          },
          { role: 'user', content: text }
        ],
        temperature: 0.6
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim() || text;

    return {
      body: result,
      isMock: false,
      actionApplied: action
    };
  } catch (err) {
    console.warn('AI Rewrite fallback triggered:', err.message);
    return {
      body: text,
      isMock: true,
      error: err.message
    };
  }
}

/**
 * AI Message Translator
 */
export async function translateMessage({ subject, body, targetLanguage }) {
  const config = getLlmConfig();

  if (!config.apiKey) {
    return translateToLanguage({ subject, body, targetLanguage });
  }

  try {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: `Translate the provided JSON content into ${targetLanguage}.
Keep all variable placeholders exactly as {{name}}, {{event}}, {{date}}, {{time}}, {{location}}.
Return ONLY a JSON object: {"subject": "...", "body": "..."}`
          },
          { role: 'user', content: JSON.stringify({ subject, body }) }
        ],
        temperature: 0.3
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';
    const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      subject: parsed.subject || subject,
      body: parsed.body || body,
      language: targetLanguage,
      isMock: false
    };
  } catch (err) {
    console.warn('Translation fallback triggered:', err.message);
    return {
      subject,
      body,
      language: targetLanguage,
      isMock: true
    };
  }
}

