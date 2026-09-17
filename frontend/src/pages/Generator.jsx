import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { substituteVariables, extractVariables } from '../utils/variableParser';

import VariablePills from '../components/generator/VariablePills';
import AiActionButtons from '../components/generator/AiActionButtons';
import WhatsAppPreview from '../components/preview/WhatsAppPreview';
import EmailPreview from '../components/preview/EmailPreview';
import SmsPreview from '../components/preview/SmsPreview';
import ConfirmationModal from '../components/common/ConfirmationModal';
import ScheduleModal from '../components/scheduling/ScheduleModal';

import {
  Sparkles,
  Wand2,
  Mail,
  MessageSquare,
  Smartphone,
  Send,
  Clock,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Eye,
  Edit3,
  Users,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Plus,
  Trash2,
  AtSign,
  UserCheck,
  RefreshCw,
  Loader2,
  Settings as SettingsIcon
} from 'lucide-react';

const SAMPLE_PROMPTS = [
  'Send a professional reminder to all students about tomorrow’s AI workshop at 10 AM.',
  'Send a friendly follow-up regarding the hackathon project submission due this Friday.',
  'Send an urgent notice regarding tomorrow morning mid-term lab exam room change.',
  'Send an invitation to faculty for the guest lecture on LLMs next Monday at 2 PM.'
];

const TONES = ['Professional', 'Friendly', 'Casual', 'Formal', 'Urgent', 'Promotional'];
const LANGUAGES = ['English', 'Spanish', 'French', 'Hindi', 'German'];
const TYPES = ['Reminder', 'Announcement', 'Invitation', 'Alert', 'Follow-up'];
const LENGTHS = ['Short', 'Medium', 'Long'];

