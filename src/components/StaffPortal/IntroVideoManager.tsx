import React, { useState, useEffect } from 'react';
import { Video, Upload, CheckCircle2, Play } from 'lucide-react';

export const IntroVideoManager: React.FC = () => {
  const [introUrl, setIntroUrl] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/settings/intro')
      .then(res => res.json())
      .then(data => setIntroUrl(data.introVideoUrl));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setIntroUrl(objectUrl);
      setSuccess(true);
      await fetch('/api/settings/intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ introVideoUrl: objectUrl })
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Global Mandatory Intro Video</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Upload an intro video file from your computer. This will automatically play before every movie and TV show episode without a skip button.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 sm:p-12 space-y-6 shadow-2xl max-w-2xl">
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-lg">
            <Video className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-white">Upload Intro Video File</h3>
          
          <input
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="w-full text-xs text-zinc-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer bg-zinc-950 p-4 rounded-2xl border border-zinc-800"
          />

          {introUrl && (
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <span className="text-xs font-bold text-zinc-400 uppercase">Current Intro Preview:</span>
              <video src={introUrl} controls className="w-full aspect-video rounded-xl object-cover bg-black" />
            </div>
          )}

          {success && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Intro video updated successfully! It will now play automatically before every movie and show.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
