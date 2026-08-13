import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  fetchCommentsFromSupabase, 
  insertCommentToSupabase, 
  toggleLikeCommentInSupabase, 
  deleteCommentFromSupabase,
  SupabaseCommentRow,
  isSupabaseConfigured
} from '../lib/supabase';
import { 
  MessageSquare, 
  Send, 
  ThumbsUp, 
  Trash2, 
  Quote, 
  Sparkles, 
  Database, 
  Code, 
  Check, 
  Copy, 
  Info,
  ChevronDown,
  ChevronUp,
  MessageSquarePlus,
  RefreshCw
} from 'lucide-react';

interface SupabaseCommentsSectionProps {
  storyId: string;
  chapterIndex: number;
}

export const SupabaseCommentsSection: React.FC<SupabaseCommentsSectionProps> = ({ storyId, chapterIndex }) => {
  const { currentUser, stories, addComment } = useApp();
  const story = stories.find((s) => s.id === storyId);

  const [supabaseComments, setSupabaseComments] = useState<SupabaseCommentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentInput, setCommentInput] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'general' | 'quotes'>('all');
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load comments from Supabase when storyId or chapterIndex changes
  const loadComments = async () => {
    setIsLoading(true);
    const data = await fetchCommentsFromSupabase(storyId, chapterIndex);
    setSupabaseComments(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadComments();
  }, [storyId, chapterIndex]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentUser) return;

    setIsSubmitting(true);

    // Insert into Supabase
    const inserted = await insertCommentToSupabase({
      storyId,
      chapterIndex,
      paragraphIndex: null, // General chapter comment
      selectedText: null,
      content: commentInput.trim(),
      userId: currentUser.id,
      userName: currentUser.name,
      userUsername: currentUser.username,
      userAvatar: currentUser.avatar,
    });

    if (inserted) {
      setSupabaseComments((prev) => [inserted, ...prev]);
    } else {
      // Fallback local addition if Supabase table is not configured yet
      addComment(storyId, commentInput.trim());
      // Create local row representation
      const localRow: SupabaseCommentRow = {
        id: `local_${Date.now()}`,
        story_id: storyId,
        chapter_index: chapterIndex,
        paragraph_index: null,
        selected_text: null,
        content: commentInput.trim(),
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_username: currentUser.username,
        user_avatar: currentUser.avatar,
        likes_count: 0,
        liked_by: [],
        created_at: new Date().toISOString(),
      };
      setSupabaseComments((prev) => [localRow, ...prev]);
    }

    setCommentInput('');
    setIsSubmitting(false);
  };

  const handleToggleLike = async (comment: SupabaseCommentRow) => {
    if (!currentUser) return;

    const hasLiked = comment.liked_by.includes(currentUser.id);
    const updatedLikedBy = hasLiked
      ? comment.liked_by.filter((id) => id !== currentUser.id)
      : [...comment.liked_by, currentUser.id];

    // Optimistic UI update
    setSupabaseComments((prev) =>
      prev.map((c) =>
        c.id === comment.id
          ? { ...c, liked_by: updatedLikedBy, likes_count: updatedLikedBy.length }
          : c
      )
    );

    await toggleLikeCommentInSupabase(comment.id, currentUser.id, comment.liked_by);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;

    // Optimistic UI delete
    setSupabaseComments((prev) => prev.filter((c) => c.id !== commentId));
    await deleteCommentFromSupabase(commentId);
  };

  // Filtered comments
  const generalComments = supabaseComments.filter((c) => c.paragraph_index === null);
  const quoteComments = supabaseComments.filter((c) => c.paragraph_index !== null);

  const displayedComments = 
    activeTab === 'general' ? generalComments :
    activeTab === 'quotes' ? quoteComments :
    supabaseComments;

  const sqlSchemaText = `-- SUPABASE COMMENTS TABLE SQL SCHEMA
-- Supabase SQL Editor'ında çalıştırabilirsiniz:

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id TEXT NOT NULL,
    chapter_index INTEGER NOT NULL,
    paragraph_index INTEGER DEFAULT NULL,
    selected_text TEXT DEFAULT NULL,
    content TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_username TEXT NOT NULL,
    user_avatar TEXT DEFAULT NULL,
    likes_count INTEGER DEFAULT 0,
    liked_by TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_story_chapter ON public.comments (story_id, chapter_index);
CREATE INDEX IF NOT EXISTS idx_comments_paragraph ON public.comments (story_id, chapter_index, paragraph_index);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.comments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.comments FOR DELETE USING (true);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchemaText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
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
                {supabaseComments.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Supabase veritabanı destekli anlık bölüm ve metin içi alıntı yorumları
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

          {/* SQL Setup Modal Toggle */}
          <button
            onClick={() => setShowSqlModal(!showSqlModal)}
            className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all font-bold text-xs flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase SQL</span>
          </button>
        </div>
      </div>

      {/* SQL Setup Info Modal / Panel */}
      {showSqlModal && (
        <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-purple-500/40 shadow-2xl space-y-3 animate-fade-in text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-purple-400">
              <Code className="w-4 h-4" />
              <span>Supabase Comments SQL Kod Şablonu</span>
            </div>
            <button
              onClick={copySqlToClipboard}
              className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center gap-1 transition-all"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Kopyalandı!' : 'Kopyala'}</span>
            </button>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Metin içi ve bölüm yorumlarınızı kendi Supabase projenizde saklamak için aşağıdaki SQL kodunu Supabase Dashboard &gt; <strong>SQL Editor</strong> bölümüne yapıştırıp çalıştırabilirsiniz:
          </p>
          <pre className="p-3 bg-black/80 rounded-xl overflow-x-auto text-[10px] font-mono text-purple-300 border border-slate-800 leading-normal max-h-48 overflow-y-auto">
            {sqlSchemaText}
          </pre>
        </div>
      )}

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
          Tüm Yorumlar ({supabaseComments.length})
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
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl disabled:opacity-40 flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gönder</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-3 bg-purple-50/50 dark:bg-purple-950/30 rounded-2xl text-center text-xs text-slate-500 dark:text-slate-400">
          Bölüme yorum yapmak için lütfen oturum açın.
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3 pt-2">
        {isLoading ? (
          <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
            <span>Supabase yorumları yükleniyor...</span>
          </div>
        ) : displayedComments.length > 0 ? (
          displayedComments.map((comment) => {
            const isLiked = currentUser ? comment.liked_by.includes(currentUser.id) : false;
            const canDelete = currentUser && (currentUser.id === comment.user_id || currentUser.id === story?.authorId);

            return (
              <div
                key={comment.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2.5 text-xs transition-all hover:border-purple-300 dark:hover:border-purple-800"
              >
                {/* Selected Quote Banner if applicable */}
                {comment.paragraph_index !== null && (
                  <div className="p-2.5 rounded-xl bg-purple-100/70 dark:bg-purple-950/60 border-l-3 border-purple-600 text-purple-900 dark:text-purple-200 text-[11px] italic space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase text-purple-700 dark:text-purple-400 not-italic">
                      <Quote className="w-3 h-3 text-purple-600" />
                      Paragraf {comment.paragraph_index + 1} Alıntısı:
                    </div>
                    {comment.selected_text && <p className="line-clamp-2">"{comment.selected_text}"</p>}
                  </div>
                )}

                {/* User Header & Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={comment.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={comment.user_name}
                      className="w-8 h-8 rounded-full object-cover border border-purple-200 dark:border-purple-800"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">
                        {comment.user_name}
                      </span>
                      <span className="text-[10px] text-slate-400">@{comment.user_username}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleLike(comment)}
                      className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-xl font-bold transition-all ${
                        isLiked
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{comment.likes_count}</span>
                    </button>

                    {canDelete && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Yorumu Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed pl-10 text-xs sm:text-sm">
                  {comment.content}
                </p>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
            <MessageSquarePlus className="w-8 h-8 text-purple-400 mx-auto opacity-60" />
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Bu bölüme henüz yorum yapılmamış.
            </p>
            <p className="text-[11px] text-slate-400">
              İlk yorumu siz yapabilir veya metinden bir alıntı seçerek özel yorum bırakabilirsiniz!
            </p>
          </div>
        )}
      </div>

    </section>
  );
};
