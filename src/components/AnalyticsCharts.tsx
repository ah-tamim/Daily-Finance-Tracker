import React from 'react';
import { Transaction, WalletStats } from '../types/finance';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { PieChart as PieIcon, BarChart2, TrendingDown } from 'lucide-react';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  walletStats: WalletStats[];
  selectedMonthLabel: string;
}

const COLORS = [
  '#F43F5E', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
  '#06B6D4', '#EC4899', '#84CC16', '#6366F1', '#14B8A6'
];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  walletStats,
  selectedMonthLabel,
}) => {
  // Aggregate expenses by Category for selected month
  const categoryMap = new Map<string, number>();
  transactions
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      const current = categoryMap.get(tx.category) || 0;
      categoryMap.set(tx.category, current + tx.amount);
    });

  const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value);

  // Prepare Wallet Balance Comparison Data
  const walletBalanceData = walletStats.map((stat) => ({
    name: stat.wallet.name,
    Initial: stat.initialBalance,
    Current: stat.currentBalance,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      
      {/* Category Expenses Donut Chart */}
      <div className="theme-card border rounded-xl p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <span>Category Expense Breakdown</span>
            </h3>
            <p className="text-[11px] theme-text-muted mt-0.5">
              Expenses categorized for {selectedMonthLabel}
            </p>
          </div>
        </div>

        {categoryData.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-xs theme-text-muted bg-slate-100/50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800/50">
            No expenses logged for this period.
          </div>
        ) : (
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive={false}
                  label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, 'Amount']}
                  contentStyle={{ backgroundColor: 'var(--app-modal-bg)', borderColor: 'var(--app-border)', color: 'var(--app-text-main)', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Wallet Balance Comparison Bar Chart */}
      <div className="theme-card border rounded-xl p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Wallet Balances (Initial vs Current)</span>
            </h3>
            <p className="text-[11px] theme-text-muted mt-0.5">
              Real-time balance comparison across all wallets
            </p>
          </div>
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={walletBalanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted, #64748b)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--text-muted, #64748b)', fontSize: 10 }} />
              <Tooltip
                formatter={(val: any) => [`৳${Number(val).toLocaleString()}`]}
                contentStyle={{ backgroundColor: 'var(--app-modal-bg)', borderColor: 'var(--app-border)', color: 'var(--app-text-main)', borderRadius: '8px', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', color: 'var(--text-muted, #64748b)' }} />
              <Bar dataKey="Initial" fill="#94A3B8" radius={[3, 3, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="Current" fill="#10B981" radius={[3, 3, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
