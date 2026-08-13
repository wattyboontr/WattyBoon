import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StoryCard } from './StoryCard';
import { UserRoleBadge } from './UserRoleBadge';
import { uploadImageToHost } from '../lib/imageUpload';
import { 
  User as UserIcon, 
  UserPlus, 
  UserCheck, 
  BookOpen, 
  Heart, 
  Calendar, 
  Lock, 
  Globe, 
  Edit3, 
  Check, 
  Sparkles,
  MessageCircle,
  Camera,
  Upload,
  Image as ImageIcon,
  Settings,
  Shield,
  KeyRound,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2,
  AlertCircle,
  LogIn,
  Compass
} from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const { 
    activeAuthorId, 
    currentUser, 
    users, 
    stories, 
    toggleFollowUser, 
    updateProfile, 
    openStoryEditor,
    openMessagingWithUser,
    changePassword,
    deleteAccount,
    setIsAuthModalOpen,
    setActiveView,
    autoOpenProfileSettings,
    setAutoOpenProfileSettings
  } = useApp();

  // If user is not logged in and not viewing a specific other author's profile, render guest login callout
  if (!currentUser && (!activeAuthorId || activeAuthorId === '')) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 shadow-2xl space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-100 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-lg shadow-purple-500/10">
            <UserIcon className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Profilinizi Görüntülemek İçin Giriş Yapın
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed font-medium">
              WattyBoon topluluğuna katılarak kendi özgün hikayelerinizi yayınlayabilir, beğendiğiniz yazarları takip edebilir ve kişisel kütüphanenizi yönetebilirsiniz.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> Giriş Yap / Ücretsiz Kaydol
            </button>
            <button
              onClick={() => setActiveView('explore')}
              className="px-6 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" /> Keşfet'e Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  const targetUserId = activeAuthorId || currentUser?.id || users[0].id;
  const author = users.find((u) => u.id === targetUserId) || currentUser || users[0];

  const isSelf = currentUser?.id === author.id;
  const isFollowing = currentUser?.following.includes(author.id);

  // Edit Bio & Images state
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [nameInput, setNameInput] = useState(author.name);
  const [bioInput, setBioInput] = useState(author.bio);
  const [avatarInput, setAvatarInput] = useState(author.avatar);
  const [coverInput, setCoverInput] = useState(author.coverUrl || '');

  // Auto-open settings if redirected right after registration
  useEffect(() => {
    if (autoOpenProfileSettings && isSelf) {
      setIsSettingsOpen(true);
      setAutoOpenProfileSettings(false);
    }
  }, [autoOpenProfileSettings, isSelf, setAutoOpenProfileSettings]);

  // Password & Security State
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  // Delete Account Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter public stories or public+private if viewing own profile
  const authorStories = stories.filter((s) => {
    if (s.authorId !== author.id) return false;
    if (isSelf) return true; // Author sees both public & private
    return s.visibility === 'public'; // Public sees only public
  });

  const totalReads = authorStories.reduce((acc, s) => acc + s.reads, 0);
  const totalLikes = authorStories.reduce((acc, s) => acc + s.likes, 0);

  const handleSaveBio = () => {
    updateProfile(bioInput, nameInput, avatarInput, coverInput);
    setIsEditingBio(false);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Yeni şifreniz en az 6 karakterden oluşmalıdır.' });
      return;
    }
    setIsSubmittingPass(true);
    setPasswordMsg(null);

    const res = await changePassword(newPassword);
    setIsSubmittingPass(false);

    if (res.success) {
      setPasswordMsg({ type: 'success', text: res.message || 'Şifreniz başarıyla değiştirildi.' });
      setNewPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: res.error || 'Şifre değiştirilirken bir hata oluştu.' });
    }
  };

  const handleDeleteAccountSubmit = async () => {
    if (deleteConfirmInput.trim().toUpperCase() !== 'SİL') {
      return;
    }
    setIsDeleting(true);
    await deleteAccount();
    setIsDeleting(false);
    setShowDeleteModal(false);
  };

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const hostedUrl = await uploadImageToHost(file);
      if (hostedUrl) {
        setAvatarInput(hostedUrl);
        updateProfile(bioInput, nameInput, hostedUrl, coverInput || author.coverUrl);
      }
    }
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const hostedUrl = await uploadImageToHost(file);
      if (hostedUrl) {
        setCoverInput(hostedUrl);
        updateProfile(bioInput, nameInput, avatarInput || author.avatar, hostedUrl);
      }
    }
  };

  const currentCover = coverInput || author.coverUrl || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1600';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in pb-24 md:pb-12">
      
      {/* Hidden File Inputs for Local Device Upload */}
      <input 
        id="avatar-file-upload" 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleAvatarFileUpload} 
      />
      <input 
        id="cover-file-upload" 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleCoverFileUpload} 
      />

      {/* Profile Header Banner */}
      <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        
        {/* Cover Background */}
        <div 
          className="h-48 sm:h-64 bg-cover bg-center relative transition-all duration-300"
          style={{ backgroundImage: `url(${currentCover})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Change Cover Button (If Own Profile) */}
          {isSelf && (
            <label 
              htmlFor="cover-file-upload"
              className="absolute top-4 right-4 px-3.5 py-2 rounded-2xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg transition-all border border-white/20 hover:scale-105"
            >
              <Camera className="w-4 h-4 text-purple-400" />
              <span>Kapak Resmini Değiştir</span>
            </label>
          )}
        </div>

        {/* Profile Content Details */}
        <div className="p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 -mt-20 sm:-mt-24 mb-6">
            
            {/* Avatar & Main Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative group">
                <img 
                  src={avatarInput || author.avatar} 
                  alt={author.name} 
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-2xl bg-slate-800"
                />
                {isSelf && (
                  <label 
                    htmlFor="avatar-file-upload"
                    className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer gap-1"
                  >
                    <Upload className="w-5 h-5 text-purple-300" />
                    <span>Resim Yükle</span>
                  </label>
                )}
                {isSelf && (
                  <label 
                    htmlFor="avatar-file-upload"
                    className="sm:hidden absolute -bottom-1 -right-1 p-2 rounded-full bg-purple-600 text-white shadow-lg cursor-pointer"
                    title="Resim Değiştir"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </label>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-slate-100">
                    {author.name}
                  </h1>
                  <UserRoleBadge userId={author.id} role={author.role} size="md" />
                </div>
                <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                  @{author.username}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                  <Calendar className="w-3 h-3" /> Katılım: {author.joinedDate}
                </span>
              </div>
            </div>

            {/* Follow / Edit / Settings Buttons */}
            <div className="flex items-center gap-3 self-center sm:self-auto flex-wrap">
              {isSelf && (
                <a
                  href="https://wattyboon-yonetim-paneli.ai.studio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-rose-600 to-amber-600 hover:opacity-90 text-white font-extrabold text-xs shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-amber-300" />
                  <span>Yönetim Paneli</span>
                </a>
              )}
              {isSelf ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditingBio(!isEditingBio);
                      if (isSettingsOpen) setIsSettingsOpen(false);
                    }}
                    className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
                      isEditingBio 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/60'
                    }`}
                  >
                    <Edit3 className="w-4 h-4 text-purple-500" /> Profilini Düzenle
                  </button>

                  <button
                    onClick={() => {
                      setIsSettingsOpen(!isSettingsOpen);
                      if (isEditingBio) setIsEditingBio(false);
                    }}
                    className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
                      isSettingsOpen 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/60'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-purple-500" /> Hesabı Yönet & Güvenlik
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openMessagingWithUser(author.id)}
                    className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Mesaj Gönder
                  </button>
                  <button
                    onClick={() => toggleFollowUser(author.id)}
                    className={`px-6 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                      isFollowing
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4" /> Takip Ediliyor
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" /> Takip Et
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

          </div>

          {/* Edit Profile Panel */}
          {isEditingBio && (
            <div className="mb-6 p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-4 animate-fade-in text-xs">
              <h4 className="font-bold text-purple-900 dark:text-purple-200 text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-600" /> Profil Bilgilerini Güncelle
              </h4>
              
              {/* File Upload Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-purple-100 dark:border-purple-900/50">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Profil Resmi (Avatar)
                  </label>
                  <div className="flex gap-2 items-center">
                    <label 
                      htmlFor="avatar-file-upload"
                      className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-center cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Upload className="w-4 h-4" /> Dosya Seç (Cihazdan)
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kapak Resmi (Banner)
                  </label>
                  <div className="flex gap-2 items-center">
                    <label 
                      htmlFor="cover-file-upload"
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <ImageIcon className="w-4 h-4" /> Dosya Seç (Cihazdan)
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Ad Soyad</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Ad Soyad"
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Avatar Görsel URL (İsteğe Bağlı)</label>
                  <input
                    type="text"
                    value={avatarInput}
                    onChange={(e) => setAvatarInput(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Biyografi</label>
                <textarea
                  rows={2}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Biyografinizi yazın..."
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <button
                onClick={handleSaveBio}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" /> Değişiklikleri Kaydet
              </button>
            </div>
          )}

          {/* Account Settings & Security Panel */}
          {isSettingsOpen && (
            <div className="mb-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-6 animate-fade-in text-xs">
              
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Hesap Ayarları ve Güvenlik
                </h4>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Change Password Section */}
              <div className="space-y-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-purple-600" />
                  Şifre Değiştir
                </h5>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Firebase Authentication ile korunan hesabınızın şifresini yeni ve güçlü bir şifreyle güncelleyebilirsiniz.
                </p>

                {passwordMsg && (
                  <div className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                    passwordMsg.type === 'success' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                  }`}>
                    {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                    <span>{passwordMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleChangePasswordSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Yeni Şifreniz (En az 6 karakter)"
                    minLength={6}
                    required
                    className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingPass}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shrink-0 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    {isSubmittingPass ? 'Güncelleniyor...' : 'Şifremi Değiştir'}
                  </button>
                </form>
              </div>

              {/* 2. Delete Account Section (Danger Zone) */}
              <div className="space-y-3 p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50">
                <h5 className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  Kritik Bölge: Hesabı Sil
                </h5>
                <p className="text-rose-700 dark:text-rose-300/80 text-[11px] leading-relaxed">
                  Hesabınızı sildiğiniz takdirde tüm yayınlanmış ve taslak hikayeleriniz, profiliniz, kütüphaneniz ve yorumlarınız sistemden ve Firebase veritabanından kalıcı olarak silinecektir.
                </p>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Hesabımı Kalıcı Olarak Sil
                </button>
              </div>

            </div>
          )}

          {/* Delete Account Modal Dialog */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-2xl w-full max-w-md p-6 space-y-4">
                
                <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                  <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Hesabınızı Silmek İstediğinize Emin Misiniz?</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Bu işlem kesinlikle geri alınamaz.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 leading-relaxed">
                  Onaylamak için lütfen aşağıdaki kutucuğa büyük harflerle <strong className="font-black text-rose-600 dark:text-rose-400">SİL</strong> yazınız.
                </div>

                <input
                  type="text"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  placeholder="SİL"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-500"
                />

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setShowDeleteModal(false); setDeleteConfirmInput(''); }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleDeleteAccountSubmit}
                    disabled={deleteConfirmInput.trim().toUpperCase() !== 'SİL' || isDeleting}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? 'Siliniyor...' : 'Hesabı Sil'}
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Bio Text */}
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-3xl mb-6">
            {author.bio}
          </p>

          {/* User Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="block text-xl font-bold text-purple-600 dark:text-purple-400">{authorStories.length}</span>
              <span className="text-xs text-slate-400">Hikaye</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="block text-xl font-bold text-purple-600 dark:text-purple-400">{author.followers.length}</span>
              <span className="text-xs text-slate-400">Takipçi</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="block text-xl font-bold text-purple-600 dark:text-purple-400">{author.following.length}</span>
              <span className="text-xs text-slate-400">Takip Edilen</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="block text-xl font-bold text-purple-600 dark:text-purple-400">{totalLikes}</span>
              <span className="text-xs text-slate-400">Toplam Beğeni</span>
            </div>
          </div>

        </div>
      </div>

      {/* Author Stories List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            {isSelf ? 'Tüm Hikayelerim (Yayınlanan & Özel)' : `${author.name} Tarafından Kaleme Alınanlar`}
          </h2>

          {isSelf && (
            <button
              onClick={() => openStoryEditor(null)}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
            >
              + Yeni Hikaye Kaleme Al
            </button>
          )}
        </div>

        {authorStories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
            {authorStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8">
            <p className="text-sm text-slate-500">Bu yazar henüz bir hikaye yayınlamadı.</p>
          </div>
        )}
      </section>

    </div>
  );
};

