import React from 'react';
import { WattyboonLogo } from './WattyboonLogo';
import { InfoTabType } from './InfoModal';
import { BookOpen, Compass, PenTool, Bookmark, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface FooterProps {
  onOpenInfoModal: (tab: InfoTabType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenInfoModal }) => {
  const { setActiveView, openStoryEditor, setSelectedCategoryFilter, setSelectedTagFilter } = useApp();

  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200 py-10 mt-12 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div 
              onClick={() => setActiveView('explore')}
              className="cursor-pointer group select-none inline-block hover:opacity-90 transition-opacity"
            >
              <WattyboonLogo className="text-2xl" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Etkileşimli hikayeler, tutkulu yazarlar ve sürükleyici kurgular dünyası. Kendi hikayeni yaz veya binlerce kurguya adım at.
            </p>
          </div>

          {/* Platform Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Keşfet & Oku
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button 
                  onClick={() => setActiveView('explore')} 
                  className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" /> Trend Hikayeler
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveView('library')} 
                  className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors flex items-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5" /> Okuma Listelerim
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openStoryEditor(null)} 
                  className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors flex items-center gap-1.5"
                >
                  <PenTool className="w-3.5 h-3.5" /> Hikaye Yayınla
                </button>
              </li>
            </ul>
          </div>

          {/* Info & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Kurumsal & Destek
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button 
                  onClick={() => onOpenInfoModal('about')} 
                  className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                >
                  Hakkımızda
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenInfoModal('help')} 
                  className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                >
                  Yardım & SSS
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenInfoModal('privacy')} 
                  className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                >
                  Gizlilik Politikası
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenInfoModal('contact')} 
                  className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors font-medium text-purple-600 dark:text-purple-400"
                >
                  İletişim
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Rights */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <p>© {new Date().getFullYear()} WattyBoon. Tüm hakları saklıdır.</p>
        </div>

      </div>
    </footer>
  );
};
