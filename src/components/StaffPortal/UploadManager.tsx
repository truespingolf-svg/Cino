import React, { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle2, Film, Loader2, Copy, Check, HardDrive } from 'lucide-react';
import { uploadVideoFile, UploadProgress } from '../../utils/mediaUploader';
import { formatBytes, isValidVideoFormat } from '../../utils/streaming';

export const UploadManager: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadJobs, setUploadJobs] = useState<any[]>([]);

  const fetchJobs = () => {
    fetch('/api/uploads')
      .then(res => res.json())
      .then(data => setUploadJobs(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidVideoFormat(file.name, file.type)) {
      setError('Please select a valid video file (.mp4, .m4v, .mkv, .mov, .webm).');
      return;
    }

    setError('');
    setFileName(file.name);
    setFileSize(formatBytes(file.size));
    setUploading(true);
    setSuccess(false);

    try {
      const result = await uploadVideoFile(file, (p) => {
        setProgress(p);
      });

      setUploading(false);
      setSuccess(true);
      setProgress(null);
      fetchJobs();
    } catch {
      setError('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Media Storage & MP4 Ingestion Center</h2>
        <p className="text-zinc-400 text-sm mt-1">Direct high-speed streaming upload for master MP4, MKV, and WebM video files of any size.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-xl shadow-red-900/30">
            <UploadCloud className="w-10 h-10" />
          </div>

          <h3 className="text-xl font-bold text-white">Upload Master Video Files</h3>
          <p className="text-zinc-400 text-sm">
            Supports MP4, WebM, MKV, and QuickTime MOV. Handles multi-gigabyte large sizes with chunked streaming.
          </p>

          <label className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer shadow-xl shadow-red-600/30 transition hover:scale-105">
            <span>{uploading ? 'Streaming Video...' : 'Browse MP4 Video File'}</span>
            <input
              type="file"
              accept="video/mp4,video/x-m4v,video/webm,video/quicktime,video/x-matroska,video/*,.mp4,.m4v,.mov,.webm,.mkv"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {uploading && (
          <div className="max-w-md mx-auto space-y-3 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-left">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                <span>Streaming {fileName}...</span>
              </span>
              <span className="text-red-500 font-bold">{progress?.percentage || 0}%</span>
            </div>
            <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="bg-red-600 h-full transition-all duration-150"
                style={{ width: `${progress?.percentage || 0}%` }}
              />
            </div>
            {progress && (
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>{progress.formattedLoaded} uploaded</span>
                <span>Total: {progress.formattedTotal}</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 font-semibold">{error}</p>
        )}

        {success && (
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>File uploaded successfully and registered in media storage ({fileSize}).</span>
          </div>
        )}
      </div>

      {/* Uploaded Files Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <HardDrive className="w-5 h-5 text-red-500" />
          <span>Uploaded Video Assets</span>
        </h3>

        <div className="space-y-3">
          {uploadJobs.map((job) => (
            <div key={job.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-red-600/10 text-red-500">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{job.fileName}</h4>
                  <div className="flex items-center space-x-3 text-xs text-zinc-400 mt-0.5">
                    <span>{job.fileSize}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">Ready for Playback</span>
                    <span>•</span>
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={job.playbackUrl}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300 font-mono w-48 sm:w-64"
                />
                <button
                  onClick={() => copyToClipboard(job.playbackUrl, job.id)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                  title="Copy playback URL"
                >
                  {copiedId === job.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          {uploadJobs.length === 0 && (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No media files uploaded yet. Select an MP4 file above to upload to Cinevo media storage.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
