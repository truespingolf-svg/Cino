import React, { useState } from 'react';
import { Search, Shield, LogOut, Check, ChevronDown, Film, Tv, Newspaper, Bookmark, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StaffAuthModal } from './StaffAuthModal';

export const Navbar: React.FC = () => {
  const { user, setUser, activeTab, setActiveTab } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showStaffAuth, setShowStaffAuth] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'movies', label: 'MOVIES', icon: Film },
    { id: 'shows', label: 'TV SHOWS', icon: Tv },
    { id: 'shows', label: 'SERIES', icon: Tv },
    { id: 'news', label: 'NEWS', icon: Newspaper },
    { id: 'mylist', label: 'MY LIST', icon: Bookmark },
  ];

  const handleStaffClick = () => {
    if (user.isStaff) {
      setActiveTab('staff');
    } else {
      setShowStaffAuth(true);
    }
  };

  const handleSignOut = () => {
    setUser({
      id: 'guest',
      name: 'Guest Viewer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
      isStaff: false
    });
    setShowProfileMenu(false);
    setActiveTab('home');
    alert('Signed out of staff mode successfully. You are browsing as a guest.');
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-45 transition-all duration-300 ${
        isScrolled ? 'bg-black/90 backdrop-blur-md border-b border-zinc-900 shadow-2xl' : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Logo & Navigation */}
          <div className="flex items-center space-x-10">
            <button 
              onClick={() => setActiveTab('home')}
              className="flex items-center space-x-2 group focus:outline-none"
            >
              <span className="text-2xl font-black tracking-wider text-white font-sans uppercase">
                Cine<span className="text-red-600">vo</span>
              </span>
            </button>

            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item, idx) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(item.id)}
                    className={`text-xs font-bold tracking-wider transition-all ${
                      isActive 
                        ? 'text-red-600 border-b-2 border-red-600 pb-1' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Search, Staff Portal & Profile */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('search')}
              className="p-2.5 rounded-full bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800 transition border border-zinc-800"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={handleStaffClick}
              className={`hidden sm:flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition border ${
                activeTab === 'staff'
                  ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30'
                  : 'bg-zinc-900 text-red-500 border-red-500/30 hover:bg-red-950/40'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>STAFF PORTAL</span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wider uppercase transition shadow-lg shadow-red-600/30"
              >
                <span>{user.isStaff ? 'Staff' : 'Guest'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-zinc-800">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-red-500 font-medium">
                      {user.isStaff ? 'Administrator & Staff' : 'Guest Viewer'}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        if (!user.isStaff) {
                          setShowStaffAuth(true);
                        } else {
                          setUser({ ...user, isStaff: false, name: 'Guest Viewer' });
                        }
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800/80 hover:text-white flex items-center justify-between transition"
                    >
                      <span className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-red-500" />
                        <span>{user.isStaff ? 'Lock Staff Mode' : 'Staff Access (PIN 2513)'}</span>
                      </span>
                      {user.isStaff && <Check className="w-4 h-4 text-red-600" />}
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('mylist');
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800/80 hover:text-white flex items-center space-x-2 transition"
                    >
                      <Bookmark className="w-4 h-4 text-zinc-400" />
                      <span>My Watchlist</span>
                    </button>
                  </div>

                  <div className="border-t border-zinc-800 pt-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-zinc-800/80 flex items-center space-x-2 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out / Lock Staff</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <StaffAuthModal
        isOpen={showStaffAuth}
        onClose={() => setShowStaffAuth(false)}
        onSuccess={() => setActiveTab('staff')}
      />
    </>
  );
};
