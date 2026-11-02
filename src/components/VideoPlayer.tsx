import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, ArrowLeft, Settings, FastForward } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const VideoPlayer: React.FC = () => {
  const { playingItem, setPlayingItem, updateHistory } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality] = useState('1080p HDR');
  const [showSettings, setShowSettings] = useState(false);

  const [introVideoUrl, setIntroVideoUrl] = useState('');
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);

  const controlsTimeoutRef = useRef<any>(null);

  useEffect(() => {
    // Fetch global intro video setting
    fetch('/api/settings/intro')
      .then(res => res.json())
      .then(data => {
        if (data.introVideoUrl) {
          setIntroVideoUrl(data.introVideoUrl);
          setIsPlayingIntro(true);
        }
      })
      .catch(err => console.error('Failed to load intro video', err));
  }, []);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  if (!playingItem) return null;

  const { item, type, episode, season } = playingItem;
  const mainVideoUrl = episode?.videoUrl || item.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
  const currentVideoSrc = isPlayingIntro && introVideoUrl ? introVideoUrl : mainVideoUrl;
  const title = isPlayingIntro 
    ? 'Cinevo Cinematic Introduction' 
    : (type === 'episode' ? `${item.title} — S${season?.seasonNumber || 1} E${episode?.episodeNumber}: ${episode?.title}` : item.title);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
      if (!isPlayingIntro && Math.floor(videoRef.current.currentTime) % 10 === 0) {
        updateHistory(item.id, type === 'episode' ? 'show' : 'movie', videoRef.current.currentTime, videoRef.current.duration || 100);
      }
    }
  };

  const handleVideoEnded = () => {
    if (isPlayingIntro && introVideoUrl) {
      // Intro finished, transition to main feature
      setIsPlayingIntro(false);
      setCurrentTime(0);
      if (videoRef.current) {
        videoRef.current.src = mainVideoUrl;
        videoRef.current.play();
      }
    } else {
      setPlayingItem(null);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    // If playing intro, prevent skipping ahead as requested ("no skip intro")
    if (isPlayingIntro) return;
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleVolume = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettings(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden select-none">
      <video
        ref={videoRef}
        src={currentVideoSrc}
        autoPlay
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Top Bar */}
      <div className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setPlayingItem(null)}
            className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700/80 backdrop-blur-md transition shadow-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-white font-bold text-lg sm:text-xl drop-shadow">{title}</h2>
            <p className="text-red-500 text-xs font-semibold">
              {isPlayingIntro ? 'Mandatory Cinematic Intro' : `${quality} • Dolby Atmos`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700/80 backdrop-blur-md transition shadow-lg"
            >
              <Settings className="w-5 h-5" />
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-3 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl py-2 z-50">
                <div className="px-4 py-2 border-b border-zinc-800 text-xs font-bold text-zinc-400">
                  Playback Speed
                </div>
                {[0.75, 1, 1.25, 1.5, 2].map(speed => (
                  <button
                    key={speed}
                    onClick={() => changeSpeed(speed)}
                    className={`w-full px-4 py-2 text-left text-sm ${playbackSpeed === speed ? 'text-red-500 font-bold bg-red-600/10' : 'text-zinc-300 hover:bg-zinc-800'}`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent space-y-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        
        {/* Scrubber Timeline */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            disabled={isPlayingIntro}
            className={`w-full h-1.5 bg-zinc-800 rounded-lg appearance-none accent-red-600 ${isPlayingIntro ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:h-2.5'} transition-all`}
          />
          <div className="flex justify-between text-xs text-zinc-400 font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Buttons Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlay}
              className="p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
            </button>

            <div className="flex items-center space-x-2">
              <button onClick={toggleVolume} className="text-zinc-300 hover:text-white">
                {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleFullscreen}
              className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 transition"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
