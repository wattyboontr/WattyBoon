import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StoryCard } from './StoryCard';
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
  Image as ImageIcon
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
    openMessagingWithUser
  } = useApp();

  const targetUserId = activeAuthorId || currentUser?.id || users[0].id;
  const author = users.find((u) => u.id === targetUserId) || currentUser || users[0];

  const isSelf = currentUser?.id === author.id;
  const isFollowing = currentUser?.following.includes(author.id);

  // Edit Bio & Images state
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [nameInput, setNameInput] = useState(author.name);
  const [bioInput, setBioInput] = useState(author.bio);
  const [avatarInput, setAvatarInput] = useState(author.avatar);
  const [coverInput, setCoverInput] = useState(author.coverUrl || '');

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

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatarInput(base64);
        updateProfile(bioInput, nameInput, base64, coverInput || author.coverUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCoverInput(base64);
        updateProfile(bioInput, nameInput, avatarInput || author.avatar, base64);
      };
      reader.readAsDataURL(file);
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
              <span>Kapak Resmini Değiştir (Bilgisayar/Telefon)</span>
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
                    <span>Profil Resmi Yükle</span>
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
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-slate-100">
                  {author.name}
                </h1>
                <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                  @{author.username}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                  <Calendar className="w-3 h-3" /> Katılım: {author.joinedDate}
                </span>
              </div>
            </div>

            {/* Follow / Edit / Message Buttons */}
            <div className="flex items-center gap-3 self-center sm:self-auto">
              {isSelf ? (
                <button
                  onClick={() => setIsEditingBio(!isEditingBio)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/60"
                >
                  <Edit3 className="w-4 h-4 text-purple-600" /> Profilini Düzenle
                </button>
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
              <h4 className="font-bold text-purple-900 dark:text-purple-200 text-sm">Profil Bilgilerini Güncelle</h4>
              
              {/* File Upload Section for Mobile / Desktop */}
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
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4" /> Değişiklikleri Kaydet
              </button>
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
