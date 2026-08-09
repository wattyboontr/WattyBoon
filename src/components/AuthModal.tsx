import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WattyboonLogo } from './WattyboonLogo';
import { X, LogIn, UserPlus, Sparkles, CheckCircle2, BookOpen } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const success = login(email);
    if (success) {
      setIsAuthModalOpen(false);
      setErrorMsg('');
    } else {
      setErrorMsg('Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !email) {
      setErrorMsg('Lütfen tüm alanları doldurun.');
      return;
    }
    register(name, username, email);
    setIsAuthModalOpen(false);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-200 dark:border-purple-900/60 shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-white relative">
          <button 
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-white/80"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="mb-1">
            <span className="text-3xl font-bold font-logo text-white drop-shadow-md">WattyBoon</span>
          </div>
          <p className="text-xs text-purple-100 mt-1">
            Hikaye dünyasına adım atın, kendi eserlerinizi kaleme alın.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-center transition-all ${
              activeTab === 'login'
                ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Giriş Yap
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-center transition-all ${
              activeTab === 'register'
                ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Kaydol
          </button>
        </div>


        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 font-medium border border-rose-200 dark:border-rose-900">
              {errorMsg}
            </div>
          )}

          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">E-posta Adresi</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elenora@novella.app"
                  required
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Giriş Yap
              </button>
            </form>
          )}

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
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ahmet@novella.app"
                  required
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Ücretsiz Kaydol
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
