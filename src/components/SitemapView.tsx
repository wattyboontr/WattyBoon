import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Map, 
  Compass, 
  BookOpen, 
  Bookmark, 
  Grid, 
  MessageSquare, 
  PenTool, 
  Search, 
  Layers, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const SitemapView: React.FC = () => {
  const { 
    stories, 
    categories, 
    forumTopics, 
    setActiveView, 
    openStoryDetail, 
    setSelectedCategoryFilter,
    setSelectedTagFilter
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  const mainPages = [
    { title: 'Ana Sayfa', desc: 'Vitrin, öne çıkan eserler ve editör seçimleri', view: 'home', icon: BookOpen, url: 'https://wattyboon.com/' },
    { title: 'Keşfet', desc: 'Gelişmiş filtreleme, popüler eserler ve arama motoru', view: 'explore', icon: Compass, url: 'https://wattyboon.com/kesfet' },
    { title: 'Tüm Kategoriler', desc: '20+ edebiyat türü ve tematik koleksiyonlar', view: 'categories', icon: Grid, url: 'https://wattyboon.com/kategoriler' },
    { title: 'Kütüphanem', desc: 'Okuma listeleri, favoriler ve okuma ilerlemeleri', view: 'library', icon: Bookmark, url: 'https://wattyboon.com/kutuphanem' },
    { title: 'Topluluk & Forum', desc: 'Tartışmalar, yazarlık tüyoları ve teoriler', view: 'forum', icon: MessageSquare, url: 'https://wattyboon.com/forum' },
    { title: 'Hikaye Yaz & Yayınla', desc: 'Bölüm editörü, müzik ekleme ve kapak yükleme', view: 'editor', icon: PenTool, url: 'https://wattyboon.com/yaz' },
  ];

  const publicStories = useMemo(() => {
    return (stories || []).filter((s) => s.visibility === 'public');
  }, [stories]);

  const filteredStories = useMemo(() => {
    if (!searchQuery.trim()) return publicStories;
    const q = searchQuery.toLowerCase();
    return publicStories.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.authorName?.toLowerCase().includes(q) ||
        s.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [publicStories, searchQuery]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    publicStories.forEach((s) => {
      s.tags?.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [publicStories]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-950 p-8 sm:p-12 text-white shadow-2xl border border-purple-500/20">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Map className="w-3.5 h-3.5" />
            <span>Site Haritası & İndeks</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            WattyBoon Site Haritası
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Platformdaki tüm ana bölümler, türler, yayınlanan açık eserler, forum başlıkları ve arama motoru dizinine eklenmiş tüm sayfalara buradan hızlıca erişebilirsiniz.
          </p>
        </div>
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 1. Ana Platform Bölümleri */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Ana Platform Bölümleri
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {mainPages.map((page, idx) => {
            const Icon = page.icon;
            return (
              <div
                key={idx}
                onClick={() => setActiveView(page.view as any)}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {page.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {page.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
                  <span>Sayfayı Ziyaret Et</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Edebi Kategoriler & Türler */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <Grid className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Edebi Türler ve Kategoriler
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {(categories || []).map((cat) => {
            const count = publicStories.filter((s) => s.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategoryFilter(cat);
                  setActiveView('explore');
                }}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:border-purple-300 dark:hover:border-purple-700/50 transition-all text-left group"
              >
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate">
                  {cat}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  {count} Eser
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Yayınlanan Hikayeler & Eserler */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Yayınlanan Eserler Dizini ({publicStories.length})
            </h2>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hikaye veya yazar ara..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {filteredStories.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            Aradığınız kritere uygun hikaye bulunamadı.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                onClick={() => openStoryDetail(story.id)}
                className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-md cursor-pointer flex gap-3.5"
              >
                <img
                  src={story.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150&auto=format&fit=crop&q=80'}
                  alt={story.title}
                  className="w-14 h-20 object-cover rounded-lg shrink-0 shadow"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mb-1">
                      {story.category}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                      {story.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      Yazar: {story.authorName}
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <span>{story.chapters?.length || 1} Bölüm</span>
                    <span>•</span>
                    <span>{story.reads || 0} Okunma</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Popüler Etiketler & Temalar */}
      {allTags.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Popüler Etiketler ve Konular
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTagFilter(tag);
                  setActiveView('explore');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-300 hover:border-purple-300 transition-all"
              >
                #{tag}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 5. Forum & Topluluk Tartışmaları */}
      {forumTopics && forumTopics.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-sky-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Forum Konuları ({forumTopics.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {forumTopics.slice(0, 9).map((topic) => (
              <div
                key={topic.id}
                onClick={() => setActiveView('forum')}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-sky-500/50 transition-all cursor-pointer group"
              >
                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">
                  {topic.category}
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-1 mt-0.5">
                  {topic.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  {topic.replies?.length || 0} Yanıt • {topic.authorName}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
