import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StoryCard } from './StoryCard';
import { ALL_CATEGORIES_DATA } from './CategoriesView';
import { Category, SearchFilters } from '../types';
import { 
  Search, 
  Sparkles, 
  SlidersHorizontal, 
  Grid, 
  List, 
  BookOpen, 
  Flame, 
  Star, 
  FilterX,
  X,
  PenTool,
  Wand2,
  Rocket,
  Heart,
  Map as MapIcon,
  Zap,
  Crown,
  Frown,
  Feather,
  Smile,
  Compass,
  Shield,
  Moon,
  Brain,
  Lightbulb,
  Cpu,
  ArrowRight
} from 'lucide-react';

const CATEGORIES: (Category | 'Tümü')[] = [
  'Tümü',
  'Genel',
  'Romantik',
  'Bilim Kurgu',
  'Fantastik',
  'Gizem',
  'Gerilim',
  'Korku',
  'Polisiye',
  'Paranormal',
  'Aksiyon',
  'Kişisel Blog',
  'Dram',
  'Şiir',
  'Teknoloji',
  'Hayran Kurgu',
  'Macera',
  'LGBTQ+',
  'Mitoloji',
  'Mizah',
  'Felsefe',
  'Psikoloji',
  'Tarihi',
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Tümü': return <Sparkles className="w-3.5 h-3.5 shrink-0" />;
    case 'Fantastik': return <Wand2 className="w-3.5 h-3.5 shrink-0" />;
    case 'Bilim Kurgu': return <Rocket className="w-3.5 h-3.5 shrink-0" />;
    case 'Romantik': return <Heart className="w-3.5 h-3.5 shrink-0" />;
    case 'Macera': return <MapIcon className="w-3.5 h-3.5 shrink-0" />;
    case 'Genç Kurgu': return <Zap className="w-3.5 h-3.5 shrink-0" />;
    case 'Hayran Kurgu': return <Star className="w-3.5 h-3.5 shrink-0" />;
    case 'Mitoloji': return <Crown className="w-3.5 h-3.5 shrink-0" />;
    case 'Dram': return <Frown className="w-3.5 h-3.5 shrink-0" />;
    case 'LGBTQ+':
    case 'LGBTQ': return <Sparkles className="w-3.5 h-3.5 shrink-0" />;
    case 'Şiir': return <Feather className="w-3.5 h-3.5 shrink-0" />;
    case 'Mizah': return <Smile className="w-3.5 h-3.5 shrink-0" />;
    case 'Gizem / Gerilim':
    case 'Gizem': return <Compass className="w-3.5 h-3.5 shrink-0" />;
    case 'Gerilim':
    case 'Korku': return <Flame className="w-3.5 h-3.5 shrink-0" />;
    case 'Polisiye': return <Shield className="w-3.5 h-3.5 shrink-0" />;
    case 'Paranormal': return <Moon className="w-3.5 h-3.5 shrink-0" />;
    case 'Aksiyon': return <Zap className="w-3.5 h-3.5 shrink-0" />;
    case 'Psikoloji': return <Brain className="w-3.5 h-3.5 shrink-0" />;
    case 'Tarihi': return <BookOpen className="w-3.5 h-3.5 shrink-0" />;
    case 'Felsefe': return <Lightbulb className="w-3.5 h-3.5 shrink-0" />;
    case 'Kişisel Blog': return <PenTool className="w-3.5 h-3.5 shrink-0" />;
    case 'Teknoloji': return <Cpu className="w-3.5 h-3.5 shrink-0" />;
    default: return <Grid className="w-3.5 h-3.5 shrink-0" />;
  }
};

