import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Story, 
  User, 
  UserRole,
  AppNotification, 
  Category, 
  Visibility, 
  DirectMessage, 
  CustomList, 
  ReadingProgress, 
  ParagraphComment, 
  Comment, 
  ForumTopic, 
  ForumReply, 
  ViewType, 
  ArchivedStory, 
  ArchivedStoryComment,
  StoryReport,
  ReportReason,
  ReportStatus
} from '../types';
import { 
  INITIAL_STORIES, 
  INITIAL_USERS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_MESSAGES 
} from '../data/mockData';
import {
  authLogin,
  authRegister,
  authGoogleLogin,
  authGetMe,
  authLogout,
  authResetPassword,
  fetchUsersFromCloudflare,
  saveUserToCloudflare,
  deleteUserFromCloudflare,
  fetchStoriesFromCloudflare,
  saveStoryToCloudflare,
  deleteStoryFromCloudflare,
  fetchForumTopicsFromCloudflare,
  saveForumTopicToCloudflare,
  deleteForumTopicFromCloudflare,
  fetchParagraphCommentsFromCloudflare,
  saveParagraphCommentToCloudflare,
  deleteParagraphCommentFromCloudflare,
  fetchCommentsFromCloudflare,
  saveCommentToCloudflare,
  fetchNotificationsFromCloudflare,
  saveNotificationToCloudflare,
  fetchMessagesFromCloudflare,
  saveMessageToCloudflare,
  fetchReportsFromCloudflare,
  saveReportToCloudflare,
  deleteReportFromCloudflare,
  sendCommentEmailNotification,
  sendMessageEmailNotification,
  clearAllStoriesFromCloudflare,
  CLOUDFLARE_STORAGE_ACCOUNT,
} from '../lib/cloudflare';

export type { ViewType };

interface AppContextType {
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // NSFW (+18) Content Toggle
  isNsfwEnabled: boolean;
  toggleNsfw: () => void;

  // Global Category & Tag Filter State
  selectedCategoryFilter: Category | 'Tümü';
  setSelectedCategoryFilter: (category: Category | 'Tümü') => void;
  selectedTagFilter?: string;
  setSelectedTagFilter: (tag: string | undefined) => void;

  // Auth & User
  currentUser: User | null;
  users: User[];
  loginWithGoogle: (customEmail?: string, customName?: string) => Promise<{ success: boolean; error?: string; domainError?: boolean }>;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, username: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
  switchDemoUser: (userId: string) => void;
  updateProfile: (bio: string, name?: string, avatar?: string, coverUrl?: string) => void;

  // Paragraph Comments (Metinler Arası Yorumlar)
  paragraphComments: ParagraphComment[];
  addParagraphComment: (storyId: string, chapterIndex: number, paragraphIndex: number, content: string, selectedText?: string) => void;
  toggleLikeParagraphComment: (commentId: string) => void;
  deleteParagraphComment: (commentId: string) => void;

  // Navigation / Active Views
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  activeStoryId: string | null;
  activeChapterIndex: number;
  activeAuthorId: string | null;
  editingStoryId: string | null;
  openStoryDetail: (storyId: string) => void;
  openStoryReader: (storyId: string, chapterIndex?: number) => void;
  openAuthorProfile: (authorId: string) => void;
  openStoryEditor: (storyId?: string | null) => void;

  // Stories
  stories: Story[];
  saveStory: (storyData: Partial<Story>) => string;
  deleteStory: (storyId: string) => void;
  deleteChapter: (storyId: string, chapterIndex: number) => void;
  toggleLikeStory: (storyId: string) => void;
  toggleLikeChapter: (storyId: string, chapterIndex: number) => void;
  addComment: (storyId: string, content: string) => void;
  toggleLikeComment: (storyId: string, commentId: string) => void;
  addReplyToComment: (storyId: string, parentCommentId: string, content: string) => void;
  deleteComment: (storyId: string, commentId: string) => void;
  incrementStoryReads: (storyId: string, chapterOrder: number) => void;

  // Forum & Topluluk Tartışmaları
  forumTopics: ForumTopic[];
  addForumTopic: (title: string, category: ForumTopic['category'], content: string, tags?: string[]) => string;
  deleteForumTopic: (topicId: string) => void;
  addForumReply: (topicId: string, content: string) => void;
  deleteForumReply: (topicId: string, replyId: string) => void;
  toggleLikeForumTopic: (topicId: string) => void;
  toggleLikeForumReply: (topicId: string, replyId: string) => void;

  // Kayıp & Silinen Eserler Arşivi (PDF Arşivi)
  archivedStories: ArchivedStory[];
  addArchivedStory: (storyData: {
    title: string;
    originalAuthor: string;
    chapterCount: string | number;
    summary: string;
    category?: Category | string;
    tags?: string[];
    pdfUrl: string;
    pdfFileName?: string;
    pdfFileSize?: string;
    coverUrl?: string;
  }) => Promise<{ success: boolean; id?: string; error?: string }>;
  deleteArchivedStory: (archiveId: string) => void;
  toggleLikeArchivedStory: (archiveId: string) => void;
  addArchivedStoryComment: (archiveId: string, content: string) => void;
  deleteArchivedStoryComment: (archiveId: string, commentId: string) => void;
  incrementArchivedStoryDownloads: (archiveId: string) => void;

  // Library
  toggleLibraryStory: (storyId: string, status?: 'reading' | 'want_to_read' | 'completed' | 'favorite') => void;
  isStoryInLibrary: (storyId: string) => boolean;

  // Reading Progress (Okumaya Devam Et)
  updateReadingProgress: (storyId: string, chapterIndex: number) => void;

  // Custom Reading Lists (Özel Kütüphane Listeleri)
  createCustomList: (name: string, description?: string) => string;
  addStoryToCustomList: (listId: string, storyId: string) => void;
  removeStoryFromCustomList: (listId: string, storyId: string) => void;
  deleteCustomList: (listId: string) => void;

  // Direct Messages (Takipçiler Arası Mesajlaşma)
  messages: DirectMessage[];
  unreadMessageCount: number;
  sendDirectMessage: (receiverId: string, content: string) => void;
  markMessagesAsRead: (senderId: string) => void;
  isMessagingOpen: boolean;
  activeMessagingUserId: string | null;
  openMessagingWithUser: (userId?: string | null) => void;
  closeMessaging: () => void;

  // Social / Following
  toggleFollowUser: (targetUserId: string) => void;

  // Notifications
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;

  // Content Reporting & Moderation
  reports: StoryReport[];
  submitStoryReport: (reportData: {
    storyId: string;
    storyTitle: string;
    storyCoverUrl?: string;
    authorId: string;
    authorName: string;
    authorUsername?: string;
    reason: ReportReason;
    reasonTitle: string;
    description: string;
    originalSourceUrl?: string;
  }) => Promise<{ success: boolean; message: string }>;
  adminResolveReport: (reportId: string, status: ReportStatus, note?: string, deleteReportedStory?: boolean) => Promise<boolean>;
  adminDeleteReport: (reportId: string) => Promise<boolean>;

  // Admin & Moderation Controls
  isAdmin: boolean;
  updateUserRole: (targetUserId: string, newRole: UserRole) => void;
  adminDeleteUser: (targetUserId: string, reason?: string) => { success: boolean; error?: string };
  adminDeleteStory: (storyId: string, reason?: string) => void;
  adminDeleteForumTopic: (topicId: string, reason?: string) => void;
  adminDeleteForumReply: (topicId: string, replyId: string, reason?: string) => void;
  adminDeleteComment: (storyId: string, commentId: string, reason?: string) => void;
  adminTogglePinForumTopic: (topicId: string) => void;

