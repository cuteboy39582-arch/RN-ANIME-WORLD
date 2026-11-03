import React from 'react';
import { Star, Play, Heart, Film, Tv, Radio } from 'lucide-react';
import { Anime } from '../types/anime';

interface AnimeCardProps {
  anime: Anime;
  onSelect: (anime: Anime) => void;
  onPlayQuick?: (anime: Anime) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (animeId: string, e: React.MouseEvent) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  onSelect,
  onPlayQuick,
  isFavorite = false,
  onToggleFavorite,
}) => {
  return (
    <div
      onClick={() => onSelect(anime)}
      className="group relative flex-none w-[160px] sm:w-[190px] md:w-[210px] cursor-pointer select-none"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[3/4.2] w-full rounded-2xl overflow-hidden bg-[#111522] border border-slate-800/80 group-hover:border-purple-500/50 group-hover:shadow-xl group-hover:shadow-purple-950/40 transition-all duration-300">
        <img
          src={anime.poster || anime.coverBanner}
          alt={anime.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Dark Vignette Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090B12] via-transparent to-black/30 opacity-70 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges: Type & Rating */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#090B12]/85 backdrop-blur-md text-cyan-300 border border-cyan-500/30 shadow-sm">
            {anime.type === 'Movie' ? 'Movie' : anime.type === 'Cartoon' ? 'Cartoon' : `Ep ${anime.totalEpisodes || '?'}`}
          </span>

          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#090B12]/85 backdrop-blur-md text-amber-400 border border-amber-500/30">
            <Star className="w-2.5 h-2.5 fill-amber-400" />
            {anime.rating}
          </span>
        </div>

        {/* Favorite Heart Button (Top Right / Hover) */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(anime.id, e);
            }}
            className={`absolute bottom-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isFavorite
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/50'
                : 'bg-black/60 text-slate-300 hover:text-white hover:bg-black/80 opacity-0 group-hover:opacity-100'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label="Toggle favorite"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        )}

        {/* Hover Quick Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/50 transform group-hover:scale-100 scale-75 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Bottom Language Tag Strip */}
        <div className="absolute bottom-2.5 left-2.5 right-12 flex flex-wrap gap-1 pointer-events-none">
          {anime.languages.slice(0, 3).map((lang) => (
            <span
              key={lang}
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                lang === 'Hindi'
                  ? 'bg-amber-500/90 text-slate-950 font-black'
                  : lang === 'Tamil'
                  ? 'bg-cyan-500/90 text-slate-950 font-black'
                  : lang === 'Telugu'
                  ? 'bg-purple-500/90 text-slate-950 font-black'
                  : 'bg-slate-900/80 text-slate-300'
              }`}
            >
              {lang === 'Hindi' ? 'HIN' : lang === 'Tamil' ? 'TAM' : lang === 'Telugu' ? 'TEL' : lang.slice(0, 3).toUpperCase()}
            </span>
          ))}
          {anime.languages.length > 3 && (
            <span className="text-[9px] font-bold px-1 rounded bg-slate-900/80 text-slate-400">
              +{anime.languages.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Card Info Details */}
      <div className="pt-2.5 px-0.5 space-y-1">
        <h3 className="font-heading font-bold text-xs sm:text-sm text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-1 leading-snug">
          {anime.title}
        </h3>
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>{anime.releaseYear}</span>
          <span className="text-slate-600">·</span>
          <span className="truncate max-w-[80px]">{anime.genres[0]}</span>
          <span className="text-slate-600">·</span>
          <span className="text-purple-400 font-semibold">{anime.status}</span>
        </div>
      </div>
    </div>
  );
};
