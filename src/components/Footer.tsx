import React from 'react';
import { ShieldCheck, Heart, Radio, Film, Globe } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, payload?: any) => void;
  onOpenPrivacyModal?: (type: string) => void;
  onOpenOwnerAuth?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPrivacyModal, onOpenOwnerAuth }) => {
  return (
    <footer className="bg-[#07090F] border-t border-slate-800/80 text-slate-400 text-xs pt-12 pb-24 xl:pb-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Brand & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Tagline */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-[1px] shadow-md shadow-purple-600/30">
                <div className="w-full h-full bg-[#090B12] rounded-[9px] flex items-center justify-center">
                  <span className="font-heading font-black text-lg bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                    RN
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-xl tracking-tight leading-none bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                  RN
                </span>
                <span className="text-[9px] font-bold tracking-[0.2em] text-slate-300 uppercase leading-tight mt-0.5">
                  ANIME WORLD
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Explore the World of Anime. The premier discovery and streaming destination featuring high-definition Hindi, Tamil, Telugu dubbed anime, blockbusters, and classic series.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-cyan-300 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category', 'popular')} className="hover:text-cyan-300 transition-colors">
                  Popular Anime
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category', 'movies')} className="hover:text-cyan-300 transition-colors">
                  Anime Movies
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category', 'cartoon')} className="hover:text-cyan-300 transition-colors">
                  Cartoons & Classic
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category', 'top-rated')} className="hover:text-cyan-300 transition-colors">
                  Top Rated Masterpieces
                </button>
              </li>
            </ul>
          </div>

          {/* Indian Dubs */}
          <div className="space-y-2.5">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
              Language Dubs
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => onNavigate('category', 'hindi-dub')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Hindi Dubbed Anime</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category', 'tamil-dub')} className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Tamil Dubbed Anime</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category', 'telugu-dub')} className="hover:text-purple-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>Telugu Dubbed Anime</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category', 'trending')} className="hover:text-slate-200 transition-colors">
                  English Sub & Dub
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div className="space-y-2.5">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
              Legal & Community
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => onOpenPrivacyModal?.('about')} className="hover:text-cyan-300 transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPrivacyModal?.('dmca')} className="hover:text-cyan-300 transition-colors">
                  Copyright & DMCA Information
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPrivacyModal?.('privacy')} className="hover:text-cyan-300 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPrivacyModal?.('terms')} className="hover:text-cyan-300 transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPrivacyModal?.('contact')} className="hover:text-cyan-300 transition-colors">
                  Contact Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenOwnerAuth?.()}
                  className="hover:text-purple-400 text-slate-500 transition-colors text-[11px] flex items-center gap-1 mt-2"
                >
                  <span>Owner Portal (UID: 39090357)</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Strip */}
        <div className="pt-6 border-t border-slate-900 text-[11px] text-slate-500 leading-relaxed space-y-2">
          <p>
            <strong className="text-slate-400">RN ANIME WORLD</strong> is dedicated to authorized video distribution and anime culture promotion. All media streams are provided via open animation licenses and authorized streaming embeds. We respect the intellectual property rights of creators and studios.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-slate-400">
            <span>© {new Date().getFullYear()} RN ANIME WORLD. All rights reserved.</span>
            <div className="flex items-center gap-4 text-xs">
              <span className="hover:text-white cursor-pointer">Discord</span>
              <span className="hover:text-white cursor-pointer">Telegram</span>
              <span className="hover:text-white cursor-pointer">X (Twitter)</span>
              <span className="hover:text-white cursor-pointer">YouTube</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
