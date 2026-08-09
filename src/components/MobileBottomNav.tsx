import React from 'react';
import { useApp } from '../context/AppContext';
import { Compass, Bookmark, PenTool, Bell, User as UserIcon } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeView, setActiveView, openStoryEditor, openAuthorProfile, currentUser, unreadNotificationCount } = useApp();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-purple-100 dark:border-purple-900/30 px-3 py-2 flex items-center justify-around">
      <button
        onClick={() => setActiveView('explore')}
        className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
          activeView === 'explore'
            ? 'text-purple-600 dark:text-purple-400 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px]">Keşfet</span>
      </button>

      <button
        onClick={() => setActiveView('library')}
        className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
          activeView === 'library'
            ? 'text-purple-600 dark:text-purple-400 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Bookmark className="w-5 h-5" />
        <span className="text-[10px]">Kütüphane</span>
      </button>

      <button
        onClick={() => openStoryEditor(null)}
        className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 -mt-5"
      >
        <PenTool className="w-5 h-5" />
        <span className="text-[10px] font-bold">Yaz</span>
      </button>

      <button
        onClick={() => setActiveView('notifications')}
        className={`relative flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
          activeView === 'notifications'
            ? 'text-purple-600 dark:text-purple-400 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Bell className="w-5 h-5" />
        <span className="text-[10px]">Bildirim</span>
        {unreadNotificationCount > 0 && (
          <span className="absolute top-1 right-2 w-2 h-2 bg-purple-600 rounded-full animate-ping" />
        )}
      </button>

      <button
        onClick={() => currentUser ? openAuthorProfile(currentUser.id) : setActiveView('profile')}
        className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
          activeView === 'profile'
            ? 'text-purple-600 dark:text-purple-400 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <UserIcon className="w-5 h-5" />
        <span className="text-[10px]">Profil</span>
      </button>
    </div>
  );
};
