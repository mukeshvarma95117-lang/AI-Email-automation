import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Clock, Ban, Calendar, Globe, Mail, MessageSquare, Smartphone, CheckCircle, AlertCircle, RefreshCw, Trash2, Filter, Send, Play } from 'lucide-react';

export default function Scheduled() {
  const [scheduledList, setScheduledList] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [processingQueue, setProcessingQueue] = useState(false);
  const { success, error, info } = useToast();

  const loadScheduled = async () => {
    setLoading(true);
    try {
      const res = await api.getScheduledMessages();
      setScheduledList(res.scheduled || []);
    } catch (err) {
      error(err.message || 'Failed to load scheduled messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScheduled();
    const interval = setInterval(loadScheduled, 15000); // 15s auto-refresh
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
                let recipientCount = 0;
                try {
                  const arr = JSON.parse(item.recipients_json || '[]');
                  recipientCount = arr.length;
                } catch (e) {
                  recipientCount = 0;
                }

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
                          {item.subject}
                        </p>
                      )}
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                        {item.body}
                      </p>
                    </td>

                    {/* Scheduled Time */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span>{new Date(item.scheduled_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Globe className="w-3 h-3" />
                        <span>{item.timezone || 'Local'}</span>
                      </div>
                    </td>

                    {/* Recipients Count */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {recipientCount} recipients
                      </span>
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
    </div>
  );
}
