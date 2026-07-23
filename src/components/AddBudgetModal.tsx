import React, { useState } from 'react';
import { BudgetItem, DEFAULT_EXPENSE_CATEGORIES } from '../types/finance';
import { X, PieChart, DollarSign, Calendar, AlertCircle } from 'lucide-react';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budgetData: Omit<BudgetItem, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
}

export const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [category, setCategory] = useState<string>('All Expenses');
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [limitAmount, setLimitAmount] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const categoriesOptions = ['All Expenses', ...DEFAULT_EXPENSE_CATEGORIES];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedLimit = parseFloat(limitAmount);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      setErrorMsg('Please enter a valid budget limit amount.');
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        category,
        period,
        limitAmount: parsedLimit,
      });
      setIsSaving(false);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to save budget.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6">
      <div className="min-h-full flex items-center justify-center">
        <div className="theme-modal border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Set Budget Limit</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 theme-subtle-btn rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Period Selector (Monthly or Weekly) */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 theme-text-muted" />
              <span>Budget Period</span>
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPeriod('monthly')}
                className={`py-2 rounded-xl transition ${
                  period === 'monthly'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'theme-text-muted hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Monthly Budget
              </button>
              <button
                type="button"
                onClick={() => setPeriod('weekly')}
                className={`py-2 rounded-xl transition ${
                  period === 'weekly'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'theme-text-muted hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Weekly Budget
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full theme-input border focus:border-emerald-500 rounded-xl p-3 text-sm focus:outline-none"
            >
              {categoriesOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <p className="text-[11px] theme-text-muted mt-1">
              Select "All Expenses" for total spending limit or choose a specific category like Food or Bills.
            </p>
          </div>

          {/* Limit Amount */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Budget Limit Amount (৳)</span>
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 15000 for monthly or 3000 for weekly"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              required
              className="w-full theme-input border focus:border-emerald-500 rounded-xl p-3 text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center gap-3 pt-2">
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
              {isSaving ? 'Saving...' : 'Set Budget'}
            </button>
          </div>
        </form>

        </div>
      </div>
    </div>
  );
};
