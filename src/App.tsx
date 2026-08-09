import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ExploreView } from './components/ExploreView';
import { LibraryView } from './components/LibraryView';
import { StoryEditor } from './components/StoryEditor';
import { StoryReader } from './components/StoryReader';
import { UserProfileView } from './components/UserProfileView';
import { NotificationDrawer } from './components/NotificationDrawer';
import { StoryDetailView } from './components/StoryDetailView';
import { AuthModal } from './components/AuthModal';
import { MessagesModal } from './components/MessagesModal';
import { InfoModal, InfoTabType } from './components/InfoModal';
import { CategoriesModal } from './components/CategoriesModal';
import { Footer } from './components/Footer';
import { ShieldAlert, Lock } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeView } = useApp();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalTab, setInfoModalTab] = useState<InfoTabType>('about');
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
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

    const handleCopy = (e: ClipboardEvent) => {
      if (isInputOrEditable(e.target)) return; // Allow copying from form fields
      e.preventDefault();
      setCopyWarning('🔒 İçerik Koruması Aktif: WattyBoon üzerindeki eserler ve metinler kopyalamaya karşı telif hakkı koruması altındadır.');
    };

    const handleCut = (e: ClipboardEvent) => {
      if (isInputOrEditable(e.target)) return;
      e.preventDefault();
      setCopyWarning('🔒 İçerik Koruması: Metin kesme işlemi engellendi.');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputOrEditable(e.target)) return;
      // Prevent Ctrl+C / Cmd+C / Ctrl+U / Ctrl+S
      if ((e.ctrlKey || e.metaKey) && ['c', 'C', 'u', 'U', 's', 'S', 'p', 'P'].includes(e.key)) {
        e.preventDefault();
        setCopyWarning('🔒 Telif Koruması: Kısayol tuşları ile kopyalama/kaydetme devre dışı bırakılmıştır.');
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
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

  const openCategoriesModal = () => {
    setIsCategoriesModalOpen(true);
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

      <Header onOpenInfoModal={openInfoModal} onOpenCategoriesModal={openCategoriesModal} />

      <main className="flex-1">
        {activeView === 'explore' && <ExploreView onOpenCategoriesModal={openCategoriesModal} />}
        {activeView === 'story-detail' && <StoryDetailView />}
        {activeView === 'library' && <LibraryView />}
        {activeView === 'editor' && <StoryEditor />}
        {activeView === 'reader' && <StoryReader />}
        {activeView === 'profile' && <UserProfileView />}
        {activeView === 'notifications' && <NotificationDrawer />}
      </main>

      <Footer onOpenInfoModal={openInfoModal} />
      <MobileBottomNav />
      <AuthModal />
      <MessagesModal />
      <InfoModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)} 
        initialTab={infoModalTab} 
      />
      <CategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
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
