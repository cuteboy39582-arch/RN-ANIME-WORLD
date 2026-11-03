import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Flame, Film, Star, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Anime } from '../types/anime';
import { api } from '../services/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAnime: (anime: Anime) => void;
  onViewAllResults: (query: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectAnime,
  onViewAllResults,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const TRENDING_SEARCHES = [
    'Solo Leveling',
    'Demon Slayer',
    'Hindi Dubbed',
    'Jujutsu Kaisen',
    'Attack on Titan',
    'Your Name',
    'Tamil Dub',
    'Telugu Dub',
  ];

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rn_search_history');
      if (stored) setSearchHistory(JSON.parse(stored));
    } catch {}
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Handle live instant search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(async () => {
      try {
        const data = await api.getAnimeList({ q: query.trim() });
        setResults(data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(handler);
  }, [query]);

  const saveToHistory = (term: string) => {
    const updated = [term, ...searchHistory.filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(0, 8);
    setSearchHistory(updated);
    try {
      localStorage.setItem('rn_search_history', JSON.stringify(updated));
    } catch {}
  };

  const handleSelectAnime = (anime: Anime) => {
    saveToHistory(anime.title);
    onSelectAnime(anime);
    onClose();
  };

  const handleExecuteSearch = (termToSearch: string) => {
    if (!termToSearch.trim()) return;
    saveToHistory(termToSearch.trim());
    onViewAllResults(termToSearch.trim());
    onClose();
  };

  const clearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem('rn_search_history');
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-12 sm:pt-20 px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#111522] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 sm:px-6 py-4 border-b border-slate-800">
          <Search className="w-5 h-5 text-cyan-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleExecuteSearch(query);
              if (e.key === 'Escape') onClose();
            }}
            placeholder="Search anime by title, alt name, genre, Hindi/Tamil dub..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-slate-800/80 rounded border border-slate-700">
              ESC
            </kbd>
          )}
          <button
            onClick={onClose}
            className="ml-3 sm:hidden text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto no-scrollbar p-4 sm:p-6 space-y-6">
          
          {/* Live Search Results */}
          {query.trim() ? (
            <div>
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/60">
                <span className="text-xs font-semibold text-slate-400">
                  {isLoading ? 'Searching database...' : `Found ${results.length} results for "${query}"`}
                </span>
                {results.length > 0 && (
                  <button
                    onClick={() => handleExecuteSearch(query)}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <span>View all in Explore</span>
                    <CornerDownLeft className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="py-8 flex justify-center">
                  <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  {results.slice(0, 8).map((anime) => (
                    <div
                      key={anime.id}
                      onClick={() => handleSelectAnime(anime)}
                      className="group flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-800/80 cursor-pointer transition-colors"
                    >
                      <div className="w-12 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                        <img
                          src={anime.poster || anime.coverBanner}
                          alt={anime.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 truncate">
                          {anime.title}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">
                          {anime.altTitle || anime.genres.join(', ')}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-semibold">
                            {anime.releaseYear}
                          </span>
                          <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {anime.rating}
                          </span>
                          <span className="text-[10px] text-purple-400 font-semibold">
                            {anime.languages.slice(0, 2).join(', ')} Dub
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* No Results Found Screen with recommendations */
                <div className="py-10 text-center space-y-3">
                  <Film className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="font-heading font-bold text-base text-white">No Anime Found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    We couldn't find any anime matching "{query}". Try searching by genres like "Action", "Hindi Dub", or popular titles like "Solo Leveling".
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Search History */}
              {searchHistory.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      Recent Searches
                    </span>
                    <button
                      onClick={clearHistory}
                      className="text-slate-500 hover:text-slate-300 text-[11px]"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {searchHistory.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleExecuteSearch(item)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div className="space-y-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Popular Suggestions
                </span>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleExecuteSearch(term)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-200 hover:text-cyan-300 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
