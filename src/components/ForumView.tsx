import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MessageSquare, 
  Plus, 
  Heart, 
  MessageCircle, 
  Sparkles, 
  Search, 
  Tag, 
  User as UserIcon, 
  Send, 
  X, 
  Flame, 
  Clock, 
  Pin,
  TrendingUp,
  Filter,
  Trash2
} from 'lucide-react';
import { ForumTopic } from '../types';

const FORUM_CATEGORIES = [
  'Tümü',
  'Genel Sohbet',
  'Teoriler & İncelemeler',
  'Tavsiyeler & İstekler',
  'Yazar Tartışmaları',
  'Duyurular'
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
    currentUser,
    openAuthorProfile 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTopic, setActiveTopic] = useState<ForumTopic | null>(null);
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState<boolean>(false);

  // New topic form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Genel Sohbet');
  const [newContent, setNewContent] = useState('');

  // Active topic reply form state
  const [replyText, setReplyText] = useState('');

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
    
    // Refresh active topic view from updated state
    const updated = forumTopics.find((t) => t.id === activeTopic.id);
    if (updated) {
      setActiveTopic(updated);
    }
  };

  // Keep active topic in sync with global forumTopics state
  const currentActiveTopic = activeTopic ? forumTopics.find(t => t.id === activeTopic.id) || activeTopic : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 md:pb-12">
      
      {/* Forum Banner Header */}
      <section className="relative rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Okur & Yazar Kulübü
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
              Topluluk
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
              En sevdiğin serileri tartış, teorilerini paylaş, öneri iste veya diğer okuyucularla tanışıp sohbet et!
            </p>
          </div>

          <button
            onClick={() => {
              if (!currentUser) {
                alert('Konu açabilmek için lütfen giriş yapın.');
                return;
              }
              setIsNewTopicModalOpen(true);
            }}
            className="flex-shrink-0 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Yeni Konu Başlat
          </button>
        </div>
      </section>

      {/* Search and Category Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {FORUM_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
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
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:underline" onClick={(e) => {
                        e.stopPropagation();
                        openAuthorProfile(topic.authorId);
                      }}>
                        {topic.authorName}
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
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
                      className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-900 transition-all"
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

      {/* New Topic Modal */}
      {isNewTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" /> Yeni Tartışma Konusu Başlat
              </h3>
              <button
                onClick={() => setIsNewTopicModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
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
                  placeholder="Örn: Solo Leveling finali hakkında ne düşünüyorsunuz?"
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
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20"
                >
                  Konuyu Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topic Detail View Modal */}
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
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
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
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
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
                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-900 transition-all flex items-center gap-1 font-bold text-xs"
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
                      className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md disabled:opacity-40 flex items-center gap-1.5"
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
                                className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${
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
                                  className="text-rose-500 hover:text-rose-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
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
