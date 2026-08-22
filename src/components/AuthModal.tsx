import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  AtSign, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Send,
  ShieldCheck,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { authSendVerificationCode, authVerifyCode, authResetPassword } from '../lib/cloudflare';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    login, 
    register, 
    loginWithGoogle,
    setAutoOpenProfileSettings,
    setActiveView 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'otp_verify' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pendingAction, setPendingAction] = useState<'register' | 'login' | 'reset'>('register');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  if (!isAuthModalOpen) return null;

  // Handle Standard Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Lütfen e-posta veya kullanıcı adınızı giriniz.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      setIsAuthModalOpen(false);
      setAutoOpenProfileSettings(true);
      setActiveView('profile');
      resetForm();
    } else {
      setErrorMsg(res.error || 'Giriş yapılırken bir sorun oluştu.');
    }
  };

  // Handle Register - Step 1: Send Verification OTP to email
  const handleRegisterInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedUsername = username.trim().replace(/^@/, '');
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedUsername || !trimmedEmail) {
      setErrorMsg('Lütfen tüm zorunlu alanları eksiksiz doldurunuz.');
      return;
    }
    if (!trimmedEmail.includes('@')) {
      setErrorMsg('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }
    if (password && password.length < 6) {
      setErrorMsg('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Send 6-digit confirmation code to email
    const sendRes = await authSendVerificationCode(trimmedEmail);
    setLoading(false);

    if (sendRes.success) {
      setCodeSent(true);
      setPendingAction('register');
      setActiveTab('otp_verify');
      if (sendRes.localCode) {
        setOtpCode(sendRes.localCode);
        setSuccessMsg(`Onay kodu (${sendRes.localCode}) ${trimmedEmail} adresine iletildi.`);
      } else {
        setSuccessMsg(`Onay kodu ${trimmedEmail} adresine iletildi. Lütfen gelen 6 haneli kodu giriniz.`);
      }
    } else {
      setErrorMsg(sendRes.error || 'Onay kodu gönderilemedi. Lütfen tekrar deneyiniz.');
    }
  };

  // Handle Register - Step 2: Verify OTP & Complete Registration
  const handleVerifyOtpAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setErrorMsg('Lütfen e-postanıza gelen doğrulama kodunu giriniz.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const verifyRes = await authVerifyCode(email.trim().toLowerCase(), otpCode.trim());
    if (!verifyRes.success) {
      setLoading(false);
      setErrorMsg(verifyRes.error || 'Geçersiz veya süresi dolmuş onay kodu.');
      return;
    }

    if (pendingAction === 'register') {
      const regRes = await register(name.trim(), username.trim(), email.trim().toLowerCase(), password);
      setLoading(false);
      if (regRes.success) {
        setIsAuthModalOpen(false);
        setAutoOpenProfileSettings(true);
        setActiveView('profile');
        resetForm();
      } else {
        setErrorMsg(regRes.error || 'Kayıt tamamlanamadı.');
      }
    } else if (pendingAction === 'reset') {
      const resetRes = await authResetPassword(email.trim().toLowerCase(), newPassword, otpCode.trim());
      setLoading(false);
      if (resetRes.success) {
        setSuccessMsg('Şifreniz başarıyla sıfırlandı! Şimdi yeni şifrenizle giriş yapabilirsiniz.');
        setActiveTab('login');
        setPassword('');
      } else {
        setErrorMsg(resetRes.error || 'Şifre sıfırlanamadı.');
      }
    }
  };

  // Handle Resend Code
  const handleResendCode = async () => {
    if (!email) return;
    setLoading(true);
    setErrorMsg('');
    const res = await authSendVerificationCode(email.trim().toLowerCase());
    setLoading(false);
    if (res.success) {
      setSuccessMsg('Yeni onay kodu e-posta adresinize gönderildi!');
    } else {
      setErrorMsg(res.error || 'Kod gönderilemedi.');
    }
  };

  // Handle Password Reset Request
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await authResetPassword(email.trim().toLowerCase());
    setLoading(false);

    if (res.success) {
      setPendingAction('reset');
      setActiveTab('otp_verify');
      setSuccessMsg('Şifre sıfırlama kodu e-postanıza gönderildi. Kodu ve yeni şifrenizi giriniz.');
    } else {
      setErrorMsg(res.error || 'İstek gönderilemedi.');
    }
  };

  // Handle Google Login
  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg('');
    const customEmail = email.trim() ? email.trim().toLowerCase() : undefined;
    const customName = name.trim() ? name.trim() : undefined;
    const res = await loginWithGoogle(customEmail, customName);
    setLoading(false);
    if (res.success) {
      setIsAuthModalOpen(false);
      setAutoOpenProfileSettings(true);
      setActiveView('profile');
      resetForm();
    } else {
      setErrorMsg(res.error || 'Google ile bağlantı kurulamadı.');
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setUsername('');
    setOtpCode('');
    setNewPassword('');
    setErrorMsg('');
    setSuccessMsg('');
    setCodeSent(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-200 dark:border-purple-900/60 shadow-2xl w-full max-w-md overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-white relative">
          <button 
            onClick={() => { setIsAuthModalOpen(false); resetForm(); }}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/15 text-white/90 transition-all cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl font-bold font-logo text-white drop-shadow-md">WattyBoon</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs">
              Cloudflare Güvenlikli
            </span>
          </div>
          
          <p className="text-xs text-purple-100 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            {activeTab === 'otp_verify'
              ? 'E-posta adresinize gönderilen güvenlik kodunu doğrulayın.'
              : activeTab === 'forgot'
              ? 'Şifrenizi e-posta onay koduyla yenileyin.'
              : activeTab === 'register'
              ? 'Kayıt olunca e-postanıza onay kodu gönderilir.'
              : 'Giriş yapın ve sınırsız hikaye dünyasına katılın.'}
          </p>
        </div>

        {/* Navigation Tabs */}
        {activeTab !== 'otp_verify' && activeTab !== 'forgot' && (
          <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs font-bold">
            <button
              onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-center transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 font-bold bg-purple-50/40 dark:bg-purple-950/20'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-center transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 font-bold bg-purple-50/40 dark:bg-purple-950/20'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Kayıt Ol (Onay Kodlu)
            </button>
          </div>
        )}

        {/* Content Body */}
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
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* GOOGLE ONE-CLICK BUTTON */}
          {(activeTab === 'login' || activeTab === 'register') && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50/30 dark:hover:bg-slate-700/50 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-sm flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{loading ? 'İşlem yapılıyor...' : 'Google ile Güvenli Giriş'}</span>
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
                <span className="bg-white dark:bg-slate-900 px-3 text-[10px] text-slate-400 font-medium shrink-0 uppercase tracking-wider">
                  veya {activeTab === 'login' ? 'giriş yapın' : 'e-posta ile kaydolun'}
                </span>
                <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
              </div>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  E-posta veya Kullanıcı Adı
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@mail.com veya @kullaniciadi"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">Şifre</label>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-purple-600 dark:text-purple-400 hover:underline text-[11px] font-medium"
                  >
                    Şifremi Unuttum?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Giriş Yap</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER WITH EMAIL VERIFICATION */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterInitiate} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Adınız & Soyadınız
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Elif Yılmaz"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Kullanıcı Adı (Yazar Kimliği)
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="elifyilmaz"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  E-posta Adresi (Onay Kodu İletilecek)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@mail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Güçlü Bir Şifre Belirleyin
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 mt-3"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Onay Kodu Gönder & Devam Et</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: OTP VERIFICATION VIEW */}
          {activeTab === 'otp_verify' && (
            <form onSubmit={handleVerifyOtpAndComplete} className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 text-center">
                <KeyRound className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-purple-950 dark:text-purple-100">
                  E-Posta Doğrulama Kodu
                </h4>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  <strong>{email}</strong> adresine gönderilen 6 haneli güvenlik kodunu giriniz:
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="w-full text-center text-2xl font-bold tracking-widest py-3 rounded-2xl border-2 border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 focus:outline-hidden focus:ring-4 focus:ring-purple-500/20"
                />
              </div>

              {pendingAction === 'reset' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Yeni Şifreniz
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer disabled:opacity-60"
                >
                  Kodu Tekrar Gönder
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{pendingAction === 'reset' ? 'Şifreyi Güncelle' : 'Doğrula & Kaydol'}</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-xs text-slate-500 hover:text-purple-600 font-medium"
                >
                  ← Bilgileri Değiştir
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: FORGOT PASSWORD */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Kayıtlı E-posta Adresiniz
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@mail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Sıfırlama Kodu Gönder</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline"
                >
                  ← Giriş Ekranına Dön
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info banner */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Tüm üyelere sınırsız hikaye yazma hakkı
          </span>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
            WattyBoon Cloudflare Engine
          </span>
        </div>

      </div>
    </div>
  );
};
