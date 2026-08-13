import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Category, Visibility, Chapter } from '../types';
import { AIAssistantModal } from './AIAssistantModal';
import { FormattedContent } from './FormattedContent';
import { uploadImageToHost } from '../lib/imageUpload';
import { 
  PenTool, 
  Sparkles, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Quote, 
  List, 
  ListOrdered, 
  Image as ImageIcon, 
  Code, 
  Lock, 
  Globe, 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Clock, 
  FileText, 
  Check, 
  Eye,
  Upload,
  Columns,
  Maximize2,
  X,
  Music,
  Headphones,
  Zap
} from 'lucide-react';

const CATEGORIES: Category[] = [
  'Genel',
  'Romantik',
  'Bilim Kurgu',
  'Fantastik',
  'Gizem',
  'Gerilim',
  'Korku',
  'Polisiye',
  'Paranormal',
  'Aksiyon',
  'Kişisel Blog',
  'Dram',
  'Şiir',
  'Teknoloji',
  'Hayran Kurgu',
  'Macera',
  'LGBTQ',
  'Psikoloji',
  'Tarihi',
];

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800',
];

export const StoryEditor: React.FC = () => {
  const { editingStoryId, stories, saveStory, deleteStory, setActiveView, openStoryReader } = useApp();

  const existingStory = stories.find((s) => s.id === editingStoryId);

  // Form State
  const [title, setTitle] = useState(existingStory?.title || '');
  const [summary, setSummary] = useState(existingStory?.summary || '');
  const [category, setCategory] = useState<Category>(existingStory?.category || 'Romantik');
  const [tagsInput, setTagsInput] = useState(existingStory?.tags.join(', ') || '');
  const [coverUrl, setCoverUrl] = useState(existingStory?.coverUrl || PRESET_COVERS[0]);
  const [visibility, setVisibility] = useState<Visibility>(existingStory?.visibility || 'public');
  const [status, setStatus] = useState<'ongoing' | 'completed'>(existingStory?.status || 'ongoing');
  const [isNsfw, setIsNsfw] = useState<boolean>(existingStory?.isNsfw || false);
  const [isShortStory, setIsShortStory] = useState<boolean>(existingStory?.isShortStory || false);
  const [musicUrl, setMusicUrl] = useState<string>(existingStory?.musicUrl || '');

  // Chapters State
  const [chapters, setChapters] = useState<Chapter[]>(
    existingStory?.chapters || [
      {
        id: 'chap_new_1',
        title: 'Bölüm 1: Başlangıç',
        content: '',
        order: 1,
        readCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      },
    ]
  );
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [editorViewMode, setEditorViewMode] = useState<'edit' | 'preview' | 'split'>('edit');

  // AI Modal
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [savedSuccessToast, setSavedSuccessToast] = useState(false);

  const activeChapter = chapters[activeChapterIndex] || chapters[0];

  // Helper to extract image URLs from chapter content
  const extractChapterImages = (content: string) => {
    const images: { alt: string; url: string; match: string }[] = [];
    // Markdown regex
    const mdRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    while ((match = mdRegex.exec(content)) !== null) {
      images.push({ alt: match[1] || 'Görsel', url: match[2], match: match[0] });
    }
    // Standalone image URL regex
    const lines = content.split(/\n+/);
    lines.forEach((line) => {
      const trimmed = line.trim();
      const isUrl = /^https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg)(\?[^\s]*)?$/i.test(trimmed) ||
                    /^data:image\/[a-zA-Z]+;base64,/i.test(trimmed);
      if (isUrl && !images.some((i) => i.url === trimmed)) {
        images.push({ alt: 'Görsel', url: trimmed, match: trimmed });
      }
    });
    return images;
  };

  const currentChapterImages = extractChapterImages(activeChapter?.content || '');

  const removeImageFromContent = (imageMatch: string) => {
    const updated = activeChapter.content.replace(imageMatch, '').replace(/\n\n\n+/g, '\n\n');
    handleChapterContentChange(updated);
  };

  // Update Chapter Content
  const handleChapterContentChange = (content: string) => {
    setChapters((prev) =>
      prev.map((c, idx) => (idx === activeChapterIndex ? { ...c, content } : c))
    );
  };

  const handleChapterTitleChange = (title: string) => {
    setChapters((prev) =>
      prev.map((c, idx) => (idx === activeChapterIndex ? { ...c, title } : c))
    );
  };

  const addNewChapter = () => {
    const nextOrder = chapters.length + 1;
    const newChap: Chapter = {
      id: 'chap_' + Date.now(),
      title: `Bölüm ${nextOrder}: İsimsiz`,
      content: '',
      order: nextOrder,
      readCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setChapters((prev) => [...prev, newChap]);
    setActiveChapterIndex(chapters.length);
  };

  const removeChapter = (index: number) => {
    if (chapters.length <= 1) return;
    setChapters((prev) => prev.filter((_, idx) => idx !== index));
    setActiveChapterIndex((prev) => Math.max(0, prev - 1));
  };

  // Rich Formatting Tool helpers
  const applyFormatting = (syntaxStart: string, syntaxEnd: string = '') => {
    const textarea = document.getElementById('chapter-content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = activeChapter.content;
    const selectedText = text.substring(start, end);

    const replacement = `${syntaxStart}${selectedText || 'metin'}${syntaxEnd}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    handleChapterContentChange(newContent);
  };

  // Device Image Upload Handlers
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Lütfen 10MB\'dan küçük bir görsel seçin.');
        return;
      }
      const hostedUrl = await uploadImageToHost(file);
      if (hostedUrl) {
        setCoverUrl(hostedUrl);
      }
    }
  };

  const handleChapterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Lütfen 10MB\'dan küçük bir görsel seçin.');
        return;
      }
      const hostedUrl = await uploadImageToHost(file);
      if (hostedUrl) {
        applyFormatting(`\n![Görsel](${hostedUrl})\n`);
      }
    }
  };

  // Stats
  const currentContent = activeChapter?.content || '';
  const wordCount = currentContent.trim() ? currentContent.trim().split(/\s+/).length : 0;
  const characterCount = currentContent.length;
  const estimatedReadingTime = Math.ceil(wordCount / 200) || 1;

  // Submit & Save
  const handleSave = (publishMode: Visibility) => {
    if (!title.trim()) {
      alert('Lütfen hikaye başlığını girin.');
      return;
    }

    const tagsArr = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const savedId = saveStory({
      id: existingStory?.id,
      title,
      summary,
      category,
      tags: tagsArr.length > 0 ? tagsArr : ['Genel'],
      coverUrl,
      visibility: publishMode,
      status,
      isNsfw,
      isShortStory,
      musicUrl,
      chapters,
    });

    setSavedSuccessToast(true);
    setTimeout(() => {
      setSavedSuccessToast(false);
      openStoryReader(savedId);
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in pb-28 md:pb-12">
      
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('library')}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            title="Geri Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PenTool className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              {existingStory ? 'Hikayeyi Düzenle' : 'Yeni Hikaye Kaleme Al'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kapak, kategori, görünürlük ve zengin içerik editörünü kullanarak yayınlayın.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {existingStory && (
            <button
              onClick={() => {
                if (window.confirm(`"${existingStory.title}" hikayesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
                  deleteStory(existingStory.id);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/80 hover:bg-rose-200 text-rose-700 dark:text-rose-300 font-bold text-xs transition-all"
              title="Hikayeyi Sil"
            >
              <Trash2 className="w-4 h-4" />
              Sil
            </button>
          )}
          <button
            onClick={() => handleSave('private')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all"
          >
            <Lock className="w-4 h-4 text-amber-500" />
            Özel Taslak Kaydet
          </button>
          <button
            onClick={() => handleSave('public')}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all"
          >
            <Globe className="w-4 h-4" />
            Herkese Açık Yayınla
          </button>
        </div>
      </div>

      {/* Success Toast Notification */}
      {savedSuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-xl animate-bounce">
          <span className="flex items-center gap-2">
            <Check className="w-5 h-5" /> Hikaye başarıyla kaydedildi! Okuyucu moduna aktarılıyorsunuz...
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Story Metadata Settings */}
        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            1. Hikaye Künyesi
          </h3>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Hikaye Başlığı *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Gece Yarısı Kütüphanesi..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Summary / Blurb */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Arka Kapak / Özet</label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Hikayenizi okuyuculara tanıtan ilgi çekici bir özet yazın..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori / Tür</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Etiketler (Virgülle Ayırın)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Aşk, Gizem, Şehir, Macera"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Cover Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Kapak Görseli</label>
              
              {/* Device File Upload Trigger */}
              <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 hover:bg-purple-100 font-bold text-[11px] flex items-center gap-1 transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>Cihazdan Yükle</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCoverFileUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
              {PRESET_COVERS.map((preset, idx) => (
                <img
                  key={idx}
                  src={preset}
                  alt="Preset"
                  onClick={() => setCoverUrl(preset)}
                  className={`w-14 h-20 object-cover rounded-xl cursor-pointer transition-all flex-shrink-0 ${
                    coverUrl === preset ? 'ring-4 ring-purple-600 scale-105' : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
            <input
              type="text"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="Veya Özel Görsel URL yapıştırın..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
            />

            {coverUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-purple-200 dark:border-purple-900/50 shadow-sm bg-slate-100 dark:bg-slate-800 p-1 group">
                <img 
                  src={coverUrl} 
                  alt="Kapak Görseli Önizleme" 
                  className="w-full h-36 object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PRESET_COVERS[0];
                  }}
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-bold">
                  Kapak Önizlemesi
                </div>
              </div>
            )}
          </div>

          {/* Visibility Options (Public vs Private requirement) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Yayınlama Görünürlüğü</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 text-xs font-bold transition-all ${
                  visibility === 'public'
                    ? 'bg-purple-50 dark:bg-purple-950/80 border-purple-500 text-purple-700 dark:text-purple-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-emerald-500" /> Herkese Açık</span>
                <span className="text-[10px] font-normal text-slate-400">Tüm okuyucular erişebilir</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 text-xs font-bold transition-all ${
                  visibility === 'private'
                    ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-500 text-amber-700 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-amber-500" /> Gizli / Özel</span>
                <span className="text-[10px] font-normal text-slate-400">Yalnızca siz görebilirsiniz</span>
              </button>
            </div>
          </div>

          {/* Kısa Hikaye / Short Story Toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/30 cursor-pointer transition-all hover:bg-amber-100/50">
              <input
                type="checkbox"
                checked={isShortStory}
                onChange={(e) => setIsShortStory(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
              <div>
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" /> Kısa Hikaye (Tek Oturuşluk)
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Ana sayfadaki "Kısa Hikayeler" öneri bandında öne çıkarılır.
                </p>
              </div>
            </label>
          </div>

          {/* Background Music Link (Spotify or YouTube) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Headphones className="w-4 h-4 text-emerald-500" />
              <span>İlham / Arka Plan Şarkısı (Spotify veya YouTube)</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={musicUrl}
                onChange={(e) => setMusicUrl(e.target.value)}
                placeholder="https://open.spotify.com/track/... veya YouTube linki"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Music className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
            </div>
            <p className="text-[10px] text-slate-400">
              Okuyucular hikayenizi okurken yazarken dinlediğiniz bu şarkıyı dinleyebilir.
            </p>
          </div>

          {/* +18 NSFW Toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 cursor-pointer transition-all hover:bg-rose-100/50">
              <input
                type="checkbox"
                checked={isNsfw}
                onChange={(e) => setIsNsfw(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
              />
              <div>
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[10px] rounded font-black">+18</span> Yetişkin İçerik (NSFW)
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Sadece +18 NSFW modu aktif olan kullanıcılara gösterilir.
                </p>
              </div>
            </label>
          </div>

        </div>

        {/* Right Column: Chapter Editor with Rich Toolbar & AI Assistant */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chapter Selector & Add Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center justify-between gap-3 overflow-x-auto">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {chapters.map((chap, idx) => (
                <button
                  key={chap.id}
                  onClick={() => setActiveChapterIndex(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeChapterIndex === idx
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-100'
                  }`}
                >
                  {chap.title || `Bölüm ${idx + 1}`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={addNewChapter}
                className="px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 font-bold text-xs flex items-center gap-1 hover:bg-purple-100"
                title="Yeni Bölüm Ekle"
              >
                <Plus className="w-4 h-4" /> Bölüm Ekle
              </button>
              {chapters.length > 1 && (
                <button
                  onClick={() => removeChapter(activeChapterIndex)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  title="Mevcut Bölümü Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Chapter Content Main Editor */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden flex flex-col">
            
            {/* Chapter Title Input & AI Assistant Trigger */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <input
                type="text"
                value={activeChapter.title}
                onChange={(e) => handleChapterTitleChange(e.target.value)}
                placeholder="Bölüm Başlığı (Örn: Bölüm 1: Tozlu Raflar)..."
                className="flex-1 text-base font-bold text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none placeholder-slate-400"
              />

              {/* AI Assistant Button */}
              <button
                type="button"
                onClick={() => setIsAIModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 hover:scale-105 transition-all self-start sm:self-auto"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Yapay Zeka Yazım Asistanı
              </button>
            </div>

            {/* Chapter Specific Music Link Input */}
            <div className="px-4 py-2 bg-emerald-50/40 dark:bg-emerald-950/20 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Headphones className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex-shrink-0">
                Bölüm Şarkısı:
              </span>
              <input
                type="url"
                value={activeChapter.musicUrl || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setChapters((prev) =>
                    prev.map((c, idx) => (idx === activeChapterIndex ? { ...c, musicUrl: val } : c))
                  );
                }}
                placeholder="Bu bölümü yazarken dinlediğiniz Spotify veya YouTube şarkı bağlantısı..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Rich Editor Toolbar */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-1 text-slate-700 dark:text-slate-300">
              <button 
                type="button"
                onClick={() => applyFormatting('**', '**')} 
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 font-bold" 
                title="Kalın (**metin**)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => applyFormatting('*', '*')} 
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 italic" 
                title="İtalik (*metin*)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => applyFormatting('<u>', '</u>')} 
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700" 
                title="Altı Çizili"
              >
                <Underline className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => applyFormatting('~~', '~~')} 
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700" 
                title="Üstü Çizili"
              >
                <Strikethrough className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

              <button 
                type="button"
                onClick={() => applyFormatting('# ')} 
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700" 
                title="Başlık 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => applyFormatting('## ')} 
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700" 
                title="Başlık 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

              <button 
                type="button"
                onClick={() => applyFormatting('> ')} 
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700" 
                title="Alıntı / Cümle"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => applyFormatting('- ')} 
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700" 
                title="Madde İşaretli Liste"
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => applyFormatting('1. ')} 
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700" 
                title="Numaralı Liste"
              >
                <ListOrdered className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

              <button 
                type="button"
                onClick={() => {
                  const url = prompt('Görsel URL adresini girin:');
                  if (url) applyFormatting(`![Görsel Açıklaması](${url})`);
                }} 
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-purple-600 dark:text-purple-400" 
                title="Görsel URL Yapıştır"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <label 
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-purple-600 dark:text-purple-400 cursor-pointer flex items-center gap-1 text-xs font-bold" 
                title="Cihazdan Dosya Seçip Görsel Ekle"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">Cihazdan Ekle</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleChapterImageUpload} 
                  className="hidden" 
                />
              </label>
              <button 
                type="button"
                onClick={() => applyFormatting('```\n', '\n```')} 
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700" 
                title="Kod / Metin Bloğu"
              >
                <Code className="w-4 h-4" />
              </button>

              {/* View Mode Toggle Buttons */}
              <div className="ml-auto flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setEditorViewMode('edit')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                    editorViewMode === 'edit'
                      ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                  title="Metin Düzenleyici"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Düzenle</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditorViewMode('preview')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                    editorViewMode === 'preview'
                      ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                  title="Canlı Resimli Önizleme"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Önizleme</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditorViewMode('split')}
                  className={`hidden md:flex px-2.5 py-1 rounded-lg text-[11px] font-bold items-center gap-1 transition-all ${
                    editorViewMode === 'split'
                      ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                  title="Yan Yana Düzenleme ve Canlı Resim Görünümü"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>İkili Görünüm</span>
                </button>
              </div>
            </div>

            {/* Editor Body based on View Mode */}
            {editorViewMode === 'edit' && (
              <div className="p-4 flex-1">
                <textarea
                  id="chapter-content-textarea"
                  rows={16}
                  value={activeChapter.content}
                  onChange={(e) => handleChapterContentChange(e.target.value)}
                  placeholder="Hikayenizin bu bölümünü buraya kaleme almaya başlayın..."
                  className="w-full h-full p-2 bg-transparent text-slate-800 dark:text-slate-100 font-serif text-base leading-relaxed focus:outline-none resize-none min-h-[350px]"
                />
              </div>
            )}

            {editorViewMode === 'preview' && (
              <div className="p-6 flex-1 min-h-[380px] bg-slate-50/50 dark:bg-slate-950/30 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-xl font-bold font-display text-purple-600 dark:text-purple-400 mb-6 border-b pb-2">
                    {activeChapter.title || 'İsimsiz Bölüm'}
                  </h3>
                  <FormattedContent 
                    content={activeChapter.content || 'Bu bölüm için henüz metin yazılmadı.'} 
                    paragraphClassName="text-base font-serif text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            )}

            {editorViewMode === 'split' && (
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 flex-1 min-h-[400px]">
                <div className="p-4 flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Metin Düzenleme</span>
                  <textarea
                    id="chapter-content-textarea"
                    rows={16}
                    value={activeChapter.content}
                    onChange={(e) => handleChapterContentChange(e.target.value)}
                    placeholder="Hikayenizi kaleme alın..."
                    className="w-full flex-1 p-2 bg-transparent text-slate-800 dark:text-slate-100 font-serif text-sm leading-relaxed focus:outline-none resize-none min-h-[320px]"
                  />
                </div>
                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/30 overflow-y-auto">
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2 block">Canlı Görsel ve Biçim Önizleme</span>
                  <FormattedContent 
                    content={activeChapter.content || 'İçerik yazıldıkça burada canlı olarak görünecek.'} 
                    paragraphClassName="text-sm font-serif text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            )}

            {/* Stats Footer */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <span><strong>{wordCount}</strong> kelime</span>
                <span><strong>{characterCount}</strong> karakter</span>
                <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                  <Clock className="w-3.5 h-3.5" /> Ort. {estimatedReadingTime} dk okuma süresi
                </span>
              </div>
              <span className="text-[11px] italic">Otomatik taslak aktif</span>
            </div>

          </div>

          {/* Chapter Images Live View & Management Gallery */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" /> Bölüme Eklenen Görseller ({currentChapterImages.length})
              </h4>
              <span className="text-[11px] text-slate-400">
                Resimler burada ve okuyucu ekranında canlı olarak görünür
              </span>
            </div>

            {currentChapterImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {currentChapterImages.map((img, i) => (
                  <div key={i} className="group relative bg-slate-50 dark:bg-slate-800 rounded-2xl p-2 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col items-center">
                    <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-900">
                      <img 
                        src={img.url} 
                        alt={img.alt} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800';
                        }}
                      />
                    </div>
                    <div className="w-full mt-2 flex items-center justify-between px-1">
                      <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 truncate max-w-[130px]">
                        {img.alt && img.alt !== 'Görsel' ? img.alt : `Görsel #${i+1}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeImageFromContent(img.match)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/80 transition-colors flex items-center gap-0.5 text-[10px] font-bold"
                        title="Görseli Bölümden Kaldır"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Kaldır</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-dashed border-purple-200 dark:border-purple-800/50 text-center space-y-1">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Bölüme henüz resim eklenmedi
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                  Araç çubuğundaki <strong>"Cihazdan Ekle"</strong> veya <strong>"Görsel URL Yapıştır"</strong> butonlarını kullanarak resim ekleyebilirsiniz. Eklediğiniz resimler anında burada ve <strong>"Önizleme"</strong> modunda görsel olarak görüntülenecektir.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        currentContent={activeChapter.content}
        onInsertText={(text) => {
          handleChapterContentChange(activeChapter.content + '\n\n' + text);
        }}
      />

    </div>
  );
};
