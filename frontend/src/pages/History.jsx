import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Mail,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FlaskConical,
  X,
  ExternalLink,
  RefreshCw,
  Trash2,
  Settings as SettingsIcon
} from 'lucide-react';

export default function History() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const { success, error } = useToast();

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getDeliveryLogs({
        channel: selectedChannel,
        status: selectedStatus,
        search: searchQuery,
        limit: 100
      });
      setLogs(res.logs || []);
      setTotal(res.total || 0);
    } catch (err) {
      error(err.message || 'Failed to load delivery history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedChannel, selectedStatus, searchQuery]);

  const handleDeleteLog = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this delivery record?')) return;
    setDeletingId(id);
    try {
      await api.deleteDeliveryLog(id);
      success('Delivery log record deleted.');
      if (selectedLog?.id === id) {
        setSelectedLog(null);
      }
      setLogs(prev => prev.filter(l => l.id !== id));
      setTotal(prev => Math.max(0, prev - 1));
    } catch (err) {
      error(err.message || 'Failed to delete delivery record.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearHistory = async () => {
    if (logs.length === 0) return;
    const isFiltered = selectedChannel !== 'all' || selectedStatus !== 'all';
    const msg = isFiltered
      ? `Are you sure you want to permanently delete all filtered delivery records?`
      : `Are you sure you want to permanently clear your entire delivery history? (${total} records)`;

    if (!window.confirm(msg)) return;
    setClearing(true);
    try {
      await api.clearDeliveryLogs({
        channel: selectedChannel,
        status: selectedStatus
      });
      success('Delivery history cleared successfully.');
      setSelectedLog(null);
      loadLogs();
    } catch (err) {
      error(err.message || 'Failed to clear delivery history.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Multi-Channel Delivery History</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit trail of all message dispatches across Email, WhatsApp, and SMS with recipient variables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              disabled={clearing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50 btn-danger-hover btn-lift"
            >
              <Trash2 className={`w-3.5 h-3.5 ${clearing ? 'animate-spin' : ''}`} />
              <span>{clearing ? 'Clearing...' : 'Clear History'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={loadLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-sm transition-colors cursor-pointer btn-spin-hover btn-lift"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Channel Filter */}
          <select
            value={selectedChannel}
            onChange={e => setSelectedChannel(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="all">All Channels</option>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="sms">SMS</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Sent">Sent (Delivered)</option>
            <option value="Demo Sent">Demo Sent</option>
            <option value="Failed">Failed / Bounced</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search recipient or content..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* History Data Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Recipient</th>
                <th className="px-6 py-3.5">Channel</th>
                <th className="px-6 py-3.5">Rendered Message</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Date & Time</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Recipient */}
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {log.contact_name || 'Direct Recipient'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {log.contact_target}
                    </p>
                  </td>

                  {/* Channel */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-semibold capitalize">
                      {log.channel === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
                      {log.channel === 'whatsapp' && <MessageSquare className="w-4 h-4 text-emerald-500" />}
                      {log.channel === 'sms' && <Smartphone className="w-4 h-4 text-purple-500" />}
                      <span>{log.channel}</span>
                    </div>
                  </td>

                  {/* Rendered Message Preview */}
                  <td className="px-6 py-4 max-w-xs">
                    {log.rendered_subject && (
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {log.rendered_subject}
                      </p>
                    )}
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                      {log.rendered_body}
                    </p>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {log.status === 'Sent' || log.status === 'delivered' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Delivered
                        </span>
                      ) : log.status === 'Demo Sent' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                          <FlaskConical className="w-3 h-3 text-amber-500" /> Demo Sent
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-500" /> {log.status}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Timestamp */}
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                    {new Date(log.delivery_timestamp).toLocaleString()}
                  </td>

                  {/* Actions: Inspect & Delete */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer btn-lift"
                      >
                        Inspect
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteLog(log.id, e)}
                        disabled={deletingId === log.id}
                        className="p-1.5 rounded-lg border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/60 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer disabled:opacity-50 btn-lift btn-danger-hover"
                        title="Delete Record"
                      >
                        <Trash2 className={`w-3.5 h-3.5 ${deletingId === log.id ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No delivery records found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <span>Delivery Receipt & Log Details</span>
                <span className="text-[10px] font-mono text-slate-400">#{selectedLog.id}</span>
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span className="text-slate-400 text-[11px]">Recipient:</span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedLog.contact_name}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Destination:</span>
                  <p className="font-mono text-slate-800 dark:text-slate-200">{selectedLog.contact_target}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Channel & Mode:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">{selectedLog.channel}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      selectedLog.is_demo === 1
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {selectedLog.is_demo === 1 ? 'Demo Mode' : 'Live Delivery'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Delivery Result:</span>
                  <p className={`font-semibold ${selectedLog.status === 'Sent' || selectedLog.status === 'delivered' ? 'text-emerald-600 dark:text-emerald-400' : selectedLog.status === 'Demo Sent' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {selectedLog.status}
                  </p>
                </div>
              </div>

              {selectedLog.rendered_subject && (
                <div className="space-y-1">
                  <span className="font-semibold text-slate-400 text-[11px]">Rendered Subject:</span>
                  <p className="font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                    {selectedLog.rendered_subject}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <span className="font-semibold text-slate-400 text-[11px]">Rendered Message Body:</span>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl font-sans leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200">
                  {selectedLog.rendered_body}
                </div>
              </div>

              {selectedLog.error_message && (
                <div className={`p-3.5 rounded-xl border text-[11px] ${
                  selectedLog.status === 'Sent' || selectedLog.status === 'delivered'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-mono'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 space-y-2'
                }`}>
                  <div>
                    <span className="font-semibold">
                      {selectedLog.status === 'Sent' || selectedLog.status === 'delivered' ? 'Dispatch Reference: ' : 'Diagnostics: '}
                    </span>
                    {selectedLog.error_message}
                  </div>
                  {selectedLog.error_message.toLowerCase().includes('smtp') && (
                    <div className="pt-2 border-t border-rose-200/80 dark:border-rose-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-[10px] text-rose-700 dark:text-rose-300">
                        Check your provider credentials in Settings:
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate('/settings')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[10px] shadow-sm flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                      >
                        <SettingsIcon className="w-3 h-3" />
                        <span>Open Settings</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDeleteLog(selectedLog.id)}
                disabled={deletingId === selectedLog.id}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200/60 dark:border-rose-900/40 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
