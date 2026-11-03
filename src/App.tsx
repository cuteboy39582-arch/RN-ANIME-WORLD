import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Flame, Sparkles, TrendingUp, Radio, Film, Compass, Star,
  Tv, Heart, Clock, ShieldCheck, CheckCircle2, MessageSquare, Info, X
} from 'lucide-react';
import { Anime, CategoryInfo, Episode, User, WatchHistory, Favorite, NavHistoryEntry } from './types/anime';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { HeroCarousel } from './components/HeroCarousel';
import { AnimeRow } from './components/AnimeRow';
import { AnimeDetailsModal } from './components/AnimeDetailsModal';
import { VideoPlayerView } from './components/VideoPlayerView';
import { SearchModal } from './components/SearchModal';
import { ExploreView } from './components/ExploreView';
import { FavoritesView, HistoryView } from './components/UserViews';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAccessModal } from './components/AdminAccessModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';

export default function App() {
  // Navigation & View state
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewPayload, setViewPayload] = useState<any>(null);

  // Universal Navigation History Stack
  const [historyStack, setHistoryStack] = useState<NavHistoryEntry[]>([
    { view: 'home', payload: null, scrollY: 0, title: 'Home' },
  ]);

  // Data states
  const [allAnime, setAllAnime] = useState<Anime[]>([]);
  const [featuredAnime, setFeaturedAnime] = useState<Anime[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Modals & Overlays
  const [selectedAnimeForDetails, setSelectedAnimeForDetails] = useState<Anime | null>(null);
  const [activePlayer, setActivePlayer] = useState<{
    anime: Anime;
    seasonNumber: number;
    episode: Episode;
  } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOwnerLoginModalOpen, setIsOwnerLoginModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Owner Authentication State (UID: 39090357)
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(false);

  // Current authenticated regular user (for watchlists and history)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('rn_user');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      id: 'user-1',
      username: 'OtakuRider',
      email: 'user@rnanime.world',
      role: 'member',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Check verified Owner status on mount
  useEffect(() => {
    const verifyOwnerStatus = async () => {
      try {
        const isAuthorized = await api.verifyAdmin();
        setIsOwnerAuthenticated(isAuthorized);
      } catch {
        setIsOwnerAuthenticated(false);
      }
    };
    verifyOwnerStatus();
  }, []);

  // Fetch public catalog and data
  const loadPublicData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [animeList, featuredList, genresList, catList] = await Promise.all([
        api.getAnimeList(),
        api.getFeaturedAnime(),
        api.getGenres(),
        api.getCategories(),
      ]);

      setAllAnime(animeList);
      setFeaturedAnime(featuredList);
      setGenres(genresList);
      setCategories(catList);

      if (currentUser) {
        const [userFavs, userHist] = await Promise.all([
          api.getUserFavorites(currentUser.id),
          api.getUserHistory(currentUser.id),
        ]);
        setFavorites(userFavs);
        setWatchHistory(userHist);
      }
    } catch (err) {
      console.error('Failed to load RN ANIME WORLD data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadPublicData();
  }, [loadPublicData]);

  // Keyboard shortcut for search (/)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Navigate handler with scroll recording & history push
  const handleNavigate = useCallback((view: string, payload?: any, replace = false) => {
    // Avoid duplicate history entries for exact same view & payload
    if (currentView === view && JSON.stringify(viewPayload) === JSON.stringify(payload || null)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const currentScrollY = window.scrollY;

    setHistoryStack((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          scrollY: currentScrollY,
        };
      }
      if (replace && updated.length > 0) {
        updated[updated.length - 1] = { view, payload: payload || null, scrollY: 0 };
        return updated;
      }
      return [...updated, { view, payload: payload || null, scrollY: 0 }];
    });

    setCurrentView(view);
    setViewPayload(payload || null);

    // Close overlays when navigating to a distinct page
    setSelectedAnimeForDetails(null);
    setActivePlayer(null);
    setIsSearchOpen(false);

    // Sync browser history
    try {
      window.history.pushState({ view, payload: payload || null, timestamp: Date.now() }, '');
    } catch {}

    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView, viewPayload]);

  // Universal Go Back handler (Back Button system)
  const handleGoBack = useCallback((fromPopState: boolean = false) => {
    // 1. If player is open -> close player and restore view/details
    if (activePlayer) {
      setActivePlayer(null);
      return;
    }

    // 2. If details modal is open -> close details modal
    if (selectedAnimeForDetails) {
      setSelectedAnimeForDetails(null);
      return;
    }

    // 3. If search modal is open -> close search modal
    if (isSearchOpen) {
      setIsSearchOpen(false);
      return;
    }

    // 4. If legal / about modal is open -> close legal modal
    if (legalModalType) {
      setLegalModalType(null);
      return;
    }

    // 5. Navigate to previous history stack entry
    setHistoryStack((prev) => {
      if (prev.length <= 1) {
        // Fallback to home if at beginning of internal history
        setCurrentView('home');
        setViewPayload(null);
        window.scrollTo({ top: 0, behavior: 'instant' });
        return [{ view: 'home', payload: null, scrollY: 0, title: 'Home' }];
      }

      // Pop current entry
      const updated = [...prev];
      updated.pop();
      const previous = updated[updated.length - 1];

      setCurrentView(previous.view);
      setViewPayload(previous.payload || null);

      // Restore scroll position
      setTimeout(() => {
        window.scrollTo({ top: previous.scrollY || 0, behavior: 'instant' });
      }, 25);

      return updated;
    });

    // If triggered by UI back button and browser history has entries, sync
    if (!fromPopState && window.history.state) {
      try {
        window.history.back();
      } catch {}
    }
  }, [activePlayer, selectedAnimeForDetails, isSearchOpen, legalModalType]);

  // Browser & Android hardware back button listener
  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ view: 'home', payload: null, timestamp: Date.now() }, '');
    }

    const handlePopState = () => {
      handleGoBack(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handleGoBack]);

  // Toggle favorite
  const handleToggleFavorite = async (animeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const isFav = await api.toggleFavorite(currentUser.id, animeId);
      const updatedFavs = await api.getUserFavorites(currentUser.id);
      setFavorites(updatedFavs);
      showToast(isFav ? 'Added to your Favorites!' : 'Removed from Favorites');
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Start watching episode
  const handlePlayEpisode = (anime: Anime, seasonNumber: number, episode: Episode) => {
    setActivePlayer({ anime, seasonNumber, episode });
  };

  // Watch Now from Hero or cards
  const handleWatchNow = (anime: Anime) => {
    const s1 = anime.seasons && anime.seasons.length > 0 ? anime.seasons[0] : null;
    const ep1 = s1 && s1.episodes && s1.episodes.length > 0 ? s1.episodes[0] : null;
    if (s1 && ep1) {
      handlePlayEpisode(anime, s1.seasonNumber, ep1);
    } else {
      setSelectedAnimeForDetails(anime);
    }
  };

  // Update history progress
  const handleUpdateHistory = async (data: {
    animeId: string;
    seasonNumber: number;
    episodeNumber: number;
    episodeTitle: string;
    progressSeconds: number;
    durationSeconds: number;
  }) => {
    if (!currentUser) return;
    try {
      await api.saveWatchHistory(currentUser.id, data);
      const updated = await api.getUserHistory(currentUser.id);
      setWatchHistory(updated);
    } catch (err) {
      console.error('Failed saving watch history:', err);
    }
  };

  // Resume from Watch History
  const handleResumeHistory = async (animeId: string, seasonNumber: number, episodeNumber: number) => {
    let target: Anime | null | undefined = allAnime.find((a) => a.id === animeId);
    if (!target) {
      target = await api.getAnimeById(animeId);
    }
    if (!target) return;

    const season = target.seasons.find((s) => s.seasonNumber === seasonNumber) || target.seasons[0];
    const episode =
      season?.episodes.find((e) => e.episodeNumber === episodeNumber) || season?.episodes[0];

    if (season && episode) {
      setActivePlayer({ anime: target, seasonNumber: season.seasonNumber, episode });
    } else {
      setSelectedAnimeForDetails(target);
    }
  };

  // Auth login handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('rn_user', JSON.stringify(user));
    } catch {}
    showToast(`Welcome back, ${user.username}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('rn_user');
    } catch {}
    showToast('Signed out of RN ANIME WORLD');
  };

  // Owner Logout
  const handleOwnerLogout = async () => {
    await api.adminLogout();
    setIsOwnerAuthenticated(false);
    handleNavigate('home');
    showToast('Owner signed out securely');
  };

  const favoriteIds = favorites.map((f) => f.animeId);

  // Group anime by categories for the homepage
  const trendingList = [...allAnime].sort((a, b) => b.trendingScore - a.trendingScore);
  const popularList = [...allAnime].sort((a, b) => b.views - a.views);
  const hindiDubbedList = allAnime.filter((a) => a.languages.includes('Hindi'));
  const tamilDubbedList = allAnime.filter((a) => a.languages.includes('Tamil'));
  const teluguDubbedList = allAnime.filter((a) => a.languages.includes('Telugu'));
  const moviesList = allAnime.filter((a) => a.type === 'Movie');
  const actionList = allAnime.filter((a) => a.genres.includes('Action'));
  const adventureList = allAnime.filter((a) => a.genres.includes('Adventure'));
  const fantasyList = allAnime.filter((a) => a.genres.includes('Fantasy'));
  const romanceList = allAnime.filter((a) => a.genres.includes('Romance'));
  const comedyList = allAnime.filter((a) => a.genres.includes('Comedy'));
  const topRatedList = allAnime.filter((a) => a.rating >= 9.0).sort((a, b) => b.rating - a.rating);

  // Check if back navigation is available anywhere
  const canGoBack =
    historyStack.length > 1 ||
    currentView !== 'home' ||
    selectedAnimeForDetails !== null ||
    activePlayer !== null ||
    legalModalType !== null;

  return (
    <div className="min-h-screen bg-[#090B12] text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold shadow-2xl shadow-purple-950 flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Sticky Navbar with Universal Back Button */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onLogout={handleLogout}
        genres={genres}
        favoritesCount={favorites.length}
        canGoBack={canGoBack}
        onBack={() => handleGoBack()}
        isOwnerAuthenticated={isOwnerAuthenticated}
        onOpenOwnerLogin={() => setIsOwnerLoginModalOpen(true)}
      />

      {/* VIEW ROUTING */}
      <main className="flex-1">
        {/* 1. HOMEPAGE VIEW */}
        {currentView === 'home' && (
          <div className="space-y-4 sm:space-y-6">
            
            {/* Cinematic Hero Carousel Banner */}
            <HeroCarousel
              featuredList={featuredAnime.length > 0 ? featuredAnime : allAnime.slice(0, 4)}
              onWatchNow={handleWatchNow}
              onOpenDetails={(anime) => setSelectedAnimeForDetails(anime)}
            />

            {/* Continue Watching Row (if user has active history) */}
            {watchHistory.length > 0 && (
              <section className="py-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <h2 className="font-heading font-extrabold text-lg sm:text-xl text-white">
                      Continue Watching
                    </h2>
                  </div>
                  <button
                    onClick={() => handleNavigate('history')}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    View All History
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {watchHistory.slice(0, 4).map((item) => {
                    const percent = Math.min(
                      100,
                      Math.round((item.progressSeconds / (item.durationSeconds || 1440)) * 100)
                    );
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleResumeHistory(item.animeId, item.seasonNumber, item.episodeNumber)}
                        className="group flex gap-3 p-2.5 rounded-2xl bg-[#111522] hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all shadow-md"
                      >
                        <div className="relative w-24 aspect-video rounded-xl overflow-hidden bg-slate-950 shrink-0">
                          <img
                            src={item.animePoster || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80'}
                            alt={item.animeTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                              ▶
                            </span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                            <div className="h-full bg-cyan-400" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <h4 className="text-xs font-bold text-white truncate">{item.animeTitle}</h4>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              S{item.seasonNumber} E{item.episodeNumber}: {item.episodeTitle}
                            </p>
                          </div>
                          <span className="text-[10px] text-cyan-400 font-semibold">{percent}% watched</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Trending Anime */}
            <AnimeRow
              title="Trending Anime"
              subtitle="The most talked about series on RN ANIME WORLD this week"
              icon={<Flame className="w-5 h-5 text-amber-400" />}
              animeList={trendingList}
              onSelectAnime={(a) => setSelectedAnimeForDetails(a)}
              onViewAll={() => handleNavigate('category', 'trending')}
              favorites={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Hindi Dubbed Anime */}
            <AnimeRow
              title="Hindi Dubbed Anime"
              subtitle="Full Hindi audio dubbing with crystal clear dialogue"
              icon={<Radio className="w-5 h-5 text-amber-400" />}
              animeList={hindiDubbedList}
              onSelectAnime={(a) => setSelectedAnimeForDetails(a)}
              onViewAll={() => handleNavigate('category', 'hindi-dub')}
              favorites={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Tamil Dubbed Anime */}
            <AnimeRow
              title="Tamil Dubbed Anime"
              subtitle="High adrenaline anime battles voiced in Tamil"
              icon={<Radio className="w-5 h-5 text-cyan-400" />}
              animeList={tamilDubbedList}
              onSelectAnime={(a) => setSelectedAnimeForDetails(a)}
              onViewAll={() => handleNavigate('category', 'tamil-dub')}
              favorites={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Telugu Dubbed Anime */}
            <AnimeRow
              title="Telugu Dubbed Anime"
              subtitle="Blockbuster shonen and fantasy anime in Telugu"
              icon={<Radio className="w-5 h-5 text-purple-400" />}
              animeList={teluguDubbedList}
              onSelectAnime={(a) => setSelectedAnimeForDetails(a)}
              onViewAll={() => handleNavigate('category', 'telugu-dub')}
              favorites={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Most Popular Anime */}
            <AnimeRow
              title="Most Popular Anime"
              subtitle="Global fan favorites with millions of streams"
              icon={<TrendingUp className="w-5 h-5 text-pink-400" />}
              animeList={popularList}
              onSelectAnime={(a) => setSelectedAnimeForDetails(a)}
              onViewAll={() => handleNavigate('category', 'popular')}
              favorites={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Anime Movies */}
            <AnimeRow
              title="Anime Movies"
              subtitle="Full-length cinematic movies and visual spectacles"
              icon={<Film className="w-5 h-5 text-blue-400" />}
              animeList={moviesList}
              onSelectAnime={(a) => setSelectedAnimeForDetails(a)}
              onViewAll={() => handleNavigate('category', 'movies')}
              favorites={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Top Rated Anime */}
            <AnimeRow
              title="Top Rated Masterpieces"
              subtitle="Critically acclaimed titles rated 9.0+ by otaku worldwide"
              icon={<Star className="w-5 h-5 text-amber-400" />}
              animeList={topRatedList}
              onSelectAnime={(a) => setSelectedAnimeForDetails(a)}
              onViewAll={() => handleNavigate('category', 'top-rated')}
              favorites={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Action Anime */}
            <AnimeRow
              title="Action Anime"
              subtitle="Supernatural fights, sword clashes, and power awakenings"
              animeList={actionList}
              onSelectAnime={(a) => setSelectedAnimeForDetails(a)}
              onViewAll={() => handleNavigate('category', 'action')}
              favorites={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Fantasy Anime */}
            <AnimeRow
              title="Fantasy & Magic"
              subtitle="Dragons, arcane dungeons, and parallel worlds"
              animeList={fantasyList}
              onSelectAnime={(a) => setSelectedAnimeForDetails(a)}
              onViewAll={() => handleNavigate('category', 'fantasy')}
              favorites={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Romance Anime */}
            <AnimeRow
              title="Romance & Heartwarming"
              subtitle="Soulful connections, school days, and unforgettable love"
              animeList={romanceList}
              onSelectAnime={(a) => setSelectedAnimeForDetails(a)}
              onViewAll={() => handleNavigate('category', 'romance')}
              favorites={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Comedy Anime */}
            <AnimeRow
              title="Comedy & Slice of Life"
              subtitle="Laugh out loud with hilarious anime adventures"
              animeList={comedyList}
              onSelectAnime={(a) => setSelectedAnimeForDetails(a)}
              onViewAll={() => handleNavigate('category', 'comedy')}
              favorites={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}

        {/* 2. EXPLORE / CATEGORY / GENRE VIEW WITH BACK BUTTON */}
        {(currentView === 'category' || currentView === 'genre' || currentView === 'explore') && (
          <ExploreView
            initialCategory={currentView === 'category' ? viewPayload : 'All'}
            initialGenre={currentView === 'genre' ? viewPayload : 'All'}
            initialSearch={currentView === 'explore' ? viewPayload : ''}
            onSelectAnime={(a) => setSelectedAnimeForDetails(a)}
            favorites={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            genres={genres}
            onBack={() => handleGoBack()}
          />
        )}

        {/* 3. FAVORITES VIEW WITH BACK BUTTON */}
        {currentView === 'favorites' && (
          <FavoritesView
            favorites={favorites}
            onSelectAnime={(a) => setSelectedAnimeForDetails(a)}
            onToggleFavorite={handleToggleFavorite}
            onExplore={() => handleNavigate('category', 'popular')}
            onBack={() => handleGoBack()}
          />
        )}

        {/* 4. WATCH HISTORY VIEW WITH BACK BUTTON */}
        {currentView === 'history' && (
          <HistoryView
            history={watchHistory}
            onSelectAnimeById={handleResumeHistory}
            onExplore={() => handleNavigate('category', 'popular')}
            onBack={() => handleGoBack()}
          />
        )}

        {/* 5. PRIVATE ADMIN DASHBOARD (STRICT OWNER UID: 39090357) */}
        {currentView === 'admin' && (
          !isOwnerAuthenticated ? (
            <AdminAccessModal
              isOpen={true}
              isAccessDeniedView={true}
              onClose={() => handleNavigate('home')}
              onBackToHome={() => handleNavigate('home')}
              onSuccess={() => {
                setIsOwnerAuthenticated(true);
                showToast('Owner Authenticated (UID: 39090357)');
              }}
            />
          ) : (
            <AdminDashboard
              onBackToSite={() => handleGoBack()}
              onRefreshPublicData={loadPublicData}
              onLogoutAdmin={handleOwnerLogout}
              genres={genres}
            />
          )
        )}
      </main>

      {/* FOOTER */}
      <Footer
        onNavigate={handleNavigate}
        onOpenPrivacyModal={(type) => setLegalModalType(type)}
        onOpenOwnerAuth={() => setIsOwnerLoginModalOpen(true)}
      />

      {/* OVERLAY 1: ANIME DETAILS MODAL */}
      {selectedAnimeForDetails && (
        <AnimeDetailsModal
          anime={selectedAnimeForDetails}
          onClose={() => setSelectedAnimeForDetails(null)}
          onPlayEpisode={handlePlayEpisode}
          isFavorite={favoriteIds.includes(selectedAnimeForDetails.id)}
          onToggleFavorite={(id) => handleToggleFavorite(id)}
        />
      )}

      {/* OVERLAY 2: MODERN VIDEO PLAYER */}
      {activePlayer && (
        <VideoPlayerView
          anime={activePlayer.anime}
          initialSeasonNumber={activePlayer.seasonNumber}
          initialEpisode={activePlayer.episode}
          onClose={() => setActivePlayer(null)}
          onUpdateHistory={handleUpdateHistory}
        />
      )}

      {/* OVERLAY 3: INSTANT SEARCH MODAL */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectAnime={(a) => setSelectedAnimeForDetails(a)}
        onViewAllResults={(term) => handleNavigate('explore', term)}
      />

      {/* OVERLAY 4: USER AUTH MODAL */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* OVERLAY 5: OWNER LOGIN MODAL (Triggered via Footer) */}
      {isOwnerLoginModalOpen && (
        <AdminAccessModal
          isOpen={isOwnerLoginModalOpen}
          isAccessDeniedView={false}
          onClose={() => setIsOwnerLoginModalOpen(false)}
          onBackToHome={() => setIsOwnerLoginModalOpen(false)}
          onSuccess={() => {
            setIsOwnerAuthenticated(true);
            setIsOwnerLoginModalOpen(false);
            handleNavigate('admin');
            showToast('Owner Authenticated (UID: 39090357)');
          }}
        />
      )}

      {/* OVERLAY 6: LEGAL & ABOUT MODAL */}
      {legalModalType && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#111522] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading font-bold text-lg text-white capitalize">
                {legalModalType === 'dmca' ? 'Copyright & DMCA Notice' : legalModalType === 'about' ? 'About RN ANIME WORLD' : `${legalModalType} Information`}
              </h3>
              <button onClick={() => setLegalModalType(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {legalModalType === 'dmca' && (
                <>
                  <p>
                    RN ANIME WORLD respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA). All video files and media assets presented on this site are authorized open animated productions, studio-licensed teasers, or hosted on publicly verified third-party distribution platforms.
                  </p>
                  <p>
                    If you believe that any material residing on or accessible through our service infringes your copyright, please contact our designated copyright agent at <span className="text-cyan-400 font-mono">dmca@rnanime.world</span> with valid proof of ownership.
                  </p>
                </>
              )}
              {legalModalType === 'about' && (
                <>
                  <p>
                    <strong>RN ANIME WORLD</strong> was built to provide anime fans in India and across the globe with a high-definition, lightning-fast discovery experience for Hindi, Tamil, Telugu dubbed anime and blockbuster movies.
                  </p>
                  <p>
                    Our platform features modern cinematic dark aesthetics, instant live search, personalized watchlists, and an intuitive season and episode navigation engine.
                  </p>
                </>
              )}
              {legalModalType === 'privacy' && (
                <>
                  <p>
                    Your privacy is essential to us. We store minimal user profile data, favorites, and watch history progress solely to enhance your browsing and playback continuity.
                  </p>
                  <p>
                    We never sell or disclose your personal data to third-party advertising brokers.
                  </p>
                </>
              )}
              {legalModalType === 'terms' && (
                <>
                  <p>
                    By using RN ANIME WORLD, you agree to access authorized anime media for personal, non-commercial entertainment. You must not attempt to scrape, redistribute, or disrupt the platform's service.
                  </p>
                </>
              )}
              {legalModalType === 'contact' && (
                <>
                  <p>
                    Need assistance or want to suggest an anime title for Hindi, Tamil, or Telugu dubbing?
                  </p>
                  <p className="font-mono text-cyan-300">
                    Email: support@rnanime.world
                    <br />
                    Community Discord: discord.gg/rnanime
                  </p>
                </>
              )}
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setLegalModalType(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
