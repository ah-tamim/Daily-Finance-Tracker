import React, { useState } from 'react';
import { BudgetItem, Transaction } from '../types/finance';
import { 
  PieChart, 
  X, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface BudgetListModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: BudgetItem[];
  transactions: Transaction[];
  selectedMonth: string;
  onOpenAddBudgetModal: () => void;
  onDeleteBudget: (budgetId: string) => Promise<void>;
}

export const BudgetListModal: React.FC<BudgetListModalProps> = ({
  isOpen,
  onClose,
  budgets,
  transactions,
  selectedMonth,
  onOpenAddBudgetModal,
  onDeleteBudget,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'monthly' | 'weekly'>('all');

  if (!isOpen) return null;

  // Helpers to calculate spent amount
  const getSpentForBudget = (budget: BudgetItem): number => {
    if (budget.period === 'monthly') {
      // Sum expenses for selected month
      return transactions
        .filter((tx) => {
          if (tx.type !== 'expense') return false;
          if (tx.monthKey !== selectedMonth) return false;
          if (budget.category !== 'All Expenses' && tx.category !== budget.category) return false;
          return true;
        })
        .reduce((sum, tx) => sum + tx.amount, 0);
    } else {
      // Weekly: sum expenses for the past 7 days up to today
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

      return transactions
        .filter((tx) => {
          if (tx.type !== 'expense') return false;
          if (tx.date < sevenDaysAgoStr) return false;
          if (budget.category !== 'All Expenses' && tx.category !== budget.category) return false;
          return true;
        })
        .reduce((sum, tx) => sum + tx.amount, 0);
    }
  };

  const filteredBudgets = budgets.filter((b) => {
    if (activeTab === 'monthly') return b.period === 'monthly';
    if (activeTab === 'weekly') return b.period === 'weekly';
    return true;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget limit?')) {
      try {
        await onDeleteBudget(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Overall statistics for header overview
  const totalMonthlyLimit = budgets
    .filter((b) => b.period === 'monthly')
    .reduce((sum, b) => sum + b.limitAmount, 0);

  const totalWeeklyLimit = budgets
    .filter((b) => b.period === 'weekly')
    .reduce((sum, b) => sum + b.limitAmount, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6">
      <div className="min-h-full flex items-center justify-center">
        <div className="theme-modal border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <span>Budget Planner &amp; Limits</span>
              </h2>
              <p className="text-xs theme-text-muted">
                Control monthly &amp; weekly spending thresholds with real-time alerts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddBudgetModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-900/20"
            >
              <Plus className="w-4 h-4" />
              <span>Set New Budget</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 theme-subtle-btn rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="p-6 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="theme-card border rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Monthly Budget Allocations</span>
              <Calendar className="w-4 h-4" />
            </div>
            <div className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ৳{totalMonthlyLimit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] theme-text-muted">Total set for month of {selectedMonth}</p>
          </div>

          <div className="theme-card border rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>Weekly Budget Allocations</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
              ৳{totalWeeklyLimit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] theme-text-muted">Active 7-day spending limits</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 pt-4 flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl border transition ${
              activeTab === 'all' ? 'bg-emerald-600 text-white border-emerald-600' : 'theme-subtle-btn'
            }`}
          >
            All Budgets ({budgets.length})
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-3 py-1.5 rounded-xl border transition ${
              activeTab === 'monthly' ? 'bg-emerald-600 text-white border-emerald-600' : 'theme-subtle-btn'
            }`}
          >
            Monthly ({budgets.filter(b => b.period === 'monthly').length})
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3 py-1.5 rounded-xl border transition ${
              activeTab === 'weekly' ? 'bg-emerald-600 text-white border-emerald-600' : 'theme-subtle-btn'
            }`}
          >
            Weekly ({budgets.filter(b => b.period === 'weekly').length})
          </button>
        </div>

        {/* Budgets List */}
        <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto">
          {filteredBudgets.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-3xl theme-card space-y-3">
              <PieChart className="w-10 h-10 mx-auto theme-text-muted opacity-40" />
              <p className="text-sm font-bold theme-text">No active budget limits configured</p>
              <p className="text-xs theme-text-muted max-w-sm mx-auto">
                Keep your finances healthy by setting weekly or monthly limit targets for groceries, dining, or overall expenses.
              </p>
              <button
                onClick={onOpenAddBudgetModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-500 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Budget</span>
              </button>
            </div>
          ) : (
            filteredBudgets.map((budget) => {
              const spent = getSpentForBudget(budget);
              const remaining = budget.limitAmount - spent;
              const pct = Math.min(100, Math.round((spent / budget.limitAmount) * 100));
              const isOver = spent > budget.limitAmount;
              const isWarning = pct >= 85 && !isOver;

              return (
                <div
                  key={budget.id}
                  className={`theme-card border rounded-2xl p-4 space-y-3 relative overflow-hidden transition ${
                    isOver 
                      ? 'border-rose-500/50 bg-rose-500/5 dark:bg-rose-950/10' 
                      : isWarning 
                      ? 'border-amber-500/50' 
                      : 'hover:border-emerald-500/40'
                  }`}
                >
                  {/* Top Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        budget.period === 'monthly'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {budget.period}
                      </span>
                      <h3 className="font-extrabold text-sm theme-text">{budget.category}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOver ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Over Budget!</span>
                        </span>
                      ) : isWarning ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>Near Limit (85%+)</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>On Track</span>
                        </span>
                      )}

                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-lg"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="theme-text-muted block text-[10px]">Budget Limit</span>
                      <span className="font-mono font-bold text-sm">৳{budget.limitAmount.toLocaleString()}</span>
                    </div>

                    <div>
                      <span className="theme-text-muted block text-[10px]">Spent</span>
                      <span className={`font-mono font-bold text-sm ${
                        isOver ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        ৳{spent.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="theme-text-muted block text-[10px]">Remaining</span>
                      <span className={`font-mono font-bold text-sm ${
                        remaining < 0 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : 'theme-text'
                      }`}>
                        {remaining < 0 ? `-৳${Math.abs(remaining).toLocaleString()}` : `৳${remaining.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] theme-text-muted">
                      <span>Consumption</span>
                      <span className="font-mono font-bold">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver
                            ? 'bg-rose-500'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        </div>
      </div>
    </div>
  );
};
