import React, { useState, useEffect } from 'react';
import { 
  Transaction, 
  TransactionType, 
  Wallet, 
  DEFAULT_INCOME_CATEGORIES, 
  DEFAULT_EXPENSE_CATEGORIES 
} from '../types/finance';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  ArrowRightLeft, 
  Calendar, 
  Wallet as WalletIcon, 
  Tag, 
  FileText, 
  DollarSign,
  Plus
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  editingTransaction: Transaction | null;
  defaultWalletId?: string;
  initialType?: TransactionType;
  wallets: Wallet[];
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'userId' | 'monthKey' | 'createdAt'>) => Promise<void>;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  editingTransaction,
  defaultWalletId,
  initialType = 'expense',
  wallets,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().slice(0, 10);

  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState<string>(todayStr);
  const [walletId, setWalletId] = useState<string>(defaultWalletId || wallets[0]?.id || '');
  const [targetWalletId, setTargetWalletId] = useState<string>(
    wallets.find((w) => w.id !== walletId)?.id || wallets[1]?.id || ''
  );
  const [category, setCategory] = useState<string>(DEFAULT_EXPENSE_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState<string>('');
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setDate(editingTransaction.date);
      setWalletId(editingTransaction.walletId);
      if (editingTransaction.targetWalletId) {
        setTargetWalletId(editingTransaction.targetWalletId);
      }
      setCategory(editingTransaction.category);
      setDescription(editingTransaction.description || '');
      setAmount(editingTransaction.amount.toString());
    } else {
      setDate(todayStr);
      const startType = initialType || 'expense';
      setType(startType);
      if (defaultWalletId) {
        setWalletId(defaultWalletId);
      } else if (wallets.length > 0) {
        setWalletId(wallets[0].id);
      }
      if (startType === 'income') {
        setCategory(DEFAULT_INCOME_CATEGORIES[0]);
      } else if (startType === 'transfer') {
        setCategory('Transfer');
      } else {
        setCategory(DEFAULT_EXPENSE_CATEGORIES[0]);
      }
      setAmount('');
      setDescription('');
    }
  }, [editingTransaction, defaultWalletId, initialType, wallets]);

  // Handle Type Change
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory(DEFAULT_EXPENSE_CATEGORIES[0]);
    } else if (newType === 'income') {
      setCategory(DEFAULT_INCOME_CATEGORIES[0]);
    } else if (newType === 'transfer') {
      setCategory('Transfer');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }

    if (!walletId) {
      setErrorMsg('Please select a wallet.');
      return;
    }

    if (type === 'transfer' && walletId === targetWalletId) {
      setErrorMsg('Source and target wallets for transfer cannot be the same.');
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() || 'General' : category;

    try {
      setIsSaving(true);
      await onSave({
        date,
        type,
        walletId,
        targetWalletId: type === 'transfer' ? targetWalletId : undefined,
        category: finalCategory,
        description,
        amount: numAmount,
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to save transaction:', err);
      setErrorMsg(err?.message || 'Failed to save transaction.');
    } finally {
      setIsSaving(false);
    }
  };

  const availableCategories = type === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6">
      <div className="min-h-full flex items-center justify-center">
        <div className="theme-modal border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {editingTransaction ? 'Edit Transaction' : 'New Transaction Entry'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 theme-subtle-btn rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}

          {/* Type Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'theme-text-muted hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Expense</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition ${
                type === 'income'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'theme-text-muted hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Income</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('transfer')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition ${
                type === 'transfer'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'theme-text-muted hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Transfer</span>
            </button>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Date</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full theme-input border focus:border-emerald-500 rounded-xl p-3 text-sm focus:outline-none"
            />
          </div>

          {/* Wallet Selection */}
          {type === 'transfer' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                  <WalletIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>From Wallet</span>
                </label>
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full theme-input border focus:border-emerald-500 rounded-xl p-3 text-sm focus:outline-none"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                      {w.name} (৳{w.initialBalance})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                  <WalletIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>To Wallet</span>
                </label>
                <select
                  value={targetWalletId}
                  onChange={(e) => setTargetWalletId(e.target.value)}
                  className="w-full theme-input border focus:border-emerald-500 rounded-xl p-3 text-sm focus:outline-none"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                      {w.name} (৳{w.initialBalance})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                <WalletIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Select Wallet</span>
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full theme-input border focus:border-emerald-500 rounded-xl p-3 text-sm focus:outline-none"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                    {w.name} ({w.type.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category */}
          {type !== 'transfer' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Category</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                >
                  {isCustomCategory ? 'Select from list' : '+ Add Custom Category'}
                </button>
              </div>

              {isCustomCategory ? (
                <input
                  type="text"
                  placeholder="e.g. Subscriptions, Laundry, Books"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full theme-input border focus:border-emerald-500 rounded-xl p-3 text-sm focus:outline-none"
                />
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full theme-input border focus:border-emerald-500 rounded-xl p-3 text-sm focus:outline-none"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Amount (৳)</span>
            </label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full theme-input border focus:border-emerald-500 rounded-xl p-3 text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 theme-text-muted" />
              <span>Description / Note</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Lunch at cafeteria, Pant purchase, Gift to Apu"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full theme-input border focus:border-emerald-500 rounded-xl p-3 text-sm focus:outline-none"
            />
          </div>

          {/* Submit */}
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
              className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/20 transition transform active:scale-95"
            >
              {isSaving ? 'Saving...' : editingTransaction ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>

        </form>

        </div>
      </div>
    </div>
  );
};
