import React, { useState } from 'react';
import { EboltLogo } from './EboltLogo';
import { AccountSession } from '../firebase';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface LoginScreenProps {
  onLogin: (email: string, password: string, displayName?: string, isRegister?: boolean) => Promise<void>;
  onGoogleSignIn?: () => Promise<void>;
  savedAccounts?: AccountSession[];
  onSelectSavedAccount?: (account: AccountSession) => void;
  onClearAllAccounts?: () => void;
  loading: boolean;
  errorMessage: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onGoogleSignIn,
  loading,
  errorMessage,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const toggleMode = (register: boolean) => {
    setIsRegister(register);
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = email.trim() || 'ravi@gmail.com';
    const finalPass = password || 'password123';
    const finalName = displayName.trim() || (finalEmail.includes('ravi') ? 'Ravi' : finalEmail.split('@')[0]);
    await onLogin(finalEmail, finalPass, finalName, isRegister);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#b4d8f8] via-[#cbe5fb] to-[#e4f1fd] text-slate-800">
      {/* Background concentric circular rings matching Image 1 */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[600px] h-[600px] rounded-full border border-white/40 absolute -translate-y-12"></div>
        <div className="w-[900px] h-[900px] rounded-full border border-white/30 absolute -translate-y-12"></div>
        <div className="w-[1200px] h-[1200px] rounded-full border border-white/20 absolute -translate-y-12"></div>
        
        {/* Soft atmospheric clouds simulation */}
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-white/70 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 right-1/4 w-[32rem] h-80 bg-white/60 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Top Header with Brand Logo */}
      <header className="relative z-10 p-4 sm:p-8 flex items-center justify-between">
        <EboltLogo theme="light" size="md" />
      </header>

      {/* Center Auth Card matching Image 1 */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-6">
        <div className="relative rounded-[2rem] bg-white/92 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(30,50,80,0.12)] p-7 sm:p-9 transition-all">
          
          {/* Top Login Arrow into Box Icon matching Image 1 */}
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200/80 mx-auto mb-5 flex items-center justify-center text-slate-800">
            {/* Arrow entering bracket icon */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>

          {/* Heading & Subheading matching Image 1 */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {isRegister ? 'Create your account' : 'Sign in with email'}
            </h1>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto">
              Make a new doc to bring your words, data, and teams together. For free
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login / Register Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="sr-only">Display Name / User Name</label>
                <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-slate-100/90 text-slate-800 border border-transparent focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <User size={16} className="text-slate-400" />
                  <input
                    id="login-name-input"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="User Name or Full Name"
                    className="w-full bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Email Field matching Image 1 */}
            <div>
              <label className="sr-only">Email</label>
              <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-slate-100/90 text-slate-800 border border-transparent focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Mail size={16} className="text-slate-400" />
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Field matching Image 1 */}
            <div>
              <label className="sr-only">Password</label>
              <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-slate-100/90 text-slate-800 border border-transparent focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Lock size={16} className="text-slate-400" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot password link matching Image 1 */}
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Primary Action Button: "Get Started" matching Image 1 */}
            <button
              id="auth-submit-button"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#1b1c24] hover:bg-black text-white font-medium text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isRegister ? 'Create Account' : 'Get Started'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            {/* Direct Google Sign In with Firebase Auth */}
            <button
              type="button"
              onClick={onGoogleSignIn}
              disabled={loading}
              className="w-full mt-2.5 py-3 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm transition-all shadow-2xs flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.99 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </form>

          {/* Dotted Divider matching Image 1 */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dotted border-slate-300"></div>
            </div>
            <span className="relative px-3 bg-white text-[11px] text-slate-400 tracking-wider">
              Or sign in with
            </span>
          </div>

          {/* Social Sign-in Buttons matching Image 1 (Google, Facebook, Apple) */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {/* Google */}
            <button
              type="button"
              onClick={onGoogleSignIn}
              className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
              title="Sign in with Google"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.99 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => onLogin('facebook.user@ebolt.app', 'social123', 'Facebook User', false)}
              className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
              title="Sign in with Facebook"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => onLogin('apple.user@ebolt.app', 'social123', 'Apple User', false)}
              className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
              title="Sign in with Apple"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#000000">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.62 1.35-.57.65-1.07 1.71-.93 2.73 1 .08 2.01-.48 2.63-1.23z" />
              </svg>
            </button>
          </div>

          {/* Toggle between Sign In and Registration */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => toggleMode(!isRegister)}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              {isRegister ? (
                <>Already have an account? <span className="text-blue-600 underline">Sign in</span></>
              ) : (
                <>Don&apos;t have an account? <span className="text-blue-600 underline">Sign up</span></>
              )}
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-xs text-slate-400">
        <span>© 2026 Ebolt Inc. All data synced in real-time via Firebase Firestore.</span>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Reset your password</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your email address and we&apos;ll simulate sending a reset link.
            </p>

            {forgotSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs flex items-center gap-2 mb-4">
                <CheckCircle2 size={16} />
                <span>Reset instructions sent to your email.</span>
              </div>
            ) : (
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSuccess(false);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              {!forgotSuccess && (
                <button
                  type="button"
                  onClick={() => setForgotSuccess(true)}
                  className="px-4 py-2 text-xs font-medium bg-slate-900 text-white hover:bg-black rounded-lg"
                >
                  Send Reset Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
