import React, { useState, useEffect } from 'react';
import { MovieCard } from '../components/MovieCard';
import { TVShow } from '../types';
import { Tv, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const TVShowsPage: React.FC = () => {
  const [shows, setShows] = useState<TVShow[]>([]);
  const { user, setActiveTab, setShowStaffAuth } = useAuth();

  useEffect(() => {
    fetch('/api/shows')
      .then(res => res.json())
      .then(data => setShows(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">TV Shows & Series</h1>
          <p className="text-zinc-400 text-base mt-2">Binge-worthy episodic series, award-winning dramas, and sci-fi epics.</p>
        </div>

        {user.isStaff && (
          <button
            onClick={() => setActiveTab('staff')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition self-start sm:self-auto shadow-lg shadow-red-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Series</span>
          </button>
        )}
      </div>

      {shows.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {shows.map(show => (
            <div key={show.id} className="flex justify-center">
              <MovieCard item={show} type="show" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
          <Tv className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No TV Series Uploaded Yet</h3>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Authorized staff can upload TV series, organise seasons, and publish episodes directly through the Staff Portal.
          </p>
          {user.isStaff ? (
            <button
              onClick={() => setActiveTab('staff')}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition"
            >
              Upload TV Series
            </button>
          ) : (
            <button
              onClick={() => setShowStaffAuth(true)}
              className="px-6 py-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider transition"
            >
              Staff Portal Access
            </button>
          )}
        </div>
      )}
    </div>
  );
};
