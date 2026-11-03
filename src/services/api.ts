import { Anime, CategoryInfo, Episode, User, WatchHistory, Favorite, AdminStats, FileUploadResponse, AdminAuthSession } from '../types/anime';
import { INITIAL_ANIME_DATA, INITIAL_CATEGORIES, INITIAL_GENRES } from '../data/initialData';

// Owner Token storage key (saved in sessionStorage so it clears on browser close and never stores raw password)
const ADMIN_TOKEN_KEY = 'rn_admin_session_token';

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string | null) {
  try {
    if (token) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch {}
}

function getAdminHeaders(): Record<string, string> {
  const token = getAdminToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-admin-token'] = token;
  }
  return headers;
}

export const api = {
  // Public Catalog
  async getAnimeList(params?: {
    q?: string;
    category?: string;
    genre?: string;
    language?: string;
    type?: string;
    status?: string;
    sort?: string;
  }): Promise<Anime[]> {
    try {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value && value !== 'All') query.append(key, value);
        });
      }
      const res = await fetch(`/api/anime?${query.toString()}`);
      if (!res.ok) throw new Error('Network response not ok');
      const data = await res.json();
      return data.data;
    } catch {
      let list = [...INITIAL_ANIME_DATA];
      if (params?.q) {
        const q = params.q.toLowerCase();
        list = list.filter((a) =>
          a.title.toLowerCase().includes(q) ||
          a.altTitle.toLowerCase().includes(q) ||
          a.genres.some((g) => g.toLowerCase().includes(q))
        );
      }
      if (params?.category === 'hindi-dub') list = list.filter((a) => a.languages.includes('Hindi'));
      if (params?.category === 'tamil-dub') list = list.filter((a) => a.languages.includes('Tamil'));
      if (params?.category === 'telugu-dub') list = list.filter((a) => a.languages.includes('Telugu'));
      if (params?.category === 'movies') list = list.filter((a) => a.type === 'Movie');
      return list;
    }
  },

  async getAnimeById(id: string): Promise<Anime | null> {
    try {
      const res = await fetch(`/api/anime/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      return data.data;
    } catch {
      return INITIAL_ANIME_DATA.find((a) => a.id === id) || null;
    }
  },

  async getFeaturedAnime(): Promise<Anime[]> {
    try {
      const res = await fetch('/api/featured');
      if (!res.ok) throw new Error('Featured load error');
      const data = await res.json();
      return data.data;
    } catch {
      return INITIAL_ANIME_DATA.filter((a) => a.featured || a.trendingScore >= 94);
    }
  },

  async getCategories(): Promise<CategoryInfo[]> {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Categories load error');
      const data = await res.json();
      return data.data;
    } catch {
      return INITIAL_CATEGORIES;
    }
  },

  async getGenres(): Promise<string[]> {
    try {
      const res = await fetch('/api/genres');
      if (!res.ok) throw new Error('Genres load error');
      const data = await res.json();
      return data.data;
    } catch {
      return INITIAL_GENRES;
    }
  },

  // User Favorites & Watch History
  async getUserFavorites(userId: string): Promise<Favorite[]> {
    try {
      const res = await fetch(`/api/user/${userId}/favorites`);
      if (!res.ok) throw new Error('Favorites load error');
      const data = await res.json();
      return data.data;
    } catch {
      const stored = localStorage.getItem(`rn_favs_${userId}`);
      if (stored) return JSON.parse(stored);
      return [];
    }
  },

  async toggleFavorite(userId: string, animeId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/user/${userId}/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId }),
      });
      const data = await res.json();
      return data.isFavorite;
    } catch {
      const key = `rn_favs_${userId}`;
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      const exists = stored.find((f: any) => f.animeId === animeId);
      if (exists) {
        const filtered = stored.filter((f: any) => f.animeId !== animeId);
        localStorage.setItem(key, JSON.stringify(filtered));
        return false;
      } else {
        stored.push({ id: `fav-${Date.now()}`, userId, animeId, addedAt: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(stored));
        return true;
      }
    }
  },

  async getUserHistory(userId: string): Promise<WatchHistory[]> {
    try {
      const res = await fetch(`/api/user/${userId}/history`);
      if (!res.ok) throw new Error('History load error');
      const data = await res.json();
      return data.data;
    } catch {
      const stored = localStorage.getItem(`rn_history_${userId}`);
      if (stored) return JSON.parse(stored);
      return [];
    }
  },

  async saveWatchHistory(
    userId: string,
    historyData: {
      animeId: string;
      seasonNumber: number;
      episodeNumber: number;
      episodeTitle: string;
      progressSeconds: number;
      durationSeconds: number;
    }
  ): Promise<WatchHistory | null> {
    try {
      const res = await fetch(`/api/user/${userId}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(historyData),
      });
      const data = await res.json();
      return data.data;
    } catch {
      const key = `rn_history_${userId}`;
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      const existingIdx = list.findIndex((h: any) => h.animeId === historyData.animeId);
      const item: WatchHistory = {
        id: `wh-${Date.now()}`,
        userId,
        animeId: historyData.animeId,
        animeTitle: historyData.animeId,
        animePoster: '',
        seasonNumber: historyData.seasonNumber,
        episodeNumber: historyData.episodeNumber,
        episodeTitle: historyData.episodeTitle,
        progressSeconds: historyData.progressSeconds,
        durationSeconds: historyData.durationSeconds,
        updatedAt: new Date().toISOString(),
      };
      if (existingIdx >= 0) list[existingIdx] = item;
      else list.unshift(item);
      localStorage.setItem(key, JSON.stringify(list));
      return item;
    }
  },

  // Public User Login
  async login(email: string): Promise<User> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return data.user;
  },

  // ==========================================
  // OWNER AUTHENTICATION (UID: 39090357)
  // ==========================================

  async adminLogin(uid: string, password: string): Promise<AdminAuthSession> {
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: uid.trim(), password }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Access Denied: Invalid owner authentication.');
    }
    setAdminToken(data.token);
    return data;
  },

  async verifyAdmin(): Promise<boolean> {
    const token = getAdminToken();
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/verify-admin', {
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (!data.success || !data.authorized) {
        setAdminToken(null);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  async adminLogout(): Promise<void> {
    const token = getAdminToken();
    if (token) {
      try {
        await fetch('/api/auth/admin-logout', {
          method: 'POST',
          headers: getAdminHeaders(),
        });
      } catch {}
    }
    setAdminToken(null);
  },

  async changeAdminPassword(currentPassword: string, newPassword: string): Promise<boolean> {
    const res = await fetch('/api/auth/change-admin-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminHeaders(),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to change owner password');
    return true;
  },

  // ==========================================
  // DIRECT GALLERY FILE UPLOADS
  // ==========================================

  uploadImage(file: File, onProgress?: (percent: number) => void): Promise<FileUploadResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/admin/upload-image');

      const token = getAdminToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('x-admin-token', token);
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success) resolve(data);
            else reject(new Error(data.message || 'Image upload failed'));
          } catch (e) {
            reject(new Error('Invalid server response'));
          }
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            reject(new Error(errData.error || errData.message || `Upload failed (${xhr.status})`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error during image upload'));

      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    });
  },

  uploadVideo(file: File, onProgress?: (percent: number) => void): Promise<FileUploadResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/admin/upload-video');

      const token = getAdminToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('x-admin-token', token);
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success) resolve(data);
            else reject(new Error(data.message || 'Video upload failed'));
          } catch (e) {
            reject(new Error('Invalid server response'));
          }
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            reject(new Error(errData.error || errData.message || `Video upload failed (${xhr.status})`));
          } catch {
            reject(new Error(`Video upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error during video upload'));

      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    });
  },

  // ==========================================
  // PROTECTED ADMIN CRUD (Sourced with Token)
  // ==========================================

  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch('/api/admin/stats', {
      headers: getAdminHeaders(),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch admin stats');
    return data.data;
  },

  async createAnime(anime: Partial<Anime>): Promise<Anime> {
    const res = await fetch('/api/admin/anime', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminHeaders(),
      },
      body: JSON.stringify(anime),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || data.message || 'Failed to create anime');
    return data.data;
  },

  async updateAnime(id: string, anime: Partial<Anime>): Promise<Anime> {
    const res = await fetch(`/api/admin/anime/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminHeaders(),
      },
      body: JSON.stringify(anime),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || data.message || 'Failed to update anime');
    return data.data;
  },

  async deleteAnime(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/anime/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to delete anime');
    return data.success;
  },

  async addEpisode(episodeData: {
    animeId: string;
    seasonNumber: number;
    title: string;
    duration: string;
    videoUrl: string;
    languages: string[];
    thumbnail?: string;
    synopsis?: string;
  }): Promise<Episode> {
    const res = await fetch('/api/admin/episodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminHeaders(),
      },
      body: JSON.stringify(episodeData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || data.message || 'Failed to add episode');
    return data.data;
  },

  async deleteEpisode(animeId: string, episodeId: string): Promise<boolean> {
    const res = await fetch(`/api/admin/episodes/${animeId}/${episodeId}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to delete episode');
    return data.success;
  },

  async resetDatabase(): Promise<boolean> {
    const res = await fetch('/api/admin/reset-database', {
      method: 'POST',
      headers: getAdminHeaders(),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to reset database');
    return data.success;
  },
};
