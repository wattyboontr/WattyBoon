import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  BookOpen, 
  Eye, 
  Heart, 
  Bookmark, 
  MessageSquare, 
  Share2, 
  Lock, 
  Globe, 
  Clock, 
  PenTool, 
  Play, 
  Sparkles,
  UserCheck,
  UserPlus,
  Send,
  Calendar,
  ListPlus,
  Flame,
  Trash2,
  Headphones,
  Zap,
  Music,
  ExternalLink,
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Hash,
  ShieldAlert,
  Flag
} from 'lucide-react';
import { AddToCustomListModal } from './AddToCustomListModal';
import { StoryCommentsSection } from './StoryCommentsSection';
import { StoryReportModal } from './StoryReportModal';
import { Story } from '../types';

export const StoryDetailView: React.FC = () => {
  const { 
    stories, 
    activeStoryId, 
    setActiveView, 
    openStoryReader, 
    openAuthorProfile, 
    openStoryEditor,
    toggleLibraryStory, 
    isStoryInLibrary, 
    toggleLikeStory, 
    toggleLikeChapter,
    addComment,
    toggleLikeComment,
    addReplyToComment,
    deleteStory,
    deleteChapter,
    deleteComment,
    currentUser,
    toggleFollowUser,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    setSelectedTagFilter,
    isNsfwEnabled,
    toggleNsfw
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [isCustomListModalOpen, setIsCustomListModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const story = stories.find((s) => s.id === activeStoryId);

  // Helper for Turkish locative suffixes (e.g. Romantik'te, Korku'da, Aşk'ta, Şiir'de)
  const getTurkishLocative = (word: string): string => {
    const clean = word.trim().replace(/^#/, '');
    if (!clean) return '';
    const lastVowelMatch = clean.match(/[aıoueiöüAIOUEIÖÜ][^aıoueiöüAIOUEIÖÜ]*$/);
    const lastVowel = lastVowelMatch ? lastVowelMatch[0][0].toLowerCase() : 'e';
    const isBack = ['a', 'ı', 'o', 'u'].includes(lastVowel);
    
    const lastChar = clean.slice(-1).toLowerCase();
    const isVoiceless = ['f', 's', 't', 'k', 'ç', 'ş', 'h', 'p'].includes(lastChar);
    
    const dOrT = isVoiceless ? 't' : 'd';
    const aOrE = isBack ? 'a' : 'e';
    
    return `'${dOrT}${aOrE}`;
  };

  // Score calculation for category and tag leaderboard rankings
  const getStoryScore = (s: Story) => {
    return (s.reads || 0) + (s.likes || 0) * 5 + (s.comments?.length || 0) * 2;
  };

  // Category Rank Calculation
  const categoryRankInfo = useMemo(() => {
    if (!story) return { rank: 1, total: 1 };
    const categoryStories = stories
      .filter((s) => s.category === story.category && s.visibility === 'public')
      .sort((a, b) => getStoryScore(b) - getStoryScore(a));

    const rankIndex = categoryStories.findIndex((s) => s.id === story.id);
    const rank = rankIndex !== -1 ? rankIndex + 1 : 1;
    const total = Math.max(categoryStories.length, 1);

    return { rank, total };
  }, [stories, story]);

  // Tag Ranks Calculation
  const tagRankInfos = useMemo(() => {
    if (!story || !story.tags || story.tags.length === 0) return [];

    return story.tags
      .map((tag) => {
        const cleanTag = tag.trim().replace(/^#/, '');
        const tagStories = stories
          .filter((s) => s.tags?.some((t) => t.toLowerCase() === cleanTag.toLowerCase()) && s.visibility === 'public')
          .sort((a, b) => getStoryScore(b) - getStoryScore(a));

        const rankIndex = tagStories.findIndex((s) => s.id === story.id);
        const rank = rankIndex !== -1 ? rankIndex + 1 : 1;
        const total = Math.max(tagStories.length, 1);

        return {
          tag: cleanTag,
          rank,
          total,
        };
      })
      .sort((a, b) => a.rank - b.rank);
  }, [stories, story]);

  if (!story) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Hikaye Bulunamadı</h2>
        <button 
          onClick={() => setActiveView('explore')}
          className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
        >
          Keşfet'e Dön
        </button>
      </div>
    );
  }

  const isSaved = isStoryInLibrary(story.id);
  const isLiked = currentUser ? story.likedBy.includes(currentUser.id) : false;
  const isAuthor = currentUser?.id === story.authorId;
  const isFollowingAuthor = currentUser && Array.isArray(currentUser.following) ? currentUser.following.includes(story.authorId) : false;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(story.id, commentText);
    setCommentText('');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: story.summary,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Hikaye bağlantısı kopyalandı!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in pb-24 md:pb-12">
      
      {/* Top Back Navigation */}
      <button
        onClick={() => setActiveView('explore')}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Keşfet'e Dön
      </button>

      {/* Main Story Hero Header */}
      <section className="relative rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 shadow-xl overflow-hidden p-6 sm:p-8">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
          
          {/* Vertical Story Cover Image */}
          <div className="relative w-32 sm:w-44 aspect-[2/3] flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-purple-500/20 bg-slate-100 dark:bg-slate-800 mx-auto md:mx-0">
            <img 
              src={story.coverUrl} 
              alt={story.title} 
              className={`w-full h-full object-cover transition-all duration-300 ${
                story.isNsfw && !isNsfwEnabled ? 'blur-md filter scale-110 brightness-75' : ''
              }`} 
            />

            {story.isNsfw && (
              <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-md bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs shadow-md border border-white/20 tracking-tighter">
                +18
              </div>
            )}

            {story.isNsfw && !isNsfwEnabled && (
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm p-3 flex flex-col items-center justify-center text-center gap-2 z-10">
                <Flame className="w-6 h-6 text-rose-500 animate-pulse" />
                <span className="text-[10px] font-extrabold text-rose-300 uppercase tracking-wider">+18 İçerik</span>
                <button
                  onClick={toggleNsfw}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow-md transition-all"
                >
                  Blur'u Kaldır
                </button>
              </div>
            )}
          </div>

          {/* Story Details & Meta Info */}
          <div className="flex-1 space-y-4 w-full">
            
            {/* Badges Bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                {story.category}
              </span>

              {/* Category Ranking Badge */}
              <button
                onClick={() => {
                  setSelectedCategoryFilter(story.category);
                  setActiveView('explore');
                }}
                className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-purple-500/15 hover:from-amber-500/25 hover:to-purple-500/25 text-amber-800 dark:text-amber-300 font-extrabold border border-amber-500/30 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-95"
                title={`${story.category} kategorisindeki sıralaması: #${categoryRankInfo.rank}`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30" />
                <span>{story.category}{getTurkishLocative(story.category)} {categoryRankInfo.rank}. sırada</span>
              </button>

              {story.isShortStory && (
                <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white font-extrabold shadow-sm flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" /> Kısa Hikaye
                </span>
              )}

              {story.isNsfw && (
                <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-black shadow-sm flex items-center gap-1">
                  +18
                </span>
              )}

              <span className={`px-2.5 py-1 rounded-full font-semibold ${
                story.status === 'completed'
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}>
                {story.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
              </span>

              {story.visibility === 'private' ? (
                <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-500" /> Özel Hikaye
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
                  <Globe className="w-3 h-3 text-emerald-500" /> Herkes Görebilir
                </span>
              )}

              <span className="text-slate-400 text-xs flex items-center gap-1 ml-auto">
                <Clock className="w-3.5 h-3.5" /> ~{story.readingTimeMinutes} dk okuma
              </span>
            </div>

            {/* Story Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              {story.title}
            </h1>

            {/* Author Profile Bar */}
            <div className="flex items-center justify-between gap-4 py-2 border-y border-slate-100 dark:border-slate-800/80">
              <div 
                className="flex items-center gap-3 cursor-pointer group/auth"
                onClick={() => openAuthorProfile(story.authorId)}
              >
                <img src={story.authorAvatar} alt={story.authorName} className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover/auth:text-purple-600 dark:group-hover/auth:text-purple-400 transition-colors">
                    {story.authorName}
                  </h4>
                  <p className="text-xs text-purple-600 dark:text-purple-400">@{story.authorUsername}</p>
                </div>
              </div>

              {!isAuthor && (
                <button
                  onClick={() => toggleFollowUser(story.authorId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isFollowingAuthor
                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300'
                      : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                  }`}
                >
                  {isFollowingAuthor ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" /> Takip Ediliyor
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" /> Takip Et
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Key Stats Bar */}
            <div className="grid grid-cols-4 gap-2 text-center py-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <span className="block text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-blue-500" /> {story.reads}
                </span>
                <span className="text-[10px] text-slate-400">Okuma</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> {story.likes}
                </span>
                <span className="text-[10px] text-slate-400">Beğeni</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-purple-500" /> {story.chapters.length}
                </span>
                <span className="text-[10px] text-slate-400">Bölüm</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-500" /> {story.comments.length}
                </span>
                <span className="text-[10px] text-slate-400">Yorum</span>
              </div>
            </div>

            {/* Category & Tag Leaderboard Rankings Showcase */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-indigo-500/10 dark:from-slate-800/90 dark:via-slate-800/60 dark:to-purple-950/40 border border-amber-500/30 dark:border-amber-500/20 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-amber-500 text-white shadow-xs">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      Tür ve Etiket Sıralamaları
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Okunma ve beğeni etkileşimine dayalı anlık liste
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-300/80 dark:border-amber-900/60">
                  <TrendingUp className="w-3 h-3" /> Anlık Dereceler
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* Category Rank Badge */}
                <button
                  onClick={() => {
                    setSelectedCategoryFilter(story.category);
                    setActiveView('explore');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-400/90 dark:border-amber-500/50 shadow-xs hover:border-amber-500 hover:scale-[1.02] active:scale-95 transition-all text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer group"
                  title={`${story.category} kategorisindeki tüm eserleri gör`}
                >
                  <div className="w-5.5 h-5.5 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-400 text-white font-black text-[11px] flex items-center justify-center shadow-xs">
                    #{categoryRankInfo.rank}
                  </div>
                  <div className="text-left">
                    <p className="text-purple-700 dark:text-purple-300 font-black text-xs group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {story.category}{getTurkishLocative(story.category)} {categoryRankInfo.rank}. sırada
                    </p>
                    <p className="text-[10px] text-slate-400 font-normal">
                      {categoryRankInfo.total} hikaye arasında
                    </p>
                  </div>
                </button>

                {/* Tag Rank Badges */}
                {tagRankInfos.map((tr) => (
                  <button
                    key={tr.tag}
                    onClick={() => {
                      setSelectedTagFilter(tr.tag);
                      setActiveView('explore');
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/80 shadow-xs hover:border-purple-500 hover:scale-[1.02] active:scale-95 transition-all text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer group"
                    title={`#${tr.tag} etiketindeki sıralama (${tr.total} hikaye arasında)`}
                  >
                    <div className={`w-5.5 h-5.5 rounded-lg font-black text-[11px] flex items-center justify-center shadow-xs ${
                      tr.rank === 1
                        ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-white'
                        : tr.rank === 2
                          ? 'bg-gradient-to-tr from-slate-500 to-slate-400 text-white'
                          : tr.rank === 3
                            ? 'bg-gradient-to-tr from-amber-700 to-amber-600 text-white'
                            : 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                    }`}>
                      #{tr.rank}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        #{tr.tag}{getTurkishLocative(tr.tag)} {tr.rank}. sırada
                      </p>
                      <p className="text-[10px] text-slate-400 font-normal">
                        {tr.total} hikaye arasında
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => openStoryReader(story.id, 0)}
                className="flex-1 min-w-[140px] py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-500/25 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Okumaya Başla
              </button>

              <button
                onClick={() => toggleLibraryStory(story.id)}
                className={`py-3 px-4 rounded-2xl border font-bold text-xs transition-all flex items-center gap-2 ${
                  isSaved
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-purple-300'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Kütüphanede' : 'Kütüphaneye Ekle'}
              </button>

              <button
                onClick={() => setIsCustomListModalOpen(true)}
                className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-purple-300 font-bold text-xs transition-all flex items-center gap-2"
                title="Listeye Ekle"
              >
                <ListPlus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Listeye Ekle
              </button>

              <button
                onClick={() => toggleLikeStory(story.id)}
                className={`p-3 rounded-2xl border transition-all ${
                  isLiked
                    ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-300'
                }`}
                title="Hikayeyi Beğen"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-purple-300 transition-all"
                title="Paylaş"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {!isAuthor && (
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="py-3 px-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:border-rose-300 font-bold text-xs transition-all flex items-center gap-1.5"
                  title="Çalıntı veya uygunsuz içerik şikayet et"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span className="hidden sm:inline">Rapor Et</span>
                </button>
              )}

              {isAuthor && (
                <>
                  <button
                    onClick={() => openStoryEditor(story.id)}
                    className="py-3 px-4 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors flex items-center gap-1.5"
                  >
                    <PenTool className="w-3.5 h-3.5" /> Düzenle
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`"${story.title}" hikayesini tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
                        deleteStory(story.id);
                      }
                    }}
                    className="py-3 px-4 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-200 dark:hover:bg-rose-900 transition-colors flex items-center gap-1.5"
                    title="Hikayeyi Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Sil
                  </button>
                </>
              )}
            </div>

          </div>

        </div>

      </section>

      {/* Story Summary & Tags */}
      <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Hikayenin Özeti ve Konusu
        </h3>

        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-line">
          {story.summary}
        </p>

        {/* Music Link Widget */}
        {story.musicUrl && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900/40 via-slate-900 to-purple-900/40 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-emerald-400 block">Yazarın Müzik Listesi / Şarkısı</span>
                <span className="text-[11px] text-slate-300">Yazar bu hikayeyi kurgularken bu parçayı dinledi.</span>
              </div>
            </div>
            <a
              href={story.musicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 shrink-0 transition-all shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Dinle</span>
            </a>
          </div>
        )}

        {tagRankInfos.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Etiketler & Etiket Sıralamaları
            </span>
            <div className="flex flex-wrap gap-2">
              {tagRankInfos.map((tr) => (
                <button 
                  key={tr.tag}
                  onClick={() => {
                    setSelectedTagFilter(tr.tag);
                    setActiveView('explore');
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/60 hover:bg-purple-600 hover:text-white transition-all cursor-pointer flex items-center gap-2 group"
                  title={`#${tr.tag} etiketli hikayeleri gör (${tr.tag}${getTurkishLocative(tr.tag)} ${tr.rank}. sırada)`}
                >
                  <span className="font-bold">#{tr.tag}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-purple-200/80 dark:bg-purple-800/80 text-purple-900 dark:text-purple-100 text-[10px] font-black group-hover:bg-white group-hover:text-purple-700 transition-colors">
                    #{tr.rank}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Chapters List with Per-Chapter Like Buttons */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Bölüm Listesi ({story.chapters.length})
          </h3>
          <span className="text-xs text-slate-400">Her bölümü inceleyip okuyabilirsiniz</span>
        </div>

        <div className="space-y-3">
          {story.chapters.map((chapter, index) => {
            const chapLikes = chapter.likes || 0;
            const hasLikedChap = currentUser ? (chapter.likedBy || []).includes(currentUser.id) : false;

            return (
              <div
                key={chapter.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-sm hover:border-purple-200 dark:hover:border-purple-900/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    {chapter.order}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 
                      onClick={() => openStoryReader(story.id, index)}
                      className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer truncate"
                    >
                      {chapter.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {chapter.readCount} okuma
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {chapter.createdAt}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  {/* Per Chapter Like Button */}
                  <button
                    onClick={() => toggleLikeChapter(story.id, index)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      hasLikedChap
                        ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-rose-300'
                    }`}
                    title="Bu Bölümü Beğen"
                  >
                    <Heart className={`w-3.5 h-3.5 ${hasLikedChap ? 'fill-current text-rose-500' : ''}`} />
                    <span>{chapLikes}</span>
                  </button>

                  <button
                    onClick={() => openStoryReader(story.id, index)}
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Bölümü Oku
                  </button>

                  {isAuthor && (
                    <button
                      onClick={() => {
                        if (window.confirm(`"${chapter.title || `Bölüm ${index + 1}`}" bölümünü silmek istediğinize emin misiniz?`)) {
                          deleteChapter(story.id, index);
                        }
                      }}
                      className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-900 transition-all"
                      title="Bölümü Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Story Comments Section */}
      <StoryCommentsSection storyId={story.id} chapterIndex={0} />

      <AddToCustomListModal
        story={story}
        isOpen={isCustomListModalOpen}
        onClose={() => setIsCustomListModalOpen(false)}
      />

      <StoryReportModal
        story={story}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

    </div>
  );
};


