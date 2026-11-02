export interface Movie {
  id: string;
  title: string;
  description: string;
  releaseYear: number;
  runtime: string;
  genres: string[];
  ageRating: string;
  averageRating: number;
  ratingCount: number;
  cast: string[];
  director: string;
  posterUrl: string;
  backdropUrl: string;
  videoUrl: string;
  isFeatured?: boolean;
  isOriginal?: boolean;
  isTrending?: boolean;
  isTopTen?: boolean;
  createdAt: string;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  description: string;
  runtime: string;
  thumbnailUrl: string;
  videoUrl: string;
}

export interface Season {
  id: string;
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

export interface TVShow {
  id: string;
  title: string;
  description: string;
  releaseYear: number;
  genres: string[];
  ageRating: string;
  averageRating: number;
  ratingCount: number;
  posterUrl: string;
  backdropUrl: string;
  isFeatured?: boolean;
  isOriginal?: boolean;
  seasons: Season[];
}

export interface NewsArticle {
  id: string;
  title: string;
  headline: string;
  content: string;
  author: string;
  category: string;
  publishedAt: string;
  imageUrl: string;
  isFeatured?: boolean;
}

export interface WatchlistItem {
  userId: string;
  contentId: string;
  contentType: 'movie' | 'show';
}

export interface WatchHistoryItem {
  userId: string;
  contentId: string;
  contentType: 'movie' | 'show';
  progress: number;
  duration: number;
  updatedAt: string;
}

export interface UserRating {
  userId: string;
  contentId: string;
  rating: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isStaff: boolean;
  isMaster?: boolean;
}
