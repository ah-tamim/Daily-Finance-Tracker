import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { loginWithGoogle, logout } from '../lib/firebase';
import { 
  Wallet as WalletIcon, 
  LogOut, 
  Download, 
  Trash2, 
  Plus, 
  Wifi, 
  WifiOff, 
  Sparkles,
  User as UserIcon,
  Calendar,
  Layers,
  Palette,
  CreditCard,
  PieChart
} from 'lucide-react';

interface HeaderProps {
  user: User | null;
  selectedMonth: string; // YYYY-MM or 'ALL'
  availableMonths: string[];
  onMonthChange: (month: string) => void;
  onOpenTransactionModal: () => void;
  onOpenWalletModal: () => void;
  onOpenExportModal: () => void;
  onOpenCleanupModal: () => void;
  onOpenThemeModal: () => void;
  onOpenDebtModal: () => void;
  onOpenBudgetModal: () => void;
  onOpenProfileModal?: () => void;
  onOpenAuthModal?: () => void;
  activeDebtCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  selectedMonth,
  availableMonths,
  onMonthChange,
  onOpenTransactionModal,
  onOpenWalletModal,
  onOpenExportModal,
  onOpenCleanupModal,
  onOpenThemeModal,
  onOpenDebtModal,
  onOpenBudgetModal,
  onOpenProfileModal,
  onOpenAuthModal,
  activeDebtCount = 0,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await loginWithGoogle();
    } catch (err: any) {
      console.warn('Google login popup cancelled or error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoLogin = () => {
    // Guest mode is active by default when not logged into Google
    if (user) {
      logout();
    }
  };

  const formatMonthLabel = (mKey: string) => {
    if (mKey === 'ALL') return 'All Time';
    const [year, month] = mKey.split('-');
    if (!year || !month) return mKey;
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <header className="sticky top-0 z-30 theme-header backdrop-blur-md border-b px-3 py-2 sm:px-5 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        
        {/* Brand & Online Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/25 flex items-center justify-center">
              <WalletIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight theme-text flex items-center gap-2">
                Daily Finance Tracker
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-semibold tracking-wide ${
                  isOnline 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}>
                  {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {isOnline ? 'Online Syncing' : 'Offline Mode (Local Storage)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Month Selector & Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 theme-input px-2.5 py-1 rounded-lg border text-xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer text-xs"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Action Buttons */}
          <button
            onClick={onOpenTransactionModal}
            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition active:scale-95 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Entry</span>
          </button>

          <button
            onClick={onOpenWalletModal}
            className="flex items-center gap-1 px-2.5 py-1 theme-subtle-btn rounded-lg text-xs font-medium border transition"
            title="Add Custom Wallet"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>+ Wallet</span>
          </button>

          <button
            onClick={onOpenDebtModal}
            className="flex items-center gap-1.5 px-2.5 py-1 theme-subtle-btn rounded-lg text-xs font-medium border transition relative"
            title="Manage Debts, EMI & Loans"
          >
            <CreditCard className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Debts &amp; EMI</span>
            {activeDebtCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                {activeDebtCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenBudgetModal}
            className="flex items-center gap-1.5 px-2.5 py-1 theme-subtle-btn rounded-lg text-xs font-medium border transition"
            title="Manage Weekly & Monthly Budgets"
          >
            <PieChart className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Budgets</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1 px-2.5 py-1 theme-subtle-btn rounded-lg text-xs font-medium border transition"
            title="Export as XML"
          >
            <Download className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>XML</span>
          </button>

          <button
            onClick={onOpenThemeModal}
            className="flex items-center gap-1 px-2.5 py-1 theme-subtle-btn rounded-lg text-xs font-medium border transition"
            title="Change Theme & Appearance"
          >
            <Palette className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Theme</span>
          </button>

          <button
            onClick={onOpenCleanupModal}
            className="flex items-center gap-1 px-2.5 py-1 theme-subtle-btn hover:text-rose-600 dark:hover:text-rose-300 rounded-lg text-xs font-medium border transition"
            title="Clear data older than 6 months"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Cleanup</span>
          </button>

          {/* User Auth Info & Profile */}
          <div className="flex items-center ml-1 border-l border-slate-200 dark:border-slate-800/80 pl-2.5">
            {user ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenProfileModal}
                  className="flex items-center gap-2 p-1 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded-xl transition cursor-pointer text-left group"
                  title="Open Profile & Settings"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-7 h-7 rounded-full border border-emerald-500/40 group-hover:scale-105 transition"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[11px] border border-emerald-500/30 group-hover:scale-105 transition">
                      {user.email?.slice(0, 2).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="text-left max-w-[100px]">
                    <p className="text-[11px] font-bold truncate theme-text group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                      {user.displayName || user.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-[9px] theme-text-muted truncate">
                      Profile &amp; Account
                    </p>
                  </div>
                </button>
                <button
                  onClick={logout}
                  className="p-1.5 theme-subtle-btn rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-sm"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={onOpenProfileModal}
                  className="flex items-center gap-1 px-2 py-1 theme-subtle-btn rounded-lg text-xs font-medium border"
                  title="Profile & Session Info"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Profile</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
