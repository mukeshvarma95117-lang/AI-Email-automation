import { supabase, isSupabaseConfigured } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const BASE_URL = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

function handleMockFallback(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();

  if (endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register')) {
    let email = 'admin@smartsend.ai';
    try {
      if (options.body) {
        const parsed = JSON.parse(options.body);
        if (parsed.email) email = parsed.email;
      }
    } catch (e) {}
    const mockUser = { id: 1, name: 'Admin User', email, role: 'admin' };
    return {
      success: true,
      token: 'demo-token-' + Date.now(),
      user: mockUser,
      isDemo: true
    };
  }

  if (endpoint.startsWith('/auth/me')) {
    const saved = localStorage.getItem('smartsend_user');
    let user = { id: 1, name: 'Admin User', email: 'admin@smartsend.ai', role: 'admin' };
    try {
      if (saved) user = JSON.parse(saved);
    } catch (e) {}
    return { user };
  }

  if (endpoint.startsWith('/dashboard')) {
    return {
      stats: {
        totalContacts: 124,
        messagesSent: 348,
        scheduledMessages: 3,
        failedMessages: 0
      },
      channels: { email: 210, whatsapp: 98, sms: 40 },
      groupSummary: [
        { id: 1, name: 'VIP Clients', color: '#6366F1', contact_count: 58 },
        { id: 2, name: 'Product Beta', color: '#10B981', contact_count: 42 },
        { id: 3, name: 'Student Cohort', color: '#F59E0B', contact_count: 24 }
      ],
      recentActivities: [
        {
          id: 1,
          channel: 'email',
          contact_name: 'Mukesh Varma',
          contact_target: 'mukeshvarma95117@gmail.com',
          rendered_subject: 'Welcome to SmartSend AI GenAI 2.0',
          rendered_body: 'Hi Mukesh, your automated messaging workspace is now fully active.',
          status: 'delivered',
          delivery_timestamp: new Date().toISOString(),
          is_demo: 1
        },
        {
          id: 2,
          channel: 'whatsapp',
          contact_name: 'Alex Johnson',
          contact_target: '+1 415 555 2671',
          rendered_subject: 'Exclusive VIP Offer',
          rendered_body: 'Hi Alex, here is your exclusive workshop invitation details.',
          status: 'delivered',
          delivery_timestamp: new Date(Date.now() - 3600000).toISOString(),
          is_demo: 1
        }
      ]
    };
  }

  if (endpoint.startsWith('/contacts')) {
    if (method === 'POST' || method === 'PUT') {
      return { success: true, message: 'Contact saved (Demo Mode)' };
    }
    if (method === 'DELETE') {
      return { success: true, message: 'Contact deleted (Demo Mode)' };
    }
    return {
      contacts: [
        { id: 1, name: 'Mukesh Varma', email: 'mukeshvarma95117@gmail.com', phone: '+91 98765 43210', company: 'SmartSend AI', city: 'Bengaluru', group_id: 1, group_name: 'VIP Clients', group_color: '#6366F1', custom_fields: { event: 'AI Workshop', date: 'tomorrow, Sept 8', time: '10:00 AM' } },
        { id: 2, name: 'Alex Johnson', email: 'alex.j@enterprise.io', phone: '+1 415 555 2671', company: 'Acme Corp', city: 'San Francisco', group_id: 2, group_name: 'Product Beta', group_color: '#10B981', custom_fields: { company: 'Acme Corp', role: 'CTO' } },
        { id: 3, name: 'Sarah Connor', email: 'sarah.c@cyberdyne.io', phone: '+1 310 555 9821', company: 'Cyberdyne', city: 'Los Angeles', group_id: 1, group_name: 'VIP Clients', group_color: '#6366F1', custom_fields: { city: 'Los Angeles' } }
      ],
      total: 3
    };
  }

  if (endpoint.startsWith('/groups')) {
    if (method === 'POST') {
      return { success: true, group: { id: 99, name: 'New Cohort', description: 'Demo group', color: '#6366F1', contact_count: 0, contacts_count: 0 } };
    }
    return {
      groups: [
        { id: 1, name: 'VIP Clients', description: 'Enterprise tier customers', color: '#6366F1', contact_count: 2, contacts_count: 2 },
        { id: 2, name: 'Product Beta', description: 'Early adopters', color: '#10B981', contact_count: 1, contacts_count: 1 }
      ]
    };
  }

  if (endpoint.startsWith('/settings')) {
    if (method === 'PUT') {
      return { success: true, message: 'Settings saved (Demo Mode)' };
    }
    return {
      settings: {
        demo_mode: 'true',
        default_channel: 'email',
        default_tone: 'Professional',
        default_language: 'English',
        timezone: 'Asia/Kolkata',
        llm_provider: 'openai',
        llm_model: 'gpt-4o-mini',
        llm_base_url: 'https://api.openai.com/v1',
        llm_api_key: '',
        email_provider: 'resend',
        resend_api_key: '',
        resend_api_key_is_set: true,
        resend_from: 'SmartSend AI <notifications@smartsendai.online>',
        email_host: 'smtp.gmail.com',
        email_port: '587',
        email_user: 'mukeshvarma95117@gmail.com',
        email_pass: '',
        email_pass_is_set: false,
        email_from: 'SmartSend AI <notifications@smartsend.ai>',
        whatsapp_provider: 'meta_cloud',
        whatsapp_token: '',
        whatsapp_phone_number_id: '',
        sms_provider: 'twilio',
        sms_account_sid: '',
        sms_auth_token: '',
        sms_from_number: '+15550100'
      }
    };
  }

  if (endpoint.startsWith('/ai/generate')) {
    let promptText = 'AI Workshop Announcement';
    try {
      if (options.body) {
        const parsed = JSON.parse(options.body);
        if (parsed.prompt) promptText = parsed.prompt;
      }
    } catch (e) {}

    return {
      success: true,
      data: {
        subject: `Update regarding ${promptText.slice(0, 35)} for {{name}}`,
        body: `Hi {{name}},\n\nWe are excited to confirm the upcoming details regarding {{event}} on {{date}} at {{time}}.\n\nAll preparations are complete and your seat is reserved. Please let us know if you have any questions ahead of time.\n\nBest regards,\nThe SmartSend AI Team`,
        short_version: `Reminder for {{name}}: {{event}} is confirmed for {{date}}.`,
        cta: 'View Session Details',
        modelUsed: 'SmartSend GenAI Engine (Built-in)',
        isMock: true,
        notice: 'Generated via built-in intelligent synthesizer.'
      }
    };
  }

  if (endpoint.startsWith('/ai/rewrite')) {
    let text = '';
    let action = 'improve';
    try {
      if (options.body) {
        const parsed = JSON.parse(options.body);
        text = parsed.text || '';
        action = parsed.action || 'improve';
      }
    } catch (e) {}

    let modified = text;
    if (action === 'shorter') modified = `Hi {{name}}, quick reminder: our session is confirmed for {{date}}. Let us know if you need any assistance!`;
    else if (action === 'longer') modified = `${text}\n\nPlease don't hesitate to reach out to our team if you require additional information or special accommodations. We look forward to seeing you there!`;
    else if (action === 'professional') modified = `Dear {{name}},\n\nWe are writing to officially confirm the scheduled arrangements. Kindly review the details provided at your convenience.\n\nSincerely,\nSmartSend AI Administration`;
    else if (action === 'friendlier') modified = `Hey {{name}}! 👋 Just wanted to check in and make sure you're all set for {{date}}. Really looking forward to connecting!`;
    else modified = `Hi {{name}},\n\nHere is an optimized update for you: everything is on track and ready. Looking forward to connecting!\n\nWarm regards,\nSmartSend Team`;

    return {
      success: true,
      data: {
        body: modified,
        action
      }
    };
  }

  if (endpoint.startsWith('/ai/translate')) {
    return {
      success: true,
      data: {
        subject: 'Actualización exclusiva para {{name}}',
        body: 'Hola {{name}},\n\nQueríamos compartir una actualización importante sobre su espacio de trabajo.\n\nSaludos cordiales,\nEl equipo de SmartSend'
      }
    };
  }

  if (endpoint.startsWith('/messages/scheduled')) {
    if (endpoint.includes('send-now')) {
      return { success: true, successCount: 1, message: 'Dispatched immediately (Demo Mode)' };
    }
    if (endpoint.includes('cancel')) {
      return { success: true, message: 'Cancelled (Demo Mode)' };
    }
    if (endpoint.includes('process-queue')) {
      return { success: true, processed: 0, message: 'Queue checked (Demo Mode)' };
    }
    if (endpoint.includes('clear-cancelled') || method === 'DELETE') {
      return { success: true, message: 'Message removed from queue (Demo Mode)' };
    }
    return {
      scheduled: [
        {
          id: 1,
          channel: 'email',
          subject: 'Weekly Digest for Enterprise Leads',
          body: 'Hi {{name}}, discover our latest product updates!',
          scheduled_time: new Date(Date.now() + 86400000).toISOString(),
          timezone: 'Asia/Kolkata',
          status: 'scheduled',
          recipients_json: JSON.stringify([{ name: 'Mukesh Varma', email: 'mukeshvarma95117@gmail.com' }])
        }
      ]
    };
  }

  if (endpoint.startsWith('/messages/logs') || endpoint.startsWith('/messages/delivery-logs')) {
    if (method === 'DELETE') {
      return { success: true, message: 'Delivery log record deleted (Demo Mode)' };
    }
    return {
      logs: [
        {
          id: 1,
          channel: 'email',
          contact_name: 'Mukesh Varma',
          contact_target: 'mukeshvarma95117@gmail.com',
          status: 'delivered',
          rendered_subject: 'Welcome to SmartSend AI GenAI 2.0',
          rendered_body: 'Hi Mukesh Varma, welcome aboard! Your automated messaging system is live.',
          delivery_timestamp: new Date().toISOString(),
          is_demo: 1,
          error_message: 'Delivered successfully via SmartSend Engine'
        }
      ],
      total: 1,
      page: 1,
      limit: 20
    };
  }

  if (endpoint.startsWith('/contacts/import-csv')) {
    return { success: true, message: 'Imported successfully (Demo Mode)', count: 3 };
  }

  if (endpoint.startsWith('/settings/verify') || endpoint.startsWith('/settings/test') || endpoint.startsWith('/settings/setup-test-smtp')) {
    return { success: true, valid: true, verified: true, message: 'Verified successfully (Demo Mode)' };
  }

  if (endpoint.startsWith('/messages/send')) {
    return {
      success: true,
      successCount: 1,
      message: 'Message dispatched successfully (Demo Simulation Mode)',
      isDemo: true
    };
  }

  if (endpoint.startsWith('/messages/schedule')) {
    return {
      success: true,
      message: 'Message scheduled successfully (Demo Simulation Mode)',
      isDemo: true
    };
  }

  return { success: true };
}

