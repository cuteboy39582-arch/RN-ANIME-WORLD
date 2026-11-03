import React, { useState } from 'react';
import { X, User as UserIcon, Shield, Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import { User } from '../types/anime';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const user = await api.login(email);
      if (username) {
        user.username = username;
      }
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'admin' | 'user') => {
    setIsLoading(true);
    const demoEmail = role === 'admin' ? 'admin@rnanime.world' : 'user@rnanime.world';
    try {
      const user = await api.login(demoEmail);
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      console.error('Quick login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#111522] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/40 text-slate-100">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Logo Header */}
        <div className="text-center space-y-1 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1.5px] shadow-lg shadow-purple-600/30 mb-2">
            <div className="w-full h-full bg-[#090B12] rounded-[14px] flex items-center justify-center">
              <span className="font-heading font-black text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                RN
              </span>
            </div>
          </div>
          <h2 className="font-heading font-black text-2xl text-white">
            {isSignUp ? 'Join RN ANIME WORLD' : 'Welcome to RN ANIME WORLD'}
          </h2>
          <p className="text-xs text-slate-400">
            {isSignUp ? 'Create your free account to track favorites and watch history' : 'Sign in to sync your watch progress across all devices'}
          </p>
        </div>

        {/* Quick Demo Switcher Buttons */}
        <div className="space-y-2 mb-6">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            Instant Demo Access
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemo('admin')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Login as Admin</span>
            </button>
            <button
              onClick={() => handleQuickDemo('user')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <UserIcon className="w-4 h-4 text-blue-400" />
              <span>Login as User</span>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#111522] px-3 text-[11px] text-slate-500 uppercase tracking-wider">
            or use email
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 block">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. SungJinwoo99"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                defaultValue="password123"
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
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
                <span>{isSignUp ? 'Create Free Account' : 'Sign In to RN ANIME WORLD'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-cyan-400 hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
};
