import React, { useState } from 'react';
import { Wallet, Transaction, WalletStats } from '../types/finance';
import { 
  X, 
  Edit2, 
  Check, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowRightLeft, 
  Plus, 
  Calendar,
  Tag,
  CreditCard
} from 'lucide-react';

interface WalletDetailModalProps {
  wallet: Wallet | null;
  walletStats: WalletStats | undefined;
  transactions: Transaction[];
  allWallets: Wallet[];
  onClose: () => void;
  onUpdateInitialBalance: (walletId: string, newBalance: number) => Promise<void>;
  onOpenQuickEntryForWallet: (walletId: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (txId: string) => void;
}

export const WalletDetailModal: React.FC<WalletDetailModalProps> = ({
  wallet,
  walletStats,
  transactions,
  allWallets,
  onClose,
  onUpdateInitialBalance,
  onOpenQuickEntryForWallet,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  if (!wallet || !walletStats) return null;

  const [isEditingInitial, setIsEditingInitial] = useState(false);
  const [initialInput, setInitialInput] = useState<string>(wallet.initialBalance.toString());
  const [isSaving, setIsSaving] = useState(false);

  // Filter transactions related to this wallet (as source or target)
  const walletTransactions = transactions.filter(
    (tx) => tx.walletId === wallet.id || tx.targetWalletId === wallet.id
  );

  const walletMap = new Map<string, string>();
  allWallets.forEach((w) => walletMap.set(w.id, w.name));

  const handleSaveInitial = async () => {
    const num = parseFloat(initialInput);
    if (isNaN(num)) return;
    try {
      setIsSaving(true);
      await onUpdateInitialBalance(wallet.id, num);
      setIsEditingInitial(false);
    } catch (err) {
      console.error('Failed to update initial balance:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6">
      <div className="min-h-full flex items-center justify-center">
        <div className="theme-modal border rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Modal Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: wallet.color || '#10B981' }}
            >
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {wallet.name}
              </h2>
              <span className="text-xs theme-text-muted capitalize">
                {wallet.type.replace('_', ' ')} Wallet History
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 theme-subtle-btn rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Balance Overview Card */}
          <div className="theme-card border rounded-2xl p-5 space-y-4">
            
            {/* Top row: Current Balance + Initial Balance editor */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
              <div>
                <span className="text-xs theme-text-muted font-semibold uppercase tracking-wider">
                  Current Balance
                </span>
                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  ৳{walletStats.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Initial Balance */}
              <div className="theme-input border p-3 rounded-xl flex items-center justify-between gap-3">
                <div className="text-left">
                  <span className="text-[10px] theme-text-muted uppercase font-semibold block">
                    Initial Balance
                  </span>
                  {isEditingInitial ? (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="theme-text-muted text-xs font-mono">৳</span>
                      <input
                        type="number"
                        step="any"
                        value={initialInput}
                        onChange={(e) => setInitialInput(e.target.value)}
                        className="w-24 theme-input border border-emerald-500 rounded px-2 py-0.5 text-xs font-mono focus:outline-none"
                      />
                      <button
                        onClick={handleSaveInitial}
                        disabled={isSaving}
                        className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold font-mono">
                        ৳{walletStats.initialBalance.toLocaleString()}
                      </span>
                      <button
                        onClick={() => setIsEditingInitial(true)}
                        className="theme-text-muted hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                        title="Edit initial balance"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Income, Expense, Transfer Breakdown */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="theme-input p-2.5 rounded-xl border">
                <span className="text-[10px] theme-text-muted block mb-0.5">Total Income</span>
                <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">
                  +৳{walletStats.totalIncome.toLocaleString()}
                </span>
              </div>

              <div className="theme-input p-2.5 rounded-xl border">
                <span className="text-[10px] theme-text-muted block mb-0.5">Total Expense</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                  -৳{walletStats.totalExpense.toLocaleString()}
                </span>
              </div>

              <div className="theme-input p-2.5 rounded-xl border">
                <span className="text-[10px] theme-text-muted block mb-0.5">Transfers In/Out</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  +৳{walletStats.transfersIn.toLocaleString()} / -৳{walletStats.transfersOut.toLocaleString()}
                </span>
              </div>
            </div>

          </div>

          {/* History Header & Add Entry Shortcut */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Wallet Transaction History ({walletTransactions.length})</span>
            </h3>

            <button
              onClick={() => {
                onClose();
                onOpenQuickEntryForWallet(wallet.id);
              }}
              className="flex items-center gap-1 px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Entry</span>
            </button>
          </div>

          {/* Transaction List */}
          {walletTransactions.length === 0 ? (
            <div className="text-center py-8 theme-text-muted text-xs bg-slate-100/50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800/50">
              No transactions logged for {wallet.name} yet.
            </div>
          ) : (
            <div className="space-y-2">
              {walletTransactions.map((tx) => {
                const isSource = tx.walletId === wallet.id;
                const isTarget = tx.targetWalletId === wallet.id;

                let txTypeBadge = null;
                let amountDisplay = null;

                if (tx.type === 'income') {
                  txTypeBadge = (
                    <span className="px-2 py-0.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 rounded-md text-[10px] font-semibold flex items-center gap-1">
                      <ArrowDownRight className="w-3 h-3" /> Income
                    </span>
                  );
                  amountDisplay = <span className="text-teal-600 dark:text-teal-400 font-bold font-mono">+৳{tx.amount.toLocaleString()}</span>;
                } else if (tx.type === 'expense') {
                  txTypeBadge = (
                    <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-md text-[10px] font-semibold flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> Expense
                    </span>
                  );
                  amountDisplay = <span className="text-rose-600 dark:text-rose-400 font-bold font-mono">-৳{tx.amount.toLocaleString()}</span>;
                } else if (tx.type === 'transfer') {
                  if (isSource && isTarget) {
                    txTypeBadge = <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px]">Self Transfer</span>;
                    amountDisplay = <span className="font-mono">৳{tx.amount.toLocaleString()}</span>;
                  } else if (isSource) {
                    txTypeBadge = (
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md text-[10px] font-semibold flex items-center gap-1">
                        <ArrowRightLeft className="w-3 h-3" /> Transfer Out to {walletMap.get(tx.targetWalletId || '') || 'Wallet'}
                      </span>
                    );
                    amountDisplay = <span className="text-amber-600 dark:text-amber-400 font-bold font-mono">-৳{tx.amount.toLocaleString()}</span>;
                  } else {
                    txTypeBadge = (
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-md text-[10px] font-semibold flex items-center gap-1">
                        <ArrowRightLeft className="w-3 h-3" /> Transfer In from {walletMap.get(tx.walletId) || 'Wallet'}
                      </span>
                    );
                    amountDisplay = <span className="text-indigo-600 dark:text-indigo-400 font-bold font-mono">+৳{tx.amount.toLocaleString()}</span>;
                  }
                }

                return (
                  <div
                    key={tx.id}
                    className="theme-card border hover:border-emerald-500/50 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                          {txTypeBadge}
                          <span className="theme-text-muted font-mono text-[11px]">{tx.date}</span>
                        </div>
                        <p className="font-semibold">
                          {tx.category || 'General'}
                        </p>
                        {tx.description && (
                          <p className="text-[11px] theme-text-muted mt-0.5 line-clamp-1">
                            {tx.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>{amountDisplay}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 theme-subtle-btn rounded-xl text-xs font-semibold transition"
          >
            Close
          </button>
        </div>

        </div>
      </div>
    </div>
  );
};
