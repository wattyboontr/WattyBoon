import React from 'react';
import { useApp } from '../context/AppContext';
import { Category } from '../types';
import { 
  X, 
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
  Map, 
  ShieldAlert, 
  Grid,
  Flame,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory?: (category: Category | 'Tümü') => void;
}

interface CategoryGroup {
  title: string;
  description: string;
  categories: {
    name: Category;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
    desc: string;
    isNsfwOnly?: boolean;
  }[];
}

export const CategoriesModal: React.FC<CategoriesModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
}) => {
  const { 
    stories, 
    selectedCategoryFilter, 
    setSelectedCategoryFilter, 
    setActiveView,
    isNsfwEnabled,
    toggleNsfw
  } = useApp();

  if (!isOpen) return null;

  // Calculate story counts per category
  const getCategoryCount = (catName: Category | 'Tümü') => {
    if (catName === 'Tümü') {
      return stories.filter(s => isNsfwEnabled || !s.isNsfw).length;
    }
    return stories.filter(s => s.category === catName && (isNsfwEnabled || !s.isNsfw)).length;
  };

  const CATEGORY_GROUPS: CategoryGroup[] = [
    {
      title: 'Kurgu & Macera Sınıfı',
      description: 'Sürükleyici evrenler, efsaneler ve fantastik yolculuklar',
      categories: [
        {
          name: 'Fantastik',
          icon: <Wand2 className="w-5 h-5" />,
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-50 dark:bg-purple-950/50',
          borderColor: 'border-purple-200 dark:border-purple-800/60',
          desc: 'Sihirli dünyalar, krallıklar ve efsanevi yaratıklar',
        },
        {
          name: 'Bilim Kurgu',
          icon: <Rocket className="w-5 h-5" />,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-950/50',
          borderColor: 'border-blue-200 dark:border-blue-800/60',
          desc: 'Gelecek teknolojileri, uzay ve distopik dünyalar',
        },
        {
          name: 'Macera',
          icon: <Map className="w-5 h-5" />,
          color: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-950/50',
          borderColor: 'border-amber-200 dark:border-amber-800/60',
          desc: 'Keşifler, tehlikeli görevler ve heyecan dolu aksiyon',
        },
        {
          name: 'Genç Kurgu',
          icon: <Zap className="w-5 h-5" />,
          color: 'text-emerald-600 dark:text-emerald-400',
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
          borderColor: 'border-emerald-200 dark:border-emerald-800/60',
          desc: 'Gençlik heyecanları, okul hayatı ve arkadaşlıklar',
        },
      ],
    },
    {
      title: 'Duygu & Sırlar Sınıfı',
      description: 'Kalbe dokunan hikayeler, tutkular ve sürpriz gizemler',
      categories: [
        {
          name: 'Romantik',
          icon: <Heart className="w-5 h-5" />,
          color: 'text-rose-600 dark:text-rose-400',
          bgColor: 'bg-rose-50 dark:bg-rose-950/50',
          borderColor: 'border-rose-200 dark:border-rose-800/60',
          desc: 'Aşk, duygu fırtınaları ve unutulmaz sevdalar',
        },
        {
          name: 'Gizem / Gerilim',
          icon: <Compass className="w-5 h-5" />,
          color: 'text-slate-700 dark:text-slate-300',
          bgColor: 'bg-slate-100 dark:bg-slate-800/80',
          borderColor: 'border-slate-300 dark:border-slate-700',
          desc: 'Sır perdesi, suç vakaları ve beklenmedik sonlar',
        },
        {
          name: 'Dram',
          icon: <Frown className="w-5 h-5" />,
          color: 'text-indigo-600 dark:text-indigo-400',
          bgColor: 'bg-indigo-50 dark:bg-indigo-950/50',
          borderColor: 'border-indigo-200 dark:border-indigo-800/60',
          desc: 'Derin hayat hikayeleri, insan ilişkileri ve yüzleşmeler',
        },
      ],
    },
    {
      title: 'Sanat & Günlük Sınıfı',
      description: 'Düşünsel yazılar, ilham veren dize ve dijital dünyalar',
      categories: [
        {
          name: 'Şiir',
          icon: <Feather className="w-5 h-5" />,
          color: 'text-teal-600 dark:text-teal-400',
          bgColor: 'bg-teal-50 dark:bg-teal-950/50',
          borderColor: 'border-teal-200 dark:border-teal-800/60',
          desc: 'Dize dize duygusal anlatımlar ve özgün şiirler',
        },
        {
          name: 'Kişisel Blog',
          icon: <BookOpen className="w-5 h-5" />,
          color: 'text-sky-600 dark:text-sky-400',
          bgColor: 'bg-sky-50 dark:bg-sky-950/50',
          borderColor: 'border-sky-200 dark:border-sky-800/60',
          desc: 'Kişisel anılar, denemeler ve hayat gözlemleri',
        },
        {
          name: 'Teknoloji',
          icon: <Cpu className="w-5 h-5" />,
          color: 'text-cyan-600 dark:text-cyan-400',
          bgColor: 'bg-cyan-50 dark:bg-cyan-950/50',
          borderColor: 'border-cyan-200 dark:border-cyan-800/60',
          desc: 'Yazılım, yapay zeka ve teknoloji analizleri',
        },
      ],
    },
  ];

  const handleSelect = (category: Category | 'Tümü') => {
    setSelectedCategoryFilter(category);
    if (onSelectCategory) {
      onSelectCategory(category);
    }
    setActiveView('explore');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-900/40 flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-500/20">
              <Grid className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Kategori Rehberi
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 font-extrabold">
                  {CATEGORY_GROUPS.reduce((acc, g) => acc + g.categories.length, 0)} Kategori
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                İlginizi çeken edebiyat sınıfını seçerek hikayeleri keşfedin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Categories Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-8">
          
          {/* Top Hero Option: Tüm Kategoriler */}
          <div 
            onClick={() => handleSelect('Tümü')}
            className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
              selectedCategoryFilter === 'Tümü'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-600 shadow-xl shadow-purple-500/20'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-purple-400'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${selectedCategoryFilter === 'Tümü' ? 'bg-white/20 text-white' : 'bg-purple-100 dark:bg-purple-950 text-purple-600'}`}>
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-sm sm:text-base font-bold ${selectedCategoryFilter === 'Tümü' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  Tüm Kategorileri Gör
                </h3>
                <p className={`text-xs ${selectedCategoryFilter === 'Tümü' ? 'text-purple-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  Sınırlama olmaksızın platformdaki bütün eserleri listele ({getCategoryCount('Tümü')} Eser)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedCategoryFilter === 'Tümü' && (
                <span className="flex items-center gap-1 text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-4 h-4" /> Seçili
                </span>
              )}
              <ChevronRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${selectedCategoryFilter === 'Tümü' ? 'text-white' : 'text-slate-400'}`} />
            </div>
          </div>

          {/* Grouped Category Cards */}
          {CATEGORY_GROUPS.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    {group.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">{group.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                {group.categories.map((cat) => {
                  const count = getCategoryCount(cat.name);
                  const isSelected = selectedCategoryFilter === cat.name;

                  return (
                    <div
                      key={cat.name}
                      onClick={() => handleSelect(cat.name)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/20'
                          : `${cat.bgColor} ${cat.borderColor} hover:scale-[1.01]`
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-white/20 text-white' : `${cat.color} bg-white dark:bg-slate-900 shadow-sm`}`}>
                          {cat.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                              {cat.name}
                            </h4>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}>
                              {count} eser
                            </span>
                          </div>
                          <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-purple-100' : 'text-slate-500 dark:text-slate-400'}`}>
                            {cat.desc}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className={`w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special Adult +18 NSFW Category Banner */}
          <div className="pt-2">
            <div className={`p-5 rounded-2xl border transition-all ${
              isNsfwEnabled
                ? 'bg-rose-950/20 border-rose-500/40 text-rose-900 dark:text-rose-100'
                : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${isNsfwEnabled ? 'bg-rose-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-rose-600 text-white font-black text-[10px] rounded">+18 Sınıfı</span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Yetişkin & NSFW Kurgu Serileri
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Bu anahtarı açtığınızda +18 yaş sınırı içeren seriler arama ve kategori listelerinde görünür.
                    </p>
                  </div>
                </div>

                <button
                  onClick={toggleNsfw}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                    isNsfwEnabled
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 hover:bg-rose-700'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300'
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  <span>{isNsfwEnabled ? '+18 Modu AÇIK' : '+18 Modunu Aç'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs">
          <span className="text-slate-500">Kategori seçimi arama sonuçlarınızı filtreler.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
