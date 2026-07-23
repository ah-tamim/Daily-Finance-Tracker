import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  LogOut, 
  Cloud, 
  Wallet as WalletIcon, 
  Receipt, 
  CreditCard, 
  PieChart, 
  Edit2, 
  Check, 
  Copy, 
  Palette, 
  Download, 
  Clock, 
  Sparkles,
  Lock,
  Globe,
  Smartphone
} from 'lucide-react';
import { logout, updateUserProfileName, loginWithGoogle } from '../lib/firebase';
import { ThemeId, THEMES } from '../utils/theme';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  walletsCount: number;
  transactionsCount: number;
  activeBudgetsCount: number;
  activeDebtsCount: number;
  totalBalance: number;
  onOpenThemeModal: () => void;
  onOpenExportModal: () => void;
  onOpenAuthModal?: () => void;
  onOpenInstallModal?: () => void;
  currentTheme: ThemeId;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  walletsCount,
  transactionsCount,
  activeBudgetsCount,
  activeDebtsCount,
  totalBalance,
  onOpenThemeModal,
  onOpenExportModal,
  onOpenAuthModal,
  onOpenInstallModal,
  currentTheme,
}) => {
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [displayNameInput, setDisplayNameInput] = useState<string>(
    user?.displayName || user?.email?.split('@')[0] || 'Guest User'
  );
  const [isSavingName, setIsSavingName] = useState<boolean>(false);
  const [copiedUid, setCopiedUid] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  const handleSaveName = async () => {
    if (!displayNameInput.trim()) return;
    try {
      setIsSavingName(true);
      await updateUserProfileName(displayNameInput.trim());
      setIsEditingName(false);
    } catch (err) {
      console.error('Failed to update display name:', err);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCopyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await loginWithGoogle();
    } catch (err) {
      console.error('Google login error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    onClose();
  };

  const formattedCreationTime = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const formattedLastSignIn = user?.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="min-h-full flex items-center justify-center">
        <div className="theme-modal border rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
          
          {/* Header Banner */}
          <div className="relative p-6 border-b bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-purple-500/10">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 theme-subtle-btn rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* User Photo / Avatar */}
              <div className="relative shrink-0">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User Avatar'}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-2xl border-2 border-emerald-400/30 shadow-md">
                    {user?.email ? user.email.slice(0, 2).toUpperCase() : <UserIcon className="w-10 h-10" />}
                  </div>
                )}
                {user && (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-slate-900 text-[10px]" title="Account Verified">
                    <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                  </span>
                )}
              </div>

              {/* Identity Details */}
              <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  {isEditingName ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={displayNameInput}
                        onChange={(e) => setDisplayNameInput(e.target.value)}
                        className="theme-input px-3 py-1 rounded-lg text-sm font-semibold border focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={isSavingName}
                        className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition text-xs font-semibold"
                        title="Save Name"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsEditingName(false)}
                        className="p-1.5 theme-subtle-btn rounded-lg text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <h2 className="text-xl font-bold theme-text flex items-center gap-2 truncate">
                      <span>{user?.displayName || (user?.email ? user.email.split('@')[0] : 'Guest User')}</span>
                      {user && (
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="p-1 text-slate-400 hover:text-emerald-500 rounded transition"
                          title="Edit Display Name"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </h2>
                  )}

                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    user 
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}>
                    {user ? (user.providerData[0]?.providerId === 'password' ? 'Email Auth' : 'Cloud Auth') : 'Guest Mode'}
                  </span>
                </div>

                <p className="text-xs theme-text-muted flex items-center justify-center sm:justify-start gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>{user?.email || 'No email attached (Local session)'}</span>
                </p>

                {user?.uid && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
                    <span className="text-[10px] font-mono theme-text-muted bg-slate-200/60 dark:bg-slate-800/60 px-2 py-0.5 rounded border">
                      UID: {user.uid.slice(0, 14)}...
                    </span>
                    <button
                      onClick={handleCopyUid}
                      className="text-[11px] text-indigo-500 hover:text-indigo-400 flex items-center gap-1 font-medium transition"
                      title="Copy full UID"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedUid ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6">
            
            {/* Sync & Security Card */}
            <div className="theme-card p-4 rounded-2xl border flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${
                  user 
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25' 
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25'
                }`}>
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold theme-text flex items-center gap-1.5">
                    <span>{user ? 'Cloud Firestore Sync Active' : 'Local Storage Mode'}</span>
                    <span className={`w-2 h-2 rounded-full animate-pulse ${user ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  </h4>
                  <p className="text-[11px] theme-text-muted mt-0.5">
                    {user 
                      ? 'All wallets, transactions, debts & budgets automatically sync with your account.' 
                      : 'Data is stored locally in browser cache. Sign in to sync across devices.'}
                  </p>
                </div>
              </div>

              {!user && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuthModal?.();
                  }}
                  className="shrink-0 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Account Usage Metrics Grid */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider theme-text-muted mb-3 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Financial Overview Statistics</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="theme-card p-3 rounded-2xl border text-center space-y-1">
                  <div className="w-7 h-7 mx-auto rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/25">
                    <WalletIcon className="w-4 h-4" />
                  </div>
                  <p className="text-lg font-black theme-text">{walletsCount}</p>
                  <p className="text-[10px] theme-text-muted font-medium">Wallets</p>
                </div>

                <div className="theme-card p-3 rounded-2xl border text-center space-y-1">
                  <div className="w-7 h-7 mx-auto rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/25">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <p className="text-lg font-black theme-text">{transactionsCount}</p>
                  <p className="text-[10px] theme-text-muted font-medium">Entries</p>
                </div>

                <div className="theme-card p-3 rounded-2xl border text-center space-y-1">
                  <div className="w-7 h-7 mx-auto rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/25">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <p className="text-lg font-black theme-text">{activeDebtsCount}</p>
                  <p className="text-[10px] theme-text-muted font-medium">Active Debts</p>
                </div>

                <div className="theme-card p-3 rounded-2xl border text-center space-y-1">
                  <div className="w-7 h-7 mx-auto rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/25">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <p className="text-lg font-black theme-text">{activeBudgetsCount}</p>
                  <p className="text-[10px] theme-text-muted font-medium">Budgets</p>
                </div>
              </div>

              {/* Total Balance Banner */}
              <div className="mt-3 p-3.5 theme-card rounded-2xl border flex items-center justify-between">
                <span className="text-xs font-semibold theme-text-muted">Combined Net Balance:</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  ৳{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Quick Preferences & Settings */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider theme-text-muted flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Account Preferences &amp; Tools</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() => {
                    onClose();
                    onOpenThemeModal();
                  }}
                  className="theme-card p-3 rounded-2xl border hover:border-emerald-500/50 transition text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold theme-text group-hover:text-emerald-500 transition truncate">App Theme</p>
                      <p className="text-[10px] theme-text-muted truncate">{currentThemeObj.name}</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenExportModal();
                  }}
                  className="theme-card p-3 rounded-2xl border hover:border-emerald-500/50 transition text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold theme-text group-hover:text-emerald-500 transition truncate">Export Records</p>
                      <p className="text-[10px] theme-text-muted truncate">XML / Backup</p>
                    </div>
                  </div>
                </button>

                {onOpenInstallModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenInstallModal();
                    }}
                    className="theme-card p-3 rounded-2xl border border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/5 transition text-left flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold theme-text group-hover:text-emerald-500 transition truncate">Install App</p>
                        <p className="text-[10px] theme-text-muted truncate">Mobile / PWA</p>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Account Metadata / Sign In Date */}
            {user && (formattedCreationTime || formattedLastSignIn) && (
              <div className="p-3 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border text-[11px] theme-text-muted flex flex-wrap items-center justify-between gap-2">
                {formattedCreationTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Member Since: {formattedCreationTime}</span>
                  </span>
                )}
                {formattedLastSignIn && (
                  <span>Last Active: {formattedLastSignIn}</span>
                )}
              </div>
            )}

            {/* Sign Out or Login Button */}
            <div className="pt-2 border-t flex items-center justify-between">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="w-full py-2.5 bg-rose-600/10 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl text-xs font-bold border border-rose-500/30 transition flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Account</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuthModal?.();
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Sign In / Register Account</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
