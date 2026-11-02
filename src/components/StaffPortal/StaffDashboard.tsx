import React, { useState, useEffect } from 'react';
import { Film, Tv, Newspaper, Database, HardDrive, UploadCloud, Plus, CheckCircle2, TrendingUp, Users } from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to load stats', err));
  }, []);

  if (!stats) return <div className="text-zinc-400 p-8">Loading analytics...</div>;

  const statCards = [
    { label: 'Total Movies', value: stats.totalMovies, icon: Film, color: 'text-purple-400 bg-purple-600/10 border-purple-500/20' },
    { label: 'TV Series', value: stats.totalShows, icon: Tv, color: 'text-indigo-400 bg-indigo-600/10 border-indigo-500/20' },
    { label: 'Seasons & Episodes', value: `${stats.totalSeasons} S / ${stats.totalEpisodes} Ep`, icon: Database, color: 'text-blue-400 bg-blue-600/10 border-blue-500/20' },
    { label: 'News Articles', value: stats.totalNews, icon: Newspaper, color: 'text-pink-400 bg-pink-600/10 border-pink-500/20' },
    { label: 'Media Storage Used', value: stats.storageUsed, icon: HardDrive, color: 'text-emerald-400 bg-emerald-600/10 border-emerald-500/20' },
    { label: 'Active Upload Jobs', value: stats.activeUploads, icon: UploadCloud, color: 'text-amber-400 bg-amber-600/10 border-amber-500/20' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Staff Administration Dashboard</h2>
        <p className="text-zinc-400 text-sm mt-1">Real-time telemetry, library analytics, and content management control center.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`p-6 rounded-3xl bg-zinc-900 border ${card.color.split(' ')[2]} shadow-xl flex items-center justify-between`}>
              <div className="space-y-2">
                <span className="text-sm font-semibold text-zinc-400">{card.label}</span>
                <p className="text-3xl font-black text-white tracking-tight">{card.value}</p>
              </div>
              <div className={`p-4 rounded-2xl ${card.color.split(' ')[1]} ${card.color.split(' ')[0]}`}>
                <Icon className="w-7 h-7" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>System & Cloud Infrastructure Status</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
            <span className="text-zinc-500 font-medium">Cloud Firestore</span>
            <p className="text-emerald-400 font-bold flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Operational (0ms latency)</span>
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
            <span className="text-zinc-500 font-medium">Cloudflare Stream / Mux</span>
            <p className="text-emerald-400 font-bold flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Transcoding Pipeline Ready</span>
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
            <span className="text-zinc-500 font-medium">Firebase Auth RBAC</span>
            <p className="text-emerald-400 font-bold flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Staff Privileges Enforced</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
