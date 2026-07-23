import React from 'react';
import { WalletStats, Wallet } from '../types/finance';
import { 
  CreditCard, 
  Smartphone, 
  Landmark, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowRightLeft,
  ChevronRight,
  Edit2
} from 'lucide-react';

interface WalletListProps {
  walletStats: WalletStats[];
  onSelectWallet: (wallet: Wallet) => void;
  onOpenAddWalletModal: () => void;
  onOpenEditInitialBalance?: (wallet: Wallet) => void;
}

export const WalletList: React.FC<WalletListProps> = ({
  walletStats,
  onSelectWallet,
  onOpenAddWalletModal,
  onOpenEditInitialBalance,
}) => {
  const getWalletTypeIcon = (type: string) => {
    switch (type) {
      case 'mobile_banking':
        return <Smartphone className="w-4 h-4 text-rose-400" />;
      case 'bank':
        return <Landmark className="w-4 h-4 text-blue-400" />;
      case 'cash':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      default:
        return <CreditCard className="w-4 h-4 text-purple-400" />;
    }
  };

  const getWalletTypeBg = (type: string) => {
    switch (type) {
      case 'mobile_banking':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-300';
      case 'bank':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-300';
      case 'cash':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300';
      default:
        return 'bg-purple-500/10 border-purple-500/20 text-purple-300';
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
            Wallets &amp; Balances
          </h2>
          <p className="text-[11px] theme-text-muted">
            Tap a wallet to inspect history &amp; adjust initial balance
          </p>
        </div>
        <button
          onClick={onOpenAddWalletModal}
          className="flex items-center gap-1 px-2.5 py-1 theme-subtle-btn hover:text-emerald-600 dark:hover:text-emerald-400 border rounded-lg text-xs font-semibold transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Wallet</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {walletStats.map((stat) => {
          const { wallet, initialBalance, totalIncome, totalExpense, transfersIn, transfersOut, currentBalance } = stat;
          const netTransfer = transfersIn - transfersOut;

          return (
            <div
              key={wallet.id}
              onClick={() => onSelectWallet(wallet)}
              className="theme-card hover:border-emerald-500/50 border rounded-xl p-3 cursor-pointer transition shadow-xs group relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: wallet.color || '#10B981' }}
              />

              <div className="flex items-center justify-between mb-2 pl-1.5">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border ${getWalletTypeBg(wallet.type)}`}>
                    {getWalletTypeIcon(wallet.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                      {wallet.name}
                    </h3>
                    <span className="text-[9px] theme-text-muted uppercase tracking-wider font-semibold block">
                      {wallet.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {onOpenEditInitialBalance && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEditInitialBalance(wallet);
                      }}
                      className="px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-md transition flex items-center gap-1 shrink-0"
                      title="Edit Starting / Initial Balance"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                      <span>Edit Initial</span>
                    </button>
                  )}
                  <ChevronRight className="w-4 h-4 theme-text-muted group-hover:text-emerald-500 transition" />
                </div>
              </div>

              {/* Balances breakdown */}
              <div className="pl-1.5 space-y-1 border-t border-slate-200 dark:border-slate-800/80 pt-2 text-[11px]">
                <div className="flex items-center justify-between theme-text-muted group/init">
                  <span className="flex items-center gap-1">
                    <span>Initial:</span>
                    {onOpenEditInitialBalance && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEditInitialBalance(wallet);
                        }}
                        className="p-1 rounded hover:bg-emerald-500/15 text-slate-400 hover:text-emerald-500 transition"
                        title="Edit Initial Starting Balance"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </span>
                  <span className="font-mono font-bold theme-text">
                    ৳{initialBalance.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between theme-text-muted">
                  <span className="flex items-center gap-0.5 text-teal-600 dark:text-teal-400">
                    <ArrowDownRight className="w-3 h-3" /> Income:
                  </span>
                  <span className="font-mono text-teal-600 dark:text-teal-400">+৳{totalIncome.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between theme-text-muted">
                  <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400">
                    <ArrowUpRight className="w-3 h-3" /> Expense:
                  </span>
                  <span className="font-mono text-rose-600 dark:text-rose-400">-৳{totalExpense.toLocaleString()}</span>
                </div>

                {netTransfer !== 0 && (
                  <div className="flex items-center justify-between theme-text-muted">
                    <span className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400">
                      <ArrowRightLeft className="w-3 h-3" /> Transfer:
                    </span>
                    <span className={`font-mono ${netTransfer >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {netTransfer >= 0 ? '+' : ''}৳{netTransfer.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-slate-800 mt-1.5">
                  <span className="font-bold text-[11px]">Balance:</span>
                  <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                    ৳{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

            </div>
          );
        })}

        {/* Add Wallet Card */}
        <div
          onClick={onOpenAddWalletModal}
          className="theme-card hover:bg-slate-100 dark:hover:bg-slate-900/80 border border-dashed hover:border-emerald-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition theme-text-muted hover:text-emerald-600 dark:hover:text-emerald-400 min-h-[140px]"
        >
          <div className="p-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-1.5">
            <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-xs font-semibold">Add Custom Wallet</span>
          <span className="text-[10px] theme-text-muted text-center mt-0.5">
            Create card, e-wallet, or account
          </span>
        </div>
      </div>
    </div>
  );
};
