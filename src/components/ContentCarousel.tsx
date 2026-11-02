import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieCard } from './MovieCard';

interface ContentCarouselProps {
  title: string;
  items: any[];
  type?: 'movie' | 'show';
}

export const ContentCarousel: React.FC<ContentCarouselProps> = ({ title, items, type = 'movie' }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? scrollLeft - clientWidth + 200 : scrollLeft + clientWidth - 200;
      rowRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center space-x-3">
          <span className="w-2.5 h-7 rounded-full bg-gradient-to-b from-red-500 to-red-700 inline-block shadow-sm shadow-red-600/50" />
          <span>{title}</span>
        </h2>
        
        <div className="hidden sm:flex items-center space-x-2">
          <button
            onClick={() => handleScroll('left')}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition shadow"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition shadow"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative group">
        <div
          ref={rowRef}
          className="flex items-center space-x-5 overflow-x-auto scrollbar-none px-4 sm:px-6 lg:px-8 py-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map(item => (
            <div key={item.id} className="snap-start flex-none">
              <MovieCard item={item} type={type} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
