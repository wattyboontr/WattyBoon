import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Bookmark, PenTool, MessageSquare, User as UserIcon } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeView, setActiveView, setSelectedCategoryFilter, openStoryEditor, openAuthorProfile, currentUser } = useApp();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-purple-100 dark:border-purple-900/30 px-2 py-1.5 flex items-center justify-around">
      <button
        onClick={() => {
          setSelectedCategoryFilter('Tümü');
          setActiveView('explore');
        }}
        className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
          activeView === 'explore'
            ? 'text-purple-600 dark:text-purple-400 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[9px]">Ana Sayfa</span>
      </button>

      <button
        onClick={() => setActiveView('library')}
        className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
          activeView === 'library'
            ? 'text-purple-600 dark:text-purple-400 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Bookmark className="w-5 h-5" />
        <span className="text-[9px]">Kütüphane</span>
      </button>

      <button
        onClick={() => openStoryEditor(null)}
        className="flex flex-col items-center gap-0.5 p-2 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 -mt-4"
      >
        <PenTool className="w-5 h-5" />
        <span className="text-[9px] font-bold">Yaz</span>
      </button>

      <button
        onClick={() => setActiveView('forum')}
        className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
          activeView === 'forum'
            ? 'text-purple-600 dark:text-purple-400 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-[9px]">Forum</span>
      </button>

      <button
        onClick={() => {
          if (currentUser) {
            openAuthorProfile(currentUser.id);
          } else {
            setActiveView('profile');
          }
        }}
        className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
          activeView === 'profile'
            ? 'text-purple-600 dark:text-purple-400 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <UserIcon className="w-5 h-5" />
        <span className="text-[9px]">Profil</span>
      </button>
    </div>
  );
};

