import React, { useState } from 'react';
import { 
  X, 
  Info, 
  HelpCircle, 
  ShieldCheck, 
  Mail, 
  Send, 
  CheckCircle2, 
  ChevronDown, 
  BookOpen, 
  Heart, 
  Sparkles, 
  MessageSquare,
  Lock,
  Globe,
  MessageCircle,
  Play
} from 'lucide-react';
import { WattyboonLogo } from './WattyboonLogo';

export type InfoTabType = 'about' | 'help' | 'privacy' | 'contact';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: InfoTabType;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'about',
}) => {
  const [activeTab, setActiveTab] = useState<InfoTabType>(initialTab);

  // Sync tab when initialTab changes
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  if (!isOpen) return null;

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await fetch('https://formspree.io/f/xqpzerez', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          subject: contactSubject,
          message: contactMessage
        })
      });
      
      setIsSubmitted(true);
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    } catch (err) {
      setIsSubmitted(true);
    } finally {
      setIsSending(false);
    }
  };

  const faqs = [
    {
      q: 'WattyBoon platformunda nasıl hikaye yayınlarım?',
      a: 'Üst menüdeki "Hikaye Yaz" butonuna tıklayarak yeni bir hikaye taslağı oluşturabilir, bölümler ekleyebilir, etkileşimli seçimler tanımlayabilir ve istediğiniz an yayınlayabilirsiniz.',
    },
    {
      q: 'Kütüphaneme nasıl hikaye eklerim?',
      a: 'Beğendiğiniz herhangi bir hikaye kartında yer alan Kütüphane butonuna tıklayarak okuma listenize, favorilerinize veya özel oluşturduğunuz kategorilere ekleyebilirsiniz.',
    },
    {
      q: 'Yazarlara ve diğer okurlara nasıl direkt mesaj gönderebilirim?',
      a: 'Profil sayfasında veya hikaye detayındaki "Mesaj Gönder" butonuna tıklayarak veya üst bilgi çubuğundaki mesaj simgesinden sohbet başlatabilirsiniz.',
    },
    {
      q: 'Etkileşimli (Seçimli) hikayeler nasıl çalışır?',
      a: 'Yazarlar bölümlerin sonuna okurun hikayenin gidişatını belirlemesini sağlayan seçim seçenekleri ekler. Okur olarak yaptığınız seçim hikayenin sonraki akışını yönlendirir.',
    },
    {
      q: 'Hikayelerimi kimler görebilir?',
      a: 'Hikayenizi yayınlarken "Herkese Açık" veya "Taslak / Özel" olarak ayarlayabilirsiniz. Herkese açık hikayeler keşfet sayfasında ve profilinizde görünür.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <WattyboonLogo className="text-xl" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">| Bilgi & Destek</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-slate-100/70 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800 overflow-x-auto scrollbar-none px-6">
          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'about'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Info className="w-4 h-4" />
            Hakkımızda
          </button>

          <button
            onClick={() => setActiveTab('help')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'help'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Yardım & SSS
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Gizlilik Politikası
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'contact'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            İletişim
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* 1. HAKKIMIZDA */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/10 via-purple-600/10 to-indigo-900/10 border border-purple-500/20 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Hayal Gücünün Özgür Dünyası
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  WattyBoon, okurlar ile tutkulu yazarları bir araya getiren yeni nesil etkileşimli hikaye okuma ve yazma platformudur. 
                  Binlerce kurgu, sürükleyici romantizm, fantastik evrenler ve gizemli maceralar burada şekillenir.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Etkileşimli Okuma</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Hikayelerin gidişatına yön veren seçim sistemleriyle karar sizin elinizde.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Güçlü Topluluk</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bölüm içi yorumlar, beğeni, sohbet ve takip mekanizmaları ile yazarlarla yakınlaşın.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold">
                    <Heart className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Yazar Destekleri</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Eserlerinizi tüm dünyadaki binlerce kitapseverle kolayca buluşturun ve kitle edinin.
                  </p>
                </div>
              </div>

              {/* Sosyal Medya Hesaplarımız */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-50/80 via-slate-50 to-indigo-50/80 dark:from-purple-950/40 dark:via-slate-900 dark:to-indigo-950/40 border border-purple-200/70 dark:border-purple-900/40 text-center space-y-4 shadow-sm">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                    Bizi Sosyal Medyada Takip Edin
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    Güncel duyurular, haftalık hikaye yarışmaları ve yazar sohbetleri için topluluğumuza katılın!
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  {/* Instagram */}
                  <a
                    href="https://instagram.com/wattyboon"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:scale-110 transition-transform text-white shadow-md p-0"
                    title="Instagram @wattyboon"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </a>

                  {/* X (Twitter) */}
                  <a
                    href="https://x.com/wattyboon"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-900 hover:bg-black text-white hover:scale-110 transition-transform shadow-md border border-slate-700/80 font-black text-sm p-0 leading-none"
                    title="X (Twitter) @wattyboon"
                  >
                    𝕏
                  </a>

                  {/* Discord */}
                  <a
                    href="https://discord.gg/wattyboon"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 flex items-center justify-center rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white hover:scale-110 transition-transform shadow-md p-0"
                    title="Discord Topluluğu"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                  </a>

                  {/* Mail / İletişim */}
                  <a
                    href="mailto:iletisim@wattyboon.com"
                    className="w-11 h-11 flex items-center justify-center rounded-2xl bg-purple-600 hover:bg-purple-700 text-white hover:scale-110 transition-transform shadow-md p-0"
                    title="E-Posta: iletisim@wattyboon.com"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* 2. YARDIM & SSS */}
          {activeTab === 'help' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Sıkça Sorulan Sorular
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sık karşılaşılan konular için hızlı yanıtlar
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-purple-500 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedFaq === idx && (
                      <div className="p-4 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. GİZLİLİK POLITIKASI */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fade-in text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs">
                    Veri Güvenliği ve Gizlilik
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Son Güncelleme: 2026
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-500" /> 1. Kişisel Verilerin İşlenmesi
                </h4>
                <p>
                  WattyBoon olarak kullanıcılarımızın gizliliğine son derece önem veriyoruz. Hesabınızı oluştururken sağladığınız kullanıcı adı, e-posta adresi ve profil bilgileri şifrelenmiş ortamlarda güvenle tutulur.
                </p>

                <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-purple-500" /> 2. Çerezler ve Yerel Depolama
                </h4>
                <p>
                  Platform deneyiminizi iyileştirmek, okuma kaldığınız yer takibini sağlamak ve tema tercihlerinizi hatırlamak amacıyla yerel veri depolama teknolojileri kullanılmaktadır.
                </p>

                <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-500" /> 3. İçerik ve Telif Hakları
                </h4>
                <p>
                  Yazarlar tarafından oluşturulan tüm orijinal hikayeler ve içerikler ilgili yazarın fikri mülkiyetindedir. Platform izin alınmaksızın bu içerikleri 3. taraflarla paylaşmaz.
                </p>
              </div>
            </div>
          )}

          {/* 4. İLETİŞİM */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2 text-center">
                  <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Bize Mesaj Gönderin
                </h3>

                {isSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2 animate-fade-in">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                      Mesajınız Başarıyla İletildi!
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      Ekibimiz en kısa sürede belirttiğiniz e-posta adresi üzerinden size geri dönüş yapacaktır.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Yeni Mesaj Gönder
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-3.5 text-xs bg-slate-50 dark:bg-slate-800/40 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                        Adınız Soyadınız
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Örn. Ahmet Yılmaz"
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                        E-Posta Adresiniz
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="ahmet@example.com"
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                        Konu
                      </label>
                      <input
                        type="text"
                        required
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        placeholder="Örn. Telif Hakları, Destek veya Öneri"
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                        Mesajınız
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Bize iletmek istediğiniz detayları buraya yazabilirsiniz..."
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSending}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSending ? 'Gönderiliyor...' : 'Mesajı Gönder'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
