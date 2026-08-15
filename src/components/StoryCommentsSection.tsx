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
  Reply, 
  CornerDownRight, 
  ChevronDown, 
  ChevronUp, 
  X,
  Sparkles
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

  // Reply State
  const [activeReplyThreadId, setActiveReplyThreadId] = useState<string | null>(null);
  const [replyTargetUser, setReplyTargetUser] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [collapsedThreads, setCollapsedThreads] = useState<Record<string, boolean>>({});

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

  // Add new Top-Level Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentUser) return;

    setIsSubmitting(true);
    const content = commentInput.trim();

    try {
      const inserted = await insertComment({
        storyId,
        storyTitle: story?.title || 'Hikaye',
        chapterIndex,
        chapterTitle: story?.chapters[chapterIndex]?.title || `${chapterIndex + 1}. Bölüm`,
        paragraphIndex: null, // General chapter comment
        selectedText: null,
        parentId: null,
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

  // Submit Reply to a comment thread
  const handleAddReply = async (rootComment: StoryCommentRow) => {
    if (!replyInput.trim() || !currentUser) return;

    setIsSubmittingReply(true);
    const content = replyInput.trim();
    const replyToUser = replyTargetUser || rootComment.user_name;

    try {
      const inserted = await insertComment({
        storyId,
        storyTitle: story?.title || 'Hikaye',
        chapterIndex,
        chapterTitle: story?.chapters[chapterIndex]?.title || `${chapterIndex + 1}. Bölüm`,
        paragraphIndex: rootComment.paragraph_index,
        selectedText: rootComment.selected_text,
        parentId: rootComment.id,
        replyToUserName: replyToUser,
        content,
        userId: currentUser.id,
        userName: currentUser.name,
        userUsername: currentUser.username,
        userAvatar: currentUser.avatar,
        userRole: currentUser.role,
      });

      // Update state with new reply
      setComments((prev) => [...prev, inserted]);
      setReplyInput('');
      setActiveReplyThreadId(null);
      setReplyTargetUser(null);
      // Ensure thread is not collapsed
      setCollapsedThreads((prev) => ({ ...prev, [rootComment.id]: false }));
    } catch (err) {
      console.warn('Reply submit notice:', err);
    } finally {
      setIsSubmittingReply(false);
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
    if (!window.confirm('Bu yorumu/yanıtı silmek istediğinize emin misiniz?')) return;

    // Optimistic UI delete (delete this comment and any child replies if it's a parent)
    setComments((prev) => prev.filter((c) => c.id !== commentId && c.parent_id !== commentId));
    await deleteComment(commentId, storyId, chapterIndex);
  };

  const toggleThreadCollapse = (rootId: string) => {
    setCollapsedThreads((prev) => ({
      ...prev,
      [rootId]: !prev[rootId],
    }));
  };

  const openReplyBox = (rootId: string, replyToName: string) => {
    if (!currentUser) return;
    setActiveReplyThreadId(rootId);
    setReplyTargetUser(replyToName);
    setReplyInput('');
  };

  // Group comments into root comments & replies
  const rootComments = comments.filter((c) => !c.parent_id);
  const repliesMap: Record<string, StoryCommentRow[]> = {};

  comments.forEach((c) => {
    if (c.parent_id) {
      if (!repliesMap[c.parent_id]) {
        repliesMap[c.parent_id] = [];
      }
      repliesMap[c.parent_id].push(c);
    }
  });

  // Sort replies chronologically (oldest to newest) for a conversational flow
  Object.keys(repliesMap).forEach((pId) => {
    repliesMap[pId].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  });

  // Filtered root comments
  const generalRootComments = rootComments.filter((c) => c.paragraph_index === null);
  const quoteRootComments = rootComments.filter((c) => c.paragraph_index !== null);

  const displayedRootComments = 
    activeTab === 'general' ? generalRootComments :
    activeTab === 'quotes' ? quoteRootComments :
    rootComments;

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
      
      {/* Header & Stats */}
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
              Yorum yapabilir, yanıtlara katılabilir veya satır arası alıntı bırakabilirsiniz
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={loadComments}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-purple-600 transition-colors text-xs font-bold flex items-center gap-1.5"
            title="Yorumları Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-600' : ''}`} />
            <span className="hidden sm:inline text-xs">Yenile</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-purple-600'
          }`}
        >
          Tüm Konuşmalar ({rootComments.length})
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-purple-600'
          }`}
        >
          Genel Bölüm ({generalRootComments.length})
        </button>
        <button
          onClick={() => setActiveTab('quotes')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'quotes'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-purple-600'
          }`}
        >
          <Quote className="w-3.5 h-3.5 text-amber-400" />
          Metin Alıntıları ({quoteRootComments.length})
        </button>
      </div>

      {/* New Top-Level Comment Input */}
      {currentUser ? (
        <form onSubmit={handleAddComment} className="flex gap-2.5 items-start">
          <img
            src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover border border-purple-200 dark:border-purple-800 shrink-0 mt-0.5"
          />
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Bölüm hakkında düşüncelerinizi yazın..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={!commentInput.trim() || isSubmitting}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-1.5 transition-all shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gönder</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/40 text-xs text-purple-700 dark:text-purple-300 flex items-center justify-between">
          <span>Yorum yazmak veya yanıtlara katılmak için giriş yapmalısınız.</span>
        </div>
      )}

      {/* Comments & Replies List */}
      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
          <span>Yorumlar ve yanıtlar yükleniyor...</span>
        </div>
      ) : displayedRootComments.length === 0 ? (
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
        <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800/60">
          {displayedRootComments.map((rootComment) => {
            const rootLiked = currentUser ? rootComment.liked_by.includes(currentUser.id) : false;
            const isRootOwner = currentUser?.id === rootComment.user_id;
            const isAdmin = currentUser?.role === 'admin';
            const threadReplies = repliesMap[rootComment.id] || [];
            const hasReplies = threadReplies.length > 0;
            const isThreadCollapsed = collapsedThreads[rootComment.id] || false;
            const isReplyingToThisThread = activeReplyThreadId === rootComment.id;

            return (
              <div key={rootComment.id} className="pt-4 first:pt-0 space-y-2.5">
                
                {/* Root Comment Container */}
                <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-2 transition-all">
                  
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rootComment.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rootComment.user_id}`}
                        alt={rootComment.user_name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500/20"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {rootComment.user_name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            @{rootComment.user_username}
                          </span>
                          {rootComment.user_role && (
                            <UserRoleBadge role={rootComment.user_role as any} />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {formatDate(rootComment.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Actions (Delete if owner) */}
                    {(isRootOwner || isAdmin) && (
                      <button
                        onClick={() => handleDeleteComment(rootComment.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors rounded-lg"
                        title="Yorumu Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Quoted Text Box (if it's an in-paragraph quote comment) */}
                  {rootComment.selected_text && (
                    <div className="p-2.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border-l-3 border-purple-500 text-[11px] text-slate-700 dark:text-slate-300 italic flex items-start gap-2">
                      <Quote className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">"{rootComment.selected_text}"</span>
                    </div>
                  )}

                  {/* Comment Body */}
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed pl-1 sm:pl-2">
                    {rootComment.content}
                  </p>

                  {/* Interactive Action Bar: Like, Reply, Collapse */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center gap-2">
                      {/* Like Button */}
                      <button
                        onClick={() => handleToggleLike(rootComment)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                          rootLiked
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 ring-1 ring-purple-400'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-purple-600 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${rootLiked ? 'fill-current' : ''}`} />
                        <span>{rootComment.likes_count}</span>
                      </button>

                      {/* Reply Button */}
                      {currentUser && (
                        <button
                          onClick={() => openReplyBox(rootComment.id, rootComment.user_name)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                            isReplyingToThisThread
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-purple-600 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <Reply className="w-3.5 h-3.5" />
                          <span>Yanıtla</span>
                        </button>
                      )}
                    </div>

                    {/* Replies count / Collapse Toggle */}
                    {hasReplies && (
                      <button
                        onClick={() => toggleThreadCollapse(rootComment.id)}
                        className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-all"
                      >
                        <span>{threadReplies.length} Yanıt</span>
                        {isThreadCollapsed ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronUp className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                </div>

                {/* Inline Reply Composer Form */}
                {isReplyingToThisThread && currentUser && (
                  <div className="ml-4 sm:ml-6 pl-3 sm:pl-4 border-l-2 border-purple-400 dark:border-purple-600 pt-1">
                    <div className="bg-purple-50/70 dark:bg-purple-950/40 p-3 rounded-2xl border border-purple-200 dark:border-purple-900/60 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                          <CornerDownRight className="w-3.5 h-3.5" />
                          <span className="text-slate-500 dark:text-slate-400">Yanıt verilen:</span>
                          <strong className="text-purple-600 dark:text-purple-400">@{replyTargetUser}</strong>
                        </span>
                        <button
                          onClick={() => {
                            setActiveReplyThreadId(null);
                            setReplyTargetUser(null);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={replyInput}
                          onChange={(e) => setReplyInput(e.target.value)}
                          placeholder={`@${replyTargetUser} kullanıcısına yanıt yaz...`}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddReply(rootComment);
                            }
                          }}
                          className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddReply(rootComment)}
                          disabled={!replyInput.trim() || isSubmittingReply}
                          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1 transition-all shrink-0"
                        >
                          <Send className="w-3 h-3" />
                          <span>Yanıtla</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nested Replies List */}
                {hasReplies && !isThreadCollapsed && (
                  <div className="ml-4 sm:ml-6 pl-3 sm:pl-4 border-l-2 border-purple-200 dark:border-purple-900/60 space-y-2.5 pt-1">
                    {threadReplies.map((reply) => {
                      const replyLiked = currentUser ? reply.liked_by.includes(currentUser.id) : false;
                      const isReplyOwner = currentUser?.id === reply.user_id;

                      return (
                        <div
                          key={reply.id}
                          className="bg-white dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 shadow-sm"
                        >
                          {/* Reply Author Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img
                                src={reply.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.user_id}`}
                                alt={reply.user_name}
                                className="w-6 h-6 rounded-full object-cover ring-1 ring-purple-400/30"
                              />
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                  {reply.user_name}
                                </span>
                                {reply.user_role && (
                                  <UserRoleBadge role={reply.user_role as any} />
                                )}
                                {reply.reply_to_user_name && (
                                  <span className="text-[10px] bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 font-semibold px-1.5 py-0.2 rounded-md border border-purple-200 dark:border-purple-800">
                                    @{reply.reply_to_user_name}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] text-slate-400">
                                {formatDate(reply.created_at)}
                              </span>
                              {(isReplyOwner || isAdmin) && (
                                <button
                                  onClick={() => handleDeleteComment(reply.id)}
                                  className="p-0.5 text-slate-400 hover:text-rose-500 transition-colors rounded"
                                  title="Yanıtı Sil"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Reply Content */}
                          <p className="text-xs text-slate-700 dark:text-slate-300 pl-1 leading-relaxed">
                            {reply.content}
                          </p>

                          {/* Reply Action Buttons */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleToggleLike(reply)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                                replyLiked
                                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 ring-1 ring-purple-400'
                                  : 'text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400'
                              }`}
                            >
                              <ThumbsUp className={`w-3 h-3 ${replyLiked ? 'fill-current' : ''}`} />
                              <span>{reply.likes_count}</span>
                            </button>

                            {currentUser && (
                              <button
                                onClick={() => openReplyBox(rootComment.id, reply.user_name)}
                                className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1 px-1.5 py-0.5 rounded transition-all"
                              >
                                <Reply className="w-3 h-3" />
                                <span>Yanıtla</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </section>
  );
};
