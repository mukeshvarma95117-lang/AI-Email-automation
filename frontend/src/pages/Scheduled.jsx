import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatScheduledDisplay } from '../utils/dateUtils';
import { 
  Clock, Ban, Calendar, Globe, Mail, MessageSquare, Smartphone, 
  CheckCircle, AlertCircle, RefreshCw, Trash2, Filter, Send, Play, 
  Eye, User, Sparkles, X, ChevronRight, Check
} from 'lucide-react';

export default function Scheduled() {
  const [scheduledList, setScheduledList] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [processingQueue, setProcessingQueue] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [showRawTemplate, setShowRawTemplate] = useState(false);
  const { success, error, info } = useToast();

  const loadScheduled = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Auto-process any due messages in queue
      try {
        await api.processScheduledQueue();
      } catch (e) {}

      const [res, contactsRes] = await Promise.all([
        api.getScheduledMessages(),
        api.getContacts({ limit: 100 }).catch(() => ({ contacts: [] }))
      ]);

      setScheduledList(res.scheduled || []);
      if (Array.isArray(contactsRes?.contacts)) {
        setContacts(contactsRes.contacts);
      }
    } catch (err) {
      if (!silent) error(err.message || 'Failed to load scheduled messages.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadScheduled();
    const interval = setInterval(() => loadScheduled(true), 15000); // 15s auto-refresh & check
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled message?')) return;
    try {
      await api.cancelScheduledMessage(id);
      success('Scheduled message cancelled.');
      loadScheduled();
    } catch (err) {
      error(err.message || 'Failed to cancel scheduled message.');
    }
  };

  const handleSendNow = async (id) => {
    if (!window.confirm('Are you sure you want to dispatch this scheduled message immediately now?')) return;
    setSendingId(id);
    try {
      const res = await api.sendScheduledNow(id);
      if (res.success) {
        success(`Dispatched immediately to ${res.successCount} recipient(s)!`, 'Message Sent');
      } else {
        error(res.error || 'Failed to send scheduled message.');
      }
      loadScheduled();
    } catch (err) {
      error(err.message || 'Failed to send scheduled message.');
    } finally {
      setSendingId(null);
    }
  };

  const handleProcessQueue = async () => {
    setProcessingQueue(true);
    try {
      const res = await api.processScheduledQueue();
      if (res.processed > 0) {
        success(`Processed and dispatched ${res.processed} due message(s) from queue!`, 'Queue Processed');
      } else {
        info('No messages currently due in queue. Messages will auto-dispatch when due time arrives.', 'Queue Active');
      }
      loadScheduled();
    } catch (err) {
      error(err.message || 'Failed to process queue.');
    } finally {
      setProcessingQueue(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this message from the queue?')) return;
    try {
      await api.deleteScheduledMessage(id);
      success('Scheduled message permanently deleted.');
      loadScheduled();
    } catch (err) {
      error(err.message || 'Failed to delete scheduled message.');
    }
  };

  const handleClearCancelled = async () => {
    const cancelledCount = scheduledList.filter(s => s.status === 'cancelled').length;
    if (!cancelledCount) return;
    if (!window.confirm(`Are you sure you want to delete all ${cancelledCount} cancelled message(s) from the queue?`)) return;
    try {
      const res = await api.clearCancelledScheduledMessages();
      success(res.message || 'Cleared all cancelled messages.');
      loadScheduled();
    } catch (err) {
      error(err.message || 'Failed to clear cancelled messages.');
    }
  };

  const scheduledCount = scheduledList.filter(s => s.status === 'scheduled').length;
  const cancelledCount = scheduledList.filter(s => s.status === 'cancelled').length;
  const completedCount = scheduledList.filter(s => s.status === 'completed').length;

  const resolveItemRecipients = (item, contactsList) => {
    let raw = [];
    try {
      raw = JSON.parse(item.recipients_json || '[]');
    } catch (e) {
      raw = [];
    }
    if (!Array.isArray(raw)) raw = [raw];

    return raw.map((entry, idx) => {
      if (typeof entry === 'object' && entry !== null) {
        return {
          id: entry.id !== undefined ? entry.id : -(idx + 1),
          name: entry.name || (entry.email ? entry.email.split('@')[0] : 'Recipient'),
          email: entry.email || '',
          phone: entry.phone || ''
        };
      }
      // Look up in contactsList by numeric or string ID
      const matched = contactsList.find(c => String(c.id) === String(entry));
      if (matched) {
        return {
          id: matched.id,
          name: matched.name || (matched.email ? matched.email.split('@')[0] : 'Recipient'),
          email: matched.email || '',
          phone: matched.phone || ''
        };
      }
      // If string looks like email
      if (typeof entry === 'string' && entry.includes('@')) {
        const prefix = entry.split('@')[0].replace(/[._-]/g, ' ');
        return {
          id: null,
          name: prefix.replace(/\b\w/g, c => c.toUpperCase()),
          email: entry,
          phone: ''
        };
      }
      return { id: entry, name: `Contact #${entry}`, email: '', phone: '' };
    });
  };

  const getRenderedPreview = (text, primaryRecipient) => {
    if (!text) return '';
    const name = primaryRecipient?.name || 'Recipient';
    return text
      .replace(/\{\{\s*name\s*\}\}/gi, name)
      .replace(/\{\{\s*first_name\s*\}\}/gi, name)
      .replace(/\{\{\s*firstname\s*\}\}/gi, name);
  };

  const filteredList = scheduledList.filter(item => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-500" />
            <span>Scheduled Message Queue</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated messages awaiting due trigger time. Checked every 15 seconds by background scheduler with timezone awareness.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {cancelledCount > 0 && (
            <button
              type="button"
              onClick={handleClearCancelled}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold shadow-sm transition-colors cursor-pointer btn-danger-hover btn-lift"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cancelled ({cancelledCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleProcessQueue}
            disabled={processingQueue}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50 btn-lift"
            title="Force-check and process due messages immediately"
          >
            <Play className={`w-3.5 h-3.5 ${processingQueue ? 'animate-spin' : ''}`} />
            <span>{processingQueue ? 'Checking...' : 'Run Queue Now'}</span>
          </button>

          <button
            type="button"
            onClick={loadScheduled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-sm transition-colors cursor-pointer btn-spin-hover btn-lift"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Messages ({scheduledList.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('scheduled')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            filterStatus === 'scheduled'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-3 h-3 text-amber-500" />
          <span>Scheduled ({scheduledCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('cancelled')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            filterStatus === 'cancelled'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Ban className="w-3 h-3 text-rose-500" />
          <span>Cancelled ({cancelledCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('completed')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            filterStatus === 'completed'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CheckCircle className="w-3 h-3 text-emerald-500" />
          <span>Completed ({completedCount})</span>
        </button>
      </div>

      {/* Scheduled Queue Cards / Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Target Channel</th>
                <th className="px-6 py-3.5">Message Content</th>
                <th className="px-6 py-3.5">Scheduled Dispatch Time</th>
                <th className="px-6 py-3.5">Recipients</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredList.map(item => {
                const recipients = resolveItemRecipients(item, contacts);
                const primaryRecipient = recipients[0] || null;
                const otherRecipientsCount = recipients.length > 1 ? recipients.length - 1 : 0;
                const renderedSubject = getRenderedPreview(item.subject, primaryRecipient);
                const renderedBody = getRenderedPreview(item.body, primaryRecipient);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Channel */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-semibold capitalize">
                        {item.channel === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
                        {item.channel === 'whatsapp' && <MessageSquare className="w-4 h-4 text-emerald-500" />}
                        {item.channel === 'sms' && <Smartphone className="w-4 h-4 text-purple-500" />}
                        <span>{item.channel}</span>
                      </div>
                    </td>

                    {/* Message Preview */}
                    <td className="px-6 py-4 max-w-sm">
                      {item.subject && (
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {renderedSubject}
                        </p>
                      )}
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                        {renderedBody}
                      </p>
                      {primaryRecipient?.name && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                          <Check className="w-3 h-3 shrink-0" />
                          <span>Personalized for <strong>{primaryRecipient.name}</strong></span>
                        </div>
                      )}
                    </td>

                    {/* Scheduled Time */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span>{formatScheduledDisplay(item.scheduled_time, item.timezone)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Globe className="w-3 h-3" />
                        <span>{item.timezone || 'Local'}</span>
                      </div>
                    </td>

                    {/* Recipients */}
                    <td className="px-6 py-4">
                      {primaryRecipient ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                            {primaryRecipient.name ? primaryRecipient.name.charAt(0).toUpperCase() : 'R'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                              {primaryRecipient.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                              {primaryRecipient.email || primaryRecipient.phone || 'N/A'}
                            </p>
                            {otherRecipientsCount > 0 && (
                              <span className="inline-block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                                +{otherRecipientsCount} other recipient{otherRecipientsCount > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="font-medium text-slate-400 text-xs">
                          No recipients
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {item.status === 'scheduled' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" /> Scheduled
                        </span>
                      )}
                      {item.status === 'processing' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1 w-fit">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Dispatching...
                        </span>
                      )}
                      {item.status === 'completed' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" /> Completed
                        </span>
                      )}
                      {item.status === 'cancelled' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center gap-1 w-fit">
                          <Ban className="w-3 h-3" /> Cancelled
                        </span>
                      )}
                      {item.status === 'failed' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1 w-fit">
                          <AlertCircle className="w-3 h-3" /> Failed
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setViewingItem(item);
                            setShowRawTemplate(false);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer btn-lift"
                          title="View Message Preview & Personalized Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Preview</span>
                        </button>

                        {item.status === 'scheduled' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSendNow(item.id)}
                              disabled={sendingId === item.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 btn-lift btn-send-hover"
                              title="Send immediately now without waiting"
                            >
                              <Send className={`w-3 h-3 ${sendingId === item.id ? 'animate-spin' : ''}`} />
                              <span>{sendingId === item.id ? 'Sending...' : 'Send Now'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCancel(item.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 text-xs font-semibold transition-colors cursor-pointer btn-lift"
                              title="Cancel scheduled dispatch"
                            >
                              <Ban className="w-3 h-3" />
                              <span>Cancel</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="inline-flex items-center p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer btn-lift btn-danger-hover"
                              title="Delete from queue"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors cursor-pointer btn-lift btn-danger-hover"
                            title="Delete this message from queue"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredList.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No {filterStatus !== 'all' ? filterStatus : ''} scheduled messages in the queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Message Inspection Modal */}
      {viewingItem && (() => {
        const itemRecipients = resolveItemRecipients(viewingItem, contacts);
        const itemPrimary = itemRecipients[0] || null;
        const personalizedSubject = getRenderedPreview(viewingItem.subject, itemPrimary);
        const personalizedBody = getRenderedPreview(viewingItem.body, itemPrimary);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
              className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                    {viewingItem.channel === 'email' && <Mail className="w-5 h-5" />}
                    {viewingItem.channel === 'whatsapp' && <MessageSquare className="w-5 h-5" />}
                    {viewingItem.channel === 'sms' && <Smartphone className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white text-sm">
                      Scheduled Message Preview & Details
                    </h2>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {viewingItem.channel} Channel • {viewingItem.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setViewingItem(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                {/* Recipient Card */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Target Recipient
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200 font-semibold text-[10px]">
                      {itemRecipients.length} Recipient{itemRecipients.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {itemRecipients.map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                            {r.name ? r.name.charAt(0).toUpperCase() : 'R'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">{r.name}</span>
                            <span className="text-[11px] text-slate-400 block font-mono">{r.email || r.phone || 'N/A'}</span>
                          </div>
                        </div>
                        {i === 0 && (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dispatch Timing Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Scheduled Time</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <span>{formatScheduledDisplay(viewingItem.scheduled_time, viewingItem.timezone)}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Target Timezone</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <Globe className="w-4 h-4 text-indigo-500" />
                      <span>{viewingItem.timezone || 'Local Time'}</span>
                    </div>
                  </div>
                </div>

                {/* Subject Preview */}
                {viewingItem.subject && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Subject</span>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                      {showRawTemplate ? viewingItem.subject : personalizedSubject}
                    </div>
                  </div>
                )}

                {/* Message Body Preview */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Message Body</span>
                    <button
                      type="button"
                      onClick={() => setShowRawTemplate(!showRawTemplate)}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      {showRawTemplate ? 'Show Personalized View' : 'Show Raw Template with {{tags}}'}
                    </button>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-sans whitespace-pre-wrap leading-relaxed">
                    {showRawTemplate ? viewingItem.body : personalizedBody}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewingItem(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer text-xs"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {viewingItem.status === 'scheduled' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const id = viewingItem.id;
                          setViewingItem(null);
                          handleSendNow(id);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 text-xs transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Now</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const id = viewingItem.id;
                          setViewingItem(null);
                          handleCancel(id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs transition-colors cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const id = viewingItem.id;
                      setViewingItem(null);
                      handleDelete(id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
