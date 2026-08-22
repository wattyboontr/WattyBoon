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
  Bookmark,
  Mail,
  AtSign,
  Eye,
  EyeOff,
  Palette,
  Layers,
  Save
} from 'lucide-react';

const PRESET_AVATARS = [
  { id: '1', name: 'Atlas Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Atlas' },
  { id: '2', name: 'Luna Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Luna' },
  { id: '3', name: 'Felix Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix' },
  { id: '4', name: 'Zoe Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zoe' },
  { id: '5', name: 'Yazar 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' },
  { id: '6', name: 'Yazar 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' },
  { id: '7', name: 'Yazar 3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400' },
  { id: '8', name: 'Yazar 4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400' },
];

const PRESET_COVERS = [
  { id: 'c1', name: 'Gece Gökyüzü', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1600' },
  { id: 'c2', name: 'Büyülü Kütüphane', url: 'https://images.unsplash.com/photo-1507842229451-7f01be7f7b32?auto=format&fit=crop&q=80&w=1600' },
  { id: 'c3', name: 'Neon Şehir', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=1600' },
  { id: 'c4', name: 'Gizemli Doğa', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1600' },
  { id: 'c5', name: 'Kitap & Kahve', url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1600' },
  { id: 'c6', name: 'Pastel Dalgalar', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1600' },
];

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

  // Settings & Edit Profile state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsActiveTab, setSettingsActiveTab] = useState<'profile' | 'images' | 'security' | 'danger'>('profile');

  // Profile Form Inputs
  const [nameInput, setNameInput] = useState(author?.name || '');
  const [usernameInput, setUsernameInput] = useState(author?.username || '');
  const [emailInput, setEmailInput] = useState(author?.email || '');
  const [bioInput, setBioInput] = useState(author?.bio || '');
  const [avatarInput, setAvatarInput] = useState(author?.avatar || '');
  const [coverInput, setCoverInput] = useState(author?.coverUrl || '');

  // Feedback Messages
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // New Custom List modal state
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [newListIsPrivate, setNewListIsPrivate] = useState(false);

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  // Delete Account Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Synchronize inputs if author / currentUser changes
  useEffect(() => {
    if (isSelf && currentUser) {
      setNameInput(currentUser.name || '');
      setUsernameInput(currentUser.username || '');
      setEmailInput(currentUser.email || '');
      setBioInput(currentUser.bio || '');
      setAvatarInput(currentUser.avatar || '');
      setCoverInput(currentUser.coverUrl || '');
    } else if (author) {
      setNameInput(author.name || '');
      setUsernameInput(author.username || '');
      setEmailInput(author.email || '');
      setBioInput(author.bio || '');
      setAvatarInput(author.avatar || '');
      setCoverInput(author.coverUrl || '');
    }
  }, [currentUser, author, isSelf]);

  // Auto-open settings if requested
  useEffect(() => {
    if (autoOpenProfileSettings && isSelf) {
      setIsSettingsOpen(true);
      setAutoOpenProfileSettings(false);
    }
  }, [autoOpenProfileSettings, isSelf, setAutoOpenProfileSettings]);

  // Filter public stories or public+private if viewing own profile
  const authorStories = stories.filter((s) => {
    if (s.authorId !== author?.id) return false;
    if (isSelf) return true;
    return s.visibility === 'public';
  });

  // Custom Reading Lists
  const userCustomLists = (isSelf ? currentUser?.customLists : author?.customLists) || [];
  const visibleCustomLists = userCustomLists.filter((list) => isSelf || !list.isPrivate);

  const totalReads = authorStories.reduce((acc, s) => acc + (s.reads || 0), 0);
  const totalLikes = authorStories.reduce((acc, s) => acc + (s.likes || 0), 0);

  // Save Profile & Credential Changes (Name, Username, Email, Bio, Images)
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg(null);

    const res = await updateProfile({
      name: nameInput,
      username: usernameInput,
      email: emailInput,
      bio: bioInput,
      avatar: avatarInput,
      coverUrl: coverInput,
    });

    setIsSavingProfile(false);
    if (res.success) {
      setProfileMsg({ type: 'success', text: res.message || 'Profil ve hesap bilgileriniz başarıyla güncellendi.' });
      setTimeout(() => {
        setProfileMsg(null);
      }, 5000);
    } else {
      setProfileMsg({ type: 'error', text: res.error || 'Güncelleme sırasında bir hata oluştu.' });
    }
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
    if (newPassword !== newPasswordConfirm) {
      setPasswordMsg({ type: 'error', text: 'Girdiğiniz yeni şifreler birbiriyle eşleşmiyor.' });
      return;
    }

    setIsSubmittingPass(true);
    setPasswordMsg(null);

    const res = await changePassword(newPassword);
    setIsSubmittingPass(false);

    if (res.success) {
      setPasswordMsg({ type: 'success', text: res.message || 'Şifreniz başarıyla güncellendi.' });
      setNewPassword('');
      setNewPasswordConfirm('');
      setTimeout(() => {
        setPasswordMsg(null);
      }, 5000);
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
      if (file.size > 15 * 1024 * 1024) {
        alert('Lütfen 15MB\'dan küçük bir görsel seçin.');
        return;
      }
      const hostedUrl = await uploadImageToHost(file);
      if (hostedUrl) {
        setAvatarInput(hostedUrl);
        updateProfile({ avatar: hostedUrl });
      }
      e.target.value = '';
    }
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('Lütfen 15MB\'dan küçük bir görsel seçin.');
        return;
      }
      const hostedUrl = await uploadImageToHost(file);
      if (hostedUrl) {
        setCoverInput(hostedUrl);
        updateProfile({ coverUrl: hostedUrl });
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
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
              <button
                onClick={() => {
                  setIsSettingsOpen(true);
                  setSettingsActiveTab('images');
                }}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-lg transition-all border border-white/20 hover:scale-105"
              >
                <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                <span className="hidden xs:inline">Kapak Resmini Değiştir</span>
                <span className="xs:hidden">Kapak</span>
              </button>
            </div>
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
                  <button
                    onClick={() => {
                      setIsSettingsOpen(true);
                      setSettingsActiveTab('images');
                    }}
                    className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer gap-1"
                  >
                    <Upload className="w-5 h-5 text-purple-300" />
                    <span>Resmi Değiştir</span>
                  </button>
                )}
                {isSelf && (
                  <button 
                    onClick={() => {
                      setIsSettingsOpen(true);
                      setSettingsActiveTab('images');
                    }}
                    className="sm:hidden absolute -bottom-1 -right-1 p-2 rounded-full bg-purple-600 text-white shadow-lg cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                    title="Resim Değiştir"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
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
                      setIsSettingsOpen(!isSettingsOpen);
                      setSettingsActiveTab('profile');
                    }}
                    className={`flex-1 sm:flex-initial min-h-[44px] px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                      isSettingsOpen 
                        ? 'bg-purple-600 text-white shadow-purple-500/25' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/60'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-purple-500" />
                    <span>Hesap & Profil Ayarları</span>
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

          {/* ========================================================================= */}
          {/* COMPREHENSIVE USER SETTINGS PANEL (TABS: Profile, Images, Security, Danger) */}
          {/* ========================================================================= */}
          {isSettingsOpen && (
            <div className="mb-8 p-4 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-6 animate-fade-in shadow-xl text-xs">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      Hesap ve Profil Ayarları
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Adınızı, kullanıcı adınızı, e-postanızı, şifrenizi ve görsellerinizi buradan yönetin
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Settings Nav Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSettingsActiveTab('profile')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                    settingsActiveTab === 'profile'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-300'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Profil & Kimlik</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsActiveTab('images')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                    settingsActiveTab === 'images'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-300'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  <span>Görseller & Kapak</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsActiveTab('security')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                    settingsActiveTab === 'security'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-300'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Şifre & Güvenlik</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsActiveTab('danger')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                    settingsActiveTab === 'danger'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hesabı Sil</span>
                </button>
              </div>

              {/* Feedback Alert Message */}
              {profileMsg && (
                <div className={`p-3.5 rounded-2xl text-xs font-medium border flex items-center gap-2.5 animate-fade-in ${
                  profileMsg.type === 'success' 
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                }`}>
                  {profileMsg.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                  <span className="leading-relaxed">{profileMsg.text}</span>
                </div>
              )}

              {/* TAB 1: PROFILE & IDENTITY (Name, Username, Email, Bio) */}
              {settingsActiveTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Display Name */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-purple-600" />
                        Ad Soyad *
                      </label>
                      <input
                        type="text"
                        required
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Adınız ve Soyadınız"
                        className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Profilinizde ve yazdığınız hikayelerin üzerinde yazar ismi olarak görünür.
                      </p>
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <AtSign className="w-3.5 h-3.5 text-purple-600" />
                        Kullanıcı Adı (@username) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-500 font-bold">@</span>
                        <input
                          type="text"
                          required
                          value={usernameInput.replace(/^@/, '')}
                          onChange={(e) => setUsernameInput(e.target.value.replace(/^@/, '').replace(/\s+/g, ''))}
                          placeholder="kullanici_adiniz"
                          className="w-full pl-8 pr-3 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Benzersiz kimliğinizdir. Diğer kullanıcılar sizi bu isimle bulur ve etiketler.
                      </p>
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-purple-600" />
                      E-posta Adresi *
                    </label>
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="ornek@mail.com"
                      className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Giriş yaparken ve şifre sıfırlama işlemlerinde kullanılır.
                    </p>
                  </div>

                  {/* Bio */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                        Biyografi & Hakkımda
                      </label>
                      <span className="text-[10px] text-slate-400">{bioInput.length} karakter</span>
                    </div>
                    <textarea
                      rows={3}
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      placeholder="Kendinizi, yazarlık tutkunuzu veya sevdiğiniz türleri kısaca anlatın..."
                      className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="min-h-[44px] px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 cursor-pointer w-full sm:w-auto"
                    >
                      <Save className="w-4 h-4" />
                      {isSavingProfile ? 'Kaydediliyor...' : 'Profil Bilgilerini Kaydet'}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: IMAGES & COVERS (Avatar & Cover Banner) */}
              {settingsActiveTab === 'images' && (
                <div className="space-y-6">
                  
                  {/* Avatar Settings Section */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
                          <UserIcon className="w-4 h-4 text-purple-600" />
                          Profil Resmi (Avatar)
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Cihazınızdan yeni bir fotoğraf yükleyebilir, URL yapıştırabilir veya hazır avatarlardan seçebilirsiniz.
                        </p>
                      </div>

                      <img 
                        src={avatarInput || author?.avatar} 
                        alt="Önizleme" 
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-500 shadow-md shrink-0" 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label 
                        htmlFor="avatar-file-upload"
                        className="min-h-[44px] py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-center cursor-pointer flex items-center justify-center gap-2 shadow-md transition-all"
                      >
                        <Upload className="w-4 h-4" /> Cihazdan Fotoğraf Yükle
                      </label>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={avatarInput}
                          onChange={(e) => setAvatarInput(e.target.value)}
                          placeholder="Görsel URL Yapıştır (https://...)"
                          className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                        />
                      </div>
                    </div>

                    {/* Preset Avatars Gallery */}
                    <div>
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-2">
                        Hazır Avatarlardan Seç:
                      </p>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {PRESET_AVATARS.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setAvatarInput(item.url);
                              updateProfile({ avatar: item.url });
                            }}
                            className={`p-1 rounded-2xl border-2 transition-all group overflow-hidden ${
                              avatarInput === item.url 
                                ? 'border-purple-600 scale-105 shadow-md' 
                                : 'border-transparent hover:border-purple-300 opacity-80 hover:opacity-100'
                            }`}
                            title={item.name}
                          >
                            <img src={item.url} alt={item.name} className="w-full aspect-square rounded-xl object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cover Banner Settings Section */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
                          <ImageIcon className="w-4 h-4 text-indigo-600" />
                          Kapak Resmi (Banner)
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Profilinizin en üstünde yer alan geniş kapak görselini belirleyin.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label 
                        htmlFor="cover-file-upload"
                        className="min-h-[44px] py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center cursor-pointer flex items-center justify-center gap-2 shadow-md transition-all"
                      >
                        <Upload className="w-4 h-4" /> Cihazdan Kapak Yükle
                      </label>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={coverInput}
                          onChange={(e) => setCoverInput(e.target.value)}
                          placeholder="Kapak URL Yapıştır (https://...)"
                          className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                        />
                      </div>
                    </div>

                    {/* Preset Covers Gallery */}
                    <div>
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-2">
                        Hazır Edebi Kapak Temalarından Seç:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {PRESET_COVERS.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setCoverInput(item.url);
                              updateProfile({ coverUrl: item.url });
                            }}
                            className={`relative rounded-xl border-2 overflow-hidden h-20 group transition-all text-left ${
                              coverInput === item.url 
                                ? 'border-purple-600 ring-2 ring-purple-500/40 scale-[1.02]' 
                                : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'
                            }`}
                          >
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-2">
                              <span className="text-[11px] font-bold text-white drop-shadow-sm flex items-center gap-1">
                                {coverInput === item.url && <Check className="w-3 h-3 text-purple-400" />}
                                {item.name}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => handleSaveProfile()}
                      disabled={isSavingProfile}
                      className="min-h-[44px] px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 cursor-pointer w-full sm:w-auto"
                    >
                      <Save className="w-4 h-4" />
                      {isSavingProfile ? 'Kaydediliyor...' : 'Görsel Ayarlarını Kaydet'}
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 3: PASSWORD & SECURITY (Change Password) */}
              {settingsActiveTab === 'security' && (
                <div className="space-y-4">
                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
                        <KeyRound className="w-4 h-4 text-purple-600" />
                        Şifre Değiştir
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Hesabınızın güvenliği için güçlü, tahmin edilmesi zor bir şifre seçiniz.
                      </p>
                    </div>

                    {passwordMsg && (
                      <div className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                        passwordMsg.type === 'success' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                      }`}>
                        {passwordMsg.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span>{passwordMsg.text}</span>
                      </div>
                    )}

                    <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Yeni Şifre (En az 6 karakter) *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Yeni şifrenizi girin..."
                            minLength={6}
                            required
                            className="w-full p-3 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Yeni Şifre Tekrarı *
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPasswordConfirm}
                          onChange={(e) => setNewPasswordConfirm(e.target.value)}
                          placeholder="Yeni şifrenizi tekrar girin..."
                          minLength={6}
                          required
                          className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={isSubmittingPass || !newPassword || newPassword.length < 6}
                          className="min-h-[44px] px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer w-full sm:w-auto"
                        >
                          <KeyRound className="w-4 h-4" />
                          {isSubmittingPass ? 'Şifre Güncelleniyor...' : 'Şifremi Güncelle'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 4: DANGER ZONE (Delete Account) */}
              {settingsActiveTab === 'danger' && (
                <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-rose-900 dark:text-rose-200 text-sm">
                        Kritik Bölge: Hesabı ve Tüm Verileri Kalıcı Olarak Sil
                      </h4>
                      <p className="text-rose-700 dark:text-rose-300/80 text-[11px] leading-relaxed">
                        Hesabınızı sildiğiniz takdirde tüm yayınlanmış ve taslak hikayeleriniz, bölümleriniz, kütüphaneniz, okuma listeleriniz, forum tartışmalarınız ve yorumlarınız sistemden geri getirilemez biçimde kalıcı olarak silinecektir.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="min-h-[44px] px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer w-full sm:w-auto"
                    >
                      <Trash2 className="w-4 h-4" /> Hesabımı Kalıcı Olarak Sil
                    </button>
                  </div>
                </div>
              )}

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

