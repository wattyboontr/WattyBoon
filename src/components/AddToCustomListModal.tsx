import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Check, ListPlus, BookOpen } from 'lucide-react';
import { Story } from '../types';

interface AddToCustomListModalProps {
  story: Story | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AddToCustomListModal: React.FC<AddToCustomListModalProps> = ({
  story,
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    createCustomList,
    addStoryToCustomList,
    removeStoryFromCustomList,
  } = useApp();

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');

  if (!isOpen || !story || !currentUser) return null;

  const userLists = currentUser.customLists || [];

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    const createdId = createCustomList(newListName.trim(), newListDesc.trim());
    if (createdId) {
      addStoryToCustomList(createdId, story.id);
      setNewListName('');
      setNewListDesc('');
      setIsCreatingNew(false);
    }
  };

  const toggleStoryInList = (listId: string, isInList: boolean) => {
    if (isInList) {
      removeStoryFromCustomList(listId, story.id);
    } else {
      addStoryToCustomList(listId, story.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400">
              <ListPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Listeye Ekle
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                "{story.title}"
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          
          {/* List of Custom Reading Lists */}
          {userLists.length === 0 && !isCreatingNew ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50 text-purple-500" />
              Henüz özel bir kütüphane listen yok. Aşağıdan ilk listeni oluşturabilirsin!
            </div>
          ) : (
            <div className="space-y-2">
              {userLists.map((list) => {
                const isInList = list.storyIds.includes(story.id);

                return (
                  <button
                    key={list.id}
                    onClick={() => toggleStoryInList(list.id, isInList)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isInList
                        ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 text-purple-900 dark:text-purple-200'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-left">
                      <h4 className="text-xs font-bold leading-tight">{list.name}</h4>
                      {list.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {list.description}
                        </p>
                      )}
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 inline-block">
                        {list.storyIds.length} Hikaye
                      </span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        isInList
                          ? 'bg-purple-600 text-white'
                          : 'border border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isInList && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* New List Form Toggle */}
          {!isCreatingNew ? (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-800 text-purple-600 dark:text-purple-400 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Yeni Liste Oluştur
            </button>
          ) : (
            <form onSubmit={handleCreateList} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-3 border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Yeni Liste Detayları</h4>
              <input
                type="text"
                placeholder="Liste Adı (Örn: Gece Okumalarım)"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              <textarea
                placeholder="Açıklama (isteğe bağlı)"
                value={newListDesc}
                onChange={(e) => setNewListDesc(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={!newListName.trim()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  Oluştur ve Ekle
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors"
          >
            Tamam
          </button>
        </div>

      </div>
    </div>
  );
};
