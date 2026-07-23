import React, { useState } from 'react';
import { Wallet } from '../types/finance';
import { X, Wallet as WalletIcon, DollarSign, Palette } from 'lucide-react';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWallet: (walletData: Omit<Wallet, 'id'>) => Promise<void>;
}

const PRESET_COLORS = [
  '#10B981', '#059669', '#E11D48', '#F97316', '#8B5CF6', 
  '#2563EB', '#0D9488', '#D97706', '#6366F1', '#EC4899'
];

export const AddWalletModal: React.FC<AddWalletModalProps> = ({
  isOpen,
  onClose,
  onAddWallet,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [type, setType] = useState<'cash' | 'mobile_banking' | 'bank' | 'custom'>('custom');
  const [initialBalance, setInitialBalance] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a wallet name.');
      return;
    }

    const initNum = parseFloat(initialBalance) || 0;

    try {
      setIsSaving(true);
      await onAddWallet({
        name: name.trim(),
        type,
        initialBalance: initNum,
        color,
      });
      setName('');
      setInitialBalance('');
      onClose();
    } catch (err: any) {
      console.error('Failed to add wallet:', err);
      setErrorMsg(err?.message || 'Failed to create wallet');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6">
      <div className="min-h-full flex items-center justify-center">
        <div className="theme-modal border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <WalletIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Add Custom Wallet</span>
          </h2>
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

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Wallet Name
            </label>
            <input
              type="text"
              placeholder="e.g. Upay, City Bank, Secret Savings, Crypto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full theme-input border focus:border-emerald-500 rounded-xl p-3 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Wallet Category / Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full theme-input border focus:border-emerald-500 rounded-xl p-3 text-sm focus:outline-none"
            >
              <option value="cash" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Cash Wallet</option>
              <option value="mobile_banking" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Mobile Banking (bKash, Nagad, etc.)</option>
              <option value="bank" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Bank Account</option>
              <option value="custom" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Custom Account / Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Initial Balance (৳)
            </label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="w-full theme-input border focus:border-emerald-500 rounded-xl p-3 text-sm font-mono text-emerald-600 dark:text-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Wallet Theme Color</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition ${
                    color === c ? 'border-emerald-500 scale-110 shadow' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center gap-3">
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
              className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-900/20"
            >
              {isSaving ? 'Creating...' : 'Create Wallet'}
            </button>
          </div>

        </form>

        </div>
      </div>
    </div>
  );
};
