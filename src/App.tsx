/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { VideoPlayer } from './components/VideoPlayer';

import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { TVShowsPage } from './pages/TVShowsPage';
import { NewsPage } from './pages/NewsPage';
import { MyListPage } from './pages/MyListPage';
import { SearchPage } from './pages/SearchPage';
import { StaffPortalPage } from './pages/StaffPortalPage';

const AppContent: React.FC = () => {
  const { activeTab, playingItem } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-red-600 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'movies' && <MoviesPage />}
        {activeTab === 'shows' && <TVShowsPage />}
        {activeTab === 'news' && <NewsPage />}
        {activeTab === 'mylist' && <MyListPage />}
        {activeTab === 'search' && <SearchPage />}
        {activeTab === 'staff' && <StaffPortalPage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 text-center text-xs text-zinc-500 space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-xl font-black tracking-wider text-white uppercase font-sans">
            Cine<span className="text-red-600">vo</span>
          </span>
        </div>
        <p>© {new Date().getFullYear()} Cinevo Entertainment. All rights reserved. Entertainment without limits.</p>
        <div className="flex justify-center space-x-6 text-zinc-400 font-medium">
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
          <a href="#" className="hover:text-white transition">Terms of Service</a>
          <a href="#" className="hover:text-white transition">Cookie Preferences</a>
          <a href="#" className="hover:text-white transition">Corporate Information</a>
        </div>
      </footer>

      {/* Modals & Player */}
      <MovieDetailsModal />
      {playingItem && <VideoPlayer />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
