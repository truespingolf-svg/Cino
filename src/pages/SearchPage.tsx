import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Film, Tv } from 'lucide-react';
import { MovieCard } from '../components/MovieCard';

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/movies').then(res => res.json()).then(data => setMovies(Array.isArray(data) ? data : []));
    fetch('/api/shows').then(res => res.json()).then(data => setShows(Array.isArray(data) ? data : []));
  }, []);

  const resultsMovies = movies.filter(m => 
    m.title?.toLowerCase().includes(query.toLowerCase()) ||
    m.genres?.some((g: string) => g.toLowerCase().includes(query.toLowerCase())) ||
    m.director?.toLowerCase().includes(query.toLowerCase())
  );

  const resultsShows = shows.filter(s =>
    s.title?.toLowerCase().includes(query.toLowerCase()) ||
    s.genres?.some((g: string) => g.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Search & Discovery</h1>
        <p className="text-zinc-400 text-base mt-2">Search across blockbusters, series, directors, and genres.</p>
      </div>

      <div className="relative max-w-2xl">
        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-400" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search movies, TV shows, genres..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-14 pr-6 py-4 text-white text-lg focus:outline-none focus:border-red-600 shadow-xl"
        />
      </div>

      {query.trim() !== '' && (
        <div className="space-y-12">
          {resultsMovies.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <Film className="w-5 h-5 text-red-500" />
                <span>Movies ({resultsMovies.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {resultsMovies.map(movie => (
                  <div key={movie.id} className="flex justify-center">
                    <MovieCard item={movie} type="movie" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {resultsShows.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <Tv className="w-5 h-5 text-red-500" />
                <span>TV Shows ({resultsShows.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {resultsShows.map(show => (
                  <div key={show.id} className="flex justify-center">
                    <MovieCard item={show} type="show" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {resultsMovies.length === 0 && resultsShows.length === 0 && (
            <div className="text-center py-20 text-zinc-500 text-base">
              No titles found matching "{query}". Try searching for another genre or title.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
