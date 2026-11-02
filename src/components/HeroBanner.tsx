import React from 'react';
import { Play, Plus, Check, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Movie } from '../types';

interface HeroBannerProps {
  featured: Movie;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ featured }) => {
  const { setPlayingItem, toggleWatchlist, isInWatchlist } = useAuth();

  if (!featured) return null;
  const inList = isInWatchlist(featured.id);

  return (
    <div className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-start overflow-hidden">
      {/* Background Image & Gradients */}
      <div className="absolute inset-0 bg-zinc-950">
        {featured.backdropUrl ? (
          <img
            src={featured.backdropUrl}
            alt={featured.title}
            className="w-full h-full object-cover object-center scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-zinc-950 via-zinc-900 to-red-950/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 pt-20">
        <div className="max-w-2xl space-y-6">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase tracking-widest">
              {featured.director || featured.genres?.[0] || 'Cinevo Studio'}
            </span>
            <div className="flex items-center space-x-1 text-red-500 font-bold text-sm bg-red-950/40 px-2.5 py-0.5 rounded border border-red-500/20">
              <Star className="w-3.5 h-3.5 fill-red-500" />
              <span>{featured.averageRating || 0}</span>
            </div>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight uppercase leading-none drop-shadow-2xl">
            {featured.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-zinc-300">
            <span>{featured.releaseYear}</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
              {featured.ageRating || 'PG-13'}
            </span>
            <span>•</span>
            <span>English</span>
            {featured.runtime && (
              <>
                <span>•</span>
                <span>{featured.runtime}</span>
              </>
            )}
          </div>

          <p className="text-sm sm:text-base text-zinc-300 line-clamp-3 leading-relaxed drop-shadow">
            {featured.description}
          </p>

          <div className="flex items-center space-x-4 pt-4">
            <button
              onClick={() => setPlayingItem({ item: featured, type: 'movie' })}
              className="flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm uppercase tracking-wider shadow-xl shadow-red-600/40 hover:scale-105 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Watch Now</span>
            </button>

            <button
              onClick={() => toggleWatchlist(featured.id, 'movie')}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-white font-bold text-sm uppercase tracking-wider border border-zinc-700 backdrop-blur-md shadow-lg hover:scale-105 transition-all"
            >
              {inList ? <Check className="w-4 h-4 text-red-500" /> : <Plus className="w-4 h-4" />}
              <span>My List</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
