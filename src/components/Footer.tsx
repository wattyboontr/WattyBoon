import React from 'react';
import { WattyboonLogo } from './WattyboonLogo';
import { InfoTabType } from './InfoModal';
import { BookOpen, Compass, PenTool, Bookmark, Heart, Grid, MessageSquare, Mail, Instagram, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface FooterProps {
  onOpenInfoModal: (tab: InfoTabType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenInfoModal }) => {
  const { setActiveView, openStoryEditor, setSelectedCategoryFilter } = useApp();

  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200 py-10 mt-12 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div 
              onClick={() => {
                setActiveView('home');
              }}
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
              Gezinme & Keşif
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button 
                  onClick={() => {
                    setActiveView('home');
                  }} 
                  className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  Ana Sayfa
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveView('explore');
                  }} 
                  className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" /> Keşfet
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveView('categories')} 
                  className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors flex items-center gap-1.5"
                >
                  <Grid className="w-3.5 h-3.5" /> Tüm Kategoriler
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
                  onClick={() => setActiveView('forum')} 
                  className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Topluluk ve Forum
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

          {/* Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Destek
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
                  İletişim Formu
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveView('sitemap')} 
                  className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300"
                >
                  Site Haritası
                </button>
              </li>
            </ul>
          </div>

          {/* Social Media - Takip Et */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Takip Et
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <a
                  href="https://www.instagram.com/wattyboon.tr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors flex items-center gap-2.5 group"
                >
                  <div className="p-1.5 rounded-lg bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform">
                    <Instagram className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-pink-600 dark:group-hover:text-pink-400">Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/WattyBoon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2.5 group"
                >
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-black group-hover:scale-110 transition-transform flex items-center justify-center w-6.5 h-6.5 text-xs">
                    𝕏
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">X (Twitter)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/wattyboon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2.5 group"
                >
                  <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Discord</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:wattyboontr@gmail.com"
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-2.5 group"
                >
                  <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">E-Posta</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Rights */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <p>© {new Date().getFullYear()} WattyBoon. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onOpenInfoModal('privacy')}
              className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Gizlilik ve Güvenlik
            </button>
            <span>•</span>
            <button 
              onClick={() => onOpenInfoModal('help')}
              className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Sıkça Sorulan Sorular
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
