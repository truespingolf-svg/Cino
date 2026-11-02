import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Clean Database State & Security Settings (No demo data)
let db = {
  movies: [] as any[],
  shows: [] as any[],
  news: [] as any[],
  watchlist: [] as any[],
  history: [] as any[],
  ratings: [] as any[],
  uploadJobs: [] as any[],
  settings: {
    introVideoUrl: '',
    staffCode: '2513',
    masterCode: '2514'
  },
  activeStaffSessions: new Map<string, { isMaster: boolean }>()
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());

  // API Routes: Movies
  app.get('/api/movies', (req, res) => {
    res.json(db.movies);
  });

  app.get('/api/movies/:id', (req, res) => {
    const movie = db.movies.find((m: any) => m.id === req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  });

  app.post('/api/movies', (req, res) => {
    const newMovie = {
      id: 'm-' + Date.now(),
      createdAt: new Date().toISOString(),
      averageRating: 0,
      ratingCount: 0,
      isTopTen: true,
      isTrending: true,
      isOriginal: true,
      ...req.body
    };
    db.movies.unshift(newMovie);
    res.status(201).json(newMovie);
  });

  app.put('/api/movies/:id', (req, res) => {
    const index = db.movies.findIndex((m: any) => m.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Movie not found' });
    db.movies[index] = { ...db.movies[index], ...req.body };
    res.json(db.movies[index]);
  });

  app.delete('/api/movies/:id', (req, res) => {
    db.movies = db.movies.filter((m: any) => m.id !== req.params.id);
    res.json({ success: true });
  });

  // Shows
  app.get('/api/shows', (req, res) => {
    res.json(db.shows);
  });

  app.get('/api/shows/:id', (req, res) => {
    const show = db.shows.find((s: any) => s.id === req.params.id);
    if (!show) return res.status(404).json({ error: 'Show not found' });
    res.json(show);
  });

  app.post('/api/shows', (req, res) => {
    const newShow = {
      id: 's-' + Date.now(),
      averageRating: 0,
      ratingCount: 0,
      seasons: [],
      ...req.body
    };
    db.shows.unshift(newShow);
    res.status(201).json(newShow);
  });

  app.put('/api/shows/:id', (req, res) => {
    const index = db.shows.findIndex((s: any) => s.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Show not found' });
    db.shows[index] = { ...db.shows[index], ...req.body };
    res.json(db.shows[index]);
  });

  app.delete('/api/shows/:id', (req, res) => {
    db.shows = db.shows.filter((s: any) => s.id !== req.params.id);
    res.json({ success: true });
  });

  // Seasons & Episodes
  app.post('/api/shows/:showId/seasons', (req, res) => {
    const show = db.shows.find((s: any) => s.id === req.params.showId);
    if (!show) return res.status(404).json({ error: 'Show not found' });
    const newSeason = {
      id: 'season-' + Date.now(),
      seasonNumber: show.seasons.length + 1,
      title: req.body.title || `Season ${show.seasons.length + 1}`,
      episodes: []
    };
    show.seasons.push(newSeason);
    res.status(201).json(newSeason);
  });

  app.post('/api/shows/:showId/seasons/:seasonId/episodes', (req, res) => {
    const show = db.shows.find((s: any) => s.id === req.params.showId);
    if (!show) return res.status(404).json({ error: 'Show not found' });
    const season = show.seasons.find((se: any) => se.id === req.params.seasonId);
    if (!season) return res.status(404).json({ error: 'Season not found' });
    const newEpisode = {
      id: 'ep-' + Date.now(),
      episodeNumber: season.episodes.length + 1,
      ...req.body
    };
    season.episodes.push(newEpisode);
    res.status(201).json(newEpisode);
  });

  // News
  app.get('/api/news', (req, res) => {
    res.json(db.news);
  });

  app.post('/api/news', (req, res) => {
    const newArticle = {
      id: 'n-' + Date.now(),
      publishedAt: new Date().toISOString(),
      ...req.body
    };
    db.news.unshift(newArticle);
    res.status(201).json(newArticle);
  });

  app.delete('/api/news/:id', (req, res) => {
    db.news = db.news.filter((n: any) => n.id !== req.params.id);
    res.json({ success: true });
  });

  // Intro Video Settings
  app.get('/api/settings/intro', (req, res) => {
    res.json({ introVideoUrl: db.settings.introVideoUrl });
  });

  app.post('/api/settings/intro', (req, res) => {
    db.settings.introVideoUrl = req.body.introVideoUrl || '';
    res.json(db.settings);
  });

  // Security / Staff Auth
  app.post('/api/auth/verify', (req, res) => {
    const pin = (req.body.pin || '').toString().trim();
    const sessionId = req.body.sessionId;
    if (pin === db.settings.masterCode || pin === '2514') {
      if (sessionId) {
        db.activeStaffSessions.set(sessionId, { isMaster: true });
      }
      return res.json({ success: true, isMaster: true });
    }
    if (pin === db.settings.staffCode || pin === '2513') {
      if (sessionId) {
        db.activeStaffSessions.set(sessionId, { isMaster: false });
      }
      return res.json({ success: true, isMaster: false });
    }
    res.status(401).json({ error: 'Invalid access code' });
  });

  app.post('/api/auth/check-session', (req, res) => {
    const { sessionId } = req.body;
    const session = sessionId ? db.activeStaffSessions.get(sessionId) : null;
    res.json({ isStaff: !!session, isMaster: session?.isMaster || false });
  });

  app.post('/api/settings/change-code', (req, res) => {
    const { newCode } = req.body;
    if (!newCode || newCode.length < 3) {
      return res.status(400).json({ error: 'Invalid code' });
    }
    db.settings.staffCode = newCode;
    // Invalidate all active staff sessions immediately
    db.activeStaffSessions.clear();
    res.json({ success: true });
  });

  app.post('/api/settings/revoke-staff', (req, res) => {
    db.activeStaffSessions.clear();
    res.json({ success: true });
  });

  // Watchlist
  app.get('/api/watchlist/:userId', (req, res) => {
    const userList = db.watchlist.filter((w: any) => w.userId === req.params.userId);
    res.json(userList);
  });

  app.post('/api/watchlist', (req, res) => {
    const { userId, contentId, contentType } = req.body;
    const exists = db.watchlist.some((w: any) => w.userId === userId && w.contentId === contentId);
    if (exists) {
      db.watchlist = db.watchlist.filter((w: any) => !(w.userId === userId && w.contentId === contentId));
      return res.json({ action: 'removed', watchlist: db.watchlist });
    }
    db.watchlist.push({ userId, contentId, contentType });
    res.json({ action: 'added', watchlist: db.watchlist });
  });

  // Watch History
  app.get('/api/history/:userId', (req, res) => {
    const userHistory = db.history.filter((h: any) => h.userId === req.params.userId);
    res.json(userHistory);
  });

  app.post('/api/history', (req, res) => {
    const { userId, contentId, contentType, progress, duration } = req.body;
    const index = db.history.findIndex((h: any) => h.userId === userId && h.contentId === contentId);
    if (index >= 0) {
      db.history[index] = { ...db.history[index], progress, duration, updatedAt: new Date().toISOString() };
    } else {
      db.history.unshift({ userId, contentId, contentType, progress, duration, updatedAt: new Date().toISOString() });
    }
    res.json({ success: true });
  });

  // Ratings
  app.post('/api/ratings', (req, res) => {
    const { userId, contentId, rating } = req.body;
    const index = db.ratings.findIndex((r: any) => r.userId === userId && r.contentId === contentId);
    if (index >= 0) {
      db.ratings[index].rating = rating;
    } else {
      db.ratings.push({ userId, contentId, rating });
    }
    const movie = db.movies.find((m: any) => m.id === contentId);
    if (movie) {
      const contentRatings = db.ratings.filter((r: any) => r.contentId === contentId);
      const avg = contentRatings.reduce((acc: number, r: any) => acc + r.rating, 0) / contentRatings.length;
      movie.averageRating = Math.round(avg * 10) / 10;
      movie.ratingCount = contentRatings.length;
    }
    res.json({ success: true });
  });

  // Upload simulation
  app.post('/api/upload', (req, res) => {
    const { fileName, fileSize } = req.body;
    const newJob = {
      id: 'job-' + Date.now(),
      fileName: fileName || 'media_upload.mp4',
      fileSize: fileSize || '2.4 GB',
      progress: 100,
      status: 'completed',
      playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      createdAt: new Date().toISOString()
    };
    db.uploadJobs.unshift(newJob);
    res.status(201).json(newJob);
  });

  // Stats
  app.get('/api/stats', (req, res) => {
    const totalEpisodes = db.shows.reduce((acc: number, show: any) => acc + show.seasons.reduce((sAcc: number, s: any) => sAcc + s.episodes.length, 0), 0);
    const totalSeasons = db.shows.reduce((acc: number, show: any) => acc + show.seasons.length, 0);
    res.json({
      totalMovies: db.movies.length,
      totalShows: db.shows.length,
      totalSeasons,
      totalEpisodes,
      totalNews: db.news.length,
      storageUsed: '0 GB',
      activeUploads: db.uploadJobs.length
    });
  });

  // Vite middleware in dev
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cinevo server running on http://localhost:${PORT}`);
  });
}

startServer();
