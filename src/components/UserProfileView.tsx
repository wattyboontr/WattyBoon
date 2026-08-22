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
  ShieldCheck,
  KeyRound,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2,
  AlertCircle,
  LogIn,
  Compass,
  Crown,
  ListPlus,
  Plus,
  Bookmark
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
    createCustomList,
    deleteCustomList,
    setIsAuthModalOpen,
    setActiveView,
    autoOpenProfileSettings,
    setAutoOpenProfileSettings,
    isAdmin
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

  const targetUserId = activeAuthorId || currentUser?.id || users[0]?.id;
  const author = users.find((u) => u.id === targetUserId) || currentUser || users[0];

  const isSelf = currentUser?.id === author?.id;
  const isFollowing = Array.isArray(currentUser?.following) ? currentUser.following.includes(author?.id || '') : false;

  // Active tab state: stories vs reading lists
  const [profileTab, setProfileTab] = useState<'stories' | 'reading_lists'>('stories');

  // Edit Bio & Images state
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [nameInput, setNameInput] = useState(author?.name || '');
  const [bioInput, setBioInput] = useState(author?.bio || '');
  const [avatarInput, setAvatarInput] = useState(author?.avatar || '');
  const [coverInput, setCoverInput] = useState(author?.coverUrl || '');

  // New Custom List modal state
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [newListIsPrivate, setNewListIsPrivate] = useState(false);

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
    if (s.authorId !== author?.id) return false;
    if (isSelf) return true; // Author sees both public & private
    return s.visibility === 'public'; // Public sees only public
  });

  // Custom Reading Lists
  const userCustomLists = (isSelf ? currentUser?.customLists : author?.customLists) || [];
  const visibleCustomLists = userCustomLists.filter((list) => isSelf || !list.isPrivate);

  const totalReads = authorStories.reduce((acc, s) => acc + (s.reads || 0), 0);
  const totalLikes = authorStories.reduce((acc, s) => acc + (s.likes || 0), 0);

  const handleSaveBio = () => {
    updateProfile(bioInput, nameInput, avatarInput, coverInput);
    setIsEditingBio(false);
  };

  const handleCreateNewList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    createCustomList(newListName.trim(), newListDesc.trim(), newListIsPrivate);
    setNewListName('');
    setNewListDesc('');
    setNewListIsPrivate(false);
    setIsCreateListModalOpen(false);
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
      if (file.size > 10 * 1024 * 1024) {
        alert('Lütfen 10MB\'dan küçük bir görsel seçin.');
        return;
      }
      const hostedUrl = await uploadImageToHost(file);
      if (hostedUrl) {
        setAvatarInput(hostedUrl);
        updateProfile(bioInput, nameInput, hostedUrl, coverInput || author?.coverUrl);
      }
      e.target.value = '';
    }
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Lütfen 10MB\'dan küçük bir görsel seçin.');
        return;
      }
      const hostedUrl = await uploadImageToHost(file);
      if (hostedUrl) {
        setCoverInput(hostedUrl);
        updateProfile(bioInput, nameInput, avatarInput || author?.avatar, hostedUrl);
      }
      e.target.value = '';
    }
  };

  const currentCover = coverInput || author?.coverUrl || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1600';

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in pb-28 md:pb-12">
      
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
          className="h-40 sm:h-64 bg-cover bg-center relative transition-all duration-300"
          style={{ backgroundImage: `url(${currentCover})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Change Cover Button (If Own Profile) */}
          {isSelf && (
            <label 
              htmlFor="cover-file-upload"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-lg transition-all border border-white/20 hover:scale-105"
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
              <span className="hidden xs:inline">Kapak Resmini Değiştir</span>
              <span className="xs:hidden">Kapak</span>
            </label>
          )}
        </div>

        {/* Profile Content Details */}
        <div className="p-4 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 sm:gap-6 -mt-16 sm:-mt-24 mb-6">
            
            {/* Avatar & Main Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4 text-center sm:text-left">
              <div className="relative group shrink-0">
                <img 
                  src={avatarInput || author?.avatar} 
                  alt={author?.name} 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-2xl bg-slate-800" 
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
                    className="sm:hidden absolute -bottom-1 -right-1 p-2 rounded-full bg-purple-600 text-white shadow-lg cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                    title="Resim Değiştir"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </label>
                )}
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-3xl font-display font-bold text-slate-900 dark:text-slate-100">
                    {author?.name}
                  </h1>
                  <UserRoleBadge userId={author?.id || ''} role={author?.role} size="md" />
                </div>
                <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                  @{author?.username}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                  <Calendar className="w-3 h-3" /> Katılım: {author?.joinedDate}
                </span>
              </div>
            </div>

            {/* Follow / Edit / Settings / Admin Buttons */}
            <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto flex-wrap">
              {isSelf ? (
                <>
                  {isAdmin && (
                    <button
                      onClick={() => setActiveView('admin')}
                      className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/25 hover:scale-105"
                      title="WattyBoon Yönetim Merkezi"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                      <span>Yönetim Paneli</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-black/30 text-amber-200 uppercase font-black tracking-wider">
                        Admin
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsEditingBio(!isEditingBio);
                      if (isSettingsOpen) setIsSettingsOpen(false);
                    }}
                    className={`flex-1 sm:flex-initial min-h-[44px] px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isEditingBio 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/60'
                    }`}
                  >
                    <Edit3 className="w-4 h-4 text-purple-500" /> Düzenle
                  </button>

                  <button
                    onClick={() => {
                      setIsSettingsOpen(!isSettingsOpen);
                      if (isEditingBio) setIsEditingBio(false);
                    }}
                    className={`flex-1 sm:flex-initial min-h-[44px] px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isSettingsOpen 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/60'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-purple-500" /> Ayarlar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openMessagingWithUser(author?.id)}
                    className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Mesaj Gönder
                  </button>
                  <button
                    onClick={() => author && toggleFollowUser(author.id)}
                    className={`flex-1 sm:flex-initial min-h-[44px] px-6 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
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
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-4 animate-fade-in text-xs">
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
                      className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-center cursor-pointer flex items-center justify-center gap-2 shadow-sm min-h-[40px]"
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
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center cursor-pointer flex items-center justify-center gap-2 shadow-sm min-h-[40px]"
                    >
                      <ImageIcon className="w-4 h-4" /> Dosya Seç (Cihazdan)
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Ad Soyad</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Ad Soyad"
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Avatar Görsel URL (İsteğe Bağlı)</label>
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
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Biyografi</label>
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
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer min-h-[44px] w-full sm:w-auto"
              >
                <Check className="w-4 h-4" /> Değişiklikleri Kaydet
              </button>
            </div>
          )}

          {/* Account Settings & Security Panel */}
          {isSettingsOpen && (
            <div className="mb-6 p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-6 animate-fade-in text-xs">
              
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Hesap Ayarları ve Güvenlik
                </h4>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                    className="min-h-[44px] px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shrink-0 cursor-pointer"
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
                  Hesabınızı sildiğiniz takdirde tüm yayınlanmış ve taslak hikayeleriniz, profiliniz, kütüphaneniz ve yorumlarınız sistemden kalıcı olarak silinecektir.
                </p>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="min-h-[44px] px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer w-full sm:w-auto"
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
                    className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleDeleteAccountSubmit}
                    disabled={deleteConfirmInput.trim().toUpperCase() !== 'SİL' || isDeleting}
                    className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
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
            {author?.bio || 'Bu kullanıcı henüz biyografi eklemedi.'}
          </p>

          {/* User Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="block text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400">{authorStories.length}</span>
              <span className="text-[11px] sm:text-xs text-slate-400">Hikaye</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="block text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400">{Array.isArray(author?.followers) ? author.followers.length : 0}</span>
              <span className="text-[11px] sm:text-xs text-slate-400">Takipçi</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="block text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400">{Array.isArray(author?.following) ? author.following.length : 0}</span>
              <span className="text-[11px] sm:text-xs text-slate-400">Takip Edilen</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="block text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400">{totalLikes}</span>
              <span className="text-[11px] sm:text-xs text-slate-400">Toplam Beğeni</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Selector: Stories vs Reading Lists */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setProfileTab('stories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all min-h-[44px] whitespace-nowrap cursor-pointer ${
            profileTab === 'stories'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-purple-300'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Hikayeler ({authorStories.length})</span>
        </button>

        <button
          onClick={() => setProfileTab('reading_lists')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all min-h-[44px] whitespace-nowrap cursor-pointer ${
            profileTab === 'reading_lists'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-purple-300'
          }`}
        >
          <ListPlus className="w-4 h-4" />
          <span>Okuma Listeleri ({visibleCustomLists.length})</span>
        </button>
      </div>

      {/* 1. STORIES TAB */}
      {profileTab === 'stories' && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              {isSelf ? 'Tüm Hikayelerim (Yayınlanan & Özel)' : `${author?.name} Tarafından Kaleme Alınanlar`}
            </h2>

            {isSelf && (
              <button
                onClick={() => openStoryEditor(null)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all self-stretch sm:self-auto justify-center"
              >
                <Plus className="w-4 h-4" /> Yeni Hikaye Kaleme Al
              </button>
            )}
          </div>

          {authorStories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {authorStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Bu yazar henüz bir hikaye yayınlamadı.</p>
              {isSelf && (
                <button
                  onClick={() => openStoryEditor(null)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  İlk Hikayeni Kaleme Al
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* 2. READING LISTS TAB */}
      {profileTab === 'reading_lists' && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-purple-600" />
                {isSelf ? 'Özel Okuma Listelerim' : `${author?.name} Kullanıcısının Okuma Listeleri`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Oluşturulan tematik okuma koleksiyonları ve kitap listeleri
              </p>
            </div>

            {isSelf && (
              <button
                onClick={() => setIsCreateListModalOpen(true)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 hover:scale-105 transition-all self-stretch sm:self-auto"
              >
                <Plus className="w-4 h-4" /> Yeni Okuma Listesi Oluştur
              </button>
            )}
          </div>

          {visibleCustomLists.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-500 flex items-center justify-center">
                <ListPlus className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Henüz Okuma Listesi Bulunmuyor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {isSelf 
                  ? 'Beğendiğiniz hikayeleri tematik listeler halinde gruplandırmak için yukarıdaki butondan ilk listenizi oluşturabilirsiniz.' 
                  : 'Bu kullanıcı henüz herkese açık bir okuma listesi paylaşmadı.'}
              </p>
              {isSelf && (
                <button
                  onClick={() => setIsCreateListModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> İlk Listemi Oluştur
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {visibleCustomLists.map((list) => {
                const listStories = stories.filter((s) => list.storyIds?.includes(s.id));

                return (
                  <div
                    key={list.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                  >
                    {/* List Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                            {list.name}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                            {listStories.length} Hikaye
                          </span>
                          {list.isPrivate && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Özel Liste
                            </span>
                          )}
                        </div>
                        {list.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {list.description}
                          </p>
                        )}
                      </div>

                      {isSelf && (
                        <button
                          onClick={() => {
                            if (confirm(`"${list.name}" adlı okuma listesini silmek istediğinize emin misiniz?`)) {
                              deleteCustomList(list.id);
                            }
                          }}
                          className="self-end sm:self-auto p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center gap-1 text-xs font-bold"
                          title="Listeyi Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sm:hidden">Listeyi Sil</span>
                        </button>
                      )}
                    </div>

                    {/* Stories in List */}
                    {listStories.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 text-xs text-slate-400 space-y-1">
                        <Bookmark className="w-6 h-6 mx-auto opacity-40 text-purple-500" />
                        <p>Bu listede henüz hikaye yok.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                        {listStories.map((story) => (
                          <StoryCard key={`profile_list_${list.id}_${story.id}`} story={story} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Create Custom List Modal */}
      {isCreateListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400">
                  <ListPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Yeni Okuma Listesi Oluştur
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Hikayeleri tematik olarak düzenleyin
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCreateListModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewList} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Liste Adı *
                </label>
                <input
                  type="text"
                  required
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Örn: Favori Bilim Kurgularım, Gece Okumaları..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Açıklama (İsteğe Bağlı)
                </label>
                <textarea
                  rows={2}
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  placeholder="Bu liste hakkında kısa bir not..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newListIsPrivate}
                  onChange={(e) => setNewListIsPrivate(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Gizli Liste Yap (Sadece ben görebileyim)
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    İşaretlenmezse profilinizde diğer kullanıcılar tarafından görüntülenebilir.
                  </span>
                </div>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateListModalOpen(false)}
                  className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={!newListName.trim()}
                  className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-500/25 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Listeyi Oluştur
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

