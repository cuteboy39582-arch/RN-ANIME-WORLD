import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Lock, KeyRound, ArrowLeft, ArrowRight, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { BackButton } from './BackButton';

interface AdminAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onBackToHome: () => void;
  isAccessDeniedView?: boolean;
}

export const AdminAccessModal: React.FC<AdminAccessModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onBackToHome,
  isAccessDeniedView = false,
}) => {
  const [uid, setUid] = useState('39090357');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen && !isAccessDeniedView) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (uid.trim() !== '39090357') {
        throw new Error('Access Denied: Only authorized website owner UID 39090357 is permitted.');
      }
      await api.adminLogin(uid.trim(), password);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Full-screen Access Denied page when an unauthorized user attempts direct access
  if (isAccessDeniedView) {
    return (
      <div className="min-h-screen bg-[#090B12] text-white flex flex-col items-center justify-center p-4">
        <div className="absolute top-6 left-6">
          <BackButton onClick={onBackToHome} label="Return to Home" />
        </div>

        <div className="w-full max-w-md bg-[#111522] border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-950/30 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="font-heading font-black text-2xl text-white">
              Access Denied
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              This area is restricted strictly to the verified website owner.
              Administrative privileges and media uploads require server-side Owner UID authentication.
            </p>
          </div>

          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-left text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Required Identity:</span>
              <span className="font-mono font-bold text-purple-400">Website Owner</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Authorized UID:</span>
              <span className="font-mono font-bold text-cyan-400">39090357</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Owner UID</label>
              <input
                type="text"
                required
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                placeholder="39090357"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-sm text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Server-Side Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter owner password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.01]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Unlock Admin Panel</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2">
            <button
              onClick={onBackToHome}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              ← Back to RN ANIME WORLD
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modal dialog view
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#111522] border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/40 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1.5 mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/50 text-purple-300 p-2 shadow-lg mb-1">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-black text-xl text-white">
            Private Owner Login
          </h2>
          <p className="text-xs text-slate-400">
            Provide authorized Owner UID <span className="font-mono text-cyan-300">39090357</span> and server password to unlock the Admin Panel.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Owner UID</label>
            <input
              type="text"
              required
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="39090357"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-sm text-cyan-300 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Owner server password"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.01]"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Admin Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
