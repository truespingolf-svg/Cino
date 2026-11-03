/**
 * Core pure logic utility functions for Cinevo streaming platform
 */

export interface ContentItem {
  id: string;
  title: string;
  releaseYear: number;
  genres?: string[];
  averageRating: number;
  isTrending?: boolean;
  isTopTen?: boolean;
  isOriginal?: boolean;
  isFeatured?: boolean;
}

/**
 * Filter items by selected genre and sort order
 */
export function filterAndSortContent<T extends ContentItem>(
  items: T[],
  selectedGenre: string,
  sortBy: 'rating' | 'year' | 'title'
): T[] {
  return items
    .filter(item => {
      if (!selectedGenre || selectedGenre === 'All') return true;
      return item.genres?.includes(selectedGenre);
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.averageRating || 0) - (a.averageRating || 0);
      if (sortBy === 'year') return (b.releaseYear || 0) - (a.releaseYear || 0);
      return a.title.localeCompare(b.title);
    });
}

/**
 * Extract unique sorted genre list from content collection
 */
export function extractUniqueGenres(items: ContentItem[]): string[] {
  const genres = new Set<string>();
  items.forEach(item => {
    item.genres?.forEach(g => genres.add(g));
  });
  return Array.from(genres).sort();
}

/**
 * Validate access code against staff and master credentials
 */
export function validateAccessCode(
  inputCode: string,
  currentStaffCode: string,
  masterCode: string
): { valid: boolean; isMaster: boolean } {
  if (inputCode === masterCode) {
    return { valid: true, isMaster: true };
  }
  if (inputCode === currentStaffCode) {
    return { valid: true, isMaster: false };
  }
  return { valid: false, isMaster: false };
}

/**
 * Format bytes into human readable format (KB, MB, GB)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Validate video format support (MP4, WebM, MKV, MOV, M4V)
 */
export function isValidVideoFormat(fileName: string, mimeType?: string): boolean {
  if (mimeType && mimeType.startsWith('video/')) return true;
  const lowerName = fileName.toLowerCase();
  const validExtensions = ['.mp4', '.m4v', '.webm', '.mkv', '.mov', '.avi', '.ts'];
  return validExtensions.some(ext => lowerName.endsWith(ext));
}