export default function Generator() {
  const searchParams = useSearchParams()[0];
  const navigate = useNavigate();
  const { success, error, info } = useToast();

  // Prompt configuration state
  const [prompt, setPrompt] = useState(
    'Send a professional reminder to all students about tomorrow’s AI workshop at 10 AM.'
  );
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState(
    'Send a professional reminder to all students about tomorrow’s AI workshop at 10 AM.'
  );
  const [tone, setTone] = useState('Professional');
  const [language, setLanguage] = useState('English');
  const [channel, setChannel] = useState('email');
  const [messageType, setMessageType] = useState('Reminder');
  const [length, setLength] = useState('Medium');

  // Generated content state
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [shortVersion, setShortVersion] = useState('');
  const [cta, setCta] = useState('');
  const [modelUsed, setModelUsed] = useState('');
  const [isMock, setIsMock] = useState(false);
  const [aiNotice, setAiNotice] = useState('');

  // Editing toggle
  const [isEditing, setIsEditing] = useState(false);

  // Recipient selection state
  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [recipientMode, setRecipientMode] = useState('group'); // 'group', 'individual', or 'custom'
  const [contactSearch, setContactSearch] = useState('');
  const [customRecipients, setCustomRecipients] = useState([]);
  const [customEmailInput, setCustomEmailInput] = useState('');
  const [customNameInput, setCustomNameInput] = useState('');

  // System mode state
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [emailProvider, setEmailProvider] = useState('resend');
  const [userSmtpEmail, setUserSmtpEmail] = useState('');
  const [isEmailConfigured, setIsEmailConfigured] = useState(false);

  // Contact preview switcher
  const [previewContactIndex, setPreviewContactIndex] = useState(0);

  // Loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const textareaRef = useRef(null);

  // Fetch groups, contacts, and settings on mount
  useEffect(() => {
    Promise.all([
      api.getGroups(),
      api.getContacts({ limit: 100 }),
      api.getSettings()
    ])
      .then(([groupsRes, contactsRes, settingsRes]) => {
        setGroups(groupsRes.groups || []);
        setContacts(contactsRes.contacts || []);
        if (settingsRes.settings) {
          const s = settingsRes.settings;
          setIsDemoMode(s.demo_mode === 'true');
          setUserSmtpEmail(s.email_user || '');
          const provider = s.email_provider || 'resend';
          setEmailProvider(provider);

          const hasResend = Boolean(s.resend_api_key || s.resend_api_key_is_set);
          const hasSmtp = Boolean(s.email_user && (s.email_pass || s.email_pass_is_set));
          setIsEmailConfigured(provider === 'resend' ? hasResend : hasSmtp);
        }

        const initialGroupId = searchParams.get('group') || (groupsRes.groups?.[0]?.id ? String(groupsRes.groups[0].id) : '');
        setSelectedGroupId(initialGroupId);
      })
      .catch(err => console.error('Failed to load recipient data:', err));
  }, [searchParams]);

  const handleToggleDemoMode = async () => {
    const nextVal = !isDemoMode;
    try {
      await api.updateSettings({ demo_mode: nextVal ? 'true' : 'false' });
      setIsDemoMode(nextVal);
      if (nextVal) {
        info('Switched to Demo Simulation Mode. Emails are simulated locally.', 'Demo Mode');
      } else {
        if (channel === 'email' && !isEmailConfigured) {
          if (emailProvider === 'resend') {
            info('Switched to Live Delivery Mode. Note: Please configure your Resend API Key in Settings.', 'Live Mode Active');
          } else {
            info('Switched to Live Delivery Mode. Note: Please enter your Google App Password in Settings to send live emails.', 'Live Mode Active');
          }
        } else {
          success(`Switched to Live Delivery Mode! Real emails will now be sent via ${emailProvider === 'resend' ? 'Resend Cloud API' : 'SMTP'}.`, 'Live Mode Active');
        }
      }
    } catch (err) {
      error('Failed to toggle delivery mode.');
    }
  };

  const handleAddCustomRecipient = (e) => {
    if (e) e.preventDefault();
    const raw = customEmailInput.trim();
    if (!raw) return;

    const items = raw.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    const newItems = [];
    const isSingleInput = items.length === 1;

    for (const item of items) {
      const angleMatch = item.match(/^(.*?)\s*<([^\s>]+@[^\s>]+\.[^\s>]+)>$/);
      let email = '';
      let name = '';

      if (angleMatch) {
        name = angleMatch[1].trim();
        email = angleMatch[2].trim().toLowerCase();
      } else {
        email = item.toLowerCase();
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        error(`"${item}" is not a valid email address.`);
        continue;
      }

      // If single item, use customNameInput if provided
      if (isSingleInput && customNameInput.trim()) {
        name = customNameInput.trim();
      }

      // If name still empty or multiple batch items without embedded names, derive individual name from email prefix
      if (!name) {
        const prefix = email.split('@')[0].replace(/[._-]/g, ' ');
        name = prefix.replace(/\b\w/g, c => c.toUpperCase());
      }

      if (!customRecipients.some(cr => cr.email.toLowerCase() === email)) {
        newItems.push({ name, email });
      }
    }

    if (newItems.length > 0) {
      setCustomRecipients(prev => {
        const next = [...prev, ...newItems];
        setPreviewContactIndex(next.length - 1);
        return next;
      });
      setCustomEmailInput('');
      setCustomNameInput('');
      success(`Added ${newItems.length} recipient${newItems.length > 1 ? 's with individual names' : ''}.`);
    }
  };

  const handleUpdateCustomRecipientName = (idx, newName) => {
    setCustomRecipients(prev => prev.map((cr, i) => i === idx ? { ...cr, name: newName } : cr));
  };

  const handleRemoveCustomRecipient = (idx) => {
    setCustomRecipients(prev => {
      const next = prev.filter((_, i) => i !== idx);
      setPreviewContactIndex(0);
      return next;
    });
  };

  const handleAddMyEmail = () => {
    if (!userSmtpEmail) {
      error('No SMTP email configured in Settings yet.');
      return;
    }
    if (customRecipients.some(cr => cr.email.toLowerCase() === userSmtpEmail.toLowerCase())) {
      info('Your email is already in the recipient list.');
      return;
    }
    const prefix = userSmtpEmail.split('@')[0].replace(/[._-]/g, ' ');
    const name = prefix.replace(/\b\w/g, c => c.toUpperCase());
    setCustomRecipients(prev => {
      const next = [...prev, { name, email: userSmtpEmail }];
      setPreviewContactIndex(next.length - 1);
      return next;
    });
    success(`Added your email: ${userSmtpEmail}`);
  };

  // Insert variable tag into cursor position
  const handleInsertVariable = (tag) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentText = body;
      const newText = currentText.substring(0, start) + tag + currentText.substring(end);
      setBody(newText);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + tag.length;
        textarea.focus();
      }, 0);
    } else {
      setBody(prev => (prev ? `${prev} ${tag}` : tag));
    }
  };

  // Generate Message
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      error('Please enter a description for what you want to send.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await api.generateMessage({
        prompt: prompt.trim(),
        tone,
        language,
        channel,
        length,
        type: messageType
      });

      const data = res?.data || res || {};
      setSubject(data.subject || '');
      setBody(data.body || '');
      setShortVersion(data.short_version || '');
      setCta(data.cta || '');
      setModelUsed(data.modelUsed || '');
      setIsMock(Boolean(data.isMock));
      setAiNotice(data.notice || '');
      setLastGeneratedPrompt(prompt.trim());

      success('AI message generated successfully!', 'Generation Complete');
    } catch (err) {
      error(err.message || 'Failed to generate message copy.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Rewrite / Refine
  const handleRewrite = async (action) => {
    if (!body) return;
    setIsRewriting(true);
    try {
      const res = await api.rewriteMessage({
        text: body,
        action,
        tone,
        channel
      });
      const data = res?.data || res || {};
      if (data.body) setBody(data.body);
      success(`Applied refine: ${action}`, 'AI Refinement');
    } catch (err) {
      error(err.message || 'Failed to refine copy.');
    } finally {
      setIsRewriting(false);
    }
  };

  // Translate
  const handleTranslate = async () => {
    if (!body) return;
    setIsRewriting(true);
    try {
      const res = await api.translateMessage({
        subject,
        body,
        targetLanguage: language
      });
      const data = res?.data || res || {};
      if (data.subject) setSubject(data.subject);
      if (data.body) setBody(data.body);
      success(`Translated message into ${language}`, 'Translation Complete');
    } catch (err) {
      error(err.message || 'Failed to translate copy.');
    } finally {
      setIsRewriting(false);
    }
  };

  // Filter contacts by search query
  const filteredContacts = contacts.filter(c => {
    if (!contactSearch.trim()) return true;
    const q = contactSearch.toLowerCase();
    return (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q);
  });

  // Compute recipient list based on active recipient mode
  const currentRecipients = recipientMode === 'group'
    ? contacts.filter(c => selectedGroupId ? String(c.group_id) === String(selectedGroupId) : true)
    : recipientMode === 'individual'
    ? contacts.filter(c => selectedContactIds.includes(c.id))
    : customRecipients.map((cr, idx) => ({
        id: -(idx + 1),
        name: cr.name || 'Direct Recipient',
        email: cr.email,
        phone: null,
        custom_fields: {}
      }));

  // Resolve active recipient to preview in the live channel simulator
  const activeRecipient = currentRecipients.length > 0
    ? currentRecipients[previewContactIndex % currentRecipients.length]
    : null;

  const currentPreviewContact = activeRecipient || {
    name: recipientMode === 'individual' && selectedContactIds.length === 0
      ? 'No Recipient Picked'
      : (contacts[0]?.name || 'Rahul Sharma'),
    email: recipientMode === 'individual' && selectedContactIds.length === 0
      ? 'pick-contacts-on-left@preview.local'
      : (contacts[0]?.email || 'rahul.sharma@example.edu'),
    phone: contacts[0]?.phone || '+1 555-0192',
    group_name: contacts[0]?.group_name || 'AI Workshop Students',
    custom_fields: contacts[0]?.custom_fields || {
      event: "Tomorrow's Hands-On AI Workshop",
      date: 'tomorrow, Sept 8',
      time: '10:00 AM',
      location: 'Lab 3B'
    }
  };

  // Extract dynamic campaign variables from the active prompt
  const activePromptGlobalVars = (() => {
    const vars = {};
    const lower = prompt.toLowerCase();

    // Time (e.g. 11 AM, 11:00 AM, 11am, 2:30 PM, 9 PM)
    const timeMatch = prompt.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)|\d{1,2}\s*o'?clock)\b/i);
    if (timeMatch) vars.time = timeMatch[1].toUpperCase();

    // Date
    const dateMatch = prompt.match(/\b(tomorrow|today|tonight|this\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
    if (dateMatch) vars.date = dateMatch[1];
    else if (lower.includes('tomorrow')) vars.date = 'tomorrow';
    else if (lower.includes('today')) vars.date = 'today';

    // Event
    const aboutMatch = prompt.match(/\babout\s+(?:tomorrow['’]s\s+|today['’]s\s+)?([^.!?\n]+?)(?:\s+at\s+\d|\s+on\s+|\s+in\s+|\.|\?|!|$)/i);
    if (aboutMatch && aboutMatch[1].trim().length > 2 && aboutMatch[1].trim().length < 50) {
      vars.event = aboutMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase());
    } else if (lower.includes('workshop')) vars.event = 'Hands-On AI Workshop';
    else if (lower.includes('hackathon')) vars.event = 'Inter-College Hackathon';
    else if (lower.includes('interview')) vars.event = 'Technical Round Interview';
    else if (lower.includes('exam') || lower.includes('test')) vars.event = 'Mid-Term Examination';

    return vars;
  })();

  // Live variable substituted preview text
  const renderedSubject = substituteVariables(subject, currentPreviewContact, activePromptGlobalVars);
  const renderedBody = substituteVariables(body, currentPreviewContact, activePromptGlobalVars);

  // Check if description prompt has been modified since last generation
  const isPromptModified = Boolean(body) && prompt.trim().length > 0 && prompt.trim() !== lastGeneratedPrompt.trim();

  // Auto-regenerate when prompt changes (debounced by 800ms) when user is not manually editing copy
  useEffect(() => {
    if (!body || isEditing || !prompt.trim() || prompt.trim() === lastGeneratedPrompt.trim()) {
      return;
    }
    const timer = setTimeout(() => {
      handleGenerate();
    }, 800);
    return () => clearTimeout(timer);
  }, [prompt, tone, language, channel, messageType, length, body, isEditing, lastGeneratedPrompt]);

  // Safety checks
  const missingTargets = currentRecipients.filter(c => channel === 'email' ? !c.email : !c.phone).length;
  const detectedVariables = extractVariables(`${subject} ${body}`);
  const sampleResolved = substituteVariables(body, currentPreviewContact, activePromptGlobalVars);
  const unresolvedVars = extractVariables(sampleResolved);

  // Dispatch Immediately
  const handleSendConfirm = async () => {
    setIsSending(true);
    try {
      const isAllGroup = recipientMode === 'group' && (!selectedGroupId || selectedGroupId === 'all');
      const payload = {
        prompt,
        subject,
        body,
        short_version: shortVersion,
        cta,
        channel,
        isDemo: isDemoMode,
        demo_mode: isDemoMode ? 'true' : 'false',
        recipients: currentRecipients,
        groupId: recipientMode === 'group' ? (selectedGroupId && selectedGroupId !== 'all' ? Number(selectedGroupId) : 'all') : null,
        recipientIds: recipientMode === 'individual' ? selectedContactIds : (isAllGroup ? contacts.map(c => c.id) : null),
        sendToAll: isAllGroup,
        customRecipients: recipientMode === 'custom' ? customRecipients : null,
        globalVars: activePromptGlobalVars
      };

      const res = await api.sendMessage(payload);
      setShowConfirmModal(false);

      // Celebrate success!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      const modeText = res.isDemo 
        ? 'Demo Mode Simulation' 
        : (channel === 'email' && emailProvider === 'resend' ? 'Live Resend Cloud Delivery' : 'Live Delivery');
      success(
        `Dispatched to ${res.successCount} recipients (${modeText})`,
        'Message Sent!'
      );

      navigate('/history');
    } catch (err) {
      error(err.message || 'Failed to dispatch message.');
    } finally {
      setIsSending(false);
    }
  };

  // Schedule for later
  const handleScheduleConfirm = async ({ scheduledDateTime, utcScheduledTime, timezone }) => {
    setIsSending(true);
    try {
      const isAllGroup = recipientMode === 'group' && (!selectedGroupId || selectedGroupId === 'all');
      const payload = {
        prompt,
        subject,
        body,
        short_version: shortVersion,
        cta,
        channel,
        isDemo: isDemoMode,
        demo_mode: isDemoMode ? 'true' : 'false',
        recipients: currentRecipients,
        groupId: recipientMode === 'group' ? (selectedGroupId && selectedGroupId !== 'all' ? Number(selectedGroupId) : 'all') : null,
        recipientIds: recipientMode === 'individual' ? selectedContactIds : currentRecipients.map(c => c.id),
        sendToAll: isAllGroup,
        scheduled_time: utcScheduledTime || scheduledDateTime,
        raw_scheduled_time: scheduledDateTime,
        timezone,
        globalVars: activePromptGlobalVars
      };

      await api.scheduleMessage(payload);
      setShowScheduleModal(false);
      success('Message queued in scheduled pipeline!', 'Scheduled');
      navigate('/scheduled');
    } catch (err) {
      error(err.message || 'Failed to schedule message.');
    } finally {
      setIsSending(false);
    }
  };

  // Send single test message
  const handleSendTest = async () => {
    const testTarget = channel === 'email' ? 'test@example.com' : '+15550199';
    try {
      await api.testChannel({
        channel,
        testRecipient: testTarget
      });
      success(`Test ${channel} message dispatched to ${testTarget}`, 'Test Sent');
    } catch (err) {
      error(err.message || 'Failed to send test message.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              AI Message Composer & Generator
            </h1>
            {isMock && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                <FlaskConical className="w-3 h-3" /> Built-in Smart Engine
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Craft, personalize, preview, and dispatch AI-generated copy across Email, WhatsApp, and SMS.
          </p>
        </div>

        {/* Channel Selector Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => setChannel('email')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              channel === 'email'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>
          <button
            type="button"
            onClick={() => setChannel('whatsapp')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              channel === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={() => setChannel('sms')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              channel === 'sms'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>SMS</span>
          </button>
        </div>
      </div>

      {/* Live Mode vs Demo Simulation Status Banner */}
      <div className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 text-xs ${
        isDemoMode
          ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/20 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
          : 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              isDemoMode
                ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300'
                : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300'
            }`}>
              {isDemoMode ? <FlaskConical className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">
                  {isDemoMode ? 'Demo Simulation Mode Active' : 'Live Delivery Active — Real Inboxes Connected'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isDemoMode
                    ? 'bg-amber-200/80 text-amber-900 dark:bg-amber-900 dark:text-amber-100'
                    : 'bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100'
                }`}>
                  {isDemoMode ? 'Simulated Dispatch' : 'Real SMTP Delivery'}
                </span>
              </div>
              <p className="text-[11px] opacity-90 mt-0.5">
                {isDemoMode
                  ? 'Dispatches will be simulated safely without contacting real SMTP servers or exhausting quotas. Switch to Live Delivery to send real emails to real people.'
                  : 'All messages sent from this composer will be transmitted to real people in their real inboxes via your configured SMTP server.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleDemoMode}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs shadow-sm transition-all whitespace-nowrap self-start sm:self-auto cursor-pointer ${
              isDemoMode
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isDemoMode ? 'Switch to Live Delivery' : 'Switch to Demo Mode'}
          </button>
        </div>

        {!isDemoMode && channel === 'email' && !isEmailConfigured && (
          <div className="pt-2.5 mt-1 border-t border-emerald-200/70 dark:border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-amber-500/10 p-2.5 rounded-xl">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                {emailProvider === 'resend' ? (
                  <><strong>Resend API Key Missing:</strong> Live email requires a Resend API key in Settings.</>
                ) : (
                  <><strong>Google App Password Missing:</strong> Live email via Gmail requires a 16-character Google App Password in Settings (regular account passwords like "mukesh@2006" will fail).</>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => navigate('/settings')}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] shadow-sm flex items-center gap-1 transition-colors cursor-pointer"
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>Configure in Settings</span>
              </button>
              <button
                type="button"
                onClick={handleToggleDemoMode}
                className="px-3 py-1 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 font-semibold text-[11px] hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Switch to Demo Mode
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout: Left (Prompt & Parameters) vs Right (Live Channel Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Prompt, Tone, Message Body (Span 7) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: Describe what you want to send */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Describe What You Want To Send</span>
              </label>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                Plain English Prompt
              </span>
            </div>

            <textarea
              rows={3}
              placeholder="e.g. Send a friendly reminder to students about tomorrow’s AI workshop at 10 AM in Lab 3B..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
            />

            {/* Alert Banner when Description is modified */}
            {isPromptModified && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-300 dark:border-amber-700/60 text-slate-800 dark:text-slate-200 text-xs animate-in fade-in slide-in-from-top-1 duration-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                  <div>
                    <span className="font-bold text-amber-900 dark:text-amber-300">Description updated:</span>
                    <span className="ml-1 text-slate-700 dark:text-slate-300">
                      New instructions detected. Click <strong>Update Email Now</strong> or press <kbd className="px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 font-mono shadow-xs">Ctrl+Enter</kbd> to refresh your email copy.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer shrink-0 active:scale-95"
                >
                  {isGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>Update Email Now ↵</span>
                </button>
              </div>
            )}

            {/* Prompt suggestion chips */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-slate-400">Quick Prompt Presets:</p>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PROMPTS.map((sp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(sp)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors text-left"
                  >
                    "{sp.slice(0, 48)}..."
                  </button>
                ))}
              </div>
            </div>

            {/* Selectors Grid: Tone, Language, Type, Length */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              {/* Tone */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-500 text-[11px]">Tone</label>
                <select
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Language */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-500 text-[11px]">Language</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {/* Message Type */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-500 text-[11px]">Type</label>
                <select
                  value={messageType}
                  onChange={e => setMessageType(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {TYPES.map(ty => <option key={ty} value={ty}>{ty}</option>)}
                </select>
              </div>

              {/* Max Length */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-500 text-[11px]">Length</label>
                <select
                  value={length}
                  onChange={e => setLength(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {LENGTHS.map(len => <option key={len} value={len}>{len}</option>)}
                </select>
              </div>
            </div>

            {/* AI Action Buttons */}
            <AiActionButtons
              isGenerating={isGenerating}
              isRewriting={isRewriting}
              onGenerate={handleGenerate}
              onRegenerate={handleGenerate}
              onRewrite={handleRewrite}
              onTranslate={handleTranslate}
              selectedLanguage={language}
              hasGeneratedMessage={Boolean(body)}
              isPromptModified={isPromptModified}
            />
          </div>

          {/* Card 2: AI Message Editor & Variable Insertion */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Message Copy & Personalization
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {isEditing ? 'Done Editing' : 'Edit Text'}
              </button>
            </div>

            {/* Email Subject Line (When Email channel selected) */}
            {channel === 'email' && (
              <div className="space-y-1 text-xs">
                <label className="font-semibold text-slate-500">Subject Line</label>
                <input
                  type="text"
                  placeholder="Subject line..."
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            )}

            {/* Message Body */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-500">Message Body Template</label>
                <span className="text-[11px] text-slate-400 font-mono">{body.length} chars</span>
              </div>
              <textarea
                ref={textareaRef}
                rows={7}
                placeholder="Message body with {{name}}, {{event}}, {{date}} placeholders..."
                value={body}
                onChange={e => setBody(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/60 text-slate-900 dark:text-white font-sans text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />

              {/* Dynamic Personalization Indicator */}
              {Boolean(body) && (
                <div className="pt-1">
                  {body.includes('{{name}}') || body.includes('{{first_name}}') ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        Dynamic Personalization Active: Each recipient receives an email with their own name automatically substituted into <code className="px-1 rounded bg-white dark:bg-emerald-900/60 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">{`{{name}}`}</code>.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>
                          No <code className="font-mono font-bold text-[10px] bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">{`{{name}}`}</code> tag found. All recipients will receive the identical text without personalized names.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInsertVariable('{{name}}')}
                        className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[10px] shrink-0 shadow-sm transition-colors cursor-pointer"
                      >
                        + Insert {'{{name}}'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Variable Pills Component */}
            <VariablePills onInsertVariable={handleInsertVariable} />

            {/* Short version and CTA fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-500">Short Summary Version</label>
                <input
                  type="text"
                  placeholder="Brief 1-sentence version..."
                  value={shortVersion}
                  onChange={e => setShortVersion(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-500">Call-To-Action (CTA)</label>
                <input
                  type="text"
                  placeholder="e.g. Confirm Attendance"
                  value={cta}
                  onChange={e => setCta(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Choose Recipients */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Choose Recipients
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                {currentRecipients.length} Selected
              </span>
            </div>

            {/* Recipient Mode Switcher Tabs */}
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setRecipientMode('group');
                  setPreviewContactIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                  recipientMode === 'group'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Cohort / Group
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecipientMode('individual');
                  setPreviewContactIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                  recipientMode === 'individual'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Pick Contacts
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecipientMode('custom');
                  setPreviewContactIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1.5 ${
                  recipientMode === 'custom'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <AtSign className="w-3.5 h-3.5" />
                <span>Direct Real Emails</span>
              </button>
            </div>

            {/* Recipient Mode 1: Group / Cohort */}
            {recipientMode === 'group' && (
              <div className="space-y-1 text-xs">
                <label className="font-semibold text-slate-500">Target Cohort</label>
                <select
                  value={selectedGroupId}
                  onChange={e => {
                    setSelectedGroupId(e.target.value);
                    setPreviewContactIndex(0);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">All Contacts ({contacts.length} total)</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({contacts.filter(c => c.group_id === g.id).length} contacts)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Recipient Mode 2: Individual Contacts */}
            {recipientMode === 'individual' && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {selectedContactIds.length} of {contacts.length} Selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedContactIds(contacts.map(c => c.id));
                        setPreviewContactIndex(0);
                      }}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                    >
                      Select All ({contacts.length})
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedContactIds([]);
                        setPreviewContactIndex(0);
                      }}
                      className="text-slate-500 hover:underline cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Search contacts to pick..."
                  value={contactSearch}
                  onChange={e => setContactSearch(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />

                <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl p-2">
                  {filteredContacts.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-3">No contacts match filter.</p>
                  ) : (
                    filteredContacts.map(c => {
                      const isChecked = selectedContactIds.includes(c.id);
                      const isCurrentlyPreviewed = currentRecipients.length > 0 && currentRecipients[previewContactIndex % currentRecipients.length]?.id === c.id;

                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            if (isChecked) {
                              const idx = currentRecipients.findIndex(r => r.id === c.id);
                              if (idx !== -1) setPreviewContactIndex(idx);
                            }
                          }}
                          className={`flex items-center justify-between p-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
                            isCurrentlyPreviewed
                              ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <label className="flex items-center gap-2 truncate cursor-pointer flex-1 min-w-0" onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSelectedContactIds(prev => {
                                    const next = [...prev, c.id];
                                    setPreviewContactIndex(next.length - 1);
                                    return next;
                                  });
                                } else {
                                  setSelectedContactIds(prev => {
                                    const next = prev.filter(id => id !== c.id);
                                    setPreviewContactIndex(0);
                                    return next;
                                  });
                                }
                              }}
                              className="rounded text-indigo-600 focus:ring-indigo-500 shrink-0"
                            />
                            <span className={`font-semibold truncate ${isCurrentlyPreviewed ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-800 dark:text-slate-200'}`}>
                              {c.name}
                            </span>
                            <span className="text-slate-400 truncate text-[11px]">
                              ({c.email || c.phone})
                            </span>
                          </label>
                          {isCurrentlyPreviewed && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 shrink-0 pl-1.5">
                              Previewing
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Recipient Mode 3: Custom / Direct Email Addresses */}
            {recipientMode === 'custom' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Paste multiple email addresses (comma, semicolon, or line-separated) to dispatch to multiple persons at once.
                  </p>
                  {customRecipients.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCustomRecipients([])}
                      className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer shrink-0 ml-2"
                    >
                      Clear All ({customRecipients.length})
                    </button>
                  )}
                </div>

                <form onSubmit={handleAddCustomRecipient} className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Recipient Name (optional)"
                      value={customNameInput}
                      onChange={e => setCustomNameInput(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <div className="sm:col-span-2 flex gap-2">
                      <input
                        type="text"
                        placeholder="email@example.com (or comma-separated)"
                        value={customEmailInput}
                        onChange={e => setCustomEmailInput(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Quick Add My Email Preset Button */}
                {userSmtpEmail && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddMyEmail}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold hover:bg-indigo-100 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>+ Add My Email ({userSmtpEmail})</span>
                    </button>
                  </div>
                )}

                {/* Direct Recipients List */}
                <div className="space-y-1.5 max-h-40 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-950/40">
                  {customRecipients.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-4">
                      No direct recipients added yet. Enter an email address above to add.
                    </p>
                  ) : (
                    customRecipients.map((cr, idx) => {
                      const isCurrentlyPreviewed = (previewContactIndex % customRecipients.length) === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => setPreviewContactIndex(idx)}
                          className={`flex items-center justify-between p-1.5 px-2.5 rounded-lg border shadow-sm cursor-pointer transition-colors ${
                            isCurrentlyPreviewed
                              ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                              {cr.name.charAt(0).toUpperCase()}
                            </div>
                            <span className={`font-semibold truncate text-[11px] ${isCurrentlyPreviewed ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-900 dark:text-white'}`}>
                              {cr.name}
                            </span>
                            <span className="text-slate-400 font-mono text-[10px] truncate">
                              &lt;{cr.email}&gt;
                            </span>
                            {isCurrentlyPreviewed && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 shrink-0 pl-1.5">
                                Previewing
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCustomRecipient(idx);
                            }}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                            title="Remove recipient"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Realistic Channel Preview Simulator (Span 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Live Channel Simulator
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                {channel} View
              </span>
            </div>

            {/* Live Recipient Info Bar (Replaces old manual dropdown) */}
            {currentRecipients.length > 0 ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium text-[11px]">
                      Outgoing To:
                    </span>
                    <span className="font-semibold text-indigo-950 dark:text-indigo-200 truncate">
                      {currentPreviewContact.name}
                    </span>
                    {(currentPreviewContact.email || currentPreviewContact.phone) && (
                      <span className="text-slate-400 dark:text-slate-500 text-[11px] truncate hidden sm:inline font-mono">
                        &lt;{currentPreviewContact.email || currentPreviewContact.phone}&gt;
                      </span>
                    )}
                  </div>

                  {currentRecipients.length > 1 && (
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
                        {(previewContactIndex % currentRecipients.length) + 1} of {currentRecipients.length}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewContactIndex(prev =>
                              prev > 0 ? prev - 1 : currentRecipients.length - 1
                            )
                          }
                          className="p-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer"
                          title="Previous recipient"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewContactIndex(prev =>
                              (prev + 1) % currentRecipients.length
                            )
                          }
                          className="p-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer"
                          title="Next recipient"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {currentRecipients.length > 1 && (
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
                    <span className="text-indigo-500">ℹ️</span>
                    <span>Previewing for <strong>{currentPreviewContact.name}</strong>. Each recipient will receive their own separate email with their own name.</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Pick contacts on the left to preview the outgoing mail.</span>
              </div>
            )}

            {/* Simulators Container */}
            <div className="py-2">
              {channel === 'whatsapp' && (
                <WhatsAppPreview
                  contactName={currentPreviewContact.name}
                  contactPhone={currentPreviewContact.phone}
                  text={renderedBody}
                  cta={cta}
                />
              )}

              {channel === 'email' && (
                <EmailPreview
                  contactName={currentPreviewContact.name}
                  contactEmail={currentPreviewContact.email}
                  subject={renderedSubject}
                  body={renderedBody}
                  cta={cta}
                />
              )}

              {channel === 'sms' && (
                <SmsPreview
                  contactName={currentPreviewContact.name}
                  contactPhone={currentPreviewContact.phone}
                  text={renderedBody}
                />
              )}
            </div>

            {/* Actions Bar: Send Test, Send Now, Schedule */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleSendTest}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors btn-lift"
                >
                  Send Test
                </button>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(true)}
                  disabled={!body.trim()}
                  className="py-2.5 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 btn-lift"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Schedule</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={!body.trim() || currentRecipients.length === 0}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all cursor-pointer btn-shimmer btn-glow btn-lift btn-send-hover"
              >
                <Send className="w-4 h-4" />
                <span>Send Now ({currentRecipients.length} Recipients)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation & Scheduling Modals */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleSendConfirm}
        recipientCount={currentRecipients.length}
        channel={channel}
        unresolvedVariables={unresolvedVars}
        missingTargets={missingTargets}
        isSending={isSending}
        isDemo={isDemoMode}
        emailProvider={emailProvider}
        isEmailConfigured={isEmailConfigured}
        isSmtpConfigured={isEmailConfigured}
        hasNamePlaceholder={Boolean(body.includes('{{name}}') || body.includes('{{first_name}}'))}
        onSwitchToDemo={async () => {
          await handleToggleDemoMode();
        }}
        onOpenSettings={() => {
          setShowConfirmModal(false);
          navigate('/settings');
        }}
      />

      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={handleScheduleConfirm}
        recipientCount={currentRecipients.length}
        channel={channel}
        isScheduling={isSending}
      />
    </div>
  );
}

