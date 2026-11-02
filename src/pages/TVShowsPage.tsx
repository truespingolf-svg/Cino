import React, { useState, useEffect } from 'react';
import { MovieCard } from '../components/MovieCard';
import { TVShow } from '../types';

export const TVShowsPage: React.FC = () => {
  const [shows, setShows] = useState<TVShow[]>([]);

  useEffect(() => {
    fetch('/api/shows')
      .then(res => res.json())
      .then(data => setShows(data));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">TV Shows & Series</h1>
        <p className="text-zinc-400 text-base mt-2">Binge-worthy episodic series, award-winning dramas, and sci-fi epics.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {shows.map(show => (
          <div key={show.id} className="flex justify-center">
            <MovieCard item={show} type="show" />
          </div>
        ))}
      </div>
    </div>
  );
};
