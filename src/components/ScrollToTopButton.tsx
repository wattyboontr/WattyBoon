import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-20 sm:bottom-8 right-5 sm:right-8 z-40 p-3.5 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white shadow-xl shadow-purple-600/30 border border-purple-400/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 group flex items-center justify-center cursor-pointer"
      title="Başa Dön"
      aria-label="Sayfanın en başına dön"
    >
      <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
};
