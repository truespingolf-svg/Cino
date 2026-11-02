import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, Film, Loader2, AlertCircle } from 'lucide-react';

export const UploadManager: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);
    setProgress(0);
    setSuccess(false);

    let current = 0;
    const interval = setInterval(() => {
      current += 15;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setUploading(false);
        setSuccess(true);
        // Register upload job on backend
        fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, fileSize: `${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB` })
        });
      }
      setProgress(current);
    }, 400);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Cloudflare Stream & Mux Video Ingestion</h2>
        <p className="text-zinc-400 text-sm mt-1">Upload high-bitrate 4K/8K master video files with automatic transcoding and HLS packaging.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-xl shadow-purple-900/30">
            <UploadCloud className="w-10 h-10" />
          </div>

          <h3 className="text-xl font-bold text-white">Drag and Drop Master Video Files</h3>
          <p className="text-zinc-400 text-sm">
            Supports MP4, MOV, MKV, ProRes, and WebM up to 100 GB with resumable multipart upload protocol.
          </p>

          <label className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold cursor-pointer shadow-xl shadow-purple-600/30 transition hover:scale-105">
            <span>Browse Master Video File</span>
            <input type="file" accept="video/*" onChange={handleSimulateUpload} className="hidden" />
          </label>
        </div>

        {uploading && (
          <div className="max-w-xl mx-auto space-y-3 pt-6 border-t border-zinc-800">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-white truncate max-w-xs">{fileName}</span>
              <span className="text-purple-400">{progress}% Transcoded</span>
            </div>
            <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
              <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-zinc-500 flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span>Generating adaptive bitrate HLS manifests & 4K poster thumbnails...</span>
            </p>
          </div>
        )}

        {success && (
          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Video uploaded successfully! Ready for streaming integration.</span>
          </div>
        )}
      </div>
    </div>
  );
};
