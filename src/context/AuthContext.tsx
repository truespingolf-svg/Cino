import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, WatchlistItem, WatchHistoryItem } from '../types';

interface AuthContextType {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  watchlist: WatchlistItem[];
  toggleWatchlist: (contentId: string, contentType: 'movie' | 'show') => Promise<void>;
  isInWatchlist: (contentId: string) => boolean;
  history: WatchHistoryItem[];
  updateHistory: (contentId: string, contentType: 'movie' | 'show', progress: number, duration: number) => Promise<void>;
  ratings: Record<string, number>;
  rateContent: (contentId: string, rating: number) => Promise<void>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedContent: any | null;
  setSelectedContent: (content: any | null) => void;
  playingItem: { item: any; type: 'movie' | 'episode'; episode?: any; season?: any } | null;
  setPlayingItem: (item: any | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>({
    id: 'user-1',
    name: 'Staff',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
    isStaff: true
  });

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({ 'm1': 5 });
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [playingItem, setPlayingItem] = useState<any | null>(null);

  useEffect(() => {
    fetch(`/api/watchlist/${user.id}`)
      .then(res => res.json())
      .then(data => setWatchlist(data))
      .catch(err => console.error('Failed to load watchlist', err));

    fetch(`/api/history/${user.id}`)
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(err => console.error('Failed to load history', err));
  }, [user.id]);

  const toggleWatchlist = async (contentId: string, contentType: 'movie' | 'show') => {
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, contentId, contentType })
      });
      const data = await res.json();
      setWatchlist(data.watchlist);
    } catch (err) {
      console.error('Failed to update watchlist', err);
    }
  };

  const isInWatchlist = (contentId: string) => {
    return watchlist.some(w => w.userId === user.id && w.contentId === contentId);
  };

  const updateHistory = async (contentId: string, contentType: 'movie' | 'show', progress: number, duration: number) => {
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, contentId, contentType, progress, duration })
      });
      setHistory(prev => {
        const existing = prev.findIndex(h => h.userId === user.id && h.contentId === contentId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { ...updated[existing], progress, duration, updatedAt: new Date().toISOString() };
          return updated;
        } else {
          return [{ userId: user.id, contentId, contentType, progress, duration, updatedAt: new Date().toISOString() }, ...prev];
        }
      });
    } catch (err) {
      console.error('Failed to update history', err);
    }
  };

  const rateContent = async (contentId: string, rating: number) => {
    try {
      await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, contentId, rating })
      });
      setRatings(prev => ({ ...prev, [contentId]: rating }));
    } catch (err) {
      console.error('Failed to submit rating', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      watchlist,
      toggleWatchlist,
      isInWatchlist,
      history,
      updateHistory,
      ratings,
      rateContent,
      activeTab,
      setActiveTab,
      selectedContent,
      setSelectedContent,
      playingItem,
      setPlayingItem
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
