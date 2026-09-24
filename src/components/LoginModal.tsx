import React, { useState } from 'react';
import { Mail, X, ArrowRight, Loader2, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'selection' | 'email'>('selection');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setErrorMsg(res.error || 'Google authentication was cancelled or unavailable.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = isSignUp
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);

      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setErrorMsg(res.error || (isSignUp ? 'Sign up failed' : 'Invalid email or password'));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Modal Window matching user's Think Creative mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="relative w-full max-w-[420px] rounded-[36px] overflow-hidden border border-[#ff1828]/35 bg-[#080204] shadow-[0_0_60px_rgba(255,24,40,0.3),0_20px_60px_rgba(0,0,0,0.9)] z-10 flex flex-col my-auto"
        >
          {/* Top Cavernous Atmosphere & Ambient Crimson Rays */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Ambient Red Rim Light */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#ff1828]/25 blur-3xl rounded-full" />
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#ff1828]/20 blur-3xl rounded-full" />
            {/* Angular Laser Streak */}
            <div className="absolute -top-10 -left-10 w-96 h-1 bg-gradient-to-r from-transparent via-[#ff1828]/60 to-transparent rotate-45 transform" />
            {/* Wet Ground Reflection at bottom */}
            <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-[#ff1828]/15 via-transparent to-transparent opacity-80" />
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Main Visual Header Area */}
          <div className="relative pt-10 pb-6 px-6 flex flex-col items-center text-center select-none">
            {/* Avatar with Crimson Glowing Ring (matching user image) */}
            <div className="relative mb-5 flex items-center justify-center">
              {/* Outer Neon Glow Circle */}
              <div className="absolute w-36 h-36 rounded-full border-2 border-[#ff1828] shadow-[0_0_35px_rgba(255,24,40,0.8),inset_0_0_20px_rgba(255,24,40,0.4)] animate-pulse" />
              
              {/* Angular Neon Rim Light Spike */}
              <div className="absolute -top-3 -right-3 w-10 h-1 bg-[#ff1828] rotate-45 shadow-[0_0_15px_#ff1828]" />
              <div className="absolute -bottom-2 -left-3 w-8 h-1 bg-[#ff1828] -rotate-45 shadow-[0_0_15px_#ff1828]" />

              {/* 3D Avatar Image */}
              <div className="w-28 h-28 rounded-full overflow-hidden bg-black/60 border border-white/20 relative z-10 flex items-center justify-center shadow-2xl">
                <img
                  src="/avatar_cutout.png"
                  alt="Think Creative Avatar"
                  className="w-full h-full object-cover object-top scale-110 translate-y-1"
                  onError={(e) => {
                    // Fallback to stylized SVG avatar if image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>

            {/* Title: THINK CREATIVE (styled exactly as mockup) */}
            <div className="space-y-0.5 tracking-wider">
              <h2
                className="text-2xl sm:text-3xl font-black text-white uppercase tracking-[0.2em]"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                THINK
              </h2>
              <h2
                className="text-2xl sm:text-3xl font-black text-[#ff1828] uppercase tracking-[0.2em] drop-shadow-[0_0_25px_rgba(255,24,40,0.85)]"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                CREATIVE
              </h2>
            </div>

            <p className="mt-2 text-[11px] text-zinc-400 max-w-[260px] leading-relaxed">
              Sign in to sync your chats, code snapshots, and project blueprints to your cloud database.
            </p>
          </div>

          {/* Content Body: Buttons or Email Form */}
          <div className="relative px-6 pb-8 z-10 flex flex-col items-center">
            {errorMsg && (
              <div className="w-full mb-4 p-3 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs text-center">
                {errorMsg}
              </div>
            )}

            {mode === 'selection' ? (
              <div className="w-full space-y-3.5">
                {/* 1. Continue with Email (Pill Button with Crimson Rim Glow) */}
                <button
                  type="button"
                  onClick={() => setMode('email')}
                  className="w-full h-14 rounded-full bg-black/55 hover:bg-black/80 border border-[#ff1828]/70 hover:border-[#ff1828] shadow-[0_0_22px_rgba(255,24,40,0.35)] hover:shadow-[0_0_32px_rgba(255,24,40,0.6)] flex items-center px-6 gap-4 text-white font-semibold text-sm transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-6 flex items-center justify-center text-zinc-200 group-hover:text-white">
                    <Mail size={18} />
                  </div>
                  <div className="h-5 w-[1px] bg-white/20" />
                  <span className="flex-1 text-left tracking-wide">Continue with Email</span>
                  <ArrowRight size={16} className="text-zinc-400 group-hover:text-[#ff1828] group-hover:translate-x-1 transition-all" />
                </button>

                {/* 2. Continue with Google (Pill Button with Colorful G Logo & Rim Glow) */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleSignIn}
                  className="w-full h-14 rounded-full bg-black/55 hover:bg-black/80 border border-[#ff1828]/70 hover:border-[#ff1828] shadow-[0_0_22px_rgba(255,24,40,0.35)] hover:shadow-[0_0_32px_rgba(255,24,40,0.6)] flex items-center px-6 gap-4 text-white font-semibold text-sm transition-all duration-300 cursor-pointer group disabled:opacity-50"
                >
                  <div className="w-6 flex items-center justify-center">
                    {loading ? (
                      <Loader2 size={18} className="animate-spin text-white" />
                    ) : (
                      /* Google Official Colorful SVG Logo */
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                    )}
                  </div>
                  <div className="h-5 w-[1px] bg-white/20" />
                  <span className="flex-1 text-left tracking-wide">Continue with Google</span>
                  <ArrowRight size={16} className="text-zinc-400 group-hover:text-[#ff1828] group-hover:translate-x-1 transition-all" />
                </button>

                {/* 3. Non-compulsory / Guest access: Use freely without login */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer py-1.5 px-4 rounded-full hover:bg-white/5"
                  >
                    Continue as Guest <span className="text-zinc-500">• (Login is optional)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Email Input Form */
              <form onSubmit={handleEmailSubmit} className="w-full space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-[#ff1828]/50 text-white text-sm focus:outline-none focus:border-[#ff1828] focus:ring-1 focus:ring-[#ff1828]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-[#ff1828]/50 text-white text-sm focus:outline-none focus:border-[#ff1828] focus:ring-1 focus:ring-[#ff1828]"
                  />
                </div>

                <div className="pt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('selection')}
                    className="px-4 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-semibold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 rounded-full bg-[#ff1828] hover:bg-[#e01423] text-white font-bold text-xs shadow-[0_0_20px_rgba(255,24,40,0.6)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : isSignUp ? (
                      'Create Account'
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {isSignUp
                      ? 'Already have an account? Sign In'
                      : "Don't have an account? Create one"}
                  </button>
                </div>
              </form>
            )}

            {/* Subtle security & free-usage indicator */}
            <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-center gap-1.5 text-[10px] text-zinc-500">
              <ShieldCheck size={12} className="text-[#ff1828]" />
              <span>Firebase Cloud Authentication • Free & Optional</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
