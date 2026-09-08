import React from 'react';
import { Mail, ArrowRight, ShieldCheck, CornerUpLeft } from 'lucide-react';

export default function EmailPreview({
  contactName = 'Student Contact',
  contactEmail = 'student@example.edu',
  subject = '',
  body = '',
  cta = 'Confirm Attendance'
}) {
  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden select-none">
      {/* Email Client Header Bar */}
      <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-2 flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-indigo-500" />
            Webmail Client Preview
          </span>
        </div>
        <span className="text-[10px] text-slate-400">Desktop & Mobile Responsive</span>
      </div>

      {/* Email Headers Meta */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-start justify-between text-xs">
          <div className="space-y-1 flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400 text-[11px] w-12 shrink-0">From:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                SmartSend AI &lt;notifications@smartsend.ai&gt;
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400 text-[11px] w-12 shrink-0">To:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                {contactName} &lt;{contactEmail}&gt;
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 shrink-0">Today, 10:00 AM</span>
        </div>

        {/* Subject Line */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
            {subject || 'Untitled Message Subject'}
          </h3>
        </div>
      </div>

      {/* Email Content Frame */}
      <div className="p-6 bg-white dark:bg-slate-950 min-h-[300px] flex flex-col justify-between">
        <div className="space-y-4">
          {/* Email Body text */}
          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line break-words">
            {body || 'Write or generate message content to preview...'}
          </div>

          {/* Primary Action Button (Call-To-Action) */}
          {cta && (
            <div className="pt-4 pb-2">
              <div className="inline-block">
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all pointer-events-none"
                >
                  <span>{cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Professional Email Signature */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sent securely via SmartSend Multi-Channel Platform</span>
          </div>
          <span className="hover:underline cursor-pointer">Unsubscribe</span>
        </div>
      </div>
    </div>
  );
}

