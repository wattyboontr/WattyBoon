import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Category } from '../types';
import { StoryCard } from './StoryCard';
import { 
  Sparkles, 
  Heart, 
  Rocket, 
  Wand2, 
  Compass, 
  BookOpen, 
  Frown, 
  Feather, 
  Cpu, 
  Zap, 
  Map as MapIcon, 
  ShieldAlert, 
  Grid,
  Flame,
  CheckCircle2,
  ChevronRight,
  Star,
  Crown,
  Search,
  Shield,
  Moon,
  Brain,
  Lightbulb,
  PenTool,
  Smile,
  SlidersHorizontal,
  ArrowLeft,
  X
} from 'lucide-react';

export interface CategoryInfo {
  name: Category;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverBorder: string;
  gradient: string;
  desc: string;
  popularTag: string;
}

export const ALL_CATEGORIES_DATA: CategoryInfo[] = [
  {
    name: 'Fantastik',
    icon: <Wand2 className="w-5 h-5" />,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/40',
    borderColor: 'border-purple-200 dark:border-purple-800/60',
    hoverBorder: 'hover:border-purple-400 dark:hover:border-purple-600',
    gradient: 'from-purple-600 to-indigo-600',
    desc: 'Sihirli dünyalar, krallıklar, büyüler ve efsanevi yaratıklar.',
    popularTag: 'Büyü',
  },
  {
    name: 'Bilim Kurgu',
    icon: <Rocket className="w-5 h-5" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    borderColor: 'border-blue-200 dark:border-blue-800/60',
    hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-600',
    gradient: 'from-blue-600 to-cyan-600',
    desc: 'Gelecek teknolojileri, yapay zeka, uzay ve distopik evrenler.',
    popularTag: 'Gelecek',
  },
  {
    name: 'Romantik',
    icon: <Heart className="w-5 h-5" />,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    borderColor: 'border-rose-200 dark:border-rose-800/60',
    hoverBorder: 'hover:border-rose-400 dark:hover:border-rose-600',
    gradient: 'from-rose-600 to-pink-600',
    desc: 'Aşk, duygu fırtınaları, fedakarlık ve unutulmaz sevdalar.',
    popularTag: 'Aşk',
  },
  {
    name: 'Macera',
    icon: <MapIcon className="w-5 h-5" />,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-200 dark:border-amber-800/60',
    hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-600',
    gradient: 'from-amber-600 to-orange-600',
    desc: 'Keşifler, tehlikeli görevler ve heyecan dolu yolculuklar.',
    popularTag: 'Keşif',
  },
  {
    name: 'Genç Kurgu',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800/60',
    hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-600',
    gradient: 'from-emerald-600 to-teal-600',
    desc: 'Gençlik heyecanları, okul hayatı, dostluk ve büyüme hikayeleri.',
    popularTag: 'Lise',
  },
  {
    name: 'Hayran Kurgu',
    icon: <Star className="w-5 h-5" />,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-950/40',
    borderColor: 'border-pink-200 dark:border-pink-800/60',
    hoverBorder: 'hover:border-pink-400 dark:hover:border-pink-600',
    gradient: 'from-pink-600 to-rose-600',
    desc: 'Sevilen kurgusal evrenlerin hayran kalemiyle yeniden anlatılışı.',
    popularTag: 'Fanfic',
  },
  {
    name: 'Mitoloji',
    icon: <Crown className="w-5 h-5" />,
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-100/60 dark:bg-amber-950/40',
    borderColor: 'border-amber-300 dark:border-amber-800/80',
    hoverBorder: 'hover:border-amber-500 dark:hover:border-amber-500',
    gradient: 'from-amber-700 to-yellow-600',
    desc: 'Tanrılar, antik efsaneler, kadim destanlar ve mitler.',
    popularTag: 'Efsane',
  },
  {
    name: 'Dram',
    icon: <Frown className="w-5 h-5" />,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
    borderColor: 'border-indigo-200 dark:border-indigo-800/60',
    hoverBorder: 'hover:border-indigo-400 dark:hover:border-indigo-600',
    gradient: 'from-indigo-600 to-purple-600',
    desc: 'Derin hayat mücadeleleri, aile bağları ve sarsıcı deneyimler.',
    popularTag: 'Hayat',
  },
  {
    name: 'LGBTQ+',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-950/40',
    borderColor: 'border-violet-200 dark:border-violet-800/60',
    hoverBorder: 'hover:border-violet-400 dark:hover:border-violet-600',
    gradient: 'from-violet-600 to-fuchsia-600',
    desc: 'Çeşitlilik, sevgi, özgürlük ve kendini bulma yolculukları.',
    popularTag: 'Aşk',
  },
  {
    name: 'Şiir',
    icon: <Feather className="w-5 h-5" />,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-950/40',
    borderColor: 'border-teal-200 dark:border-teal-800/60',
    hoverBorder: 'hover:border-teal-400 dark:hover:border-teal-600',
    gradient: 'from-teal-600 to-emerald-600',
    desc: 'Dize dize duygusal anlatımlar, lirik dizeler ve özgün şiirler.',
    popularTag: 'Duygu',
  },
  {
    name: 'Mizah',
    icon: <Smile className="w-5 h-5" />,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/40',
    borderColor: 'border-yellow-200 dark:border-yellow-800/60',
    hoverBorder: 'hover:border-yellow-400 dark:hover:border-yellow-600',
    gradient: 'from-yellow-500 to-amber-600',
    desc: 'Eğlenceli kurgular, kahkaha dolu diyaloglar ve komedi.',
    popularTag: 'Komedi',
  },
  {
    name: 'Gizem / Gerilim',
    icon: <Compass className="w-5 h-5" />,
    color: 'text-slate-700 dark:text-slate-300',
    bgColor: 'bg-slate-100 dark:bg-slate-800/80',
    borderColor: 'border-slate-300 dark:border-slate-700',
    hoverBorder: 'hover:border-slate-500 dark:hover:border-slate-500',
    gradient: 'from-slate-700 to-slate-900',
    desc: 'Sır perdesi, zeka oyunları, gerilim ve beklenmedik sonlar.',
    popularTag: 'Sır',
  },
  {
    name: 'Gizem',
    icon: <Search className="w-5 h-5" />,
    color: 'text-slate-700 dark:text-slate-300',
    bgColor: 'bg-slate-100 dark:bg-slate-800/80',
    borderColor: 'border-slate-300 dark:border-slate-700',
    hoverBorder: 'hover:border-slate-500 dark:hover:border-slate-500',
    gradient: 'from-slate-700 to-slate-900',
    desc: 'Cevapsız sorular ve bilinmezliğe doğru sürükleyici adımlar.',
    popularTag: 'Gizemli',
  },
  {
    name: 'Gerilim',
    icon: <ShieldAlert className="w-5 h-5" />,
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/40',
    borderColor: 'border-orange-200 dark:border-orange-800/60',
    hoverBorder: 'hover:border-orange-400 dark:hover:border-orange-600',
    gradient: 'from-orange-600 to-red-600',
    desc: 'Tansiyonu hiç düşmeyen, nabzı hızlandıran anlar.',
    popularTag: 'Tehlike',
  },
  {
    name: 'Korku',
    icon: <Flame className="w-5 h-5" />,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/40',
    borderColor: 'border-red-200 dark:border-red-800/60',
    hoverBorder: 'hover:border-red-400 dark:hover:border-red-600',
    gradient: 'from-red-600 to-rose-700',
    desc: 'Karanlık varlıklar, tekinsiz mekanlar ve ürpertici geceler.',
    popularTag: 'Karanlık',
  },
  {
    name: 'Polisiye',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-slate-800 dark:text-slate-200',
    bgColor: 'bg-slate-200/70 dark:bg-slate-800',
    borderColor: 'border-slate-400 dark:border-slate-600',
    hoverBorder: 'hover:border-slate-600 dark:hover:border-slate-400',
    gradient: 'from-slate-800 to-zinc-900',
    desc: 'Dedektif vakaları, suç soruşturmaları ve delil takibi.',
    popularTag: 'Cinayet',
  },
  {
    name: 'Paranormal',
    icon: <Moon className="w-5 h-5" />,
    color: 'text-indigo-700 dark:text-indigo-300',
    bgColor: 'bg-indigo-100/70 dark:bg-indigo-950/60',
    borderColor: 'border-indigo-300 dark:border-indigo-800',
    hoverBorder: 'hover:border-indigo-500 dark:hover:border-indigo-500',
    gradient: 'from-indigo-700 to-purple-800',
    desc: 'Ruhlar, açıklanamayan olaylar ve doğaüstü güçler.',
    popularTag: 'Ruh',
  },
  {
    name: 'Aksiyon',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/40',
    borderColor: 'border-orange-200 dark:border-orange-800/60',
    hoverBorder: 'hover:border-orange-400 dark:hover:border-orange-600',
    gradient: 'from-orange-600 to-amber-600',
    desc: 'Hızlı tempolu sahneler, dövüşler ve amansız kovalamacalar.',
    popularTag: 'Dövüş',
  },
  {
    name: 'Psikoloji',
    icon: <Brain className="w-5 h-5" />,
    color: 'text-fuchsia-600 dark:text-fuchsia-400',
    bgColor: 'bg-fuchsia-50 dark:bg-fuchsia-950/40',
    borderColor: 'border-fuchsia-200 dark:border-fuchsia-800/60',
    hoverBorder: 'hover:border-fuchsia-400 dark:hover:border-fuchsia-600',
    gradient: 'from-fuchsia-600 to-pink-600',
    desc: 'İnsan zihninin labirentleri, iç çatışmalar ve psikolojik çözümlemeler.',
    popularTag: 'Zihin',
  },
  {
    name: 'Tarihi',
    icon: <BookOpen className="w-5 h-5" />,
    color: 'text-amber-800 dark:text-amber-200',
    bgColor: 'bg-amber-100/80 dark:bg-amber-900/40',
    borderColor: 'border-amber-300 dark:border-amber-700',
    hoverBorder: 'hover:border-amber-500 dark:hover:border-amber-500',
    gradient: 'from-amber-800 to-yellow-800',
    desc: 'Eski çağlar, imparatorluklar, tarihi olaylar ve dönem romanları.',
    popularTag: 'Dönem',
  },
  {
    name: 'Felsefe',
    icon: <Lightbulb className="w-5 h-5" />,
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-100/60 dark:bg-purple-950/60',
    borderColor: 'border-purple-300 dark:border-purple-800',
    hoverBorder: 'hover:border-purple-500 dark:hover:border-purple-500',
    gradient: 'from-purple-700 to-indigo-800',
    desc: 'Varoluşsal sorgulamalar, etik ikilemler ve düşünsel metinler.',
    popularTag: 'Varoluş',
  },
  {
    name: 'Kişisel Blog',
    icon: <PenTool className="w-5 h-5" />,
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-950/40',
    borderColor: 'border-sky-200 dark:border-sky-800/60',
    hoverBorder: 'hover:border-sky-400 dark:hover:border-sky-600',
    gradient: 'from-sky-600 to-blue-600',
    desc: 'Yazarların şahsi deneyimleri, günlük notları ve samimi düşünceleri.',
    popularTag: 'Günlük',
  },
  {
    name: 'Teknoloji',
    icon: <Cpu className="w-5 h-5" />,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/40',
    borderColor: 'border-cyan-200 dark:border-cyan-800/60',
    hoverBorder: 'hover:border-cyan-400 dark:hover:border-cyan-600',
    gradient: 'from-cyan-600 to-blue-600',
    desc: 'Yazılım, dijital dünya, siber güvenlik ve inovasyon kurguları.',
    popularTag: 'Yazılım',
  },
  {
    name: 'Genel',
    icon: <Grid className="w-5 h-5" />,
    color: 'text-slate-600 dark:text-slate-300',
    bgColor: 'bg-slate-50 dark:bg-slate-900',
    borderColor: 'border-slate-200 dark:border-slate-800',
    hoverBorder: 'hover:border-purple-400 dark:hover:border-purple-500',
    gradient: 'from-slate-600 to-slate-800',
    desc: 'Tüm temaları harmanlayan, kategorilere sığmayan özgür hikayeler.',
    popularTag: 'Genel',
  },
];

