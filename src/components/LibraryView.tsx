import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StoryCard } from './StoryCard';
import { 
  Bookmark, 
  BookOpen, 
  Heart, 
  Clock, 
  CheckCircle, 
  PenTool, 
  Lock, 
  Globe, 
  Plus, 
  Trash2, 
  Edit3,
  ListPlus
} from 'lucide-react';

export const LibraryView: React.FC = () => {
  const { 
    currentUser, 
    stories, 
    openStoryEditor, 
    toggleLibraryStory, 
    deleteStory, 
    deleteCustomList,
    setIsAuthModalOpen 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'reading' | 'favorites' | 'want_to_read' | 'completed' | 'custom_lists' | 'my_stories'>('reading');

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
          <Bookmark className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Kütüphanenizi Görüntüleyin</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Okuduğunuz kitapları ve yazdığınız hikayeleri kütüphanenizde saklamak için giriş yapın.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-500/30 transition-all"
        >
          Giriş Yap veya Kaydol
        </button>
      </div>
    );
  }

  // Filter user's library items
  const userLibraryMap = new Map<string, typeof currentUser.library[0]>(currentUser.library.map((item) => [item.storyId, item]));

  const readingStories = stories.filter((s) => userLibraryMap.get(s.id)?.status === 'reading');
  const favoriteStories = stories.filter((s) => userLibraryMap.get(s.id)?.status === 'favorite' || s.likedBy.includes(currentUser.id));
  const wantToReadStories = stories.filter((s) => userLibraryMap.get(s.id)?.status === 'want_to_read');
  const completedStories = stories.filter((s) => userLibraryMap.get(s.id)?.status === 'completed');

  // Author's own public and private stories
  const myStories = stories.filter((s) => s.authorId === currentUser.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in pb-24 md:pb-12">
      
      {/* Library Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Bookmark className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            Kütüphanem
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Okuduğunuz hikayeleri düzenleyin ve kendi taslaklarınızı yönetin.
          </p>
        </div>

        <button
          onClick={() => openStoryEditor(null)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 hover:scale-105 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Yeni Hikaye Yaz
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveTab('reading')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'reading'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Okuyor ({readingStories.length})
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'favorites'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          Favoriler ({favoriteStories.length})
        </button>

        <button
          onClick={() => setActiveTab('want_to_read')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'want_to_read'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Daha Sonra Oku ({wantToReadStories.length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'completed'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Tamamlananlar ({completedStories.length})
        </button>

        <button
          onClick={() => setActiveTab('custom_lists')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'custom_lists'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <ListPlus className="w-4 h-4 text-purple-400" />
          Özel Listelerim ({currentUser.customLists?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('my_stories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'my_stories'
              ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md shadow-purple-500/20'
              : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
          }`}
        >
          <PenTool className="w-4 h-4" />
          Yazdığım Hikayeler ({myStories.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'custom_lists' && (
        <div className="space-y-8">
          {(!currentUser.customLists || currentUser.customLists.length === 0) ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
              <ListPlus className="w-12 h-12 text-purple-500 mx-auto opacity-60" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Henüz Özel Bir Liste Oluşturmadınız</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Keşfet sayfasındaki veya hikaye kartlarındaki liste ikonuna tıklayarak kendi okuma ve tema listelerinizi oluşturabilirsiniz.
              </p>
            </div>
          ) : (
            currentUser.customLists.map((list) => {
              const listStories = stories.filter((s) => list.storyIds.includes(s.id));

              return (
                <div key={list.id} className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ListPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        {list.name}
                      </h3>
                      {list.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {list.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => deleteCustomList(list.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                      title="Listeyi Sil"
                    >
                      <Trash2 className="w-4 h-4" /> Listeyi Sil
                    </button>
                  </div>

                  {listStories.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      Bu listede henüz hiç hikaye yok.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                      {listStories.map((story) => (
                        <StoryCard key={`clist_${list.id}_${story.id}`} story={story} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
      {activeTab === 'my_stories' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                <PenTool className="w-4 h-4" /> Yazarlık Yönetim Paneli
              </h3>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">
                Oluşturduğunuz hikayeleri herkese açık veya özel modda düzenleyebilirsiniz.
              </p>
            </div>
            <button
              onClick={() => openStoryEditor(null)}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 hover:bg-purple-700"
            >
              + Yeni Hikaye Yaz
            </button>
          </div>

          {myStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myStories.map((story) => (
                <div key={story.id} className="relative group bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex gap-4">
                    <img src={story.coverUrl} alt={story.title} className="w-20 h-28 object-cover rounded-xl shadow-sm flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
                          {story.category}
                        </span>
                        {story.visibility === 'private' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Özel
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5" /> Herkese Açık
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">{story.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{story.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{story.chapters.length} Bölüm • {story.reads} Okunma</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openStoryEditor(story.id)}
                        className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 font-bold flex items-center gap-1 hover:bg-purple-100"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Düzenle
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Bu hikayeyi silmek istediğinize emin misiniz?')) {
                            deleteStory(story.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        title="Hikayeyi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8">
              <PenTool className="w-10 h-10 text-purple-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Henüz hiç hikaye kaleme almadınız.</p>
              <button
                onClick={() => openStoryEditor(null)}
                className="mt-3 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
              >
                İlk Hikayeni Yaz
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reading Lists Grid */}
      {activeTab !== 'my_stories' && (
        <div>
          {(() => {
            const list = 
              activeTab === 'reading' ? readingStories :
              activeTab === 'favorites' ? favoriteStories :
              activeTab === 'want_to_read' ? wantToReadStories : completedStories;

            if (list.length === 0) {
              return (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8">
                  <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Bu listede henüz hikaye yok.
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Keşfet bölümünü gezerek beğendiğiniz hikayeleri kütüphanenize kolayca ekleyebilirsiniz.
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {list.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
};