  // Modals & Settings Auto-Open
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  autoOpenProfileSettings: boolean;
  setAutoOpenProfileSettings: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'wattyboon_v5_';

const toggleLikeCommentInList = (comments: Comment[], commentId: string, userId: string): Comment[] => {
  return comments.map((c) => {
    if (c.id === commentId) {
      const hasLiked = c.likedBy.includes(userId);
      const newLikedBy = hasLiked ? c.likedBy.filter((id) => id !== userId) : [...c.likedBy, userId];
      return {
        ...c,
        likedBy: newLikedBy,
        likes: newLikedBy.length,
      };
    }
    if (c.replies && c.replies.length > 0) {
      return {
        ...c,
        replies: toggleLikeCommentInList(c.replies, commentId, userId),
      };
    }
    return c;
  });
};

const addReplyToCommentInList = (comments: Comment[], parentCommentId: string, newReply: Comment): Comment[] => {
  return comments.map((c) => {
    if (c.id === parentCommentId) {
      return {
        ...c,
        replies: [...(c.replies || []), newReply],
      };
    }
    if (c.replies && c.replies.length > 0) {
      return {
        ...c,
        replies: addReplyToCommentInList(c.replies, parentCommentId, newReply),
      };
    }
    return c;
  });
};

const deleteCommentFromList = (comments: Comment[], commentId: string): Comment[] => {
  return comments
    .filter((c) => c.id !== commentId)
    .map((c) => ({
      ...c,
      replies: c.replies ? deleteCommentFromList(c.replies, commentId) : [],
    }));
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}dark_mode`);
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}dark_mode`, JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // NSFW (+18) Content State
  const [isNsfwEnabled, setIsNsfwEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}nsfw_enabled`);
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}nsfw_enabled`, JSON.stringify(isNsfwEnabled));
  }, [isNsfwEnabled]);

  const toggleNsfw = () => setIsNsfwEnabled((prev) => !prev);

  // Global Category & Tag Filter State
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<Category | 'Tümü'>('Tümü');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | undefined>(undefined);

  // Banned User filter
  const BANNED_USERNAMES = ['semajim22', 'semantev7'];
  const isBannedUser = (u: Partial<User> | null | undefined): boolean => {
    if (!u) return false;
    const cleanUName = (u.username || '').replace(/^@/, '').trim().toLowerCase();
    return BANNED_USERNAMES.includes(cleanUName);
  };

  const normalizeUser = (u: any): User => {
    if (!u) return u;
    let readingProgress: ReadingProgress[] = [];
    if (Array.isArray(u.readingProgress)) {
      readingProgress = u.readingProgress;
    } else if (u.readingProgress && typeof u.readingProgress === 'object') {
      readingProgress = Object.entries(u.readingProgress).map(([storyId, val]: [string, any]) => {
        if (val && typeof val === 'object') {
          return {
            storyId: val.storyId || storyId,
            lastChapterIndex: typeof val.lastChapterIndex === 'number' ? val.lastChapterIndex : 0,
            updatedAt: val.updatedAt || new Date().toISOString(),
          };
        }
        return {
          storyId,
          lastChapterIndex: typeof val === 'number' ? val : 0,
          updatedAt: new Date().toISOString(),
        };
      });
    }

    const isSuperAdmin = u.email?.toLowerCase() === 'semajim30@gmail.com' || u.email?.toLowerCase() === 'wattyboontr@gmail.com';
    const role: UserRole = isSuperAdmin ? 'admin' : (u.role || 'user');

    return {
      ...u,
      role,
      readingProgress,
      library: Array.isArray(u.library) ? u.library : [],
      customLists: Array.isArray(u.customLists) ? u.customLists : [],
      followers: Array.isArray(u.followers) ? u.followers : [],
      following: Array.isArray(u.following) ? u.following : [],
      savedStories: Array.isArray(u.savedStories) ? u.savedStories : [],
      bookmarks: Array.isArray(u.bookmarks) ? u.bookmarks : [],
    };
  };

  // Users state
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}users`);
      const parsed: User[] = saved ? JSON.parse(saved) : INITIAL_USERS;
      return parsed.map(normalizeUser).filter((u) => !isBannedUser(u));
    } catch {
      return INITIAL_USERS.map(normalizeUser);
    }
  });

  // Current logged in user
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}current_user_id`);
      return saved !== null ? saved : '';
    } catch {
      return '';
    }
  });

  const currentUser = currentUserId ? (users.find((u) => u.id === currentUserId) || null) : null;

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}users`, JSON.stringify(users.filter((u) => !isBannedUser(u))));
    } catch (e) {
      console.warn('localStorage setItem users error:', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}current_user_id`, currentUserId);
    } catch (e) {
      console.warn('localStorage setItem current_user_id error:', e);
    }
  }, [currentUserId]);

  // Initial Auth Session Check via Cloudflare
  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      try {
        const res = await authGetMe();
        if (isMounted && res.success && res.user) {
          const u = normalizeUser(res.user);
          setUsers((prev) => [...prev.filter((existing) => existing.id !== u.id), u]);
          setCurrentUserId(u.id);
        }
      } catch (err) {
        console.warn('[Cloudflare Auth] Session verify notice:', err);
      }
    };
    checkSession();

    // Fetch initial users list from Cloudflare
    fetchUsersFromCloudflare().then((cfUsers) => {
      if (isMounted && Array.isArray(cfUsers) && cfUsers.length > 0) {
        setUsers((prev) => {
          const normalized = cfUsers.map(normalizeUser);
          const combined = [...prev];
          normalized.forEach((cfu) => {
            if (!combined.some((item) => item.id === cfu.id)) combined.push(cfu);
          });
          return combined.filter((u) => !isBannedUser(u));
        });
      }
    });

    return () => { isMounted = false; };
  }, []);

  // Stories state (Stored in Cloudflare Storage - wattyboontr@gmail.com)
  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}stories`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}stories`, JSON.stringify(stories));
    } catch (e) {
      console.warn('localStorage setItem stories error:', e);
    }
  }, [stories]);

  // Cloudflare Realtime & Polling Listener for Stories
  useEffect(() => {
    let isMounted = true;
    const loadFromCloudflare = async () => {
      try {
        const cloudflareStories = await fetchStoriesFromCloudflare();
        if (isMounted && Array.isArray(cloudflareStories)) {
          setStories(cloudflareStories);
        }
      } catch (err) {
        console.warn('[Cloudflare Stories Sync] Load notice:', err);
      }
    };

    loadFromCloudflare();
    const interval = setInterval(loadFromCloudflare, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}notifications`);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}notifications`, JSON.stringify(notifications));
    } catch (e) {
      console.warn('localStorage setItem notifications error:', e);
    }
  }, [notifications]);

  useEffect(() => {
    let isMounted = true;
    const loadNotifs = async () => {
      try {
        const cloudNotifs = await fetchNotificationsFromCloudflare();
        if (isMounted && Array.isArray(cloudNotifs) && cloudNotifs.length > 0) {
          setNotifications(cloudNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      } catch (err) {
        console.warn('[Cloudflare Notifications] Sync notice:', err);
      }
    };
    loadNotifs();
    const interval = setInterval(loadNotifs, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Messages state
  const [messages, setMessages] = useState<DirectMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}messages`);
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}messages`, JSON.stringify(messages));
    } catch (e) {
      console.warn('localStorage setItem messages error:', e);
    }
  }, [messages]);

  useEffect(() => {
    let isMounted = true;
    const loadMessages = async () => {
      try {
        const cloudMsgs = await fetchMessagesFromCloudflare();
        if (isMounted && Array.isArray(cloudMsgs) && cloudMsgs.length > 0) {
          setMessages(cloudMsgs);
        }
      } catch (err) {
        console.warn('[Cloudflare Messages] Sync notice:', err);
      }
    };
    loadMessages();
    const interval = setInterval(loadMessages, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Reports state (Şikayetler & Moderasyon Raporları)
  const [reports, setReports] = useState<StoryReport[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}reports`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}reports`, JSON.stringify(reports));
    } catch (e) {
      console.warn('localStorage setItem reports error:', e);
    }
  }, [reports]);

  useEffect(() => {
    let isMounted = true;
    const loadReports = async () => {
      try {
        const cloudReports = await fetchReportsFromCloudflare();
        if (isMounted && Array.isArray(cloudReports)) {
          setReports(cloudReports);
        }
      } catch (err) {
        console.warn('[Cloudflare Reports] Sync notice:', err);
      }
    };
    loadReports();
    const interval = setInterval(loadReports, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Forum Topics State (Cloudflare Storage)
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}forum_topics`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.filter((t: ForumTopic) => !['ft_1', 'ft_2', 'ft_3'].includes(t.id));
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}forum_topics`, JSON.stringify(forumTopics));
    } catch (e) {
      console.warn('localStorage setItem forum_topics error:', e);
    }
  }, [forumTopics]);

  useEffect(() => {
    let isMounted = true;
    const loadTopicsFromCloudflare = async () => {
      try {
        const cloudflareTopics = await fetchForumTopicsFromCloudflare();
        if (isMounted && Array.isArray(cloudflareTopics)) {
          setForumTopics(cloudflareTopics.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      } catch (err) {
        console.warn('[Cloudflare Topics Sync] Load notice:', err);
      }
    };

    loadTopicsFromCloudflare();
    const interval = setInterval(loadTopicsFromCloudflare, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Archived Stories State (Kayıp & Silinen Eserler Arşivi)
  const [archivedStories, setArchivedStories] = useState<ArchivedStory[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}archived_stories`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => item.id !== 'arch_1' && item.id !== 'arch_2' && item.id !== 'arch_3');
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}archived_stories`, JSON.stringify(archivedStories));
    } catch (e) {
      console.warn('localStorage setItem archived_stories error:', e);
    }
  }, [archivedStories]);

  // Paragraph Comments state (Cloudflare Storage)
  const [paragraphComments, setParagraphComments] = useState<ParagraphComment[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}paragraph_comments`);
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}paragraph_comments`, JSON.stringify(paragraphComments));
    } catch (e) {
      console.warn('localStorage setItem paragraph_comments error:', e);
    }
  }, [paragraphComments]);

  useEffect(() => {
    let isMounted = true;
    const loadPComments = async () => {
      try {
        const cloudflarePComments = await fetchParagraphCommentsFromCloudflare();
        if (isMounted && Array.isArray(cloudflarePComments)) {
          setParagraphComments(cloudflarePComments);
        }
      } catch (err) {
        console.warn('[Cloudflare Paragraph Comments Sync] Load notice:', err);
      }
    };

    loadPComments();
    const interval = setInterval(loadPComments, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Messaging UI State
  const [isMessagingOpen, setIsMessagingOpen] = useState<boolean>(false);
  const [activeMessagingUserId, setActiveMessagingUserId] = useState<string | null>(null);

  const openMessagingWithUser = (userId: string | null = null) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setActiveMessagingUserId(userId);
    setIsMessagingOpen(true);
  };

  const closeMessaging = () => {
    setIsMessagingOpen(false);
  };

  const sendNotification = (notifData: Partial<AppNotification>) => {
    const newNotif: AppNotification = {
      id: 'notif_' + Date.now(),
      userId: notifData.userId || '',
      actorId: notifData.actorId || currentUser?.id,
      senderId: notifData.senderId || currentUser?.id,
      senderName: notifData.senderName || currentUser?.name,
      senderAvatar: notifData.senderAvatar || currentUser?.avatar,
      type: notifData.type || 'system',
      title: notifData.title || 'Bildirim',
      message: notifData.message || '',
      storyId: notifData.storyId,
      chapterIndex: notifData.chapterIndex,
      targetUserId: notifData.targetUserId,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    saveNotificationToCloudflare(newNotif);
  };

  const sendDirectMessage = (receiverId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    const newMsg: DirectMessage = {
      id: 'msg_' + Date.now(),
      senderId: currentUser.id,
      receiverId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    saveMessageToCloudflare(newMsg);

    sendNotification({
      userId: receiverId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      type: 'system',
      title: 'Yeni Mesaj',
      message: `${currentUser.name} sana bir mesaj gönderdi.`,
    });

    // Email Notification to receiver if they have an email address
    const recipientUser = users.find((u) => u.id === receiverId);
    if (recipientUser?.email) {
      sendMessageEmailNotification({
        recipientEmail: recipientUser.email,
        recipientName: recipientUser.name,
        senderName: currentUser.name,
        senderUsername: currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, ''),
        messageContent: content.trim(),
        createdAt: new Date().toISOString(),
      }).catch((err) => console.warn('DM Email notify error:', err));
    }
  };

  const markMessagesAsRead = (senderId: string) => {
    if (!currentUser) return;
    setMessages((prev) =>
      prev.map((m) => {
        if (m.senderId === senderId && m.receiverId === currentUser.id) {
          const updated = { ...m, isRead: true };
          saveMessageToCloudflare(updated);
          return updated;
        }
        return m;
      })
    );
  };

  const unreadMessageCount = currentUser
    ? messages.filter((m) => m.receiverId === currentUser.id && !m.isRead).length
    : 0;

  // Reading Progress Action
  const updateReadingProgress = (storyId: string, chapterIndex: number) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUser.id) return u;
        const currentProgress = Array.isArray(u.readingProgress) ? u.readingProgress : [];
        const existingIdx = currentProgress.findIndex((p) => p.storyId === storyId);
        let updatedProgress: ReadingProgress[];
        if (existingIdx >= 0) {
          updatedProgress = currentProgress.map((p, idx) =>
            idx === existingIdx ? { storyId, lastChapterIndex: chapterIndex, updatedAt: now } : p
          );
        } else {
          updatedProgress = [{ storyId, lastChapterIndex: chapterIndex, updatedAt: now }, ...currentProgress];
        }
        const updatedUser = { ...u, readingProgress: updatedProgress };
        saveUserToCloudflare(updatedUser);
        return updatedUser;
      })
    );
  };

  // Custom Lists Actions
  const createCustomList = (name: string, description?: string): string => {
    if (!currentUser || !name.trim()) return '';
    const newId = 'clist_' + Date.now();
    const newList: CustomList = {
      id: newId,
      name: name.trim(),
      description: description?.trim(),
      storyIds: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUser.id) return u;
        const currentLists = u.customLists || [];
        const updatedUser = { ...u, customLists: [...currentLists, newList] };
        saveUserToCloudflare(updatedUser);
        return updatedUser;
      })
    );
    return newId;
  };

  const addStoryToCustomList = (listId: string, storyId: string) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUser.id) return u;
        const updatedLists = (u.customLists || []).map((list) => {
          if (list.id !== listId) return list;
          if (list.storyIds.includes(storyId)) return list;
          return { ...list, storyIds: [...list.storyIds, storyId] };
        });
        const updatedUser = { ...u, customLists: updatedLists };
        saveUserToCloudflare(updatedUser);
        return updatedUser;
      })
    );
  };

  const removeStoryFromCustomList = (listId: string, storyId: string) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUser.id) return u;
        const updatedLists = (u.customLists || []).map((list) => {
          if (list.id !== listId) return list;
          return { ...list, storyIds: list.storyIds.filter((id) => id !== storyId) };
        });
        const updatedUser = { ...u, customLists: updatedLists };
        saveUserToCloudflare(updatedUser);
        return updatedUser;
      })
    );
  };

  const deleteCustomList = (listId: string) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUser.id) return u;
        const updatedUser = {
          ...u,
          customLists: (u.customLists || []).filter((list) => list.id !== listId),
        };
        saveUserToCloudflare(updatedUser);
        return updatedUser;
      })
    );
  };

  // Helper to parse route from initial URL query params
  const getInitialRouteFromUrl = (): {
    view: ViewType;
    storyId: string | null;
    chapterIndex: number;
    authorId: string | null;
    editStoryId: string | null;
    category: Category | 'Tümü';
    tag?: string;
  } => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sayfa = params.get('sayfa')?.toLowerCase();
      const id = params.get('id');
      const bolumStr = params.get('bolum');
      const bolum = bolumStr ? Math.max(0, parseInt(bolumStr, 10) - 1) : 0;
      const kategori = params.get('kategori');
      const etiket = params.get('etiket') || undefined;

      let view: ViewType = 'home';
      if (sayfa === 'anasayfa' || sayfa === 'home') view = 'home';
      else if (sayfa === 'kesfet' || sayfa === 'explore' || sayfa === 'arama' || sayfa === 'ara') view = 'explore';
      else if (sayfa === 'kategoriler' || sayfa === 'kategori') view = 'categories';
      else if (sayfa === 'kutuphanem' || sayfa === 'kutuphane' || sayfa === 'library') view = 'library';
      else if (sayfa === 'forum' || sayfa === 'tartisma') view = 'forum';
      else if (sayfa === 'yaz' || sayfa === 'editor') view = 'editor';
      else if (sayfa === 'hikaye' || sayfa === 'hikaye-detay' || sayfa === 'story') view = 'story-detail';
      else if (sayfa === 'oku' || sayfa === 'reader') view = 'reader';
      else if (sayfa === 'profil' || sayfa === 'profile') view = 'profile';
      else if (sayfa === 'bildirimler' || sayfa === 'notifications') view = 'notifications';
      else if (kategori) view = 'explore';

      return {
        view,
        storyId: id || null,
        chapterIndex: bolum,
        authorId: id || null,
        editStoryId: view === 'editor' ? id : null,
        category: (kategori as Category) || 'Tümü',
        tag: etiket,
      };
    } catch {
      return {
        view: 'home',
        storyId: null,
        chapterIndex: 0,
        authorId: null,
        editStoryId: null,
        category: 'Tümü',
        tag: undefined,
      };
    }
  };

  const initialRoute = getInitialRouteFromUrl();

  // View & Navigation State
  const [activeView, setActiveViewRaw] = useState<ViewType>(initialRoute.view);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(initialRoute.storyId);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(initialRoute.chapterIndex);
  const [activeAuthorId, setActiveAuthorId] = useState<string | null>(initialRoute.authorId);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(initialRoute.editStoryId);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [autoOpenProfileSettings, setAutoOpenProfileSettings] = useState<boolean>(false);

  // Helper to generate dynamic URL search params and page document title
  const getUrlAndTitle = (
    view: ViewType,
    storyId: string | null = activeStoryId,
    chapterIndex: number = activeChapterIndex,
    authorId: string | null = activeAuthorId,
    editStoryId: string | null = editingStoryId,
    catFilter: Category | 'Tümü' = selectedCategoryFilter,
    tagFilter: string | undefined = selectedTagFilter
  ): { url: string; title: string } => {
    let url = '/';
    let title = 'WattyBoon';

    switch (view) {
      case 'home': {
        url = '/';
        title = 'WattyBoon | Ana Sayfa - Edebiyat ve Hikaye Dünyası';
        break;
      }
      case 'explore': {
        const params = new URLSearchParams();
        params.set('sayfa', 'kesfet');
        if (catFilter && catFilter !== 'Tümü') params.set('kategori', catFilter);
        if (tagFilter) params.set('etiket', tagFilter);
        url = `?${params.toString()}`;
        if (catFilter && catFilter !== 'Tümü') {
          title = `WattyBoon | ${catFilter} Hikayeleri`;
        } else if (tagFilter) {
          title = `WattyBoon | #${tagFilter} Eserleri`;
        } else {
          title = 'WattyBoon | Keşfet';
        }
        break;
      }
      case 'categories': {
        const params = new URLSearchParams();
        params.set('sayfa', 'kategoriler');
        if (catFilter && catFilter !== 'Tümü') params.set('kategori', catFilter);
        url = `?${params.toString()}`;
        title = catFilter && catFilter !== 'Tümü' ? `WattyBoon | ${catFilter} Kategorisi` : 'WattyBoon | Tüm Kategoriler';
        break;
      }
      case 'library': {
        url = '?sayfa=kutuphanem';
        title = 'WattyBoon | Kütüphanem';
        break;
      }
      case 'forum': {
        url = '?sayfa=forum';
        title = 'WattyBoon | Topluluk ve Forum';
        break;
      }
      case 'editor': {
        if (editStoryId) {
          url = `?sayfa=yaz&id=${editStoryId}`;
          const targetStory = stories.find((s) => s.id === editStoryId);
          title = targetStory ? `WattyBoon | Düzenle: ${targetStory.title}` : 'WattyBoon | Hikaye Düzenle';
        } else {
          url = '?sayfa=yaz';
          title = 'WattyBoon | Yeni Hikaye Yaz';
        }
        break;
      }
      case 'story-detail': {
        url = storyId ? `?sayfa=hikaye&id=${storyId}` : '?sayfa=hikaye';
        const targetStory = stories.find((s) => s.id === storyId);
        title = targetStory ? `WattyBoon | ${targetStory.title}` : 'WattyBoon | Hikaye Detayı';
        break;
      }
      case 'reader': {
        url = storyId ? `?sayfa=oku&id=${storyId}&bolum=${chapterIndex + 1}` : '?sayfa=oku';
        const targetStory = stories.find((s) => s.id === storyId);
        const chapter = targetStory?.chapters?.[chapterIndex];
        const chapTitle = chapter ? (chapter.title || `Bölüm ${chapterIndex + 1}`) : `Bölüm ${chapterIndex + 1}`;
        title = targetStory ? `WattyBoon | ${targetStory.title} - ${chapTitle}` : 'WattyBoon | Hikaye Oku';
        break;
      }
      case 'profile': {
        const targetId = authorId || currentUser?.id;
        url = targetId ? `?sayfa=profil&id=${targetId}` : '?sayfa=profil';
        const targetUser = users.find((u) => u.id === targetId);
        title = targetUser ? `WattyBoon | ${targetUser.name} (@${targetUser.username})` : 'WattyBoon | Yazar Profili';
        break;
      }
      case 'notifications': {
        url = '?sayfa=bildirimler';
        title = 'WattyBoon | Bildirimler';
        break;
      }
      default: {
        url = '/';
        title = 'WattyBoon | Hikaye Dünyası';
      }
    }

    return { url, title };
  };

  const pushStateToHistory = (
    view: ViewType,
    storyId: string | null = activeStoryId,
    chapterIndex: number = activeChapterIndex,
    authorId: string | null = activeAuthorId,
    editStoryId: string | null = editingStoryId
  ) => {
    try {
      const { url, title } = getUrlAndTitle(view, storyId, chapterIndex, authorId, editStoryId);
      document.title = title;
      window.history.pushState(
        {
          activeView: view,
          activeStoryId: storyId,
          activeChapterIndex: chapterIndex,
          activeAuthorId: authorId,
          editingStoryId: editStoryId,
        },
        title,
        url
      );
    } catch (e) {
      console.warn('History pushState error:', e);
    }
  };

  const setActiveView = (view: ViewType) => {
    setActiveViewRaw(view);
    pushStateToHistory(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    try {
      const { url, title } = getUrlAndTitle(
        activeView,
        activeStoryId,
        activeChapterIndex,
        activeAuthorId,
        editingStoryId,
        selectedCategoryFilter,
        selectedTagFilter
      );
      document.title = title;
      window.history.replaceState(
        {
          activeView,
          activeStoryId,
          activeChapterIndex,
          activeAuthorId,
          editingStoryId,
          selectedCategoryFilter,
          selectedTagFilter,
        },
        title,
        url
      );
    } catch (e) {
      console.warn('History replaceState error:', e);
    }
  }, [
    activeView,
    activeStoryId,
    activeChapterIndex,
    activeAuthorId,
    editingStoryId,
    selectedCategoryFilter,
    selectedTagFilter,
    stories,
    users,
    currentUser,
  ]);

  // Browser back/forward navigation listener (popstate)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.activeView) {
        setActiveViewRaw(e.state.activeView);
        if (e.state.activeStoryId !== undefined) setActiveStoryId(e.state.activeStoryId);
        if (e.state.activeChapterIndex !== undefined) setActiveChapterIndex(e.state.activeChapterIndex);
        if (e.state.activeAuthorId !== undefined) setActiveAuthorId(e.state.activeAuthorId);
        if (e.state.editingStoryId !== undefined) setEditingStoryId(e.state.editingStoryId);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Cascading User Deletion
  const deleteUserDataCascade = async (userId: string) => {
    if (!userId) return;

    setStories((prev) => {
      const remaining = prev.filter((s) => s.authorId !== userId);
      const deleted = prev.filter((s) => s.authorId === userId);
      deleted.forEach((s) => {
        deleteStoryFromCloudflare(s.id).catch((err) => console.warn('Delete story error:', err));
      });
      return remaining;
    });

    setMessages((prev) => prev.filter((m) => m.senderId !== userId && m.receiverId !== userId));
    setNotifications((prev) => prev.filter((n) => n.userId !== userId && n.actorId !== userId));
    setParagraphComments((prev) => prev.filter((pc) => pc.userId !== userId));

    setForumTopics((prev) => {
      const remaining = prev.filter((ft) => ft.authorId !== userId);
      const deleted = prev.filter((ft) => ft.authorId === userId);
      deleted.forEach((ft) => {
        deleteForumTopicFromCloudflare(ft.id).catch((err) => console.warn('Delete forumTopic error:', err));
      });
      return remaining.map((t) => ({
        ...t,
        replies: (t.replies || []).filter((r) => r.userId !== userId),
      }));
    });

    setUsers((prevUsers) => {
      const remainingUsers = prevUsers.filter((u) => u.id !== userId);
      return remainingUsers.map((u) => {
        let changed = false;
        let updatedFollowers = u.followers || [];
        let updatedFollowing = u.following || [];

        if (updatedFollowers.includes(userId)) {
          updatedFollowers = updatedFollowers.filter((id) => id !== userId);
          changed = true;
        }
        if (updatedFollowing.includes(userId)) {
          updatedFollowing = updatedFollowing.filter((id) => id !== userId);
          changed = true;
        }

        if (changed) {
          const updatedUser: User = {
            ...u,
            followers: updatedFollowers,
            following: updatedFollowing,
          };
          saveUserToCloudflare(updatedUser);
          return updatedUser;
        }
        return u;
      });
    });
  };

  // ==========================================
  // AUTHENTICATION METHODS (CLOUDFLARE ENGINE)
  // ==========================================

  const loginWithGoogle = async (customEmail?: string, customName?: string): Promise<{ success: boolean; error?: string; domainError?: boolean }> => {
    try {
      const targetEmail = customEmail || 'semajim30@gmail.com';
      const targetName = customName || 'Sema';
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${targetEmail}`;

      const res = await authGoogleLogin(targetEmail, targetName, avatarUrl);
      if (res.success && res.user) {
        const u = res.user;
        setUsers((prev) => [...prev.filter((item) => item.id !== u.id), u]);
        setCurrentUserId(u.id);
        setActiveAuthorId(u.id);
        setActiveViewRaw('profile');
        pushStateToHistory('profile', activeStoryId, activeChapterIndex, u.id);
        setAutoOpenProfileSettings(true);
        return { success: true };
      }
      return { success: false, error: res.error || 'Google ile giriş yapılamadı.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google girişi sırasında bir hata oluştu.' };
    }
  };

  const login = async (emailOrUsername: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const inputClean = emailOrUsername.trim();
    if (!inputClean) return { success: false, error: 'Lütfen e-posta adresinizi veya kullanıcı adınızı giriniz.' };

    const res = await authLogin(inputClean, password);
    if (res.success && res.user) {
      const u = res.user;
      setUsers((prev) => [...prev.filter((existing) => existing.id !== u.id), u]);
      setCurrentUserId(u.id);
      setActiveAuthorId(u.id);
      return { success: true };
    }
    return { success: false, error: res.error || 'Giriş yapılamadı. Bilgilerinizi kontrol ediniz.' };
  };

  const register = async (name: string, username: string, email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().replace(/^@/, '');

    if (!trimmedName || !cleanUsername || !trimmedEmail) {
      return { success: false, error: 'Lütfen tüm zorunlu alanları doldurunuz.' };
    }

    const res = await authRegister(trimmedName, cleanUsername, trimmedEmail, password);
    if (res.success && res.user) {
      const u = res.user;
      setUsers((prev) => [...prev.filter((existing) => existing.id !== u.id), u]);
      setCurrentUserId(u.id);
      setActiveAuthorId(u.id);
      setActiveViewRaw('profile');
      pushStateToHistory('profile', activeStoryId, activeChapterIndex, u.id);
      setAutoOpenProfileSettings(true);
      return { success: true };
    }
    return { success: false, error: res.error || 'Kayıt oluşturulamadı.' };
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Lütfen geçerli bir e-posta adresi giriniz.' };
    }
    const res = await authResetPassword(email.trim().toLowerCase());
    return res;
  };

  const changePassword = async (newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Yeni şifre en az 6 karakter olmalıdır.' };
    }
    if (!currentUser?.email) {
      return { success: false, error: 'Oturum açmış kullanıcı bulunamadı.' };
    }
    const res = await authResetPassword(currentUser.email, newPassword);
    return res;
  };

  const deleteAccount = async (): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Oturum açmış kullanıcı bulunamadı.' };
    }
    const userIdToDelete = currentUser.id;
    await deleteUserDataCascade(userIdToDelete);
    await authLogout();
    setCurrentUserId('');
    setIsAuthModalOpen(false);
    setActiveView('explore');
    return { success: true, message: 'Hesabınız ve tüm verileriniz kalıcı olarak silindi.' };
  };

  const logout = () => {
    authLogout();
    setCurrentUserId('');
    setIsAuthModalOpen(false);
  };

  const switchDemoUser = (userId: string) => {
    if (users.some((u) => u.id === userId)) {
      setCurrentUserId(userId);
    }
  };

  const updateProfile = (bio: string, name?: string, avatar?: string, coverUrl?: string) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          const updatedUser = {
            ...u,
            bio,
            name: name !== undefined ? name : u.name,
            avatar: avatar || u.avatar,
            coverUrl: coverUrl !== undefined ? coverUrl : u.coverUrl,
          };
          saveUserToCloudflare(updatedUser);
          return updatedUser;
        }
        return u;
      })
    );
  };

  // ==========================================
  // PARAGRAPH COMMENTS
  // ==========================================

  const addParagraphComment = (storyId: string, chapterIndex: number, paragraphIndex: number, content: string, selectedText?: string) => {
    if (!currentUser || !content.trim()) return;
    const newComment: ParagraphComment = {
      id: 'pcomm_' + Date.now(),
      storyId,
      chapterIndex,
      paragraphIndex,
      selectedText,
      userId: currentUser.id,
      userName: currentUser.name,
      userUsername: currentUser.username,
      userAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
    };
    setParagraphComments((prev) => [newComment, ...prev]);
    saveParagraphCommentToCloudflare(newComment);

    // Send email notification to story author if not self
    const targetStory = stories.find((s) => s.id === storyId);
    if (targetStory && targetStory.authorId !== currentUser.id) {
      const authorUser = users.find((u) => u.id === targetStory.authorId);
      const chapter = targetStory.chapters?.[chapterIndex];
      if (authorUser?.email) {
        sendCommentEmailNotification({
          recipientEmail: authorUser.email,
          recipientName: authorUser.name,
          storyId: targetStory.id,
          storyTitle: targetStory.title,
          chapterIndex,
          chapterTitle: chapter?.title || `${chapterIndex + 1}. Bölüm`,
          paragraphIndex,
          selectedText,
          content: content.trim(),
          userName: currentUser.name,
          userUsername: currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, ''),
          createdAt: new Date().toISOString(),
        }).catch((err) => console.warn('Paragraph comment email notify error:', err));
      }
    }
  };

  const toggleLikeParagraphComment = (commentId: string) => {
    if (!currentUser) return;
    setParagraphComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const isLiked = c.likedBy.includes(currentUser.id);
          const likedBy = isLiked
            ? c.likedBy.filter((id) => id !== currentUser.id)
            : [...c.likedBy, currentUser.id];
          const updated = {
            ...c,
            likedBy,
            likes: likedBy.length,
          };
          saveParagraphCommentToCloudflare(updated);
          return updated;
        }
        return c;
      })
    );
  };

  const deleteParagraphComment = (commentId: string) => {
    if (!currentUser) return;
    setParagraphComments((prev) => prev.filter((p) => p.id !== commentId));
    deleteParagraphCommentFromCloudflare(commentId);
  };

  // Navigation helpers
  const openStoryDetail = (storyId: string) => {
    setActiveStoryId(storyId);
    setActiveViewRaw('story-detail');
    pushStateToHistory('story-detail', storyId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openStoryReader = (storyId: string, chapterIndex: number = 0) => {
    setActiveStoryId(storyId);
    setActiveChapterIndex(chapterIndex);
    setActiveViewRaw('reader');
    pushStateToHistory('reader', storyId, chapterIndex);
    incrementStoryReads(storyId, chapterIndex);
    updateReadingProgress(storyId, chapterIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuthorProfile = (authorId: string) => {
    setActiveAuthorId(authorId);
    setActiveViewRaw('profile');
    pushStateToHistory('profile', activeStoryId, activeChapterIndex, authorId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openStoryEditor = (storyId: string | null = null) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setEditingStoryId(storyId);
    setActiveViewRaw('editor');
    pushStateToHistory('editor', storyId, activeChapterIndex, activeAuthorId, storyId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // STORY ACTIONS (UNLIMITED PUBLISHING)
  // ==========================================

  const saveStory = (storyData: Partial<Story>): string => {
    if (!currentUser) return '';

    const now = new Date().toISOString().split('T')[0];
    let targetId = storyData.id;

    if (targetId && stories.some((s) => s.id === targetId)) {
      // Update existing
      setStories((prev) =>
        prev.map((s) => {
          if (s.id === targetId) {
            const updated = { ...s, ...storyData, updatedAt: now } as Story;
            saveStoryToCloudflare(updated);
            return updated;
          }
          return s;
        })
      );
    } else {
      // Create new story (UNLIMITED FOR ALL USERS)
      targetId = 'story_' + Date.now();
      const newStory: Story = {
        id: targetId,
        title: storyData.title || 'İsimsiz Hikaye',
        summary: storyData.summary || '',
        coverUrl:
          storyData.coverUrl ||
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorUsername: currentUser.username,
        authorAvatar: currentUser.avatar,
        category: (storyData.category as Category) || 'Romantik',
        tags: storyData.tags || ['Yeni'],
        visibility: (storyData.visibility as Visibility) || 'public',
        status: storyData.status || 'ongoing',
        likes: 0,
        likedBy: [],
        reads: 0,
        chapters: storyData.chapters || [],
        comments: [],
        createdAt: now,
        updatedAt: now,
        readingTimeMinutes: storyData.chapters
          ? Math.ceil(
              storyData.chapters.reduce((acc, c) => acc + c.content.length, 0) / 1000
            ) || 3
          : 3,
      };

      setStories((prev) => [newStory, ...prev]);
      saveStoryToCloudflare(newStory);

      // Increment user's story count
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id
            ? { ...u, storiesCount: (u.storiesCount || 0) + 1 }
            : u
        )
      );
    }

    return targetId;
  };

  const deleteStory = (storyId: string) => {
    if (!currentUser) return;
    setStories((prev) => prev.filter((s) => s.id !== storyId));
    deleteStoryFromCloudflare(storyId);
  };

  const deleteChapter = (storyId: string, chapterIndex: number) => {
    if (!currentUser) return;
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;
        const updatedChapters = s.chapters.filter((_, idx) => idx !== chapterIndex);
        const updated = {
          ...s,
          chapters: updatedChapters,
          updatedAt: new Date().toISOString().split('T')[0],
        };
        saveStoryToCloudflare(updated);
        return updated;
      })
    );
  };

  const toggleLikeStory = (storyId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;
        const isLiked = s.likedBy.includes(currentUser.id);
        const newLikedBy = isLiked
          ? s.likedBy.filter((id) => id !== currentUser.id)
          : [...s.likedBy, currentUser.id];
        const updated = {
          ...s,
          likedBy: newLikedBy,
          likes: newLikedBy.length,
        };
        saveStoryToCloudflare(updated);
        return updated;
      })
    );
  };

  const toggleLikeChapter = (storyId: string, chapterIndex: number) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;
        const updatedChapters = s.chapters.map((chap, idx) => {
          if (idx !== chapterIndex) return chap;
          const likedBy = chap.likedBy || [];
          const isLiked = likedBy.includes(currentUser.id);
          const newLikedBy = isLiked
            ? likedBy.filter((id) => id !== currentUser.id)
            : [...likedBy, currentUser.id];
          return {
            ...chap,
            likedBy: newLikedBy,
            likes: newLikedBy.length,
          };
        });
        const updated = { ...s, chapters: updatedChapters };
        saveStoryToCloudflare(updated);
        return updated;
      })
    );
  };

  const addComment = (storyId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    const newComment: Comment = {
      id: 'comm_' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userUsername: currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, ''),
      userAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString().split('T')[0],
      likes: 0,
      likedBy: [],
      replies: [],
    };

    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;
        const updated = {
          ...s,
          comments: [newComment, ...(s.comments || [])],
        };
        saveStoryToCloudflare(updated);
        return updated;
      })
    );

    // Send email notification to story author if not commenting on own story
    const targetStory = stories.find((s) => s.id === storyId);
    if (targetStory && targetStory.authorId !== currentUser.id) {
      const authorUser = users.find((u) => u.id === targetStory.authorId);
      if (authorUser?.email) {
        sendCommentEmailNotification({
          recipientEmail: authorUser.email,
          recipientName: authorUser.name,
          storyId: targetStory.id,
          storyTitle: targetStory.title,
          content: content.trim(),
          userName: currentUser.name,
          userUsername: currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, ''),
          createdAt: new Date().toISOString(),
        }).catch((err) => console.warn('Comment email notify error:', err));
      }
    }
  };

  const toggleLikeComment = (storyId: string, commentId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;
        const updated = {
          ...s,
          comments: toggleLikeCommentInList(s.comments || [], commentId, currentUser.id),
        };
        saveStoryToCloudflare(updated);
        return updated;
      })
    );
  };

  const addReplyToComment = (storyId: string, parentCommentId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    const newReply: Comment = {
      id: 'reply_' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userUsername: currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, ''),
      userAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString().split('T')[0],
      likes: 0,
      likedBy: [],
      replies: [],
    };

    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;
        const updated = {
          ...s,
          comments: addReplyToCommentInList(s.comments || [], parentCommentId, newReply),
        };
        saveStoryToCloudflare(updated);
        return updated;
      })
    );

    // Send email notification to parent comment owner or story author
    const targetStory = stories.find((s) => s.id === storyId);
    const findCommentInTree = (comms: Comment[]): Comment | undefined => {
      for (const c of comms) {
        if (c.id === parentCommentId) return c;
        if (c.replies && c.replies.length > 0) {
          const found = findCommentInTree(c.replies);
          if (found) return found;
        }
      }
      return undefined;
    };
    const parentComment = targetStory?.comments ? findCommentInTree(targetStory.comments) : undefined;
    if (parentComment && parentComment.userId !== currentUser.id) {
      const recipientUser = users.find((u) => u.id === parentComment.userId);
      if (recipientUser?.email) {
        sendCommentEmailNotification({
          recipientEmail: recipientUser.email,
          recipientName: recipientUser.name,
          storyId: targetStory?.id,
          storyTitle: targetStory?.title,
          parentId: parentCommentId,
          replyToUserName: parentComment.userName,
          content: content.trim(),
          userName: currentUser.name,
          userUsername: currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, ''),
          createdAt: new Date().toISOString(),
        }).catch((err) => console.warn('Reply email notify error:', err));
      }
    }
  };

  const deleteComment = (storyId: string, commentId: string) => {
    if (!currentUser) return;
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;
        const updated = {
          ...s,
          comments: deleteCommentFromList(s.comments || [], commentId),
        };
        saveStoryToCloudflare(updated);
        return updated;
      })
    );
  };

  const incrementStoryReads = (storyId: string, chapterIndex: number) => {
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;
        const updatedChapters = s.chapters.map((chap, idx) =>
          idx === chapterIndex ? { ...chap, readCount: (chap.readCount || 0) + 1 } : chap
        );
        const updated = { ...s, reads: (s.reads || 0) + 1, chapters: updatedChapters };
        saveStoryToCloudflare(updated);
        return updated;
      })
    );
  };

  // ==========================================
  // FORUM & COMMUNITY
  // ==========================================

  const addForumTopic = (title: string, category: ForumTopic['category'], content: string, tags?: string[]): string => {
    if (!currentUser || !title.trim() || !content.trim()) return '';
    const newId = 'topic_' + Date.now();
    const newTopic: ForumTopic = {
      id: newId,
      title: title.trim(),
      category,
      content: content.trim(),
      tags: tags || [],
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      replies: [],
      views: 1,
    };
    setForumTopics((prev) => [newTopic, ...prev]);
    saveForumTopicToCloudflare(newTopic);
    return newId;
  };

  const deleteForumTopic = (topicId: string) => {
    if (!currentUser) return;
    setForumTopics((prev) => prev.filter((t) => t.id !== topicId));
    deleteForumTopicFromCloudflare(topicId);
  };

  const addForumReply = (topicId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    const newReply: ForumReply = {
      id: 'freply_' + Date.now(),
      topicId,
      userId: currentUser.id,
      userName: currentUser.name,
      userUsername: currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, ''),
      userAvatar: currentUser.avatar,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
    };
    setForumTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        const updated = {
          ...t,
          replies: [...(t.replies || []), newReply],
        };
        saveForumTopicToCloudflare(updated);
        return updated;
      })
    );
  };

  const deleteForumReply = (topicId: string, replyId: string) => {
    if (!currentUser) return;
    setForumTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        const updated = {
          ...t,
          replies: (t.replies || []).filter((r) => r.id !== replyId),
        };
        saveForumTopicToCloudflare(updated);
        return updated;
      })
    );
  };

  const toggleLikeForumTopic = (topicId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setForumTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        const isLiked = t.likedBy.includes(currentUser.id);
        const newLikedBy = isLiked ? t.likedBy.filter((id) => id !== currentUser.id) : [...t.likedBy, currentUser.id];
        const updated = {
          ...t,
          likedBy: newLikedBy,
          likes: newLikedBy.length,
        };
        saveForumTopicToCloudflare(updated);
        return updated;
      })
    );
  };

  const toggleLikeForumReply = (topicId: string, replyId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setForumTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        const updatedReplies = (t.replies || []).map((r) => {
          if (r.id !== replyId) return r;
          const isLiked = r.likedBy.includes(currentUser.id);
          const newLikedBy = isLiked ? r.likedBy.filter((id) => id !== currentUser.id) : [...r.likedBy, currentUser.id];
          return {
            ...r,
            likedBy: newLikedBy,
            likes: newLikedBy.length,
          };
        });
        const updated = { ...t, replies: updatedReplies };
        saveForumTopicToCloudflare(updated);
        return updated;
      })
    );
  };

  // ==========================================
  // ARCHIVED STORIES (PDF ARCHIVE)
  // ==========================================

  const addArchivedStory = async (storyData: {
    title: string;
    originalAuthor: string;
    chapterCount: string | number;
    summary: string;
    category?: Category | string;
    tags?: string[];
    pdfUrl: string;
    pdfFileName?: string;
    pdfFileSize?: string;
    coverUrl?: string;
  }): Promise<{ success: boolean; id?: string; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Giriş yapmanız gerekmektedir.' };
    const newId = 'arch_' + Date.now();
    const newArchived: ArchivedStory = {
      id: newId,
      title: storyData.title,
      originalAuthor: storyData.originalAuthor,
      chapterCount: String(storyData.chapterCount),
      summary: storyData.summary,
      category: storyData.category || 'Genel Kurgu',
      tags: storyData.tags || [],
      pdfUrl: storyData.pdfUrl,
      pdfFileName: storyData.pdfFileName,
      pdfFileSize: storyData.pdfFileSize,
      coverUrl: storyData.coverUrl,
      addedByUserId: currentUser.id,
      addedByUserName: currentUser.name,
      addedByUserUsername: currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, ''),
      addedByUserAvatar: currentUser.avatar,
      addedAt: new Date().toISOString(),
      downloads: 0,
      downloadsCount: 0,
      likes: 0,
      likedBy: [],
      comments: [],
    };
    setArchivedStories((prev) => [newArchived, ...prev]);
    return { success: true, id: newId };
  };

  const deleteArchivedStory = (archiveId: string) => {
    if (!currentUser) return;
    setArchivedStories((prev) => prev.filter((a) => a.id !== archiveId));
  };

  const toggleLikeArchivedStory = (archiveId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setArchivedStories((prev) =>
      prev.map((a) => {
        if (a.id !== archiveId) return a;
        const isLiked = a.likedBy.includes(currentUser.id);
        const newLikedBy = isLiked ? a.likedBy.filter((id) => id !== currentUser.id) : [...a.likedBy, currentUser.id];
        return {
          ...a,
          likedBy: newLikedBy,
          likes: newLikedBy.length,
        };
      })
    );
  };

  const addArchivedStoryComment = (archiveId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    const newComm: ArchivedStoryComment = {
      id: 'arch_comm_' + Date.now(),
      archiveId,
      userId: currentUser.id,
      userName: currentUser.name,
      userUsername: currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, ''),
      userAvatar: currentUser.avatar,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
    };
    setArchivedStories((prev) =>
      prev.map((a) => {
        if (a.id !== archiveId) return a;
        return {
          ...a,
          comments: [newComm, ...(a.comments || [])],
        };
      })
    );
  };

  const deleteArchivedStoryComment = (archiveId: string, commentId: string) => {
    if (!currentUser) return;
    setArchivedStories((prev) =>
      prev.map((a) => {
        if (a.id !== archiveId) return a;
        return {
          ...a,
          comments: (a.comments || []).filter((c) => c.id !== commentId),
        };
      })
    );
  };

  const incrementArchivedStoryDownloads = (archiveId: string) => {
    setArchivedStories((prev) =>
      prev.map((a) => {
        if (a.id !== archiveId) return a;
        return {
          ...a,
          downloadsCount: (a.downloadsCount || 0) + 1,
        };
      })
    );
  };

  // ==========================================
  // LIBRARY & READING
  // ==========================================

  const isStoryInLibrary = (storyId: string) => {
    if (!currentUser) return false;
    return currentUser.library?.some((item) => item.storyId === storyId) || false;
  };

  const toggleLibraryStory = (
    storyId: string,
    status: 'reading' | 'want_to_read' | 'completed' | 'favorite' = 'reading'
  ) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUser.id) return u;
        const currentLib = u.library || [];
        const exists = currentLib.some((item) => item.storyId === storyId);
        let newLib;
        if (exists) {
          newLib = currentLib.filter((item) => item.storyId !== storyId);
        } else {
          newLib = [
            ...currentLib,
            {
              storyId,
              status,
              lastChapterIndex: 0,
              updatedAt: new Date().toISOString().split('T')[0],
            },
          ];
        }
        const updatedUser = { ...u, library: newLib };
        saveUserToCloudflare(updatedUser);
        return updatedUser;
      })
    );
  };

  // ==========================================
  // FOLLOW SYSTEM
  // ==========================================

  const toggleFollowUser = (targetUserId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (targetUserId === currentUser.id) return;

    const currentFollowing = currentUser.following || [];
    const isFollowing = currentFollowing.includes(targetUserId);

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          const newFollowing = isFollowing
            ? (u.following || []).filter((id) => id !== targetUserId)
            : [...(u.following || []), targetUserId];
          const updatedUser = { ...u, following: newFollowing, followingCount: newFollowing.length };
          saveUserToCloudflare(updatedUser);
          return updatedUser;
        }
        if (u.id === targetUserId) {
          const newFollowers = isFollowing
            ? (u.followers || []).filter((id) => id !== currentUser.id)
            : [...(u.followers || []), currentUser.id];
          const updatedUser = { ...u, followers: newFollowers, followersCount: newFollowers.length };
          saveUserToCloudflare(updatedUser);
          return updatedUser;
        }
        return u;
      })
    );

    if (!isFollowing) {
      sendNotification({
        userId: targetUserId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        type: 'follow',
        title: 'Yeni Takipçi',
        message: `${currentUser.name} seni takip etmeye başladı.`,
        targetUserId: currentUser.id,
      });
    }
  };

  // Notifications
  const userNotifications = notifications.filter((n) => n.userId === currentUserId);
  const unreadNotificationCount = userNotifications.filter((n) => !n.isRead).length;

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === notificationId) {
          const updated = { ...n, isRead: true };
          saveNotificationToCloudflare(updated);
          return updated;
        }
        return n;
      })
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.userId === currentUserId) {
          const updated = { ...n, isRead: true };
          saveNotificationToCloudflare(updated);
          return updated;
        }
        return n;
      })
    );
  };

  // ==========================================
  // ADMIN & MODERATION SYSTEM
  // ==========================================
  const isAdmin = Boolean(
    currentUser && (
      currentUser.role === 'admin' ||
      currentUser.email?.toLowerCase() === 'semajim30@gmail.com' ||
      currentUser.email?.toLowerCase() === 'wattyboontr@gmail.com'
    )
  );

  const updateUserRole = (targetUserId: string, newRole: UserRole) => {
    if (!isAdmin) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== targetUserId) return u;
        const updated = { ...u, role: newRole };
        saveUserToCloudflare(updated);
        
        const roleLabels: Record<UserRole, string> = {
          admin: 'Yönetici (Admin)',
          moderator: 'Moderatör',
          author: 'Yazar',
          user: 'Standart Üye'
        };

        sendNotification({
          userId: targetUserId,
          type: 'system',
          title: '🛡️ Yetki & Rol Güncellendi',
          message: `Hesabınızın yetki düzeyi WattyBoon yönetimi tarafından "${roleLabels[newRole] || newRole}" olarak güncellendi.`,
        });
        return updated;
      })
    );
  };

  const adminDeleteUser = (targetUserId: string, reason?: string): { success: boolean; error?: string } => {
    if (!isAdmin) return { success: false, error: 'Bu işlem için yönetici yetkisi gereklidir.' };
    const target = users.find((u) => u.id === targetUserId);
    if (!target) return { success: false, error: 'Kullanıcı bulunamadı.' };
    
    if (target.email?.toLowerCase() === 'semajim30@gmail.com' || target.email?.toLowerCase() === 'wattyboontr@gmail.com') {
      return { success: false, error: 'Baş yönetici hesabı silinemez veya kısıtlanamaz!' };
    }

    setUsers((prev) => prev.filter((u) => u.id !== targetUserId));
    deleteUserFromCloudflare(targetUserId);

    // If deleting self (not recommended)
    if (currentUserId === targetUserId) {
      logout();
    }

    return { success: true };
  };

  const adminDeleteStory = (storyId: string, reason?: string) => {
    if (!isAdmin) return;
    const targetStory = stories.find((s) => s.id === storyId);
    if (!targetStory) return;

    setStories((prev) => prev.filter((s) => s.id !== storyId));
    deleteStoryFromCloudflare(storyId);

    if (targetStory.authorId) {
      sendNotification({
        userId: targetStory.authorId,
        type: 'system',
        title: '⚠️ Hikayeniz Yayından Kaldırıldı',
        message: `"${targetStory.title}" adlı hikayeniz, platform kuralları veya yönetici kararı doğrultusunda yönetim ekibi tarafından yayından kaldırılmıştır.${reason ? ` Gerekçe: ${reason}` : ''}`,
      });
    }
  };

  const adminDeleteForumTopic = (topicId: string, reason?: string) => {
    if (!isAdmin) return;
    const targetTopic = forumTopics.find((t) => t.id === topicId);
    if (!targetTopic) return;

    setForumTopics((prev) => prev.filter((t) => t.id !== topicId));
    deleteForumTopicFromCloudflare(topicId);

    if (targetTopic.authorId) {
      sendNotification({
        userId: targetTopic.authorId,
        type: 'system',
        title: '⚠️ Forum Konunuz Kaldırıldı',
        message: `"${targetTopic.title}" başlıklı forum konunuz yönetim ekibi tarafından yayından kaldırılmıştır.${reason ? ` Gerekçe: ${reason}` : ''}`,
      });
    }
  };

  const adminDeleteForumReply = (topicId: string, replyId: string, reason?: string) => {
    if (!isAdmin) return;
    const targetTopic = forumTopics.find((t) => t.id === topicId);
    if (!targetTopic) return;
    const targetReply = targetTopic.replies?.find((r) => r.id === replyId);

    setForumTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        const updated = {
          ...t,
          replies: (t.replies || []).filter((r) => r.id !== replyId),
        };
        saveForumTopicToCloudflare(updated);
        return updated;
      })
    );

    if (targetReply?.userId) {
      sendNotification({
        userId: targetReply.userId,
        type: 'system',
        title: '⚠️ Forum Yanıtınız Kaldırıldı',
        message: `"${targetTopic.title}" konusundaki yanıtınız yönetim ekibi tarafından kaldırılmıştır.${reason ? ` Gerekçe: ${reason}` : ''}`,
      });
    }
  };

  const adminDeleteComment = (storyId: string, commentId: string, reason?: string) => {
    if (!isAdmin) return;
    const targetStory = stories.find((s) => s.id === storyId);
    if (!targetStory) return;
    const targetComment = targetStory.comments?.find((c) => c.id === commentId);

    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;
        const updated = {
          ...s,
          comments: (s.comments || []).filter((c) => c.id !== commentId),
        };
        saveStoryToCloudflare(updated);
        return updated;
      })
    );

    if (targetComment?.userId) {
      sendNotification({
        userId: targetComment.userId,
        type: 'system',
        title: '⚠️ Yorumunuz Kaldırıldı',
        message: `"${targetStory.title}" adlı hikayedeki yorumunuz yönetim ekibi tarafından kaldırılmıştır.${reason ? ` Gerekçe: ${reason}` : ''}`,
      });
    }
  };

  const adminTogglePinForumTopic = (topicId: string) => {
    if (!isAdmin) return;
    setForumTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        const updated = { ...t, isPinned: !t.isPinned };
        saveForumTopicToCloudflare(updated);
        return updated;
      })
    );
  };

  // ==========================================
  // STORY REPORTS & MODERATION (Şikayetler)
  // ==========================================

  const submitStoryReport = async (reportData: {
    storyId: string;
    storyTitle: string;
    storyCoverUrl?: string;
    authorId: string;
    authorName: string;
    authorUsername?: string;
    reason: ReportReason;
    reasonTitle: string;
    description: string;
    originalSourceUrl?: string;
  }): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return { success: false, message: 'Şikayette bulunmak için lütfen giriş yapınız.' };
    }

    const newReport: StoryReport = {
      id: 'report_' + Date.now(),
      storyId: reportData.storyId,
      storyTitle: reportData.storyTitle,
      storyCoverUrl: reportData.storyCoverUrl,
      authorId: reportData.authorId,
      authorName: reportData.authorName,
      authorUsername: reportData.authorUsername,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterUsername: currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, ''),
      reporterEmail: currentUser.email,
      reason: reportData.reason,
      reasonTitle: reportData.reasonTitle,
      description: reportData.description,
      originalSourceUrl: reportData.originalSourceUrl,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setReports((prev) => [newReport, ...prev]);
    await saveReportToCloudflare(newReport);
    return { 
      success: true, 
      message: 'Şikayetiniz yöneticilere iletildi. Çalıntı / ihlal incelemesi yapılarak gerekirse işlem uygulanacaktır.' 
    };
  };

  const adminResolveReport = async (
    reportId: string, 
    status: ReportStatus, 
    note?: string, 
    deleteReportedStory?: boolean
  ): Promise<boolean> => {
    if (!isAdmin) return false;
    const targetReport = reports.find((r) => r.id === reportId);
    if (!targetReport) return false;

    const updatedReport: StoryReport = {
      ...targetReport,
      status,
      resolvedAt: new Date().toISOString(),
      resolvedBy: currentUser?.name || 'Yönetici',
      resolutionNote: note,
    };

    setReports((prev) => prev.map((r) => (r.id === reportId ? updatedReport : r)));
    await saveReportToCloudflare(updatedReport);

    if (deleteReportedStory && targetReport.storyId) {
      adminDeleteStory(
        targetReport.storyId,
        `Şikayet incelemesi sonucu kaldırıldı: ${targetReport.reasonTitle}${note ? ` (${note})` : ''}`
      );
    }

    // Send outcome notification to reporter
    if (targetReport.reporterId) {
      sendNotification({
        userId: targetReport.reporterId,
        type: 'system',
        title: '🛡️ Şikayet Raporunuz İncelendi',
        message: `"${targetReport.storyTitle}" adlı hikaye hakkındaki şikayetiniz incelendi. Sonuç: ${
          status === 'resolved' ? 'Gerekli işlem yapıldı / Eser yayından kaldırıldı' : 'İncelendi & Kural ihlali bulunamadı'
        }.${note ? ` Yönetici Notu: ${note}` : ''}`,
      });
    }

    return true;
  };

  const adminDeleteReport = async (reportId: string): Promise<boolean> => {
    if (!isAdmin) return false;
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    await deleteReportFromCloudflare(reportId);
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        isNsfwEnabled,
        toggleNsfw,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        selectedTagFilter,
        setSelectedTagFilter,
        currentUser,
        users,
        loginWithGoogle,
        login,
        register,
        sendPasswordReset,
        changePassword,
        deleteAccount,
        logout,
        switchDemoUser,
        updateProfile,

        paragraphComments,
        addParagraphComment,
        toggleLikeParagraphComment,
        deleteParagraphComment,

        activeView,
        setActiveView,
        activeStoryId,
        activeChapterIndex,
        activeAuthorId,
        editingStoryId,
        openStoryDetail,
        openStoryReader,
        openAuthorProfile,
        openStoryEditor,

        stories,
        saveStory,
        deleteStory,
        deleteChapter,
        toggleLikeStory,
        toggleLikeChapter,
        addComment,
        toggleLikeComment,
        addReplyToComment,
        deleteComment,
        incrementStoryReads,

        forumTopics,
        addForumTopic,
        deleteForumTopic,
        addForumReply,
        deleteForumReply,
        toggleLikeForumTopic,
        toggleLikeForumReply,

        archivedStories,
        addArchivedStory,
        deleteArchivedStory,
        toggleLikeArchivedStory,
        addArchivedStoryComment,
        deleteArchivedStoryComment,
        incrementArchivedStoryDownloads,

        toggleLibraryStory,
        isStoryInLibrary,

        updateReadingProgress,

        createCustomList,
        addStoryToCustomList,
        removeStoryFromCustomList,
        deleteCustomList,

        messages,
        unreadMessageCount,
        sendDirectMessage,
        markMessagesAsRead,
        isMessagingOpen,
        activeMessagingUserId,
        openMessagingWithUser,
        closeMessaging,

        toggleFollowUser,

        notifications: userNotifications,
        unreadNotificationCount,
        markAsRead,
        markAllAsRead,

        // Reports
        reports,
        submitStoryReport,
        adminResolveReport,
        adminDeleteReport,

        isAdmin,
        updateUserRole,
        adminDeleteUser,
        adminDeleteStory,
        adminDeleteForumTopic,
        adminDeleteForumReply,
        adminDeleteComment,
        adminTogglePinForumTopic,

        isAuthModalOpen,
        setIsAuthModalOpen,
        autoOpenProfileSettings,
        setAutoOpenProfileSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
