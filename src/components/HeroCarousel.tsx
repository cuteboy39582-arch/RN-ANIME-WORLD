import React, { useState, useEffect, useRef } from 'react';
import { Play, Info, ChevronLeft, ChevronRight, Star, Volume2, VolumeX, Sparkles, Languages } from 'lucide-react';
import { Anime } from '../types/anime';

interface HeroCarouselProps {
  featuredList: Anime[];
  onWatchNow: (anime: Anime) => void;
  onOpenDetails: (anime: Anime) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  featuredList,
  onWatchNow,
  onOpenDetails,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentAnime = featuredList[currentIndex] || featuredList[0];

  useEffect(() => {
    if (!featuredList.length || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 6500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [featuredList.length, isPaused]);

  if (!currentAnime) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredList.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length);
  };

  return (
    <div
      className="relative w-full h-[580px] sm:h-[640px] lg:h-[720px] overflow-hidden bg-[#090B12] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Anime Artwork with crossfade transitions */}
      {featuredList.map((anime, idx) => (
        <div
          key={anime.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <img
            src={anime.coverBanner || anime.poster}
            alt={anime.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top sm:object-center transform scale-105 animate-in zoom-in duration-[10000ms]"
          />
          {/* Multi-layered cinematic gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090B12] via-[#090B12]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090B12] via-[#090B12]/80 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />
        </div>
      ))}

      {/* Hero Content Information Container */}
      <div className="relative z-20 max-w-7xl mx-auto h-full flex flex-col justify-end pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl sm:max-w-3xl space-y-3.5 sm:space-y-4">
          
          {/* Kicker & Language badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-[11px] shadow-sm">
              <Sparkles className="w-3 h-3 text-cyan-300" />
              #1 Spotlight
            </span>
            <span className="text-slate-300 font-semibold tracking-wide">
              {currentAnime.type}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">{currentAnime.releaseYear}</span>
            <span className="text-slate-500">·</span>
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {currentAnime.rating}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300 font-mono text-[11px]">{currentAnime.studio}</span>
          </div>

          {/* Anime Title */}
          <div>
            <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white drop-shadow-md leading-[1.08] text-balance">
              {currentAnime.title}
            </h1>
            {currentAnime.altTitle && (
              <p className="text-xs sm:text-sm text-cyan-300/80 font-medium tracking-wide mt-1">
                {currentAnime.altTitle}
              </p>
            )}
          </div>

          {/* Languages available pill string */}
          <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <Languages className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Available Dubs:</span>
            <div className="flex flex-wrap gap-1.5">
              {currentAnime.languages.map((lang) => (
                <span
                  key={lang}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    lang === 'Hindi'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : lang === 'Tamil'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : lang === 'Telugu'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Short synopsis */}
          <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-2xl text-shadow">
            {currentAnime.synopsis}
          </p>

          {/* Genres */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {currentAnime.genres.map((g) => (
              <span
                key={g}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700/60 text-slate-300"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onWatchNow(currentAnime)}
              className="group flex items-center gap-2.5 px-6 sm:px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-purple-600/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white text-white group-hover:text-purple-900 transition-colors">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
              <span>Watch Now</span>
            </button>

            <button
              onClick={() => onOpenDetails(currentAnime)}
              className="flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700 hover:border-slate-500 text-slate-100 font-semibold text-sm sm:text-base backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Navigation Arrows */}
      <div className="absolute right-4 sm:right-8 bottom-14 sm:bottom-20 z-30 flex items-center gap-2">
        <button
          onClick={prevSlide}
          className="w-10 h-10 rounded-full bg-slate-900/70 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          aria-label="Previous featured anime"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="w-10 h-10 rounded-full bg-slate-900/70 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          aria-label="Next featured anime"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slide Indicators / Thumbnails */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {featuredList.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? 'w-7 sm:w-9 h-1.5 bg-gradient-to-r from-blue-400 to-purple-500 shadow-sm shadow-purple-500/50'
                : 'w-2 h-1.5 bg-slate-600/70 hover:bg-slate-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
