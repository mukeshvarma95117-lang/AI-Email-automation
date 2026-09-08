import React from 'react';
import {
  Wand2,
  RefreshCw,
  Minimize2,
  Maximize2,
  Briefcase,
  Smile,
  Globe2,
  Sparkles,
  Loader2
} from 'lucide-react';

export default function AiActionButtons({
  isGenerating,
  isRewriting,
  onGenerate,
  onRegenerate,
  onRewrite,
  onTranslate,
  selectedLanguage,
  hasGeneratedMessage
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
      {/* Primary Generate / Regenerate */}
      {!hasGeneratedMessage ? (
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer btn-shimmer btn-glow btn-lift"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Copy...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Message</span>
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isGenerating || isRewriting}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm active:scale-95 disabled:opacity-50 transition-all cursor-pointer btn-lift btn-spin-hover"
        >
          {isGenerating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span>Regenerate</span>
        </button>
      )}

      {/* Quick AI Refine Chips (Only active when content exists) */}
      {hasGeneratedMessage && (
        <>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

          <button
            type="button"
            onClick={() => onRewrite('shorter')}
            disabled={isRewriting || isGenerating}
            title="Make copy more concise"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50 btn-lift"
          >
            <Minimize2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Make shorter</span>
          </button>

          <button
            type="button"
            onClick={() => onRewrite('longer')}
            disabled={isRewriting || isGenerating}
            title="Elaborate with more context and guidance"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50 btn-lift"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Make longer</span>
          </button>

          <button
            type="button"
            onClick={() => onRewrite('professional')}
            disabled={isRewriting || isGenerating}
            title="Polish into formal executive tone"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50 btn-lift"
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
            <span>More professional</span>
          </button>

          <button
            type="button"
            onClick={() => onRewrite('friendlier')}
            disabled={isRewriting || isGenerating}
            title="Make warm and welcoming"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50 btn-lift"
          >
            <Smile className="w-3.5 h-3.5 text-amber-500" />
            <span>Friendlier</span>
          </button>

          <button
            type="button"
            onClick={() => onRewrite('improve')}
            disabled={isRewriting || isGenerating}
            title="Improve overall impact and clarity"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 transition-colors disabled:opacity-50 btn-lift"
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-500" />
            <span>Improve</span>
          </button>

          <button
            type="button"
            onClick={onTranslate}
            disabled={isRewriting || isGenerating}
            title={`Translate into ${selectedLanguage}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/80 transition-colors disabled:opacity-50 btn-lift"
          >
            <Globe2 className="w-3.5 h-3.5 text-cyan-500" />
            <span>Translate</span>
          </button>
        </>
      )}
    </div>
  );
}

