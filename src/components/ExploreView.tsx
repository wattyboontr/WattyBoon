import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StoryCard } from './StoryCard';
import { Category, SearchFilters } from '../types';
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  SlidersHorizontal, 
  Grid, 
  List, 
  BookOpen, 
  UserPlus, 
  UserCheck, 
  Flame, 
  Star, 
  FilterX,
  X,
  Clock,
  Play,
  CheckCircle2,
  ShieldAlert,
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
  Headphones
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

interface ExploreViewProps {
  onOpenCategoriesModal?: () => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ onOpenCategoriesModal }) => {
  const { 
    stories, 
    users, 
    currentUser, 
    isNsfwEnabled,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    selectedTagFilter,
    setSelectedTagFilter,
    toggleFollowUser, 
    openStoryDetail, 
    openStoryReader, 
    openAuthorProfile, 
    toggleLibraryStory, 
    isStoryInLibrary,
    openStoryEditor 
  } = useApp();

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: selectedCategoryFilter || 'Tümü',
    sortBy: 'popular',
    status: 'all',
    tag: undefined,
  });

  // Sync state when global category or tag selection changes from anywhere
  useEffect(() => {
    setFilters((prev) => ({ 
      ...prev, 
      category: selectedCategoryFilter || 'Tümü',
      tag: selectedTagFilter 
    }));
  }, [selectedCategoryFilter, selectedTagFilter]);

  const [layoutMode, setLayoutMode] = useState<'grid' | 'horizontal'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Filter public stories
  const availableStories = useMemo(() => {
    return stories.filter((s) => {
      const isVisible = s.visibility === 'public' || (currentUser && s.authorId === currentUser.id);
      return isVisible;
    });
  }, [stories, currentUser]);

  // Featured Story for Hero Banner
  const featuredStory = useMemo(() => {
    return availableStories.reduce((prev, current) => 
      (prev.reads + prev.likes * 2) > (current.reads + current.likes * 2) ? prev : current
    , availableStories[0]);
  }, [availableStories]);

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
      .slice(0, 24)
      .map(([tag]) => tag);
  }, [availableStories]);

  // Stories to Continue Reading (Okumaya Devam Et)
  const continueReadingList = useMemo(() => {
    if (!currentUser || !currentUser.readingProgress) return [];
    return currentUser.readingProgress
      .map((progress) => {
        const story = stories.find((s) => s.id === progress.storyId);
        if (!story) return null;
        return {
          story,
          lastChapterIndex: progress.lastChapterIndex,
          updatedAt: progress.updatedAt,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [currentUser, stories]);

  // Featured Stories sorted by most likes & reads (Öne Çıkan & En Çok Beğenilen Hikayeler)
  const mostLikedStories = useMemo(() => {
    return [...availableStories]
      .sort((a, b) => {
        if (b.likes !== a.likes) return b.likes - a.likes;
        return b.reads - a.reads;
      })
      .slice(0, 8);
  }, [availableStories]);

  // Featured Authors sorted by most followers (Öne Çıkan Yazarlar)
  const sortedFeaturedAuthors = useMemo(() => {
    return [...users]
      .filter((u) => u && u.id && u.name)
      .sort((a, b) => {
        const followersA = a.followers?.length || 0;
        const followersB = b.followers?.length || 0;
        if (followersB !== followersA) return followersB - followersA;
        const storiesA = stories.filter((s) => s.authorId === a.id && s.visibility === 'public').length;
        const storiesB = stories.filter((s) => s.authorId === b.id && s.visibility === 'public').length;
        return storiesB - storiesA;
      });
  }, [users, stories]);

  // Recommended Stories (Önerilen Hikayeler)
  const recommendedStories = useMemo(() => {
    return [...availableStories]
      .sort((a, b) => (b.reads * 0.4 + b.likes * 0.6) - (a.reads * 0.4 + a.likes * 0.6))
      .slice(0, 8);
  }, [availableStories]);

  // Personalized Stories for user (Sana Özel - Okuma geçmişi ve ilgi duyduğu türlere göre)
  const personalizedStories = useMemo(() => {
    if (!availableStories.length) return [];
    
    const categoryWeights: Record<string, number> = {};
    if (currentUser) {
      currentUser.library?.forEach((item) => {
        const s = stories.find((st) => st.id === item.storyId);
        if (s?.category) {
          categoryWeights[s.category] = (categoryWeights[s.category] || 0) + 3;
        }
      });
      currentUser.readingProgress?.forEach((item) => {
        const s = stories.find((st) => st.id === item.storyId);
        if (s?.category) {
          categoryWeights[s.category] = (categoryWeights[s.category] || 0) + 2;
        }
      });
    }

    const preferredCategories = Object.keys(categoryWeights);

    if (preferredCategories.length > 0) {
      return [...availableStories]
        .filter((s) => preferredCategories.includes(s.category))
        .sort((a, b) => {
          const scoreA = (categoryWeights[a.category] || 0) + a.likes * 0.1;
          const scoreB = (categoryWeights[b.category] || 0) + b.likes * 0.1;
          return scoreB - scoreA;
        })
        .slice(0, 8);
    }

    return [...availableStories]
      .sort((a, b) => (b.likes * 2 + b.reads) - (a.likes * 2 + a.reads))
      .slice(0, 8);
  }, [currentUser, availableStories, stories]);

  // Short Stories Band (Kısa Hikayeler)
  const shortStories = useMemo(() => {
    return [...availableStories]
      .filter((s) => s.isShortStory || s.readingTimeMinutes <= 7 || s.chapters.length === 1)
      .sort((a, b) => {
        if (a.isShortStory !== b.isShortStory) return a.isShortStory ? -1 : 1;
        return b.likes - a.likes;
      })
      .slice(0, 8);
  }, [availableStories]);

  // Completed Stories (Tamamlanan Hikayeler) - Yalnızca Tamamlandı olarak işaretlenenler
  const completedStories = useMemo(() => {
    return availableStories
      .filter((s) => s.status === 'completed' || s.isCompleted === true)
      .sort((a, b) => b.reads - a.reads)
      .slice(0, 8);
  }, [availableStories]);

  // Filtered stories result
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
      
      {/* 1. Main Search & Categorization Bar (EN ÜSTTE) */}
      <section className="space-y-3.5">
        
        {/* Search Input & Control Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
            <input 
              type="text"
              value={filters.query}
              onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
              placeholder="Hikaye başlığı, yazar, konu veya #etiket ara..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-sm transition-all"
            />
            {filters.query && (
              <button 
                onClick={() => setFilters((prev) => ({ ...prev, query: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl border font-bold text-xs transition-all ${
                showAdvancedFilters || filters.status !== 'all' || filters.tag
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-300'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Gelişmiş Filtreler</span>
            </button>

            {/* Layout Mode Toggle */}
            <div className="flex items-center p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-2.5 rounded-xl transition-colors ${
                  layoutMode === 'grid' ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 font-bold' : 'text-slate-400'
                }`}
                title="Izgara Görünümü"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode('horizontal')}
                className={`p-2.5 rounded-xl transition-colors ${
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
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filters.category === cat
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800/80 hover:border-purple-300'
              }`}
            >
              {getCategoryIcon(cat)}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Popular Tags Chips Bar */}
        {popularTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-500" /> Etiketler:
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
                <SlidersHorizontal className="w-4 h-4" /> Arama ve Filtre Detayları
              </h4>
              <button 
                onClick={clearFilters}
                className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1"
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

      {/* Continue Reading Section (Okumaya Devam Et) */}
      {continueReadingList.length > 0 && !filters.query && filters.category === 'Tümü' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Okumaya Devam Et
            </h2>
            <span className="text-xs text-slate-400 font-medium">Kaldığın yerden sürdür</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {continueReadingList.slice(0, 3).map(({ story, lastChapterIndex }) => {
              const chapter = story.chapters[lastChapterIndex] || story.chapters[0];
              const totalChapters = story.chapters.length;

              return (
                <div
                  key={story.id}
                  onClick={() => openStoryReader(story.id, lastChapterIndex)}
                  className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/50 dark:hover:border-purple-500/50 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5 group"
                >
                  <img
                    src={story.coverUrl}
                    alt={story.title}
                    className="w-12 h-16 object-cover rounded-xl shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      {story.category}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      Kaldığın Bölüm: <span className="font-semibold text-slate-700 dark:text-slate-300">{chapter ? chapter.title : `Bölüm ${lastChapterIndex + 1}`}</span>
                    </p>
                    <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full"
                        style={{ width: `${Math.round(((lastChapterIndex + 1) / totalChapters) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openStoryReader(story.id, lastChapterIndex);
                    }}
                    className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md flex-shrink-0 group-hover:scale-110 transition-transform"
                    title="Devam Et"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Hero Featured Story Banner */}
      {featuredStory && !filters.query && filters.category === 'Tümü' && (
        <section className="relative rounded-3xl overflow-hidden bg-transparent backdrop-blur-md border border-purple-500/20 shadow-sm">
          <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col md:flex-row items-center gap-8 bg-transparent">
            
            {/* Left Info */}
            <div className="flex-1 space-y-4 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-500/20">
                  <Flame className="w-3.5 h-3.5" /> HAFTANIN POPÜLERİ
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-300 dark:border-purple-500/30">
                  {featuredStory.category}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {featuredStory.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed max-w-2xl font-light">
                {featuredStory.summary}
              </p>

              {/* Author and CTA */}
              <div className="pt-2 flex flex-wrap items-center gap-6">
                <div 
                  className="flex items-center gap-3 cursor-pointer group/author"
                  onClick={() => openAuthorProfile(featuredStory.authorId)}
                >
                  <img src={featuredStory.authorAvatar} alt={featuredStory.authorName} className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover/author:text-purple-600 dark:group-hover/author:text-purple-300 transition-colors">
                      {featuredStory.authorName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-purple-300/80">@{featuredStory.authorUsername}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openStoryReader(featuredStory.id)}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-500/30 hover:scale-105 transition-all duration-200"
                  >
                    Okumaya Başla
                  </button>
                  <button
                    onClick={() => openStoryDetail(featuredStory.id)}
                    className="px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-purple-400 font-bold text-xs transition-all"
                  >
                    Detaylar
                  </button>
                  <button
                    onClick={() => toggleLibraryStory(featuredStory.id)}
                    className={`p-2.5 rounded-2xl border transition-all ${
                      isStoryInLibrary(featuredStory.id)
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-purple-500'
                    }`}
                    title="Kütüphaneye Ekle"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Vertical Cover Preview */}
            <div className="w-32 sm:w-40 aspect-[2/3] flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-purple-500/20 transform rotate-1 hover:rotate-0 transition-transform duration-500 cursor-pointer" onClick={() => openStoryDetail(featuredStory.id)}>
              <img src={featuredStory.coverUrl} alt={featuredStory.title} className="w-full h-full object-cover" />
            </div>

          </div>
        </section>
      )}

      {/* Öne Çıkan Hikayeler Section (En Çok Beğenilen Hikayeler) */}
      {!filters.query && filters.category === 'Tümü' && mostLikedStories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500/20" />
              Öne Çıkan Hikayeler
            </h2>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-current text-rose-500" /> En Çok Beğenilen Kurgular
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {mostLikedStories.map((story, idx) => (
              <div key={`featured_story_${story.id}`} className="relative group">
                {idx < 3 && (
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-black shadow-md flex items-center gap-0.5">
                    <Crown className="w-3 h-3 fill-current" /> #{idx + 1}
                  </div>
                )}
                <StoryCard story={story} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sana Özel Section (Okuyucunun daha önce okuduğu hikayelerin türüne göre öneriler) */}
      {!filters.query && filters.category === 'Tümü' && personalizedStories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Sana Özel
            </h2>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Okuma geçmişine ve ilgi alanlarına göre
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {personalizedStories.map((story) => (
              <StoryCard key={`personalized_${story.id}`} story={story} />
            ))}
          </div>
        </section>
      )}

      {/* Kısa Hikayeler Öneri Bandı */}
      {!filters.query && filters.category === 'Tümü' && shortStories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-500 text-white shadow-sm">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Kısa Hikayeler
              </h2>
            </div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              ⚡ Tek Oturuşta Bitirebileceğiniz Kurgular
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {shortStories.map((story) => (
              <div key={`short_${story.id}`} className="relative group">
                <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-extrabold shadow-md flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 fill-current" /> Kısa
                </div>
                <StoryCard story={story} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended Stories Section (Önerilen Hikayeler) */}
      {!filters.query && filters.category === 'Tümü' && recommendedStories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Sizin İçin Önerilen Hikayeler
            </h2>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              Popüler Kurgular
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {recommendedStories.map((story) => (
              <StoryCard key={`rec_${story.id}`} story={story} />
            ))}
          </div>
        </section>
      )}

      {/* Completed Stories Section (Tamamlanan Hikayeler) */}
      {!filters.query && filters.category === 'Tümü' && completedStories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Tamamlanan Hikayeler
            </h2>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Final Yapan Kurgular
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {completedStories.map((story) => (
              <StoryCard key={`comp_${story.id}`} story={story} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Authors Spotlight ("Öne Çıkan Yazarlar" - En çok takipçisi olanlar) */}
      {!filters.query && filters.category === 'Tümü' && sortedFeaturedAuthors.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500 fill-amber-500/20" />
              Öne Çıkan Yazarlar
            </h2>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" /> En Çok Takip Edilen Kalemler
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedFeaturedAuthors.map((author, index) => {
              const isFollowing = currentUser?.following?.includes(author.id);
              const isSelf = currentUser?.id === author.id;
              const authorStoriesCount = stories.filter((s) => s.authorId === author.id && s.visibility === 'public').length;
              const followersCount = author.followers?.length || 0;

              return (
                <div 
                  key={author.id}
                  className={`relative p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex items-center gap-3.5 group ${
                    index === 0
                      ? 'border-amber-400/80 dark:border-amber-500/50 shadow-md ring-2 ring-amber-400/20'
                      : 'border-slate-100 dark:border-slate-800/80 hover:border-purple-200 dark:hover:border-purple-900/50 shadow-sm'
                  }`}
                >
                  {index < 3 && (
                    <div 
                      className={`absolute -top-2.5 left-4 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm ${
                        index === 0
                          ? 'bg-amber-500 text-white'
                          : index === 1
                            ? 'bg-slate-400 text-white'
                            : 'bg-amber-700 text-white'
                      }`}
                    >
                      <Crown className="w-3 h-3 fill-current" />
                      {index === 0 ? '1. Lider Yazar' : `${index + 1}. Sıra`}
                    </div>
                  )}

                  <div className="relative">
                    <img 
                      src={author.avatar} 
                      alt={author.name} 
                      className="w-13 h-13 rounded-xl object-cover ring-2 ring-purple-500/20 cursor-pointer"
                      onClick={() => openAuthorProfile(author.id)}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 
                      onClick={() => openAuthorProfile(author.id)}
                      className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer truncate flex items-center gap-1"
                    >
                      {author.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate mb-1">@{author.username}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <span className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-200/50 dark:border-purple-900/50">
                        {followersCount} Takipçi
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {authorStoriesCount} Hikaye
                      </span>
                    </div>
                  </div>

                  {!isSelf && (
                    <button
                      onClick={() => toggleFollowUser(author.id)}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                        isFollowing
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 hover:bg-purple-200'
                          : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm shadow-purple-500/20'
                      }`}
                      title={isFollowing ? 'Takipten Çık' : 'Takip Et'}
                    >
                      {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Stories Results Section */}
      <section className="space-y-6">
        
        {/* Active Filter Badges Bar */}
        {(filters.query || filters.category !== 'Tümü' || filters.tag || filters.status !== 'all') && (
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
                  className="p-0.5 rounded-full hover:bg-purple-700 transition-colors"
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
                  className="p-0.5 rounded-full hover:bg-indigo-700 transition-colors"
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
                  className="p-0.5 rounded-full hover:bg-slate-700 transition-colors"
                  title="Arama kelimesini temizle"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            <button 
              onClick={clearFilters}
              className="ml-auto text-xs text-rose-500 font-bold hover:underline"
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
                  : 'Tüm Hikayeler'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {filteredStories.length} hikaye listeleniyor
            </p>
          </div>

          {(filters.query || filters.category !== 'Tümü' || filters.tag) && (
            <button 
              onClick={clearFilters}
              className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>

        {filteredStories.length > 0 ? (
          <div className={
            layoutMode === 'grid' 
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4'
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
                Sitede Henüz Hikaye Bulunmuyor
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
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-8">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
              Hikaye Bulunamadı
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
              Arama kriterlerinize uygun hikaye bulunamadı. Lütfen kelimeleri değiştirmeyi veya filtreleri temizlemeyi deneyin.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-500/20"
            >
              Tüm Hikayeleri Göster
            </button>
          </div>
        )}
      </section>

    </div>
  );
};
