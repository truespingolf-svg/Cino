import React, { useState, useEffect } from 'react';
import { Tv, Plus, Trash2, X, ChevronRight, Video, Image as ImageIcon, Loader2, CheckCircle2, UploadCloud, Film } from 'lucide-react';
import { TVShow } from '../../types';
import { uploadVideoFile, UploadProgress } from '../../utils/mediaUploader';
import { formatBytes, isValidVideoFormat } from '../../utils/streaming';

export const ShowManager: React.FC = () => {
  const [shows, setShows] = useState<TVShow[]>([]);
  const [isCreatingShow, setIsCreatingShow] = useState(false);
  const [selectedShowForSeason, setSelectedShowForSeason] = useState<TVShow | null>(null);
  const [activeSeasonForEpisode, setActiveSeasonForEpisode] = useState<string | null>(null);

  const [epVideoUploading, setEpVideoUploading] = useState(false);
  const [epVideoProgress, setEpVideoProgress] = useState<UploadProgress | null>(null);
  const [epVideoSuccess, setEpVideoSuccess] = useState(false);
  const [epVideoFileName, setEpVideoFileName] = useState('');
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);

  const [statusNotification, setStatusNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setStatusNotification({ message, type });
    setTimeout(() => setStatusNotification(null), 4000);
  };

  const [showForm, setShowForm] = useState({
    title: '',
    description: '',
    releaseYear: 2026,
    genres: 'Action, Drama, Sci-Fi',
    ageRating: '18+',
    posterUrl: '',
    backdropUrl: ''
  });

  const [episodeForm, setEpisodeForm] = useState({
    title: '',
    description: '',
    runtime: '45m',
    thumbnailUrl: '',
    videoUrl: ''
  });

  const fetchShows = async (autoSelectId?: string) => {
    try {
      const res = await fetch('/api/shows');
      const data = await res.json();
      const showList = Array.isArray(data) ? data : [];
      setShows(showList);

      if (autoSelectId) {
        const found = showList.find((s: any) => s.id === autoSelectId);
        if (found) {
          setSelectedShowForSeason(found);
          if (found.seasons && found.seasons.length > 0) {
            setActiveSeasonForEpisode(found.seasons[0].id);
          }
          return;
        }
      }

      if (selectedShowForSeason) {
        const updated = showList.find((s: any) => s.id === selectedShowForSeason.id);
        if (updated) setSelectedShowForSeason(updated);
      } else if (showList.length > 0) {
        setSelectedShowForSeason(showList[0]);
        if (showList[0].seasons && showList[0].seasons.length > 0) {
          setActiveSeasonForEpisode(showList[0].seasons[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch shows', err);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  const handleShowFile = (e: React.ChangeEvent<HTMLInputElement>, field: 'posterUrl' | 'backdropUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setShowForm(prev => ({ ...prev, [field]: objectUrl }));
    }
  };

  const handleEpisodeThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setEpisodeForm(prev => ({ ...prev, thumbnailUrl: objectUrl }));
    }
  };

  const processVideoFile = async (file: File) => {
    if (!isValidVideoFormat(file.name, file.type)) {
      notify('Please select a valid video file (.mp4, .m4v, .mkv, .mov, .webm).', 'error');
      return;
    }

    setEpVideoUploading(true);
    setEpVideoSuccess(false);
    setEpVideoFileName(file.name);

    try {
      const result = await uploadVideoFile(file, (progress) => {
        setEpVideoProgress(progress);
      });

      setEpisodeForm(prev => ({ ...prev, videoUrl: result.url }));
      setEpVideoSuccess(true);
      setEpVideoUploading(false);
      setEpVideoProgress(null);
      notify(`Video uploaded: ${file.name} (${formatBytes(file.size)})`, 'success');
    } catch {
      notify('Video upload failed. Please try again.', 'error');
      setEpVideoUploading(false);
    }
  };

  const handleEpisodeVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processVideoFile(file);
  };

  const handleVideoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingVideo(true);
  };

  const handleVideoDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingVideo(false);
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingVideo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processVideoFile(file);
  };

  const handleCreateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showForm.title.trim()) {
      notify('Series title is required', 'error');
      return;
    }

    try {
      const res = await fetch('/api/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...showForm,
          genres: showForm.genres.split(',').map(s => s.trim())
        })
      });
      const createdShow = await res.json();
      setIsCreatingShow(false);
      setShowForm({
        title: '',
        description: '',
        releaseYear: 2026,
        genres: 'Action, Drama, Sci-Fi',
        ageRating: '18+',
        posterUrl: '',
        backdropUrl: ''
      });

      await fetchShows(createdShow.id);
      notify(`Series "${createdShow.title}" created with Season 1 ready for episodes!`, 'success');
    } catch {
      notify('Failed to create series', 'error');
    }
  };

  const handleAddSeason = async (showId: string) => {
    try {
      const res = await fetch(`/api/shows/${showId}/seasons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Season ${(selectedShowForSeason?.seasons?.length || 0) + 1}` })
      });
      const newSeason = await res.json();
      await fetchShows(showId);
      setActiveSeasonForEpisode(newSeason.id);
      notify(`${newSeason.title} added successfully!`, 'success');
    } catch {
      notify('Failed to add season', 'error');
    }
  };

  const handleAddEpisode = async (showId: string, seasonId: string) => {
    if (!episodeForm.title.trim()) {
      notify('Episode title is required', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/shows/${showId}/seasons/${seasonId}/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(episodeForm)
      });
      const newEp = await res.json();

      setEpisodeForm({
        title: '',
        description: '',
        runtime: '45m',
        thumbnailUrl: '',
        videoUrl: ''
      });
      setEpVideoSuccess(false);
      setEpVideoFileName('');

      await fetchShows(showId);
      notify(`Episode "${newEp.title}" published with video stream!`, 'success');
    } catch {
      notify('Failed to save episode', 'error');
    }
  };

  const handleDeleteEpisode = async (showId: string, seasonId: string, episodeId: string) => {
    if (confirm('Delete this episode?')) {
      try {
        await fetch(`/api/shows/${showId}/seasons/${seasonId}/episodes/${episodeId}`, { method: 'DELETE' });
        await fetchShows(showId);
        notify('Episode deleted successfully', 'success');
      } catch {
        notify('Failed to delete episode', 'error');
      }
    }
  };

  const handleDeleteShow = async (id: string) => {
    if (confirm('Delete this entire series and all its episodes?')) {
      try {
        await fetch(`/api/shows/${id}`, { method: 'DELETE' });
        setSelectedShowForSeason(null);
        await fetchShows();
        notify('Series deleted successfully', 'success');
      } catch {
        notify('Failed to delete series', 'error');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Toast Notification */}
      {statusNotification && (
        <div className={`p-4 rounded-2xl flex items-center space-x-3 text-sm font-semibold shadow-2xl transition-all ${
          statusNotification.type === 'success' 
            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' 
            : 'bg-red-500/20 border border-red-500/40 text-red-400'
        }`}>
          <CheckCircle2 className="w-5 h-5 flex-none" />
          <span>{statusNotification.message}</span>
        </div>
      )}

      {/* Header & New TV Series Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">TV Shows & Episodic Content</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Create multi-season series and drag & drop MP4 video files directly into episodes in real-time.
          </p>
        </div>
        <button
          onClick={() => setIsCreatingShow(true)}
          className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New TV Series</span>
        </button>
      </div>

      {/* Create New Series Modal/Form */}
      {isCreatingShow && (
        <form onSubmit={handleCreateShow} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white">Create New Series</h3>
              <p className="text-xs text-zinc-400">Season 1 will be automatically created ready for episode uploads.</p>
            </div>
            <button type="button" onClick={() => setIsCreatingShow(false)} className="text-zinc-400 hover:text-white p-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Series Title *</label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Cyber City 2099"
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
                onChange={e => setShowForm({ ...showForm, releaseYear: parseInt(e.target.value) || 2026 })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Genres (comma-separated)</label>
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
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Series Synopsis</label>
              <textarea
                rows={3}
                placeholder="Brief summary of the TV series..."
                value={showForm.description}
                onChange={e => setShowForm({ ...showForm, description: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <label className="block text-xs font-bold text-red-500 uppercase flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>Upload Series Poster</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleShowFile(e, 'posterUrl')}
                className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white cursor-pointer"
              />
              {showForm.posterUrl && (
                <img src={showForm.posterUrl} alt="Poster" className="w-16 h-24 object-cover rounded-xl border border-zinc-800" />
              )}
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <label className="block text-xs font-bold text-red-500 uppercase flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>Upload Series Backdrop</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleShowFile(e, 'backdropUrl')}
                className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white cursor-pointer"
              />
              {showForm.backdropUrl && (
                <img src={showForm.backdropUrl} alt="Backdrop" className="w-32 h-20 object-cover rounded-xl border border-zinc-800" />
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsCreatingShow(false)}
              className="px-6 py-3 rounded-xl bg-zinc-800 text-white font-semibold text-xs uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30"
            >
              Publish Series
            </button>
          </div>
        </form>
      )}

      {/* Shows List & Season Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: All Series */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center justify-between">
            <span>All Series ({shows.length})</span>
          </h3>

          <div className="space-y-3">
            {shows.map(show => (
              <div
                key={show.id}
                onClick={() => {
                  setSelectedShowForSeason(show);
                  if (show.seasons && show.seasons.length > 0) {
                    setActiveSeasonForEpisode(show.seasons[0].id);
                  }
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  selectedShowForSeason?.id === show.id
                    ? 'bg-red-600/20 border-red-500 shadow-xl shadow-red-950/40'
                    : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {show.posterUrl ? (
                    <img src={show.posterUrl} alt="" className="w-12 h-16 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-16 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600">
                      <Tv className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-white text-sm line-clamp-1">{show.title}</h4>
                    <p className="text-xs text-zinc-400">{show.seasons?.length || 1} Season{show.seasons?.length !== 1 ? 's' : ''}</p>
                    <p className="text-[11px] text-zinc-500 truncate max-w-[140px]">{show.genres?.join(', ')}</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform ${selectedShowForSeason?.id === show.id ? 'text-red-500 translate-x-1' : 'text-zinc-600'}`} />
              </div>
            ))}

            {shows.length === 0 && (
              <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-3">
                <Tv className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-sm font-semibold text-white">No Series Yet</p>
                <p className="text-xs text-zinc-500">Click "New TV Series" above to create your first series.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Show Seasons & Episode Video Ingestion */}
        <div className="lg:col-span-2">
          {selectedShowForSeason ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              {/* Show Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">{selectedShowForSeason.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {selectedShowForSeason.releaseYear} • {selectedShowForSeason.ageRating} • {selectedShowForSeason.seasons?.length || 1} Season(s)
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleAddSeason(selectedShowForSeason.id)}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-600/30 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Season</span>
                  </button>
                  <button
                    onClick={() => handleDeleteShow(selectedShowForSeason.id)}
                    className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                    title="Delete entire series"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Seasons & Episodes List */}
              <div className="space-y-6">
                {selectedShowForSeason.seasons?.map((season: any) => {
                  const isAddingToThisSeason = activeSeasonForEpisode === season.id;
                  return (
                    <div key={season.id} className="p-5 sm:p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-black text-white text-lg tracking-tight">
                            {season.title}
                          </h4>
                          <span className="text-xs text-zinc-500 font-semibold">
                            {season.episodes?.length || 0} Episode{(season.episodes?.length || 0) !== 1 ? 's' : ''} Published
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveSeasonForEpisode(isAddingToThisSeason ? null : season.id)}
                          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                            isAddingToThisSeason
                              ? 'bg-zinc-800 text-white border border-zinc-700'
                              : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isAddingToThisSeason ? 'Hide Upload Form' : 'Upload Episode'}</span>
                        </button>
                      </div>

                      {/* Episodes List in Season */}
                      {season.episodes && season.episodes.length > 0 ? (
                        <div className="space-y-2.5">
                          {season.episodes.map((ep: any) => (
                            <div key={ep.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900 border border-zinc-850 hover:border-zinc-750 transition text-sm">
                              <div className="flex items-center space-x-3">
                                {ep.thumbnailUrl ? (
                                  <img src={ep.thumbnailUrl} alt="" className="w-14 h-9 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-14 h-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-700">
                                    <Film className="w-4 h-4" />
                                  </div>
                                )}
                                <div>
                                  <span className="font-bold text-white block">Ep {ep.episodeNumber}: {ep.title}</span>
                                  <span className="text-xs text-zinc-400">{ep.runtime || '45m'}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${ep.videoUrl ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'}`}>
                                  {ep.videoUrl ? 'MP4 Video Attached' : 'No Video'}
                                </span>
                                <button
                                  onClick={() => handleDeleteEpisode(selectedShowForSeason.id, season.id, ep.id)}
                                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                                  title="Delete episode"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                          No episodes in {season.title} yet. Use the form below to upload the first episode.
                        </div>
                      )}

                      {/* Inline Episode Uploader Form (shown when adding) */}
                      {isAddingToThisSeason && (
                        <div className="pt-4 border-t border-zinc-850 space-y-4 animate-in fade-in">
                          <h5 className="text-xs font-bold text-red-500 uppercase tracking-wider">
                            Upload Episode to {season.title}
                          </h5>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              required
                              placeholder="Episode Title *"
                              value={episodeForm.title}
                              onChange={e => setEpisodeForm({ ...episodeForm, title: e.target.value })}
                              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                            />
                            <input
                              type="text"
                              placeholder="Runtime (e.g. 52m)"
                              value={episodeForm.runtime}
                              onChange={e => setEpisodeForm({ ...episodeForm, runtime: e.target.value })}
                              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                            />
                          </div>

                          <textarea
                            rows={2}
                            placeholder="Episode Synopsis / Description..."
                            value={episodeForm.description}
                            onChange={e => setEpisodeForm({ ...episodeForm, description: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                          />

                          {/* DRAG AND DROP VIDEO UPLOAD DROPZONE */}
                          <div
                            onDragOver={handleVideoDragOver}
                            onDragEnter={handleVideoDragOver}
                            onDragLeave={handleVideoDragLeave}
                            onDrop={handleVideoDrop}
                            className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center space-y-3 cursor-pointer ${
                              isDraggingVideo
                                ? 'border-red-500 bg-red-600/10 scale-[1.01]'
                                : 'border-zinc-800 hover:border-red-500/50 bg-zinc-900/80'
                            }`}
                          >
                            <div className="p-3 rounded-2xl bg-red-600/20 text-red-500">
                              <UploadCloud className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-bold text-white">
                                Drag & Drop MP4 Video File Here, or Click to Browse
                              </p>
                              <p className="text-[11px] text-zinc-500 mt-0.5">
                                Supports .MP4, .MKV, .MOV, .WEBM of any size
                              </p>
                            </div>
                            <input
                              type="file"
                              accept="video/mp4,video/x-m4v,video/webm,video/quicktime,video/x-matroska,video/*,.mp4,.m4v,.mov,.webm,.mkv"
                              onChange={handleEpisodeVideoSelect}
                              disabled={epVideoUploading}
                              className="hidden"
                              id={`video-upload-${season.id}`}
                            />
                            <label
                              htmlFor={`video-upload-${season.id}`}
                              className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs cursor-pointer transition"
                            >
                              Browse Video File
                            </label>
                          </div>

                          {/* Upload Progress Bar */}
                          {epVideoUploading && (
                            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                              <div className="flex justify-between font-semibold">
                                <span className="flex items-center space-x-2 text-white">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                                  <span>Streaming {epVideoFileName}...</span>
                                </span>
                                <span className="text-red-500 font-bold">{epVideoProgress?.percentage || 0}%</span>
                              </div>
                              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                                <div className="bg-red-600 h-full transition-all" style={{ width: `${epVideoProgress?.percentage || 0}%` }} />
                              </div>
                              {epVideoProgress && (
                                <div className="flex justify-between text-[11px] text-zinc-500">
                                  <span>{epVideoProgress.formattedLoaded} uploaded</span>
                                  <span>Total size: {epVideoProgress.formattedTotal}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {epVideoSuccess && (
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
                              <CheckCircle2 className="w-4 h-4 flex-none" />
                              <span>Episode video uploaded and ready for playback!</span>
                            </div>
                          )}

                          {/* Episode Thumbnail and Direct URL Fallback */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                              <label className="block text-zinc-400 font-bold uppercase text-[10px]">Episode Thumbnail</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleEpisodeThumbnail}
                                className="w-full text-zinc-400 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-zinc-800 file:text-white cursor-pointer"
                              />
                            </div>
                            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                              <label className="block text-zinc-400 font-bold uppercase text-[10px]">Video Stream URL (auto-filled on upload)</label>
                              <input
                                type="text"
                                placeholder="Auto-filled or paste https://.../video.mp4"
                                value={episodeForm.videoUrl}
                                onChange={e => setEpisodeForm({ ...episodeForm, videoUrl: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end space-x-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setActiveSeasonForEpisode(null)}
                              className="px-5 py-2.5 rounded-xl bg-zinc-800 text-white font-semibold text-xs uppercase tracking-wider"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleAddEpisode(selectedShowForSeason.id, season.id)}
                              disabled={epVideoUploading || !episodeForm.title.trim()}
                              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-600/30"
                            >
                              {epVideoUploading ? 'Uploading Video...' : 'Publish Episode'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center p-12 bg-zinc-900 border border-zinc-800 rounded-3xl text-center space-y-3">
              <Tv className="w-12 h-12 text-zinc-700" />
              <p className="text-base font-bold text-white">Select a Series to Manage</p>
              <p className="text-xs text-zinc-500 max-w-sm">
                Click on any series on the left or create a new series to organize seasons and upload MP4 video episodes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
