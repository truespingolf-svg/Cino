import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MovieCard } from '../components/MovieCard';
import { Bookmark, Clock, Star, Film } from 'lucide-react';

export const MyListPage: React.FC = () => {
  const { user, watchlist, history, ratings } = useAuth();
  const [movies, setMovies] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'watchlist' | 'history'>('watchlist');

  useEffect(() => {
    fetch('/api/movies').then(res => res.json()).then(data => setMovies(data));
    fetch('/api/shows').then(res => res.json()).then(data => setShows(data));
  }, []);

  const allContent = [...movies, ...shows];

  const watchlistItems = watchlist.map(w => allContent.find(c => c.id === w.contentId)).filter(Boolean);
  const historyItems = history.map(h => ({
    ...h,
    content: allContent.find(c => c.id === h.contentId)
  })).filter(h => h.content);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">My VYBE+ Library</h1>
        <p className="text-zinc-400 text-base mt-2">Your personal watchlist, continue watching queue, and saved favorites.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-zinc-800 pb-4">
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-sm font-bold transition ${
            activeTab === 'watchlist'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Watchlist ({watchlistItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-sm font-bold transition ${
            activeTab === 'history'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Continue Watching ({historyItems.length})</span>
        </button>
      </div>

      {activeTab === 'watchlist' ? (
        watchlistItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {watchlistItems.map(item => (
              <div key={item.id} className="flex justify-center">
                <MovieCard item={item} type={item.seasons ? 'show' : 'movie'} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
            <Bookmark className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="text-xl font-bold text-white">Your Watchlist is empty</h3>
            <p className="text-zinc-400 text-sm">Save movies and TV shows to watch later by clicking the plus icon on any title.</p>
          </div>
        )
      ) : (
        historyItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {historyItems.map((h, idx) => (
              <div key={idx} className="p-4 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center space-x-4">
                <img src={h.content.posterUrl} alt="" className="w-20 h-28 rounded-2xl object-cover" />
                <div className="flex-1 space-y-2">
                  <h4 className="font-bold text-white text-base">{h.content.title}</h4>
                  <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                    <div className="bg-purple-600 h-full" style={{ width: `${Math.min(100, (h.progress / h.duration) * 100)}%` }} />
                  </div>
                  <p className="text-xs text-zinc-400">Last watched: {new Date(h.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
            <Clock className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="text-xl font-bold text-white">No watch history yet</h3>
            <p className="text-zinc-400 text-sm">Start watching movies or series to automatically resume from where you stopped.</p>
          </div>
        )
      )}
    </div>
  );
};
