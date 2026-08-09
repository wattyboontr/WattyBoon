import React, { createContext, useContext, useState, useEffect } from 'react';
import { Story, User, AppNotification, Category, Visibility, DirectMessage, CustomList, ReadingProgress, ParagraphComment } from '../types';
import { INITIAL_STORIES, INITIAL_USERS, INITIAL_NOTIFICATIONS, INITIAL_MESSAGES } from '../data/mockData';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

// Firestore Async Persistence Helpers
const syncUserToFirestore = async (user: User) => {
  try {
    await setDoc(doc(db, 'users', user.id), user, { merge: true });
  } catch (err) {
    console.error('Firestore syncUser error:', err);
  }
};

const syncStoryToFirestore = async (story: Story) => {
  try {
    await setDoc(doc(db, 'stories', story.id), story, { merge: true });
  } catch (err) {
    console.error('Firestore syncStory error:', err);
  }
};

const deleteStoryFromFirestore = async (storyId: string) => {
  try {
    await deleteDoc(doc(db, 'stories', storyId));
  } catch (err) {
    console.error('Firestore deleteStory error:', err);
  }
};

const syncNotificationToFirestore = async (notif: AppNotification) => {
  try {
    await setDoc(doc(db, 'notifications', notif.id), notif, { merge: true });
  } catch (err) {
    console.error('Firestore syncNotification error:', err);
  }
};

const syncMessageToFirestore = async (msg: DirectMessage) => {
  try {
    await setDoc(doc(db, 'messages', msg.id), msg, { merge: true });
  } catch (err) {
    console.error('Firestore syncMessage error:', err);
  }
};

const syncParagraphCommentToFirestore = async (pcomm: ParagraphComment) => {
  try {
    await setDoc(doc(db, 'paragraphComments', pcomm.id), pcomm, { merge: true });
  } catch (err) {
    console.error('Firestore syncParagraphComment error:', err);
  }
};

