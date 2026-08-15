import React, { useState } from 'react';
import { X, Copy, Check, Share2, Globe, Sparkles, MessageCircle, Send, Twitter } from 'lucide-react';

interface ShareSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareSiteModal: React.FC<ShareSiteModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Derive the global public link
  // If in dev environment (ais-dev-...), convert to public share link (ais-pre-...)
  let publicUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-7oe223gwuvypfpsxozld3m-58180571079.europe-west3.run.app';
  if (publicUrl.includes('ais-dev-')) {
    publicUrl = publicUrl.replace('ais-dev-', 'ais-pre-');
  }

  const shareTitle = 'WattyBoon - Hikaye Okuma ve Yazma Platformu';
  const shareText = 'WattyBoon üzerindeki hikayeleri, yazarları ve romanları keşfedin!';

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(publicUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = publicUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: publicUrl,
        });
      } catch (err) {
        console.log('Share canceled/failed:', err);
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${shareTitle}\n${shareText}\n${publicUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTelegram = () => {
    const text = encodeURIComponent(shareTitle);
    const url = encodeURIComponent(publicUrl);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(`${shareTitle} - ${shareText}`);
    const url = encodeURIComponent(publicUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-200 dark:border-purple-900/60 shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-white/80 transition-all cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-6 h-6 text-purple-200" />
            <h3 className="text-xl font-bold font-logo text-white">WattyBoon'u Dünyayla Paylaş</h3>
          </div>
          <p className="text-xs text-purple-100 mt-1">
            Tüm ülkelerden, mobil ve masaüstü tüm cihazlardan erişilebilir genel bağlantı.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Info Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-100 dark:border-purple-900/60 text-slate-700 dark:text-slate-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-600 text-white shrink-0 mt-0.5 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Herkese Açık Genel Bağlantı</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Aşağıdaki bağlantı <strong>dünyanın her yerindeki</strong> arkadaşlarınıza açıktır. Arkadaşlarınız hesap açmak zorunda kalmadan tüm hikayeleri anında okuyabilir.
                </p>
              </div>
            </div>
          </div>

          {/* Copy Link Input Bar */}
          <div className="space-y-2">
            <label className="block text-slate-600 dark:text-slate-300 font-bold text-xs">
              Site Bağlantısı:
            </label>
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="flex-1 px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 truncate select-all">
                {publicUrl}
              </div>
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Kopyala</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-2">
            <span className="block text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider">
              Doğrudan Uygulamada Paylaş:
            </span>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold transition-all cursor-pointer text-xs"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleTelegram}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold transition-all cursor-pointer text-xs"
              >
                <Send className="w-4 h-4 text-sky-500" />
                <span>Telegram</span>
              </button>

              <button
                onClick={handleTwitter}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold transition-all cursor-pointer text-xs"
              >
                <Twitter className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <span>X / Twitter</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold transition-all cursor-pointer text-xs"
              >
                <Share2 className="w-4 h-4 text-purple-600" />
                <span>Diğer</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <p className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
              <span>Sunucu Durumu: <strong>Aktif (Global CDN & Cloud Run)</strong></span>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
