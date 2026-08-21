import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRoleBadge } from './UserRoleBadge';
import { 
  MessageSquare, 
  Plus, 
  Heart, 
  MessageCircle, 
  Sparkles, 
  Search, 
  Tag, 
  Send, 
  X, 
  Pin,
  Trash2,
  FileText,
  BookOpen,
  FolderArchive,
  UploadCloud,
  FileUp,
  CheckCircle2,
  ExternalLink,
  Eye,
  Calendar,
  User as UserIcon,
  Layers,
  BookMarked,
  Filter
} from 'lucide-react';
import { ForumTopic, ArchivedStory, Category } from '../types';

const FORUM_CATEGORIES = [
  'Tümü',
  'Genel Sohbet',
  'Teoriler & İncelemeler',
  'Tavsiyeler & İstekler',
  'Yazar Tartışmaları',
  'Duyurular'
];

const ARCHIVE_CATEGORIES: (Category | 'Tümü')[] = [
  'Tümü',
  'Genç Kurgu',
  'Romantik',
  'Gerilim',
  'Fantastik',
  'Bilim Kurgu',
  'Gizem',
  'Dram',
  'Hayran Kurgu',
  'Aksiyon',
  'Mizah',
  'Genel'
];

export const ForumView: React.FC = () => {
  const { 
    forumTopics, 
    addForumTopic, 
    deleteForumTopic,
    addForumReply, 
    deleteForumReply,
    toggleLikeForumTopic, 
    toggleLikeForumReply, 
    archivedStories,
    addArchivedStory,
    deleteArchivedStory,
    toggleLikeArchivedStory,
    addArchivedStoryComment,
    deleteArchivedStoryComment,
    currentUser,
    openAuthorProfile,
    setIsAuthModalOpen
  } = useApp();

  // Active top-level sub-section: 'discussions' (Tartışmalar) or 'archive' (Arşiv)
  const [activeTab, setActiveTab] = useState<'discussions' | 'archive'>('discussions');

  // Discussions State
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTopic, setActiveTopic] = useState<ForumTopic | null>(null);
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Genel Sohbet');
  const [newContent, setNewContent] = useState('');
  const [replyText, setReplyText] = useState('');

  // Archive State
  const [archiveCategory, setArchiveCategory] = useState<string>('Tümü');
  const [archiveSearch, setArchiveSearch] = useState<string>('');
  const [isNewArchiveModalOpen, setIsNewArchiveModalOpen] = useState<boolean>(false);
  const [selectedPdfStory, setSelectedPdfStory] = useState<ArchivedStory | null>(null);
  const [selectedCommentsStory, setSelectedCommentsStory] = useState<ArchivedStory | null>(null);
  const [archiveCommentText, setArchiveCommentText] = useState<string>('');

  // New Archived Story Form State
  const [archTitle, setArchTitle] = useState('');
  const [archAuthor, setArchAuthor] = useState('');
  const [archChapterCount, setArchChapterCount] = useState('');
  const [archSummary, setArchSummary] = useState('');
  const [archCategory, setArchCategory] = useState<Category>('Genç Kurgu');
  const [archTags, setArchTags] = useState('');
  const [archCoverUrl, setArchCoverUrl] = useState('');
  const [archPdfUrl, setArchPdfUrl] = useState('');
  const [archPdfFileName, setArchPdfFileName] = useState('');
  const [archPdfFileSize, setArchPdfFileSize] = useState('');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  // Filter topics
  const filteredTopics = forumTopics.filter((topic) => {
    const matchesCategory = selectedCategory === 'Tümü' || topic.category === selectedCategory;
    const matchesSearch = 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Filter archived stories
  const filteredArchiveStories = (archivedStories || []).filter((story) => {
    const matchesCategory = archiveCategory === 'Tümü' || story.category === archiveCategory;
    const matchesSearch = 
      story.title.toLowerCase().includes(archiveSearch.toLowerCase()) ||
      story.originalAuthor.toLowerCase().includes(archiveSearch.toLowerCase()) ||
      story.summary.toLowerCase().includes(archiveSearch.toLowerCase()) ||
      (story.tags && story.tags.some(t => t.toLowerCase().includes(archiveSearch.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    addForumTopic(newTitle.trim(), newCategory, newContent.trim());
    setNewTitle('');
    setNewContent('');
    setIsNewTopicModalOpen(false);
  };

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTopic || !replyText.trim()) return;
    addForumReply(activeTopic.id, replyText.trim());
    setReplyText('');
    
    const updated = forumTopics.find((t) => t.id === activeTopic.id);
    if (updated) {
      setActiveTopic(updated);
    }
  };

  // PDF File Upload Handler (FileReader -> base64 Data URL)
  const handlePdfFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setFormError('Lütfen geçerli bir PDF (.pdf) dosyası seçin.');
      return;
    }

    // Calculate human-readable file size
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = `${sizeInMb} MB`;

    setIsUploadingPdf(true);
    setFormError('');

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setArchPdfUrl(result);
      setArchPdfFileName(file.name);
      setArchPdfFileSize(sizeStr);
      setIsUploadingPdf(false);
      setUploadSuccessMessage(`"${file.name}" (${sizeStr}) başarıyla yüklendi.`);
    };
    reader.onerror = () => {
      setIsUploadingPdf(false);
      setFormError('PDF dosyası okunurken bir hata oluştu. Lütfen tekrar deneyin.');
    };
    reader.readAsDataURL(file);
  };

  const handleCreateArchivedStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!archTitle.trim()) {
      setFormError('Lütfen hikaye adını giriniz.');
      return;
    }
    if (!archAuthor.trim()) {
      setFormError('Lütfen orijinal yazarın adını giriniz.');
      return;
    }
    if (!archPdfUrl) {
      setFormError('Lütfen bir PDF dosyası yükleyin veya geçerli bir PDF bağlantısı girin.');
      return;
    }

    const tagsArray = archTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    const res = await addArchivedStory({
      title: archTitle.trim(),
      originalAuthor: archAuthor.trim(),
      chapterCount: archChapterCount.trim() || 'Bilinmiyor',
      summary: archSummary.trim(),
      category: archCategory,
      tags: tagsArray,
      pdfUrl: archPdfUrl,
      pdfFileName: archPdfFileName || `${archTitle.trim().toLowerCase().replace(/\s+/g, '_')}.pdf`,
      pdfFileSize: archPdfFileSize || '1.8 MB',
      coverUrl: archCoverUrl.trim() || undefined
    });

    if (res.success) {
      // Reset form
      setArchTitle('');
      setArchAuthor('');
      setArchChapterCount('');
      setArchSummary('');
      setArchTags('');
      setArchCoverUrl('');
      setArchPdfUrl('');
      setArchPdfFileName('');
      setArchPdfFileSize('');
      setUploadSuccessMessage('');
      setFormError('');
      setIsNewArchiveModalOpen(false);
    } else {
      setFormError(res.error || 'Hikaye arşive eklenirken bir sorun oluştu.');
    }
  };

  const handleAddArchiveComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommentsStory || !archiveCommentText.trim()) return;
    addArchivedStoryComment(selectedCommentsStory.id, archiveCommentText.trim());
    setArchiveCommentText('');
  };

  // Sync active topic and comment stories with global state
  const currentActiveTopic = activeTopic ? forumTopics.find(t => t.id === activeTopic.id) || activeTopic : null;
  const currentCommentsStory = selectedCommentsStory 
    ? archivedStories.find(s => s.id === selectedCommentsStory.id) || selectedCommentsStory 
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 md:pb-12">
      
      {/* Forum Banner Header */}
      <section className="relative rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Okur & Yazar Kulübü
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
              Topluluk & Eser Arşivi
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
              En sevdiğin serileri tartış, teorilerini paylaş veya kaldırılan & silinen efsane Wattpad klasiklerini PDF olarak arşivde keşfet ve ekle!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeTab === 'discussions' ? (
              <button
                onClick={() => {
                  if (!currentUser) {
                    setIsAuthModalOpen(true);
                    return;
                  }
                  setIsNewTopicModalOpen(true);
                }}
                className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Yeni Konu Başlat
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!currentUser) {
                    setIsAuthModalOpen(true);
                    return;
                  }
                  setIsNewArchiveModalOpen(true);
                }}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-900/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
              >
                <FileUp className="w-4 h-4" /> + Arşive PDF Hikaye Ekle
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Section Navigation Switcher (Tartışmalar vs Arşiv) */}
      <div className="flex items-center gap-3 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-md">
        <button
          onClick={() => setActiveTab('discussions')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'discussions'
              ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Tartışmalar & Konular</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
            {forumTopics.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('archive')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'archive'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FolderArchive className="w-4 h-4" />
          <span>Arşiv & Kayıp Eserler</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-300 font-semibold">
            PDF ({archivedStories.length})
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. DISCUSSIONS TAB (Tartışmalar) */}
      {/* ========================================================================= */}
      {activeTab === 'discussions' && (
        <div className="space-y-6">
          {/* Search and Category Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {FORUM_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Konularda veya yazarlarda ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Forum Topics Grid / List */}
          <div className="space-y-3">
            {filteredTopics.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 space-y-3">
                <MessageSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Henüz konu bulunamadı
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Seçili kategoride henüz bir başlık yok. İlk konuyu sen başlatıp topluluğu renklendirebilirsin!
                </p>
              </div>
            ) : (
              filteredTopics.map((topic) => {
                const isLiked = currentUser ? topic.likedBy.includes(currentUser.id) : false;

                return (
                  <div
                    key={topic.id}
                    onClick={() => setActiveTopic(topic)}
                    className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 cursor-pointer hover:shadow-md group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      topic.isPinned 
                        ? 'border-purple-300 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-900/60'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <img
                        src={topic.authorAvatar}
                        alt={topic.authorName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/20 flex-shrink-0 mt-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAuthorProfile(topic.authorId);
                        }}
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {topic.isPinned && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-bold text-[10px] flex items-center gap-1">
                              <Pin className="w-2.5 h-2.5 fill-current" /> Sabitlendi
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
                            {topic.category}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-1" onClick={(e) => {
                            e.stopPropagation();
                            openAuthorProfile(topic.authorId);
                          }}>
                            {topic.authorName}
                            <UserRoleBadge userId={topic.authorId} role={topic.authorRole} />
                          </span>
                          <span className="text-[10px] text-slate-400">
                            • {new Date(topic.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                          {topic.title}
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {topic.content}
                        </p>
                      </div>
                    </div>

                    {/* Topic Stats & Actions */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 text-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLikeForumTopic(topic.id);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          isLiked
                            ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-rose-300'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
                        <span className="font-bold">{topic.likes}</span>
                      </button>

                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
                        <MessageCircle className="w-3.5 h-3.5 text-purple-500" />
                        <span>{topic.replies.length}</span>
                      </div>

                      {currentUser && currentUser.id === topic.authorId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`"${topic.title}" konusunu silmek istediğinize emin misiniz?`)) {
                              deleteForumTopic(topic.id);
                            }
                          }}
                          className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-900 transition-all cursor-pointer"
                          title="Konuyu Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ARCHIVE TAB (Kayıp & Silinen Eserler Arşivi) */}
      {/* ========================================================================= */}
      {activeTab === 'archive' && (
        <div className="space-y-6">
          {/* Archive Info Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-purple-500/10 border border-amber-300/40 dark:border-amber-700/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20 shrink-0">
                <FolderArchive className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Silinen & Kayıp Eserler Kütüphanesi</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold">
                    Çevrimiçi Okuma & Anılar
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  Platformlardan kaldırılan nostaljik ve kayıp kitapları yaşatıyoruz. Eserleri uygulama içinde güvenle okuyabilir, beğenebilir, anı ve yorumlarınızı paylaşabilirsiniz. Kendi arşivinizdeki kayıp eserleri de PDF olarak yükleyebilirsiniz.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (!currentUser) {
                  setIsAuthModalOpen(true);
                  return;
                }
                setIsNewArchiveModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <FileUp className="w-4 h-4" /> + Arşive PDF Hikaye Ekle
            </button>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {ARCHIVE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setArchiveCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    archiveCategory === cat
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Arşivde hikaye adı, yazar, özet veya #etiket ara..."
                value={archiveSearch}
                onChange={(e) => setArchiveSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-amber-500 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Archived Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredArchiveStories.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 space-y-3">
                <FolderArchive className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Arşivde henüz eşleşen hikaye bulunamadı
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Arama kriterlerinizi değiştirebilir veya arşive ilk PDF hikayeyi siz ekleyebilirsiniz!
                </p>
                <button
                  onClick={() => setIsNewArchiveModalOpen(true)}
                  className="mt-3 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 shadow-md transition-all cursor-pointer"
                >
                  + Arşive İlk PDF Hikayeyi Ekle
                </button>
              </div>
            ) : (
              filteredArchiveStories.map((story) => {
                const isLiked = currentUser ? (story.likedBy || []).includes(currentUser.id) : false;
                const canDelete = currentUser && (currentUser.id === story.addedByUserId || currentUser.id === 'system_archivist');

                return (
                  <div
                    key={story.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700/60 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
                  >
                    {/* Story Cover Header Banner */}
                    <div className="relative h-40 bg-slate-800 overflow-hidden">
                      {story.coverUrl ? (
                        <img
                          src={story.coverUrl}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-600 via-orange-700 to-purple-900 flex items-center justify-center p-4">
                          <BookMarked className="w-12 h-12 text-white/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/90 backdrop-blur-sm text-white font-bold text-[10px] flex items-center gap-1 shadow-sm">
                          <FileText className="w-3 h-3" /> PDF Arşiv
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-sm text-amber-300 font-bold text-[10px] border border-amber-500/30">
                          {story.chapterCount || 'Bölüm Sayısı Belirtilmedi'}
                        </span>
                      </div>

                      {/* Title & Author at Bottom of Banner */}
                      <div className="absolute bottom-3 left-3 right-3 space-y-0.5">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                          {story.category}
                        </span>
                        <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                          {story.title}
                        </h3>
                        <p className="text-xs text-slate-300 font-medium">
                          Orijinal Yazar: <span className="text-white font-bold">{story.originalAuthor}</span>
                        </p>
                      </div>
                    </div>

                    {/* Story Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      
                      {/* Summary */}
                      <div className="space-y-2">
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                          {story.summary || 'Özet bulunmuyor.'}
                        </p>

                        {/* Tags */}
                        {story.tags && story.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {story.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Uploader Member Information */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <img
                            src={story.addedByUserAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${story.addedByUserId}`}
                            alt={story.addedByUserName || 'Üye'}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-500/40"
                          />
                          <span className="font-medium truncate max-w-[120px]">
                            {story.addedByUserName || 'Arşivci'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {story.addedAt}
                        </span>
                      </div>

                      {/* Action Buttons: Read PDF (Only in-app reader, no download), Likes, Comments */}
                      <div className="space-y-3 pt-1">
                        {/* PDF Oku Butonu */}
                        <button
                          onClick={() => setSelectedPdfStory(story)}
                          className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          <span>PDF Oku</span>
                        </button>

                        {/* Social Footer: Likes & Comments */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2.5">
                            {/* Like Button */}
                            <button
                              onClick={() => toggleLikeArchivedStory(story.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                isLiked 
                                  ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900' 
                                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-rose-500 hover:border-rose-300'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
                              <span>{story.likes || 0}</span>
                            </button>

                            {/* Discussion Comments Button */}
                            <button
                              onClick={() => setSelectedCommentsStory(story)}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 transition-all cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-purple-500" />
                              <span>{(story.comments || []).length} Yorum & Anı</span>
                            </button>
                          </div>

                          {canDelete && (
                            <button
                              onClick={() => {
                                if (window.confirm(`"${story.title}" arşiv kaydını silmek istediğinize emin misiniz?`)) {
                                  deleteArchivedStory(story.id);
                                }
                              }}
                              className="p-1.5 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/80 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors cursor-pointer"
                              title="Arşivden Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. NEW FORUM TOPIC MODAL */}
      {/* ========================================================================= */}
      {isNewTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" /> Yeni Tartışma Konusu Başlat
              </h3>
              <button
                onClick={() => setIsNewTopicModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Seçin
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {FORUM_CATEGORIES.filter(c => c !== 'Tümü').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Konu Başlığı
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Solo Leveling finali veya favori karakterleriniz..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  İçerik / Detaylar
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tartışmak istediğiniz detayları, teorilerinizi veya sorularınızı yazın..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTopicModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 cursor-pointer"
                >
                  Konuyu Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. NEW ARCHIVE PDF STORY MODAL (Arşive PDF Hikaye Ekle) */}
      {/* ========================================================================= */}
      {isNewArchiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500 text-white">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Arşive Kayıp / Silinen Hikaye Ekle
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    PDF formatında kaybolan hikayeleri toplulukla paylaşın
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewArchiveModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateArchivedStory} className="space-y-4">
              
              {/* Hikaye Adı & Yazarın Adı */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hikayenin Adı <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Karanlık Lise (Özel Bölümler)"
                    value={archTitle}
                    onChange={(e) => setArchTitle(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Yazarın Adı <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Alya Öztürk"
                    value={archAuthor}
                    onChange={(e) => setArchAuthor(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Bölüm Sayısı & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bölüm Sayısı <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: 45 Bölüm veya Tamamlandı (38 Bölüm)"
                    value={archChapterCount}
                    onChange={(e) => setArchChapterCount(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Edebi Tür / Kategori
                  </label>
                  <select
                    value={archCategory}
                    onChange={(e) => setArchCategory(e.target.value as Category)}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {ARCHIVE_CATEGORIES.filter(c => c !== 'Tümü').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Özet */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hikayenin Özeti & Arşiv Notları <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Hikayenin konusunu, neden silindiğini veya hangi özel bölümleri içerdiğini yazın..."
                  value={archSummary}
                  onChange={(e) => setArchSummary(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              {/* PDF Dosyası Yükleme (Drag & Drop or Direct Link) */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-amber-500/5 border-2 border-dashed border-amber-400/50 dark:border-amber-600/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-500" /> PDF Dosyası Yükle <span className="text-rose-500">*</span>
                  </span>
                  {isUploadingPdf && (
                    <span className="text-[11px] text-amber-600 font-semibold animate-pulse">
                      Yükleniyor...
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all shrink-0">
                    <UploadCloud className="w-4 h-4" />
                    <span>Cihazdan PDF Seç</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1 w-full text-center sm:text-left">
                    {uploadSuccessMessage ? (
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center sm:justify-start gap-1">
                        <CheckCircle2 className="w-4 h-4" /> {uploadSuccessMessage}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Bilgisayarınızdan veya telefonunuzdan PDF dosyasını seçin.
                      </p>
                    )}
                  </div>
                </div>

                {/* Veya doğrudan PDF Web Bağlantısı */}
                <div className="pt-2 border-t border-amber-200/40 dark:border-amber-800/40">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Veya PDF Web Bağlantısı (URL):
                  </label>
                  <input
                    type="url"
                    placeholder="https://ornek-arsiv.com/kitap.pdf"
                    value={archPdfUrl.startsWith('data:') ? '' : archPdfUrl}
                    onChange={(e) => {
                      setArchPdfUrl(e.target.value);
                      if (e.target.value) {
                        setArchPdfFileName(`${archTitle.trim() || 'arsiv_hikaye'}.pdf`);
                        setArchPdfFileSize('2.4 MB');
                        setUploadSuccessMessage('Harici PDF bağlantısı tanımlandı.');
                      }
                    }}
                    className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* İsteğe Bağlı: Kapak Görseli & Etiketler */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Kapak Görseli URL (İsteğe Bağlı)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={archCoverUrl}
                    onChange={(e) => setArchCoverUrl(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Etiketler (Virgülle ayırın)
                  </label>
                  <input
                    type="text"
                    placeholder="KayıpHikaye, Wattpad, Nostalji"
                    value={archTags}
                    onChange={(e) => setArchTags(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewArchiveModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={!archPdfUrl || isUploadingPdf}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
                >
                  Arşive Ekle ve Yayınla
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. IN-APP PDF VIEWER MODAL (PDF Oku) */}
      {/* ========================================================================= */}
      {selectedPdfStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            
            {/* Viewer Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                    {selectedPdfStory.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Orijinal Yazar: <span className="font-bold text-purple-600 dark:text-purple-400">{selectedPdfStory.originalAuthor}</span> • {selectedPdfStory.chapterCount}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedPdfStory(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title="Kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded PDF Frame or Fallback */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative overflow-hidden flex flex-col">
              <iframe
                src={selectedPdfStory.pdfUrl}
                title={selectedPdfStory.title}
                className="w-full h-full border-none"
              />
            </div>

            {/* Viewer Footer */}
            <div className="px-5 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs text-slate-500">
              <span>{selectedPdfStory.summary}</span>
              <button
                onClick={() => setSelectedPdfStory(null)}
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
              >
                Pencereyi Kapat
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. ARCHIVE STORY COMMENTS / MEMORIES MODAL */}
      {/* ========================================================================= */}
      {currentCommentsStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-amber-500" />
                  <span>{currentCommentsStory.title} - Yorumlar & Anılar</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Orijinal Yazar: {currentCommentsStory.originalAuthor}
                </p>
              </div>

              <button
                onClick={() => setSelectedCommentsStory(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              
              {/* New Comment Input */}
              {currentUser ? (
                <form onSubmit={handleAddArchiveComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Bu hikaye hakkındaki anılarınızı veya düşüncelerinizi paylaşın..."
                    value={archiveCommentText}
                    onChange={(e) => setArchiveCommentText(e.target.value)}
                    className="flex-1 p-3 text-xs rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={!archiveCommentText.trim()}
                    className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Gönder
                  </button>
                </form>
              ) : (
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-xs text-amber-700 dark:text-amber-300 text-center font-medium">
                  Yorum yazabilmek için lütfen giriş yapın.
                </div>
              )}

              {/* List */}
              <div className="space-y-3 pt-2">
                {(!currentCommentsStory.comments || currentCommentsStory.comments.length === 0) ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    Bu silinen hikaye için henüz anı veya yorum bırakılmamış. İlk yorumu sen yaz!
                  </p>
                ) : (
                  currentCommentsStory.comments.map((comment) => (
                    <div key={comment.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 flex items-start gap-3">
                      <img
                        src={comment.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userId}`}
                        alt={comment.userName}
                        className="w-8 h-8 rounded-full object-cover mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {comment.userName}
                          </h5>
                          <span className="text-[10px] text-slate-400">
                            {comment.createdAt}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {comment.content}
                        </p>

                        {currentUser && (currentUser.id === comment.userId || currentUser.id === currentCommentsStory.addedByUserId) && (
                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => deleteArchivedStoryComment(currentCommentsStory.id, comment.id)}
                              className="text-rose-500 hover:text-rose-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Sil
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TOPIC DETAIL VIEW MODAL */}
      {/* ========================================================================= */}
      {currentActiveTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs">
                  {currentActiveTopic.category}
                </span>
                {currentActiveTopic.isPinned && (
                  <span className="px-2 py-1 rounded-lg bg-amber-500 text-white font-bold text-[10px]">
                    Sabitlendi
                  </span>
                )}
              </div>

              <button
                onClick={() => setActiveTopic(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              
              {/* Main Topic Header */}
              <div className="space-y-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {currentActiveTopic.title}
                </h2>

                <div className="flex items-center justify-between">
                  <div 
                    onClick={() => {
                      setActiveTopic(null);
                      openAuthorProfile(currentActiveTopic.authorId);
                    }}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <img
                      src={currentActiveTopic.authorAvatar}
                      alt={currentActiveTopic.authorName}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 transition-colors">
                        {currentActiveTopic.authorName}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {new Date(currentActiveTopic.createdAt).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLikeForumTopic(currentActiveTopic.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        currentUser && currentActiveTopic.likedBy.includes(currentUser.id)
                          ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-200'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${currentUser && currentActiveTopic.likedBy.includes(currentUser.id) ? 'fill-current text-rose-500' : ''}`} />
                      <span>{currentActiveTopic.likes} Beğeni</span>
                    </button>

                    {currentUser && currentUser.id === currentActiveTopic.authorId && (
                      <button
                        onClick={() => {
                          if (window.confirm(`"${currentActiveTopic.title}" konusunu silmek istediğinize emin misiniz?`)) {
                            deleteForumTopic(currentActiveTopic.id);
                            setActiveTopic(null);
                          }
                        }}
                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-900 transition-all flex items-center gap-1 font-bold text-xs cursor-pointer"
                        title="Konuyu Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Konuyu Sil</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-line border border-slate-100 dark:border-slate-800">
                  {currentActiveTopic.content}
                </div>
              </div>

              {/* Replies Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-purple-600" />
                  Yanıtlar ({currentActiveTopic.replies.length})
                </h3>

                {/* New Reply Form */}
                {currentUser ? (
                  <form onSubmit={handleAddReply} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Tartışmaya katılın, fikrinizi yazın..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 p-3 text-xs rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Gönder
                    </button>
                  </form>
                ) : (
                  <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-xs text-purple-700 dark:text-purple-300 text-center font-medium">
                    Yanıt verebilmek için giriş yapmalısınız.
                  </div>
                )}

                {/* Reply list */}
                <div className="space-y-3 pt-2">
                  {currentActiveTopic.replies.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      Henüz yanıt yazılmamış. İlk yanıtı sen ver!
                    </p>
                  ) : (
                    currentActiveTopic.replies.map((reply) => {
                      const isReplyLiked = currentUser ? reply.likedBy?.includes(currentUser.id) : false;
                      const replyAvatar = reply.userAvatar || (reply as any).authorAvatar;
                      const replyName = reply.userName || (reply as any).authorName;
                      const canDeleteReply = currentUser && (currentUser.id === reply.userId || currentUser.id === currentActiveTopic.authorId);

                      return (
                        <div key={reply.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 flex items-start gap-3">
                          <img
                            src={replyAvatar}
                            alt={replyName}
                            className="w-8 h-8 rounded-full object-cover mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {replyName}
                              </h5>
                              <span className="text-[10px] text-slate-400">
                                {new Date(reply.createdAt).toLocaleDateString('tr-TR')}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                              {reply.content}
                            </p>

                            <div className="mt-2 flex items-center justify-between">
                              <button
                                onClick={() => toggleLikeForumReply(currentActiveTopic.id, reply.id)}
                                className={`flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                                  isReplyLiked ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-rose-500'
                                }`}
                              >
                                <Heart className={`w-3.5 h-3.5 ${isReplyLiked ? 'fill-current text-rose-500' : ''}`} />
                                <span>{reply.likes || 0}</span>
                              </button>

                              {canDeleteReply && (
                                <button
                                  onClick={() => {
                                    if (window.confirm('Bu yanıtı silmek istediğinize emin misiniz?')) {
                                      deleteForumReply(currentActiveTopic.id, reply.id);
                                    }
                                  }}
                                  className="text-rose-500 hover:text-rose-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Yanıtı Sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Sil</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
