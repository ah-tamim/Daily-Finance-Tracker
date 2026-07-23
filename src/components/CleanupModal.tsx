import React, { useState } from 'react';
import { Transaction } from '../types/finance';
import { getSixMonthsAgoMonthKey } from '../services/financeService';
import { X, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CleanupModalProps {
  isOpen: boolean;
  transactions: Transaction[];
  onClose: () => void;
  onConfirmCleanup: () => Promise<number>;
}

export const CleanupModal: React.FC<CleanupModalProps> = ({
  isOpen,
  transactions,
  onClose,
  onConfirmCleanup,
}) => {
  if (!isOpen) return null;

  const cutoffMonthKey = getSixMonthsAgoMonthKey();
  const eligibleForDeletion = transactions.filter((tx) => tx.monthKey < cutoffMonthKey);

  const [isDeleting, setIsDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleClear = async () => {
    try {
      setIsDeleting(true);
      setErrorMsg('');
      const count = await onConfirmCleanup();
      setSuccessMsg(`Successfully cleared ${count} transaction record(s) older than 6 months.`);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Failed cleanup:', err);
      setErrorMsg(err?.message || 'Failed to clear old data.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6">
      <div className="min-h-full flex items-center justify-center">
        <div className="theme-modal border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span>6-Month Data Cleanup</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 theme-subtle-btn rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}

          <div className="p-4 theme-card border rounded-2xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Data Retention Rule</span>
            </div>
            <p className="theme-text-muted leading-relaxed">
              Finance data is stored month-by-month. Transactions older than 6 months (prior to <strong className="text-rose-600 dark:text-rose-400 font-mono">{cutoffMonthKey}</strong>) can be safely purged to keep your wallet logs compact and performant.
            </p>
          </div>

          <div className="p-4 theme-card border rounded-2xl flex items-center justify-between text-xs">
            <span className="theme-text-muted">Records older than 6 months:</span>
            <span className="font-bold font-mono text-rose-600 dark:text-rose-400 text-sm">
              {eligibleForDeletion.length} transaction(s)
            </span>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 theme-subtle-btn rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={isDeleting || eligibleForDeletion.length === 0}
              className="w-2/3 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Clearing...' : 'Purge & Clear Data'}</span>
            </button>
          </div>

        </div>

        </div>
      </div>
    </div>
  );
};
