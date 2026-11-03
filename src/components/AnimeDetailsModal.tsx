import React, { useState } from 'react';
import { X, Play, Heart, Share2, Star, Calendar, Building, Film, Check, Sparkles, Clock, Globe } from 'lucide-react';
import { Anime, Episode } from '../types/anime';
import { BackButton } from './BackButton';

interface AnimeDetailsModalProps {
  anime: Anime;
  onClose: () => void;
  onPlayEpisode: (anime: Anime, seasonNumber: number, episode: Episode) => void;
  isFavorite: boolean;
  onToggleFavorite: (animeId: string) => void;
}

export const AnimeDetailsModal: React.FC<AnimeDetailsModalProps> = ({
  anime,
  onClose,
  onPlayEpisode,
  isFavorite,
  onToggleFavorite,
}) => {
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(
    anime.seasons && anime.seasons.length > 0 ? anime.seasons[0].seasonNumber : 1
  );
  const [copiedShare, setCopiedShare] = useState(false);

  const activeSeason =
    anime.seasons?.find((s) => s.seasonNumber === selectedSeasonNumber) ||
    anime.seasons?.[0];

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    });
  };

  const handleWatchNow = () => {
    if (activeSeason && activeSeason.episodes.length > 0) {
      onPlayEpisode(anime, activeSeason.seasonNumber, activeSeason.episodes[0]);
    } else if (anime.seasons?.[0]?.episodes?.[0]) {
      onPlayEpisode(anime, anime.seasons[0].seasonNumber, anime.seasons[0].episodes[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-[#111522] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/40 my-auto text-slate-200">
        
        {/* Top Navigation: Universal Back Button & Close */}
        <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-auto">
          <BackButton onClick={onClose} label="Back to List" />
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all hover:scale-105"
            aria-label="Close anime details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Large Cover Banner Header */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-950">
          <img
            src={anime.coverBanner || anime.poster}
            alt={anime.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top sm:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111522] via-[#111522]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111522] via-[#111522]/80 to-transparent" />

          {/* Quick info over cover on mobile */}
          <div className="absolute bottom-4 left-4 right-4 flex sm:hidden items-center justify-between z-20">
            <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-cyan-300 font-bold text-xs border border-cyan-500/30">
              {anime.type}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-amber-400 font-bold text-xs border border-amber-500/30">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {anime.rating}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-6 md:p-8 -mt-20 sm:-mt-28 relative z-20 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Left: Poster preview card */}
            <div className="hidden sm:block shrink-0 w-44 md:w-56 aspect-[3/4.2] rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700 shadow-2xl shadow-black/80">
              <img
                src={anime.poster || anime.coverBanner}
                alt={anime.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right: Meta & Descriptions */}
            <div className="flex-1 space-y-4">
              
              {/* Badges & Meta strip */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {anime.rating} / 10
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 font-semibold">
                  {anime.type}
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold">
                  {anime.status}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {anime.releaseYear}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Building className="w-3.5 h-3.5" />
                  {anime.studio}
                </span>
              </div>

              {/* Title & Alt Title */}
              <div>
                <h1 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight">
                  {anime.title}
                </h1>
                {anime.altTitle && (
                  <p className="text-xs sm:text-sm text-cyan-300 font-medium mt-1">
                    {anime.altTitle}
                  </p>
                )}
              </div>

              {/* Available Audio Languages */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  Available Dub & Sub Languages:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {anime.languages.map((lang) => (
                    <span
                      key={lang}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                        lang === 'Hindi'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : lang === 'Tamil'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : lang === 'Telugu'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {lang} Dub
                    </span>
                  ))}
                </div>
              </div>

              {/* Synopsis */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                {anime.synopsis}
              </p>

              {/* Genres list */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {anime.genres.map((g) => (
                  <span
                    key={g}
                    className="text-xs font-medium px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Action Buttons: Watch Now, Add to Favorites, Share */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={handleWatchNow}
                  className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Watch Now</span>
                </button>

                <button
                  onClick={() => onToggleFavorite(anime.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    isFavorite
                      ? 'bg-pink-950/60 border-pink-500 text-pink-300 shadow-md shadow-pink-900/30'
                      : 'bg-slate-900/80 border-slate-700 hover:border-slate-500 text-slate-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-pink-500 text-pink-500' : ''}`} />
                  <span>{isFavorite ? 'In Favorites' : 'Add to Favorites'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 text-sm font-semibold transition-all"
                >
                  {copiedShare ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-cyan-400" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Season and Episode System */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-heading font-bold text-lg sm:text-xl text-white">
                  Seasons & Episodes
                </h2>
                <p className="text-xs text-slate-400">
                  Select an episode to begin streaming in high definition
                </p>
              </div>

              {/* Season Selection Tabs */}
              {anime.seasons && anime.seasons.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-slate-900/90 rounded-xl border border-slate-800">
                  {anime.seasons.map((season) => (
                    <button
                      key={season.id}
                      onClick={() => setSelectedSeasonNumber(season.seasonNumber)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedSeasonNumber === season.seasonNumber
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Season {season.seasonNumber}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Episodes List */}
            {activeSeason && activeSeason.episodes && activeSeason.episodes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeSeason.episodes.map((ep) => (
                  <div
                    key={ep.id}
                    onClick={() => onPlayEpisode(anime, activeSeason.seasonNumber, ep)}
                    className="group flex gap-3 p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-purple-500/50 cursor-pointer transition-all duration-200 hover:shadow-lg"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-28 aspect-video rounded-xl overflow-hidden bg-slate-950 shrink-0">
                      <img
                        src={ep.thumbnail || anime.poster}
                        alt={ep.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[10px] font-mono text-slate-300">
                        {ep.duration}
                      </span>
                    </div>

                    {/* Ep info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400">
                          <span>EP {ep.episodeNumber}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-emerald-400">Available</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-purple-300 truncate mt-0.5">
                          {ep.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 pt-1">
                        {ep.languages?.slice(0, 3).map((l) => (
                          <span
                            key={l}
                            className="text-[9px] font-semibold px-1 rounded bg-slate-800 text-slate-300"
                          >
                            {l.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                No episodes uploaded for this season yet. Check back soon!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
