import dbHelper from '../database/db.js';

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
 */
function mockGenerate({ prompt, tone = 'Professional', language = 'English', channel = 'email', length = 'Medium', type = 'Reminder' }) {
  const lowerPrompt = (prompt || '').toLowerCase();

  // Extract entities from prompt
  let eventName = 'AI Workshop';
  let eventDate = 'tomorrow';
  let eventTime = '10:00 AM';
  let eventLocation = 'Lab 3B / Virtual Room';

  if (lowerPrompt.includes('workshop')) eventName = 'Hands-On AI Workshop';
  else if (lowerPrompt.includes('hackathon')) eventName = 'Inter-College Hackathon';
  else if (lowerPrompt.includes('interview')) eventName = 'Technical Round Interview';
  else if (lowerPrompt.includes('exam')) eventName = 'Mid-Term Examination';
  else if (lowerPrompt.includes('meeting') || lowerPrompt.includes('discussion')) eventName = 'Team Project Discussion';
  else if (lowerPrompt.includes('fee') || lowerPrompt.includes('payment')) eventName = 'Tuition Fee Due Date';
  else if (lowerPrompt.includes('review') || lowerPrompt.includes('capstone')) eventName = 'Capstone Project Review';

  // Extract time
  const timeMatch = prompt.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM))\b/);
  if (timeMatch) eventTime = timeMatch[1];

  // Extract date / day
  if (lowerPrompt.includes('tomorrow')) eventDate = 'tomorrow';
  else if (lowerPrompt.includes('today')) eventDate = 'today';
  else if (lowerPrompt.includes('friday')) eventDate = 'this Friday';
  else if (lowerPrompt.includes('monday')) eventDate = 'this Monday';
  else if (lowerPrompt.includes('saturday')) eventDate = 'this Saturday';

  // Tone variations
  const greetings = {
    Professional: 'Dear {{name}},',
    Formal: 'Respected {{name}},',
    Friendly: 'Hi {{name}}! 👋',
    Casual: 'Hey {{name}},',
    Urgent: 'URGENT NOTICE: {{name}},',
    Promotional: 'Exclusive Update for you, {{name}}! 🚀'
  };

  const signoffs = {
    Professional: 'Sincerely,\nAcademic & Event Coordination Team',
    Formal: 'With highest regards,\nDepartment Administration',
    Friendly: 'Cheers & see you there!\nThe Organizing Team',
    Casual: 'Catch you soon,\nThe Team',
    Urgent: 'Please act immediately.\nOperations Desk',
    Promotional: 'Don’t miss out!\nSmartSend Team'
  };

  const greeting = greetings[tone] || greetings.Professional;
  const signoff = signoffs[tone] || signoffs.Professional;

  let subject = '';
  let body = '';
  let shortVersion = '';
  let cta = 'Confirm Attendance';

  if (channel === 'whatsapp') {
    subject = `${tone === 'Urgent' ? '⚠️ ' : '📌 '}${eventName} Details`;
    if (tone === 'Urgent') {
      body = `${greeting}\n\n*Action Required:* Your scheduled session for *{{event}}* is happening on *{{date}}* at *{{time}}* in *{{location}}*.\n\nPlease confirm your attendance and bring your laptop ready.\n\n${signoff}`;
      shortVersion = `⚠️ *URGENT:* {{event}} on {{date}} at {{time}}. Reply YES to confirm.`;
      cta = 'Reply YES to Confirm';
    } else if (tone === 'Friendly' || tone === 'Casual') {
      body = `${greeting}\n\nJust a quick heads up! *{{event}}* is taking place on *{{date}}* at *{{time}}* in *{{location}}*.\n\nWe’ve got an exciting agenda lined up. Let us know if you need anything beforehand!\n\n${signoff}`;
      shortVersion = `👋 Hey {{name}}, reminder for {{event}} on {{date}} at {{time}}. See you there!`;
      cta = 'View Details';
    } else {
      body = `${greeting}\n\nThis is a notification regarding *{{event}}* scheduled for *{{date}}* at *{{time}}*.\n\nVenue: *{{location}}*.\nPlease ensure timely arrival.\n\n${signoff}`;
      shortVersion = `Notification: {{event}} on {{date}} at {{time}} in {{location}}.`;
      cta = 'Access Portal';
    }
  } else if (channel === 'sms') {
    subject = '';
    if (tone === 'Urgent') {
      body = `ALERT: Hi {{name}}, your {{event}} is on {{date}} at {{time}} ({{location}}). Please reply 1 to confirm your seat immediately.`;
      shortVersion = `ALERT: {{event}} on {{date}} @ {{time}}. Reply 1 to confirm.`;
      cta = 'Reply 1';
    } else {
      body = `Hi {{name}}, reminder for {{event}} scheduled on {{date}} at {{time}} in {{location}}. Reply YES to confirm. - SmartSend`;
      shortVersion = `Reminder: {{event}} on {{date}} @ {{time}}. Reply YES to confirm.`;
      cta = 'Reply YES';
    }
  } else {
    // Email
    subject = `${tone === 'Urgent' ? '[URGENT] ' : ''}Reminder: ${eventName} - ${eventDate.toUpperCase()} at ${eventTime}`;
    body = `${greeting}\n\nThis is a reminder regarding your upcoming session for {{event}} scheduled for {{date}} at {{time}}.\n\nSession Details:\n• Event: {{event}}\n• Date & Time: {{date}} at {{time}}\n• Location: {{location}}\n\nPlease review your preparation checklist and ensure your development environment is ready.\n\nIf you have any questions or schedule conflicts, please notify the coordinator as soon as possible.\n\n${signoff}`;
    shortVersion = `Reminder: {{event}} is scheduled for {{date}} at {{time}} in {{location}}. Please arrive prepared.`;
    cta = 'Join Session / View Schedule';
  }

  // Handle language translation in mock if requested
  if (language && language !== 'English') {
    const translationNotice = ` [Language: ${language}]`;
    subject = subject ? `${subject}${translationNotice}` : '';
  }

  return {
    subject,
    body,
    short_version: shortVersion,
    cta,
    tone,
    channel,
    language,
    isMock: true,
    modelUsed: 'SmartSend Built-in AI Engine',
    notice: 'Generated using SmartSend contextual template engine. Configure an OpenAI-compatible API key in Settings for live cloud LLM responses.'
  };
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

