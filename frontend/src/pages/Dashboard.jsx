import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Users,
  Send,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Wand2,
  Mail,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  FlaskConical,
  RefreshCw
} from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    api.getDashboardStats()
      .then(res => setData(res))
      .catch(err => console.error('Failed to load stats:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = data?.stats || {
    totalContacts: 0,
    messagesSent: 0,
    scheduledMessages: 0,
    failedMessages: 0
  };

  const channels = data?.channels || { email: 0, whatsapp: 0, sms: 0 };
  const totalChannelMsgs = (channels.email + channels.whatsapp + channels.sms) || 1;

  const emailPct = Math.round((channels.email / totalChannelMsgs) * 100);
  const waPct = Math.round((channels.whatsapp / totalChannelMsgs) * 100);
  const smsPct = Math.round((channels.sms / totalChannelMsgs) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Welcome & Workflow Engine Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 border border-indigo-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 backdrop-blur-md border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>SmartSend Multi-Channel Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Message Generator & Automated Sender
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
              Describe who you want to reach, let AI draft personalized copy with contact tags, verify in channel-accurate simulators, and dispatch instantly or on schedule.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/generator"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-900 font-bold text-xs sm:text-sm shadow-lg hover:bg-indigo-50 active:scale-95 transition-all"
            >
              <Wand2 className="w-4 h-4 text-indigo-600" />
              <span>Create AI Message</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 3-Step Flow Pills */}
        <div className="relative z-10 mt-8 pt-6 border-t border-indigo-700/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/5 backdrop-blur-sm">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/40 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0">
              1
            </div>
            <div>
              <p className="font-bold text-white">Generate Copy</p>
              <p className="text-[11px] text-indigo-200/70">Prompt-driven LLM synthesis</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/5 backdrop-blur-sm">
            <div className="w-7 h-7 rounded-xl bg-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
              2
            </div>
            <div>
              <p className="font-bold text-white">Personalize & Preview</p>
              <p className="text-[11px] text-indigo-200/70">Dynamic contact variables & UI</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/5 backdrop-blur-sm">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
              3
            </div>
            <div>
              <p className="font-bold text-white">Send Multi-Channel</p>
              <p className="text-[11px] text-indigo-200/70">Email, WhatsApp & SMS</p>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Contacts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Contacts</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {stats.totalContacts}
            </h3>
            <Link to="/contacts" className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5 mt-1">
              <span>View Contacts</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Messages Sent */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Messages Sent</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {stats.messagesSent}
            </h3>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Delivered
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Send className="w-6 h-6" />
          </div>
        </div>

        {/* Scheduled Messages */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Scheduled Queue</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {stats.scheduledMessages}
            </h3>
            <Link to="/scheduled" className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-0.5 mt-1">
              <span>View Queue</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Failed Messages */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Failed / Bounced</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {stats.failedMessages}
            </h3>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {stats.failedMessages === 0 ? 'Zero delivery issues' : 'Inspect in history logs'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Grid: Multi-Channel Distribution & Active Cohorts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Multi-Channel Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Channel Distribution</h3>
              <p className="text-xs text-slate-400">Delivery volume across channels</p>
            </div>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>

          {/* Visual Progress Bar */}
          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
            <div style={{ width: `${emailPct}%` }} className="bg-blue-500 h-full" title={`Email: ${emailPct}%`}></div>
            <div style={{ width: `${waPct}%` }} className="bg-emerald-500 h-full" title={`WhatsApp: ${waPct}%`}></div>
            <div style={{ width: `${smsPct}%` }} className="bg-purple-500 h-full" title={`SMS: ${smsPct}%`}></div>
          </div>

          {/* Legend Details */}
          <div className="space-y-2 pt-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Email</span>
              </div>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {channels.email} ({emailPct}%)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">WhatsApp</span>
              </div>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {channels.whatsapp} ({waPct}%)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <Smartphone className="w-3.5 h-3.5 text-purple-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">SMS</span>
              </div>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {channels.sms} ({smsPct}%)
              </span>
            </div>
          </div>
        </div>

        {/* Contact Cohorts / Groups */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Contact Cohorts</h3>
              <p className="text-xs text-slate-400">Target groups configured for automated messaging</p>
            </div>
            <Link to="/contacts" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Manage Groups
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {data?.groupSummary?.map(g => (
              <div key={g.id} className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: g.color || '#6366F1' }}
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{g.name}</h4>
                    <p className="text-[11px] text-slate-400">{g.contact_count} enrolled recipients</p>
                  </div>
                </div>
                <Link
                  to={`/generator?group=${g.id}`}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] hover:bg-indigo-100 transition-colors"
                >
                  Send To
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity Stream</h3>
            <p className="text-xs text-slate-400">Live delivery and dispatch events</p>
          </div>
          <Link to="/history" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1">
            <span>View Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {data?.recentActivities?.map(act => (
            <div key={act.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start sm:items-center gap-3">
                <div className="mt-0.5 sm:mt-0">
                  {act.status === 'Sent' || act.status === 'delivered' ? (
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-xs font-bold">✓</span>
                  ) : act.status === 'Demo Sent' ? (
                    <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center text-xs font-bold">🧪</span>
                  ) : act.status === 'scheduled' ? (
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center text-xs font-bold">⏱</span>
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center text-xs font-bold">⚠</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {act.rendered_subject || `Message to ${act.contact_name}`}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate max-w-md">
                    To: <strong className="text-slate-600 dark:text-slate-300">{act.contact_name}</strong> • Channel: <span className="capitalize">{act.channel}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {act.is_demo === 1 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Demo
                  </span>
                )}
                <span className="text-[11px] text-slate-400">
                  {act.delivery_timestamp ? new Date(act.delivery_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
              </div>
            </div>
          ))}

          {(!data?.recentActivities || data.recentActivities.length === 0) && (
            <div className="py-8 text-center text-slate-400 italic">
              No recent message dispatches recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

