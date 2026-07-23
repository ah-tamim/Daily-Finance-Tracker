import React, { useState } from 'react';
import { Transaction, Wallet } from '../types/finance';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowRightLeft, 
  Edit3, 
  Trash2, 
  Calendar,
  Wallet as WalletIcon,
  Tag,
  Plus
} from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
  wallets: Wallet[];
  selectedMonthLabel: string;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (txId: string) => void;
  onAddTransaction?: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  wallets,
  selectedMonthLabel,
  onEditTransaction,
  onDeleteTransaction,
  onAddTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [walletFilter, setWalletFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const walletMap = new Map<string, Wallet>();
  wallets.forEach((w) => walletMap.set(w.id, w));

  const filteredTransactions = transactions.filter((tx) => {
    // Search matching
    const searchLower = searchTerm.toLowerCase();
    const catMatch = tx.category.toLowerCase().includes(searchLower);
    const descMatch = (tx.description || '').toLowerCase().includes(searchLower);
    const amountMatch = tx.amount.toString().includes(searchLower);
    const dateMatch = tx.date.includes(searchLower);
    const matchesSearch = !searchTerm || catMatch || descMatch || amountMatch || dateMatch;

    // Wallet filter matching
    const matchesWallet =
      walletFilter === 'ALL' ||
      tx.walletId === walletFilter ||
      tx.targetWalletId === walletFilter;

    // Type filter matching
    const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;

    return matchesSearch && matchesWallet && matchesType;
  });

  return (
    <div className="theme-card border rounded-xl p-4 shadow-xs">
      
      {/* Title & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2">
            Transaction History ({selectedMonthLabel})
          </h2>
          <p className="text-[11px] theme-text-muted mt-0.5">
            Showing date, source &amp; target wallets, type, category, description, and amount
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Search Box */}
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 theme-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search category, desc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full theme-input border rounded-lg pl-8 pr-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Wallet Filter */}
          <select
            value={walletFilter}
            onChange={(e) => setWalletFilter(e.target.value)}
            className="theme-input border rounded-lg px-2.5 py-1 text-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Wallets</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="theme-input border rounded-lg px-2.5 py-1 text-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
            <option value="transfer">Inter Transfer</option>
          </select>

          {/* Body Add Entry Button */}
          {onAddTransaction && (
            <button
              onClick={onAddTransaction}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-xs active:scale-95 shrink-0"
              title="Add New Transaction Entry"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Entry</span>
            </button>
          )}

        </div>
      </div>

      {/* Transactions List / Table */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8 theme-text-muted text-xs bg-slate-100/50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800/50">
          No transactions match the selected filters for {selectedMonthLabel}.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] min-w-[620px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 theme-text-muted font-extrabold uppercase text-[9px] tracking-wider bg-slate-100/70 dark:bg-slate-950/50">
                <th className="py-2 px-2.5">Date</th>
                <th className="py-2 px-2.5">Type</th>
                <th className="py-2 px-2.5">Wallet(s)</th>
                <th className="py-2 px-2.5">Category</th>
                <th className="py-2 px-2.5">Description</th>
                <th className="py-2 px-2.5 text-right">Amount</th>
                <th className="py-2 px-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {filteredTransactions.map((tx) => {
                const srcWallet = walletMap.get(tx.walletId);
                const targetWallet = tx.targetWalletId ? walletMap.get(tx.targetWalletId) : null;

                return (
                  <tr key={tx.id} className="hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition">
                    
                    {/* Date */}
                    <td className="py-2 px-2.5 font-mono theme-text-muted whitespace-nowrap">
                      {tx.date}
                    </td>

                    {/* Type Badge */}
                    <td className="py-2 px-2.5 whitespace-nowrap">
                      {tx.type === 'income' && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-[9px] font-bold">
                          <ArrowDownRight className="w-2.5 h-2.5" /> Income
                        </span>
                      )}
                      {tx.type === 'expense' && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[9px] font-bold">
                          <ArrowUpRight className="w-2.5 h-2.5" /> Expense
                        </span>
                      )}
                      {tx.type === 'transfer' && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[9px] font-bold">
                          <ArrowRightLeft className="w-2.5 h-2.5" /> Transfer
                        </span>
                      )}
                    </td>

                    {/* Wallet */}
                    <td className="py-2 px-2.5 font-semibold whitespace-nowrap">
                      {tx.type === 'transfer' ? (
                        <span className="flex items-center gap-1">
                          <span className="text-amber-600 dark:text-amber-400">{srcWallet?.name || 'Wallet'}</span>
                          <span className="theme-text-muted">→</span>
                          <span className="text-indigo-600 dark:text-indigo-400">{targetWallet?.name || 'Wallet'}</span>
                        </span>
                      ) : (
                        <span>{srcWallet?.name || 'Wallet'}</span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-2 px-2.5 font-bold">
                      {tx.category}
                    </td>

                    {/* Description */}
                    <td className="py-2 px-2.5 theme-text-muted max-w-xs truncate">
                      {tx.description || '—'}
                    </td>

                    {/* Amount */}
                    <td className="py-2 px-2.5 text-right font-mono font-bold text-xs whitespace-nowrap">
                      {tx.type === 'income' && (
                        <span className="text-teal-600 dark:text-teal-400">+৳{tx.amount.toLocaleString()}</span>
                      )}
                      {tx.type === 'expense' && (
                        <span className="text-rose-600 dark:text-rose-400">-৳{tx.amount.toLocaleString()}</span>
                      )}
                      {tx.type === 'transfer' && (
                        <span className="text-indigo-600 dark:text-indigo-400">৳{tx.amount.toLocaleString()}</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-2.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="p-1 theme-text-muted hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition"
                          title="Edit transaction"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this transaction entry?')) {
                              onDeleteTransaction(tx.id);
                            }
                          }}
                          className="p-1 theme-text-muted hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
export { TransactionModal };