Requirements:
1. Always incorporate dynamic personalization placeholders when applicable:
   - {{name}} for recipient's name
   - {{event}} for the event or subject matter
   - {{date}} for scheduled date or day
   - {{time}} for scheduled time
   - {{location}} for room, lab, or virtual link
2. Respect the selected Tone: ${tone}.
3. Generate content in language: ${language}.
4. Optimize format for Channel: ${channel}
   - For Email: Create a compelling subject line, formatted email body, short preview text, and Call-To-Action (CTA).
   - For WhatsApp: Use WhatsApp markdown (*bold*, _italic_), emojis appropriately, concise paragraphs, and clear CTA. Subject is optional or a title.
   - For SMS: Keep under 160 characters if possible or compact, clear, with immediate CTA. Subject is not applicable.
5. Respect desired length: ${length}.
6. Message Type: ${type}.

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
    // Return with language tag
    const langMap = {
      Spanish: { subj: 'Recordatorio:', greeting: 'Hola {{name}},' },
      French: { subj: 'Rappel:', greeting: 'Bonjour {{name}},' },
      German: { subj: 'Erinnerung:', greeting: 'Hallo {{name}},' },
      Hindi: { subj: 'स्मरण पत्र:', greeting: 'नमस्ते {{name}},' }
    };
    const sample = langMap[targetLanguage] || { subj: `[${targetLanguage}]`, greeting: `Hi {{name}} [${targetLanguage}],` };

    return {
      subject: subject ? `${sample.subj} ${subject}` : '',
      body: body.replace(/^(Dear|Hi|Hey|Hello|Respected)[^\n,]*,?/i, sample.greeting),
      language: targetLanguage,
      isMock: true
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

