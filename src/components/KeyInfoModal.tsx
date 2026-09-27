import React, { useState } from 'react';
import { X, KeyRound, ExternalLink, CheckCircle2, ShieldAlert, RefreshCw, Copy, Check, Terminal } from 'lucide-react';
import { ServerStatus } from '../types';

interface KeyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverStatus: ServerStatus | null;
  onRefreshStatus: () => Promise<void>;
}

export const KeyInfoModal: React.FC<KeyInfoModalProps> = ({
  isOpen,
  onClose,
  serverStatus,
  onRefreshStatus,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedVar, setCopiedVar] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshStatus();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleCopyVar = () => {
    navigator.clipboard.writeText('OPENAI_API_KEY');
    setCopiedVar(true);
    setTimeout(() => setCopiedVar(false), 2000);
  };

  const isOpenAiValid = Boolean(serverStatus?.hasOpenAiKey);
  const isOpenAiPlaceholder = Boolean(serverStatus?.isOpenAiPlaceholder);
  const maskedKey = serverStatus?.maskedOpenAiKey;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              API Key Setup & Change
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure OpenAI Responses API for Safra AI
            </p>
          </div>
        </div>

        {/* Current Live Key Status Box */}
        <div className="mb-4 p-3.5 rounded-xl border transition-colors bg-slate-50/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Current Status:</span>
              {isOpenAiValid ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Connected (OpenAI)</span>
              ) : isOpenAiPlaceholder ? (
                <span className="text-amber-600 dark:text-amber-400 font-bold">Placeholder Detected</span>
              ) : (
                <span className="text-slate-500 font-medium">Demo Mode (No OpenAI Key)</span>
              )}
            </span>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-emerald-300/50 dark:border-emerald-800/50 transition-colors"
              title="Re-check environment for newly set key"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Checking...' : 'Check Key'}</span>
            </button>
          </div>

          {maskedKey ? (
            <div className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="truncate">Key: {maskedKey}</span>
              {isOpenAiValid ? (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-sans font-semibold">Valid</span>
              ) : (
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-sans font-semibold">Needs update</span>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic">No OpenAI key detected on backend.</div>
          )}

          {isOpenAiPlaceholder && (
            <div className="mt-2.5 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <span>
                Your current key looks like a placeholder (<code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">OPENAI_A...</code>). OpenAI keys must start with <code className="font-mono font-bold">sk-...</code>.
              </span>
            </div>
          )}

          {isOpenAiValid && (
            <div className="mt-2.5 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Safra is successfully connected to the OpenAI Responses API!</span>
            </div>
          )}
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
              <span>Step 1: Get your OpenAI API Key</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
              If you don't already have one, generate a secret key from OpenAI:
            </p>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-medium text-xs transition-colors"
            >
              <span>Open OpenAI API Keys Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="border-t border-slate-200/80 dark:border-slate-800 pt-3">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
              Step 2: Change or Set the Key
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
              Add or update the environment variable named:
            </p>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 font-mono text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span>OPENAI_API_KEY</span>
                <span className="text-[10px] font-sans font-normal text-slate-500">Value: sk-proj-...</span>
              </div>
              <button
                onClick={handleCopyVar}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Copy variable name"
              >
                {copiedVar ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-200">In AI Studio:</span>
                <span>Open the <strong>Secrets</strong> panel (key icon or Project Settings), find <code className="font-mono text-slate-700 dark:text-slate-300">OPENAI_API_KEY</code>, paste your <code className="font-mono">sk-...</code> key, and save.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-200">Locally / phone:</span>
                <span>Set <code className="font-mono text-slate-700 dark:text-slate-300">OPENAI_API_KEY="sk-..."</code> in your <code className="font-mono">.env</code> file.</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/80 dark:border-slate-800 pt-3">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
              Step 3: Verify Connection
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              After updating your secret, click the <strong>Check Key</strong> button above or close this dialog and send a message. Safra will automatically activate live OpenAI reasoning!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Terminal className="w-3.5 h-3.5" />
            <span>Secure Backend · Zero Client Exposure</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              {isRefreshing ? 'Checking...' : 'Re-check Key'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs sm:text-sm font-medium transition-colors shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