export const CategoriesView: React.FC = () => {
  const { 
    stories, 
    selectedCategoryFilter, 
    setSelectedCategoryFilter,
    selectedTagFilter,
    setSelectedTagFilter,
    setActiveView,
    isNsfwEnabled,
    toggleNsfw,
    openStoryEditor
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    selectedCategoryFilter !== 'Tümü' ? selectedCategoryFilter : null
  );

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return ALL_CATEGORIES_DATA;
    const q = searchQuery.toLowerCase().trim();
    return ALL_CATEGORIES_DATA.filter(
      (c) => c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.popularTag.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Stories for selected category or all stories
  const categoryStories = useMemo(() => {
    if (!selectedCategory) return [];
    return stories.filter((s) => s.visibility === 'public' && s.category === selectedCategory);
  }, [stories, selectedCategory]);

  const handleSelectCategory = (catName: Category) => {
    if (selectedCategory === catName) {
      setSelectedCategory(null);
      setSelectedCategoryFilter('Tümü');
    } else {
      setSelectedCategory(catName);
      setSelectedCategoryFilter(catName);
    }
  };

  const getStoryCountForCategory = (categoryName: string) => {
    return stories.filter((s) => s.visibility === 'public' && s.category === categoryName).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in pb-24 md:pb-12">
      
      {/* Top Breadcrumb & Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-purple-800/40">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Tüm Türler & Edebiyat Kategorileri</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight text-white">
            İlhamını Seç, Dünyanı Keşfet
          </h1>

          <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed max-w-2xl">
            Romantikten bilim kurguya, fantastik evrenlerden gizem dolu polisiye kurgularına kadar WattyBoon'daki 20'den fazla edebiyat kategorisindeki binlerce özgün hikayeye göz atın.
          </p>

          {/* Search bar inside hero */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-purple-300 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kategori veya tür ara (örn: Fantastik, Aşk, Şiir)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 text-white placeholder-purple-200/60 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-purple-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setSelectedCategoryFilter('Tümü');
                setActiveView('explore');
              }}
              className="px-5 py-3 rounded-2xl bg-white text-purple-950 hover:bg-purple-50 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Compass className="w-4 h-4 text-purple-600" />
              <span>Tüm Hikayeleri Keşfet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Adult Content & Preference Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isNsfwEnabled ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Yetişkin / +18 İçerik Filtresi
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isNsfwEnabled ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {isNsfwEnabled ? 'Açık (+18 Eserler Görünür)' : 'Kapalı (Güvenli Mod)'}
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Yetişkin içerik barındıran kurguları listelemek veya gizlemek için bu ayarı değiştirebilirsiniz.
            </p>
          </div>
        </div>

        <button
          onClick={toggleNsfw}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            isNsfwEnabled
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20'
              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          {isNsfwEnabled ? 'Yetişkin Modunu Kapat' : 'Yetişkin Modunu Aç (+18)'}
        </button>
      </div>

      {/* Selected Category Stories Drawer if active */}
      {selectedCategory && (
        <section className="p-6 rounded-3xl bg-purple-50/50 dark:bg-purple-950/20 border-2 border-purple-300 dark:border-purple-800/80 space-y-6 animate-fade-in shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-200/60 dark:border-purple-900/60 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedCategoryFilter('Tümü');
                }}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 text-purple-600 transition-colors"
                title="Kategori seçimini temizle"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{selectedCategory} Kategorisindeki Eserler</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-xs font-bold">
                    {categoryStories.length} Eser
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Bu kategoride yayınlanmış hikayeleri doğrudan aşağıda okuyabilir veya Keşfet sayfasına geçebilirsiniz.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedCategoryFilter(selectedCategory);
                  setActiveView('explore');
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Keşfet Sayfasında Filtrele</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedCategoryFilter('Tümü');
                }}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {categoryStories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {categoryStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-purple-100 dark:border-purple-900/40 p-6 space-y-3">
              <BookOpen className="w-10 h-10 text-purple-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Bu kategoride henüz yayınlanmış bir hikaye bulunmuyor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Bu türde ilk eseri sen kaleme alarak WattyBoon okuyucularıyla buluşturabilirsin!
              </p>
              <button
                onClick={() => openStoryEditor(null)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md hover:bg-purple-700 transition-colors"
              >
                + Bu Kategoride Hikaye Yaz
              </button>
            </div>
          )}
        </section>
      )}

      {/* Category Grid Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Grid className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Kategori Listesi ({filteredCategories.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              İlgilendiğiniz türdeki eserleri görüntülemek için ilgili karta tıklayın.
            </p>
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline"
            >
              Aramayı Temizle
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => {
            const count = getStoryCountForCategory(cat.name);
            const isSelected = selectedCategory === cat.name;

            return (
              <div
                key={cat.name}
                onClick={() => handleSelectCategory(cat.name)}
                className={`relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xl shadow-purple-500/25 scale-[1.02] ring-2 ring-purple-400'
                    : `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ${cat.hoverBorder} hover:shadow-lg hover:scale-[1.01]`
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
                      isSelected ? 'bg-white/20 text-white' : `${cat.bgColor} ${cat.color} ${cat.borderColor} border`
                    }`}>
                      {cat.icon}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                        isSelected 
                          ? 'bg-white/25 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}>
                        {count} Hikaye
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-base font-black tracking-tight ${
                      isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors'
                    }`}>
                      {cat.name}
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed ${
                      isSelected ? 'text-purple-100' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {cat.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className={`text-[11px] font-bold ${
                    isSelected ? 'text-purple-200' : 'text-slate-400'
                  }`}>
                    #{cat.popularTag}
                  </span>

                  <span className={`text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform ${
                    isSelected ? 'text-white' : 'text-purple-600 dark:text-purple-400'
                  }`}>
                    {isSelected ? 'Seçildi' : 'İncele'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Write Story Callout */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl font-black">Kendi Türünde Bir Başyapıt Yarat</h3>
          <p className="text-xs text-purple-100 max-w-xl leading-relaxed">
            İstediğin kategoride hikayeni başlat, karakterlerini yarat ve binlerce okuyucunun beğenisine sun. WattyBoon editörüyle yazmak tamamen ücretsiz!
          </p>
        </div>
        <button
          onClick={() => openStoryEditor(null)}
          className="px-6 py-3.5 rounded-2xl bg-white text-purple-900 font-black text-xs hover:bg-purple-50 transition-all shadow-lg hover:scale-105 shrink-0 cursor-pointer"
        >
          + Hemen Hikaye Yazmaya Başla
        </button>
      </div>

    </div>
  );
};
