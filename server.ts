import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { INITIAL_ANIME_DATA, INITIAL_CATEGORIES, INITIAL_GENRES } from './src/data/initialData.ts';
import { Anime, Episode, Season, User, WatchHistory, Favorite, AdminStats } from './src/types/anime.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static media serving
const PUBLIC_DIR = path.resolve(__dirname, 'public');
const UPLOADS_DIR = path.resolve(PUBLIC_DIR, 'uploads');
const UPLOADS_IMAGES_DIR = path.resolve(UPLOADS_DIR, 'images');
const UPLOADS_VIDEOS_DIR = path.resolve(UPLOADS_DIR, 'videos');

[PUBLIC_DIR, UPLOADS_DIR, UPLOADS_IMAGES_DIR, UPLOADS_VIDEOS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use(express.static(PUBLIC_DIR));

// Database storage directory and file
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'anime_db.json');
const ADMIN_AUTH_FILE = path.resolve(DATA_DIR, 'admin_auth.json');
const ADMIN_SESSIONS_FILE = path.resolve(DATA_DIR, 'admin_sessions.json');

// --- OWNER AUTH & SECURITY ---
const OWNER_UID = '39090357';

interface AdminAuthConfig {
  ownerUid: string;
  salt: string;
  passwordHash: string;
  updatedAt: string;
}

interface AdminSessionStore {
  sessions: Record<string, {
    token: string;
    uid: string;
    username: string;
    createdAt: string;
    expiresAt: number;
  }>;
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function getOrInitAdminAuth(): AdminAuthConfig {
  if (fs.existsSync(ADMIN_AUTH_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(ADMIN_AUTH_FILE, 'utf-8'));
      if (data && data.ownerUid === OWNER_UID && data.passwordHash) {
        return data;
      }
    } catch (e) {
      console.error('Error reading admin_auth.json:', e);
    }
  }

  // Initial secure password: from env var or default owner password
  const defaultPassword = process.env.ADMIN_PASSWORD || 'OwnerPass39090357!';
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(defaultPassword, salt);

  const authConfig: AdminAuthConfig = {
    ownerUid: OWNER_UID,
    salt,
    passwordHash,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(ADMIN_AUTH_FILE, JSON.stringify(authConfig, null, 2), 'utf-8');
  console.log(`[SECURITY] Owner Auth initialized for UID: ${OWNER_UID}`);
  return authConfig;
}

let adminAuthConfig = getOrInitAdminAuth();

function getAdminSessions(): AdminSessionStore {
  if (fs.existsSync(ADMIN_SESSIONS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(ADMIN_SESSIONS_FILE, 'utf-8'));
    } catch {}
  }
  return { sessions: {} };
}

function saveAdminSessions(store: AdminSessionStore) {
  try {
    fs.writeFileSync(ADMIN_SESSIONS_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving admin sessions:', err);
  }
}

function getValidAdminSession(token: string) {
  if (!token) return null;
  const store = getAdminSessions();
  const session = store.sessions[token];
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    delete store.sessions[token];
    saveAdminSessions(store);
    return null;
  }
  if (session.uid !== OWNER_UID) {
    return null;
  }
  return session;
}

