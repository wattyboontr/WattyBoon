import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Bookmark, PenTool, MessageSquare, User as UserIcon, Compass } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeView, setActiveView, setSelectedCategoryFilter, openStoryEditor, openAuthorProfile, currentUser } = useApp();

  // In reader view, keep screen distraction-free (StoryReader has its own floating quick toolbar)
  if (activeView === 'reader') {
    return null;
  }

  const navItems = [
    {
      id: 'explore',
      label: 'Ana Sayfa',
      icon: Home,
      onClick: () => {
        setSelectedCategoryFilter('Tümü');
        setActiveView('explore');
      },
      isActive: activeView === 'explore',
    },
    {
      id: 'library',
      label: 'Kütüphane',
      icon: Bookmark,
      onClick: () => setActiveView('library'),
      isActive: activeView === 'library',
    },
    {
      id: 'editor',
      label: 'Yaz',
      icon: PenTool,
      onClick: () => openStoryEditor(null),
      isActive: activeView === 'editor',
    },
    {
      id: 'forum',
      label: 'Forum',
      icon: MessageSquare,
      onClick: () => setActiveView('forum'),
      isActive: activeView === 'forum',
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: UserIcon,
      onClick: () => {
        if (currentUser) {
          openAuthorProfile(currentUser.id);
        } else {
          setActiveView('profile');
        }
      },
      isActive: activeView === 'profile',
    },
  ];

  return (
    <nav 
      aria-label="Mobil Gezinme Menüsü"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-purple-100 dark:border-purple-900/40 px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-2xl transition-all duration-200 active:scale-95 ${
                item.isActive
                  ? 'text-purple-600 dark:text-purple-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {item.isActive && (
                <span className="absolute inset-0 bg-purple-50 dark:bg-purple-950/60 rounded-2xl -z-10 animate-fade-in border border-purple-200/50 dark:border-purple-800/40" />
              )}
              <Icon className={`w-5 h-5 transition-transform ${item.isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {item.isActive && (
                <span className="w-1 h-1 rounded-full bg-purple-600 dark:bg-purple-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
