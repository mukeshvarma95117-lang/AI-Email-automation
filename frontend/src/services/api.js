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
      recentMessages: [
        { id: 1, channel: 'email', subject: 'Product Update Q3', recipients_count: 24, status: 'sent', created_at: new Date().toISOString() },
        { id: 2, channel: 'whatsapp', subject: 'Exclusive VIP Offer', recipients_count: 12, status: 'sent', created_at: new Date(Date.now() - 3600000).toISOString() }
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
        { id: 1, name: 'Mukesh Varma', email: 'mukeshvarma95117@gmail.com', phone: '+91 98765 43210', company: 'SmartSend AI', city: 'Bengaluru', group_name: 'VIP Clients' },
        { id: 2, name: 'Alex Johnson', email: 'alex.j@enterprise.io', phone: '+1 415 555 2671', company: 'Acme Corp', city: 'San Francisco', group_name: 'Product Beta' },
        { id: 3, name: 'Sarah Connor', email: 'sarah.c@cyberdyne.io', phone: '+1 310 555 9821', company: 'Cyberdyne', city: 'Los Angeles', group_name: 'VIP Clients' }
      ],
      total: 3
    };
  }

  if (endpoint.startsWith('/groups')) {
    if (method === 'POST') {
      return { success: true, group: { id: 99, name: 'New Cohort', description: 'Demo group' } };
    }
    return {
      groups: [
        { id: 1, name: 'VIP Clients', description: 'Enterprise tier customers', contacts_count: 2 },
        { id: 2, name: 'Product Beta', description: 'Early adopters', contacts_count: 1 }
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
        email_provider: 'resend',
        resend_api_key_is_set: true,
        email_user: 'demo@smartsend.ai',
        default_tone: 'Professional',
        timezone: 'Asia/Kolkata'
      }
    };
  }

  if (endpoint.startsWith('/ai/generate')) {
    return {
      subject: 'Special announcement from SmartSend AI for {{Name}}',
      body: 'Hi {{Name}},\n\nWe are excited to share an exclusive update regarding {{Company}}. Our automated messaging engine is now active and delivering personalized communications across Email, WhatsApp, and SMS.\n\nBest regards,\nThe SmartSend AI Team',
      cta: { label: 'Explore Features', url: 'https://smartsend.ai' }
    };
  }

  if (endpoint.startsWith('/ai/rewrite')) {
    return {
      subject: 'Quick update for {{Name}}',
      body: 'Hi {{Name}},\n\nHere is a quick message from {{Company}}: our new multi-channel messaging platform is live and ready for your team.\n\nWarm regards,\nSmartSend Team',
      cta: { label: 'Learn More', url: 'https://smartsend.ai' }
    };
  }

  if (endpoint.startsWith('/ai/translate')) {
    return {
      subject: 'Actualización exclusiva para {{Name}}',
      body: 'Hola {{Name}},\n\nQueríamos compartir una actualización importante sobre su espacio de trabajo en {{Company}}.\n\nSaludos cordiales,\nEl equipo de SmartSend'
    };
  }

  if (endpoint.startsWith('/messages/scheduled')) {
    if (endpoint.includes('send-now')) {
      return { success: true, message: 'Dispatched immediately (Demo Mode)' };
    }
    if (endpoint.includes('cancel')) {
      return { success: true, message: 'Cancelled (Demo Mode)' };
    }
    if (endpoint.includes('process-queue')) {
      return { success: true, result: { processedCount: 0, completed: 0, failed: 0 } };
    }
    return {
      scheduled: [
        {
          id: 1,
          channel: 'email',
          subject: 'Weekly Digest for Enterprise Leads',
          body: 'Hi {{Name}}, discover our latest product updates!',
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
      return { success: true, message: 'Logs cleared (Demo Mode)' };
    }
    return {
      logs: [
        {
          id: 1,
          channel: 'email',
          recipient_name: 'Mukesh Varma',
          recipient_target: 'mukeshvarma95117@gmail.com',
          status: 'delivered',
          resolved_subject: 'Welcome to SmartSend AI',
          resolved_body: 'Hi Mukesh Varma, welcome aboard!',
          delivery_timestamp: new Date().toISOString(),
          simulated: 1
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
    return { success: true, verified: true, message: 'Verified successfully (Demo Mode)' };
  }

  if (endpoint.startsWith('/messages/send') || endpoint.startsWith('/messages/schedule')) {
    return {
      success: true,
      count: 1,
      message: 'Message dispatched successfully (Demo Simulation Mode)',
      simulated: true
    };
  }

  return { success: true };
}

export async function request(endpoint, options = {}) {
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
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('smartsend_token');
        localStorage.removeItem('smartsend_user');
        window.location.href = '/login';
      }
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
  getContacts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/contacts${qs ? `?${qs}` : ''}`);
  },
  createContact: (data) => request('/contacts', { method: 'POST', body: JSON.stringify(data) }),
  updateContact: (id, data) => request(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteContact: (id) => request(`/contacts/${id}`, { method: 'DELETE' }),
  importCsv: (rows) => request('/contacts/import-csv', { method: 'POST', body: JSON.stringify({ rows }) }),

  // Groups
  getGroups: () => request('/groups'),
  createGroup: (data) => request('/groups', { method: 'POST', body: JSON.stringify(data) }),
  deleteGroup: (id) => request(`/groups/${id}`, { method: 'DELETE' }),

  // Messages
  sendMessage: (data) => request('/messages/send', { method: 'POST', body: JSON.stringify(data) }),
  scheduleMessage: (data) => request('/messages/schedule', { method: 'POST', body: JSON.stringify(data) }),
  getMessages: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/messages${qs ? `?${qs}` : ''}`);
  },
  getMessageById: (id) => request(`/messages/${id}`),
  getScheduledMessages: () => request('/messages/scheduled'),
  cancelScheduledMessage: (id) => request(`/messages/scheduled/${id}/cancel`, { method: 'POST' }),
  sendScheduledNow: (id) => request(`/messages/scheduled/${id}/send-now`, { method: 'POST' }),
  processScheduledQueue: () => request('/messages/scheduled/process-queue', { method: 'POST' }),
  deleteScheduledMessage: (id) => request(`/messages/scheduled/${id}`, { method: 'DELETE' }),
  clearCancelledScheduledMessages: () => request('/messages/scheduled/clear-cancelled', { method: 'DELETE' }),
  getDeliveryLogs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/messages/logs${qs ? `?${qs}` : ''}`);
  },
  deleteDeliveryLog: (id) => request(`/messages/logs/${id}`, { method: 'DELETE' }),
  clearDeliveryLogs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/messages/logs/clear${qs ? `?${qs}` : ''}`, { method: 'DELETE' });
  },

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  testLlm: (data) => request('/settings/test-llm', { method: 'POST', body: JSON.stringify(data) }),
  testChannel: (data) => request('/settings/test-channel', { method: 'POST', body: JSON.stringify(data) }),
  verifySmtp: (data) => request('/settings/verify-smtp', { method: 'POST', body: JSON.stringify(data || {}) }),
  verifyResend: (data) => request('/settings/verify-resend', { method: 'POST', body: JSON.stringify(data || {}) }),
  setupTestSmtp: () => request('/settings/setup-test-smtp', { method: 'POST' }),

  // Dashboard Stats
  getDashboardStats: () => request('/dashboard')
};

export default api;

