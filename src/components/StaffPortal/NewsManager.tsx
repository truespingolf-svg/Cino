import React, { useState, useEffect } from 'react';
import { Newspaper, Plus, Trash2, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { NewsArticle } from '../../types';

export const NewsManager: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [statusNotification, setStatusNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setStatusNotification({ message, type });
    setTimeout(() => setStatusNotification(null), 4000);
  };

  const initialForm = {
    title: '',
    headline: '',
    content: '',
    author: 'Staff',
    category: 'Cinevo Announcements',
    imageUrl: ''
  };

  const [form, setForm] = useState(initialForm);

  const fetchNews = () => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => setNews(Array.isArray(data) ? data : []));
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
    if (!form.title.trim()) {
      notify('Article title is required', 'error');
      return;
    }

    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const created = await res.json();
      setIsCreating(false);
      setForm(initialForm);
      fetchNews();
      notify(`Article "${created.title}" published in real-time!`, 'success');
    } catch {
      notify('Failed to publish article', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this article?')) {
      try {
        await fetch(`/api/news/${id}`, { method: 'DELETE' });
        fetchNews();
        notify('Article deleted successfully', 'success');
      } catch {
        notify('Failed to delete article', 'error');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Toast Notification */}
      {statusNotification && (
        <div className={`p-4 rounded-2xl flex items-center space-x-3 text-sm font-semibold shadow-2xl transition-all ${
          statusNotification.type === 'success' 
            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' 
            : 'bg-red-500/20 border border-red-500/40 text-red-400'
        }`}>
          <CheckCircle2 className="w-5 h-5 flex-none" />
          <span>{statusNotification.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Entertainment News & Announcements</h2>
          <p className="text-zinc-400 text-sm mt-1">Publish breaking entertainment news, exclusive interviews, and platform updates in real-time.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Article</span>
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h3 className="text-xl font-bold text-white">Create News Article</h3>
            <button type="button" onClick={() => setIsCreating(false)} className="text-zinc-400 hover:text-white p-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Headline / Title *</label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Cinevo Studios Unveils 2026 Film Slate"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
                >
                  <option value="Cinevo Announcements">Cinevo Announcements</option>
                  <option value="Behind the Scenes">Behind the Scenes</option>
                  <option value="Industry Scoop">Industry Scoop</option>
                  <option value="Director Spotlight">Director Spotlight</option>
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
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Short Sub-headline</label>
              <input
                type="text"
                placeholder="Brief one-sentence summary"
                value={form.headline}
                onChange={e => setForm({ ...form, headline: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Full Story Content</label>
              <textarea
                rows={5}
                placeholder="Write the full news story here..."
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <label className="block text-xs font-bold text-red-500 uppercase flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>Upload Banner Image File</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white cursor-pointer"
              />
              {form.imageUrl && (
                <img src={form.imageUrl} alt="Preview" className="w-40 h-24 object-cover rounded-xl border border-zinc-800 mt-2" />
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-6 py-3 rounded-xl bg-zinc-800 text-white font-semibold text-xs uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30"
            >
              Publish Story
            </button>
          </div>
        </form>
      )}

      {/* News Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map(article => (
          <div key={article.id} className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              {article.imageUrl ? (
                <img src={article.imageUrl} alt="" className="w-full h-44 rounded-2xl object-cover bg-zinc-950" />
              ) : (
                <div className="w-full h-44 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-700">
                  <Newspaper className="w-8 h-8" />
                </div>
              )}
              <span className="px-2.5 py-0.5 rounded bg-red-600/20 text-red-400 text-[11px] font-bold">
                {article.category}
              </span>
              <h3 className="font-bold text-white text-base line-clamp-2">{article.title}</h3>
              <p className="text-zinc-400 text-xs line-clamp-2">{article.headline}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800 pt-3">
              <span>{article.author} • {new Date(article.publishedAt).toLocaleDateString()}</span>
              <button
                onClick={() => handleDelete(article.id)}
                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                title="Delete article"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {news.length === 0 && (
          <div className="col-span-full p-12 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-2 text-zinc-500">
            <Newspaper className="w-8 h-8 mx-auto text-zinc-700" />
            <p className="text-sm font-semibold text-white">No Articles Published</p>
            <p className="text-xs">Click "Publish Article" to post announcements and entertainment news.</p>
          </div>
        )}
      </div>
    </div>
  );
};
