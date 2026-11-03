import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Plus, Edit2, Trash2, BarChart3, Film, Video, Users, Check,
  Sparkles, RefreshCw, AlertTriangle, ArrowLeft, Star, ExternalLink, Layers,
  Upload, Image as ImageIcon, CheckCircle, FileVideo, LogOut, KeyRound, Lock
} from 'lucide-react';
import { Anime, AdminStats, Episode, AnimeLanguage, AnimeStatus, AnimeType } from '../types/anime';
import { api } from '../services/api';
import { BackButton } from './BackButton';

interface AdminDashboardProps {
  onBackToSite: () => void;
  onRefreshPublicData: () => void;
  onLogoutAdmin: () => void;
  genres: string[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToSite,
  onRefreshPublicData,
  onLogoutAdmin,
  genres: availableGenres,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'anime' | 'episodes' | 'security'>('anime');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Gallery upload progress states
  const [posterUploadProgress, setPosterUploadProgress] = useState<number | null>(null);
  const [bannerUploadProgress, setBannerUploadProgress] = useState<number | null>(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number | null>(null);
  const [thumbUploadProgress, setThumbUploadProgress] = useState<number | null>(null);

  // File input refs
  const posterFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const episodeVideoFileRef = useRef<HTMLInputElement>(null);
  const episodeThumbFileRef = useRef<HTMLInputElement>(null);

  // Modal / Form state for Add/Edit Anime
  const [isAnimeModalOpen, setIsAnimeModalOpen] = useState(false);
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null);
  const [animeForm, setAnimeForm] = useState<Partial<Anime>>({
    title: '',
    altTitle: '',
    synopsis: '',
    poster: '',
    coverBanner: '',
    genres: ['Action', 'Fantasy'],
    releaseYear: 2024,
    studio: 'RN Studio',
    status: 'Ongoing',
    type: 'TV Series',
    rating: 9.0,
    languages: ['Hindi', 'English', 'Japanese'],
    featured: false,
    trendingScore: 90,
  });

  // Modal / Form state for Add Episode
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [selectedAnimeForEpisode, setSelectedAnimeForEpisode] = useState<string>('');
  const [episodeForm, setEpisodeForm] = useState({
    animeId: '',
    seasonNumber: 1,
    title: '',
    duration: '24m 00s',
    videoUrl: '/sample-stream.mp4',
    languages: ['Hindi', 'Tamil', 'English'],
    thumbnail: '',
    synopsis: '',
  });

  // Security password change state
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, animeData] = await Promise.all([
        api.getAdminStats(),
        api.getAnimeList(),
      ]);
      setStats(statsData);
      setAnimeList(animeData);
    } catch (err: any) {
      console.error('Admin load error:', err);
      showNotification(err.message || 'Unauthorized: Owner credentials required', true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (text: string, isError = false) => {
    setStatusMessage({ text, isError });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // Gallery File Upload Handlers (Directly from phone gallery / desktop)
  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setPosterUploadProgress(0);
      const res = await api.uploadImage(file, (percent) => setPosterUploadProgress(percent));
      setAnimeForm((prev) => ({ ...prev, poster: res.url }));
      showNotification(`Poster "${file.name}" uploaded successfully!`);
    } catch (err: any) {
      showNotification(err.message || 'Poster upload failed', true);
    } finally {
      setPosterUploadProgress(null);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBannerUploadProgress(0);
      const res = await api.uploadImage(file, (percent) => setBannerUploadProgress(percent));
      setAnimeForm((prev) => ({ ...prev, coverBanner: res.url }));
      showNotification(`Banner "${file.name}" uploaded successfully!`);
    } catch (err: any) {
      showNotification(err.message || 'Banner upload failed', true);
    } finally {
      setBannerUploadProgress(null);
    }
  };

  const handleEpisodeVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setVideoUploadProgress(0);
      const res = await api.uploadVideo(file, (percent) => setVideoUploadProgress(percent));
      setEpisodeForm((prev) => ({ ...prev, videoUrl: res.url }));
      showNotification(`Video "${file.name}" uploaded & stream URL created!`);
    } catch (err: any) {
      showNotification(err.message || 'Video upload failed', true);
    } finally {
      setVideoUploadProgress(null);
    }
  };

  const handleEpisodeThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setThumbUploadProgress(0);
      const res = await api.uploadImage(file, (percent) => setThumbUploadProgress(percent));
      setEpisodeForm((prev) => ({ ...prev, thumbnail: res.url }));
      showNotification(`Thumbnail "${file.name}" uploaded!`);
    } catch (err: any) {
      showNotification(err.message || 'Thumbnail upload failed', true);
    } finally {
      setThumbUploadProgress(null);
    }
  };

  const handleOpenAddAnime = () => {
    setEditingAnime(null);
    setAnimeForm({
      title: '',
      altTitle: '',
      synopsis: '',
      poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      coverBanner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
      genres: ['Action', 'Fantasy'],
      releaseYear: 2024,
      studio: 'RN Works',
      status: 'Ongoing',
      type: 'TV Series',
      rating: 9.0,
      languages: ['Hindi', 'Tamil', 'English', 'Japanese'],
      featured: true,
      trendingScore: 92,
    });
    setIsAnimeModalOpen(true);
  };

  const handleOpenEditAnime = (anime: Anime) => {
    setEditingAnime(anime);
    setAnimeForm({ ...anime });
    setIsAnimeModalOpen(true);
  };

  const handleSaveAnime = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAnime) {
        await api.updateAnime(editingAnime.id, animeForm);
        showNotification(`Updated "${animeForm.title}" successfully!`);
      } else {
        await api.createAnime(animeForm);
        showNotification(`Created "${animeForm.title}" successfully!`);
      }
      setIsAnimeModalOpen(false);
      await loadData();
      onRefreshPublicData();
    } catch (err: any) {
      showNotification(err.message || 'Error saving anime', true);
    }
  };

  const handleDeleteAnime = async (id: string, title: string) => {
    if (!window.confirm(`Permanently delete "${title}" from RN ANIME WORLD?`)) return;
    try {
      await api.deleteAnime(id);
      showNotification(`Deleted "${title}" successfully`);
      await loadData();
      onRefreshPublicData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete anime', true);
    }
  };

  const handleToggleFeatured = async (anime: Anime) => {
    try {
      await api.updateAnime(anime.id, { featured: !anime.featured });
      showNotification(`Toggled spotlight for "${anime.title}"`);
      await loadData();
      onRefreshPublicData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to toggle featured status', true);
    }
  };

  const handleOpenAddEpisode = (animeId: string) => {
    setSelectedAnimeForEpisode(animeId);
    setEpisodeForm({
      animeId,
      seasonNumber: 1,
      title: 'Episode 1: Awakening',
      duration: '24m 00s',
      videoUrl: '/sample-stream.mp4',
      languages: ['Hindi', 'Tamil', 'Telugu', 'English', 'Japanese'],
      thumbnail: '',
      synopsis: 'Episode uploaded by website owner directly from gallery.',
    });
    setIsEpisodeModalOpen(true);
  };

  const handleSaveEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addEpisode(episodeForm);
      showNotification(`Episode added successfully!`);
      setIsEpisodeModalOpen(false);
      await loadData();
      onRefreshPublicData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to add episode', true);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotification('New passwords do not match', true);
      return;
    }
    try {
      await api.changeAdminPassword(currPassword, newPassword);
      showNotification('Owner password updated securely on server!');
      setCurrPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showNotification(err.message || 'Password update failed', true);
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Reset catalog to the default high-definition seeded database?')) return;
    try {
      await api.resetDatabase();
      showNotification('Database restored to default catalog!');
      await loadData();
      onRefreshPublicData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to reset database', true);
    }
  };

  return (
    <div className="min-h-screen bg-[#090B12] text-slate-100 pt-20 pb-24">
      
      {/* Hidden File Inputs for Direct Gallery Uploads */}
      <input
        ref={posterFileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handlePosterUpload}
        className="hidden"
      />
      <input
        ref={bannerFileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleBannerUpload}
        className="hidden"
      />
      <input
        ref={episodeVideoFileRef}
        type="file"
        accept="video/mp4,video/webm,video/mkv,video/ogg,video/quicktime"
        onChange={handleEpisodeVideoUpload}
        className="hidden"
      />
      <input
        ref={episodeThumbFileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleEpisodeThumbUpload}
        className="hidden"
      />

      {/* Top Security & Navigation Header */}
      <div className="bg-[#111522] border-b border-slate-800 sticky top-16 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <BackButton onClick={onBackToSite} label="Back to Website" />
            <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
              <Shield className="w-5 h-5 text-purple-400" />
              <div>
                <h1 className="font-heading font-black text-base sm:text-lg text-white leading-none">
                  OWNER ADMIN SUITE
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-mono text-cyan-300 font-bold">
                    OWNER UID: 39090357
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('anime')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'anime' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Anime Catalog ({animeList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('episodes')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'episodes' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Episodes & Uploads</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'stats' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Live Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'security' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Security</span>
            </button>
          </div>

          {/* Action buttons: Add Anime & Logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddAnime}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add Anime</span>
            </button>
            <button
              onClick={onLogoutAdmin}
              className="p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/80 border border-rose-600/40 text-rose-300 text-xs font-semibold"
              title="Logout Owner Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Status Message Notification */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
              statusMessage.isError
                ? 'bg-rose-950/80 border border-rose-600 text-rose-200'
                : 'bg-emerald-950/80 border border-emerald-500 text-emerald-200'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} className="text-white">✕</button>
          </div>
        )}

        {/* TAB 1: ANIME CATALOG WITH GALLERY UPLOADS */}
        {activeTab === 'anime' && (
          <div className="bg-[#111522] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-bold text-base sm:text-lg text-white">Anime Catalog</h3>
                <p className="text-xs text-slate-400">Total {animeList.length} anime entries in RN ANIME WORLD</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddAnime}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Anime</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Poster & Title</th>
                    <th className="py-3 px-3">Type & Year</th>
                    <th className="py-3 px-3">Languages</th>
                    <th className="py-3 px-3">Rating</th>
                    <th className="py-3 px-3">Spotlight</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {animeList.map((anime) => (
                    <tr key={anime.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={anime.poster || anime.coverBanner}
                          alt={anime.title}
                          className="w-10 h-14 rounded-lg object-cover bg-slate-950 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate max-w-xs">{anime.title}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{anime.altTitle || anime.studio}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-300">{anime.type}</span>
                        <span className="block text-[11px] text-slate-500">{anime.releaseYear}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {anime.languages.map((l) => (
                            <span key={l} className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                              {l}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-amber-400">
                        ★ {anime.rating}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleToggleFeatured(anime)}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                            anime.featured
                              ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {anime.featured ? 'Featured' : 'Standard'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenAddEpisode(anime.id)}
                          className="p-1.5 rounded-lg bg-blue-950 text-blue-300 hover:bg-blue-900"
                          title="Add Episode & Upload Video"
                        >
                          <Video className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditAnime(anime)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnime(anime.id, anime.title)}
                          className="p-1.5 rounded-lg bg-rose-950/60 text-rose-300 hover:bg-rose-900/80"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: EPISODES & DIRECT VIDEO UPLOAD CENTER */}
        {activeTab === 'episodes' && (
          <div className="bg-[#111522] border border-slate-800 rounded-2xl p-5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-heading font-bold text-base sm:text-lg text-white">Season & Episode Upload Center</h3>
                <p className="text-xs text-slate-400">Directly upload videos & thumbnails from your phone gallery</p>
              </div>

              <select
                value={selectedAnimeForEpisode}
                onChange={(e) => setSelectedAnimeForEpisode(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200"
              >
                <option value="">-- Choose Anime to View/Upload Episodes --</option>
                {animeList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.seasons?.reduce((acc, s) => acc + s.episodes.length, 0) || 0} eps)
                  </option>
                ))}
              </select>
            </div>

            {selectedAnimeForEpisode ? (
              (() => {
                const anime = animeList.find((a) => a.id === selectedAnimeForEpisode);
                if (!anime) return null;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">
                        {anime.title} — {anime.seasons.length} Seasons
                      </h4>
                      <button
                        onClick={() => handleOpenAddEpisode(anime.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Episode to {anime.title}</span>
                      </button>
                    </div>

                    {anime.seasons.map((season) => (
                      <div key={season.id} className="border border-slate-800 rounded-xl p-4 bg-slate-900/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-purple-300">
                            Season {season.seasonNumber}: {season.title} ({season.episodes.length} episodes)
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {season.episodes.map((ep) => (
                            <div key={ep.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex gap-3">
                              <img
                                src={ep.thumbnail || anime.poster}
                                alt={ep.title}
                                className="w-20 aspect-video rounded-lg object-cover bg-slate-950 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-cyan-400">EP {ep.episodeNumber}</p>
                                <p className="text-xs font-semibold text-white truncate">{ep.title}</p>
                                <p className="text-[10px] text-slate-500 font-mono truncate">{ep.duration}</p>
                                <p className="text-[10px] text-emerald-400 truncate mt-0.5">Stream Linked</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Select an anime title from the dropdown above to manage its seasons and upload videos.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LIVE STATISTICS */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-[#111522] border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Total Anime</span>
                <p className="font-heading font-black text-2xl text-cyan-400">{stats.totalAnime}</p>
              </div>
              <div className="bg-[#111522] border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Total Episodes</span>
                <p className="font-heading font-black text-2xl text-purple-400">{stats.totalEpisodes}</p>
              </div>
              <div className="bg-[#111522] border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Total Views</span>
                <p className="font-heading font-black text-2xl text-emerald-400">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="bg-[#111522] border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Hindi Dubbed</span>
                <p className="font-heading font-black text-2xl text-amber-400">{stats.hindiDubbedCount}</p>
              </div>
              <div className="bg-[#111522] border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Tamil Dubbed</span>
                <p className="font-heading font-black text-2xl text-sky-400">{stats.tamilDubbedCount}</p>
              </div>
              <div className="bg-[#111522] border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Telugu Dubbed</span>
                <p className="font-heading font-black text-2xl text-pink-400">{stats.teluguDubbedCount}</p>
              </div>
            </div>

            <div className="bg-[#111522] border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="font-heading font-bold text-base text-white">Reset / Maintenance</h3>
              <p className="text-xs text-slate-400">
                You can restore the default seeded catalog or synchronize all changes to disk.
              </p>
              <button
                onClick={handleResetDatabase}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-600/40 text-rose-300 text-xs font-semibold"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Database to Seed Catalog</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY & OWNER SETTINGS */}
        {activeTab === 'security' && (
          <div className="max-w-xl bg-[#111522] border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-white">Server-Side Owner Security</h3>
                <p className="text-xs text-slate-400">Configure your private owner credentials securely</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Verified Owner UID:</span>
                <span className="font-mono font-bold text-cyan-400">39090357</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Session Status:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Authenticated
                </span>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <h4 className="font-semibold text-white">Update Owner Password</h4>
              
              <div className="space-y-1">
                <label className="text-slate-300 block">Current Password</label>
                <input
                  type="password"
                  required
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 block">New Server Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 block">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold"
              >
                Update Password
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: ADD / EDIT ANIME WITH GALLERY IMAGE PICKERS      */}
      {/* ========================================================= */}
      {isAnimeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#111522] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading font-bold text-lg text-white">
                {editingAnime ? `Edit Anime: ${editingAnime.title}` : 'Add New Anime to RN ANIME WORLD'}
              </h3>
              <button onClick={() => setIsAnimeModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveAnime} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Anime Title *</label>
                  <input
                    type="text"
                    required
                    value={animeForm.title || ''}
                    onChange={(e) => setAnimeForm({ ...animeForm, title: e.target.value })}
                    placeholder="e.g. Solo Leveling: Arise"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Alternative Title (Japanese / Hindi)</label>
                  <input
                    type="text"
                    value={animeForm.altTitle || ''}
                    onChange={(e) => setAnimeForm({ ...animeForm, altTitle: e.target.value })}
                    placeholder="e.g. 俺だけレベルアップな件"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Synopsis / Description *</label>
                <textarea
                  rows={3}
                  required
                  value={animeForm.synopsis || ''}
                  onChange={(e) => setAnimeForm({ ...animeForm, synopsis: e.target.value })}
                  placeholder="Detailed storyline and plot summary..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              {/* DIRECT GALLERY POSTER UPLOAD */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    Anime Poster (Select from Mobile Gallery)
                  </span>
                  <button
                    type="button"
                    onClick={() => posterFileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold shadow transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose from Gallery</span>
                  </button>
                </div>

                {posterUploadProgress !== null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-cyan-300">
                      <span>Uploading to secure media storage...</span>
                      <span>{posterUploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 transition-all" style={{ width: `${posterUploadProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {animeForm.poster ? (
                    <img src={animeForm.poster} alt="Poster preview" className="w-14 h-20 rounded-lg object-cover bg-slate-950 border border-slate-700 shrink-0" />
                  ) : (
                    <div className="w-14 h-20 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 text-[10px] shrink-0">
                      No Poster
                    </div>
                  )}
                  <input
                    type="text"
                    value={animeForm.poster || ''}
                    onChange={(e) => setAnimeForm({ ...animeForm, poster: e.target.value })}
                    placeholder="Or enter image URL"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono"
                  />
                </div>
              </div>

              {/* DIRECT GALLERY BANNER UPLOAD */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                    Cover Banner (Select from Mobile Gallery)
                  </span>
                  <button
                    type="button"
                    onClick={() => bannerFileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold shadow transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose from Gallery</span>
                  </button>
                </div>

                {bannerUploadProgress !== null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-purple-300">
                      <span>Uploading banner...</span>
                      <span>{bannerUploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400 transition-all" style={{ width: `${bannerUploadProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {animeForm.coverBanner ? (
                    <img src={animeForm.coverBanner} alt="Banner preview" className="w-24 h-14 rounded-lg object-cover bg-slate-950 border border-slate-700 shrink-0" />
                  ) : (
                    <div className="w-24 h-14 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 text-[10px] shrink-0">
                      No Banner
                    </div>
                  )}
                  <input
                    type="text"
                    value={animeForm.coverBanner || ''}
                    onChange={(e) => setAnimeForm({ ...animeForm, coverBanner: e.target.value })}
                    placeholder="Or enter banner URL"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Type</label>
                  <select
                    value={animeForm.type || 'TV Series'}
                    onChange={(e) => setAnimeForm({ ...animeForm, type: e.target.value as AnimeType })}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="TV Series">TV Series</option>
                    <option value="Movie">Movie</option>
                    <option value="Cartoon">Cartoon</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Status</label>
                  <select
                    value={animeForm.status || 'Ongoing'}
                    onChange={(e) => setAnimeForm({ ...animeForm, status: e.target.value as AnimeStatus })}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Release Year</label>
                  <input
                    type="number"
                    value={animeForm.releaseYear || 2024}
                    onChange={(e) => setAnimeForm({ ...animeForm, releaseYear: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Rating (0–10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={animeForm.rating || 9.0}
                    onChange={(e) => setAnimeForm({ ...animeForm, rating: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Languages selection */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Dub Languages Included</label>
                <div className="flex flex-wrap gap-2">
                  {(['Hindi', 'Tamil', 'Telugu', 'English', 'Japanese'] as AnimeLanguage[]).map((lang) => {
                    const isChecked = animeForm.languages?.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          const current = animeForm.languages || [];
                          const updated = isChecked
                            ? current.filter((l) => l !== lang)
                            : [...current, lang];
                          setAnimeForm({ ...animeForm, languages: updated });
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          isChecked ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {lang} {isChecked && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={Boolean(animeForm.featured)}
                  onChange={(e) => setAnimeForm({ ...animeForm, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600 accent-purple-600"
                />
                <label htmlFor="featuredToggle" className="text-slate-300 font-medium cursor-pointer">
                  Feature in Homepage Hero Carousel (Top Spotlight)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAnimeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold"
                >
                  {editingAnime ? 'Save Changes' : 'Create & Publish Anime'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ADD EPISODE WITH DIRECT GALLERY VIDEO UPLOADER   */}
      {/* ========================================================= */}
      {isEpisodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#111522] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-heading font-bold text-base text-white">Add Episode</h3>
                <p className="text-[11px] text-slate-400">Select video directly from your phone gallery or storage</p>
              </div>
              <button onClick={() => setIsEpisodeModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEpisode} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Episode Title *</label>
                <input
                  type="text"
                  required
                  value={episodeForm.title}
                  onChange={(e) => setEpisodeForm({ ...episodeForm, title: e.target.value })}
                  placeholder="e.g. Episode 1: New Threat Arises"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Season Number</label>
                  <input
                    type="number"
                    min="1"
                    value={episodeForm.seasonNumber}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, seasonNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Duration</label>
                  <input
                    type="text"
                    value={episodeForm.duration}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, duration: e.target.value })}
                    placeholder="24m 00s"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* DIRECT VIDEO UPLOAD FROM MOBILE STORAGE / GALLERY */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <FileVideo className="w-4 h-4 text-blue-400" />
                    Episode Video (Upload from Gallery)
                  </span>
                  <button
                    type="button"
                    onClick={() => episodeVideoFileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select Video File</span>
                  </button>
                </div>

                {videoUploadProgress !== null && (
                  <div className="space-y-1 py-1">
                    <div className="flex justify-between text-[11px] font-bold text-blue-300">
                      <span>Uploading video file to media storage...</span>
                      <span>{videoUploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-150" style={{ width: `${videoUploadProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block">Generated Video Stream URL:</label>
                  <input
                    type="text"
                    required
                    value={episodeForm.videoUrl}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, videoUrl: e.target.value })}
                    placeholder="/uploads/videos/... or external stream URL"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono"
                  />
                </div>
              </div>

              {/* DIRECT THUMBNAIL UPLOAD FROM GALLERY */}
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                    Episode Thumbnail (Gallery)
                  </span>
                  <button
                    type="button"
                    onClick={() => episodeThumbFileRef.current?.click()}
                    className="px-2.5 py-1 rounded bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-[10px] font-bold"
                  >
                    Upload Thumbnail
                  </button>
                </div>
                {thumbUploadProgress !== null && (
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400" style={{ width: `${thumbUploadProgress}%` }} />
                  </div>
                )}
                {episodeForm.thumbnail && (
                  <img src={episodeForm.thumbnail} alt="Thumbnail preview" className="w-24 aspect-video rounded-lg object-cover" />
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEpisodeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Save Episode & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
