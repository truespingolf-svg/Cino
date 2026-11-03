import React, { useState, useEffect } from 'react';
import { Video, CheckCircle2, UploadCloud, Loader2 } from 'lucide-react';
import { uploadVideoFile, UploadProgress } from '../../utils/mediaUploader';
import { formatBytes, isValidVideoFormat } from '../../utils/streaming';

export const IntroVideoManager: React.FC = () => {
  const [introUrl, setIntroUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetch('/api/settings/intro')
      .then(res => res.json())
      .then(data => {
        if (data.introVideoUrl) {
          setIntroUrl(data.introVideoUrl);
        }
      })
      .catch(() => {});
  }, []);

  const processFile = async (file: File) => {
    if (!isValidVideoFormat(file.name, file.type)) {
      setError('Please select a valid video file (.mp4, .m4v, .mkv, .mov, .webm).');
      return;
    }

    setError('');
    setFileName(file.name);
    setFileSize(formatBytes(file.size));
    setIsUploading(true);
    setSuccess(false);

    try {
      const result = await uploadVideoFile(file, (progress) => {
        setUploadProgress(progress);
      });

      setIntroUrl(result.url);
      setSuccess(true);
      setIsUploading(false);
      setUploadProgress(null);

      // Save global intro setting on the backend
      await fetch('/api/settings/intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ introVideoUrl: result.url })
      });
    } catch {
      setError('Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSaveCustomUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    setIntroUrl(customUrl.trim());
    setSuccess(true);
    await fetch('/api/settings/intro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ introVideoUrl: customUrl.trim() })
    });
    setCustomUrl('');
  };

  const handleRemoveIntro = async () => {
    if (confirm('Remove global mandatory intro video?')) {
      setIntroUrl('');
      setSuccess(false);
      await fetch('/api/settings/intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ introVideoUrl: '' })
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Global Mandatory Intro Video</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Upload any MP4 video or drag & drop a large master video file. It will automatically play before every movie and show episode without a skip button.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-lg">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Upload MP4 Video File</h3>
              <p className="text-xs text-zinc-400">Drag & drop or browse .MP4, .WebM, .MKV, .MOV (handles multi-GB files)</p>
            </div>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center space-y-3 cursor-pointer transition-all ${
              isDragging
                ? 'border-red-500 bg-red-600/10 scale-[1.01]'
                : 'border-zinc-700 hover:border-red-500 bg-zinc-950/80'
            }`}
          >
            <div className="p-4 rounded-2xl bg-red-600/10 text-red-500 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white">Drag & drop video file here, or click to browse</p>
              <p className="text-xs text-zinc-500 mt-1">.MP4, .MKV, .MOV, .WEBM — Any file size supported</p>
            </div>
            <input
              type="file"
              id="intro-video-file-input"
              accept="video/mp4,video/x-m4v,video/webm,video/quicktime,video/x-matroska,video/*,.mp4,.m4v,.mov,.webm,.mkv"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
            <label
              htmlFor="intro-video-file-input"
              className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs cursor-pointer transition mt-2"
            >
              Browse MP4 File
            </label>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-white flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                  <span>Streaming {fileName}...</span>
                </span>
                <span className="text-red-500 font-bold">{uploadProgress?.percentage || 0}%</span>
              </div>
              <div className="w-full bg-zinc-850 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="bg-red-600 h-full transition-all duration-200"
                  style={{ width: `${uploadProgress?.percentage || 0}%` }}
                />
              </div>
              {uploadProgress && (
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>{uploadProgress.formattedLoaded} uploaded</span>
                  <span>Total size: {uploadProgress.formattedTotal}</span>
                </div>
              )}
            </div>
          )}

          {/* Paste URL Option */}
          <div className="border-t border-zinc-800 pt-4 space-y-3">
            <span className="text-xs font-bold text-zinc-400 uppercase">Or provide direct video URL</span>
            <form onSubmit={handleSaveCustomUrl} className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                placeholder="https://example.com/intro.mp4"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition"
              >
                Set URL
              </button>
            </form>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-semibold">{error}</p>
          )}

          {success && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-none" />
              <span>Mandatory intro video updated successfully! It will now play automatically before any movie or series.</span>
            </div>
          )}
        </div>

        {/* Current Active Intro Preview */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center justify-between">
              <span>Active Intro Video</span>
              {introUrl && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 font-bold border border-red-500/30">
                  Enabled
                </span>
              )}
            </h3>

            {introUrl ? (
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden bg-black border border-zinc-800 aspect-video relative group">
                  <video
                    src={introUrl}
                    controls
                    preload="auto"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 break-all font-mono">
                  {introUrl}
                </div>
              </div>
            ) : (
              <div className="aspect-video rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center p-6 text-center space-y-2">
                <Video className="w-10 h-10 text-zinc-700" />
                <p className="text-sm font-semibold text-zinc-500">No intro video currently active</p>
                <p className="text-xs text-zinc-600">Drag & drop or upload an MP4 file on the left</p>
              </div>
            )}
          </div>

          {introUrl && (
            <button
              onClick={handleRemoveIntro}
              className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-red-600/20 hover:text-red-400 border border-zinc-700 text-zinc-400 text-xs font-bold uppercase tracking-wider transition"
            >
              Disable Intro Video
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
