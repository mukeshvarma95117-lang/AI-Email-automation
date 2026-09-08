import React from 'react';
import { AlertTriangle, Send, X, ShieldAlert, CheckCircle2, Settings, ArrowRight } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  recipientCount = 0,
  channel = 'email',
  unresolvedVariables = [],
  missingTargets = 0,
  isSending = false,
  isDemo = false,
  isSmtpConfigured = true,
  onSwitchToDemo,
  onOpenSettings
}) {
  if (!isOpen) return null;

  const isLargeList = recipientCount > 50;
  const isSmtpBlocked = channel === 'email' && !isDemo && !isSmtpConfigured;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
            <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>AI Safety & Dispatch Review</span>
          </div>
          <button
            onClick={onClose}
            disabled={isSending}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Live vs Demo Dispatch Badge */}
          {isDemo ? (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5">
                <span>🧪 Demo Simulation Mode</span>
              </span>
              <span className="text-[10px] bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full font-bold">
                Simulation Only
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>⚡ Live Delivery Mode</span>
              </span>
              <span className="text-[10px] bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                Real Outgoing SMTP
              </span>
            </div>
          )}

          {/* SMTP App Password Required Warning */}
          {isSmtpBlocked && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>SMTP Password Not Configured</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                Live email delivery requires your 16-character Google App Password in Settings. Sending now in Live Mode will fail.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] shadow-sm flex items-center gap-1 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Enter Password in Settings</span>
                  </button>
                )}
                {onSwitchToDemo && (
                  <button
                    type="button"
                    onClick={onSwitchToDemo}
                    className="px-3 py-1.5 rounded-lg border border-amber-400 dark:border-amber-600 bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 font-semibold text-[11px] hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Switch to Demo Mode
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Main confirmation message */}
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow">
              {recipientCount}
            </div>
            <div>
              <h4 className="font-semibold text-indigo-950 dark:text-indigo-200 text-sm mb-0.5">
                {isDemo ? 'Simulation Confirmation' : 'Real Email Dispatch Confirmation'}
              </h4>
              <p className="text-slate-600 dark:text-slate-300">
                You are about to send this message to <strong className="text-indigo-600 dark:text-indigo-400">{recipientCount} recipient{recipientCount !== 1 ? 's' : ''}</strong> via <strong className="capitalize">{channel}</strong>.
              </p>
            </div>
          </div>

          {/* Unresolved Variables Warning */}
          {unresolvedVariables.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Unresolved Template Variables</p>
                <p className="text-[11px] leading-relaxed">
                  The message contains placeholders that could not be matched for some contacts:
                </p>
                <div className="flex flex-wrap gap-1 mt-1.5 font-mono text-[10px]">
                  {unresolvedVariables.map(v => (
                    <span key={v} className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Missing contact targets warning */}
          {missingTargets > 0 && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-200 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <p className="text-[11px]">
                <strong>{missingTargets} contact{missingTargets !== 1 ? 's lack' : ' lacks'}</strong> a valid {channel === 'email' ? 'email address' : 'phone number'} and will be skipped.
              </p>
            </div>
          )}

          {/* Large list warning */}
          {isLargeList && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-200 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <p className="text-[11px]">
                High-volume recipient batch (&gt;50). Rate limiting and throttled dispatch applied automatically.
              </p>
            </div>
          )}

          <div className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
            Please confirm that your copy and variable tags are reviewed. This action cannot be revoked once dispatched.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSending || isSmtpBlocked}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isSending ? (
              <span>Dispatching...</span>
            ) : isSmtpBlocked ? (
              <span>SMTP Password Required</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Confirm & Send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

