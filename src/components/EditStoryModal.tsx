import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Edit3, PlusCircle, BookOpen, Clock, Sparkles } from 'lucide-react';

interface EditStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditStoryModal: React.FC<EditStoryModalProps> = ({ isOpen, onClose }) => {
  const { stories, currentUser, openStoryEditor, setIsAuthModalOpen } = useApp();

  if (!isOpen) return null;

  // Filter stories created by current user or all stories if none found
  const userStories = currentUser
    ? stories.filter((s) => s.authorId === currentUser.id)
    : [];

  const handleEditStory = (storyId: string) => {
    openStoryEditor(storyId);
    onClose();
  };

  const handleCreateNew = () => {
    openStoryEditor(null);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-900/40 p-6 space-y-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Hikayeni Düzelt / Düzenle
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Düzenlemek istediğin hikayeyi seç veya yeni bir taslak başlat.
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story List */}
        {!currentUser ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Hikayelerinizi düzenlemek için giriş yapmanız gerekmektedir.
            </p>
            <button
              onClick={() => {
                onClose();
                setIsAuthModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 hover:bg-purple-700 transition-all"
            >
              Giriş Yap
            </button>
          </div>
        ) : userStories.length === 0 ? (
          <div className="text-center py-8 space-y-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-dashed border-purple-200 dark:border-purple-900/50 p-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Henüz Yayınlanmış veya Taslak Hikayeniz Yok
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Hemen ilk hikayenizi kaleme almaya başlayarak hayal gücünüzü okurlarla buluşturun.
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center gap-2 mx-auto hover:opacity-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Yeni Hikaye Oluştur</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
            {userStories.map((story) => (
              <div
                key={story.id}
                onClick={() => handleEditStory(story.id)}
                className="group flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={story.coverUrl}
                    alt={story.title}
                    className="w-12 h-16 rounded-xl object-cover shrink-0 shadow-sm group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-300">
                      {story.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-purple-500" />
                        {story.chapters.length} Bölüm
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {story.updatedAt || story.createdAt}
                      </span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${
                      story.status === 'completed' || story.isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    }`}>
                      {story.status === 'completed' || story.isCompleted ? '✓ Tamamlandı' : 'Devam Ediyor / Taslak'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditStory(story.id);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-sm group-hover:bg-purple-700 transition-all shrink-0 flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Düzelt</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Create New Secondary Action */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Farklı bir konu mu kaleme alacaksınız?
          </span>
          <button
            onClick={handleCreateNew}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Yeni Hikaye Yaz
          </button>
        </div>

      </div>
    </div>
  );
};
