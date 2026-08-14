import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRoleBadge } from './UserRoleBadge';
import { 
  fetchComments, 
  insertComment, 
  toggleLikeComment, 
  deleteComment,
  StoryCommentRow
} from '../lib/cloudflareStorage';
import { 
  MessageSquare, 
  Send, 
  ThumbsUp, 
  Trash2, 
  Quote, 
  RefreshCw,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface StoryCommentsSectionProps {
  storyId: string;
  chapterIndex: number;
}

export const StoryCommentsSection: React.FC<StoryCommentsSectionProps> = ({ storyId, chapterIndex }) => {
  const { currentUser, stories } = useApp();
  const story = stories.find((s) => s.id === storyId);

  const [comments, setComments] = useState<StoryCommentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentInput, setCommentInput] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'general' | 'quotes'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load comments when storyId or chapterIndex changes
  const loadComments = async () => {
    setIsLoading(true);
    const data = await fetchComments(storyId, chapterIndex);
    setComments(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadComments();
  }, [storyId, chapterIndex]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentUser) return;

    setIsSubmitting(true);
    const content = commentInput.trim();

    try {
      const inserted = await insertComment({
        storyId,
        chapterIndex,
        paragraphIndex: null, // General chapter comment
        selectedText: null,
        content,
        userId: currentUser.id,
        userName: currentUser.name,
        userUsername: currentUser.username,
        userAvatar: currentUser.avatar,
        userRole: currentUser.role,
      });

      setComments((prev) => [inserted, ...prev]);
      setCommentInput('');
    } catch (err) {
      console.warn('Comment submit notice:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (comment: StoryCommentRow) => {
    if (!currentUser) return;

    const hasLiked = comment.liked_by.includes(currentUser.id);
    const updatedLikedBy = hasLiked
      ? comment.liked_by.filter((id) => id !== currentUser.id)
      : [...comment.liked_by, currentUser.id];

    // Optimistic UI update
    setComments((prev) =>
      prev.map((c) =>
        c.id === comment.id
          ? { ...c, liked_by: updatedLikedBy, likes_count: updatedLikedBy.length }
          : c
      )
    );

    await toggleLikeComment(comment.id, currentUser.id, comment.liked_by, storyId, chapterIndex);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;

    // Optimistic UI delete
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    await deleteComment(commentId, storyId, chapterIndex);
  };

  // Filtered comments
  const generalComments = comments.filter((c) => c.paragraph_index === null);
  const quoteComments = comments.filter((c) => c.paragraph_index !== null);

  const displayedComments = 
    activeTab === 'general' ? generalComments :
    activeTab === 'quotes' ? quoteComments :
    comments;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Yeni';
    }
  };

  return (
    <section className="w-full my-6 bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-purple-100 dark:border-purple-900/40 shadow-xl transition-all space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/30">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Bölüm Yorumları
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-black">
                {comments.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Bölüm ve satır arası alıntı yorumları
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={loadComments}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-purple-600 transition-colors text-xs font-bold flex items-center gap-1"
            title="Yorumları Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-purple-600'
          }`}
        >
          Tüm Yorumlar ({comments.length})
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-purple-600'
          }`}
        >
          Genel Bölüm ({generalComments.length})
        </button>
        <button
          onClick={() => setActiveTab('quotes')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'quotes'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-purple-600'
          }`}
        >
          <Quote className="w-3 h-3 text-amber-400" />
          Metin Alıntıları ({quoteComments.length})
        </button>
      </div>

      {/* New General Comment Input */}
      {currentUser ? (
        <form onSubmit={handleAddComment} className="flex gap-2">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover border border-purple-200 dark:border-purple-800"
          />
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Bölüm hakkında duygu ve düşüncelerinizi yazın..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={!commentInput.trim() || isSubmitting}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gönder</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/40 text-xs text-purple-700 dark:text-purple-300 flex items-center justify-between">
          <span>Yorum yazmak ve beğeni bırakmak için giriş yapmalısınız.</span>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
          <span>Yorumlar yükleniyor...</span>
        </div>
      ) : displayedComments.length === 0 ? (
        <div className="py-8 text-center space-y-2 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {activeTab === 'quotes' 
              ? 'Bu bölümde henüz metin içi alıntı yorumu yapılmamış.' 
              : activeTab === 'general'
              ? 'Bu bölüme henüz genel yorum yazılmamış. İlk yorumu sen yaz!'
              : 'Bu bölüme henüz hiç yorum yapılmamış. İlk düşüncelerini paylaşan sen ol!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800/60">
          {displayedComments.map((comment) => {
            const hasLiked = currentUser ? comment.liked_by.includes(currentUser.id) : false;
            const isOwner = currentUser?.id === comment.user_id;
            const isAdmin = currentUser?.role === 'admin';

            return (
              <div key={comment.id} className="pt-3.5 first:pt-0 space-y-2">
                
                {/* Comment Author Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={comment.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`}
                      alt={comment.user_name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-purple-500/20"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {comment.user_name}
                        </span>
                        {comment.user_role && (
                          <UserRoleBadge role={comment.user_role as any} />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {formatDate(comment.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Actions (Like & Delete) */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleLike(comment)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                        hasLiked
                          ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 ring-1 ring-purple-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-purple-600'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                      <span>{comment.likes_count}</span>
                    </button>

                    {(isOwner || isAdmin) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors rounded-lg"
                        title="Yorumu Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Quoted Text Box (if it's an in-paragraph quote comment) */}
                {comment.selected_text && (
                  <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border-l-3 border-purple-500 text-[11px] text-slate-700 dark:text-slate-300 italic flex items-start gap-2">
                    <Quote className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">"{comment.selected_text}"</span>
                  </div>
                )}

                {/* Comment Body */}
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed pl-9">
                  {comment.content}
                </p>

              </div>
            );
          })}
        </div>
      )}

    </section>
  );
};