export type ViewType = 'explore' | 'library' | 'editor' | 'profile' | 'reader' | 'notifications' | 'story-detail';

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
  login: (email: string) => boolean;
  register: (name: string, username: string, email: string) => void;
  logout: () => void;
  switchDemoUser: (userId: string) => void;
  updateProfile: (bio: string, name?: string, avatar?: string, coverUrl?: string) => void;

  // Paragraph Comments (Metinler Arası Yorumlar)
  paragraphComments: ParagraphComment[];
  addParagraphComment: (storyId: string, chapterIndex: number, paragraphIndex: number, content: string, selectedText?: string) => void;
  toggleLikeParagraphComment: (commentId: string) => void;

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
  toggleLikeStory: (storyId: string) => void;
  toggleLikeChapter: (storyId: string, chapterIndex: number) => void;
  addComment: (storyId: string, content: string) => void;
  incrementStoryReads: (storyId: string, chapterOrder: number) => void;

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

  // Modals
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'wattyboon_v4_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}dark_mode`);
    return saved ? JSON.parse(saved) : true; // Default to sleek dark mode
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

  // Users state
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Current logged in user (Default to empty/guest)
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}current_user_id`);
    return saved !== null ? saved : '';
  });

  const currentUser = currentUserId ? (users.find((u) => u.id === currentUserId) || null) : null;

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}current_user_id`, currentUserId);
  }, [currentUserId]);

  // Firestore Realtime Users Listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      if (!snapshot.empty) {
        const list: User[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as User);
        });
        setUsers(list);
      }
    }, (err) => console.error('Firestore users snapshot error:', err));
    return () => unsub();
  }, []);

  // Stories state
  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}stories`);
    return saved ? JSON.parse(saved) : INITIAL_STORIES;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}stories`, JSON.stringify(stories));
  }, [stories]);

  // Firestore Realtime Stories Listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'stories'), (snapshot) => {
      if (!snapshot.empty) {
        const list: Story[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Story);
        });
        setStories(list);
      }
    }, (err) => console.error('Firestore stories snapshot error:', err));
    return () => unsub();
  }, []);

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  // Firestore Realtime Notifications Listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      if (!snapshot.empty) {
        const list: AppNotification[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as AppNotification);
        });
        setNotifications(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    }, (err) => console.error('Firestore notifications snapshot error:', err));
    return () => unsub();
  }, []);

  // Messages state
  const [messages, setMessages] = useState<DirectMessage[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}messages`);
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}messages`, JSON.stringify(messages));
  }, [messages]);

  // Firestore Realtime Messages Listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'messages'), (snapshot) => {
      if (!snapshot.empty) {
        const list: DirectMessage[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as DirectMessage);
        });
        setMessages(list);
      }
    }, (err) => console.error('Firestore messages snapshot error:', err));
    return () => unsub();
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
    syncMessageToFirestore(newMsg);

    sendNotification({
      userId: receiverId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      type: 'system',
      title: 'Yeni Mesaj',
      message: `${currentUser.name} sana bir mesaj gönderdi.`,
    });
  };

  const markMessagesAsRead = (senderId: string) => {
    if (!currentUser) return;
    setMessages((prev) =>
      prev.map((m) => {
        if (m.senderId === senderId && m.receiverId === currentUser.id) {
          const updated = { ...m, isRead: true };
          syncMessageToFirestore(updated);
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
        const currentProgress = u.readingProgress || [];
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
        syncUserToFirestore(updatedUser);
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
        syncUserToFirestore(updatedUser);
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
        syncUserToFirestore(updatedUser);
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
        syncUserToFirestore(updatedUser);
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
        syncUserToFirestore(updatedUser);
        return updatedUser;
      })
    );
  };

  // View & Navigation State
  const [activeView, setActiveView] = useState<ViewType>('explore');
  const [activeStoryId, setActiveStoryId] = useState<string | null>('story_1');
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [activeAuthorId, setActiveAuthorId] = useState<string | null>(null);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Helper to add notification
  const sendNotification = (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif_' + Date.now(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    syncNotificationToFirestore(newNotif);
  };

  // Auth actions
  const login = (email: string) => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUserId(found.id);
      return true;
    }
    return false;
  };

  const register = (name: string, username: string, email: string) => {
    const newId = 'user_' + Date.now();
    const newUser: User = {
      id: newId,
      name,
      username: username.startsWith('@') ? username.slice(1) : username,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      bio: 'Henüz bir biyografi eklenmedi.',
      followers: [],
      following: [],
      joinedDate: new Date().toISOString().split('T')[0],
      library: [],
    };
    setUsers((prev) => [...prev, newUser]);
    syncUserToFirestore(newUser);
    setCurrentUserId(newId);
  };

  const logout = () => {
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
          syncUserToFirestore(updatedUser);
          return updatedUser;
        }
        return u;
      })
    );
  };

  // Paragraph Comments state
  const [paragraphComments, setParagraphComments] = useState<ParagraphComment[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}paragraph_comments`);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'pcomm_1',
        storyId: 'story_1',
        chapterIndex: 0,
        paragraphIndex: 0,
        userId: 'user_2',
        userName: 'Elif Şafak Demir',
        userUsername: 'elif_yazar',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        content: 'Bu giriş cümlesi inanılmaz etkileyici! Tüylerim diken diken oldu.',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        likes: 4,
        likedBy: ['user_1'],
      },
      {
        id: 'pcomm_2',
        storyId: 'story_1',
        chapterIndex: 0,
        paragraphIndex: 0,
        userId: 'user_3',
        userName: 'Mert Korhan',
        userUsername: 'mert_k',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
        content: 'Aynen katılıyorum, atmosfer çizimi harika.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        likes: 2,
        likedBy: [],
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}paragraph_comments`, JSON.stringify(paragraphComments));
  }, [paragraphComments]);

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
    syncParagraphCommentToFirestore(newComment);
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
          syncParagraphCommentToFirestore(updated);
          return updated;
        }
        return c;
      })
    );
  };

  // Navigation helpers
  const openStoryDetail = (storyId: string) => {
    setActiveStoryId(storyId);
    setActiveView('story-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openStoryReader = (storyId: string, chapterIndex: number = 0) => {
    setActiveStoryId(storyId);
    setActiveChapterIndex(chapterIndex);
    setActiveView('reader');
    incrementStoryReads(storyId, chapterIndex);
    updateReadingProgress(storyId, chapterIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuthorProfile = (authorId: string) => {
    setActiveAuthorId(authorId);
    setActiveView('profile');
  };

  const openStoryEditor = (storyId: string | null = null) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setEditingStoryId(storyId);
    setActiveView('editor');
  };

  // Story actions
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
            syncStoryToFirestore(updated);
            return updated;
          }
          return s;
        })
      );
    } else {
      // Create new
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
      syncStoryToFirestore(newStory);

      // Notify followers if public
      if (newStory.visibility === 'public') {
        currentUser.followers.forEach((followerId) => {
          sendNotification({
            userId: followerId,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderAvatar: currentUser.avatar,
            type: 'new_chapter',
            title: 'Yeni Hikaye Yayınlandı',
            message: `${currentUser.name} yeni bir hikaye yayınladı: "${newStory.title}"`,
            targetStoryId: targetId,
          });
        });
      }
    }

    return targetId;
  };

  const deleteStory = (storyId: string) => {
    setStories((prev) => prev.filter((s) => s.id !== storyId));
    deleteStoryFromFirestore(storyId);
    if (activeStoryId === storyId) {
      setActiveStoryId(null);
      setActiveView('explore');
    }
  };

  const toggleLikeStory = (storyId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;
        const hasLiked = s.likedBy.includes(currentUser.id);
        const newLikedBy = hasLiked
          ? s.likedBy.filter((id) => id !== currentUser.id)
          : [...s.likedBy, currentUser.id];
        const newLikes = hasLiked ? Math.max(0, s.likes - 1) : s.likes + 1;

        // Notify author if liked
        if (!hasLiked && s.authorId !== currentUser.id) {
          sendNotification({
            userId: s.authorId,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderAvatar: currentUser.avatar,
            type: 'like',
            title: 'Hikayen Beğenildi',
            message: `${currentUser.name} "${s.title}" hikayeni beğendi!`,
            targetStoryId: s.id,
          });
        }

        const updated = { ...s, likes: newLikes, likedBy: newLikedBy };
        syncStoryToFirestore(updated);
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
          const currentLikedBy = chap.likedBy || [];
          const currentLikes = chap.likes || 0;
          const hasLiked = currentLikedBy.includes(currentUser.id);
          const newLikedBy = hasLiked
            ? currentLikedBy.filter((id) => id !== currentUser.id)
            : [...currentLikedBy, currentUser.id];
          const newLikes = hasLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;

          if (!hasLiked && s.authorId !== currentUser.id) {
            sendNotification({
              userId: s.authorId,
              senderId: currentUser.id,
              senderName: currentUser.name,
              senderAvatar: currentUser.avatar,
              type: 'like',
              title: 'Bölümün Beğenildi',
              message: `${currentUser.name} "${s.title}" hikayendeki ${chap.title || `Bölüm ${idx + 1}`} bölümünü beğendi!`,
              targetStoryId: s.id,
              targetChapterIndex: idx,
            });
          }

          return { ...chap, likes: newLikes, likedBy: newLikedBy };
        });
        const updated = { ...s, chapters: updatedChapters };
        syncStoryToFirestore(updated);
        return updated;
      })
    );
  };

  const addComment = (storyId: string, content: string) => {
    if (!currentUser || !content.trim()) return;

    const newComment = {
      id: 'c_' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userUsername: currentUser.username,
      userAvatar: currentUser.avatar,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
    };

    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;

        // Notify story author
        if (s.authorId !== currentUser.id) {
          sendNotification({
            userId: s.authorId,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderAvatar: currentUser.avatar,
            type: 'comment',
            title: 'Yeni Yorum',
            message: `${currentUser.name} "${s.title}" hikayene yorum yaptı.`,
            targetStoryId: s.id,
          });
        }

        const updated = { ...s, comments: [newComment, ...s.comments] };
        syncStoryToFirestore(updated);
        return updated;
      })
    );
  };

  const incrementStoryReads = (storyId: string, chapterIndex: number) => {
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;
        const updatedChapters = s.chapters.map((chap, idx) =>
          idx === chapterIndex ? { ...chap, readCount: chap.readCount + 1 } : chap
        );
        const updated = { ...s, reads: s.reads + 1, chapters: updatedChapters };
        syncStoryToFirestore(updated);
        return updated;
      })
    );
  };

  // Library actions
  const isStoryInLibrary = (storyId: string) => {
    if (!currentUser) return false;
    return currentUser.library.some((item) => item.storyId === storyId);
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
        const exists = u.library.some((item) => item.storyId === storyId);
        let newLib;
        if (exists) {
          newLib = u.library.filter((item) => item.storyId !== storyId);
        } else {
          newLib = [
            ...u.library,
            {
              storyId,
              status,
              lastChapterIndex: 0,
              updatedAt: new Date().toISOString().split('T')[0],
            },
          ];
        }
        const updatedUser = { ...u, library: newLib };
        syncUserToFirestore(updatedUser);
        return updatedUser;
      })
    );
  };

  // Follow actions
  const toggleFollowUser = (targetUserId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (targetUserId === currentUser.id) return;

    const isFollowing = currentUser.following.includes(targetUserId);

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          const newFollowing = isFollowing
            ? u.following.filter((id) => id !== targetUserId)
            : [...u.following, targetUserId];
          const updatedUser = { ...u, following: newFollowing };
          syncUserToFirestore(updatedUser);
          return updatedUser;
        }
        if (u.id === targetUserId) {
          const newFollowers = isFollowing
            ? u.followers.filter((id) => id !== currentUser.id)
            : [...u.followers, currentUser.id];
          const updatedUser = { ...u, followers: newFollowers };
          syncUserToFirestore(updatedUser);
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
          syncNotificationToFirestore(updated);
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
          syncNotificationToFirestore(updated);
          return updated;
        }
        return n;
      })
    );
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
        login,
        register,
        logout,
        switchDemoUser,
        updateProfile,

        paragraphComments,
        addParagraphComment,
        toggleLikeParagraphComment,

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
        toggleLikeStory,
        toggleLikeChapter,
        addComment,
        incrementStoryReads,

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

        isAuthModalOpen,
        setIsAuthModalOpen,
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
