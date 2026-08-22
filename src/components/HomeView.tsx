import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StoryCard } from './StoryCard';
import { 
  Sparkles, 
  Flame, 
  Clock, 
  Play, 
  BookOpen, 
  Eye, 
  CheckCircle2, 
  Heart, 
  Crown, 
  Zap, 
  ChevronLeft,
  ChevronRight,
  PenTool,
  Bookmark,
  TrendingUp
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { 
    stories, 
    currentUser, 
    openStoryDetail, 
    openStoryReader, 
    openAuthorProfile, 
    toggleLibraryStory, 
    isStoryInLibrary, 
    openStoryEditor
  } = useApp();

  // Public stories available to current user
  const availableStories = useMemo(() => {
    return stories.filter((s) => {
      const isVisible = s.visibility === 'public' || (currentUser && s.authorId === currentUser.id);
      return isVisible;
    });
  }, [stories, currentUser]);

  // Top Featured Stories for Hero Slider
  const sliderStories = useMemo(() => {
    if (!availableStories.length) return [];
    return [...availableStories]
      .sort((a, b) => (b.reads * 1.5 + b.likes * 3) - (a.reads * 1.5 + a.likes * 3))
      .slice(0, 5);
  }, [availableStories]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Auto-advance slider every 6 seconds
  useEffect(() => {
    if (!isAutoPlay || sliderStories.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderStories.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlay, sliderStories.length]);

  const nextSlide = () => {
    if (!sliderStories.length) return;
    setCurrentSlide((prev) => (prev + 1) % sliderStories.length);
  };

  const prevSlide = () => {
    if (!sliderStories.length) return;
    setCurrentSlide((prev) => (prev - 1 + sliderStories.length) % sliderStories.length);
  };

  const activeStory = sliderStories[currentSlide] || sliderStories[0];

  // Stories to Continue Reading (Okumaya Devam Et)
  const continueReadingList = useMemo(() => {
    if (!currentUser) return [];
    const progressList = Array.isArray(currentUser.readingProgress) ? currentUser.readingProgress : [];
    if (!progressList.length) return [];
    return progressList
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

  // Recommended Stories (Sizin İçin Önerilenler)
  const recommendedStories = useMemo(() => {
    return [...availableStories]
      .sort((a, b) => (b.reads * 0.4 + b.likes * 0.6) - (a.reads * 0.4 + a.likes * 0.6))
      .slice(0, 6);
  }, [availableStories]);

  // Trending & Most Liked Stories (Öne Çıkanlar & Trendler)
  const mostLikedStories = useMemo(() => {
    return [...availableStories]
      .sort((a, b) => {
        if (b.likes !== a.likes) return b.likes - a.likes;
        return b.reads - a.reads;
      })
      .slice(0, 6);
  }, [availableStories]);

  // Personalized Stories for user (Sana Özel)
  const personalizedStories = useMemo(() => {
    if (!availableStories.length) return [];
    
    const categoryWeights: Record<string, number> = {};
    if (currentUser) {
      const userLib = Array.isArray(currentUser.library) ? currentUser.library : [];
      userLib.forEach((item) => {
        const s = stories.find((st) => st.id === item.storyId);
        if (s?.category) {
          categoryWeights[s.category] = (categoryWeights[s.category] || 0) + 3;
        }
      });
      const userProg = Array.isArray(currentUser.readingProgress) ? currentUser.readingProgress : [];
      userProg.forEach((item) => {
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
        .slice(0, 6);
    }

    return [...availableStories]
      .sort((a, b) => (b.likes * 2 + b.reads) - (a.likes * 2 + a.reads))
      .slice(0, 6);
  }, [currentUser, availableStories, stories]);

  // Short Stories (Kısa Hikayeler)
  const shortStories = useMemo(() => {
    return [...availableStories]
      .filter((s) => s.isShortStory || s.readingTimeMinutes <= 7 || s.chapters.length === 1)
      .sort((a, b) => {
        if (a.isShortStory !== b.isShortStory) return a.isShortStory ? -1 : 1;
        return b.likes - a.likes;
      })
      .slice(0, 6);
  }, [availableStories]);

  // Completed Stories (Tamamlanan Hikayeler)
  const completedStories = useMemo(() => {
    return availableStories
      .filter((s) => s.status === 'completed' || s.isCompleted === true)
      .sort((a, b) => b.reads - a.reads)
      .slice(0, 6);
  }, [availableStories]);

  // New Releases (Son Eklenenler)
  const latestStories = useMemo(() => {
    return [...availableStories]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 12);
  }, [availableStories]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 animate-fade-in pb-24 md:pb-12">
      
      {/* 1. Interactive Hero Slider (Vitrin Slider) */}
      {sliderStories.length > 0 && activeStory && (
        <section 
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/60 dark:from-slate-900 dark:via-slate-900/95 dark:to-purple-950/40 border border-purple-200/80 dark:border-purple-900/60 shadow-xl shadow-purple-500/5 transition-all group/slider"
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
        >
          {/* Ambient Glows */}
          <div className="absolute top-0 -left-12 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/20 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 -right-12 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full filter blur-3xl pointer-events-none" />

          {/* Navigation Arrows */}
          {sliderStories.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 shadow-lg transition-all opacity-0 group-hover/slider:opacity-100 cursor-pointer"
                title="Önceki Hikaye"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 shadow-lg transition-all opacity-0 group-hover/slider:opacity-100 cursor-pointer"
                title="Sonraki Hikaye"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="relative z-10 p-5 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 lg:gap-10">
            
            {/* Story Cover */}
            <div 
              onClick={() => openStoryDetail(activeStory.id)}
              className="relative w-48 sm:w-56 md:w-52 lg:w-64 aspect-[2/3] flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-purple-500/25 dark:ring-purple-500/30 group cursor-pointer transform hover:-translate-y-1 hover:shadow-purple-500/20 transition-all duration-300 mx-auto md:mx-0 bg-slate-200 dark:bg-slate-800"
            >
              <img 
                src={activeStory.coverUrl} 
                alt={activeStory.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />

              {activeStory.isNsfw && (
                <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-md bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs shadow-lg border border-white/25 tracking-tighter">
                  +18
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-bold pointer-events-none">
                <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md">
                  <BookOpen className="w-3 h-3 text-purple-300" />
                  {activeStory.chapters.length} Bölüm
                </span>
                <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md">
                  <Eye className="w-3 h-3 text-blue-300" />
                  {activeStory.reads > 1000 ? `${(activeStory.reads / 1000).toFixed(1)}k` : activeStory.reads}
                </span>
              </div>
            </div>

            {/* Story Details & Actions */}
            <div className="flex-1 space-y-4 text-center md:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white text-xs font-black shadow-md shadow-purple-500/25 tracking-wide">
                  <Crown className="w-3.5 h-3.5 fill-current" /> ÖNE ÇIKAN SLIDER #{currentSlide + 1}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
                  {activeStory.category}
                </span>
                {(activeStory.status === 'completed' || activeStory.isCompleted) && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tamamlandı
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-purple-500" /> ~{activeStory.readingTimeMinutes || 5} dk okuma
                </span>
              </div>

              <h1 
                onClick={() => openStoryDetail(activeStory.id)}
                className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors"
              >
                {activeStory.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 sm:line-clamp-4 leading-relaxed font-normal">
                {activeStory.summary}
              </p>

              {/* Author & CTA Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/60 dark:border-slate-800/80">
                <div 
                  className="flex items-center gap-3 cursor-pointer group/author"
                  onClick={() => openAuthorProfile(activeStory.authorId)}
                >
                  <img 
                    src={activeStory.authorAvatar} 
                    alt={activeStory.authorName} 
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500 shadow-md group-hover/author:scale-105 transition-transform" 
                  />
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover/author:text-purple-600 dark:group-hover/author:text-purple-300 transition-colors">
                      {activeStory.authorName}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">@{activeStory.authorUsername}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => openStoryReader(activeStory.id)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Okumaya Başla</span>
                  </button>
                  <button
                    onClick={() => openStoryDetail(activeStory.id)}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-purple-400 font-bold text-xs transition-all cursor-pointer"
                  >
                    Detaylar
                  </button>
                  <button
                    onClick={() => toggleLibraryStory(activeStory.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isStoryInLibrary(activeStory.id)
                        ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-purple-500 hover:text-purple-600'
                    }`}
                    title={isStoryInLibrary(activeStory.id) ? 'Kütüphaneden Çıkar' : 'Kütüphaneye Ekle'}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Slider Pagination Dots & Mini Thumbnails */}
              {sliderStories.length > 1 && (
                <div className="pt-2 flex items-center justify-center md:justify-start gap-2">
                  {sliderStories.map((s, idx) => (
                    <button
                      key={`slide_dot_${s.id}`}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === currentSlide
                          ? 'w-8 bg-purple-600 dark:bg-purple-400'
                          : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                      }`}
                      title={s.title}
                    />
                  ))}
                </div>
              )}

            </div>

          </div>
        </section>
      )}

      {/* 2. Sizin İçin Önerilen Hikayeler (Recommended Stories) */}
      {recommendedStories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Sizin İçin Önerilen Hikayeler
            </h2>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> En Çok Sevilen Eserler
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {recommendedStories.map((story) => (
              <StoryCard key={`home_rec_${story.id}`} story={story} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Continue Reading Section (Okumaya Devam Et) */}
      {continueReadingList.length > 0 && (
        <section className="space-y-3.5">
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
                    className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md flex-shrink-0 group-hover:scale-110 transition-transform cursor-pointer"
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

      {/* 4. Öne Çıkan Hikayeler (En Çok Beğenilenler & Trendler) */}
      {mostLikedStories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500/20" />
              Trend & Popüler Hikayeler
            </h2>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-current text-rose-500" /> En Çok Beğenilenler
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {mostLikedStories.map((story, idx) => (
              <div key={`home_featured_${story.id}`} className="relative group">
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

      {/* 5. Sana Özel Section (Personalized Stories) */}
      {personalizedStories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Sana Özel Kurgular
            </h2>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> İlgi alanlarına ve okuma zevkine göre
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {personalizedStories.map((story) => (
              <StoryCard key={`home_pers_${story.id}`} story={story} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Kısa Hikayeler Bandı (Short Stories) */}
      {shortStories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-500 text-white shadow-sm">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Kısa Hikayeler
              </h2>
            </div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              ⚡ Tek Oturuşta Bitirebileceğiniz Kurgular
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {shortStories.map((story) => (
              <div key={`home_short_${story.id}`} className="relative group">
                <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-extrabold shadow-md flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 fill-current" /> Kısa
                </div>
                <StoryCard story={story} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Tamamlanan Hikayeler (Completed Stories) */}
      {completedStories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Tamamlanan Hikayeler
            </h2>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Final Yapan Kurgular
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {completedStories.map((story) => (
              <StoryCard key={`home_comp_${story.id}`} story={story} />
            ))}
          </div>
        </section>
      )}

      {/* 8. Son Yayınlanan Hikayeler Vitrini */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Yeni Eklenen Hikayeler
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Topluluk tarafından en son eklenen ve güncellenen kurgular
            </p>
          </div>
        </div>

        {latestStories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {latestStories.map((story) => (
              <StoryCard key={`home_latest_${story.id}`} story={story} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-8 space-y-4">
            <PenTool className="w-12 h-12 text-purple-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Henüz Hikaye Eklenmedi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              İlk hikayeyi yazıp WattyBoon topluluğuna katılan ilk yazar olabilirsin!
            </p>
            <button
              onClick={() => openStoryEditor(null)}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 cursor-pointer"
            >
              Hikaye Yazmaya Başla
            </button>
          </div>
        )}
      </section>

    </div>
  );
};
