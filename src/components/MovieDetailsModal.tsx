import React, { useState, useEffect } from 'react';
import { X, Play, Plus, Check, Star, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MovieDetailsModal: React.FC = () => {
  const { selectedContent, setSelectedContent, setPlayingItem, toggleWatchlist, isInWatchlist, ratings, rateContent } = useAuth();
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedContent(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedContent]);

  if (!selectedContent) return null;

  const isShow = selectedContent.contentType === 'show' || selectedContent.seasons;
  const inList = isInWatchlist(selectedContent.id);
  const userRating = ratings[selectedContent.id] || 0;
  const seasons = selectedContent.seasons || [];
  const activeSeason = seasons.find((s: any) => s.id === selectedSeasonId) || seasons[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Absolute Back Button Floating Top-Left for Instant Exit */}
      <button
        onClick={() => setSelectedContent(null)}
        className="fixed top-6 left-6 z-50 flex items-center space-x-2 px-5 py-3 rounded-2xl bg-zinc-900/90 hover:bg-red-600 text-white border border-zinc-700/80 backdrop-blur-md transition-all shadow-2xl text-sm font-black uppercase tracking-wider group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Browse</span>
      </button>

      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-12">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedContent(null)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/80 hover:bg-red-600 text-zinc-300 hover:text-white border border-zinc-700 backdrop-blur-md transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Backdrop Banner */}
        <div className="relative h-72 sm:h-96 w-full">
          <img
            src={selectedContent.backdropUrl}
            alt={selectedContent.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-red-600/30 border border-red-500/50 text-red-400 text-xs font-bold uppercase tracking-widest">
                {isShow ? 'TV Series' : 'Feature Movie'}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-2 drop-shadow-lg">
                {selectedContent.title}
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  if (isShow && activeSeason && activeSeason.episodes?.[0]) {
                    setPlayingItem({
                      item: selectedContent,
                      type: 'episode',
                      episode: activeSeason.episodes[0],
                      season: activeSeason
                    });
                  } else {
                    setPlayingItem({ item: selectedContent, type: 'movie' });
                  }
                  setSelectedContent(null);
                }}
                className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-red-600/40 transition hover:scale-105"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isShow ? 'Play S1:E1' : 'Watch Now'}</span>
              </button>

              <button
                onClick={() => toggleWatchlist(selectedContent.id, isShow ? 'show' : 'movie')}
                className={`p-3.5 rounded-xl border transition ${
                  inList 
                    ? 'bg-red-600/20 border-red-500 text-red-400' 
                    : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
                }`}
                title={inList ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {inList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Details Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-zinc-300">
            <span className="px-2.5 py-1 rounded bg-zinc-800 text-red-500 border border-zinc-700">
              {selectedContent.ageRating}
            </span>
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span>{selectedContent.releaseYear}</span>
            </div>
            {!isShow && (
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span>{selectedContent.runtime}</span>
              </div>
            )}
            <div className="flex items-center space-x-1 text-red-500 bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20">
              <Star className="w-4 h-4 fill-red-500" />
              <span className="font-bold">{selectedContent.averageRating}</span>
              <span className="text-zinc-400 text-xs">({selectedContent.ratingCount?.toLocaleString()})</span>
            </div>
          </div>

          <p className="text-zinc-300 text-base sm:text-lg leading-relaxed">
            {selectedContent.description}
          </p>

          {/* Genres */}
          <div className="flex flex-wrap gap-2">
            {selectedContent.genres?.map((genre: string) => (
              <span key={genre} className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-medium text-zinc-300">
                {genre}
              </span>
            ))}
          </div>

          {/* Cast & Director */}
          {!isShow && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-800 text-sm">
              <div>
                <span className="text-zinc-500 font-medium">Director:</span>
                <p className="text-white font-semibold mt-0.5">{selectedContent.director}</p>
              </div>
              <div>
                <span className="text-zinc-500 font-medium">Cast:</span>
                <p className="text-white font-semibold mt-0.5">{selectedContent.cast?.join(', ')}</p>
              </div>
            </div>
          )}

          {/* User Rating Section */}
          <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Rate this title</h4>
              <p className="text-xs text-zinc-400">Help curate recommendations for the community</p>
            </div>
            <div className="flex items-center space-x-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => rateContent(selectedContent.id, star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star className={`w-6 h-6 ${star <= userRating ? 'text-red-500 fill-red-500' : 'text-zinc-700'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* TV Show Seasons & Episodes */}
          {isShow && seasons.length > 0 && (
            <div className="pt-6 border-t border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Seasons & Episodes</h3>
                <div className="flex space-x-2">
                  {seasons.map((season: any) => (
                    <button
                      key={season.id}
                      onClick={() => setSelectedSeasonId(season.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        (selectedSeasonId === season.id || (!selectedSeasonId && season === seasons[0]))
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {season.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {(activeSeason || seasons[0]).episodes?.map((ep: any) => (
                  <div
                    key={ep.id}
                    onClick={() => {
                      setPlayingItem({
                        item: selectedContent,
                        type: 'episode',
                        episode: ep,
                        season: activeSeason || seasons[0]
                      });
                      setSelectedContent(null);
                    }}
                    className="group flex items-center space-x-4 p-3 rounded-2xl bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800/80 cursor-pointer transition"
                  >
                    <div className="relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden bg-zinc-900 flex-none">
                      <img src={ep.thumbnailUrl} alt={ep.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white truncate">
                          {ep.episodeNumber}. {ep.title}
                        </h4>
                        <span className="text-xs text-zinc-400 font-medium">{ep.runtime}</span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                        {ep.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
