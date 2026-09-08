const BASE_URL = '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('smartsend_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    // Only redirect if not already on login
    if (!window.location.pathname.includes('/login')) {
      localStorage.removeItem('smartsend_token');
      localStorage.removeItem('smartsend_user');
      window.location.href = '/login';
    }
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
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

