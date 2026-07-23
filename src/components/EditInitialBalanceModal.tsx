import React, { useState, useEffect } from 'react';
import { Wallet } from '../types/finance';
import { X, DollarSign, Edit2, Wallet as WalletIcon, Check, Plus, Minus, Sparkles } from 'lucide-react';

interface EditInitialBalanceModalProps {
  isOpen: boolean;
  wallet: Wallet | null;
  wallets?: Wallet[];
  onClose: () => void;
  onSave: (walletId: string, newBalance: number) => Promise<void>;
  onSelectWallet?: (wallet: Wallet) => void;
}

const PRESET_AMOUNTS = [0, 500, 1000, 5000, 10000, 25000, 50000, 100000];

export const EditInitialBalanceModal: React.FC<EditInitialBalanceModalProps> = ({
  isOpen,
  wallet,
  wallets = [],
  onClose,
  onSave,
  onSelectWallet,
}) => {
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [balanceInput, setBalanceInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const activeWallet = (wallet || wallets.find((w) => w.id === selectedWalletId) || wallets[0]) || null;

  useEffect(() => {
    if (activeWallet) {
      setSelectedWalletId(activeWallet.id);
      setBalanceInput(activeWallet.initialBalance.toString());
      setErrorMsg('');
    }
  }, [wallet, isOpen]);

  const handleWalletChange = (wId: string) => {
    setSelectedWalletId(wId);
    const target = wallets.find((w) => w.id === wId);
    if (target) {
      if (onSelectWallet) onSelectWallet(target);
      setBalanceInput(target.initialBalance.toString());
    }
  };

  if (!isOpen || !activeWallet) return null;

  const currentVal = parseFloat(balanceInput) || 0;

  const handleAdjust = (delta: number) => {
    const nextVal = Math.max(0, currentVal + delta);
    setBalanceInput(nextVal.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWallet) return;
    const num = parseFloat(balanceInput);
    if (isNaN(num) || num < 0) {
      setErrorMsg('Please enter a valid non-negative initial balance.');
      return;
    }

    try {
      setIsSaving(true);
      await onSave(activeWallet.id, num);
      setIsSaving(false);
      onClose();
    } catch (err: any) {
      console.error(err);
      setIsSaving(false);
      setErrorMsg(err?.message || 'Failed to update initial balance.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6">
      <div className="min-h-full flex items-center justify-center">
        <div className="theme-modal border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
          
          {/* Header */}
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
                style={{ backgroundColor: activeWallet.color || '#10B981' }}
              >
                <WalletIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold flex items-center gap-2">
                  <span>Edit Initial Balance</span>
                </h2>
                <p className="text-xs theme-text-muted">
                  {activeWallet.name} ({activeWallet.type.replace('_', ' ')})
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 theme-subtle-btn rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-xl text-xs">
                {errorMsg}
              </div>
            )}

            {/* Wallet Selector if multiple wallets exist */}
            {wallets.length > 1 && (
              <div>
                <label className="block text-xs font-bold mb-1.5 theme-text-muted">
                  Select Wallet to Edit
                </label>
                <select
                  value={activeWallet.id}
                  onChange={(e) => handleWalletChange(e.target.value)}
                  className="w-full theme-input border rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id} className="bg-white dark:bg-slate-900">
                      {w.name} ({w.type.replace('_', ' ')}) - Starting: ৳{w.initialBalance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Current Initial vs New Input Card */}
            <div className="p-4 theme-card border rounded-2xl space-y-3 bg-emerald-500/5 border-emerald-500/20">
              <div className="flex items-center justify-between text-xs theme-text-muted font-medium">
                <span>Current Initial Starting Balance:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  ৳{activeWallet.initialBalance.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Set New Initial Balance (৳)</span>
                </label>
                
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ৳
                  </span>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={balanceInput}
                    onChange={(e) => setBalanceInput(e.target.value)}
                    autoFocus
                    required
                    className="w-full theme-input border-2 border-emerald-500/40 focus:border-emerald-500 rounded-xl py-3 pl-8 pr-24 text-xl font-mono font-black text-emerald-600 dark:text-emerald-400 focus:outline-none"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAdjust(-1000)}
                      className="p-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold rounded-lg transition"
                      title="-1,000"
                    >
                      -1k
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjust(1000)}
                      className="p-1.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold rounded-lg transition"
                      title="+1,000"
                    >
                      +1k
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <label className="block text-xs font-bold mb-2 theme-text-muted flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Preset Amounts</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBalanceInput(amt.toString())}
                    className={`py-2 px-1 rounded-xl text-xs font-mono font-bold border transition ${
                      parseFloat(balanceInput) === amt
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'theme-subtle-btn hover:border-emerald-500/40'
                    }`}
                  >
                    ৳{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 theme-subtle-btn rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/20 transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'Updating...' : 'Save Initial Balance'}</span>
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
