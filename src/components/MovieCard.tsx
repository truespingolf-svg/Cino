import React from 'react';
import { Play, Plus, Check, Star, Info, Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Movie, TVShow } from '../types';

interface MovieCardProps {
  item: Movie | TVShow;
  type?: 'movie' | 'show';
}

export const MovieCard: React.FC<MovieCardProps> = ({ item, type = 'movie' }) => {
  const { setSelectedContent, setPlayingItem, toggleWatchlist, isInWatchlist } = useAuth();
  const inList = isInWatchlist(item.id);

  return (
    <div className="group relative flex-none w-[220px] sm:w-[260px] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 shadow-lg hover:shadow-2xl hover:shadow-red-600/20 hover:border-red-500/50 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer">
      {/* Poster Image */}
      <div 
        onClick={() => setSelectedContent({ ...item, contentType: type })}
        className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950 flex items-center justify-center"
      >
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
            <Film className="w-12 h-12 text-zinc-700" />
            <span className="text-xs font-bold text-zinc-500">{item.title}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-xs font-bold text-amber-400 shadow">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{item.averageRating || 0}</span>
        </div>

        {/* Age Rating Badge */}
        {item.ageRating && (
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-[11px] font-bold text-red-500">
            {item.ageRating}
          </div>
        )}
      </div>

      {/* Info & Quick Actions */}
      <div className="p-4 space-y-2.5">
        <h3 
          onClick={() => setSelectedContent({ ...item, contentType: type })}
          className="font-bold text-white text-base truncate group-hover:text-red-500 transition-colors"
        >
          {item.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
          <span>{item.releaseYear}</span>
          <span className="truncate max-w-[120px]">{item.genres?.slice(0, 2).join(', ')}</span>
        </div>

        <div className="flex items-center space-x-2 pt-1">
          <button
            onClick={() => setPlayingItem({ item, type: 'movie' })}
            className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition shadow-md shadow-red-600/30"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Play</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWatchlist(item.id, type);
            }}
            className={`p-2 rounded-xl border transition ${
              inList 
                ? 'bg-red-600/20 border-red-500 text-red-500' 
                : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
            }`}
            title={inList ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setSelectedContent({ ...item, contentType: type })}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 transition"
            title="More Info"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
