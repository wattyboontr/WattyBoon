import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FormattedContent } from './FormattedContent';
import { GraphCommentWidget } from './GraphCommentWidget';
import { 
  ArrowLeft, 
  BookOpen, 
  Heart, 
  Bookmark, 
  Share2, 
  Settings, 
  MessageSquare, 
  Send, 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  User, 
  Clock,
  Sun,
  Moon,
  X,
  ThumbsUp,
  Maximize2,
  Minimize2,
  Type,
  Copy,
  MessageSquarePlus,
  Quote,
  Info,
  Trash2,
  Headphones,
  Music,
  Volume2,
  ExternalLink,
  Zap
} from 'lucide-react';

export const StoryReader: React.FC = () => {
  const { 
    activeStoryId, 
    activeChapterIndex, 
    stories, 
    openStoryReader, 
    openStoryDetail,
    setActiveView, 
    toggleLikeStory, 
    toggleLikeChapter,
    toggleLibraryStory, 
    isStoryInLibrary, 
    addComment, 
    deleteComment,
    currentUser, 
    openAuthorProfile,
    isDarkMode,
    toggleDarkMode,
    paragraphComments,
    addParagraphComment,
    toggleLikeParagraphComment,
    deleteParagraphComment
  } = useApp();

  const story = stories.find((s) => s.id === activeStoryId) || stories[0];
  const [commentInput, setCommentInput] = useState('');
  const [showReaderSettings, setShowReaderSettings] = useState(false);

  // Paragraph Comment Modal State
  const [openParagraphIndex, setOpenParagraphIndex] = useState<number | null>(null);
  const [paragraphCommentInput, setParagraphCommentInput] = useState('');
  const [selectedTextForComment, setSelectedTextForComment] = useState<string>('');

  // Right-Click Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    paragraphIndex: number;
    selectedText: string;
  } | null>(null);

  // Floating Selection Popover State (for mobile & desktop text highlighting)
  const [floatingSelection, setFloatingSelection] = useState<{
    x: number;
    y: number;
    paragraphIndex: number;
    selectedText: string;
  } | null>(null);

  // Close context menu on click outside or scroll
  useEffect(() => {
    const handleCloseMenus = () => {
      setContextMenu(null);
    };
    window.addEventListener('click', handleCloseMenus);
    window.addEventListener('scroll', handleCloseMenus);
    return () => {
      window.removeEventListener('click', handleCloseMenus);
      window.removeEventListener('scroll', handleCloseMenus);
    };
  }, []);

  // Reader Customization Preferences
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl' | '2xl'>('lg');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'display' | 'mono'>('serif');
  const [readerTheme, setReaderTheme] = useState<'light' | 'sepia' | 'dark' | 'navy'>('dark');
  const [lineHeight, setLineHeight] = useState<'tight' | 'normal' | 'relaxed'>('normal');
  const [containerWidth, setContainerWidth] = useState<'narrow' | 'medium' | 'wide'>('medium');

  if (!story) {
    return (
      <div className="p-12 text-center">
        <p>Hikaye bulunamadı.</p>
        <button onClick={() => setActiveView('explore')} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs">
          Keşfet’e Dön
        </button>
      </div>
    );
  }

  const currentChapter = story.chapters[activeChapterIndex] || story.chapters[0];
  const activeMusicUrl = currentChapter?.musicUrl || story.musicUrl;
  const isSaved = isStoryInLibrary(story.id);
  const isLiked = currentUser ? story.likedBy.includes(currentUser.id) : false;
  const isChapterLiked = currentUser ? (currentChapter?.likedBy || []).includes(currentUser.id) : false;

  const handleNextChapter = () => {
    if (activeChapterIndex < story.chapters.length - 1) {
      openStoryReader(story.id, activeChapterIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevChapter = () => {
    if (activeChapterIndex > 0) {
      openStoryReader(story.id, activeChapterIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(story.id, commentInput);
    setCommentInput('');
  };

  const handleParagraphCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (openParagraphIndex === null || !paragraphCommentInput.trim()) return;
    addParagraphComment(
      story.id,
      activeChapterIndex,
      openParagraphIndex,
      paragraphCommentInput,
      selectedTextForComment || undefined
    );
    setParagraphCommentInput('');
  };

  const handleParagraphContextMenu = (e: React.MouseEvent, pIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    const selectionText = window.getSelection()?.toString().trim() || '';
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 240),
      y: Math.min(e.clientY, window.innerHeight - 180),
      paragraphIndex: pIdx,
      selectedText: selectionText,
    });
    setFloatingSelection(null);
  };

  const handleParagraphMouseUp = (e: React.MouseEvent, pIdx: number) => {
    const selection = window.getSelection();
    const str = selection?.toString().trim() || '';
    if (str && str.length > 1) {
      try {
        const range = selection?.getRangeAt(0);
        if (range) {
          const rect = range.getBoundingClientRect();
          setFloatingSelection({
            x: Math.max(10, Math.min(rect.left + rect.width / 2 - 80, window.innerWidth - 200)),
            y: Math.max(10, rect.top - 50),
            paragraphIndex: pIdx,
            selectedText: str,
          });
        }
      } catch (err) {
        // fallback
      }
    } else {
      setFloatingSelection(null);
    }
  };

  const openCommentForSelectedText = (pIdx: number, selText: string) => {
    setSelectedTextForComment(selText);
    setOpenParagraphIndex(pIdx);
    setContextMenu(null);
    setFloatingSelection(null);
  };

  // Theme Styling Classes
  const readerThemeClasses = {
    light: 'bg-white text-slate-900 border-slate-200',
    sepia: 'bg-[#fbf0d9] text-[#423223] border-[#e8d7b7]',
    dark: 'bg-slate-950 text-slate-100 border-slate-800',
    navy: 'bg-[#0b0f19] text-slate-100 border-indigo-950',
  }[readerTheme];

  const fontSizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  }[fontSize];

  const fontFamilyClasses = {
    serif: 'font-serif',
    sans: 'font-sans',
    display: 'font-display',
    mono: 'font-mono',
  }[fontFamily];

  const lineHeightClasses = {
    tight: 'leading-normal',
    normal: 'leading-relaxed',
    relaxed: 'leading-loose',
  }[lineHeight];

  const containerWidthClasses = {
    narrow: 'max-w-xl',
    medium: 'max-w-3xl',
    wide: 'max-w-5xl',
  }[containerWidth];

  // Split chapter content into paragraphs
  const rawParagraphs = currentChapter?.content
    ? currentChapter.content.split(/\n+/).map((p) => p.trim()).filter((p) => p.length > 0)
    : [];

  return (
    <div className={`min-h-screen transition-colors duration-200 pb-28 md:pb-16 ${readerThemeClasses}`}>
      
      {/* Top Reader Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-purple-100 dark:border-purple-900/30 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          
          <button
            onClick={() => openStoryDetail(story.id)}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Hikaye Detayı</span>
          </button>

          {/* Center Story Title & Chapter Info */}
          <div className="text-center min-w-0 flex-1 px-2">
            <h2 className="text-xs sm:text-sm font-bold truncate text-slate-900 dark:text-slate-100">{story.title}</h2>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium truncate">
              {currentChapter?.title || `Bölüm ${activeChapterIndex + 1}`}
            </p>
          </div>

          {/* Right Tools */}
          <div className="flex items-center gap-2">
            
            {/* Global Day/Night Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-purple-600 transition-colors"
              title={isDarkMode ? 'Gündüz Moduna Geç' : 'Gece Moduna Geç'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
            </button>

            <button
              onClick={() => toggleLibraryStory(story.id)}
              className={`p-2 rounded-xl transition-all ${
                isSaved ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300'
              }`}
              title="Kütüphaneye Ekle"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => setShowReaderSettings(!showReaderSettings)}
              className="p-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-bold text-xs flex items-center gap-1 shadow-md shadow-purple-500/20"
              title="Okuma Ekranı Özelleştir"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Görünüm</span>
            </button>
          </div>

        </div>

        {/* Reader Customization Dropdown Panel */}
        {showReaderSettings && (
          <div className="max-w-4xl mx-auto mt-3 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 shadow-2xl animate-fade-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
            
            {/* Font Size */}
            <div>
              <label className="block font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                <Type className="w-3.5 h-3.5 text-purple-500" /> Yazı Boyutu
              </label>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {(['sm', 'base', 'lg', 'xl', '2xl'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setFontSize(sz)}
                    className={`flex-1 py-1 rounded-lg font-bold uppercase text-[10px] transition-all ${
                      fontSize === sz ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="block font-bold text-slate-500 mb-1.5">Yazı Tipi</label>
              <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setFontFamily('serif')}
                  className={`py-1 px-2 rounded-lg font-serif font-bold text-[11px] transition-all ${
                    fontFamily === 'serif' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Serif (Edebi)
                </button>
                <button
                  onClick={() => setFontFamily('sans')}
                  className={`py-1 px-2 rounded-lg font-sans font-bold text-[11px] transition-all ${
                    fontFamily === 'sans' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Sans (Modern)
                </button>
              </div>
            </div>

            {/* Reader Theme */}
            <div>
              <label className="block font-bold text-slate-500 mb-1.5">Arka Plan Teması</label>
              <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setReaderTheme('light')}
                  className={`py-1 rounded-lg font-bold text-[10px] bg-white text-slate-900 border ${
                    readerTheme === 'light' ? 'ring-2 ring-purple-600' : ''
                  }`}
                >
                  Gündüz
                </button>
                <button
                  onClick={() => setReaderTheme('sepia')}
                  className={`py-1 rounded-lg font-bold text-[10px] bg-[#fbf0d9] text-[#423223] ${
                    readerTheme === 'sepia' ? 'ring-2 ring-purple-600' : ''
                  }`}
                >
                  Sepya
                </button>
                <button
                  onClick={() => setReaderTheme('dark')}
                  className={`py-1 rounded-lg font-bold text-[10px] bg-slate-950 text-slate-100 ${
                    readerTheme === 'dark' ? 'ring-2 ring-purple-600' : ''
                  }`}
                >
                  Gece
                </button>
                <button
                  onClick={() => setReaderTheme('navy')}
                  className={`py-1 rounded-lg font-bold text-[10px] bg-[#0b0f19] text-indigo-200 ${
                    readerTheme === 'navy' ? 'ring-2 ring-purple-600' : ''
                  }`}
                >
                  Koyu Mavi
                </button>
              </div>
            </div>

            {/* Line Height */}
            <div>
              <label className="block font-bold text-slate-500 mb-1.5">Satır Aralığı</label>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {(['tight', 'normal', 'relaxed'] as const).map((lh) => (
                  <button
                    key={lh}
                    onClick={() => setLineHeight(lh)}
                    className={`flex-1 py-1 rounded-lg font-bold text-[10px] capitalize transition-all ${
                      lineHeight === lh ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {lh === 'tight' ? 'Sıkı' : lh === 'normal' ? 'Normal' : 'Rahat'}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Width */}
            <div>
              <label className="block font-bold text-slate-500 mb-1.5">Sayfa Genişliği</label>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {(['narrow', 'medium', 'wide'] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => setContainerWidth(w)}
                    className={`flex-1 py-1 rounded-lg font-bold text-[10px] capitalize transition-all ${
                      containerWidth === w ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {w === 'narrow' ? 'Dar' : w === 'medium' ? 'Orta' : 'Geniş'}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}
      </header>

      {/* Main Story Book Container */}
      <main className={`${containerWidthClasses} mx-auto px-4 sm:px-6 py-10 space-y-10 transition-all duration-200`}>
        
        {/* Story Header Banner */}
        <div className="text-center space-y-4 border-b border-purple-200 dark:border-purple-900/40 pb-8">
          <span className="px-3.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs shadow-sm">
            {story.category}
          </span>

          <h1 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight">
            {story.title}
          </h1>

          <div 
            className="flex items-center justify-center gap-3 cursor-pointer group"
            onClick={() => openAuthorProfile(story.authorId)}
          >
            <img src={story.authorAvatar} alt={story.authorName} className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500" />
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:underline">
              Yazar: {story.authorName} (@{story.authorUsername})
            </span>
          </div>

          {/* Chapter Selector Dropdown */}
          <div className="pt-2 flex justify-center">
            <select
              value={activeChapterIndex}
              onChange={(e) => openStoryReader(story.id, Number(e.target.value))}
              className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
            >
              {story.chapters.map((chap, idx) => (
                <option key={chap.id} value={idx}>
                  Bölüm {idx + 1}: {chap.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* User Tip Notification Banner */}
        <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-700 dark:text-purple-300 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
          <span>
            <strong>İpucu:</strong> Yorum yapmak istediğiniz kısmı farenizle veya parmağınızla seçip <strong>sağ tıklayarak</strong> ya da açılan mini menüden doğrudan o alıntıya yorum yazabilirsiniz.
          </span>
        </div>

        {/* Chapter Title */}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-purple-600 dark:text-purple-400">
            {currentChapter?.title || `Bölüm ${activeChapterIndex + 1}`}
          </h2>
        </div>

        {/* Author's Music / Song Link Widget */}
        {activeMusicUrl && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 text-white shadow-xl space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 animate-pulse">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      Yazarın Şarkı Seçimi 🎵
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      {currentChapter?.musicUrl ? 'Bölüme Özel' : 'Hikaye Genel'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    Yazar bu bölümü kaleme alırken bu parçayı dinliyordu:
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activeMusicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/30"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Şarkıyı Aç</span>
                </a>
              </div>
            </div>

            {/* Embedded Player for Spotify or YouTube */}
            {(() => {
              const trimmed = activeMusicUrl.trim();
              if (trimmed.includes('spotify.com')) {
                let embedUrl = trimmed;
                if (!trimmed.includes('/embed/')) {
                  embedUrl = trimmed.replace('spotify.com/', 'spotify.com/embed/');
                }
                return (
                  <div className="rounded-2xl overflow-hidden shadow-inner bg-black/40">
                    <iframe
                      src={embedUrl}
                      width="100%"
                      height="80"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      title="Yazarın Spotify Şarkısı"
                      className="rounded-2xl"
                    />
                  </div>
                );
              }
              if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
                let videoId = '';
                if (trimmed.includes('youtu.be/')) {
                  videoId = trimmed.split('youtu.be/')[1]?.split('?')[0] || '';
                } else if (trimmed.includes('watch?v=')) {
                  videoId = trimmed.split('watch?v=')[1]?.split('&')[0] || '';
                }
                if (videoId) {
                  return (
                    <div className="rounded-2xl overflow-hidden shadow-inner bg-black/40 aspect-video max-h-48">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Yazarın YouTube Şarkısı"
                        className="w-full h-full rounded-2xl"
                      />
                    </div>
                  );
                }
              }
              return null;
            })()}
          </div>
        )}

        {/* Chapter Content Body with Natural Text Selection and Right-Click Context Menu */}
        <article className={`${fontSizeClasses} ${fontFamilyClasses} ${lineHeightClasses} space-y-6 select-text`}>
          {rawParagraphs.length > 0 ? (
            rawParagraphs.map((paragraphText, pIdx) => {
              const pComments = paragraphComments.filter(
                (c) => c.storyId === story.id && c.chapterIndex === activeChapterIndex && c.paragraphIndex === pIdx
              );

              return (
                <div 
                  key={pIdx} 
                  className="group relative rounded-2xl p-2 sm:p-3 hover:bg-purple-500/5 transition-all cursor-text"
                >
                  <FormattedContent
                    content={paragraphText}
                    paragraphClassName="leading-relaxed"
                    onParagraphContextMenu={(e) => handleParagraphContextMenu(e, pIdx)}
                    onParagraphMouseUp={(e) => handleParagraphMouseUp(e, pIdx)}
                  />

                  {/* Show comment count badge ONLY if comments exist on this paragraph */}
                  {pComments.length > 0 && (
                    <div className="mt-2 flex items-center justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTextForComment('');
                          setOpenParagraphIndex(pIdx);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-sm shadow-purple-500/20 transition-all hover:scale-105"
                        title="Bu paragraftaki yorumları gör"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{pComments.length} Yorum</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 italic text-slate-400">
              Bu bölüm için henüz içerik girilmedi.
            </div>
          )}
        </article>

        {/* Custom Context Menu Popover (Right Click on Paragraph) */}
        {contextMenu && (
          <div 
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="fixed z-50 min-w-[200px] bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/80 rounded-2xl shadow-2xl p-1.5 animate-fade-in text-xs space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Metin İşlemleri
            </div>

            <button
              onClick={() => openCommentForSelectedText(contextMenu.paragraphIndex, contextMenu.selectedText)}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/60 font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2 transition-colors"
            >
              <MessageSquarePlus className="w-4 h-4 text-purple-600" />
              <span>
                {contextMenu.selectedText ? 'Seçilen Metne Yorum Yaz' : 'Bu Paragrafa Yorum Yaz'}
              </span>
            </button>

            {contextMenu.selectedText && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(contextMenu.selectedText);
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-colors"
              >
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Seçilen Metni Kopyala</span>
              </button>
            )}

            <button
              onClick={() => setContextMenu(null)}
              className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 text-[11px] flex items-center gap-2 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Vazgeç</span>
            </button>
          </div>
        )}

        {/* Floating Highlight Action Popover (Mobile & Mouse Text Selection) */}
        {floatingSelection && (
          <div 
            style={{ top: floatingSelection.y, left: floatingSelection.x }}
            className="fixed z-50 bg-slate-900 text-white border border-purple-500/50 rounded-2xl shadow-2xl p-1.5 animate-bounce-short flex items-center gap-2 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => openCommentForSelectedText(floatingSelection.paragraphIndex, floatingSelection.selectedText)}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5 transition-all shadow-md"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Seçilen Kısma Yorum Yaz</span>
            </button>
            <button
              onClick={() => setFloatingSelection(null)}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Chapter Navigation & Chapter Like Controls */}
        <div className="pt-8 border-t border-purple-200 dark:border-purple-900/40 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Chapter Like Button */}
            <button
              onClick={() => toggleLikeChapter(story.id, activeChapterIndex)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
                isChapterLiked
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-105'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-rose-500 hover:border-rose-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${isChapterLiked ? 'fill-current text-white' : ''}`} />
              <span>{isChapterLiked ? 'Bölüm Beğenildi' : 'Bu Bölümü Beğen'}</span>
              <span className="px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-[10px]">
                {currentChapter?.likes || 0}
              </span>
            </button>

            {/* Whole Story Like Button */}
            <button
              onClick={() => toggleLikeStory(story.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all ${
                isLiked
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-purple-600'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{isLiked ? 'Tüm Hikaye Beğenildi' : 'Tüm Hikayeyi Beğen'}</span>
              <span className="px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-[10px]">
                {story.likes}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevChapter}
              disabled={activeChapterIndex === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-bold disabled:opacity-30 hover:bg-purple-100 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Önceki Bölüm
            </button>

            <button
              onClick={() => openStoryDetail(story.id)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
            >
              Tüm Bölümleri Gör
            </button>

            <button
              onClick={handleNextChapter}
              disabled={activeChapterIndex >= story.chapters.length - 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold disabled:opacity-30 hover:bg-purple-700 transition-all shadow-md shadow-purple-500/20"
            >
              Sonraki Bölüm <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* General Chapter Comments Section */}
        <section className="pt-10 border-t border-purple-200 dark:border-purple-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Bölüm Yorumları
            </h3>
          </div>
          <GraphCommentWidget uid={`${story.id}_ch${activeChapterIndex}`} />
        </section>

      </main>

      {/* Paragraph Inline Comment Drawer / Modal */}
      {openParagraphIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-purple-200 dark:border-purple-800/60 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-purple-50/50 dark:bg-purple-950/30">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Bölüm {activeChapterIndex + 1}, Paragraf {openParagraphIndex + 1} Yorumları
                </h3>
              </div>
              <button
                onClick={() => {
                  setOpenParagraphIndex(null);
                  setSelectedTextForComment('');
                }}
                className="p-1 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Quote Banner if user selected a specific text snippet */}
            {selectedTextForComment ? (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/60 border-l-4 border-purple-600 text-xs italic text-purple-900 dark:text-purple-200 space-y-1">
                <div className="flex items-center gap-1 font-bold text-[10px] uppercase text-purple-600 dark:text-purple-400 not-italic">
                  <Quote className="w-3 h-3" /> Seçtiğiniz Alıntı:
                </div>
                <p className="line-clamp-3">"{selectedTextForComment}"</p>
              </div>
            ) : (
              <div className="p-3 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-xs italic text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                "{rawParagraphs[openParagraphIndex]}"
              </div>
            )}

            {/* Paragraph Comments List */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {paragraphComments.filter(
                (c) => c.storyId === story.id && c.chapterIndex === activeChapterIndex && c.paragraphIndex === openParagraphIndex
              ).length > 0 ? (
                paragraphComments
                  .filter(
                    (c) => c.storyId === story.id && c.chapterIndex === activeChapterIndex && c.paragraphIndex === openParagraphIndex
                  )
                  .map((pComm) => {
                    const isLiked = currentUser ? pComm.likedBy.includes(currentUser.id) : false;
                    return (
                      <div key={pComm.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
                        {pComm.selectedText && (
                          <div className="p-2 rounded-xl bg-purple-100/60 dark:bg-purple-950/40 border-l-2 border-purple-500 text-[11px] italic text-purple-900 dark:text-purple-200">
                            "{pComm.selectedText}"
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img src={pComm.userAvatar} alt={pComm.userName} className="w-7 h-7 rounded-full object-cover" />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-slate-100 block text-[11px]">{pComm.userName}</span>
                              <span className="text-[10px] text-slate-400">@{pComm.userUsername}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleLikeParagraphComment(pComm.id)}
                              className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg font-bold transition-all ${
                                isLiked ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>{pComm.likes}</span>
                            </button>

                            {currentUser && (currentUser.id === pComm.userId || currentUser.id === story.authorId) && (
                              <button
                                onClick={() => {
                                  if (window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
                                    deleteParagraphComment(pComm.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                                title="Yorumu Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed pl-9">
                          {pComm.content}
                        </p>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 italic">
                  Bu paragrafa henüz yorum yapılmamış. Seçtiğiniz kısma ilk yorumu siz yazın!
                </div>
              )}
            </div>

            {/* Comment Form Input */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              {currentUser ? (
                <form onSubmit={handleParagraphCommentSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={paragraphCommentInput}
                    onChange={(e) => setParagraphCommentInput(e.target.value)}
                    placeholder={selectedTextForComment ? "Seçilen alıntıya yorum ekleyin..." : "Bu paragrafa yorum ekleyin..."}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={!paragraphCommentInput.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl disabled:opacity-40 flex items-center gap-1 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" /> Gönder
                  </button>
                </form>
              ) : (
                <p className="text-xs text-slate-400 text-center py-2">Yorum yapmak için giriş yapmalısınız.</p>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

