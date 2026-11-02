import React, { useState } from 'react';
import { StaffDashboard } from '../components/StaffPortal/StaffDashboard';
import { MovieManager } from '../components/StaffPortal/MovieManager';
import { ShowManager } from '../components/StaffPortal/ShowManager';
import { NewsManager } from '../components/StaffPortal/NewsManager';
import { UploadManager } from '../components/StaffPortal/UploadManager';
import { IntroVideoManager } from '../components/StaffPortal/IntroVideoManager';
import { StatsManager } from '../components/StaffPortal/StatsManager';
import { MasterSecurityManager } from '../components/StaffPortal/MasterSecurityManager';
import { LayoutDashboard, Film, Tv, Newspaper, UploadCloud, Video, BarChart3, KeyRound, ShieldAlert, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const StaffPortalPage: React.FC = () => {
  const { user, setShowStaffAuth } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'movies' | 'shows' | 'news' | 'uploads' | 'intro' | 'stats' | 'security'>('dashboard');

  if (!user.isStaff) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-36 pb-24 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-xl shadow-red-900/20">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-white">Staff Access Restricted</h1>
        <p className="text-zinc-400 text-sm">
          You are currently in Guest Viewer mode. Staff controls require entering a valid administrative access code.
        </p>
        <button
          onClick={() => setShowStaffAuth(true)}
          className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition"
        >
          <Lock className="w-4 h-4" />
          <span>Enter Staff Access Code</span>
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'movies', label: 'Movies & Featured', icon: Film },
    { id: 'shows', label: 'TV Series', icon: Tv },
    { id: 'news', label: 'News Articles', icon: Newspaper },
    { id: 'stats', label: 'Stat Reports & Views', icon: BarChart3 },
    { id: 'intro', label: 'Intro Video', icon: Video },
    { id: 'uploads', label: 'Storage', icon: UploadCloud },
    ...(user.isMaster ? [{ id: 'security', label: 'Staff & Security Master', icon: KeyRound }] : [])
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 space-y-8 animate-in fade-in">
      {/* Subnavigation */}
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800 pb-6">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-sm font-bold transition ${
                isActive
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeSubTab === 'dashboard' && <StaffDashboard />}
      {activeSubTab === 'movies' && <MovieManager />}
      {activeSubTab === 'shows' && <ShowManager />}
      {activeSubTab === 'news' && <NewsManager />}
      {activeSubTab === 'stats' && <StatsManager />}
      {activeSubTab === 'intro' && <IntroVideoManager />}
      {activeSubTab === 'uploads' && <UploadManager />}
      {activeSubTab === 'security' && <MasterSecurityManager />}
    </div>
  );
};
