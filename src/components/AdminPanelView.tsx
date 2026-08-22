import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  MessageSquare, 
  MessageCircle, 
  Trash2, 
  Search, 
  Eye, 
  Filter, 
  Crown, 
  AlertTriangle, 
  CheckCircle2, 
  UserPlus, 
  UserMinus, 
  Pin, 
  PinOff, 
  ExternalLink, 
  BarChart3, 
  FileText, 
  Heart, 
  TrendingUp, 
  Clock, 
  ArrowLeft,
  X,
  Mail,
  Flame,
  ShieldAlert,
  Send
} from 'lucide-react';
import { UserRoleBadge } from './UserRoleBadge';
import { UserRole, StoryReport, ReportReason, ReportStatus } from '../types';

type AdminTab = 'overview' | 'reports' | 'users' | 'stories' | 'forum' | 'comments';

interface DeleteModalState {
  isOpen: boolean;
  type: 'story' | 'forumTopic' | 'forumReply' | 'comment' | 'user';
  id: string;
  secondaryId?: string; // for reply topicId or comment storyId
  title: string;
  ownerName?: string;
  ownerId?: string;
}

export const AdminPanelView: React.FC = () => {
  const { 
    currentUser, 
    isAdmin, 
    setActiveView, 
    users, 
    updateUserRole, 
    adminDeleteUser,
    stories, 
    adminDeleteStory,
    forumTopics, 
    adminDeleteForumTopic, 
    adminDeleteForumReply, 
    adminTogglePinForumTopic,
    adminDeleteComment,
    reports,
    adminResolveReport,
    adminDeleteReport,
    openStoryDetail,
    openStoryReader,
    openAuthorProfile,
    openMessagingWithUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  
  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | UserRole>('all');
  
  const [storySearch, setStorySearch] = useState('');
  const [storyCategoryFilter, setStoryCategoryFilter] = useState<string>('all');

  const [forumSearch, setForumSearch] = useState('');
  const [forumSubTab, setForumSubTab] = useState<'topics' | 'replies'>('topics');

  const [commentSearch, setCommentSearch] = useState('');

  // Report Search & Filter States
  const [reportSearch, setReportSearch] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState<'all' | ReportStatus>('all');
  const [reportReasonFilter, setReportReasonFilter] = useState<string>('all');
  const [selectedReportForAction, setSelectedReportForAction] = useState<StoryReport | null>(null);
  const [reportResolutionNote, setReportResolutionNote] = useState('');
  const [isProcessingReport, setIsProcessingReport] = useState(false);

  // Delete Action Modal State
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    type: 'story',
    id: '',
    title: '',
  });
  const [deletionReasonPreset, setDeletionReasonPreset] = useState('Topluluk Kuralları İhlali');
  const [deletionReasonCustom, setDeletionReasonCustom] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Security guard: If not admin, do not render panel
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center mb-5 text-rose-600 shadow-xl animate-bounce">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Erişim Yetkisi Bulunmuyor
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
          Bu yönetim paneline yalnızca yetkili yöneticiler ve <strong>semajim30@gmail.com</strong> baş yönetici hesabı erişebilir.
        </p>
        <button
          onClick={() => setActiveView('home')}
          className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg transition-all"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  // --- STATS COMPUTATION ---
  const totalUsersCount = users.length;
  const adminUsersCount = users.filter((u) => u.role === 'admin' || u.email?.toLowerCase() === 'semajim30@gmail.com').length;
  const moderatorUsersCount = users.filter((u) => u.role === 'moderator').length;
  const authorUsersCount = users.filter((u) => (u.storiesCount && u.storiesCount > 0) || u.role === 'author').length;

  const totalStoriesCount = stories.length;
  const totalChaptersCount = stories.reduce((acc, s) => acc + (s.chapters?.length || 0), 0);
  const totalReadsCount = stories.reduce((acc, s) => acc + (s.reads || 0), 0);
  const totalLikesCount = stories.reduce((acc, s) => acc + (s.likes || 0), 0);

  const totalForumTopicsCount = forumTopics.length;
  const totalForumRepliesCount = forumTopics.reduce((acc, t) => acc + (t.replies?.length || 0), 0);

  const totalStoryCommentsCount = stories.reduce((acc, s) => acc + (s.comments?.length || 0), 0);

  const pendingReportsCount = useMemo(() => {
    return (reports || []).filter((r) => r.status === 'pending').length;
  }, [reports]);

  const totalReportsCount = (reports || []).length;

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return (reports || []).filter((r) => {
      const matchesSearch =
        r.storyTitle.toLowerCase().includes(reportSearch.toLowerCase()) ||
        r.authorName.toLowerCase().includes(reportSearch.toLowerCase()) ||
        (r.authorUsername && r.authorUsername.toLowerCase().includes(reportSearch.toLowerCase())) ||
        r.reporterName.toLowerCase().includes(reportSearch.toLowerCase()) ||
        (r.reporterEmail && r.reporterEmail.toLowerCase().includes(reportSearch.toLowerCase())) ||
        r.description.toLowerCase().includes(reportSearch.toLowerCase()) ||
        r.reasonTitle.toLowerCase().includes(reportSearch.toLowerCase());

      const matchesStatus =
        reportStatusFilter === 'all' || r.status === reportStatusFilter;

      const matchesReason =
        reportReasonFilter === 'all' || r.reason === reportReasonFilter;

      return matchesSearch && matchesStatus && matchesReason;
    });
  }, [reports, reportSearch, reportStatusFilter, reportReasonFilter]);

  // Top stories
  const topStories = useMemo(() => {
    return [...stories].sort((a, b) => (b.reads || 0) - (a.reads || 0)).slice(0, 5);
  }, [stories]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = 
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()));
      
      const matchesRole = 
        userRoleFilter === 'all' || 
        (userRoleFilter === 'admin' && (u.role === 'admin' || u.email?.toLowerCase() === 'semajim30@gmail.com')) ||
        u.role === userRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, userRoleFilter]);

  // Filtered Stories
  const filteredStories = useMemo(() => {
    return stories.filter((s) => {
      const matchesSearch = 
        s.title.toLowerCase().includes(storySearch.toLowerCase()) ||
        s.authorName.toLowerCase().includes(storySearch.toLowerCase()) ||
        s.authorUsername.toLowerCase().includes(storySearch.toLowerCase()) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(storySearch.toLowerCase())));

      const matchesCategory = 
        storyCategoryFilter === 'all' || 
        s.category === storyCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [stories, storySearch, storyCategoryFilter]);

  // Filtered Forum Topics
  const filteredForumTopics = useMemo(() => {
    return forumTopics.filter((t) => {
      return (
        t.title.toLowerCase().includes(forumSearch.toLowerCase()) ||
        t.authorName.toLowerCase().includes(forumSearch.toLowerCase()) ||
        t.content.toLowerCase().includes(forumSearch.toLowerCase())
      );
    });
  }, [forumTopics, forumSearch]);

  // All Forum Replies Flat
  const allForumReplies = useMemo(() => {
    const list: { topicId: string; topicTitle: string; reply: any }[] = [];
    forumTopics.forEach((t) => {
      (t.replies || []).forEach((r) => {
        list.push({
          topicId: t.id,
          topicTitle: t.title,
          reply: r,
        });
      });
    });
    return list;
  }, [forumTopics]);

  const filteredForumReplies = useMemo(() => {
    return allForumReplies.filter((item) => {
      return (
        item.reply.content.toLowerCase().includes(forumSearch.toLowerCase()) ||
        item.reply.userName.toLowerCase().includes(forumSearch.toLowerCase()) ||
        item.topicTitle.toLowerCase().includes(forumSearch.toLowerCase())
      );
    });
  }, [allForumReplies, forumSearch]);

  // All Comments Flat
  const allStoryComments = useMemo(() => {
    const list: { storyId: string; storyTitle: string; comment: any }[] = [];
    stories.forEach((s) => {
      (s.comments || []).forEach((c) => {
        list.push({
          storyId: s.id,
          storyTitle: s.title,
          comment: c,
        });
      });
    });
    return list;
  }, [stories]);

  const filteredStoryComments = useMemo(() => {
    return allStoryComments.filter((item) => {
      return (
        item.comment.content.toLowerCase().includes(commentSearch.toLowerCase()) ||
        item.comment.userName.toLowerCase().includes(commentSearch.toLowerCase()) ||
        item.storyTitle.toLowerCase().includes(commentSearch.toLowerCase())
      );
    });
  }, [allStoryComments, commentSearch]);

  // Handle Confirmed Deletion
  const handleConfirmDelete = () => {
    const effectiveReason = deletionReasonCustom.trim() || deletionReasonPreset;

    if (deleteModal.type === 'story') {
      adminDeleteStory(deleteModal.id, effectiveReason);
      showNotificationToast(`"${deleteModal.title}" adlı hikaye başarıyla silindi ve yazara bildirim iletildi.`);
    } else if (deleteModal.type === 'forumTopic') {
      adminDeleteForumTopic(deleteModal.id, effectiveReason);
      showNotificationToast(`"${deleteModal.title}" başlıklı forum konusu silindi ve sahibine bildirim iletildi.`);
    } else if (deleteModal.type === 'forumReply' && deleteModal.secondaryId) {
      adminDeleteForumReply(deleteModal.secondaryId, deleteModal.id, effectiveReason);
      showNotificationToast('Forum yanıtı silindi ve kullanıcıya bildirim iletildi.');
    } else if (deleteModal.type === 'comment' && deleteModal.secondaryId) {
      adminDeleteComment(deleteModal.secondaryId, deleteModal.id, effectiveReason);
      showNotificationToast('Yorum kaldırıldı ve kullanıcıya bildirim iletildi.');
    } else if (deleteModal.type === 'user') {
      const res = adminDeleteUser(deleteModal.id, effectiveReason);
      if (res.success) {
        showNotificationToast(`"${deleteModal.title}" kullanıcısı sistemden başarıyla silindi.`);
      } else {
        alert(res.error || 'Hata oluştu');
      }
    }

    setDeleteModal({ isOpen: false, type: 'story', id: '', title: '' });
    setDeletionReasonCustom('');
  };

  const handleResolveReport = async (
    report: StoryReport,
    status: ReportStatus,
    deleteStoryFlag: boolean
  ) => {
    setIsProcessingReport(true);
    try {
      const success = await adminResolveReport(
        report.id,
        status,
        reportResolutionNote.trim() || undefined,
        deleteStoryFlag
      );
      if (success) {
        if (deleteStoryFlag) {
          showNotificationToast(`"${report.storyTitle}" adlı hikaye yayından kaldırıldı, şikayet çözüldü ve ilgili kişilere bildirim iletildi.`);
        } else {
          showNotificationToast(`Şikayet durumu güncellendi: ${status === 'resolved' ? 'Çözüldü' : status === 'investigating' ? 'İnceleniyor' : 'Reddedildi'}.`);
        }
        setSelectedReportForAction(null);
        setReportResolutionNote('');
      }
    } finally {
      setIsProcessingReport(false);
    }
  };

  const handleDeleteReportItem = async (reportId: string) => {
    if (window.confirm('Bu şikayet kaydını listeden silmek istediğinize emin misiniz?')) {
      await adminDeleteReport(reportId);
      showNotificationToast('Şikayet kaydı silindi.');
    }
  };

  const showNotificationToast = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in pb-28 md:pb-16">
      
      {/* Toast Notification */}
      {actionSuccessMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[90%] p-4 rounded-2xl bg-emerald-900/95 text-white shadow-2xl border border-emerald-500/50 backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold leading-relaxed">
            {actionSuccessMessage}
          </p>
        </div>
      )}

      {/* Admin Panel Header */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 border border-purple-500/30 p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView('home')}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all text-white border border-white/10"
              title="Ana Sayfaya Dön"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="p-2 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </span>
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
                  WattyBoon Yönetim Merkezi
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  Baş Yönetici: semajim30@gmail.com
                </span>
              </div>
              <p className="text-xs sm:text-sm text-purple-200/80 mt-1">
                Kullanıcı yetkileri, hikaye & bölüm moderasyonu, forum ve tartışma denetimi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs">
              <span className="text-purple-300">Aktif Yönetici: </span>
              <strong className="text-white font-bold">{currentUser?.name} (@{currentUser?.username})</strong>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-1 border-t border-white/10 pt-4 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'overview'
                ? 'bg-white text-purple-950 shadow-lg scale-105'
                : 'text-purple-200/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Genel Bakış & İstatistikler
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 relative ${
              activeTab === 'reports'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105'
                : 'text-rose-200/90 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Şikayetler & İhbarlar
            {pendingReportsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                {pendingReportsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'users'
                ? 'bg-white text-purple-950 shadow-lg scale-105'
                : 'text-purple-200/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Üyeler & Yetki Yönetimi
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-800 text-purple-200">
              {totalUsersCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('stories')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'stories'
                ? 'bg-white text-purple-950 shadow-lg scale-105'
                : 'text-purple-200/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Hikayeler & Eserler
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-800 text-purple-200">
              {totalStoriesCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('forum')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'forum'
                ? 'bg-white text-purple-950 shadow-lg scale-105'
                : 'text-purple-200/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Forum & Tartışmalar
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-800 text-purple-200">
              {totalForumTopicsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'comments'
                ? 'bg-white text-purple-950 shadow-lg scale-105'
                : 'text-purple-200/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Yorumlar & Denetim
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-800 text-purple-200">
              {totalStoryCommentsCount}
            </span>
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & DETAILED STATS */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Key Metric Grid Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Toplam Üye</span>
                <span className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <Users className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-display font-black text-slate-900 dark:text-slate-100">
                  {totalUsersCount}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <strong>{adminUsersCount}</strong> Yönetici & Moderatör
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Toplam Hikaye</span>
                <span className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-display font-black text-slate-900 dark:text-slate-100">
                  {totalStoriesCount}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  <strong>{totalChaptersCount}</strong> Toplam Bölüm
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Toplam Okunma</span>
                <span className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <TrendingUp className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-display font-black text-slate-900 dark:text-slate-100">
                  {totalReadsCount.toLocaleString('tr-TR')}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <strong>{totalLikesCount.toLocaleString('tr-TR')}</strong> Beğeni
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Forum & Tartışma</span>
                <span className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <MessageSquare className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-display font-black text-slate-900 dark:text-slate-100">
                  {totalForumTopicsCount}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <strong>{totalForumRepliesCount}</strong> Toplam Yanıt
                </p>
              </div>
            </div>

          </div>

          {/* Quick Actions & Moderation Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Most Read Stories */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  En Çok Okunan Hikayeler
                </h3>
                <button
                  onClick={() => setActiveTab('stories')}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700"
                >
                  Tümünü Yönet ({totalStoriesCount}) →
                </button>
              </div>

              {topStories.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Henüz yayınlanmış bir hikaye bulunmuyor.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {topStories.map((story) => (
                    <div key={story.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={story.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'}
                          alt={story.title}
                          className="w-10 h-14 object-cover rounded-xl shadow shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {story.title}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">
                            Yazar: {story.authorName} (@{story.authorUsername}) • {story.category}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                            <span>👁️ {story.reads || 0} okuma</span>
                            <span>❤️ {story.likes || 0} beğeni</span>
                            <span>📖 {story.chapters?.length || 0} bölüm</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => openStoryDetail(story.id)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Görüntüle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({
                            isOpen: true,
                            type: 'story',
                            id: story.id,
                            title: story.title,
                            ownerName: story.authorName,
                            ownerId: story.authorId
                          })}
                          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Hikayeyi Kaldır"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Admin Rules & Guidelines */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-4">
                  <ShieldAlert className="w-5 h-5" />
                  Yönetici İlkeleri & Güvenlik
                </div>
                <ul className="text-xs text-slate-300 space-y-3 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">1.</span>
                    <span>Sildiğiniz her hikaye, forum başlığı veya yorum için ilgili içerik sahibine otomatik bildirim gider.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">2.</span>
                    <span>Yalnızca yöneticilerin atadığı kişiler yönetim paneline erişebilir.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">3.</span>
                    <span><strong>semajim30@gmail.com</strong> baş yönetici hesabıdır ve yetkileri kalıcıdır.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">4.</span>
                    <span>Telif hakkı veya kural ihlali durumlarında gerekçe belirterek kaldırma işlemi yapınız.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 border-t border-slate-800 mt-6">
                <button
                  onClick={() => setActiveTab('users')}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Yeni Yönetici Ata / Üyeleri İncele
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: STORY REPORTS & MODERATION (ÇALINTI & ŞİKAYET YÖNETİMİ) */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Filter & Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Hikaye başlığı, yazar, şikayetçi veya açıklama ara..."
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={reportStatusFilter}
                onChange={(e) => setReportStatusFilter(e.target.value as any)}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
              >
                <option value="all">Tüm Durumlar ({totalReportsCount})</option>
                <option value="pending">⏳ Bekleyenler ({pendingReportsCount})</option>
                <option value="investigating">🔍 İncelenenler</option>
                <option value="resolved">✅ Çözülenler</option>
                <option value="dismissed">❌ Reddedilenler</option>
              </select>

              <select
                value={reportReasonFilter}
                onChange={(e) => setReportReasonFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
              >
                <option value="all">Tüm Nedenler</option>
                <option value="copyright">Çalıntı / Telif Hakkı</option>
                <option value="inappropriate">Uygunsuz İçerik</option>
                <option value="hate_speech">Nefret Söylemi / Hakaret</option>
                <option value="spam">Spam / Yanıltıcı</option>
                <option value="other">Diğer</option>
              </select>
            </div>
          </div>

          {/* Quick Notice Banner */}
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-xs text-rose-900 dark:text-rose-200">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Çalıntı ve Uygunsuz İçerik Moderasyonu:</strong>
              <p className="mt-0.5 text-rose-800/80 dark:text-rose-300/80 leading-relaxed">
                Kullanıcılar tarafından rapor edilen hikayeleri buradan inceleyebilirsiniz. Bir eseri sildiğinizde, hikaye sahibine gerekçe bildirimi gider ve şikayet otomatik olarak "Çözüldü" olarak işaretlenir.
              </p>
            </div>
          </div>

          {/* Reports List */}
          {filteredReports.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 text-xs space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-70" />
              <div className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                Filtreye uygun şikayet bulunamadı.
              </div>
              <p className="text-slate-500 max-w-sm mx-auto">
                Şu anda incelenmesi gereken veya kriterlerinize uyan bir şikayet/ihbar bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => {
                const reportStory = stories.find((s) => s.id === report.storyId);
                const isSelected = selectedReportForAction?.id === report.id;

                const getStatusBadge = (status: ReportStatus) => {
                  switch (status) {
                    case 'pending':
                      return (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                          Bekliyor
                        </span>
                      );
                    case 'investigating':
                      return (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          İnceleniyor
                        </span>
                      );
                    case 'resolved':
                      return (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Çözüldü
                        </span>
                      );
                    case 'dismissed':
                      return (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700 flex items-center gap-1">
                          <X className="w-3 h-3" />
                          Reddedildi / İhlal Yok
                        </span>
                      );
                  }
                };

                return (
                  <div
                    key={report.id}
                    className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all p-5 sm:p-6 shadow-sm space-y-5 ${
                      report.status === 'pending'
                        ? 'border-rose-200 dark:border-rose-900/60 ring-1 ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Top Metadata Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {getStatusBadge(report.status)}
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {report.reasonTitle || report.reason}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(report.createdAt).toLocaleString('tr-TR')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteReportItem(report.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Şikayet Kaydını Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Content Section: Story Info & Report Reason */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left / Story Card */}
                      <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex gap-4 items-start">
                        {reportStory ? (
                          <img
                            src={reportStory.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'}
                            alt={reportStory.title}
                            className="w-16 h-24 object-cover rounded-xl shadow-md shrink-0 cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => openStoryDetail(reportStory.id)}
                          />
                        ) : (
                          <div className="w-16 h-24 rounded-xl bg-slate-200 dark:bg-slate-700 flex flex-col items-center justify-center text-slate-400 shrink-0 text-center p-1 text-[10px]">
                            <AlertTriangle className="w-5 h-5 text-rose-500 mb-1" />
                            Kaldırılmış Eser
                          </div>
                        )}

                        <div className="min-w-0 space-y-1.5 flex-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400 block">
                            Şikayet Edilen Hikaye
                          </span>
                          <h4 
                            onClick={() => reportStory && openStoryDetail(reportStory.id)}
                            className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-purple-600 transition-colors cursor-pointer truncate"
                          >
                            {report.storyTitle}
                          </h4>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <span>Yazar:</span>
                            <button
                              onClick={() => openAuthorProfile(report.authorId)}
                              className="font-bold text-slate-800 dark:text-slate-200 hover:text-purple-600 transition-colors"
                            >
                              {report.authorName}
                            </button>
                            {report.authorUsername && (
                              <span className="text-[11px] text-slate-400">(@{report.authorUsername})</span>
                            )}
                          </div>

                          {reportStory && (
                            <div className="flex items-center gap-2 pt-2">
                              <button
                                onClick={() => openStoryDetail(reportStory.id)}
                                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" /> İncele
                              </button>
                              <button
                                onClick={() => openMessagingWithUser(report.authorId)}
                                className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-bold hover:bg-purple-100 flex items-center gap-1"
                              >
                                <Mail className="w-3 h-3" /> Yazara Yaz
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right / Report Details & Reporter Info */}
                      <div className="lg:col-span-7 space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Şikayet Eden: </span>
                            <strong>{report.reporterName}</strong> {report.reporterUsername ? `(@${report.reporterUsername})` : ''}
                            {report.reporterEmail && ` • ${report.reporterEmail}`}
                          </div>
                        </div>

                        {/* Stolen original URL if exists */}
                        {report.sourceUrl && (
                          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <span className="font-bold text-amber-800 dark:text-amber-300 block text-[11px]">
                                Belirtilen Orijinal Eser / Telif Kaynağı Linki:
                              </span>
                              <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px] truncate block">
                                {report.sourceUrl}
                              </span>
                            </div>
                            <a
                              href={report.sourceUrl.startsWith('http') ? report.sourceUrl : `https://${report.sourceUrl}`}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-sm"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Kaynağı Aç
                            </a>
                          </div>
                        )}

                        {/* Description Text */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Şikayet Açıklaması & Kanıt:
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {report.description}
                          </p>
                        </div>

                        {/* Existing Resolution Note if any */}
                        {report.adminNotes && (
                          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs">
                            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block mb-0.5">
                              Yönetici Notu ({report.resolvedBy || 'Yönetici'} - {report.resolvedAt ? new Date(report.resolvedAt).toLocaleDateString('tr-TR') : ''}):
                            </span>
                            <p className="text-emerald-900 dark:text-emerald-200">
                              {report.adminNotes}
                            </p>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Action Toolbar */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <button
                            onClick={() => {
                              setSelectedReportForAction(null);
                              setReportResolutionNote('');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-200"
                          >
                            İşlem Panelini Kapat
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedReportForAction(report);
                              setReportResolutionNote(report.adminNotes || '');
                            }}
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            İncele ve Karar Ver
                          </button>
                        )}
                      </div>

                      {/* Quick direct actions if not open */}
                      {!isSelected && reportStory && report.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleResolveReport(report, 'investigating', false)}
                            className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-xs font-bold transition-colors"
                          >
                            İncelemeye Al
                          </button>
                          <button
                            onClick={() => handleResolveReport(report, 'dismissed', false)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 text-xs font-bold transition-colors"
                          >
                            İhlal Yok (Reddet)
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Active Action Sub-Panel */}
                    {isSelected && (
                      <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-purple-950 dark:text-purple-200 block">
                            Yönetici Karar Notu & Kullanıcıya İletilecek Açıklama:
                          </label>
                          <textarea
                            value={reportResolutionNote}
                            onChange={(e) => setReportResolutionNote(e.target.value)}
                            placeholder="Şikayet sahibine veya yazara açıklamak istediğiniz inceleme gerekçesini giriniz..."
                            rows={2}
                            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700 text-xs outline-none resize-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              disabled={isProcessingReport}
                              onClick={() => handleResolveReport(report, 'resolved', false)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Çözüldü Olarak İşaretle (Eseri Silme)
                            </button>

                            <button
                              disabled={isProcessingReport}
                              onClick={() => handleResolveReport(report, 'investigating', false)}
                              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              İncelemeye Al
                            </button>

                            <button
                              disabled={isProcessingReport}
                              onClick={() => handleResolveReport(report, 'dismissed', false)}
                              className="px-3.5 py-2 rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reddet (İhlal Tespit Edilmedi)
                            </button>
                          </div>

                          {reportStory && (
                            <button
                              disabled={isProcessingReport}
                              onClick={() => {
                                if (window.confirm(`"${report.storyTitle}" adlı eseri telif hakkı veya kural ihlali sebebiyle tamamen yayından kaldırmak istediğinize emin misiniz?`)) {
                                  handleResolveReport(report, 'resolved', true);
                                }
                              }}
                              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Eseri Yayından Kaldır & Cezalandır
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER & ROLE MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="İsim, kullanıcı adı veya e-posta ile ara..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs font-bold text-slate-400 shrink-0">Filtrele:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value as any)}
                className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none cursor-pointer"
              >
                <option value="all">Tüm Üyeler ({users.length})</option>
                <option value="admin">Yöneticiler (Admin)</option>
                <option value="moderator">Moderatörler</option>
                <option value="author">Yazarlar</option>
                <option value="user">Standart Üyeler</option>
              </select>
            </div>
          </div>

          {/* Users Table / Card Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Kayıtlı Üye Listesi ({filteredUsers.length})
              </h3>
              <p className="text-xs text-slate-400">
                Yöneticilik yetkisi verilen kullanıcılar bu yönetim paneline erişebilir.
              </p>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Arama kriterlerine uygun üye bulunamadı.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Kullanıcı</th>
                      <th className="px-6 py-4">E-posta & Katılım</th>
                      <th className="px-6 py-4">Mevcut Rol</th>
                      <th className="px-6 py-4">Hikayeler</th>
                      <th className="px-6 py-4 text-right">Rol / Yetki Ataması</th>
                      <th className="px-6 py-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredUsers.map((u) => {
                      const isSuper = u.email?.toLowerCase() === 'semajim30@gmail.com' || u.email?.toLowerCase() === 'wattyboontr@gmail.com';
                      const isSelf = u.id === currentUser?.id;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          
                          {/* User Avatar & Name */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + u.id}
                                alt={u.name}
                                className="w-10 h-10 rounded-2xl object-cover ring-2 ring-purple-500/20"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <strong className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                    {u.name}
                                  </strong>
                                  {isSuper && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                                      Baş Yönetici
                                    </span>
                                  )}
                                </div>
                                <span className="text-purple-600 dark:text-purple-400 font-medium">
                                  @{u.username}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Email & Date */}
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            <div>{u.email || '—'}</div>
                            <span className="text-[10px] text-slate-400">Kayıt: {u.joinedDate || '2026-08-22'}</span>
                          </td>

                          {/* Role Badge */}
                          <td className="px-6 py-4">
                            <UserRoleBadge userId={u.id} role={u.role} size="md" />
                            {(!u.role || u.role === 'user') && (
                              <span className="text-xs text-slate-400">Standart Üye</span>
                            )}
                          </td>

                          {/* Stories count */}
                          <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                            {u.storiesCount || 0} Hikaye
                          </td>

                          {/* Role Actions */}
                          <td className="px-6 py-4 text-right">
                            {isSuper ? (
                              <span className="text-[11px] font-bold text-amber-500">
                                Değiştirilemez (Baş Yönetici)
                              </span>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                {u.role !== 'admin' ? (
                                  <button
                                    onClick={() => updateUserRole(u.id, 'admin')}
                                    className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 text-white font-bold text-[11px] hover:scale-105 transition-all shadow-sm flex items-center gap-1"
                                    title="Bu kullanıcıyı yönetici yap (Yönetim paneline erişebilir)"
                                  >
                                    <Crown className="w-3 h-3 text-amber-300" />
                                    Yönetici Yap
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => updateUserRole(u.id, 'user')}
                                    className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] hover:bg-rose-100 hover:text-rose-700 transition-all flex items-center gap-1"
                                    title="Yöneticilik yetkisini geri al"
                                  >
                                    <UserMinus className="w-3 h-3" />
                                    Yetkiyi Kaldır
                                  </button>
                                )}

                                {u.role !== 'moderator' && u.role !== 'admin' && (
                                  <button
                                    onClick={() => updateUserRole(u.id, 'moderator')}
                                    className="px-2.5 py-1.5 rounded-xl bg-cyan-100 text-cyan-800 font-bold text-[11px] hover:bg-cyan-200 transition-all"
                                  >
                                    Moderatör
                                  </button>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <button
                                onClick={() => openAuthorProfile(u.id)}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 text-slate-600 dark:text-slate-300 transition-colors"
                                title="Profili Görüntüle"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => openMessagingWithUser(u.id)}
                                className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-600 transition-colors"
                                title="Mesaj Gönder"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>

                              {!isSuper && !isSelf && (
                                <button
                                  onClick={() => setDeleteModal({
                                    isOpen: true,
                                    type: 'user',
                                    id: u.id,
                                    title: `${u.name} (@${u.username})`,
                                    ownerName: u.name,
                                    ownerId: u.id
                                  })}
                                  className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 transition-colors"
                                  title="Üyeyi Sistemden Sil / Yasakla"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STORIES MODERATION */}
      {/* ========================================================================= */}
      {activeTab === 'stories' && (
        <div className="space-y-6">
          
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Hikaye başlığı, yazar veya etiket ara..."
                value={storySearch}
                onChange={(e) => setStorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs font-bold text-slate-400 shrink-0">Kategori:</span>
              <select
                value={storyCategoryFilter}
                onChange={(e) => setStoryCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none cursor-pointer"
              >
                <option value="all">Tüm Kategoriler ({stories.length})</option>
                <option value="Genel">Genel</option>
                <option value="Romantik">Romantik</option>
                <option value="Bilim Kurgu">Bilim Kurgu</option>
                <option value="Fantastik">Fantastik</option>
                <option value="Gizem">Gizem</option>
                <option value="Gerilim">Gerilim</option>
                <option value="Korku">Korku</option>
                <option value="Aksiyon">Aksiyon</option>
                <option value="Dram">Dram</option>
              </select>
            </div>
          </div>

          {/* Stories List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Yayınlanan Hikayeler ({filteredStories.length})
              </h3>
              <p className="text-xs text-slate-400">
                Kaldırılan hikayeler sistemden silinir ve yazara anında açıklama bildirimi iletilir.
              </p>
            </div>

            {filteredStories.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Arama kriterlerine uygun hikaye bulunamadı.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStories.map((story) => (
                  <div key={story.id} className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    
                    <div className="flex items-start gap-4 min-w-0">
                      <img
                        src={story.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'}
                        alt={story.title}
                        className="w-14 h-20 sm:w-16 sm:h-24 object-cover rounded-2xl shadow-md shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            {story.title}
                          </h4>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                            {story.category}
                          </span>
                          {story.isNsfw && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white">
                              +18 NSFW
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            story.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {story.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {story.summary}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            Yazar: <strong>{story.authorName}</strong> (@{story.authorUsername})
                          </span>
                          <span>📖 {story.chapters?.length || 0} Bölüm</span>
                          <span>👁️ {story.reads || 0} Okunma</span>
                          <span>❤️ {story.likes || 0} Beğeni</span>
                          <span>💬 {story.comments?.length || 0} Yorum</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        onClick={() => openStoryDetail(story.id)}
                        className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Detay
                      </button>

                      <button
                        onClick={() => openStoryReader(story.id, 0)}
                        className="px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Oku
                      </button>

                      <button
                        onClick={() => setDeleteModal({
                          isOpen: true,
                          type: 'story',
                          id: story.id,
                          title: story.title,
                          ownerName: story.authorName,
                          ownerId: story.authorId
                        })}
                        className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-600 hover:text-white text-rose-600 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hikayeyi Sil
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FORUM & DISCUSSIONS MODERATION */}
      {/* ========================================================================= */}
      {activeTab === 'forum' && (
        <div className="space-y-6">
          
          {/* Sub Navigation */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
              <button
                onClick={() => setForumSubTab('topics')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  forumSubTab === 'topics'
                    ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Konu Başlıkları ({forumTopics.length})
              </button>
              <button
                onClick={() => setForumSubTab('replies')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  forumSubTab === 'replies'
                    ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Tartışma Yanıtları ({allForumReplies.length})
              </button>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Forumda ara..."
                value={forumSearch}
                onChange={(e) => setForumSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs outline-none"
              />
            </div>
          </div>

          {/* Subtab 1: Forum Topics */}
          {forumSubTab === 'topics' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {filteredForumTopics.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  Forum konusu bulunamadı.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredForumTopics.map((topic) => (
                    <div key={topic.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {topic.isPinned && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                              <Pin className="w-3 h-3 text-amber-600" /> Sabitlendi
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                            {topic.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {topic.title}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {topic.content}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                          <span>Yazar: <strong>{topic.authorName}</strong> (@{topic.authorUsername})</span>
                          <span>💬 {topic.replies?.length || 0} Yanıt</span>
                          <span>❤️ {topic.likes || 0} Beğeni</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          onClick={() => adminTogglePinForumTopic(topic.id)}
                          className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                            topic.isPinned ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                          }`}
                          title={topic.isPinned ? 'Sabitlemeyi Kaldır' : 'Başa Sabitle'}
                        >
                          {topic.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => setDeleteModal({
                            isOpen: true,
                            type: 'forumTopic',
                            id: topic.id,
                            title: topic.title,
                            ownerName: topic.authorName,
                            ownerId: topic.authorId
                          })}
                          className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-600 hover:text-white text-rose-600 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Konuyu Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subtab 2: Forum Replies */}
          {forumSubTab === 'replies' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {filteredForumReplies.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  Yanıt bulunamadı.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredForumReplies.map((item) => (
                    <div key={item.reply.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-[11px] text-purple-600 dark:text-purple-400 font-bold mb-1">
                          Konu: {item.topicTitle}
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                          "{item.reply.content}"
                        </p>
                        <div className="text-[10px] text-slate-400 mt-2">
                          Yazan: <strong>{item.reply.userName}</strong> (@{item.reply.userUsername}) • {item.reply.createdAt}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          onClick={() => setDeleteModal({
                            isOpen: true,
                            type: 'forumReply',
                            id: item.reply.id,
                            secondaryId: item.topicId,
                            title: `"${item.reply.content.substring(0, 30)}..." yanıtı`,
                            ownerName: item.reply.userName,
                            ownerId: item.reply.userId
                          })}
                          className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-600 hover:text-white text-rose-600 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Yanıtı Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: COMMENTS MODERATION */}
      {/* ========================================================================= */}
      {activeTab === 'comments' && (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Yorum metni veya yazar adı ile ara..."
                value={commentSearch}
                onChange={(e) => setCommentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
              />
            </div>
            <span className="text-xs font-bold text-slate-400">
              Toplam {filteredStoryComments.length} Yorum
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {filteredStoryComments.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Yorum bulunamadı.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStoryComments.map((item) => (
                  <div key={item.comment.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                          Hikaye: {item.storyTitle}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        "{item.comment.content}"
                      </p>
                      <div className="text-[10px] text-slate-400 mt-2">
                        Yorum Sahibi: <strong>{item.comment.userName}</strong> (@{item.comment.userUsername}) • {item.comment.createdAt}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        onClick={() => setDeleteModal({
                          isOpen: true,
                          type: 'comment',
                          id: item.comment.id,
                          secondaryId: item.storyId,
                          title: `"${item.comment.content.substring(0, 30)}..." yorumu`,
                          ownerName: item.comment.userName,
                          ownerId: item.comment.userId
                        })}
                        className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-600 hover:text-white text-rose-600 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Yorumu Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETION CONFIRMATION MODAL WITH REASON */}
      {/* ========================================================================= */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600">
                  <AlertTriangle className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    İçeriği Kaldırma & Bildirim
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bu işlem geri alınamaz ve içerik sahibine anında bildirim gönderilir.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteModal({ isOpen: false, type: 'story', id: '', title: '' })}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div className="text-slate-500">Silinecek İçerik:</div>
              <strong className="text-slate-900 dark:text-slate-100 font-bold block">
                {deleteModal.title}
              </strong>
              {deleteModal.ownerName && (
                <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                  Sahibi: {deleteModal.ownerName}
                </div>
              )}
            </div>

            {/* Reason Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Kaldırma Gerekçesi (Kullanıcıya Gönderilecek Bildirim):
              </label>
              <select
                value={deletionReasonPreset}
                onChange={(e) => setDeletionReasonPreset(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none"
              >
                <option value="Topluluk Kuralları İhlali">Topluluk Kuralları İhlali</option>
                <option value="Telif Hakkı veya İzinsiz İçerik İhlali">Telif Hakkı veya İzinsiz İçerik İhlali</option>
                <option value="Uygunsuz, Hakaret veya Sakıncalı İçerik">Uygunsuz, Hakaret veya Sakıncalı İçerik</option>
                <option value="Spam, Reklam veya Yanıltıcı Başlık">Spam, Reklam veya Yanıltıcı Başlık</option>
                <option value="Yazar Talebi / İnceleme Sonucu">Yazar Talebi / İnceleme Sonucu</option>
                <option value="Özel Açıklama">Özel Açıklama (Aşağıya Yazınız)</option>
              </select>
            </div>

            {/* Custom Reason Text */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500">
                Detaylı Açıklama / Not (Opsiyonel):
              </label>
              <textarea
                value={deletionReasonCustom}
                onChange={(e) => setDeletionReasonCustom(e.target.value)}
                placeholder="Kullanıcıya iletmek istediğiniz özel not veya kural ayrıntısı..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none resize-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModal({ isOpen: false, type: 'story', id: '', title: '' })}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
              >
                Vazgeç
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Onayla & Bildirim Gönder
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
