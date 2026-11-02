import React, { useState, useEffect } from 'react';
import { Newspaper, Plus, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { NewsArticle } from '../../types';

export const NewsManager: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    headline: '',
    content: '',
    author: 'Staff',
    category: 'Cinevo Announcements',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop'
  });

  const fetchNews = () => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => setNews(data));
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, imageUrl: objectUrl }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setIsCreating(false);
    fetchNews();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this article?')) {
      await fetch(`/api/news/${id}`, { method: 'DELETE' });
      fetchNews();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Entertainment News & Image Uploads</h2>
          <p className="text-zinc-400 text-sm mt-1">Publish announcements and upload article banner images from local files.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/30 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Publish Article</span>
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h3 className="text-lg font-bold text-white">New News Article</h3>
            <button type="button" onClick={() => setIsCreating(false)} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Headline Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Short Summary Headline</label>
              <input
                type="text"
                value={form.headline}
                onChange={e => setForm({ ...form, headline: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              >
                <option>Cinevo Announcements</option>
                <option>TV News</option>
                <option>Movie News</option>
                <option>Entertainment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Author</label>
              <input
                type="text"
                value={form.author}
                onChange={e => setForm({ ...form, author: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Full Article Content</label>
              <textarea
                rows={5}
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div className="sm:col-span-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <label className="block text-xs font-bold text-red-500 uppercase flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>Upload Banner Image File from Computer</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-zinc-800">
            <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 rounded-xl bg-zinc-800 text-white font-semibold">
              Cancel
            </button>
            <button type="submit" className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/30">
              Publish Article
            </button>
          </div>
        </form>
      )}

      {/* News List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="divide-y divide-zinc-800">
          {news.map(article => (
            <div key={article.id} className="p-6 flex items-center justify-between hover:bg-zinc-800/40 transition">
              <div className="flex items-center space-x-4">
                <img src={article.imageUrl} alt="" className="w-20 h-14 rounded-xl object-cover" />
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-red-600/20 text-red-400 text-xs font-bold">{article.category}</span>
                  <h4 className="font-bold text-white text-base mt-1">{article.title}</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">{article.author} • {new Date(article.publishedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(article.id)}
                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
