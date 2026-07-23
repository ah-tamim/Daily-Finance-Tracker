import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  LogIn, 
  UserPlus, 
  Github, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGithub, 
  loginWithGoogle 
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError(null);
    setSuccessMsg(null);
  };

  const handleModeSwitch = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    resetForm();
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      if (mode === 'signin') {
        await loginWithEmail(email.trim(), password);
        setSuccessMsg('Successfully signed in!');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 500);
      } else {
        await registerWithEmail(email.trim(), password, displayName.trim());
        setSuccessMsg('Account created successfully!');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 500);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        setError('Email & Password authentication is not enabled in your Firebase console. Please enable Email/Password under Firebase Console -> Authentication -> Sign-in method, or use Guest mode below.');
      } else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Try signing in instead.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later or reset your password.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setError(null);
    try {
      setIsLoading(true);
      const user = await loginWithGithub();
      if (user) {
        onClose();
        resetForm();
      }
    } catch (err: any) {
      console.error('GitHub Auth error:', err);
      const code = err?.code || '';
      if (code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in Firebase OAuth settings. Please use Email & Password registration or Guest mode, or deploy with your own Firebase project configuration.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('GitHub Sign-In is not enabled in your Firebase project console. Please enable GitHub under Firebase Console -> Authentication -> Sign-in method.');
      } else {
        setError('Failed to sign in with GitHub. Please check pop-up permissions or try Google/Email login.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      setIsLoading(true);
      const user = await loginWithGoogle();
      if (user) {
        onClose();
        resetForm();
      }
    } catch (err: any) {
      console.error('Google Auth error:', err);
      const code = err?.code || '';
      if (code === 'auth/unauthorized-domain') {
        setError('Google Auth requires "dailyfinance-tracker.netlify.app" to be added to Firebase Authorized Domains. Since AI Studio owns the temporary Firebase starter project, please use Email & Password registration or Guest Mode, OR use your own Firebase project config.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled in your Firebase project console. Please enable Google under Firebase Console -> Authentication -> Sign-in method.');
      } else {
        setError('Failed to sign in with Google. Please try Email & Password or Guest mode.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="min-h-full flex items-center justify-center">
        <div className="theme-modal border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative my-auto animate-in zoom-in-95 duration-200">
          
          {/* Top Bar with Close button */}
          <div className="p-5 pb-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold theme-text">
                  {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h3>
                <p className="text-[11px] theme-text-muted">
                  {mode === 'signin' 
                    ? 'Sign in to access your synchronized financial data' 
                    : 'Register a new account to sync across devices'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="p-1.5 theme-subtle-btn rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="p-5 pb-2">
            <div className="grid grid-cols-2 p-1 bg-slate-200/70 dark:bg-slate-900/80 rounded-xl border border-slate-300/60 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleModeSwitch('signin')}
                className={`py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  mode === 'signin'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'theme-text-muted hover:theme-text'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('signup')}
                className={`py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  mode === 'signup'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'theme-text-muted hover:theme-text'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-5 pt-2 space-y-4">
            
            {/* Error & Success Feedback Banners */}
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
                {(error.includes('Firebase') || error.includes('not enabled')) && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      resetForm();
                    }}
                    className="mt-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] self-start transition shadow-sm"
                  >
                    Continue as Guest / Offline Mode →
                  </button>
                )}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold theme-text mb-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="theme-input w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required={mode === 'signup'}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold theme-text mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="theme-input w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold theme-text mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="theme-input w-full pl-9 pr-10 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : mode === 'signin' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In with Email</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                <span className="px-2 bg-slate-100 dark:bg-slate-900 theme-text-muted">
                  Or Sign In With
                </span>
              </div>
            </div>

            {/* Social Authentication Options */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleGithubLogin}
                disabled={isLoading}
                className="py-2 px-3 theme-card hover:bg-slate-200 dark:hover:bg-slate-800 border rounded-xl text-xs font-semibold theme-text transition flex items-center justify-center gap-2"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="py-2 px-3 theme-card hover:bg-slate-200 dark:hover:bg-slate-800 border rounded-xl text-xs font-semibold theme-text transition flex items-center justify-center gap-2"
              >
                {/* Custom Google Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>
            </div>

            {/* Guest Sandbox mode */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                className="text-[11px] theme-text-muted hover:theme-text transition underline underline-offset-2"
              >
                Continue in Offline / Guest Mode
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
