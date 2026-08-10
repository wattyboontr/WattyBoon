import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WattyboonLogo } from './WattyboonLogo';
import { InfoTabType } from './InfoModal';
import { EditStoryModal } from './EditStoryModal';
import { Category } from '../types';
import { 
  BookOpen, 
  Compass, 
  PenTool, 
  Bookmark, 
  Bell, 
  Sun, 
  Moon, 
  User as UserIcon, 
  LogOut, 
  LogIn,
  Sparkles, 
  Lock, 
  ChevronDown,
  CheckCircle2,
  MessageCircle,
  MessageSquare,
  HelpCircle,
  Info,
  ShieldCheck,
  Mail,
  Grid,
  ShieldAlert,
  Edit3
} from 'lucide-react';

interface HeaderProps {
  onOpenInfoModal?: (tab: InfoTabType) => void;
  onOpenCategoriesModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenInfoModal, onOpenCategoriesModal }) => {
  const { 
    isDarkMode, 
    toggleDarkMode, 
    isNsfwEnabled,
    toggleNsfw,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    currentUser, 
    activeView, 
    setActiveView, 
    openStoryEditor, 
    openAuthorProfile, 
    unreadNotificationCount,
    unreadMessageCount,
    openMessagingWithUser,
    logout,
    setIsAuthModalOpen
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isWriteMenuOpen, setIsWriteMenuOpen] = useState(false);
  const [isEditStoryModalOpen, setIsEditStoryModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-purple-100 dark:border-purple-900/30 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => {
            setSelectedCategoryFilter('Tümü');
            setActiveView('explore');
          }}
          className="flex items-center cursor-pointer group select-none hover:opacity-90 transition-opacity"
        >
          <WattyboonLogo className="text-2xl sm:text-3xl" />
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800">
          <button
            onClick={() => {
              setSelectedCategoryFilter('Tümü');
              setActiveView('explore');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'explore' && selectedCategoryFilter === 'Tümü'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            Keşfet
          </button>

          {/* Kategoriler Butonu (Popup Açar) */}
          <button
            onClick={() => {
              if (onOpenCategoriesModal) {
                onOpenCategoriesModal();
              }
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategoryFilter !== 'Tümü'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>{selectedCategoryFilter !== 'Tümü' ? selectedCategoryFilter : 'Kategoriler'}</span>
          </button>

          <button
            onClick={() => setActiveView('library')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'library'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Kütüphanem
          </button>

          <button
            onClick={() => setActiveView('forum')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'forum'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Tartışma
          </button>

          {/* Hikaye Yaz & Hikayeni Düzelt Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsWriteMenuOpen(!isWriteMenuOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeView === 'editor'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Hikaye Yaz</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isWriteMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isWriteMenuOpen && (
              <div 
                className="absolute left-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fade-in space-y-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    openStoryEditor(null);
                    setIsWriteMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                >
                  <PenTool className="w-4 h-4 text-purple-500" />
                  <span>Yeni Hikaye Yaz</span>
                </button>

                <button
                  onClick={() => {
                    setIsEditStoryModalOpen(true);
                    setIsWriteMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-indigo-500" />
                  <span>Hikayeni Düzelt</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Messages Button */}
          <button
            onClick={() => openMessagingWithUser()}
            className="relative p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-purple-300 transition-all"
            title="Mesajlar"
          >
            <MessageCircle className="w-4 h-4" />
            {unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse border-2 border-white dark:border-slate-950">
                {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
              </span>
            )}
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => setActiveView('notifications')}
            className={`relative p-2.5 rounded-xl border transition-all ${
              activeView === 'notifications'
                ? 'bg-purple-50 dark:bg-purple-950/80 border-purple-300 dark:border-purple-800 text-purple-600 dark:text-purple-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-purple-300'
            }`}
            title="Bildirimler"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse border-2 border-white dark:border-slate-950">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {/* User Profile Menu & Dropdown */}
          <div className="relative">
            {currentUser ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 transition-all"
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-purple-500/30" 
                />
                <span className="hidden sm:inline-block text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-purple-300 transition-all"
                  title="Menü"
                >
                  <UserIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/20 transition-all flex items-center justify-center"
                  title="Giriş Yap"
                  aria-label="Giriş Yap"
                >
                  <LogIn className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Dropdown Menu (Logged in or Guest) */}
            {isUserMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fade-in text-slate-900 dark:text-slate-100"
                onClick={(e) => e.stopPropagation()}
              >
                {currentUser ? (
                  <>
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{currentUser.name}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">@{currentUser.username}</p>
                    </div>

                    <button
                      onClick={() => {
                        openAuthorProfile(currentUser.id);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-purple-500" />
                      Profilimi Görüntüle
                    </button>

                    <button
                      onClick={() => {
                        openStoryEditor(null);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                    >
                      <PenTool className="w-4 h-4 text-purple-500" />
                      Yeni Hikaye Oluştur
                    </button>

                    <button
                      onClick={() => {
                        setIsEditStoryModalOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-indigo-500" />
                      Hikayeni Düzelt
                    </button>
                  </>
                ) : (
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Hoş Geldiniz</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">WattyBoon topluluğuna katılın</p>
                  </div>
                )}

                {/* Bilgilendirme ve İletişim Bağlantıları */}
                {onOpenInfoModal && (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1 space-y-0.5">
                    <button
                      onClick={() => {
                        onOpenInfoModal('about');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Info className="w-3.5 h-3.5 text-purple-500" />
                      Hakkımızda
                    </button>
                    <button
                      onClick={() => {
                        onOpenInfoModal('help');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                      Yardım & SSS
                    </button>
                    <button
                      onClick={() => {
                        onOpenInfoModal('privacy');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                      Gizlilik Politikası
                    </button>
                    <button
                      onClick={() => {
                        onOpenInfoModal('contact');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-purple-500" />
                      İletişim
                    </button>

                    {/* Gece / Gündüz Modu Butonu (Tam İletişim kısmının altında) */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDarkMode();
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {isDarkMode ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                          <span>Gündüz / Gece Modu</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isDarkMode ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {isDarkMode ? 'Gece' : 'Gündüz'}
                        </span>
                      </button>

                      {/* +18 (NSFW) Butonu (Gece/Gündüz modunun tam altında) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNsfw();
                        }}
                        className={`w-full mt-1 flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                          isNsfwEnabled
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ShieldAlert className={`w-3.5 h-3.5 ${isNsfwEnabled ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`} />
                          <span>+18 İçerik (NSFW)</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isNsfwEnabled ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          {isNsfwEnabled ? '+18 AÇIK' : 'KAPALI'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                  {currentUser ? (
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Çıkış Yap
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center px-3 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
                    >
                      Giriş Yap / Kaydol
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Edit Story Modal */}
      <EditStoryModal 
        isOpen={isEditStoryModalOpen} 
        onClose={() => setIsEditStoryModalOpen(false)} 
      />
    </header>
  );
};
