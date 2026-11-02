import React, { useState, useEffect } from 'react';
import { NewsArticle } from '../types';
import { Newspaper, Calendar, User, ArrowRight, X } from 'lucide-react';

export const NewsPage: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => setNews(data));
  }, []);

  const featured = news.find(n => n.isFeatured) || news[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 space-y-12 animate-in fade-in">
      <div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">VYBE+ Entertainment News</h1>
        <p className="text-zinc-400 text-base mt-2">Latest announcements, behind-the-scenes exclusives, and industry updates.</p>
      </div>

      {/* Featured News Hero */}
      {featured && (
        <div 
          onClick={() => setSelectedArticle(featured)}
          className="relative rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl group cursor-pointer"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-72 lg:h-auto overflow-hidden">
              <img src={featured.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            </div>
            <div className="p-8 sm:p-12 flex flex-col justify-center space-y-4">
              <span className="px-3 py-1 rounded-full bg-purple-600/30 border border-purple-500/50 text-purple-300 text-xs font-bold w-fit uppercase">
                {featured.category}
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight group-hover:text-purple-400 transition">
                {featured.title}
              </h2>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                {featured.headline}
              </p>
              <div className="flex items-center space-x-4 text-xs text-zinc-400 font-medium pt-2">
                <span>{featured.author}</span>
                <span>•</span>
                <span>{new Date(featured.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.map(article => (
          <div
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="group rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-lg hover:shadow-2xl hover:border-purple-500/50 transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-video overflow-hidden bg-zinc-950">
                <img src={article.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
              <div className="p-6 space-y-3">
                <span className="px-2.5 py-0.5 rounded bg-purple-600/20 text-purple-400 text-xs font-bold">{article.category}</span>
                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-zinc-400 text-sm line-clamp-3">
                  {article.headline}
                </p>
              </div>
            </div>
            <div className="px-6 pb-6 pt-0 flex items-center justify-between text-xs text-zinc-500 font-semibold border-t border-zinc-800/60 mt-4 pt-4">
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              <span className="text-purple-400 flex items-center space-x-1 group-hover:translate-x-1 transition">
                <span>Read Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-zinc-950/80 backdrop-blur-xl animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-8 p-6 sm:p-10 space-y-6">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="px-3 py-1 rounded-full bg-purple-600/30 border border-purple-500/50 text-purple-300 text-xs font-bold uppercase">
              {selectedArticle.category}
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {selectedArticle.title}
            </h2>

            <div className="flex items-center space-x-4 text-xs text-zinc-400 font-semibold border-y border-zinc-800 py-3">
              <span>By {selectedArticle.author}</span>
              <span>•</span>
              <span>{new Date(selectedArticle.publishedAt).toLocaleDateString()}</span>
            </div>

            <div className="aspect-video rounded-2xl overflow-hidden bg-zinc-950">
              <img src={selectedArticle.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="text-zinc-300 text-base sm:text-lg leading-relaxed space-y-4">
              <p className="font-semibold text-white">{selectedArticle.headline}</p>
              <p>{selectedArticle.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
