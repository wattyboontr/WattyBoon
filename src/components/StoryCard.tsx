import React, { useState } from 'react';
import { Story } from '../types';
import { useApp } from '../context/AppContext';
import { BookOpen, Heart, Eye, Bookmark, Lock, Globe, ArrowRight, ListPlus } from 'lucide-react';
import { AddToCustomListModal } from './AddToCustomListModal';

interface StoryCardProps {
  story: Story;
  layout?: 'grid' | 'horizontal' | 'compact';
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, layout = 'grid' }) => {
  const { openStoryDetail, openStoryReader, openAuthorProfile, isStoryInLibrary, toggleLibraryStory, toggleLikeStory, currentUser } = useApp();
  const [isCustomListModalOpen, setIsCustomListModalOpen] = useState(false);

  const isSaved = isStoryInLibrary(story.id);
  const isLiked = currentUser ? story.likedBy.includes(currentUser.id) : false;

  if (layout === 'compact') {
    return (
      <div 
        onClick={() => openStoryDetail(story.id)}
        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-all group border border-transparent hover:border-purple-200 dark:hover:border-purple-900/50"
      >
        <img 
          src={story.coverUrl} 
          alt={story.title} 
          className="w-10 h-14 object-cover rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300" 
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium mb-0.5">
            <span>{story.category}</span>
            {story.visibility === 'private' && (
              <span className="flex items-center gap-1 px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded text-[10px] font-semibold">
                <Lock className="w-2.5 h-2.5" /> Özel
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {story.title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {story.authorName}
          </p>
        </div>
        <div className="text-right text-xs text-slate-400 flex flex-col items-end gap-1">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-slate-400" />
            {story.reads > 1000 ? `${(story.reads / 1000).toFixed(1)}k` : story.reads}
          </span>
        </div>
      </div>
    );
  }

  if (layout === 'horizontal') {
    return (
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-purple-200 dark:hover:border-purple-900/50 transition-all duration-300 group">
        {/* Vertical Cover Image */}
        <div 
          className="relative w-28 sm:w-32 aspect-[2/3] flex-shrink-0 rounded-xl overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-800" 
          onClick={() => openStoryDetail(story.id)}
        >
          <img 
            src={story.coverUrl} 
            alt={story.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-purple-900/80 backdrop-blur-md text-purple-100 border border-purple-400/30">
              {story.category}
            </span>
            {story.visibility === 'private' && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-amber-900/90 backdrop-blur-md text-amber-200 border border-amber-500/30 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Özel
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div 
                className="flex items-center gap-2 cursor-pointer group/author"
                onClick={() => openAuthorProfile(story.authorId)}
              >
                <img src={story.authorAvatar} alt={story.authorName} className="w-6 h-6 rounded-full object-cover" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover/author:text-purple-600 transition-colors">
                  {story.authorName}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLibraryStory(story.id);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  isSaved 
                    ? 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400' 
                    : 'text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isSaved ? 'Kütüphaneden Çıkar' : 'Kütüphaneye Ekle'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>

            <h3 
              onClick={() => openStoryDetail(story.id)}
              className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 cursor-pointer transition-colors line-clamp-1 mb-1.5"
            >
              {story.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 sm:line-clamp-3 mb-3 leading-relaxed font-normal">
              {story.summary}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                {story.chapters.length} Bölüm
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                {story.reads}
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLikeStory(story.id);
                }}
                className={`flex items-center gap-1 transition-colors hover:text-rose-500 ${isLiked ? 'text-rose-500 font-semibold' : ''}`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
                {story.likes}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => openStoryDetail(story.id)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all text-[11px]"
              >
                Hikaye Özeti
              </button>
              <button 
                onClick={() => openStoryReader(story.id)}
                className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all text-[11px] shadow-sm flex items-center gap-1"
              >
                Oku <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid Layout with Compact Cover Height
  return (
    <div className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-900/60 transition-all duration-300">
      {/* Vertical Book Cover Image Container */}
      <div 
        className="relative aspect-[2/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
        onClick={() => openStoryDetail(story.id)}
      >
        <img 
          src={story.coverUrl} 
          alt={story.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-900/80 backdrop-blur-md text-purple-200 border border-purple-500/20 shadow-sm">
              {story.category}
            </span>
            {story.isNsfw && (
              <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-rose-600 text-white shadow-md">
                +18
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {story.visibility === 'private' ? (
              <span className="p-1 rounded bg-amber-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30" title="Özel Hikaye">
                <Lock className="w-2.5 h-2.5" />
              </span>
            ) : (
              <span className="p-1 rounded bg-slate-900/60 backdrop-blur-md text-emerald-400 border border-emerald-500/20" title="Herkese Açık">
                <Globe className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        </div>

        {/* Quick Save & Custom List Buttons */}
        <div className="absolute bottom-1.5 right-1.5 flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsCustomListModalOpen(true);
            }}
            className="p-1.5 rounded-lg bg-slate-900/70 text-white/90 hover:bg-purple-600 backdrop-blur-md shadow-md transition-all transform active:scale-95"
            title="Listeye Ekle"
          >
            <ListPlus className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLibraryStory(story.id);
            }}
            className={`p-1.5 rounded-lg backdrop-blur-md shadow-md transition-all transform active:scale-95 ${
              isSaved 
                ? 'bg-purple-600 text-white' 
                : 'bg-slate-900/70 text-white/90 hover:bg-purple-600'
            }`}
            title={isSaved ? 'Kütüphaneden Çıkar' : 'Kütüphaneye Ekle'}
          >
            <Bookmark className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <AddToCustomListModal
        story={story}
        isOpen={isCustomListModalOpen}
        onClose={() => setIsCustomListModalOpen(false)}
      />

      {/* Content Body */}
      <div className="p-2 sm:p-2.5 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          {/* Title */}
          <h3 
            onClick={() => openStoryDetail(story.id)}
            className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 cursor-pointer transition-colors line-clamp-1 leading-snug"
            title={story.title}
          >
            {story.title}
          </h3>

          {/* Author info */}
          <div 
            className="flex items-center gap-1.5 mt-1 cursor-pointer group/author"
            onClick={() => openAuthorProfile(story.authorId)}
          >
            <img 
              src={story.authorAvatar} 
              alt={story.authorName} 
              className="w-4 h-4 rounded-full object-cover ring-1 ring-purple-300 dark:ring-purple-800" 
            />
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 group-hover/author:text-purple-600 dark:group-hover/author:text-purple-400 transition-colors truncate">
              {story.authorName}
            </span>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-0.5 font-medium text-slate-500 dark:text-slate-400">
            <BookOpen className="w-3 h-3 text-purple-500" />
            {story.chapters.length} b.
          </span>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5" title="Okunma">
              <Eye className="w-3 h-3 text-slate-400" />
              {story.reads > 1000 ? `${(story.reads / 1000).toFixed(1)}k` : story.reads}
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleLikeStory(story.id);
              }}
              className={`flex items-center gap-0.5 transition-colors hover:text-rose-500 ${isLiked ? 'text-rose-500 font-semibold' : ''}`}
              title="Beğeni"
            >
              <Heart className={`w-3 h-3 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
              {story.likes}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

