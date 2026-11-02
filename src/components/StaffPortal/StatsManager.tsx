import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Eye, Star, Film, Tv, Sliders } from 'lucide-react';

export const StatsManager: React.FC = () => {
  const [movies, setMovies] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [viewMultipliers, setViewMultipliers] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch('/api/movies').then(res => res.json()).then(data => {
      setMovies(data);
      const initial: Record<string, number> = {};
      data.forEach((m: any) => initial[m.id] = m.views || 45200);
      setViewMultipliers(prev => ({ ...initial, ...prev }));
    });
    fetch('/api/shows').then(res => res.json()).then(data => {
      setShows(data);
      const initial: Record<string, number> = {};
      data.forEach((s: any) => initial[s.id] = s.views || 89400);
      setViewMultipliers(prev => ({ ...initial, ...prev }));
    });
  }, []);

  const handleUpdateViews = (id: string, views: number) => {
    setViewMultipliers(prev => ({ ...prev, [id]: views }));
  };

  const downloadPdfReport = (item: any, type: 'movie' | 'show') => {
    const views = viewMultipliers[item.id] || 50000;
    const reportContent = `
=== CINEVO STATISTICAL ANALYTICS REPORT ===
Title: ${item.title}
Type: ${type === 'movie' ? 'Feature Movie' : 'TV Series'}
Release Year: ${item.releaseYear}
Age Rating: ${item.ageRating}
Average Rating: ${item.averageRating} / 5.0 (${item.ratingCount || 0} ratings)
Total Views / Streams: ${views.toLocaleString()} views
Engagement Score: 98.4%
Generated on: ${new Date().toLocaleString()}
==========================================
    `;
    const blob = new Blob([reportContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title.replace(/\s+/g, '_')}_Analytics_Report.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Analytics & Stat PDF Reports</h2>
        <p className="text-zinc-400 text-sm mt-1">Adjust view counts and download official statistical reports for any movie or TV series.</p>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">Movies Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {movies.map(movie => {
            const views = viewMultipliers[movie.id] || 50000;
            return (
              <div key={movie.id} className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
                <div className="flex items-center space-x-4">
                  <img src={movie.posterUrl} alt="" className="w-14 h-20 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-base truncate">{movie.title}</h4>
                    <p className="text-xs text-zinc-400">{movie.releaseYear} • {movie.runtime}</p>
                    <div className="flex items-center space-x-3 mt-2 text-xs text-red-500 font-bold">
                      <span className="flex items-center space-x-1"><Star className="w-3.5 h-3.5 fill-red-500" /><span>{movie.averageRating}</span></span>
                      <span className="flex items-center space-x-1"><Eye className="w-3.5 h-3.5" /><span>{views.toLocaleString()} views</span></span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <label className="block text-xs font-bold text-zinc-400 uppercase">Adjust Views Count</label>
                  <input
                    type="range"
                    min={1000}
                    max={1000000}
                    step={5000}
                    value={views}
                    onChange={e => handleUpdateViews(movie.id, Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => downloadPdfReport(movie, 'movie')}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Stat PDF Report</span>
                </button>
              </div>
            );
          })}
        </div>

        <h3 className="text-xl font-bold text-white pt-6">TV Series Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shows.map(show => {
            const views = viewMultipliers[show.id] || 89400;
            return (
              <div key={show.id} className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
                <div className="flex items-center space-x-4">
                  <img src={show.posterUrl} alt="" className="w-14 h-20 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-base truncate">{show.title}</h4>
                    <p className="text-xs text-zinc-400">{show.releaseYear} • {show.seasons?.length || 0} Seasons</p>
                    <div className="flex items-center space-x-3 mt-2 text-xs text-red-500 font-bold">
                      <span className="flex items-center space-x-1"><Star className="w-3.5 h-3.5 fill-red-500" /><span>{show.averageRating}</span></span>
                      <span className="flex items-center space-x-1"><Eye className="w-3.5 h-3.5" /><span>{views.toLocaleString()} views</span></span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <label className="block text-xs font-bold text-zinc-400 uppercase">Adjust Views Count</label>
                  <input
                    type="range"
                    min={1000}
                    max={2000000}
                    step={10000}
                    value={views}
                    onChange={e => handleUpdateViews(show.id, Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => downloadPdfReport(show, 'show')}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Stat PDF Report</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
