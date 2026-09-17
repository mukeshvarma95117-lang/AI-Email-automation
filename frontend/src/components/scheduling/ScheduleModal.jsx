import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Calendar, Globe, X, Check, AlertTriangle, Sparkles, Timer } from 'lucide-react';
import { parseToUtc } from '../../utils/dateUtils';

export default function ScheduleModal({
  isOpen,
  onClose,
  onSchedule,
  recipientCount = 0,
  channel = 'email',
  isScheduling = false
}) {
  const systemTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  const [timezone, setTimezone] = useState(systemTz);

  // Helper to format date as YYYY-MM-DD
  const formatDateStr = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to get local time components (defaults to 15 minutes ahead)
  const getInitialState = () => {
    const now = new Date();
    const target = new Date(now.getTime() + 15 * 60 * 1000);
    let hours = target.getHours();
    const minutes = Math.ceil(target.getMinutes() / 5) * 5;
    if (minutes >= 60) {
      target.setHours(hours + 1);
      target.setMinutes(0);
      hours = target.getHours();
    } else {
      target.setMinutes(minutes);
    }
    const ampmVal = hours >= 12 ? 'PM' : 'AM';
    let hour12 = hours % 12;
    if (hour12 === 0) hour12 = 12;

    return {
      date: formatDateStr(target),
      hour: String(hour12),
      minute: String(target.getMinutes()).padStart(2, '0'),
      ampm: ampmVal
    };
  };

  const [date, setDate] = useState(() => getInitialState().date);
  const [hour, setHour] = useState(() => getInitialState().hour);
  const [minute, setMinute] = useState(() => getInitialState().minute);
  const [ampm, setAmpm] = useState(() => getInitialState().ampm);

  // Reset to 15 minutes in future whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const init = getInitialState();
      setDate(init.date);
      setHour(init.hour);
      setMinute(init.minute);
      setAmpm(init.ampm);
      setTimezone(systemTz);
    }
  }, [isOpen, systemTz]);

  // Convert 12h to 24h format for ISO construction
  const time24 = useMemo(() => {
    let h = parseInt(hour, 10) || 12;
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }, [hour, minute, ampm]);

  // Compute scheduled target UTC Date and check validity
  const { utcDate, diffMinutes, isPast, scheduledDateTimeStr } = useMemo(() => {
    if (!date || !time24) return { utcDate: null, diffMinutes: 0, isPast: true, scheduledDateTimeStr: '' };
    const str = `${date}T${time24}:00`;
    try {
      const utcIso = parseToUtc(str, timezone);
      const targetUtc = new Date(utcIso);
      const now = new Date();
      const diffMs = targetUtc.getTime() - now.getTime();
      const mins = Math.round(diffMs / 60000);
      return {
        utcDate: targetUtc,
        diffMinutes: mins,
        isPast: mins < 1, // Must be at least 1 min in future
        scheduledDateTimeStr: str
      };
    } catch (e) {
      return { utcDate: null, diffMinutes: 0, isPast: true, scheduledDateTimeStr: str };
    }
  }, [date, time24, timezone]);

  if (!isOpen) return null;

  // Preset handlers
  const applyPresetMinutes = (mins) => {
    const target = new Date(Date.now() + mins * 60 * 1000);
    setDate(formatDateStr(target));
    let h = target.getHours();
    const ampmVal = h >= 12 ? 'PM' : 'AM';
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    setHour(String(h12));
    setMinute(String(target.getMinutes()).padStart(2, '0'));
    setAmpm(ampmVal);
  };

  const applyPresetTomorrow = (targetHour, targetAmpm) => {
    const target = new Date();
    target.setDate(target.getDate() + 1);
    setDate(formatDateStr(target));
    setHour(String(targetHour));
    setMinute('00');
    setAmpm(targetAmpm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isPast || !utcDate) return;
    onSchedule({
      scheduledDateTime: scheduledDateTimeStr,
      utcScheduledTime: utcDate.toISOString(),
      timezone
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Schedule Automated Dispatch</span>
          </div>
          <button
            onClick={onClose}
            disabled={isScheduling}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Dispatch Target Banner */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-slate-700 dark:text-slate-200 flex items-center justify-between">
            <div>
              <span>Scheduled dispatch to </span>
              <strong className="text-indigo-600 dark:text-indigo-400">{recipientCount} recipient{recipientCount !== 1 ? 's' : ''}</strong>
              <span> across </span>
              <strong className="capitalize">{channel}</strong>.
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
              Auto-Queue
            </span>
          </div>

          {/* Quick Schedule Shortcuts */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-600 dark:text-slate-300 text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Quick Presets</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPresetMinutes(5)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 text-slate-700 dark:text-slate-300 font-medium transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                +5 Mins
              </button>
              <button
                type="button"
                onClick={() => applyPresetMinutes(15)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 text-slate-700 dark:text-slate-300 font-medium transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                +15 Mins
              </button>
              <button
                type="button"
                onClick={() => applyPresetMinutes(30)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 text-slate-700 dark:text-slate-300 font-medium transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                +30 Mins
              </button>
              <button
                type="button"
                onClick={() => applyPresetMinutes(60)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 text-slate-700 dark:text-slate-300 font-medium transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                +1 Hour
              </button>
              <button
                type="button"
                onClick={() => applyPresetTomorrow(9, 'AM')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 text-slate-700 dark:text-slate-300 font-medium transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                Tomorrow 9:00 AM
              </button>
              <button
                type="button"
                onClick={() => applyPresetTomorrow(2, 'PM')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 text-slate-700 dark:text-slate-300 font-medium transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                Tomorrow 2:00 PM
              </button>
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>Dispatch Date</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                {date === formatDateStr(new Date()) ? 'Today' : date === formatDateStr(new Date(Date.now() + 86400000)) ? 'Tomorrow' : ''}
              </span>
            </label>
            <input
              type="date"
              required
              value={date}
              min={formatDateStr(new Date())}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* 12-Hour Dispatch Time with AM/PM Toggle */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Dispatch Time (12-Hour)</span>
              </span>
              <span className="text-[10px] text-indigo-500 font-semibold">
                {hour}:{minute} {ampm}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2 items-center">
              {/* Hour Dropdown */}
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400">Hour</span>
                <select
                  value={hour}
                  onChange={e => setHour(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(h => (
                    <option key={h} value={String(h)}>{String(h).padStart(2, '0')}</option>
                  ))}
                </select>
              </div>

              {/* Minute Dropdown */}
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400">Minute</span>
                <select
                  value={minute}
                  onChange={e => setMinute(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {['00', '05', '10', '15', '20', '25', '30', '35', '40', '41', '42', '45', '50', '55'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* AM / PM Segmented Control */}
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400">AM / PM</span>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setAmpm('AM')}
                    className={`flex-1 py-1.5 rounded-lg font-extrabold text-xs transition-all cursor-pointer ${
                      ampm === 'AM'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmpm('PM')}
                    className={`flex-1 py-1.5 rounded-lg font-extrabold text-xs transition-all cursor-pointer ${
                      ampm === 'PM'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>Timezone</span>
            </label>
            <select
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST — UTC+5:30)</option>
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="America/New_York">America/New_York (EST / EDT)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST / PDT)</option>
              <option value="Europe/London">Europe/London (GMT / BST)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST — UTC+4)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT — UTC+8)</option>
            </select>
          </div>

          {/* Live Preview & Past-Time Safety Alert */}
          {isPast ? (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs">Selected Time is in the Past!</p>
                <p className="text-[11px] text-rose-800 dark:text-rose-300 mt-0.5 leading-relaxed">
                  You selected <strong>{hour}:{minute} {ampm}</strong>. Did you mean <strong>{hour}:{minute} {ampm === 'AM' ? 'PM' : 'Tomorrow'}</strong>?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (ampm === 'AM') setAmpm('PM');
                    else applyPresetMinutes(15);
                  }}
                  className="mt-2 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[10px] cursor-pointer"
                >
                  Fix: Switch to {ampm === 'AM' ? `${hour}:${minute} PM` : 'Next 15 Mins'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold text-xs">
                    Dispatches in {diffMinutes < 60 ? `${diffMinutes} minutes` : `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m`}
                  </span>
                  <p className="text-[10px] text-emerald-800 dark:text-emerald-300">
                    Exact: {date} at {hour}:{minute} {ampm} ({timezone.split('/')[1] || timezone})
                  </p>
                </div>
              </div>
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          )}

          {/* Modal Footer */}
          <div className="px-6 py-4 -mx-6 -mb-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isScheduling}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isScheduling || isPast}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isScheduling ? 'Scheduling...' : 'Set Scheduled Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
