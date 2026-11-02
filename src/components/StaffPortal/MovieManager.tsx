import React, { useState, useEffect } from 'react';
import { Film, Plus, Trash2, Video, Image as ImageIcon, X } from 'lucide-react';
import { Movie } from '../../types';

const AVAILABLE_GENRES = [
  'Science Fiction', 'Action', 'Thriller', 'Horror', 'Adventure', 
  'Comedy', 'Drama', 'Fantasy', 'Animation', 'Romance', 'Documentary', 'Mystery'
];

export const MovieManager: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isCreating, setIsCreating] = useState(false);
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
      .then(data => setMovies(data));
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'posterUrl' | 'backdropUrl' | 'videoUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, [field]: objectUrl }));
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
      cast: form.cast.split(',').map(s => s.trim())
    };

    await fetch('/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setIsCreating(false);
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
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Movie Catalog & Genre Curation</h2>
          <p className="text-zinc-400 text-sm mt-1">Select categories and genres to automatically feature titles across category filters.</p>
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
            <h3 className="text-lg font-bold text-white">Upload Movie & Select Genres</h3>
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
                onChange={e => setForm({ ...form, releaseYear: parseInt(e.target.value) })}
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
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Cast</label>
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

            {/* Direct File Uploads */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <label className="block text-xs font-bold text-red-500 uppercase flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>Upload Poster Image File</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleFileUpload(e, 'posterUrl')}
                className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <label className="block text-xs font-bold text-red-500 uppercase flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>Upload Backdrop Image File</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleFileUpload(e, 'backdropUrl')}
                className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer"
              />
            </div>

            <div className="sm:col-span-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <label className="block text-xs font-bold text-red-500 uppercase flex items-center space-x-2">
                <Video className="w-4 h-4" />
                <span>Upload Movie Video File (MP4/MKV)</span>
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={e => handleFileUpload(e, 'videoUrl')}
                className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-zinc-800">
            <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 rounded-xl bg-zinc-800 text-white font-semibold">
              Cancel
            </button>
            <button type="submit" className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/30">
              Publish Movie
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
                    <img src={movie.posterUrl} alt="" className="w-10 h-14 rounded-lg object-cover" />
                    <span className="font-bold text-white">{movie.title}</span>
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
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
