import { generateMessage, rewriteMessage, translateMessage } from '../services/aiService.js';
import { extractVariables, resolveVariables } from '../services/variableResolver.js';

export async function generate(req, res) {
  try {
    const { prompt, tone, language, channel, length, type } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Instruction prompt is required.' });
    }

    const result = await generateMessage({
      prompt: prompt.trim(),
      tone: tone || 'Professional',
      language: language || 'English',
      channel: channel || 'email',
      length: length || 'Medium',
      type: type || 'Reminder'
    });

    // Also extract variables present in the generated message
    const variables = extractVariables(`${result.subject || ''} ${result.body || ''}`);

    return res.json({
      success: true,
      data: {
        ...result,
        detectedVariables: variables
      }
    });
  } catch (err) {
    console.error('AI Generate controller error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate message.' });
  }
}

export async function rewrite(req, res) {
  try {
    const { text, action, tone, channel } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text to rewrite is required.' });
    }

    const validActions = ['shorter', 'longer', 'professional', 'friendlier', 'improve'];
    const selectedAction = validActions.includes(action) ? action : 'improve';

    const result = await rewriteMessage({
      text: text.trim(),
      action: selectedAction,
      tone: tone || 'Professional',
      channel: channel || 'email'
    });

    const detectedVariables = extractVariables(result.body || '');

    return res.json({
      success: true,
      data: {
        ...result,
        detectedVariables
      }
    });
  } catch (err) {
    console.error('AI Rewrite controller error:', err);
    return res.status(500).json({ error: err.message || 'Failed to rewrite message.' });
  }
}

export async function translate(req, res) {
  try {
    const { subject, body, targetLanguage } = req.body;

    if (!body || !targetLanguage) {
      return res.status(400).json({ error: 'Body and targetLanguage are required.' });
    }

    const result = await translateMessage({
      subject: subject || '',
      body: body.trim(),
      targetLanguage
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('AI Translate controller error:', err);
    return res.status(500).json({ error: err.message || 'Failed to translate message.' });
  }
}

export function previewPersonalization(req, res) {
  try {
    const { template, subjectTemplate, contact, globalVars } = req.body;

    const resolvedBody = resolveVariables(template || '', contact || {}, globalVars || {});
    const resolvedSubject = resolveVariables(subjectTemplate || '', contact || {}, globalVars || {});

    return res.json({
      success: true,
      data: {
        subject: resolvedSubject.text,
        body: resolvedBody.text,
        unresolvedVariables: Array.from(new Set([
          ...resolvedBody.unresolvedVariables,
          ...resolvedSubject.unresolvedVariables
        ])),
        isFullyResolved: resolvedBody.isFullyResolved && resolvedSubject.isFullyResolved
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to preview personalization.' });
  }
}

