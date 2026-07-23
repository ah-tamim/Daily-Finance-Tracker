import React from 'react';
import { WalletStats } from '../types/finance';
import { TrendingUp, TrendingDown, Wallet, DollarSign, PieChart, CreditCard } from 'lucide-react';

interface SummaryCardsProps {
  walletStats: WalletStats[];
  totalIncomeMonth: number;
  totalExpenseMonth: number;
  selectedMonthLabel: string;
  onOpenBudgetModal?: () => void;
  onOpenDebtModal?: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  walletStats,
  totalIncomeMonth,
  totalExpenseMonth,
  selectedMonthLabel,
  onOpenBudgetModal,
  onOpenDebtModal,
}) => {
  const totalBalanceAllWallets = walletStats.reduce((acc, curr) => acc + curr.currentBalance, 0);
  const totalInitialBalance = walletStats.reduce((acc, curr) => acc + curr.initialBalance, 0);
  const netSavings = totalIncomeMonth - totalExpenseMonth;

  return (
    <div className="space-y-3">
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Total Balance Card */}
        <div className="theme-card border rounded-xl p-3.5 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold theme-text-muted uppercase tracking-wider">Total Net Worth</span>
            <div className="p-1.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-500/25">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
            ৳{totalBalanceAllWallets.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] theme-text-muted mt-1.5 flex items-center justify-between">
            <span>Initial: ৳{totalInitialBalance.toLocaleString()}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{walletStats.length} Wallets</span>
          </p>
        </div>

        {/* Monthly Income Card */}
        <div className="theme-card border rounded-xl p-3.5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold theme-text-muted uppercase tracking-wider truncate">
              Income ({selectedMonthLabel})
            </span>
            <div className="p-1.5 bg-teal-500/15 text-teal-600 dark:text-teal-400 rounded-lg border border-teal-500/25">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-300 font-mono tracking-tight">
            +৳{totalIncomeMonth.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] theme-text-muted mt-1.5">
            Earnings in period
          </p>
        </div>

        {/* Monthly Expense Card */}
        <div className="theme-card border rounded-xl p-3.5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold theme-text-muted uppercase tracking-wider truncate">
              Expense ({selectedMonthLabel})
            </span>
            <div className="p-1.5 bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-500/25">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
            -৳{totalExpenseMonth.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] theme-text-muted mt-1.5 flex items-center justify-between">
            <span>Spendings in period</span>
            {onOpenBudgetModal && (
              <button
                onClick={onOpenBudgetModal}
                className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
              >
                Set Budget &rarr;
              </button>
            )}
          </p>
        </div>

        {/* Net Savings / Cash Flow Card */}
        <div className="theme-card border rounded-xl p-3.5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold theme-text-muted uppercase tracking-wider">
              Net Savings
            </span>
            <div className={`p-1.5 rounded-lg border ${
              netSavings >= 0 
                ? 'bg-sky-500/15 text-sky-600 dark:text-cyan-400 border-sky-500/25' 
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25'
            }`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
            netSavings >= 0 ? 'text-sky-600 dark:text-cyan-300' : 'text-amber-600 dark:text-amber-400'
          }`}>
            {netSavings >= 0 ? '+' : ''}৳{netSavings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] theme-text-muted mt-1.5">
            {netSavings >= 0 ? 'Positive Cashflow' : 'Deficit in period'}
          </p>
        </div>

      </div>

      {/* Quick Access Bar for Budgets & Debts */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 theme-card border rounded-xl">
        <div className="flex items-center gap-2 text-xs font-bold theme-text">
          <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Financial Planning Tools</span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenBudgetModal && (
            <button
              onClick={onOpenBudgetModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Manage Budgets</span>
            </button>
          )}

          {onOpenDebtModal && (
            <button
              onClick={onOpenDebtModal}
              className="flex items-center gap-1.5 px-3 py-1.5 theme-subtle-btn border rounded-lg text-xs font-bold transition"
            >
              <CreditCard className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Debts &amp; EMI</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
