import React, { useState, useEffect } from 'react';
import { Tv, Plus, Trash2, X, Film, ChevronRight, Upload, Video, Image as ImageIcon } from 'lucide-react';
import { TVShow } from '../../types';

export const ShowManager: React.FC = () => {
  const [shows, setShows] = useState<TVShow[]>([]);
  const [isCreatingShow, setIsCreatingShow] = useState(false);
  const [selectedShowForSeason, setSelectedShowForSeason] = useState<TVShow | null>(null);
  
  const [showForm, setShowForm] = useState({
    title: '',
    description: '',
    releaseYear: 2026,
    genres: 'Action, Drama, Sci-Fi',
    ageRating: '18+',
    posterUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1920&auto=format&fit=crop'
  });

  const [episodeForm, setEpisodeForm] = useState({
    title: '',
    description: '',
    runtime: '50m',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
  });

  const fetchShows = () => {
    fetch('/api/shows')
      .then(res => res.json())
      .then(data => setShows(data));
  };

  useEffect(() => {
    fetchShows();
  }, []);

  const handleShowFile = (e: React.ChangeEvent<HTMLInputElement>, field: 'posterUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setShowForm(prev => ({ ...prev, [field]: objectUrl }));
    }
  };

  const handleEpisodeFile = (e: React.ChangeEvent<HTMLInputElement>, field: 'thumbnailUrl' | 'videoUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setEpisodeForm(prev => ({ ...prev, [field]: objectUrl }));
    }
  };

  const handleCreateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/shows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...showForm,
        genres: showForm.genres.split(',').map(s => s.trim())
      })
    });
    setIsCreatingShow(false);
    fetchShows();
  };

  const handleAddSeason = async (showId: string) => {
    await fetch(`/api/shows/${showId}/seasons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Season' })
    });
    fetchShows();
    const res = await fetch(`/api/shows/${showId}`);
    const updated = await res.json();
    setSelectedShowForSeason(updated);
  };

  const handleAddEpisode = async (showId: string, seasonId: string) => {
    await fetch(`/api/shows/${showId}/seasons/${seasonId}/episodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(episodeForm)
    });
    const res = await fetch(`/api/shows/${showId}`);
    const updated = await res.json();
    setSelectedShowForSeason(updated);
    setEpisodeForm({
      title: '',
      description: '',
      runtime: '50m',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    });
  };

  const handleDeleteShow = async (id: string) => {
    if (confirm('Delete this TV series?')) {
      await fetch(`/api/shows/${id}`, { method: 'DELETE' });
      fetchShows();
      if (selectedShowForSeason?.id === id) setSelectedShowForSeason(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">TV Series & Episode File Uploads</h2>
          <p className="text-zinc-400 text-sm mt-1">Manage series, seasons, and upload episode video files directly.</p>
        </div>
        <button
          onClick={() => setIsCreatingShow(true)}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/30 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Upload New TV Series</span>
        </button>
      </div>

      {isCreatingShow && (
        <form onSubmit={handleCreateShow} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h3 className="text-lg font-bold text-white">Upload TV Show Series</h3>
            <button type="button" onClick={() => setIsCreatingShow(false)} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Series Title</label>
              <input
                type="text"
                required
                value={showForm.title}
                onChange={e => setShowForm({ ...showForm, title: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Release Year</label>
              <input
                type="number"
                value={showForm.releaseYear}
                onChange={e => setShowForm({ ...showForm, releaseYear: parseInt(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Genres</label>
              <input
                type="text"
                value={showForm.genres}
                onChange={e => setShowForm({ ...showForm, genres: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Age Rating</label>
              <input
                type="text"
                value={showForm.ageRating}
                onChange={e => setShowForm({ ...showForm, ageRating: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Description</label>
              <textarea
                rows={3}
                value={showForm.description}
                onChange={e => setShowForm({ ...showForm, description: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <label className="block text-xs font-bold text-red-500 uppercase flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>Upload Poster Image File</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleShowFile(e, 'posterUrl')}
                className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-zinc-800">
            <button type="button" onClick={() => setIsCreatingShow(false)} className="px-6 py-3 rounded-xl bg-zinc-800 text-white font-semibold">
              Cancel
            </button>
            <button type="submit" className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/30">
              Create Series
            </button>
          </div>
        </form>
      )}

      {/* Shows List & Season Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-white">All Series</h3>
          <div className="space-y-3">
            {shows.map(show => (
              <div
                key={show.id}
                onClick={() => setSelectedShowForSeason(show)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  selectedShowForSeason?.id === show.id ? 'bg-red-600/20 border-red-500 shadow-lg' : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img src={show.posterUrl} alt="" className="w-12 h-16 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-white text-sm">{show.title}</h4>
                    <p className="text-xs text-zinc-400">{show.seasons?.length || 0} Seasons</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Selected Show Seasons & Episodes Management */}
        <div className="lg:col-span-2">
          {selectedShowForSeason ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedShowForSeason.title}</h3>
                  <p className="text-xs text-zinc-400">Manage seasons and upload episode videos</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddSeason(selectedShowForSeason.id)}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow transition"
                  >
                    + Add Season
                  </button>
                  <button
                    onClick={() => handleDeleteShow(selectedShowForSeason.id)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {selectedShowForSeason.seasons?.map((season: any) => (
                <div key={season.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-base">{season.title} ({season.episodes?.length || 0} Episodes)</h4>
                  </div>

                  <div className="space-y-2">
                    {season.episodes?.map((ep: any) => (
                      <div key={ep.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm">
                        <span className="font-medium text-white">Ep {ep.episodeNumber}: {ep.title}</span>
                        <span className="text-xs text-zinc-400">{ep.runtime}</span>
                      </div>
                    ))}
                  </div>

                  {/* Add Episode Form inline */}
                  <div className="pt-3 border-t border-zinc-800 space-y-3">
                    <h5 className="text-xs font-bold text-red-500 uppercase">Upload Episode to {season.title}</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Episode Title"
                        value={episodeForm.title}
                        onChange={e => setEpisodeForm({ ...episodeForm, title: e.target.value })}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Runtime (e.g. 48m)"
                        value={episodeForm.runtime}
                        onChange={e => setEpisodeForm({ ...episodeForm, runtime: e.target.value })}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Episode Description"
                      value={episodeForm.description}
                      onChange={e => setEpisodeForm({ ...episodeForm, description: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-zinc-400 mb-1">Episode Thumbnail File</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleEpisodeFile(e, 'thumbnailUrl')}
                          className="w-full text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-zinc-800 file:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1">Episode Video File</label>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={e => handleEpisodeFile(e, 'videoUrl')}
                          className="w-full text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-red-600 file:text-white"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddEpisode(selectedShowForSeason.id, season.id)}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow"
                    >
                      Save Episode & Video
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12 bg-zinc-900 border border-zinc-800 rounded-3xl text-zinc-500 text-sm">
              Select a TV series from the left to manage seasons and upload episode videos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