// Strict Owner Authorization Middleware
function requireOwnerAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const customHeader = req.headers['x-admin-token'] as string;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (customHeader) {
    token = customHeader.trim();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access Denied: Missing owner authorization token',
    });
  }

  const session = getValidAdminSession(token);
  if (!session || session.uid !== OWNER_UID) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: Only website owner (UID ${OWNER_UID}) is authorized to perform administrative tasks.`,
    });
  }

  (req as any).adminSession = session;
  next();
}

// --- MULTER FILE UPLOAD ENGINE ---
const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_IMAGES_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const unique = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    cb(null, `img_${safeBase}_${unique}${ext}`);
  },
});

const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_VIDEOS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const unique = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    cb(null, `vid_${safeBase}_${unique}${ext}`);
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max for posters/banners
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type. Only JPG, PNG, and WebP are allowed.'));
    }
  },
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB max for video streaming
  fileFilter: (_req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-matroska'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(mp4|webm|mkv|mov|ogg)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video type. Only MP4, WebM, and MKV are allowed.'));
    }
  },
});

// --- DATABASE INITIALIZATION & SCHEMA ---
interface DatabaseSchema {
  users: User[];
  anime: Anime[];
  favorites: Favorite[];
  watchHistory: WatchHistory[];
}

function initializeDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.anime && parsed.anime.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed reading existing db, re-initializing...', e);
    }
  }

  const initialDb: DatabaseSchema = {
    users: [
      {
        id: OWNER_UID,
        username: 'RN Owner',
        email: 'owner@rnanime.world',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-1',
        username: 'AnimeOtaku',
        email: 'user@rnanime.world',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
      },
    ],
    anime: INITIAL_ANIME_DATA,
    favorites: [
      {
        id: 'fav-1',
        userId: 'user-1',
        animeId: 'solo-leveling',
        addedAt: new Date().toISOString(),
      },
    ],
    watchHistory: [
      {
        id: 'wh-1',
        userId: 'user-1',
        animeId: 'solo-leveling',
        animeTitle: 'Solo Leveling: Arise',
        animePoster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
        seasonNumber: 1,
        episodeNumber: 1,
        episodeTitle: "I'm Used to It",
        progressSeconds: 740,
        durationSeconds: 1425,
        updatedAt: new Date().toISOString(),
      },
    ],
  };

  saveDatabase(initialDb);
  return initialDb;
}

let db = initializeDatabase();

function saveDatabase(dataToSave: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db:', err);
  }
}

// ========================
// REST API ROUTES
// ========================

// 1. PUBLIC ANIME CATALOG
app.get('/api/anime', (req: Request, res: Response) => {
  let list = [...db.anime];
  const { q, category, genre, language, type, status, sort } = req.query as Record<string, string | undefined>;

  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    list = list.filter((item) =>
      item.title.toLowerCase().includes(term) ||
      item.altTitle.toLowerCase().includes(term) ||
      item.synopsis.toLowerCase().includes(term) ||
      item.genres.some((g) => g.toLowerCase().includes(term)) ||
      item.studio.toLowerCase().includes(term) ||
      item.releaseYear.toString().includes(term) ||
      item.languages.some((l) => l.toLowerCase().includes(term))
    );
  }

  if (category) {
    const cat = category.toLowerCase();
    if (cat === 'trending') {
      list = list.sort((a, b) => b.trendingScore - a.trendingScore);
    } else if (cat === 'popular') {
      list = list.sort((a, b) => b.views - a.views);
    } else if (cat === 'latest') {
      list = list.sort((a, b) => b.releaseYear - a.releaseYear);
    } else if (cat === 'hindi-dub') {
      list = list.filter((item) => item.languages.includes('Hindi'));
    } else if (cat === 'tamil-dub') {
      list = list.filter((item) => item.languages.includes('Tamil'));
    } else if (cat === 'telugu-dub') {
      list = list.filter((item) => item.languages.includes('Telugu'));
    } else if (cat === 'movies') {
      list = list.filter((item) => item.type === 'Movie');
    } else if (cat === 'cartoon') {
      list = list.filter((item) => item.type === 'Cartoon');
    } else if (cat === 'top-rated') {
      list = list.filter((item) => item.rating >= 9.0).sort((a, b) => b.rating - a.rating);
    } else if (['action', 'adventure', 'fantasy', 'romance', 'comedy'].includes(cat)) {
      list = list.filter((item) => item.genres.some((g) => g.toLowerCase() === cat));
    }
  }

  if (genre && genre !== 'All') {
    list = list.filter((item) => item.genres.includes(genre));
  }

  if (language && language !== 'All') {
    list = list.filter((item) => item.languages.includes(language as any));
  }

  if (type && type !== 'All') {
    list = list.filter((item) => item.type === type);
  }

  if (status && status !== 'All') {
    list = list.filter((item) => item.status === status);
  }

  if (sort === 'popular') {
    list.sort((a, b) => b.views - a.views);
  } else if (sort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'az') {
    list.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === 'latest') {
    list.sort((a, b) => b.releaseYear - a.releaseYear);
  }

  res.json({ success: true, count: list.length, data: list });
});

app.get('/api/anime/:id', (req: Request, res: Response) => {
  const anime = db.anime.find((a) => a.id === req.params.id);
  if (!anime) {
    return res.status(404).json({ success: false, message: 'Anime not found' });
  }

  anime.views = (anime.views || 0) + 1;
  saveDatabase(db);

  res.json({ success: true, data: anime });
});

app.get('/api/featured', (_req: Request, res: Response) => {
  const featured = db.anime.filter((a) => a.featured || a.trendingScore >= 94).slice(0, 5);
  res.json({ success: true, data: featured });
});

app.get('/api/categories', (_req: Request, res: Response) => {
  const counts: Record<string, number> = {};
  INITIAL_CATEGORIES.forEach((cat) => {
    if (cat.slug === 'hindi-dub') {
      counts[cat.slug] = db.anime.filter((a) => a.languages.includes('Hindi')).length;
    } else if (cat.slug === 'tamil-dub') {
      counts[cat.slug] = db.anime.filter((a) => a.languages.includes('Tamil')).length;
    } else if (cat.slug === 'telugu-dub') {
      counts[cat.slug] = db.anime.filter((a) => a.languages.includes('Telugu')).length;
    } else if (cat.slug === 'movies') {
      counts[cat.slug] = db.anime.filter((a) => a.type === 'Movie').length;
    } else {
      counts[cat.slug] = db.anime.length;
    }
  });

  res.json({ success: true, data: INITIAL_CATEGORIES, counts });
});

app.get('/api/genres', (_req: Request, res: Response) => {
  res.json({ success: true, data: INITIAL_GENRES });
});

// 2. USER FAVORITES & WATCH HISTORY
app.get('/api/user/:userId/favorites', (req: Request, res: Response) => {
  const userId = req.params.userId;
  const userFavs = db.favorites.filter((f) => f.userId === userId);
  const favAnime = userFavs
    .map((f) => {
      const item = db.anime.find((a) => a.id === f.animeId);
      return { ...f, anime: item };
    })
    .filter((f) => !!f.anime);

  res.json({ success: true, data: favAnime });
});

app.post('/api/user/:userId/favorites/toggle', (req: Request, res: Response) => {
  const userId = req.params.userId;
  const { animeId } = req.body;
  if (!animeId) {
    return res.status(400).json({ success: false, message: 'animeId is required' });
  }

  const existingIndex = db.favorites.findIndex((f) => f.userId === userId && f.animeId === animeId);
  let isFavorite = false;

  if (existingIndex >= 0) {
    db.favorites.splice(existingIndex, 1);
    isFavorite = false;
  } else {
    db.favorites.push({
      id: `fav-${Date.now()}`,
      userId,
      animeId,
      addedAt: new Date().toISOString(),
    });
    isFavorite = true;
  }

  saveDatabase(db);
  res.json({ success: true, isFavorite, favoritesCount: db.favorites.filter((f) => f.userId === userId).length });
});

app.get('/api/user/:userId/history', (req: Request, res: Response) => {
  const userId = req.params.userId;
  const history = db.watchHistory
    .filter((h) => h.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  res.json({ success: true, data: history });
});

app.post('/api/user/:userId/history', (req: Request, res: Response) => {
  const userId = req.params.userId;
  const { animeId, seasonNumber, episodeNumber, episodeTitle, progressSeconds, durationSeconds } = req.body;

  const targetAnime = db.anime.find((a) => a.id === animeId);
  if (!targetAnime) {
    return res.status(404).json({ success: false, message: 'Anime not found' });
  }

  const existingIndex = db.watchHistory.findIndex((h) => h.userId === userId && h.animeId === animeId);
  const historyItem: WatchHistory = {
    id: existingIndex >= 0 ? db.watchHistory[existingIndex].id : `wh-${Date.now()}`,
    userId,
    animeId,
    animeTitle: targetAnime.title,
    animePoster: targetAnime.poster,
    seasonNumber: seasonNumber || 1,
    episodeNumber: episodeNumber || 1,
    episodeTitle: episodeTitle || 'Episode 1',
    progressSeconds: progressSeconds || 0,
    durationSeconds: durationSeconds || 1440,
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    db.watchHistory[existingIndex] = historyItem;
  } else {
    db.watchHistory.push(historyItem);
  }

  saveDatabase(db);
  res.json({ success: true, data: historyItem });
});

// 3. REGULAR USER AUTH (Non-admin)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (user) {
    // Non-admin login: if role is admin but called via public login, do NOT issue owner access token
    return res.json({ success: true, user: { ...user, role: user.id === OWNER_UID ? 'admin' : 'user' } });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    username: email.split('@')[0],
    email: email.trim(),
    role: 'user', // strictly user
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  saveDatabase(db);
  res.json({ success: true, user: newUser });
});

// ==========================================
// 4. PRIVATE OWNER AUTHENTICATION (UID: 39090357)
// ==========================================

// Owner Login: strictly verifies UID === 39090357 and password hash
app.post('/api/auth/admin-login', (req: Request, res: Response) => {
  const { uid, password } = req.body;

  if (!uid || !password) {
    return res.status(400).json({ success: false, message: 'Owner UID and password are required' });
  }

  // Strict check on owner UID
  if (uid.toString().trim() !== OWNER_UID) {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Invalid Owner UID. Only authorized owner UID can access the private panel.',
    });
  }

  // Check hashed password
  adminAuthConfig = getOrInitAdminAuth();
  const incomingHash = hashPassword(password, adminAuthConfig.salt);

  if (incomingHash !== adminAuthConfig.passwordHash) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Incorrect owner credentials.',
    });
  }

  // Generate cryptographically secure session token
  const token = `rn_owner_${crypto.randomBytes(32).toString('hex')}`;
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

  const sessionStore = getAdminSessions();
  sessionStore.sessions[token] = {
    token,
    uid: OWNER_UID,
    username: 'RN Owner',
    createdAt: new Date().toISOString(),
    expiresAt,
  };
  saveAdminSessions(sessionStore);

  res.json({
    success: true,
    token,
    uid: OWNER_UID,
    role: 'admin',
    username: 'RN Owner',
    expiresAt,
    message: 'Authorized successfully as RN ANIME WORLD Owner.',
  });
});

// Verify active admin session token
app.get('/api/auth/verify-admin', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const customHeader = req.headers['x-admin-token'] as string;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (customHeader) {
    token = customHeader.trim();
  }

  const session = getValidAdminSession(token);
  if (!session || session.uid !== OWNER_UID) {
    return res.status(403).json({ success: false, authorized: false });
  }

  res.json({
    success: true,
    authorized: true,
    uid: OWNER_UID,
    username: session.username,
    expiresAt: session.expiresAt,
  });
});

// Owner Logout
app.post('/api/auth/admin-logout', (req: Request, res: Response) => {
  const token = (req.headers.authorization?.replace('Bearer ', '') || req.headers['x-admin-token']) as string;
  if (token) {
    const store = getAdminSessions();
    if (store.sessions[token]) {
      delete store.sessions[token];
      saveAdminSessions(store);
    }
  }
  res.json({ success: true, message: 'Owner session logged out successfully' });
});

// Change Owner Password
app.post('/api/auth/change-admin-password', requireOwnerAdmin, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }

  adminAuthConfig = getOrInitAdminAuth();
  const currentHash = hashPassword(currentPassword, adminAuthConfig.salt);
  if (currentHash !== adminAuthConfig.passwordHash) {
    return res.status(401).json({ success: false, message: 'Current password does not match' });
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  const newHash = hashPassword(newPassword, newSalt);

  adminAuthConfig.salt = newSalt;
  adminAuthConfig.passwordHash = newHash;
  adminAuthConfig.updatedAt = new Date().toISOString();

  fs.writeFileSync(ADMIN_AUTH_FILE, JSON.stringify(adminAuthConfig, null, 2), 'utf-8');
  res.json({ success: true, message: 'Owner password updated securely!' });
});

// ==========================================
// 5. DIRECT GALLERY FILE UPLOAD SYSTEM
// ==========================================

// Upload Image from Phone Gallery or Desktop
app.post(
  '/api/admin/upload-image',
  requireOwnerAdmin,
  uploadImage.single('file'),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file was provided' });
    }

    const publicUrl = `/uploads/images/${req.file.filename}`;
    res.json({
      success: true,
      url: publicUrl,
      filename: req.file.filename,
      size: req.file.size,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      message: 'Image uploaded and linked successfully!',
    });
  }
);

// Upload Video from Phone Storage / Gallery
app.post(
  '/api/admin/upload-video',
  requireOwnerAdmin,
  uploadVideo.single('file'),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file was provided' });
    }

    const publicUrl = `/uploads/videos/${req.file.filename}`;
    res.json({
      success: true,
      url: publicUrl,
      filename: req.file.filename,
      size: req.file.size,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      message: 'Video uploaded and stream URL generated successfully!',
    });
  }
);

// ==========================================
// 6. PROTECTED ADMIN OPERATIONS (REQUIRE OWNER)
// ==========================================

app.get('/api/admin/stats', requireOwnerAdmin, (_req: Request, res: Response) => {
  let totalEpisodes = 0;
  db.anime.forEach((a) => {
    a.seasons?.forEach((s) => {
      totalEpisodes += s.episodes?.length || 0;
    });
  });

  const totalViews = db.anime.reduce((acc, a) => acc + (a.views || 0), 0);
  const hindiCount = db.anime.filter((a) => a.languages.includes('Hindi')).length;
  const tamilCount = db.anime.filter((a) => a.languages.includes('Tamil')).length;
  const teluguCount = db.anime.filter((a) => a.languages.includes('Telugu')).length;

  const topAnime = [...db.anime]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
    .map((a) => ({ id: a.id, title: a.title, views: a.views, rating: a.rating }));

  const stats: AdminStats = {
    totalAnime: db.anime.length,
    totalEpisodes,
    totalUsers: db.users.length,
    totalViews,
    hindiDubbedCount: hindiCount,
    tamilDubbedCount: tamilCount,
    teluguDubbedCount: teluguCount,
    topAnime,
  };

  res.json({ success: true, data: stats });
});

app.get('/api/admin/users', requireOwnerAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, data: db.users });
});

app.post('/api/admin/anime', requireOwnerAdmin, (req: Request, res: Response) => {
  const animeData: Partial<Anime> = req.body;
  if (!animeData.title) {
    return res.status(400).json({ success: false, message: 'Anime title is required' });
  }

  const id =
    animeData.id ||
    animeData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const existing = db.anime.find((a) => a.id === id);
  if (existing) {
    return res.status(400).json({ success: false, message: 'An anime with this title/ID already exists' });
  }

  const newAnime: Anime = {
    id,
    title: animeData.title,
    altTitle: animeData.altTitle || '',
    synopsis: animeData.synopsis || 'No synopsis provided.',
    poster: animeData.poster || '/sample-stream.mp4',
    coverBanner: animeData.coverBanner || animeData.poster || '',
    genres: animeData.genres && animeData.genres.length > 0 ? animeData.genres : ['Action', 'Fantasy'],
    releaseYear: Number(animeData.releaseYear) || new Date().getFullYear(),
    studio: animeData.studio || 'RN Studios',
    status: animeData.status || 'Ongoing',
    type: animeData.type || 'TV Series',
    rating: Number(animeData.rating) || 8.5,
    languages: animeData.languages && animeData.languages.length > 0 ? animeData.languages : ['Hindi', 'English', 'Japanese'],
    totalSeasons: Number(animeData.totalSeasons) || 1,
    totalEpisodes: Number(animeData.totalEpisodes) || 1,
    featured: Boolean(animeData.featured),
    trendingScore: Number(animeData.trendingScore) || 85,
    views: 100,
    seasons:
      animeData.seasons && animeData.seasons.length > 0
        ? animeData.seasons
        : [
            {
              id: `${id}-s1`,
              animeId: id,
              seasonNumber: 1,
              title: 'Season 1',
              episodeCount: 1,
              episodes: [
                {
                  id: `${id}-s1-e1`,
                  seasonId: `${id}-s1`,
                  animeId: id,
                  episodeNumber: 1,
                  title: 'Episode 1: The Beginning',
                  thumbnail: animeData.poster || '',
                  duration: '24m 00s',
                  languages: animeData.languages || ['Hindi', 'English'],
                  videoUrl: '/sample-stream.mp4',
                  isAvailable: true,
                  synopsis: 'Episode premiere',
                },
              ],
            },
          ],
  };

  db.anime.unshift(newAnime);
  saveDatabase(db);
  res.json({ success: true, data: newAnime });
});

app.put('/api/admin/anime/:id', requireOwnerAdmin, (req: Request, res: Response) => {
  const index = db.anime.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Anime not found' });
  }

  db.anime[index] = {
    ...db.anime[index],
    ...req.body,
    id: db.anime[index].id,
  };

  saveDatabase(db);
  res.json({ success: true, data: db.anime[index] });
});

app.delete('/api/admin/anime/:id', requireOwnerAdmin, (req: Request, res: Response) => {
  const index = db.anime.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Anime not found' });
  }

  const removed = db.anime.splice(index, 1);
  saveDatabase(db);
  res.json({ success: true, message: 'Anime deleted successfully', data: removed[0] });
});

app.post('/api/admin/episodes', requireOwnerAdmin, (req: Request, res: Response) => {
  const { animeId, seasonNumber, title, duration, videoUrl, languages, thumbnail, synopsis } = req.body;
  const anime = db.anime.find((a) => a.id === animeId);
  if (!anime) {
    return res.status(404).json({ success: false, message: 'Anime not found' });
  }

  let season = anime.seasons.find((s) => s.seasonNumber === Number(seasonNumber));
  if (!season) {
    season = {
      id: `${animeId}-s${seasonNumber}`,
      animeId,
      seasonNumber: Number(seasonNumber),
      title: `Season ${seasonNumber}`,
      episodeCount: 0,
      episodes: [],
    };
    anime.seasons.push(season);
  }

  const epNumber = season.episodes.length + 1;
  const newEpisode: Episode = {
    id: `${season.id}-e${epNumber}-${Date.now()}`,
    seasonId: season.id,
    animeId,
    episodeNumber: epNumber,
    title: title || `Episode ${epNumber}`,
    thumbnail: thumbnail || anime.poster,
    duration: duration || '24m 00s',
    languages: languages || anime.languages,
    videoUrl: videoUrl || '/sample-stream.mp4',
    isAvailable: true,
    synopsis: synopsis || '',
  };

  season.episodes.push(newEpisode);
  season.episodeCount = season.episodes.length;
  anime.totalEpisodes = anime.seasons.reduce((acc, s) => acc + s.episodes.length, 0);

  saveDatabase(db);
  res.json({ success: true, data: newEpisode, season });
});

app.delete('/api/admin/episodes/:animeId/:episodeId', requireOwnerAdmin, (req: Request, res: Response) => {
  const { animeId, episodeId } = req.params;
  const anime = db.anime.find((a) => a.id === animeId);
  if (!anime) {
    return res.status(404).json({ success: false, message: 'Anime not found' });
  }

  let removed = false;
  anime.seasons.forEach((season) => {
    const idx = season.episodes.findIndex((e) => e.id === episodeId);
    if (idx >= 0) {
      season.episodes.splice(idx, 1);
      season.episodeCount = season.episodes.length;
      removed = true;
    }
  });

  if (!removed) {
    return res.status(404).json({ success: false, message: 'Episode not found' });
  }

  anime.totalEpisodes = anime.seasons.reduce((acc, s) => acc + s.episodes.length, 0);
  saveDatabase(db);
  res.json({ success: true, message: 'Episode removed' });
});

app.post('/api/admin/reset-database', requireOwnerAdmin, (_req: Request, res: Response) => {
  db = {
    users: [
      {
        id: OWNER_UID,
        username: 'RN Owner',
        email: 'owner@rnanime.world',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-1',
        username: 'AnimeOtaku',
        email: 'user@rnanime.world',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
      },
    ],
    anime: INITIAL_ANIME_DATA,
    favorites: [],
    watchHistory: [],
  };
  saveDatabase(db);
  res.json({ success: true, message: 'Database reset to fresh catalog', count: db.anime.length });
});

// START SERVER
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RN ANIME WORLD running on http://0.0.0.0:${PORT} [Owner UID: ${OWNER_UID}]`);
  });
}

startServer();
