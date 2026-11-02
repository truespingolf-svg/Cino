import React, { useState, useEffect } from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { ContentCarousel } from '../components/ContentCarousel';
import { MovieCard } from '../components/MovieCard';
import { Movie, TVShow } from '../types';

export const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<TVShow[]>([]);

  useEffect(() => {
    fetch('/api/movies')
      .then(res => res.json())
      .then(data => setMovies(data));

    fetch('/api/shows')
      .then(res => res.json())
      .then(data => setShows(data));
  }, []);

  const featured = movies.find(m => m.isFeatured) || movies[0];
  const originals = [...movies.filter(m => m.isOriginal), ...shows.filter(s => s.isOriginal)];
  const trending = movies.filter(m => m.isTrending !== false).sort((a, b) => b.averageRating - a.averageRating);
  const topTen = movies.filter(m => m.isTopTen !== false).slice(0, 5);

  return (
    <div className="pb-24 space-y-12">
      {featured && <HeroBanner featured={featured} />}

      <div className="space-y-12 -mt-16 relative z-20">
        {originals.length > 0 && <ContentCarousel title="Cinevo Originals" items={originals} type="movie" />}
        {trending.length > 0 && <ContentCarousel title="Trending Now" items={trending} type="movie" />}

        {/* TOP 10 CONTENTS TODAY SECTION */}
        {topTen.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center space-x-3">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter">
                TOP <span className="text-red-600">10</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 border-l border-zinc-800 pl-3">
                Contents Today
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {topTen.map((movie, idx) => (
                <div key={movie.id} className="relative flex items-center group">
                  <span className="absolute -left-6 sm:-left-10 bottom-0 text-7xl sm:text-9xl font-black text-transparent [-webkit-text-stroke:2px_#dc2626] opacity-90 z-0 select-none group-hover:scale-105 transition-transform">
                    {idx + 1}
                  </span>
                  <div className="relative z-10 w-full ml-4 sm:ml-8">
                    <MovieCard item={movie} type="movie" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {shows.length > 0 && <ContentCarousel title="Popular TV Series" items={shows} type="show" />}
        {movies.length > 0 && <ContentCarousel title="Recommended For You" items={[...movies].reverse()} type="movie" />}
      </div>
    </div>
  );
};
