import React, { useState, useEffect } from 'react';
import { Film, Plus, Trash2, Video, Image as ImageIcon, X, Loader2, CheckCircle2, Play } from 'lucide-react';
import { Movie } from '../../types';
import { uploadVideoFile, UploadProgress } from '../../utils/mediaUploader';
import { formatBytes, isValidVideoFormat } from '../../utils/streaming';

const AVAILABLE_GENRES = [
  'Science Fiction', 'Action', 'Thriller', 'Horror', 'Adventure', 
  'Comedy', 'Drama', 'Fantasy', 'Animation', 'Romance', 'Documentary', 'Mystery'
];

export const MovieManager: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState<UploadProgress | null>(null);
  const [videoFileName, setVideoFileName] = useState('');
  const [videoFileSize, setVideoFileSize] = useState('');
  const [videoUploadSuccess, setVideoUploadSuccess] = useState(false);
  const [videoError, setVideoError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    releaseYear: 2026,
    runtime: '2h 00m',
    genres: ['Science Fiction', 'Action'],
    ageRating: '16+',
    cast: 'Tom Cruise, Emily Blunt',
    director: 'Christopher Nolan',
    posterUrl: '',
    backdropUrl: '',
    videoUrl: '',
    isOriginal: true,
    isFeatured: false,
    isTrending: true,
    isTopTen: true
  });

  const fetchMovies = () => {
    fetch('/api/movies')
      .then(res => res.json())
      .then(data => setMovies(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'posterUrl' | 'backdropUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, [field]: objectUrl }));
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidVideoFormat(file.name, file.type)) {
      setVideoError('Please select a valid MP4/MKV/WebM video file.');
      return;
    }

    setVideoError('');
    setVideoFileName(file.name);
    setVideoFileSize(formatBytes(file.size));
    setVideoUploading(true);
    setVideoUploadSuccess(false);

    try {
      const result = await uploadVideoFile(file, (progress) => {
        setVideoProgress(progress);
      });

      setForm(prev => ({ ...prev, videoUrl: result.url }));
      setVideoUploadSuccess(true);
      setVideoUploading(false);
      setVideoProgress(null);
    } catch {
      setVideoError('Upload failed. Try again.');
      setVideoUploading(false);
    }
  };

  const toggleGenre = (genre: string) => {
    setForm(prev => {
      const exists = prev.genres.includes(genre);
      if (exists) {
        return { ...prev, genres: prev.genres.filter(g => g !== genre) };
      } else {
        return { ...prev, genres: [...prev.genres, genre] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      cast: typeof form.cast === 'string' ? form.cast.split(',').map(s => s.trim()) : form.cast
    };

    await fetch('/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setIsCreating(false);
    setVideoUploadSuccess(false);
    setVideoFileName('');
    fetchMovies();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this movie?')) {
      await fetch(`/api/movies/${id}`, { method: 'DELETE' });
      fetchMovies();
    }
  };

  const handleToggleFlag = async (id: string, flag: 'isFeatured' | 'isOriginal' | 'isTrending' | 'isTopTen') => {
    const movie = movies.find(m => m.id === id);
    if (!movie) return;
    const updatedValue = !movie[flag];
    await fetch(`/api/movies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [flag]: updatedValue })
    });
    fetchMovies();
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Movie Catalog & Video Uploader</h2>
          <p className="text-zinc-400 text-sm mt-1">Upload MP4 master feature films (handles large multi-gigabyte sizes) and select categories.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/30 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Upload New Movie</span>
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h3 className="text-lg font-bold text-white">Upload Movie & Master Video</h3>
            <button type="button" onClick={() => setIsCreating(false)} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Movie Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Release Year</label>
              <input
                type="number"
                value={form.releaseYear}
                onChange={e => setForm({ ...form, releaseYear: parseInt(e.target.value) || 2026 })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Runtime</label>
              <input
                type="text"
                value={form.runtime}
                onChange={e => setForm({ ...form, runtime: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Age Rating</label>
              <input
                type="text"
                value={form.ageRating}
                onChange={e => setForm({ ...form, ageRating: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>

            {/* Genre Selector */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-red-500 uppercase">Select Genres (Shows up in category filters)</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {AVAILABLE_GENRES.map(genre => {
                  const isSelected = form.genres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                        isSelected 
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                          : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {genre} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Director</label>
              <input
                type="text"
                value={form.director}
                onChange={e => setForm({ ...form, director: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Cast (comma-separated)</label>
              <input
                type="text"
                value={form.cast}
                onChange={e => setForm({ ...form, cast: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>

            {/* Poster & Backdrop Uploads */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <label className="block text-xs font-bold text-red-500 uppercase flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>Upload Poster Image</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleImageUpload(e, 'posterUrl')}
                className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer"
              />
              {form.posterUrl && (
                <img src={form.posterUrl} alt="Poster" className="w-16 h-24 object-cover rounded-xl border border-zinc-800" />
              )}
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <label className="block text-xs font-bold text-red-500 uppercase flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>Upload Backdrop Image</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleImageUpload(e, 'backdropUrl')}
                className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer"
              />
              {form.backdropUrl && (
                <img src={form.backdropUrl} alt="Backdrop" className="w-32 h-20 object-cover rounded-xl border border-zinc-800" />
              )}
            </div>

            {/* MP4 & Large Video File Upload Section */}
            <div className="sm:col-span-2 p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-red-500 uppercase flex items-center space-x-2">
                  <Video className="w-4 h-4" />
                  <span>Upload Movie Video (MP4, MKV, WebM, MOV)</span>
                </label>
                <span className="text-[11px] text-zinc-500 font-semibold">Supports multi-gigabyte files</span>
              </div>

              <input
                type="file"
                accept="video/mp4,video/x-m4v,video/webm,video/quicktime,video/x-matroska,video/*,.mp4,.m4v,.mov,.webm,.mkv"
                onChange={handleVideoUpload}
                disabled={videoUploading}
                className="w-full text-xs text-zinc-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer"
              />

              {videoUploading && (
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white flex items-center space-x-2 font-medium">
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                      <span>Streaming {videoFileName}...</span>
                    </span>
                    <span className="text-red-500 font-bold">{videoProgress?.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="bg-red-600 h-full transition-all duration-150"
                      style={{ width: `${videoProgress?.percentage || 0}%` }}
                    />
                  </div>
                  {videoProgress && (
                    <div className="flex justify-between text-[11px] text-zinc-500">
                      <span>{videoProgress.formattedLoaded} uploaded</span>
                      <span>Total size: {videoProgress.formattedTotal}</span>
                    </div>
                  )}
                </div>
              )}

              {videoUploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>MP4 Video uploaded successfully ({videoFileSize})</span>
                </div>
              )}

              {videoError && (
                <p className="text-xs text-red-500 font-semibold">{videoError}</p>
              )}

              {/* Direct Video URL input */}
              <div className="pt-2">
                <label className="block text-[11px] text-zinc-400 uppercase font-semibold mb-1">
                  Or Video URL (auto-filled on upload)
                </label>
                <input
                  type="text"
                  value={form.videoUrl}
                  onChange={e => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://.../video.mp4 or /uploads/..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-zinc-800">
            <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 rounded-xl bg-zinc-800 text-white font-semibold text-xs uppercase tracking-wider">
              Cancel
            </button>
            <button
              type="submit"
              disabled={videoUploading}
              className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30"
            >
              {videoUploading ? 'Uploading Video...' : 'Publish Movie'}
            </button>
          </div>
        </form>
      )}

      {/* Movies Table & Curation Toggles */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-400 uppercase">
                <th className="p-4 sm:px-6">Title</th>
                <th className="p-4">Genres</th>
                <th className="p-4 text-center">Featured Hero</th>
                <th className="p-4 text-center">Top 10</th>
                <th className="p-4 text-center">Trending Now</th>
                <th className="p-4 text-center">Cinevo Originals</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-sm">
              {movies.map(movie => (
                <tr key={movie.id} className="hover:bg-zinc-800/50 transition">
                  <td className="p-4 sm:px-6 flex items-center space-x-3">
                    {movie.posterUrl ? (
                      <img src={movie.posterUrl} alt="" className="w-10 h-14 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-14 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600">
                        <Film className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-white block">{movie.title}</span>
                      <span className="text-[11px] text-zinc-500 font-mono truncate max-w-[180px] block">
                        {movie.videoUrl || 'Default stream'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-400 max-w-xs truncate">{movie.genres?.join(', ')}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggleFlag(movie.id, 'isFeatured')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        movie.isFeatured ? 'bg-red-600 text-white shadow-lg' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {movie.isFeatured ? 'Active' : 'Off'}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggleFlag(movie.id, 'isTopTen')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        movie.isTopTen !== false ? 'bg-red-600 text-white shadow-lg' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {movie.isTopTen !== false ? 'Top 10' : 'Off'}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggleFlag(movie.id, 'isTrending')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        movie.isTrending !== false ? 'bg-red-600 text-white shadow-lg' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {movie.isTrending !== false ? 'Trending' : 'Off'}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggleFlag(movie.id, 'isOriginal')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        movie.isOriginal ? 'bg-red-600 text-white shadow-lg' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {movie.isOriginal ? 'Original' : 'Off'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(movie.id)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                      aria-label="Delete movie"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {movies.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500">
                    No movies uploaded yet. Click "Upload New Movie" to add your first title.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
