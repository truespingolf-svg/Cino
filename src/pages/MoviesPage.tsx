import React, { useState, useEffect } from 'react';
import { MovieCard } from '../components/MovieCard';
import { Movie } from '../types';
import { SlidersHorizontal, Film, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'year' | 'title'>('rating');
  const { user, setActiveTab, setShowStaffAuth } = useAuth();

  useEffect(() => {
    fetch('/api/movies')
      .then(res => res.json())
      .then(data => setMovies(Array.isArray(data) ? data : []));
  }, []);

  // Dynamically extract unique genres from uploaded movies
  const dynamicGenres = Array.from(new Set(movies.flatMap(m => m.genres || [])));
  const genres = ['All', ...dynamicGenres];

  const filtered = movies.filter(m => {
    if (selectedGenre === 'All') return true;
    return m.genres?.includes(selectedGenre);
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.averageRating - a.averageRating;
    if (sortBy === 'year') return b.releaseYear - a.releaseYear;
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Movies Library</h1>
          <p className="text-zinc-400 text-base mt-2">Explore blockbuster feature films and dynamically categorized uploads.</p>
        </div>

        {user.isStaff && (
          <button
            onClick={() => setActiveTab('staff')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition self-start sm:self-auto shadow-lg shadow-red-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Movie</span>
          </button>
        )}
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-zinc-800">
        <div className="flex flex-wrap items-center gap-2">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedGenre === genre
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
          <span className="text-xs text-zinc-400 font-semibold">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
          >
            <option value="rating">Highest Rated</option>
            <option value="year">Release Year</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Movie Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filtered.map(movie => (
            <div key={movie.id} className="flex justify-center">
              <MovieCard item={movie} type="movie" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
          <Film className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Movies Found</h3>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            {selectedGenre !== 'All' 
              ? `There are no titles matching "${selectedGenre}". Try selecting another genre or upload a movie.`
              : 'Authorized staff can upload feature films, master video files, and posters in the Staff Portal.'
            }
          </p>
          {user.isStaff ? (
            <button
              onClick={() => setActiveTab('staff')}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition"
            >
              Upload Feature Movie
            </button>
          ) : (
            <button
              onClick={() => setShowStaffAuth(true)}
              className="px-6 py-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider transition"
            >
              Staff Access
            </button>
          )}
        </div>
      )}
    </div>
  );
};
