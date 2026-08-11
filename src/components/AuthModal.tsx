import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, LogIn, UserPlus, Mail, KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, sendPasswordReset } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
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
    if (!name || !username || !email) {
      setErrorMsg('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await register(name, username, email, password);
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
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-white/80 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="mb-1">
            <span className="text-3xl font-bold font-logo text-white drop-shadow-md">WattyBoon</span>
          </div>
          <p className="text-xs text-purple-100 mt-1">
            {activeTab === 'forgot'
              ? 'Şifrenizi e-posta yönlendirmesiyle güvenle sıfırlayın.'
              : 'Hikaye dünyasına adım atın, kendi eserlerinizi kaleme alın.'}
          </p>
        </div>

        {/* Tabs (Hide tabs when on forgot password view) */}
        {activeTab !== 'forgot' && (
          <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs font-bold">
            <button
              onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-center transition-all ${
                activeTab === 'login'
                  ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-center transition-all ${
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
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-900 flex items-start gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
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
                    className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-bold"
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
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Şifre</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="En az 6 karakter"
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
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
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

