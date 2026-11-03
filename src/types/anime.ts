export type AnimeLanguage = 'Hindi' | 'Tamil' | 'Telugu' | 'English' | 'Japanese';

export type AnimeStatus = 'Ongoing' | 'Completed';
export type AnimeType = 'TV Series' | 'Movie' | 'Cartoon';

export interface Episode {
  id: string;
  seasonId: string;
  animeId: string;
  episodeNumber: number;
  title: string;
  thumbnail: string;
  duration: string;
  languages: AnimeLanguage[];
  videoUrl: string;
  isAvailable: boolean;
  synopsis?: string;
}

export interface Season {
  id: string;
  animeId: string;
  seasonNumber: number;
  title: string;
  episodeCount: number;
  episodes: Episode[];
}

export interface Anime {
  id: string;
  title: string;
  altTitle: string;
  synopsis: string;
  poster: string;
  coverBanner: string;
  genres: string[];
  releaseYear: number;
  studio: string;
  status: AnimeStatus;
  type: AnimeType;
  rating: number;
  languages: AnimeLanguage[];
  totalSeasons: number;
  totalEpisodes: number;
  featured?: boolean;
  trendingScore: number;
  views: number;
  seasons: Season[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  animeId: string;
  anime?: Anime;
  addedAt: string;
}

export interface WatchHistory {
  id: string;
  userId: string;
  animeId: string;
  animeTitle: string;
  animePoster: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle: string;
  progressSeconds: number;
  durationSeconds: number;
  updatedAt: string;
}

export interface CategoryInfo {
  id: string;
  title: string;
  slug: string;
  description: string;
}

export interface AdminStats {
  totalAnime: number;
  totalEpisodes: number;
  totalUsers: number;
  totalViews: number;
  hindiDubbedCount: number;
  tamilDubbedCount: number;
  teluguDubbedCount: number;
  topAnime: { id: string; title: string; views: number; rating: number }[];
}

export interface FileUploadResponse {
  success: boolean;
  url: string;
  filename: string;
  size: number;
  originalName: string;
  mimeType?: string;
}

export interface NavHistoryEntry {
  view: string;
  payload?: any;
  scrollY?: number;
  title?: string;
}

export interface AdminAuthSession {
  token: string;
  uid: string;
  role: 'admin';
  username: string;
  expiresAt: number;
}

