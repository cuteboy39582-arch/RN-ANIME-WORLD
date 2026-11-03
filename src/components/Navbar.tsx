import React, { useState, useEffect } from 'react';
import { Search, User as UserIcon, Menu, X, ChevronDown, Sparkles, Heart, Clock, ShieldCheck, Film, Tv, Radio, LogOut, ArrowLeft, KeyRound } from 'lucide-react';
import { User } from '../types/anime';
import { BackButton } from './BackButton';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, payload?: any) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenSearch: () => void;
  onLogout: () => void;
  genres: string[];
  favoritesCount: number;
  canGoBack?: boolean;
  onBack?: () => void;
  isOwnerAuthenticated?: boolean;
  onOpenOwnerLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenAuth,
  onOpenSearch,
  onLogout,
  genres,
  favoritesCount,
  canGoBack = false,
  onBack,
  isOwnerAuthenticated = false,
  onOpenOwnerLogin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [genresDropdownOpen, setGenresDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', view: 'home' },
    { label: 'Anime', view: 'category', payload: 'popular' },
    { label: 'Movies', view: 'category', payload: 'movies' },
    { label: 'Cartoon', view: 'category', payload: 'cartoon' },
    { label: 'Hindi Dub', view: 'category', payload: 'hindi-dub', highlight: 'text-amber-400 font-bold' },
    { label: 'Tamil Dub', view: 'category', payload: 'tamil-dub', highlight: 'text-cyan-400 font-bold' },
    { label: 'Telugu Dub', view: 'category', payload: 'telugu-dub', highlight: 'text-purple-400 font-bold' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#090B12]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl shadow-black/80 py-2.5'
            : 'bg-gradient-to-b from-[#090B12] via-[#090B12]/90 to-transparent py-3 sm:py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            
            {/* Left Zone: Optional Universal Back Button + RN ANIME WORLD Logo */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {canGoBack && onBack && (
                <BackButton onClick={onBack} label="Back" variant="header" />
              )}

              {/* RN ANIME WORLD Logo */}
              <button
                onClick={() => {
                  onNavigate('home');
                  setMobileMenuOpen(false);
                }}
                className="group flex items-center gap-2.5 sm:gap-3 text-left focus:outline-none"
              >
                <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-[1.5px] shadow-lg shadow-purple-600/30 group-hover:shadow-blue-500/50 transition-shadow">
                  <div className="w-full h-full bg-[#090B12] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                    <span className="font-heading font-black text-xl tracking-tighter bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                      RN
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 pointer-events-none" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight leading-none bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent group-hover:brightness-110 transition-all">
                    RN
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-black tracking-[0.22em] text-slate-300 uppercase leading-tight mt-0.5 group-hover:text-purple-300 transition-colors">
                    ANIME WORLD
                  </span>
                </div>
              </button>
            </div>

            {/* Desktop Navigation Links (AnimeDekho inspired flow) */}
            <nav className="hidden xl:flex items-center gap-1 lg:gap-2 text-sm font-medium">
              {navLinks.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    onNavigate(item.view, item.payload);
                    setGenresDropdownOpen(false);
                  }}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm transition-all whitespace-nowrap ${
                    currentView === item.payload || (item.view === 'home' && currentView === 'home')
                      ? 'text-white bg-slate-800/90 shadow-inner font-bold border border-slate-700/60'
                      : item.highlight
                      ? `${item.highlight} hover:bg-slate-800/50`
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {/* Genres Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setGenresDropdownOpen(!genresDropdownOpen)}
                  onBlur={() => setTimeout(() => setGenresDropdownOpen(false), 200)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs lg:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <span>Genres</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${genresDropdownOpen ? 'rotate-180 text-blue-400' : ''}`} />
                </button>

                {genresDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-[#111522] border border-slate-700/80 rounded-2xl shadow-2xl p-3 grid grid-cols-2 gap-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                    {genres.map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          onNavigate('genre', g);
                          setGenresDropdownOpen(false);
                        }}
                        className="text-left text-xs px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors"
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Right Zone: Search Trigger + Favorites + User Menu */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* AnimeDekho Search button with instant query trigger */}
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-2 px-3 py-1.5 sm:py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 hover:border-cyan-500/50 rounded-full text-slate-300 hover:text-white transition-all text-xs font-medium group shadow-sm"
                title="Search Anime (Ctrl+K or /)"
              >
                <Search className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline text-slate-400 group-hover:text-slate-200">Search anime, dubs...</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.2 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
                  /
                </kbd>
              </button>

              {/* Favorites shortcut */}
              <button
                onClick={() => onNavigate('favorites')}
                className={`p-2 rounded-full relative transition-colors ${
                  currentView === 'favorites' ? 'bg-purple-900/60 text-purple-300' : 'text-slate-300 hover:text-pink-400 hover:bg-slate-800/60'
                }`}
                title="My Watchlist"
              >
                <Heart className="w-5 h-5" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </button>

              {/* User Profile dropdown */}
              <div className="relative">
                {currentUser ? (
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    onBlur={() => setTimeout(() => setUserMenuOpen(false), 250)}
                    className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-slate-900/80 border border-slate-700 hover:border-purple-500/60 transition-all text-slate-200"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden">
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.username} className="w-full h-full object-cover" />
                      ) : (
                        currentUser.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-xs font-semibold hidden md:inline max-w-[80px] truncate">
                      {currentUser.username}
                    </span>
                    {isOwnerAuthenticated && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-purple-500/30 text-purple-300 border border-purple-500/50">
                        Owner
                      </span>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={onOpenAuth}
                    className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all hover:scale-105"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                )}

                {/* User Dropdown Menu */}
                {userMenuOpen && currentUser && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#111522] border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in duration-150">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-white truncate">{currentUser.username}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onNavigate('favorites');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition-colors"
                      >
                        <Heart className="w-4 h-4 text-pink-400" />
                        <span>My Favorites ({favoritesCount})</span>
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('history');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition-colors"
                      >
                        <Clock className="w-4 h-4 text-cyan-400" />
                        <span>Watch History</span>
                      </button>

                      {/* STRICT SECURITY: Only display Admin Dashboard button if isOwnerAuthenticated is TRUE! */}
                      {isOwnerAuthenticated && (
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-purple-300 hover:text-purple-200 hover:bg-purple-950/40 rounded-lg transition-colors font-medium border-t border-slate-800/60 mt-1"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-400" />
                          <span>Owner Admin Suite</span>
                        </button>
                      )}
                    </div>
                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          onLogout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile hamburger menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[#090B12]/98 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 backdrop-blur-2xl">
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800">
              {navLinks.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    onNavigate(item.view, item.payload);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-left text-xs font-semibold transition-colors ${
                    currentView === item.payload ? 'bg-slate-800 text-cyan-300' : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                Genres
              </span>
              <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      onNavigate('genre', g);
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-[11px] px-2 py-1.5 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* If owner authenticated, show Admin link; otherwise DO NOT show to regular users */}
            {isOwnerAuthenticated && (
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Owner Admin Panel (UID: 39090357)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar for quick thumb access */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090B12]/95 backdrop-blur-xl border-t border-slate-800/90 py-2 px-6 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            currentView === 'home' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Tv className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-white transition-colors"
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>

        <button
          onClick={() => onNavigate('category', 'hindi-dub')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            currentView === 'hindi-dub' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-amber-300'
          }`}
        >
          <Radio className="w-5 h-5" />
          <span>Hindi Dub</span>
        </button>

        <button
          onClick={() => onNavigate('favorites')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            currentView === 'favorites' ? 'text-pink-400 font-bold' : 'text-slate-400 hover:text-pink-300'
          }`}
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-500" />
            )}
          </div>
          <span>Favorites</span>
        </button>

        <button
          onClick={() => {
            if (currentUser) {
              onNavigate('history');
            } else {
              onOpenAuth();
            }
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            currentView === 'history' ? 'text-purple-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span>{currentUser ? 'History' : 'Login'}</span>
        </button>
      </nav>
    </>
  );
};
