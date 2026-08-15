import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, LogIn, UserPlus, Mail, KeyRound, ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginWithGoogle, login, register, sendPasswordReset } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot' | 'google_quick'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [googleEmail, setGoogleEmail] = useState('semajim30@gmail.com');
  const [googleName, setGoogleName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    const res = await loginWithGoogle();
    setLoading(false);

    if (res.success) {
      setIsAuthModalOpen(false);
      setErrorMsg('');
    } else if (res.domainError) {
      // If browser blocked popup or unauthorized domain in dev preview, switch immediately to Google quick connect
      setActiveTab('google_quick');
      setErrorMsg(res.error || 'Google açılır penceresi kısıtlandı. Google hesabınızla anında devam edebilirsiniz:');
    } else {
      setErrorMsg(res.error || 'Google ile giriş yapılırken bir hata oluştu.');
    }
  };

  const handleGoogleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail || !googleEmail.includes('@')) {
      setErrorMsg('Lütfen geçerli bir Google e-posta adresi giriniz.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await loginWithGoogle(googleEmail, googleName);
    setLoading(false);

    if (res.success) {
      setIsAuthModalOpen(false);
      setErrorMsg('');
    } else {
      setErrorMsg(res.error || 'Giriş yapılırken bir hata oluştu.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Lütfen e-posta adresinizi veya kullanıcı adınızı giriniz.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      setIsAuthModalOpen(false);
      setEmail('');
      setPassword('');
      setErrorMsg('');
    } else {
      setErrorMsg(res.error || 'Giriş yapılırken bir hata oluştu.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedUsername || !trimmedEmail) {
      setErrorMsg('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    if (password && password.length < 6) {
      setErrorMsg('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await register(trimmedName, trimmedUsername, trimmedEmail, password);
    setLoading(false);

    if (res.success) {
      setIsAuthModalOpen(false);
      setEmail('');
      setPassword('');
      setName('');
      setUsername('');
      setErrorMsg('');
    } else {
      setErrorMsg(res.error || 'Kayıt olunurken bir hata oluştu.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await sendPasswordReset(email);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
    } else {
      setErrorMsg(res.error || 'E-posta gönderilirken bir hata oluştu.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-200 dark:border-purple-900/60 shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-white relative">
          <button 
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-white/80 transition-all cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="mb-1">
            <span className="text-3xl font-bold font-logo text-white drop-shadow-md">WattyBoon</span>
          </div>
          <p className="text-xs text-purple-100 mt-1">
            {activeTab === 'forgot'
              ? 'Şifrenizi e-posta yönlendirmesiyle güvenle sıfırlayın.'
              : activeTab === 'google_quick'
              ? 'Google hesabınızla tek tıkla doğrudan bağlanın.'
              : 'Hikaye dünyasına adım atın, dilediğiniz gibi giriş yapın veya kaydolun.'}
          </p>
        </div>

        {/* Tabs (Hide tabs when on forgot password or quick google view) */}
        {activeTab !== 'forgot' && activeTab !== 'google_quick' && (
          <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs font-bold">
            <button
              onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-center transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-center transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Kaydol
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 font-medium border border-rose-200 dark:border-rose-900 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-900 flex items-start gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google Sign In Primary Button (On Login & Register tabs) */}
          {(activeTab === 'login' || activeTab === 'register') && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50/30 dark:hover:bg-slate-700/50 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-sm flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loading ? 'Google ile İşlem Yapılıyor...' : 'Google ile Devam Et'}</span>
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
                <span className="bg-white dark:bg-slate-900 px-3 text-[10px] text-slate-400 font-medium shrink-0 uppercase tracking-wider">
                  veya form ile {activeTab === 'login' ? 'giriş yapın' : 'kaydolun'}
                </span>
                <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
              </div>
            </div>
          )}

          {/* Google Quick Connect Fallback Tab */}
          {activeTab === 'google_quick' && (
            <form onSubmit={handleGoogleQuickSubmit} className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 text-purple-900 dark:text-purple-200">
                <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Google Hızlı Bağlantı
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Google e-posta adresinizi onaylayarak tek tıkla hesabınızı oluşturabilir veya mevcut hesabınıza anında bağlanabilirsiniz.
                </p>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Google E-posta Adresi</label>
                <div className="relative">
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="ornek@gmail.com"
                    required
                    className="w-full p-3 pl-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Görünecek İsim (Opsiyonel)</label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="Adınız veya Takma Adınız"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                {loading ? 'Bağlanılıyor...' : 'Google ile Anında Giriş Yap'}
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Standart Giriş Ekranına Dön
              </button>
            </form>
          )}

          {/* Login View */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">E-posta veya Kullanıcı Adı</label>
                <div className="relative">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@mail.com veya kullanıcı adı"
                    required
                    className="w-full p-3 pl-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-500 dark:text-slate-400 font-bold">Şifre</label>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-bold cursor-pointer"
                  >
                    Şifremi unuttum?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 pl-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>
          )}

          {/* Register View */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Ad Soyad</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ahmet Yılmaz"
                  required
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Kullanıcı Adı</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ahmet_y"
                  required
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">E-posta Adresi</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ahmet@novella.app"
                    required
                    className="w-full p-3 pl-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Şifre (En az 6 karakter)</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                    className="w-full p-3 pl-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                {loading ? 'Kaydolunuyor...' : 'Ücretsiz Kaydol'}
              </button>
            </form>
          )}

          {/* Forgot Password View */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 text-purple-900 dark:text-purple-200">
                <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Şifremi Unuttum
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Sistemde kayıtlı e-posta adresinizi girdiğinizde, şifrenizi güvenle yenilemeniz için e-posta adresinize sıfırlama bağlantısı gönderilecektir.
                </p>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">E-posta Adresi</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hesap@novella.app"
                    required
                    className="w-full p-3 pl-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                {loading ? 'E-posta Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Giriş Ekranına Dön
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