export const ExploreView: React.FC = () => {
  const { 
    stories, 
    currentUser, 
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    selectedTagFilter,
    setSelectedTagFilter,
    openStoryEditor,
    setActiveView
  } = useApp();

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: selectedCategoryFilter || 'Tümü',
    sortBy: 'popular',
    status: 'all',
    tag: selectedTagFilter,
  });

  const [layoutMode, setLayoutMode] = useState<'grid' | 'horizontal'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Sync state when global category or tag selection changes
  useEffect(() => {
    setFilters((prev) => ({ 
      ...prev, 
      category: selectedCategoryFilter || 'Tümü',
      tag: selectedTagFilter 
    }));
  }, [selectedCategoryFilter, selectedTagFilter]);

  // Filter public stories
  const availableStories = useMemo(() => {
    return stories.filter((s) => {
      const isVisible = s.visibility === 'public' || (currentUser && s.authorId === currentUser.id);
      return isVisible;
    });
  }, [stories, currentUser]);

  // All available tags added by authors
  const popularTags = useMemo(() => {
    const tagMap = new Map<string, number>();
    availableStories.forEach((s) => {
      s.tags.forEach((t) => {
        if (t && t.trim()) tagMap.set(t.trim(), (tagMap.get(t.trim()) || 0) + 1);
      });
    });
    return Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([tag]) => tag);
  }, [availableStories]);

  // Filtered stories calculation
  const filteredStories = useMemo(() => {
    return availableStories.filter((story) => {
      // Query filter
      if (filters.query.trim()) {
        const q = filters.query.toLowerCase().trim();
        const matchesTitle = story.title.toLowerCase().includes(q);
        const matchesAuthor = story.authorName.toLowerCase().includes(q) || story.authorUsername.toLowerCase().includes(q);
        const matchesSummary = story.summary.toLowerCase().includes(q);
        const matchesTag = story.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesAuthor && !matchesSummary && !matchesTag) return false;
      }

      // Category filter
      if (filters.category !== 'Tümü' && story.category !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && story.status !== filters.status) {
        return false;
      }

      // Tag filter
      if (filters.tag) {
        const targetTag = filters.tag.trim().toLowerCase();
        const storyHasTag = story.tags.some(
          (t) => t.trim().toLowerCase() === targetTag || t.trim().toLowerCase().includes(targetTag)
        );
        if (!storyHasTag) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'popular') {
        return (b.reads + b.likes * 3) - (a.reads + a.likes * 3);
      }
      if (filters.sortBy === 'reads') {
        return b.reads - a.reads;
      }
      if (filters.sortBy === 'likes') {
        return b.likes - a.likes;
      }
      if (filters.sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  }, [availableStories, filters]);

  const clearFilters = () => {
    setSelectedCategoryFilter('Tümü');
    setSelectedTagFilter(undefined);
    setFilters({
      query: '',
      category: 'Tümü',
      sortBy: 'popular',
      status: 'all',
      tag: undefined,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in pb-24 md:pb-12">
      
      {/* Keşfet Başlığı */}
      <div className="space-y-1.5 border-b border-purple-100 dark:border-purple-900/30 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
            Keşfet
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Binlerce hikaye, yazar, edebiyat kategorisi ve popüler etiket arasında dilediğin gibi arama yap.
        </p>
      </div>

      {/* Main Search & Categorization Bar */}
      <section className="space-y-4">
        
        {/* Search Input & Control Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
            <input 
              type="text"
              value={filters.query}
              onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
              placeholder="Hikaye başlığı, yazar adı, konu veya #etiket ara..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-sm transition-all text-sm font-medium"
            />
            {filters.query && (
              <button 
                onClick={() => setFilters((prev) => ({ ...prev, query: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Aramayı temizle"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl border font-bold text-xs transition-all cursor-pointer ${
                showAdvancedFilters || filters.status !== 'all' || filters.sortBy !== 'popular'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-300'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Gelişmiş Süzgeçler</span>
            </button>

            {/* Layout Mode Toggle */}
            <div className="flex items-center p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                  layoutMode === 'grid' ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 font-bold' : 'text-slate-400'
                }`}
                title="Izgara Görünümü"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode('horizontal')}
                className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                  layoutMode === 'horizontal' ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 font-bold' : 'text-slate-400'
                }`}
                title="Liste Görünümü"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategoryFilter(cat);
                setFilters((prev) => ({ ...prev, category: cat }));
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                filters.category === cat
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800/80 hover:border-purple-300'
              }`}
            >
              {getCategoryIcon(cat)}
              <span>{cat}</span>
            </button>
          ))}

          {/* Tüm Kategoriler Sayfasına Git */}
          <button
            onClick={() => setActiveView('categories')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/60 hover:bg-purple-100 dark:hover:bg-purple-900/80 shrink-0 cursor-pointer"
            title="Tüm edebiyat kategorilerini sayfa olarak görüntüle"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Tüm Kategoriler ({ALL_CATEGORIES_DATA.length || 23}) →</span>
          </button>
        </div>

        {/* Popular Tags Chips Bar */}
        {popularTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-500" /> Popüler Etiketler:
            </span>
            {popularTags.map((t) => {
              const isSelected = filters.tag?.toLowerCase() === t.toLowerCase();
              return (
                <button
                  key={t}
                  onClick={() => {
                    const nextTag = isSelected ? undefined : t;
                    setSelectedTagFilter(nextTag);
                    setFilters((prev) => ({ ...prev, tag: nextTag }));
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20 ring-2 ring-purple-400'
                      : 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40 hover:bg-purple-100 dark:hover:bg-purple-900/60'
                  }`}
                >
                  #{t}
                </button>
              );
            })}
          </div>
        )}

        {/* Expandable Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4" /> Arama ve Filtre Ayarları
              </h4>
              <button 
                onClick={clearFilters}
                className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 cursor-pointer"
              >
                <FilterX className="w-3.5 h-3.5" /> Sıfırla
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Sort By Dropdown */}
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1.5">Sıralama Ölçütü</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="popular">En Popüler (Karma)</option>
                  <option value="reads">En Çok Okunanlar</option>
                  <option value="likes">En Çok Beğenilenler</option>
                  <option value="newest">En Yeni Yayınlananlar</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1.5">Eser Durumu</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as any }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="ongoing">Devam Edenler</option>
                  <option value="completed">Tamamlananlar</option>
                </select>
              </div>

              {/* Genre / Category Filter */}
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1.5">Kategori / Tür</label>
                <select
                  value={filters.category}
                  onChange={(e) => {
                    const cat = e.target.value as Category | 'Tümü';
                    setSelectedCategoryFilter(cat);
                    setFilters((prev) => ({ ...prev, category: cat }));
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {CATEGORIES.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

      </section>

      {/* Stories Results Section */}
      <section className="space-y-6">
        
        {/* Active Filter Badges Bar */}
        {(filters.query || filters.category !== 'Tümü' || filters.tag || filters.status !== 'all' || filters.sortBy !== 'popular') && (
          <div className="flex flex-wrap items-center gap-2 p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200/80 dark:border-purple-900/40">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300 mr-1">Aktif Süzgeçler:</span>

            {filters.tag && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-sm">
                #{filters.tag}
                <button 
                  onClick={() => {
                    setSelectedTagFilter(undefined);
                    setFilters((prev) => ({ ...prev, tag: undefined }));
                  }}
                  className="p-0.5 rounded-full hover:bg-purple-700 transition-colors cursor-pointer"
                  title="Etiket filtresini kaldır"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {filters.category !== 'Tümü' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm">
                {filters.category}
                <button 
                  onClick={() => {
                    setSelectedCategoryFilter('Tümü');
                    setFilters((prev) => ({ ...prev, category: 'Tümü' }));
                  }}
                  className="p-0.5 rounded-full hover:bg-indigo-700 transition-colors cursor-pointer"
                  title="Kategori filtresini kaldır"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {filters.query && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 text-white text-xs font-bold shadow-sm">
                "{filters.query}"
                <button 
                  onClick={() => setFilters((prev) => ({ ...prev, query: '' }))}
                  className="p-0.5 rounded-full hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Arama kelimesini temizle"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {filters.status !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm">
                {filters.status === 'completed' ? 'Tamamlananlar' : 'Devam Edenler'}
                <button 
                  onClick={() => setFilters((prev) => ({ ...prev, status: 'all' }))}
                  className="p-0.5 rounded-full hover:bg-emerald-700 transition-colors cursor-pointer"
                  title="Durum filtresini kaldır"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            <button 
              onClick={clearFilters}
              className="ml-auto text-xs text-rose-500 font-bold hover:underline cursor-pointer"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {filters.tag 
                ? `#${filters.tag} Etiketli Hikayeler` 
                : filters.category !== 'Tümü' 
                  ? `${filters.category} Hikayeleri` 
                  : filters.query 
                    ? `"${filters.query}" Arama Sonuçları`
                    : 'Tüm Hikayeler'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {filteredStories.length} kurgu listeleniyor
            </p>
          </div>

          {(filters.query || filters.category !== 'Tümü' || filters.tag || filters.status !== 'all') && (
            <button 
              onClick={clearFilters}
              className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>

        {filteredStories.length > 0 ? (
          <div className={
            layoutMode === 'grid' 
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4'
              : 'space-y-4'
          }>
            {filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} layout={layoutMode} />
            ))}
          </div>
        ) : availableStories.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <PenTool className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Platformda Henüz Hikaye Yok
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                Kendi kurgunu yazıp ilk hikayeyi yayınlayarak WattyBoon topluluğunun yazarları arasına katılabilirsin!
              </p>
            </div>
            <button
              onClick={() => openStoryEditor(null)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-500/30 hover:scale-105 transition-all cursor-pointer"
            >
              + İlk Hikayeni Kaleme Al
            </button>
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-8 space-y-4">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Aramanıza Uygun Hikaye Bulunamadı
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              "{filters.query || filters.tag || filters.category}" kriterlerine uygun sonuç bulunamadı. Lütfen arama kelimelerini değiştirmeyi veya filtreleri sıfırlamayı deneyin.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 cursor-pointer"
              >
                Tüm Hikayeleri Göster
              </button>
              <button
                onClick={() => setActiveView('home')}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        )}
      </section>

    </div>
  );
};
