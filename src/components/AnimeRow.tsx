import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Anime } from '../types/anime';
import { AnimeCard } from './AnimeCard';

interface AnimeRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  animeList: Anime[];
  onSelectAnime: (anime: Anime) => void;
  onViewAll?: () => void;
  favorites?: string[];
  onToggleFavorite?: (animeId: string, e: React.MouseEvent) => void;
}

export const AnimeRow: React.FC<AnimeRowProps> = ({
  title,
  subtitle,
  icon,
  animeList,
  onSelectAnime,
  onViewAll,
  favorites = [],
  onToggleFavorite,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -500 : 500;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!animeList || animeList.length === 0) return null;

  return (
    <section className="relative py-4 sm:py-6 group/row">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Row Header */}
        <div className="flex items-end justify-between mb-3.5 sm:mb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              {icon && <span className="text-cyan-400">{icon}</span>}
              <h2 className="font-heading font-extrabold text-lg sm:text-xl md:text-2xl text-white tracking-tight">
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-400">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group/btn"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Desktop scroll arrows */}
            <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-slate-800">
              <button
                onClick={() => scroll('left')}
                className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                aria-label={`Scroll ${title} left`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                aria-label={`Scroll ${title} right`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scrolling Poster Cards */}
        <div
          ref={rowRef}
          className="flex items-start gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1"
        >
          {animeList.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              onSelect={onSelectAnime}
              isFavorite={favorites.includes(anime.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
