import React from 'react';
import { Smartphone, Signal, Wifi, BatteryMedium, Send } from 'lucide-react';

export default function SmsPreview({ contactName = 'Student Contact', contactPhone = '+1 555-0192', text = '' }) {
  const charCount = text ? text.length : 0;
  const segments = Math.ceil(charCount / 160) || 1;

  return (
    <div className="w-full max-w-sm mx-auto rounded-[36px] p-3 bg-slate-900 shadow-2xl border-4 border-slate-700/80 select-none overflow-hidden">
      {/* Smartphone Speaker cutout */}
      <div className="flex justify-center mb-1">
        <div className="w-24 h-4 bg-black rounded-full flex items-center justify-end px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
        </div>
      </div>

      {/* Screen container */}
      <div className="rounded-[28px] overflow-hidden bg-white dark:bg-slate-950 flex flex-col h-[520px] shadow-inner relative border border-slate-200 dark:border-slate-800">
        {/* iOS / Phone Status Bar */}
        <div className="px-5 py-2 flex items-center justify-between text-[11px] font-semibold text-slate-800 dark:text-slate-200 shrink-0">
          <span>9:41</span>
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <BatteryMedium className="w-4 h-4" />
          </div>
        </div>

        {/* SMS Header */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center text-center shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs mb-1 shadow-md">
            {contactName.charAt(0).toUpperCase()}
          </div>
          <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
            {contactName}
          </h4>
          <p className="text-[10px] text-slate-400 font-mono">{contactPhone}</p>
        </div>

        {/* SMS Chat Body */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-end space-y-3">
          <div className="flex justify-center">
            <span className="text-[10px] text-slate-400 font-medium">Text Message • Today 10:00 AM</span>
          </div>

          {/* Incoming message bubble */}
          <div className="self-end max-w-[85%] bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-xs px-3.5 py-2.5 shadow-md text-xs leading-relaxed break-words whitespace-pre-line">
            {text || 'Write or generate SMS text to preview...'}
          </div>

          <div className="self-end text-[10px] text-slate-400 px-1">
            Delivered
          </div>
        </div>

        {/* Character & Segment Meter Footer */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono px-1">
            <span>Length: {charCount} chars</span>
            <span className={`px-2 py-0.5 rounded-full font-semibold ${
              charCount > 160 ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'bg-slate-200 dark:bg-slate-800'
            }`}>
              {segments} {segments === 1 ? 'SMS Segment' : 'SMS Segments'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 bg-white dark:bg-slate-950 rounded-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            <span className="flex-1 text-slate-400">iMessage</span>
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <Send className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

