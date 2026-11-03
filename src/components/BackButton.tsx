import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  variant?: 'floating' | 'inline' | 'pill' | 'header';
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label = 'Back',
  className = '',
  variant = 'pill',
}) => {
  if (variant === 'floating') {
    return (
      <button
        onClick={onClick}
        type="button"
        className={`fixed top-20 left-4 sm:left-6 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#111522]/90 hover:bg-[#181E31] border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 hover:text-white shadow-xl shadow-black/60 backdrop-blur-md text-xs font-bold transition-all hover:scale-105 active:scale-95 group ${className}`}
        title="Go back to previous page"
        aria-label="Go back one step"
      >
        <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
        <span>{label}</span>
      </button>
    );
  }

  if (variant === 'header') {
    return (
      <button
        onClick={onClick}
        type="button"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 hover:text-white text-xs font-semibold backdrop-blur-md transition-all hover:scale-[1.02] active:scale-95 group ${className}`}
        title="Go back to previous page"
        aria-label="Go back one step"
      >
        <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      type="button"
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-white text-xs font-bold shadow-md transition-all hover:scale-[1.02] active:scale-95 group ${className}`}
      title="Go back to previous page"
      aria-label="Go back one step"
    >
      <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
      <span>{label}</span>
    </button>
  );
};
