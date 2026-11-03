import React from 'react';
import { Heart, Clock, Play, Trash2, ArrowRight, Film } from 'lucide-react';
import { Anime, WatchHistory, Favorite } from '../types/anime';
import { AnimeCard } from './AnimeCard';
import { BackButton } from './BackButton';

interface FavoritesViewProps {
  favorites: Favorite[];
  onSelectAnime: (anime: Anime) => void;
  onToggleFavorite: (animeId: string, e: React.MouseEvent) => void;
  onExplore: () => void;
  onBack?: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onSelectAnime,
  onToggleFavorite,
  onExplore,
  onBack,
}) => {
  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {onBack && (
        <div className="flex items-center pt-1">
          <BackButton onClick={onBack} label="Back to Previous Page" />
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
              My Favorites
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Your personalized watchlist saved directly to your account.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 w-fit">
          {favorites.length} saved titles
        </span>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {favorites.map((fav) => (
            fav.anime ? (
              <div key={fav.id} className="flex justify-center">
                <AnimeCard
                  anime={fav.anime}
                  onSelect={onSelectAnime}
                  isFavorite={true}
                  onToggleFavorite={onToggleFavorite}
                />
              </div>
            ) : null
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-[#111522] border border-slate-800 rounded-3xl p-8 space-y-4">
          <Heart className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-heading font-bold text-lg text-white">Your Watchlist is Empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click the heart icon on any anime card or details page to add it to your personal favorites collection!
          </p>
          <button
            onClick={onExplore}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg"
          >
            <span>Explore Trending Anime</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

interface HistoryViewProps {
  history: WatchHistory[];
  onSelectAnimeById: (animeId: string, seasonNumber: number, episodeNumber: number) => void;
  onExplore: () => void;
  onBack?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectAnimeById,
  onExplore,
  onBack,
}) => {
  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {onBack && (
        <div className="flex items-center pt-1">
          <BackButton onClick={onBack} label="Back to Previous Page" />
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-cyan-400" />
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
              Watch History
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pick up right where you left off. Playback progress is automatically synced.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 w-fit">
          {history.length} watched
        </span>
      </div>

      {history.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item) => {
            const percent = Math.min(
              100,
              Math.round((item.progressSeconds / (item.durationSeconds || 1440)) * 100)
            );
            return (
              <div
                key={item.id}
                onClick={() => onSelectAnimeById(item.animeId, item.seasonNumber, item.episodeNumber)}
                className="group flex gap-3.5 p-3 rounded-2xl bg-[#111522] hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all shadow-md"
              >
                <div className="relative w-28 sm:w-32 aspect-video rounded-xl overflow-hidden bg-slate-950 shrink-0">
                  <img
                    src={item.animePoster || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80'}
                    alt={item.animeTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center shadow">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  </div>
                  {/* Progress bar at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 truncate">
                      {item.animeTitle}
                    </h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      S{item.seasonNumber} E{item.episodeNumber}: {item.episodeTitle}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="text-cyan-400 font-semibold">{percent}% watched</span>
                    <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center bg-[#111522] border border-slate-800 rounded-3xl p-8 space-y-4">
          <Clock className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-heading font-bold text-lg text-white">No Watch History Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Episodes you watch will automatically be recorded here so you can resume at any time.
          </p>
          <button
            onClick={onExplore}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold"
          >
            <span>Start Watching Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
