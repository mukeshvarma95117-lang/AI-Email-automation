import React from 'react';
import { Tag, Sparkles } from 'lucide-react';

const COMMON_VARS = [
  { tag: '{{name}}', label: 'Name', desc: 'Recipient Name' },
  { tag: '{{event}}', label: 'Event', desc: 'Event / Workshop Name' },
  { tag: '{{date}}', label: 'Date', desc: 'Event Date' },
  { tag: '{{time}}', label: 'Time', desc: 'Start Time' },
  { tag: '{{location}}', label: 'Location', desc: 'Room or Link' },
  { tag: '{{student_id}}', label: 'Student ID', desc: 'Custom Field' }
];

export default function VariablePills({ onInsertVariable }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-2 pb-1">
      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
        <Tag className="w-3 h-3 text-indigo-500" />
        <span>Insert Variable:</span>
      </div>
      {COMMON_VARS.map((v) => (
        <button
          key={v.tag}
          type="button"
          onClick={() => onInsertVariable(v.tag)}
          title={`Insert ${v.desc}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all active:scale-95"
        >
          <span className="text-indigo-500 font-bold">{v.tag}</span>
        </button>
      ))}
    </div>
  );
}

