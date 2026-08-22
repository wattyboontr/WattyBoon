import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HomeView } from './components/HomeView';
import { ExploreView } from './components/ExploreView';
import { CategoriesView } from './components/CategoriesView';
import { LibraryView } from './components/LibraryView';
import { StoryEditor } from './components/StoryEditor';
import { StoryReader } from './components/StoryReader';
import { UserProfileView } from './components/UserProfileView';
import { NotificationDrawer } from './components/NotificationDrawer';
import { StoryDetailView } from './components/StoryDetailView';
import { AuthModal } from './components/AuthModal';
import { MessagesModal } from './components/MessagesModal';
import { InfoModal, InfoTabType } from './components/InfoModal';
import { ForumView } from './components/ForumView';
import { AdminPanelView } from './components/AdminPanelView';
import { SitemapView } from './components/SitemapView';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { Footer } from './components/Footer';
import { ShieldAlert } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeView } = useApp();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalTab, setInfoModalTab] = useState<InfoTabType>('about');
  const [copyWarning, setCopyWarning] = useState<string | null>(null);

  // Global Copy Protection & Content Security
  useEffect(() => {
    const isInputOrEditable = (target: EventTarget | null) => {
      if (!target || !(target instanceof HTMLElement)) return false;
      const tagName = target.tagName.toLowerCase();
      return (
        tagName === 'input' ||
        tagName === 'textarea' ||
        target.isContentEditable ||
        target.closest('input, textarea, [contenteditable="true"]') !== null
      );
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (isInputOrEditable(e.target)) return; // Allow right click in input fields for paste/spellcheck
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'img' || target.closest('img') || target.closest('.prevent-copy, .story-content, .story-reader-text, main')) {
        e.preventDefault();
        setCopyWarning('🔒 Telif Koruması: Görsel ve metin indirme / kopyalama menüsü devre dışı bırakılmıştır.');
      }
    };

    const handleDragStart = (e: DragEvent) => {
      if (isInputOrEditable(e.target)) return;
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'img' || target.closest('img')) {
        e.preventDefault();
        setCopyWarning('🔒 İçerik Koruması: Görsel sürükleyerek kaydetme engellendi.');
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      if (isInputOrEditable(e.target)) return;
      e.preventDefault();
      setCopyWarning('🔒 Telif Koruması: WattyBoon üzerindeki eserler kopyalamaya karşı koruma altındadır.');
    };

    const handleCut = (e: ClipboardEvent) => {
      if (isInputOrEditable(e.target)) return;
      e.preventDefault();
      setCopyWarning('🔒 İçerik Koruması: Metin kesme işlemi engellendi.');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputOrEditable(e.target)) return;
      if ((e.ctrlKey || e.metaKey) && ['c', 'C', 'u', 'U', 's', 'S', 'p', 'P'].includes(e.key)) {
        e.preventDefault();
        setCopyWarning('🔒 Telif Koruması: Kısayol tuşları ile kopyalama / kaydetme / yazdırma devre dışıdır.');
      }
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key))) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Auto-hide warning
  useEffect(() => {
    if (copyWarning) {
      const timer = setTimeout(() => setCopyWarning(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [copyWarning]);

  const openInfoModal = (tab: InfoTabType) => {
    setInfoModalTab(tab);
    setIsInfoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 select-none">
      {/* Copy Protection Security Notification Toast */}
      {copyWarning && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] p-3.5 rounded-2xl bg-slate-900/95 text-white shadow-2xl border border-purple-500/50 backdrop-blur-md flex items-center gap-3 animate-bounce">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
          <p className="text-xs font-semibold leading-relaxed">
            {copyWarning}
          </p>
        </div>
      )}

      <Header onOpenInfoModal={openInfoModal} />

      <main className="flex-1">
        {activeView === 'home' && <HomeView />}
        {activeView === 'explore' && <ExploreView />}
        {activeView === 'categories' && <CategoriesView />}
        {activeView === 'story-detail' && <StoryDetailView />}
        {activeView === 'library' && <LibraryView />}
        {activeView === 'forum' && <ForumView />}
        {activeView === 'editor' && <StoryEditor />}
        {activeView === 'reader' && <StoryReader />}
        {activeView === 'profile' && <UserProfileView />}
        {activeView === 'admin' && <AdminPanelView />}
        {activeView === 'sitemap' && <SitemapView />}
        {activeView === 'notifications' && <NotificationDrawer />}
      </main>

      <Footer onOpenInfoModal={openInfoModal} />
      <MobileBottomNav />
      <ScrollToTopButton />
      <AuthModal />
      <MessagesModal />
      <InfoModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)} 
        initialTab={infoModalTab} 
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
