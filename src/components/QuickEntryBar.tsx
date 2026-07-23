import React from 'react';
import { 
  Plus, 
  TrendingDown, 
  TrendingUp, 
  ArrowRightLeft, 
  Wallet, 
  PieChart, 
  CreditCard 
} from 'lucide-react';
import { TransactionType } from '../types/finance';

interface QuickEntryBarProps {
  onOpenTransactionWithKind: (kind: TransactionType) => void;
  onOpenAddWalletModal: () => void;
  onOpenBudgetModal: () => void;
  onOpenDebtModal: () => void;
}

export const QuickEntryBar: React.FC<QuickEntryBarProps> = ({
  onOpenTransactionWithKind,
  onOpenAddWalletModal,
  onOpenBudgetModal,
  onOpenDebtModal,
}) => {
  return (
    <div className="theme-card border rounded-xl p-3.5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-500" />
            <span>Quick Entry &amp; New Record Options</span>
          </h2>
          <p className="text-[11px] theme-text-muted mt-0.5">
            Add income, expense, transfers, wallets, or budgets directly from the dashboard
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* Add Expense Button */}
        <button
          onClick={() => onOpenTransactionWithKind('expense')}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/25 rounded-xl text-xs font-bold transition active:scale-95 shadow-2xs group"
          title="Add Expense Entry"
        >
          <div className="p-1 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition">
            <TrendingDown className="w-3.5 h-3.5" />
          </div>
          <span>+ Expense</span>
        </button>

        {/* Add Income Button */}
        <button
          onClick={() => onOpenTransactionWithKind('income')}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 rounded-xl text-xs font-bold transition active:scale-95 shadow-2xs group"
          title="Add Income Entry"
        >
          <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <span>+ Income</span>
        </button>

        {/* Add Transfer Button */}
        <button
          onClick={() => onOpenTransactionWithKind('transfer')}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/25 rounded-xl text-xs font-bold transition active:scale-95 shadow-2xs group"
          title="Add Wallet Transfer Entry"
        >
          <div className="p-1 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition">
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </div>
          <span>+ Transfer</span>
        </button>

        {/* Add Wallet Button */}
        <button
          onClick={onOpenAddWalletModal}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 rounded-xl text-xs font-bold transition active:scale-95 shadow-2xs group"
          title="Add Custom Wallet"
        >
          <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <span>+ Wallet</span>
        </button>

        {/* Add Budget Button */}
        <button
          onClick={onOpenBudgetModal}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/25 rounded-xl text-xs font-bold transition active:scale-95 shadow-2xs group"
          title="Set Budget Limit"
        >
          <div className="p-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition">
            <PieChart className="w-3.5 h-3.5" />
          </div>
          <span>+ Budget</span>
        </button>

        {/* Add Debt/Loan Button */}
        <button
          onClick={onOpenDebtModal}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/25 rounded-xl text-xs font-bold transition active:scale-95 shadow-2xs group"
          title="Manage Debts & Loans"
        >
          <div className="p-1 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition">
            <CreditCard className="w-3.5 h-3.5" />
          </div>
          <span>+ Debt/Loan</span>
        </button>
      </div>
    </div>
  );
};
