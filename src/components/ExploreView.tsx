import React, { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal, Star, Sparkles, X, RotateCcw } from 'lucide-react';
import { Anime } from '../types/anime';
import { AnimeCard } from './AnimeCard';
import { api } from '../services/api';
import { BackButton } from './BackButton';

interface ExploreViewProps {
  initialCategory?: string;
  initialGenre?: string;
  initialSearch?: string;
  onSelectAnime: (anime: Anime) => void;
  favorites: string[];
  onToggleFavorite: (animeId: string, e: React.MouseEvent) => void;
  genres: string[];
  onBack?: () => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  initialCategory = 'All',
  initialGenre = 'All',
  initialSearch = '',
  onSelectAnime,
  favorites,
  onToggleFavorite,
  genres,
  onBack,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [activeGenre, setActiveGenre] = useState<string>(initialGenre);
  const [activeLanguage, setActiveLanguage] = useState<string>('All');
  const [activeType, setActiveType] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);

  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync props when user clicks another nav link
  useEffect(() => {
    if (initialCategory) setActiveCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (initialGenre) setActiveGenre(initialGenre);
  }, [initialGenre]);

  useEffect(() => {
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
  }, [initialSearch]);

  // Load filtered anime from real backend
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api.getAnimeList({
      q: searchQuery || undefined,
      category: activeCategory !== 'All' ? activeCategory : undefined,
      genre: activeGenre !== 'All' ? activeGenre : undefined,
      language: activeLanguage !== 'All' ? activeLanguage : undefined,
      type: activeType !== 'All' ? activeType : undefined,
      status: activeStatus !== 'All' ? activeStatus : undefined,
      sort: sortBy,
    })
      .then((data) => {
        if (isMounted) {
          setAnimeList(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load anime list:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeCategory, activeGenre, activeLanguage, activeType, activeStatus, sortBy, searchQuery]);

  const resetFilters = () => {
    setActiveCategory('All');
    setActiveGenre('All');
    setActiveLanguage('All');
    setActiveType('All');
    setActiveStatus('All');
    setSortBy('popular');
    setSearchQuery('');
  };

  const CATEGORY_TABS = [
    { label: 'All', value: 'All' },
    { label: 'Hindi Dub', value: 'hindi-dub' },
    { label: 'Tamil Dub', value: 'tamil-dub' },
    { label: 'Telugu Dub', value: 'telugu-dub' },
    { label: 'Movies', value: 'movies' },
    { label: 'TV Series', value: 'popular' },
    { label: 'Cartoon', value: 'cartoon' },
    { label: 'Top Rated', value: 'top-rated' },
  ];

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {onBack && (
        <div className="flex items-center pt-1">
          <BackButton onClick={onBack} label="Back to Previous Page" />
        </div>
      )}
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight">
            Explore RN Anime Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse our complete catalog of Hindi, Tamil, Telugu dubbed anime and blockbuster movies.
          </p>
        </div>

        {/* Search & Reset filter chips */}
        <div className="flex items-center gap-3">
          {searchQuery && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold">
              <span>Search: "{searchQuery}"</span>
              <button onClick={() => setSearchQuery('')} className="hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Primary Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveCategory(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeCategory === tab.value
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-[#111522] border border-slate-800 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* Genre dropdown */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Genre
          </label>
          <select
            value={activeGenre}
            onChange={(e) => setActiveGenre(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All Genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Language Dub */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Audio Language
          </label>
          <select
            value={activeLanguage}
            onChange={(e) => setActiveLanguage(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All Languages</option>
            <option value="Hindi">Hindi Dub</option>
            <option value="Tamil">Tamil Dub</option>
            <option value="Telugu">Telugu Dub</option>
            <option value="English">English Dub</option>
            <option value="Japanese">Japanese (Sub)</option>
          </select>
        </div>

        {/* Content Type */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Type
          </label>
          <select
            value={activeType}
            onChange={(e) => setActiveType(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All Types</option>
            <option value="TV Series">TV Series</option>
            <option value="Movie">Movie</option>
            <option value="Cartoon">Cartoon</option>
          </select>
        </div>

        {/* Status */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Status
          </label>
          <select
            value={activeStatus}
            onChange={(e) => setActiveStatus(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All Status</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="space-y-1 col-span-2 sm:col-span-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="latest">Latest Released</option>
            <option value="az">A – Z (Title)</option>
          </select>
        </div>
      </div>

      {/* Results Header Info */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
        <span>Showing {animeList.length} titles</span>
        <span>Filter applied from live database</span>
      </div>

      {/* Grid of Anime (2-col mobile, 3-4 col tablet, 5-6 col desktop) */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-cyan-400 rounded-full animate-spin" />
          <span className="text-xs text-slate-400 mt-4">Filtering anime database...</span>
        </div>
      ) : animeList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {animeList.map((anime) => (
            <div key={anime.id} className="flex justify-center">
              <AnimeCard
                anime={anime}
                onSelect={onSelectAnime}
                isFavorite={favorites.includes(anime.id)}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-[#111522] border border-slate-800 rounded-3xl p-8 space-y-3">
          <Filter className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-heading font-bold text-lg text-white">No Matching Anime Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your genre, language, or category filters to find what you are looking for.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
