import { formatBytes } from './streaming';

export interface UploadProgress {
  percentage: number;
  loadedBytes: number;
  totalBytes: number;
  formattedLoaded: string;
  formattedTotal: string;
}

/**
 * Upload an MP4 or any large media file to the server with real-time progress.
 * Supports streaming multi-gigabyte video files with graceful fallback.
 */
export async function uploadVideoFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ url: string; fileName: string; fileSize: string }> {
  return new Promise((resolve) => {
    // Generate immediate preview URL
    let localPreviewUrl = '';
    try {
      localPreviewUrl = URL.createObjectURL(file);
    } catch {
      // ignore
    }

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentage = Math.min(100, Math.round((event.loaded / event.total) * 100));
        onProgress({
          percentage,
          loadedBytes: event.loaded,
          totalBytes: event.total,
          formattedLoaded: formatBytes(event.loaded),
          formattedTotal: formatBytes(event.total)
        });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.url || response.playbackUrl || localPreviewUrl,
            fileName: response.fileName || file.name,
            fileSize: response.fileSize || formatBytes(file.size)
          });
          return;
        } catch {
          // parse error
        }
      }
      // On any server error, fall back to local preview
      resolve({
        url: localPreviewUrl,
        fileName: file.name,
        fileSize: formatBytes(file.size)
      });
    };

    xhr.onerror = () => {
      resolve({
        url: localPreviewUrl,
        fileName: file.name,
        fileSize: formatBytes(file.size)
      });
    };

    xhr.open('POST', '/api/upload-media');
    xhr.setRequestHeader('x-filename', encodeURIComponent(file.name));
    xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
    xhr.send(file);
  });
}
