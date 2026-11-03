import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward,
  RotateCcw, RotateCw, ArrowLeft, Settings, ListVideo, Layers, Globe, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import { Anime, Episode } from '../types/anime';

interface VideoPlayerViewProps {
  anime: Anime;
  initialSeasonNumber: number;
  initialEpisode: Episode;
  onClose: () => void;
  onUpdateHistory?: (data: {
    animeId: string;
    seasonNumber: number;
    episodeNumber: number;
    episodeTitle: string;
    progressSeconds: number;
    durationSeconds: number;
  }) => void;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  anime,
  initialSeasonNumber,
  initialEpisode,
  onClose,
  onUpdateHistory,
}) => {
  const [currentSeasonNumber, setCurrentSeasonNumber] = useState(initialSeasonNumber);
  const [currentEpisode, setCurrentEpisode] = useState<Episode>(initialEpisode);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    initialEpisode.languages[0] || 'Hindi'
  );
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showEpisodesDrawer, setShowEpisodesDrawer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [videoSource, setVideoSource] = useState<string>(() => {
    return currentEpisode.videoUrl && currentEpisode.videoUrl.trim()
      ? currentEpisode.videoUrl
      : '/sample-stream.mp4';
  });
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentSeason =
    anime.seasons.find((s) => s.seasonNumber === currentSeasonNumber) ||
    anime.seasons[0];
  const allEpisodes = currentSeason?.episodes || [];
  const currentEpIndex = allEpisodes.findIndex((e) => e.id === currentEpisode.id);

  // Load episode and auto-play
  useEffect(() => {
    const nextUrl = currentEpisode.videoUrl && currentEpisode.videoUrl.trim()
      ? currentEpisode.videoUrl
      : '/sample-stream.mp4';
    setVideoSource(nextUrl);
    setFallbackAttempted(false);
    setIsLoading(true);
    setHasError(false);
  }, [currentEpisode]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay policy or paused state
          setIsPlaying(false);
        });
    }
  }, [videoSource]);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    e.stopPropagation();
    if (!fallbackAttempted && videoSource !== '/sample-stream.mp4') {
      setFallbackAttempted(true);
      setVideoSource('/sample-stream.mp4');
      setIsLoading(false);
      setHasError(false);
    } else {
      setIsLoading(false);
      setHasError(true);
    }
  };

  // Track progress and update watch history
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && onUpdateHistory && !hasError && currentTime > 3) {
        onUpdateHistory({
          animeId: anime.id,
          seasonNumber: currentSeasonNumber,
          episodeNumber: currentEpisode.episodeNumber,
          episodeTitle: currentEpisode.title,
          progressSeconds: Math.floor(videoRef.current.currentTime),
          durationSeconds: Math.floor(videoRef.current.duration || 1440),
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [anime.id, currentSeasonNumber, currentEpisode, currentTime, hasError, onUpdateHistory]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.7;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  const handlePrevEpisode = () => {
    if (currentEpIndex > 0) {
      setCurrentEpisode(allEpisodes[currentEpIndex - 1]);
    }
  };

  const handleNextEpisode = () => {
    if (currentEpIndex < allEpisodes.length - 1) {
      setCurrentEpisode(allEpisodes[currentEpIndex + 1]);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-[#090B12] text-white flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Header Bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent transition-opacity duration-300 flex items-center justify-between ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 flex items-center gap-2 backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-cyan-400" />
            <span className="hidden sm:inline text-xs font-semibold">Back to Details</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-600/80 text-white uppercase tracking-wider">
                RN STREAM
              </span>
              <span className="text-xs font-bold text-cyan-300 truncate max-w-[200px] sm:max-w-md">
                {anime.title}
              </span>
            </div>
            <p className="text-xs text-slate-300 truncate max-w-[240px] sm:max-w-lg mt-0.5">
              Season {currentSeasonNumber} · Episode {currentEpisode.episodeNumber}: {currentEpisode.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Dub selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200"
            >
              <Globe className="w-4 h-4 text-purple-400" />
              <span>{selectedLanguage} Dub</span>
            </button>

            {showLanguageMenu && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-[#111522] border border-slate-700 rounded-xl shadow-2xl p-1.5 z-40">
                <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 block">
                  Select Audio Dub
                </span>
                {anime.languages.map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setSelectedLanguage(l);
                      setShowLanguageMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                      selectedLanguage === l
                        ? 'bg-purple-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{l}</span>
                    {selectedLanguage === l && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Episode list drawer toggle */}
          <button
            onClick={() => setShowEpisodesDrawer(!showEpisodesDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-300"
          >
            <ListVideo className="w-4 h-4" />
            <span className="hidden md:inline">Episodes</span>
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div
        onClick={togglePlay}
        className="relative w-full h-full flex items-center justify-center bg-black cursor-pointer"
      >
        <video
          ref={videoRef}
          key={videoSource}
          src={videoSource}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => {
            setIsLoading(false);
            setHasError(false);
          }}
          onPlaying={() => {
            setIsLoading(false);
            setHasError(false);
          }}
          onError={handleVideoError}
          className="w-full h-full max-h-screen object-contain"
          playsInline
          preload="auto"
        />

        {/* Loading Spinner */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-cyan-400 rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-300 mt-3">Buffering stream...</span>
          </div>
        )}

        {/* Error Fallback */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#090B12]/95 p-6 text-center z-20">
            <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
            <h3 className="font-heading font-bold text-lg text-white">Stream Error</h3>
            <p className="text-xs text-slate-400 max-w-md mt-1 mb-4">
              Unable to load external video source. Switch to local authorized backup stream below.
            </p>
            <button
              onClick={() => {
                setVideoSource('/sample-stream.mp4');
                setHasError(false);
                setIsLoading(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Play Backup Stream</span>
            </button>
          </div>
        )}

        {/* Big Play overlay when paused */}
        {!isPlaying && !isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-2xl shadow-purple-600/50 transform scale-110">
              <Play className="w-9 h-9 fill-current ml-1.5" />
            </div>
          </div>
        )}
      </div>

      {/* Episode Drawer overlay */}
      {showEpisodesDrawer && (
        <div className="absolute top-16 bottom-24 right-4 w-80 sm:w-96 bg-[#111522]/95 border border-slate-700/80 rounded-2xl shadow-2xl p-4 z-40 backdrop-blur-xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h4 className="font-heading font-bold text-sm text-white">Season {currentSeasonNumber} Episodes</h4>
              <p className="text-[11px] text-slate-400">{allEpisodes.length} Episodes available</p>
            </div>
            <button
              onClick={() => setShowEpisodesDrawer(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 py-3">
            {allEpisodes.map((ep) => (
              <div
                key={ep.id}
                onClick={() => {
                  setCurrentEpisode(ep);
                  setShowEpisodesDrawer(false);
                }}
                className={`flex gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                  ep.id === currentEpisode.id
                    ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-purple-500/50'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border border-transparent'
                }`}
              >
                <div className="w-20 aspect-video rounded-lg overflow-hidden bg-slate-950 shrink-0 relative">
                  <img src={ep.thumbnail || anime.poster} alt={ep.title} className="w-full h-full object-cover" />
                  {ep.id === currentEpisode.id && (
                    <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center">
                      <Play className="w-4 h-4 fill-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-cyan-400">EP {ep.episodeNumber}</p>
                  <p className="text-xs font-semibold text-slate-200 truncate">{ep.title}</p>
                  <span className="text-[10px] text-slate-400">{ep.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 space-y-3 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Bar / Seek Slider */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400 min-w-[40px]">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 flex items-center group">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 sm:h-2 bg-slate-700/60 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-cyan-400 transition-all"
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400 min-w-[40px] text-right">
            {formatTime(duration)}
          </span>
        </div>

        {/* Buttons and volume controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shadow-purple-600/30"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            {/* Previous Episode */}
            <button
              onClick={handlePrevEpisode}
              disabled={currentEpIndex <= 0}
              className={`p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors ${
                currentEpIndex <= 0 ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              title="Previous Episode"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* Next Episode */}
            <button
              onClick={handleNextEpisode}
              disabled={currentEpIndex >= allEpisodes.length - 1}
              className={`p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors ${
                currentEpIndex >= allEpisodes.length - 1 ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              title="Next Episode"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Jump -10s / +10s */}
            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = Math.max(0, currentTime - 10);
              }}
              className="hidden sm:flex p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Rewind 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = Math.min(duration, currentTime + 10);
              }}
              className="hidden sm:flex p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Forward 10s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group">
              <button
                onClick={toggleMute}
                className="p-2 text-slate-300 hover:text-white"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Playback speed selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-slate-200"
              >
                {playbackSpeed}x
              </button>
              {showSpeedMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-28 bg-[#111522] border border-slate-700 rounded-xl shadow-2xl p-1 z-40">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      className={`w-full text-left px-2 py-1 rounded text-xs ${
                        playbackSpeed === s ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
