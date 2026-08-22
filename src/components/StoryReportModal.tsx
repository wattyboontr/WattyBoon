import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Story, ReportReason } from '../types';
import { 
  AlertTriangle, 
  X, 
  ShieldAlert, 
  FileWarning, 
  Link2, 
  CheckCircle2, 
  Send, 
  Lock, 
  Info 
} from 'lucide-react';

interface StoryReportModalProps {
  story: Story;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS: { key: ReportReason; title: string; desc: string; icon: any }[] = [
  {
    key: 'copyright_theft',
    title: 'Çalıntı / Telif Hakkı İhlali',
    desc: 'Bu eser başka bir yazardan veya platformdan izinsiz kopyalanmış / çalınmış.',
    icon: FileWarning,
  },
  {
    key: 'inappropriate_content',
    title: 'Uygunsuz / Müstehcen İçerik',
    desc: 'Platform kurallarına aykırı, etik dışı veya aşırı rahatsız edici içerik barındırıyor.',
    icon: ShieldAlert,
  },
  {
    key: 'hate_harassment',
    title: 'Nefret Söylemi / Zorbalık / Şiddet',
    desc: 'Kişi veya grupları hedef alan nefret, hakaret veya şiddet teşviki içeriyor.',
    icon: AlertTriangle,
  },
  {
    key: 'spam_misleading',
    title: 'Spam / Yanıltıcı Başlık',
    desc: 'Hikaye içeriği ile başlığı uyuşmuyor, tekrar eden spam veya reklam içeriyor.',
    icon: Info,
  },
  {
    key: 'other',
    title: 'Diğer Kural İhlali',
    desc: 'Yukarıdaki kategorilere uymayan diğer topluluk kuralı ihlalleri.',
    icon: AlertTriangle,
  },
];

export const StoryReportModal: React.FC<StoryReportModalProps> = ({
  story,
  isOpen,
  onClose,
}) => {
  const { currentUser, submitStoryReport, setIsAuthModalOpen } = useApp();
  const [selectedReason, setSelectedReason] = useState<ReportReason>('copyright_theft');
  const [description, setDescription] = useState('');
  const [originalSourceUrl, setOriginalSourceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Lütfen moderatörlerin inceleyebilmesi için kısa bir açıklama yazınız.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const reasonObj = REPORT_REASONS.find((r) => r.key === selectedReason);

    try {
      const res = await submitStoryReport({
        storyId: story.id,
        storyTitle: story.title,
        storyCoverUrl: story.coverUrl,
        authorId: story.authorId,
        authorName: story.authorName,
        authorUsername: story.authorUsername,
        reason: selectedReason,
        reasonTitle: reasonObj?.title || 'Şikayet',
        description: description.trim(),
        originalSourceUrl: originalSourceUrl.trim() || undefined,
      });

      if (res.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          setDescription('');
          setOriginalSourceUrl('');
          onClose();
        }, 2200);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Şikayet iletilirken bir sorun oluştu, lütfen tekrar deneyiniz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-purple-800 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Hikayeyi Rapor Et & Şikayet Bildir</h2>
              <p className="text-xs text-rose-100 opacity-90 truncate max-w-[260px] sm:max-w-xs">
                "{story.title}" - {story.authorName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {submitSuccess ? (
          <div className="p-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Şikayetiniz Başarıyla Alındı
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Yöneticilerimiz ve moderatör ekibi raporunuzu inceleyecek, çalıntı veya kural ihlali durumunda eser yayından kaldırılacaktır.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Reason Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Şikayet Nedeni <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedReason === r.key;
                  return (
                    <div
                      key={r.key}
                      onClick={() => setSelectedReason(r.key)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        checked={isSelected}
                        onChange={() => setSelectedReason(r.key)}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`} />
                          {r.title}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          {r.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Proof / Original URL (especially for copyright / stolen stories) */}
            {selectedReason === 'copyright_theft' && (
              <div className="animate-fade-in">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-rose-500" />
                  Orijinal Eser / Kaynak Bağlantısı (Opsiyonel)
                </label>
                <input
                  type="url"
                  placeholder="https://wattpad.com/... veya orijinal yazarın linki"
                  value={originalSourceUrl}
                  onChange={(e) => setOriginalSourceUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            )}

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Açıklama & Detaylar <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Lütfen hangi bölümlerde veya içeriklerde sorun olduğunu, çalıntı ise detaylarını belirtiniz..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Security Notice */}
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-[11px] text-amber-800 dark:text-amber-300">
              <Lock className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <p>
                Raporunuz gizli tutulacak ve yalnızca WattyBoon baş yöneticileri (semajim30@gmail.com) ve moderatörler tarafından incelenecektir.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Raporu Gönder</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