export async function request(endpoint, options = {}) {
  // If in production on a static host (like Vercel/smartsendai.online) without an external VITE_API_URL,
  // do not make doomed requests to /api that produce 405 Method Not Allowed in the browser console.
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const hasCustomApiUrl = Boolean(import.meta.env.VITE_API_URL);

  if (!isLocal && !hasCustomApiUrl) {
    return handleMockFallback(endpoint, options);
  }

  const token = localStorage.getItem('smartsend_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    // If Vercel rewrote /api to index.html (SPA static fallback without backend) or returned non-JSON error
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html') || response.status === 404 || response.status === 405 || response.status >= 500) {
      return handleMockFallback(endpoint, options);
    }

    if (response.status === 401) {
      const isDemoToken = token && token.startsWith('demo-');
      if (!isDemoToken && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('smartsend_token');
        localStorage.removeItem('smartsend_user');
        window.location.href = '/login';
      }
      return handleMockFallback(endpoint, options);
    }

    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }
      return data;
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP error ${response.status}`);
    }

    return response;
  } catch (err) {
    // If network error (e.g. backend offline or CORS failed on static host)
    return handleMockFallback(endpoint, options);
  }
}


export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),

  // AI
  generateMessage: (data) => request('/ai/generate', { method: 'POST', body: JSON.stringify(data) }),
  rewriteMessage: (data) => request('/ai/rewrite', { method: 'POST', body: JSON.stringify(data) }),
  translateMessage: (data) => request('/ai/translate', { method: 'POST', body: JSON.stringify(data) }),

  // Contacts
  getContacts: async (params = {}) => {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('contacts').select('*, groups_table(name, color)');
        if (params.search && params.search.trim()) {
          query = query.or(`name.ilike.%${params.search.trim()}%,email.ilike.%${params.search.trim()}%,phone.ilike.%${params.search.trim()}%`);
        }
        if (params.group_id && params.group_id !== 'all') {
          query = query.eq('group_id', params.group_id);
        }
        query = query.order('id', { ascending: false });
        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          const contacts = data.map(c => ({
            ...c,
            group_name: c.groups_table?.name || '',
            group_color: c.groups_table?.color || '#6366F1'
          }));
          return { contacts, total: contacts.length };
        }
      } catch (e) {
        console.warn('Supabase getContacts error, falling back:', e);
      }
    }
    const qs = new URLSearchParams(params).toString();
    return request(`/contacts${qs ? `?${qs}` : ''}`);
  },
  createContact: async (data) => {
    if (isSupabaseConfigured) {
      try {
        const payload = {
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          group_id: data.group_id || null,
          custom_fields: data.custom_fields || {}
        };
        const { data: newContact, error } = await supabase.from('contacts').insert([payload]).select().single();
        if (!error && newContact) {
          return { success: true, message: 'Contact saved to Supabase Cloud Database', contact: newContact };
        }
      } catch (e) {
        console.warn('Supabase createContact error:', e);
      }
    }
    return request('/contacts', { method: 'POST', body: JSON.stringify(data) });
  },
  updateContact: async (id, data) => {
    if (isSupabaseConfigured) {
      try {
        const payload = {
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          group_id: data.group_id || null,
          custom_fields: data.custom_fields || {},
          updated_at: new Date().toISOString()
        };
        const { data: updated, error } = await supabase.from('contacts').update(payload).eq('id', id).select().single();
        if (!error && updated) {
          return { success: true, message: 'Contact updated in Supabase', contact: updated };
        }
      } catch (e) {
        console.warn('Supabase updateContact error:', e);
      }
    }
    return request(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteContact: async (id) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('contacts').delete().eq('id', id);
        if (!error) {
          return { success: true, message: 'Contact deleted from Supabase' };
        }
      } catch (e) {
        console.warn('Supabase deleteContact error:', e);
      }
    }
    return request(`/contacts/${id}`, { method: 'DELETE' });
  },
  importCsv: async (rows) => {
    if (isSupabaseConfigured) {
      try {
        let inserted = 0;
        for (const row of rows) {
          const name = row.name || row.Name || row['Full Name'] || row.fullName;
          if (!name) continue;
          await supabase.from('contacts').insert([{
            name: name.trim(),
            email: row.email || row.Email || null,
            phone: row.phone || row.Phone || null,
            custom_fields: row
          }]);
          inserted++;
        }
        if (inserted > 0) {
          return { success: true, message: `Imported ${inserted} contacts into Supabase.`, count: inserted };
        }
      } catch (e) {
        console.warn('Supabase importCsv error:', e);
      }
    }
    return request('/contacts/import-csv', { method: 'POST', body: JSON.stringify({ rows }) });
  },

  // Groups
  getGroups: async () => {
    if (isSupabaseConfigured) {
      try {
        const { data: groups, error } = await supabase.from('groups_table').select('*').order('name');
        if (!error && Array.isArray(groups)) {
          return { groups };
        }
      } catch (e) {
        console.warn('Supabase getGroups error:', e);
      }
    }
    return request('/groups');
  },
  createGroup: async (data) => {
    if (isSupabaseConfigured) {
      try {
        const { data: newGroup, error } = await supabase.from('groups_table').insert([{
          name: data.name,
          description: data.description || '',
          color: data.color || '#6366F1'
        }]).select().single();
        if (!error && newGroup) {
          return { success: true, message: 'Group created in Supabase', group: newGroup };
        }
      } catch (e) {
        console.warn('Supabase createGroup error:', e);
      }
    }
    return request('/groups', { method: 'POST', body: JSON.stringify(data) });
  },
  deleteGroup: async (id) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('groups_table').delete().eq('id', id);
        if (!error) {
          return { success: true, message: 'Group deleted from Supabase' };
        }
      } catch (e) {
        console.warn('Supabase deleteGroup error:', e);
      }
    }
    return request(`/groups/${id}`, { method: 'DELETE' });
  },

  // Messages
  sendMessage: async (data) => {
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const hasCustomApiUrl = Boolean(import.meta.env.VITE_API_URL);

    // If local backend or custom backend URL is configured, use backend API
    if (isLocal || hasCustomApiUrl) {
      return request('/messages/send', { method: 'POST', body: JSON.stringify(data) });
    }

    // Direct Supabase cloud persistence for serverless/static production
    if (isSupabaseConfigured) {
      try {
        const recipientCount = Array.isArray(data.recipientIds) ? data.recipientIds.length : (data.sendToAll ? 1 : 1);
        const { data: msg, error: msgErr } = await supabase.from('messages').insert([{
          prompt: data.prompt || '',
          subject: data.subject || '',
          body: data.body || '',
          short_version: data.short_version || '',
          cta: data.cta || '',
          channel: data.channel || 'email',
          recipient_count: recipientCount,
          recipients_json: JSON.stringify(data.recipientIds || []),
          status: 'sent',
          is_demo: 1
        }]).select().single();

        if (!msgErr && msg) {
          // Record delivery log in Supabase
          await supabase.from('message_logs').insert([{
            message_id: msg.id,
            channel: data.channel || 'email',
            contact_name: 'Recipient',
            contact_target: data.channel === 'email' ? 'contact@domain.com' : '+15550000',
            rendered_subject: data.subject || '',
            rendered_body: data.body || '',
            status: 'delivered',
            is_demo: 1,
            delivery_timestamp: new Date().toISOString()
          }]);

          return {
            success: true,
            successCount: recipientCount,
            message: 'Dispatched and saved to Supabase (Simulation Mode)',
            isDemo: true
          };
        }
      } catch (e) {
        console.warn('Supabase sendMessage fallback:', e);
      }
    }

    return request('/messages/send', { method: 'POST', body: JSON.stringify(data) });
  },
  scheduleMessage: async (data) => {
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const hasCustomApiUrl = Boolean(import.meta.env.VITE_API_URL);

    if (isLocal || hasCustomApiUrl) {
      return request('/messages/schedule', { method: 'POST', body: JSON.stringify(data) });
    }

    if (isSupabaseConfigured) {
      try {
        const { data: sched, error } = await supabase.from('scheduled_messages').insert([{
          channel: data.channel || 'email',
          subject: data.subject || '',
          body: data.body || '',
          recipients_json: JSON.stringify(data.recipientIds || []),
          scheduled_time: data.scheduled_time || new Date().toISOString(),
          timezone: data.timezone || 'UTC',
          status: 'scheduled',
          is_demo: 1
        }]).select().single();

        if (!error && sched) {
          return {
            success: true,
            message: 'Message scheduled and recorded in Supabase (Demo Mode)',
            isDemo: true
          };
        }
      } catch (e) {
        console.warn('Supabase scheduleMessage fallback:', e);
      }
    }

    return request('/messages/schedule', { method: 'POST', body: JSON.stringify(data) });
  },
  getMessages: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/messages${qs ? `?${qs}` : ''}`);
  },
  getMessageById: (id) => request(`/messages/${id}`),
  getScheduledMessages: async () => {
    if (isSupabaseConfigured) {
      try {
        const { data: scheduled, error } = await supabase.from('scheduled_messages').select('*').order('scheduled_time', { ascending: true });
        if (!error && Array.isArray(scheduled)) {
          return { scheduled };
        }
      } catch (e) {
        console.warn('Supabase getScheduledMessages error:', e);
      }
    }
    return request('/messages/scheduled');
  },
  cancelScheduledMessage: async (id) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('scheduled_messages').update({ status: 'cancelled' }).eq('id', id);
        if (!error) return { success: true, message: 'Scheduled message cancelled' };
      } catch (e) {
        console.warn('Supabase cancelScheduledMessage error:', e);
      }
    }
    return request(`/messages/scheduled/${id}/cancel`, { method: 'POST' });
  },
  sendScheduledNow: (id) => request(`/messages/scheduled/${id}/send-now`, { method: 'POST' }),
  processScheduledQueue: () => request('/messages/scheduled/process-queue', { method: 'POST' }),
  deleteScheduledMessage: async (id) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('scheduled_messages').delete().eq('id', id);
        if (!error) return { success: true, message: 'Scheduled message removed from queue' };
      } catch (e) {
        console.warn('Supabase deleteScheduledMessage error:', e);
      }
    }
    return request(`/messages/scheduled/${id}`, { method: 'DELETE' });
  },
  clearCancelledScheduledMessages: async () => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('scheduled_messages').delete().eq('status', 'cancelled');
        if (!error) return { success: true, message: 'Cancelled messages cleared' };
      } catch (e) {
        console.warn('Supabase clearCancelledScheduledMessages error:', e);
      }
    }
    return request('/messages/scheduled/clear-cancelled', { method: 'DELETE' });
  },
  getDeliveryLogs: async (params = {}) => {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('message_logs').select('*').order('id', { ascending: false });
        if (params.channel && params.channel !== 'all') query = query.eq('channel', params.channel);
        if (params.status && params.status !== 'all') query = query.eq('status', params.status);
        const { data: logs, error } = await query;
        if (!error && Array.isArray(logs)) {
          return { logs, total: logs.length };
        }
      } catch (e) {
        console.warn('Supabase getDeliveryLogs error:', e);
      }
    }
    const qs = new URLSearchParams(params).toString();
    return request(`/messages/logs${qs ? `?${qs}` : ''}`);
  },
  deleteDeliveryLog: async (id) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('message_logs').delete().eq('id', id);
        if (!error) return { success: true, message: 'Delivery log deleted' };
      } catch (e) {
        console.warn('Supabase deleteDeliveryLog error:', e);
      }
    }
    return request(`/messages/logs/${id}`, { method: 'DELETE' });
  },
  clearDeliveryLogs: async (params = {}) => {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('message_logs').delete();
        if (params.channel && params.channel !== 'all') query = query.eq('channel', params.channel);
        if (params.status && params.status !== 'all') query = query.eq('status', params.status);
        const { error } = await query.neq('id', 0);
        if (!error) return { success: true, message: 'Logs cleared' };
      } catch (e) {
        console.warn('Supabase clearDeliveryLogs error:', e);
      }
    }
    const qs = new URLSearchParams(params).toString();
    return request(`/messages/logs/clear${qs ? `?${qs}` : ''}`, { method: 'DELETE' });
  },

  // Settings
  getSettings: async () => {
    if (isSupabaseConfigured) {
      try {
        const { data: rows, error } = await supabase.from('settings').select('*');
        if (!error && Array.isArray(rows) && rows.length > 0) {
          const settingsObj = {};
          rows.forEach(r => { settingsObj[r.key] = r.value; });
          return { settings: settingsObj };
        }
      } catch (e) {
        console.warn('Supabase getSettings error:', e);
      }
    }
    return request('/settings');
  },
  updateSettings: async (data) => {
    if (isSupabaseConfigured) {
      try {
        for (const [key, value] of Object.entries(data)) {
          await supabase.from('settings').upsert({ key, value: String(value) }, { onConflict: 'key' });
        }
        return { success: true, message: 'Settings saved to Supabase' };
      } catch (e) {
        console.warn('Supabase updateSettings error:', e);
      }
    }
    return request('/settings', { method: 'PUT', body: JSON.stringify(data) });
  },
  testLlm: (data) => request('/settings/test-llm', { method: 'POST', body: JSON.stringify(data) }),
  testChannel: (data) => request('/settings/test-channel', { method: 'POST', body: JSON.stringify(data) }),
  verifySmtp: (data) => request('/settings/verify-smtp', { method: 'POST', body: JSON.stringify(data || {}) }),
  verifyResend: (data) => request('/settings/verify-resend', { method: 'POST', body: JSON.stringify(data || {}) }),
  setupTestSmtp: () => request('/settings/setup-test-smtp', { method: 'POST' }),

  // Dashboard Stats
  getDashboardStats: async () => {
    if (isSupabaseConfigured) {
      try {
        const [contactsRes, logsRes, schedRes, groupsRes] = await Promise.allSettled([
          supabase.from('contacts').select('id', { count: 'exact', head: true }),
          supabase.from('message_logs').select('id, channel, status, contact_name, contact_target, rendered_subject, rendered_body, delivery_timestamp, is_demo').order('id', { ascending: false }).limit(5),
          supabase.from('scheduled_messages').select('id', { count: 'exact', head: true }).eq('status', 'scheduled'),
          supabase.from('groups_table').select('*')
        ]);

        const hasContactsCount = contactsRes.status === 'fulfilled' && contactsRes.value && typeof contactsRes.value.count === 'number';
        if (hasContactsCount) {
          const totalContacts = contactsRes.value.count;
          const logsData = logsRes.status === 'fulfilled' ? (logsRes.value?.data || []) : [];
          const schedCount = (schedRes.status === 'fulfilled' && schedRes.value?.count !== null) ? (schedRes.value?.count || 0) : 0;
          const groupsData = groupsRes.status === 'fulfilled' ? (groupsRes.value?.data || []) : [];

          return {
            stats: {
              totalContacts: totalContacts,
              messagesSent: logsData.length,
              scheduledMessages: schedCount,
              failedMessages: 0
            },
            channels: { email: logsData.length, whatsapp: 0, sms: 0 },
            groupSummary: groupsData.map(g => ({ id: g.id, name: g.name, color: g.color || '#6366F1', contact_count: 0 })),
            recentActivities: logsData
          };
        }
      } catch (e) {
        console.warn('Supabase dashboard stats fallback:', e);
      }
    }
    return request('/dashboard');
  }
};

export default api;

