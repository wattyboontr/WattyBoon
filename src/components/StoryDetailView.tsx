import React, { useState } from 'react';
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
  Flame
} from 'lucide-react';
import { AddToCustomListModal } from './AddToCustomListModal';

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
    currentUser,
    toggleFollowUser,
    setSelectedTagFilter,
    isNsfwEnabled,
    toggleNsfw
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [isCustomListModalOpen, setIsCustomListModalOpen] = useState(false);

  const story = stories.find((s) => s.id === activeStoryId);

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
  const isFollowingAuthor = currentUser ? currentUser.following.includes(story.authorId) : false;

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

              {isAuthor && (
                <button
                  onClick={() => openStoryEditor(story.id)}
                  className="py-3 px-4 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors flex items-center gap-1.5"
                >
                  <PenTool className="w-3.5 h-3.5" /> Düzenle
                </button>
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

        {story.tags.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
            {story.tags.map((tag) => (
              <button 
                key={tag}
                onClick={() => {
                  setSelectedTagFilter(tag);
                  setActiveView('explore');
                }}
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200/50 dark:border-purple-900/50 hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
                title={`#${tag} etiketli hikayeleri gör`}
              >
                #{tag}
              </button>
            ))}
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
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Story Comments Section */}
      <section className="space-y-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Yorumlar ({story.comments.length})
        </h3>

        {/* Comment Input */}
        {currentUser ? (
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Hikaye veya yazar hakkında düşüncelerinizi paylaşın..."
              className="flex-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Gönder
            </button>
          </form>
        ) : (
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-xs text-purple-700 dark:text-purple-300 font-medium text-center">
            Yorum yapabilmek için lütfen giriş yapın.
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-3 pt-2">
          {story.comments.length > 0 ? (
            story.comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                storyId={story.id} 
                toggleLikeComment={toggleLikeComment} 
                addReplyToComment={addReplyToComment} 
                currentUser={currentUser} 
              />
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">
              Henüz bu hikayeye yorum yapılmadı. İlk yorumu siz yazın!
            </p>
          )}
        </div>
      </section>

      <AddToCustomListModal
        story={story}
        isOpen={isCustomListModalOpen}
        onClose={() => setIsCustomListModalOpen(false)}
      />

    </div>
  );
};

interface CommentItemProps {
  comment: any;
  storyId: string;
  toggleLikeComment: (storyId: string, commentId: string) => void;
  addReplyToComment: (storyId: string, parentCommentId: string, content: string) => void;
  currentUser: any;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  storyId,
  toggleLikeComment,
  addReplyToComment,
  currentUser
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const likesCount = comment.likes || 0;
  const isLiked = currentUser ? (comment.likedBy || []).includes(currentUser.id) : false;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    addReplyToComment(storyId, comment.id, replyText.trim());
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 space-y-2">
      <div className="flex items-start gap-3">
        <img src={comment.userAvatar} alt={comment.userName} className="w-8 h-8 rounded-full object-cover mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{comment.userName}</h5>
            <span className="text-[10px] text-slate-400">
              {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {comment.content}
          </p>

          {/* Action Bar: Like & Reply */}
          <div className="flex items-center gap-4 mt-2 pt-1 text-[11px]">
            <button
              onClick={() => toggleLikeComment(storyId, comment.id)}
              className={`flex items-center gap-1 font-medium transition-colors ${
                isLiked ? 'text-rose-500 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
              <span>{likesCount}</span>
            </button>

            {currentUser && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
              >
                Yanıtla
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline Reply Form */}
      {isReplying && (
        <form onSubmit={handleSendReply} className="mt-2 ml-11 flex gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`${comment.userName} kullanıcısına yanıt yaz...`}
            className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm"
          >
            Gönder
          </button>
        </form>
      )}

      {/* Nested Child Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 sm:ml-8 mt-2 space-y-2 border-l-2 border-purple-200 dark:border-purple-900/50 pl-3">
          {comment.replies.map((child: any) => (
            <CommentItem
              key={child.id}
              comment={child}
              storyId={storyId}
              toggleLikeComment={toggleLikeComment}
              addReplyToComment={addReplyToComment}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
};

