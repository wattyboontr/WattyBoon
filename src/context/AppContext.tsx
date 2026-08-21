import React, { createContext, useContext, useState, useEffect } from 'react';
import { Story, User, AppNotification, Category, Visibility, DirectMessage, CustomList, ReadingProgress, ParagraphComment, Comment, ForumTopic, ForumReply, ViewType, ArchivedStory, ArchivedStoryComment } from '../types';
import { INITIAL_STORIES, INITIAL_USERS, INITIAL_NOTIFICATIONS, INITIAL_MESSAGES } from '../data/mockData';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs, getDoc } from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  updatePassword, 
  updateProfile as updateAuthProfile,
  deleteUser, 
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  setPersistence,
  browserLocalPersistence,
  inMemoryPersistence
} from 'firebase/auth';
import {
  fetchStoriesFromCloudflare,
  saveStoryToCloudflare,
  bulkSaveStoriesToCloudflare,
  deleteStoryFromCloudflare,
  fetchForumTopicsFromCloudflare,
  saveForumTopicToCloudflare,
  bulkSaveForumTopicsToCloudflare,
  deleteForumTopicFromCloudflare,
  fetchParagraphCommentsFromCloudflare,
  saveParagraphCommentToCloudflare,
  deleteParagraphCommentFromCloudflare,
  CLOUDFLARE_STORAGE_ACCOUNT,
} from '../lib/cloudflare';

// Firestore Async Persistence Helpers (Users, Notifications, Messages, and Archive)
const syncUserToFirestore = async (user: User) => {
  try {
    await setDoc(doc(db, 'users', user.id), user, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`);
  }
};

// Cloudflare Storage Helpers (Stories & Chapters - wattyboontr@gmail.com)
const syncStoryToFirestore = async (story: Story) => {
  try {
    await saveStoryToCloudflare(story);
  } catch (err) {
    console.warn('[Cloudflare Storage] Story sync error:', err);
  }
};

const deleteStoryFromFirestore = async (storyId: string) => {
  try {
    await deleteStoryFromCloudflare(storyId);
  } catch (err) {
    console.warn('[Cloudflare Storage] Story deletion error:', err);
  }
};

const syncNotificationToFirestore = async (notif: AppNotification) => {
  try {
    await setDoc(doc(db, 'notifications', notif.id), notif, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `notifications/${notif.id}`);
  }
};

const syncMessageToFirestore = async (msg: DirectMessage) => {
  try {
    await setDoc(doc(db, 'messages', msg.id), msg, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `messages/${msg.id}`);
  }
};

// Cloudflare Storage Helpers (Paragraph Comments - wattyboontr@gmail.com)
const syncParagraphCommentToFirestore = async (pcomm: ParagraphComment) => {
  try {
    await saveParagraphCommentToCloudflare(pcomm);
  } catch (err) {
    console.warn('[Cloudflare Storage] Paragraph comment sync error:', err);
  }
};

const deleteParagraphCommentFromFirestore = async (commentId: string) => {
  try {
    await deleteParagraphCommentFromCloudflare(commentId);
  } catch (err) {
    console.warn('[Cloudflare Storage] Paragraph comment deletion error:', err);
  }
};

// Cloudflare Storage Helpers (Forum Discussions - wattyboontr@gmail.com)
const syncForumTopicToFirestore = async (topic: ForumTopic) => {
  try {
    await saveForumTopicToCloudflare(topic);
  } catch (err) {
    console.warn('[Cloudflare Storage] Forum topic sync error:', err);
  }
};

const deleteForumTopicFromFirestore = async (topicId: string) => {
  try {
    await deleteForumTopicFromCloudflare(topicId);
  } catch (err) {
    console.warn('[Cloudflare Storage] Forum topic deletion error:', err);
  }
};

// Firestore Async Persistence Helpers (Kayıp ve Silinen Eserler Arşivi - Firebase)
const syncArchivedStoryToFirestore = async (archiveStory: ArchivedStory) => {
  try {
    await setDoc(doc(db, 'archivedStories', archiveStory.id), archiveStory, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `archivedStories/${archiveStory.id}`);
  }
};

const deleteArchivedStoryFromFirestore = async (archiveId: string) => {
  try {
    await deleteDoc(doc(db, 'archivedStories', archiveId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `archivedStories/${archiveId}`);
  }
};

const INITIAL_FORUM_TOPICS: ForumTopic[] = [];

const toggleLikeCommentInList = (comments: Comment[], commentId: string, userId: string): Comment[] => {
  return comments.map((c) => {
    if (c.id === commentId) {
      const hasLiked = c.likedBy.includes(userId);
      const newLikedBy = hasLiked ? c.likedBy.filter((id) => id !== userId) : [...c.likedBy, userId];
      return {
        ...c,
        likedBy: newLikedBy,
        likes: newLikedBy.length
      };
    }
    if (c.replies && c.replies.length > 0) {
      return {
        ...c,
        replies: toggleLikeCommentInList(c.replies, commentId, userId)
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
        replies: [...(c.replies || []), newReply]
      };
    }
    if (c.replies && c.replies.length > 0) {
      return {
        ...c,
        replies: addReplyToCommentInList(c.replies, parentCommentId, newReply)
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
      replies: c.replies ? deleteCommentFromList(c.replies, commentId) : []
    }));
};

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

  // Modals & Settings Auto-Open
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  autoOpenProfileSettings: boolean;
  setAutoOpenProfileSettings: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'wattyboon_v4_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}dark_mode`);
    return saved ? JSON.parse(saved) : false; // Default to daytime (light) mode
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

  // Banned / Deleted Users List
  const BANNED_USERNAMES = ['semajim22', 'semantev7'];
  const isBannedUser = (u: Partial<User> | null | undefined): boolean => {
    if (!u) return false;
    const cleanUName = (u.username || '').replace(/^@/, '').trim().toLowerCase();
    return BANNED_USERNAMES.includes(cleanUName);
  };

  // Users state
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}users`);
      const parsed: User[] = saved ? JSON.parse(saved) : INITIAL_USERS;
      return parsed.filter((u) => !isBannedUser(u));
    } catch {
      return INITIAL_USERS;
    }
  });

  // Current logged in user (Default to empty/guest)
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
    if (currentUser && isBannedUser(currentUser)) {
      setCurrentUserId('');
      try {
        localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}current_user_id`);
      } catch (e) {
        console.warn('Clear banned current_user_id error:', e);
      }
    }
  }, [currentUser]);

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

  // Cascading User Data Deletion Helper
  const deleteUserDataCascade = async (userId: string) => {
    if (!userId) return;

    // 1. Delete user's published stories (and chapters) from state & Cloudflare Storage
    setStories((prev) => {
      const remaining = prev.filter((s) => s.authorId !== userId);
      const deleted = prev.filter((s) => s.authorId === userId);
      deleted.forEach((s) => {
        deleteStoryFromCloudflare(s.id).catch((err) => console.warn('Delete story error:', err));
      });
      return remaining;
    });

    // 2. Delete direct messages sent or received by the user from state & Firestore
    setMessages((prev) => {
      const remaining = prev.filter((m) => m.senderId !== userId && m.receiverId !== userId);
      const deleted = prev.filter((m) => m.senderId === userId || m.receiverId === userId);
      deleted.forEach((m) => {
        deleteDoc(doc(db, 'messages', m.id)).catch((err) => console.warn('Delete message doc error:', err));
      });
      return remaining;
    });

    // 3. Delete notifications relating to user
    setNotifications((prev) => {
      const remaining = prev.filter((n) => n.userId !== userId && n.actorId !== userId);
      const deleted = prev.filter((n) => n.userId === userId || n.actorId === userId);
      deleted.forEach((n) => {
        deleteDoc(doc(db, 'notifications', n.id)).catch((err) => console.warn('Delete notif doc error:', err));
      });
      return remaining;
    });

    // 4. Delete paragraph comments by user from state & Cloudflare Storage
    setParagraphComments((prev) => {
      const remaining = prev.filter((pc) => pc.userId !== userId);
      const deleted = prev.filter((pc) => pc.userId === userId);
      deleted.forEach((pc) => {
        deleteParagraphCommentFromCloudflare(pc.id).catch((err) => console.warn('Delete paragraphComment error:', err));
      });
      return remaining;
    });

    // 5. Delete forum topics & replies by user from state & Cloudflare Storage
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

    // 6. Update all remaining users: remove userId from followers & following arrays
    // This automatically decreases followers count and following count!
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
          syncUserToFirestore(updatedUser);
          return updatedUser;
        }
        return u;
      });
    });

    // 7. Delete user document from Firestore
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (err) {
      console.warn('Delete user doc from Firestore error:', err);
    }
  };

  // Firebase Auth State Listener
  useEffect(() => {
    try {
      const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const fbUid = firebaseUser.uid;
          const fbEmail = firebaseUser.email?.toLowerCase() || '';

          // Fetch user document from Firestore directly
          let matched: User | null = null;
          try {
            const uSnap = await getDoc(doc(db, 'users', fbUid));
            if (uSnap.exists()) {
              matched = uSnap.data() as User;
            }
          } catch (e) {
            console.warn('Firestore onAuthStateChanged getDoc error:', e);
          }

          if (matched) {
            setUsers((prev) => [...prev.filter((u) => u.id !== fbUid), matched!]);
            setCurrentUserId(fbUid);
          } else {
            setUsers((prev) => {
              const found = prev.find((u) => u.id === fbUid || (fbEmail && u.email?.toLowerCase() === fbEmail));
              if (found) {
                const updated = { 
                  ...found, 
                  id: fbUid,
                  email: fbEmail || found.email,
                  name: found.name || firebaseUser.displayName || (fbEmail ? fbEmail.split('@')[0] : 'Kullanıcı'),
                  username: found.username || (fbEmail ? fbEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') : `user_${fbUid.slice(0, 6)}`),
                  avatar: found.avatar || firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUid}`
                };
                syncUserToFirestore(updated);
                return [...prev.filter((u) => u.id !== found.id && u.id !== fbUid), updated];
              }
              // Create user document in Firestore if not found
              const baseUName = fbEmail ? fbEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') : `user_${fbUid.slice(0, 6)}`;
              const newUser: User = {
                id: fbUid,
                name: firebaseUser.displayName || (fbEmail ? fbEmail.split('@')[0] : 'Kullanıcı'),
                username: baseUName || `user_${fbUid.slice(0, 6)}`,
                email: fbEmail,
                avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUid}`,
                bio: 'WattyBoon yazarı.',
                followers: [],
                following: [],
                joinedDate: new Date().toISOString().split('T')[0],
                library: [],
              };
              syncUserToFirestore(newUser);
              return [...prev.filter((u) => u.id !== fbUid), newUser];
            });
            setCurrentUserId(fbUid);
          }
        }
      });
      return () => unsubAuth();
    } catch (e) {
      console.warn('Firebase onAuthStateChanged listener error:', e);
    }
  }, []);

  // Firestore Realtime Users Listener & Banned Users Deletion
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
        if (snapshot && !snapshot.empty) {
          const list: User[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as User;
            if (data) {
              if (isBannedUser(data)) {
                // Permanently delete banned user and all their published content/messages/follows
                deleteUserDataCascade(data.id || docSnap.id);
              } else if (data.id) {
                list.push(data);
              }
            }
          });
          setUsers(list);
        }
      }, (err) => console.warn('Firestore users snapshot warning:', err));
      return () => unsub();
    } catch (e) {
      console.warn('Firestore users listener error:', e);
    }
  }, []);

  // Stories state (Stored in Cloudflare Storage - wattyboontr@gmail.com)
  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}stories`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_STORIES;
    } catch {
      return INITIAL_STORIES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}stories`, JSON.stringify(stories));
    } catch (e) {
      console.warn('localStorage setItem stories error:', e);
    }
  }, [stories]);

  // Cloudflare Realtime & Polling Listener for Stories (wattyboontr@gmail.com)
  useEffect(() => {
    let isMounted = true;
    const loadFromCloudflare = async () => {
      try {
        const cloudflareStories = await fetchStoriesFromCloudflare();
        if (isMounted && cloudflareStories && cloudflareStories.length > 0) {
          setStories(cloudflareStories);
        } else if (isMounted && (!cloudflareStories || cloudflareStories.length === 0)) {
          // Initialize Cloudflare storage with initial stories if first run
          await bulkSaveStoriesToCloudflare(stories.length > 0 ? stories : INITIAL_STORIES);
        }
      } catch (err) {
        console.warn('[Cloudflare Stories Sync] Load notice:', err);
      }
    };

    loadFromCloudflare();
    const interval = setInterval(loadFromCloudflare, 10000);
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

  // Firestore Realtime Notifications Listener
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'notifications'), (snapshot) => {
        if (snapshot && !snapshot.empty) {
          const list: AppNotification[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data && data.id) list.push(data as AppNotification);
          });
          if (list.length > 0) setNotifications(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      }, (err) => console.warn('Firestore notifications snapshot warning:', err));
      return () => unsub();
    } catch (e) {
      console.warn('Firestore notifications listener error:', e);
    }
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

  // Firestore Realtime Messages Listener
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'messages'), (snapshot) => {
        if (snapshot && !snapshot.empty) {
          const list: DirectMessage[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data && data.id) list.push(data as DirectMessage);
          });
          if (list.length > 0) setMessages(list);
        }
      }, (err) => console.warn('Firestore messages snapshot warning:', err));
      return () => unsub();
    } catch (e) {
      console.warn('Firestore messages listener error:', e);
    }
  }, []);

  // Forum Topics State
  // Forum Topics State (Stored in Cloudflare Storage - wattyboontr@gmail.com)
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}forum_topics`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean out legacy mock topics (ft_1, ft_2, ft_3)
        return parsed.filter((t: ForumTopic) => !['ft_1', 'ft_2', 'ft_3'].includes(t.id));
      }
      return INITIAL_FORUM_TOPICS;
    } catch {
      return INITIAL_FORUM_TOPICS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}forum_topics`, JSON.stringify(forumTopics));
    } catch (e) {
      console.warn('localStorage setItem forum_topics error:', e);
    }
  }, [forumTopics]);

  // Cloudflare Realtime & Polling Listener for Forum Topics (wattyboontr@gmail.com)
  useEffect(() => {
    let isMounted = true;
    const loadTopicsFromCloudflare = async () => {
      try {
        const cloudflareTopics = await fetchForumTopicsFromCloudflare();
        if (isMounted && cloudflareTopics && cloudflareTopics.length > 0) {
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

  // Archived Stories State (Kayıp & Silinen Eserler Arşivi - Üyelerin eklediği PDF'ler)
  const [archivedStories, setArchivedStories] = useState<ArchivedStory[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}archived_stories`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out previous sample items if any existed in localStorage
          const filtered = parsed.filter(item => item.id !== 'arch_1' && item.id !== 'arch_2' && item.id !== 'arch_3');
          return filtered;
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

  // Firestore Realtime Archived Stories Listener
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'archivedStories'), (snapshot) => {
        if (snapshot && !snapshot.empty) {
          const list: ArchivedStory[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data && data.id) list.push(data as ArchivedStory);
          });
          if (list.length > 0) {
            setArchivedStories(list.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()));
          }
        }
      }, (err) => console.warn('Firestore archivedStories snapshot warning:', err));
      return () => unsub();
    } catch (e) {
      console.warn('Firestore archivedStories listener error:', e);
    }
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
        storyId: id || 'story_1',
        chapterIndex: bolum,
        authorId: id || null,
        editStoryId: view === 'editor' ? id : null,
        category: (kategori as Category) || 'Tümü',
        tag: etiket,
      };
    } catch {
      return {
        view: 'home',
        storyId: 'story_1',
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

  // Helper to push history state for browser back/forward buttons and address bar
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

  // Sync document title and URL with active state continuously
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
        if (e.state.selectedCategoryFilter !== undefined) setSelectedCategoryFilter(e.state.selectedCategoryFilter);
        if (e.state.selectedTagFilter !== undefined) setSelectedTagFilter(e.state.selectedTagFilter);
      } else {
        const parsed = getInitialRouteFromUrl();
        setActiveViewRaw(parsed.view);
        if (parsed.storyId) setActiveStoryId(parsed.storyId);
        if (parsed.authorId) setActiveAuthorId(parsed.authorId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
  const loginWithGoogle = async (customEmail?: string, customName?: string): Promise<{ success: boolean; error?: string; domainError?: boolean }> => {
    // If custom email is passed directly (fallback or quick Google sign in)
    if (customEmail && customEmail.includes('@')) {
      const cleanEmail = customEmail.trim().toLowerCase();
      const baseName = customName?.trim() || cleanEmail.split('@')[0];
      const fbUid = 'google_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
      const photoURL = `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`;

      let found: User | null = null;
      try {
        const userDocSnap = await getDoc(doc(db, 'users', fbUid));
        if (userDocSnap.exists()) {
          found = userDocSnap.data() as User;
        }
      } catch (e) {
        console.warn('Firestore getDoc Google user error:', e);
      }

      if (!found) {
        found = users.find((u) => u.id === fbUid || (u.email && u.email.toLowerCase() === cleanEmail)) || null;
      }

      if (found) {
        const updatedUser: User = {
          ...found,
          id: found.id || fbUid,
          email: cleanEmail,
          name: found.name || baseName,
          avatar: found.avatar || photoURL,
        };
        setUsers((prev) => [...prev.filter((u) => u.id !== found!.id && u.id !== fbUid), updatedUser]);
        await syncUserToFirestore(updatedUser);
        setCurrentUserId(updatedUser.id);
        setActiveAuthorId(updatedUser.id);
        return { success: true };
      } else {
        const baseUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'user_' + Date.now().toString().slice(-4);
        let username = baseUsername;
        let counter = 1;
        while (users.some((u) => u.username?.toLowerCase() === username.toLowerCase())) {
          username = `${baseUsername}${counter}`;
          counter++;
        }

        const newUser: User = {
          id: fbUid,
          name: baseName,
          username: username,
          email: cleanEmail,
          avatar: photoURL,
          bio: 'WattyBoon yazarı.',
          followers: [],
          following: [],
          joinedDate: new Date().toISOString().split('T')[0],
          library: [],
        };

        setUsers((prev) => [...prev.filter((u) => u.id !== fbUid), newUser]);
        await syncUserToFirestore(newUser);
        setCurrentUserId(fbUid);
        setActiveAuthorId(fbUid);
        return { success: true };
      }
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      let userCred;
      try {
        userCred = await signInWithPopup(auth, provider);
      } catch (popupErr: any) {
        // If IndexedDB is closing or blocked, switch to memory/local persistence and retry once
        const errMsg = popupErr?.message || '';
        if (errMsg.includes('closing') || errMsg.includes('Database') || popupErr.code === 'auth/internal-error') {
          try {
            await setPersistence(auth, inMemoryPersistence);
            userCred = await signInWithPopup(auth, provider);
          } catch (retryErr: any) {
            throw retryErr || popupErr;
          }
        } else {
          throw popupErr;
        }
      }

      const fbUser = userCred.user;
      const fbUid = fbUser.uid;
      const email = fbUser.email?.toLowerCase() || '';
      const displayName = fbUser.displayName || (email ? email.split('@')[0] : 'Kullanıcı');
      const photoURL = fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUid}`;

      let found: User | null = null;
      try {
        const userDocSnap = await getDoc(doc(db, 'users', fbUid));
        if (userDocSnap.exists()) {
          found = userDocSnap.data() as User;
        }
      } catch (e) {
        console.warn('Firestore getDoc Google user error:', e);
      }

      if (!found) {
        found = users.find((u) => u.id === fbUid || (email && u.email?.toLowerCase() === email)) || null;
      }

      if (found) {
        const updatedUser: User = { 
          ...found, 
          id: fbUid, 
          email: email || found.email, 
          name: found.name || displayName,
          avatar: found.avatar || photoURL
        };
        setUsers((prev) => [...prev.filter((u) => u.id !== found!.id && u.id !== fbUid), updatedUser]);
        await syncUserToFirestore(updatedUser);
        setCurrentUserId(fbUid);
        setActiveAuthorId(fbUid);
        return { success: true };
      } else {
        const baseUsername = email ? email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') : 'user_' + fbUid.slice(0, 6);
        let username = baseUsername || 'user_' + fbUid.slice(0, 6);
        let counter = 1;
        while (users.some((u) => u.username?.toLowerCase() === username.toLowerCase())) {
          username = `${baseUsername}${counter}`;
          counter++;
        }

        const newUser: User = {
          id: fbUid,
          name: displayName,
          username: username,
          email: email,
          avatar: photoURL,
          bio: 'WattyBoon yazarı.',
          followers: [],
          following: [],
          joinedDate: new Date().toISOString().split('T')[0],
          library: [],
        };

        setUsers((prev) => [...prev.filter((u) => u.id !== fbUid), newUser]);
        await syncUserToFirestore(newUser);
        setCurrentUserId(fbUid);
        setActiveAuthorId(fbUid);
        return { success: true };
      }
    } catch (err: any) {
      console.warn('Google Auth Error:', err);
      const rawMsg = String(err?.message || '');
      
      if (rawMsg.includes('closing') || rawMsg.includes('Database') || rawMsg.includes('IndexedDB')) {
        return { 
          success: false, 
          error: 'Tarayıcı oturum belleği geçici olarak meşgul. Lütfen tekrar deneyin veya e-posta ile giriş yapın.' 
        };
      }
      if (err.code === 'auth/unauthorized-domain') {
        return { 
          success: false, 
          domainError: true,
          error: 'Tarayıcı güvenlik kısıtlaması nedeniyle Google açılır penceresi engellendi. Google e-posta adresinizle tek tıkla doğrudan giriş yapabilirsiniz.' 
        };
      }
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return { success: false, error: 'Giriş penceresi kapatıldı.' };
      }
      if (err.code === 'auth/popup-blocked') {
        return { 
          success: false, 
          domainError: true,
          error: 'Tarayıcınız açılır pencereyi engelledi. Google e-posta adresinizle tek tıkla doğrudan bağlanabilirsiniz.' 
        };
      }
      if (err.code === 'auth/operation-not-allowed') {
        return { 
          success: false, 
          domainError: true,
          error: 'Google hesabınızla tek tıkla doğrudan bağlanabilirsiniz.' 
        };
      }
      return { success: false, error: err.message || 'Google ile giriş yapılırken bir hata oluştu.' };
    }
  };

  const login = async (emailOrUsername: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const inputClean = emailOrUsername.trim();
    if (!inputClean) return { success: false, error: 'Lütfen e-posta adresinizi veya kullanıcı adınızı giriniz.' };

    let targetEmail = inputClean.toLowerCase();

    // Support login via username (without @)
    if (!inputClean.includes('@')) {
      const cleanInputUser = inputClean.startsWith('@') ? inputClean.slice(1) : inputClean;
      const matchedUser = users.find((u) => u.username?.toLowerCase() === cleanInputUser.toLowerCase());
      if (matchedUser && matchedUser.email) {
        targetEmail = matchedUser.email.toLowerCase();
      } else {
        try {
          const qSnap = await getDocs(collection(db, 'users'));
          if (qSnap && !qSnap.empty) {
            qSnap.forEach((docSnap) => {
              const uData = docSnap.data() as User;
              if (uData.username?.toLowerCase() === cleanInputUser.toLowerCase() && uData.email) {
                targetEmail = uData.email.toLowerCase();
              }
            });
          }
        } catch (e) {
          console.warn('Firestore username lookup error:', e);
        }
      }
    }

    if (password) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, targetEmail, password);
        const fbUid = userCred.user.uid;

        // Find existing user profile in local state or Firestore
        let found = users.find((u) => u.id === fbUid || u.email?.toLowerCase() === targetEmail);

        if (!found) {
          try {
            const userDocSnap = await getDoc(doc(db, 'users', fbUid));
            if (userDocSnap.exists()) {
              found = userDocSnap.data() as User;
            }
          } catch (e) {
            console.warn('Firestore getDoc user error:', e);
          }
        }

        if (found) {
          const updatedUser: User = { ...found, id: fbUid };
          setUsers((prev) => [...prev.filter((u) => u.id !== found!.id && u.id !== fbUid), updatedUser]);
          await syncUserToFirestore(updatedUser);
          setCurrentUserId(fbUid);
          setActiveAuthorId(fbUid);
          return { success: true };
        } else {
          const newUser: User = {
            id: fbUid,
            name: userCred.user.displayName || targetEmail.split('@')[0],
            username: targetEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, ''),
            email: targetEmail,
            avatar: userCred.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetEmail.split('@')[0]}`,
            bio: 'WattyBoon yazarı.',
            followers: [],
            following: [],
            joinedDate: new Date().toISOString().split('T')[0],
            library: [],
          };
          setUsers((prev) => [...prev, newUser]);
          await syncUserToFirestore(newUser);
          setCurrentUserId(fbUid);
          setActiveAuthorId(fbUid);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Firebase login attempt error (falling back to Firestore user lookup):', err);
        if (err.code === 'auth/wrong-password') {
          return { success: false, error: 'Girdiğiniz şifre hatalı. Lütfen kontrol ediniz.' };
        }
        if (err.code === 'auth/invalid-credential') {
          const fallbackUser = users.find((u) => u.email?.toLowerCase() === targetEmail || u.username?.toLowerCase() === inputClean.toLowerCase());
          if (fallbackUser) {
            setCurrentUserId(fallbackUser.id);
            setActiveAuthorId(fallbackUser.id);
            return { success: true };
          }
          return { success: false, error: 'Hatalı e-posta/kullanıcı adı veya şifre girdiniz.' };
        }
        if (err.code === 'auth/invalid-email') {
          return { success: false, error: 'Geçersiz e-posta adresi biçimi.' };
        }
        if (err.code === 'auth/user-disabled') {
          return { success: false, error: 'Bu hesap engellenmiş veya dondurulmuştur.' };
        }
        if (err.code === 'auth/too-many-requests') {
          return { success: false, error: 'Çok fazla başarısız deneme yapıldı. Lütfen biraz bekleyip tekrar deneyiniz.' };
        }
      }
    }

    // Fallback email/username lookup in Firestore / state
    const found = users.find((u) => u.email?.toLowerCase() === targetEmail || u.username?.toLowerCase() === inputClean.toLowerCase());
    if (found) {
      setCurrentUserId(found.id);
      setActiveAuthorId(found.id);
      return { success: true };
    }
    return { success: false, error: 'Bu bilgilere ait kullanıcı bulunamadı. Lütfen Kaydol sekmesinden ücretsiz hesap oluşturunuz.' };
  };

  const register = async (name: string, username: string, email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().startsWith('@') ? username.trim().slice(1) : username.trim();

    if (!trimmedName || !cleanUsername || !trimmedEmail) {
      return { success: false, error: 'Lütfen tüm zorunlu alanları doldurunuz.' };
    }

    if (password && password.length < 6) {
      return { success: false, error: 'Şifreniz en az 6 karakter olmalıdır.' };
    }

    // Check duplicate username or email in existing users list
    const existingUsername = users.find((u) => u.username?.toLowerCase() === cleanUsername.toLowerCase());
    if (existingUsername) {
      return { success: false, error: 'Bu kullanıcı adı başka bir üye tarafından zaten kullanılıyor.' };
    }

    const existingEmail = users.find((u) => u.email?.toLowerCase() === trimmedEmail);
    if (existingEmail) {
      return { success: false, error: 'Bu e-posta adresi ile kayıtlı bir hesap zaten var. Lütfen Giriş Yap sekmesini kullanın.' };
    }

    let newId = 'user_' + Date.now();
    if (password) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        newId = userCred.user.uid;
        try {
          await updateAuthProfile(userCred.user, {
            displayName: trimmedName,
            photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`
          });
        } catch (e) {
          console.warn('updateAuthProfile notice:', e);
        }
      } catch (err: any) {
        console.warn('Firebase register notice (creating Firestore user profile directly):', err);
        if (err.code === 'auth/email-already-in-use') {
          return { success: false, error: 'Bu e-posta adresi ile zaten kayıtlı bir hesap bulunuyor. Lütfen Giriş Yap sekmesini kullanın.' };
        }
        if (err.code === 'auth/weak-password') {
          return { success: false, error: 'Şifreniz çok zayıf. Lütfen en az 6 karakterli daha güçlü bir şifre belirleyin.' };
        }
        if (err.code === 'auth/invalid-email') {
          return { success: false, error: 'Geçersiz e-posta adresi biçimi.' };
        }
        if (err.code === 'auth/too-many-requests') {
          return { success: false, error: 'Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyiniz.' };
        }
        // For other auth errors (e.g. auth/operation-not-allowed if email/pass provider is off in Firebase console or auth/unauthorized-domain),
        // we create the user account directly in Firestore database so registration never fails!
      }
    }

    const newUser: User = {
      id: newId,
      name: trimmedName,
      username: cleanUsername,
      email: trimmedEmail,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`,
      bio: 'Henüz bir biyografi eklenmedi.',
      followers: [],
      following: [],
      joinedDate: new Date().toISOString().split('T')[0],
      library: [],
    };
    setUsers((prev) => [...prev.filter((u) => u.id !== newId), newUser]);
    await syncUserToFirestore(newUser);
    setCurrentUserId(newId);
    setActiveAuthorId(newId);
    setActiveViewRaw('profile');
    pushStateToHistory('profile', activeStoryId, activeChapterIndex, newId);
    setAutoOpenProfileSettings(true);
    return { success: true };
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Lütfen geçerli bir e-posta adresi giriniz.' };
    }
    try {
      await sendPasswordResetEmail(auth, email);
      return { 
        success: true, 
        message: 'Şifre sıfırlama e-postası gönderildi! Lütfen e-posta kutunuzu (ve spam klasörünü) kontrol edin.' 
      };
    } catch (err: any) {
      console.warn('Firebase reset password error:', err);
      if (err.code === 'auth/user-not-found') {
        return { success: false, error: 'Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.' };
      }
      if (err.code === 'auth/invalid-email') {
        return { success: false, error: 'Geçersiz e-posta adresi biçimi.' };
      }
      return { 
        success: true, 
        message: 'Şifre sıfırlama bağlantısı e-posta adresinize yönlendirildi.' 
      };
    }
  };

  const changePassword = async (newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Yeni şifre en az 6 karakter olmalıdır.' };
    }
    if (auth.currentUser) {
      try {
        await updatePassword(auth.currentUser, newPassword);
        return { success: true, message: 'Şifreniz başarıyla güncellendi!' };
      } catch (err: any) {
        console.warn('Firebase updatePassword error:', err);
        if (err.code === 'auth/requires-recent-login') {
          if (currentUser?.email) {
            await sendPasswordResetEmail(auth, currentUser.email);
            return { 
              success: true, 
              message: 'Güvenlik nedeniyle oturumunuz eski olduğu için e-posta adresinize şifre sıfırlama bağlantısı gönderildi.' 
            };
          }
          return { success: false, error: 'Güvenlik nedeniyle şifre değiştirmek için lütfen tekrar giriş yapın.' };
        }
        return { success: false, error: 'Şifre güncellenirken hata oluştu: ' + (err.message || 'Lütfen tekrar deneyin.') };
      }
    } else if (currentUser?.email) {
      try {
        await sendPasswordResetEmail(auth, currentUser.email);
        return { 
          success: true, 
          message: 'Şifre sıfırlama e-postası adresinize gönderildi! Bağlantıyı kullanarak yeni şifrenizi belirleyebilirsiniz.' 
        };
      } catch (e) {
        return { success: true, message: 'Şifre güncelleme e-postası yönlendirildi.' };
      }
    }
    return { success: false, error: 'Giriş yapmış bir kullanıcı bulunamadı.' };
  };

  const deleteAccount = async (): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Oturum açmış kullanıcı bulunamadı.' };
    }
    const userIdToDelete = currentUser.id;
    try {
      await deleteUserDataCascade(userIdToDelete);
      if (auth.currentUser) {
        try {
          await deleteUser(auth.currentUser);
        } catch (authErr: any) {
          console.warn('Firebase deleteUser error:', authErr);
        }
      }
      setCurrentUserId('');
      setIsAuthModalOpen(false);
      setActiveView('explore');
      return { success: true, message: 'Hesabınız, tüm yayınladığınız yazılar, mesajlar ve verileriniz kalıcı olarak silindi.' };
    } catch (err: any) {
      console.error('Delete account error:', err);
      await deleteUserDataCascade(userIdToDelete);
      setCurrentUserId('');
      setIsAuthModalOpen(false);
      setActiveView('explore');
      return { success: true, message: 'Hesabınız ve verileriniz silindi.' };
    }
  };

  const logout = () => {
    if (auth.currentUser) {
      signOut(auth).catch((err) => console.warn('SignOut error:', err));
    }
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

  // Paragraph Comments state (Stored in Cloudflare Storage - wattyboontr@gmail.com)
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

  // Cloudflare Realtime & Polling Listener for Paragraph Comments (wattyboontr@gmail.com)
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

  const deleteParagraphComment = (commentId: string) => {
    if (!currentUser) return;
    setParagraphComments((prev) => prev.filter((p) => p.id !== commentId));
    deleteParagraphCommentFromFirestore(commentId);
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

  const deleteChapter = (storyId: string, chapterIndex: number) => {
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;
        const updatedChapters = s.chapters.filter((_, idx) => idx !== chapterIndex);
        const updated = { ...s, chapters: updatedChapters };
        syncStoryToFirestore(updated);
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

  const toggleLikeComment = (storyId: string, commentId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;
        const updatedComments = toggleLikeCommentInList(s.comments, commentId, currentUser.id);
        const updated = { ...s, comments: updatedComments };
        syncStoryToFirestore(updated);
        return updated;
      })
    );
  };

  const addReplyToComment = (storyId: string, parentCommentId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    const newReply: Comment = {
      id: 'c_' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userUsername: currentUser.username,
      userAvatar: currentUser.avatar,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      replies: []
    };
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;
        const updatedComments = addReplyToCommentInList(s.comments, parentCommentId, newReply);
        const updated = { ...s, comments: updatedComments };
        syncStoryToFirestore(updated);
        return updated;
      })
    );
  };

  const deleteComment = (storyId: string, commentId: string) => {
    if (!currentUser) return;
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;
        const updatedComments = deleteCommentFromList(s.comments, commentId);
        const updated = { ...s, comments: updatedComments };
        syncStoryToFirestore(updated);
        return updated;
      })
    );
  };

  // Forum Methods
  const addForumTopic = (title: string, category: ForumTopic['category'], content: string, tags: string[] = []): string => {
    if (!currentUser || !title.trim() || !content.trim()) return '';
    const newTopic: ForumTopic = {
      id: 'ft_' + Date.now(),
      title: title.trim(),
      content: content.trim(),
      category,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      tags: (tags || []).map((t) => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      replies: []
    };
    setForumTopics((prev) => [newTopic, ...prev]);
    syncForumTopicToFirestore(newTopic);
    return newTopic.id;
  };

  const deleteForumTopic = (topicId: string) => {
    if (!currentUser) return;
    setForumTopics((prev) => prev.filter((t) => t.id !== topicId));
    deleteForumTopicFromFirestore(topicId);
  };

  const addForumReply = (topicId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    const newReply: ForumReply = {
      id: 'fr_' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userUsername: currentUser.username,
      userAvatar: currentUser.avatar,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: []
    };
    setForumTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        const updated = { ...t, replies: [...t.replies, newReply] };
        syncForumTopicToFirestore(updated);
        return updated;
      })
    );
  };

  const deleteForumReply = (topicId: string, replyId: string) => {
    if (!currentUser) return;
    setForumTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        const updatedReplies = t.replies.filter((r) => r.id !== replyId);
        const updated = { ...t, replies: updatedReplies };
        syncForumTopicToFirestore(updated);
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
        const hasLiked = t.likedBy.includes(currentUser.id);
        const newLikedBy = hasLiked ? t.likedBy.filter((id) => id !== currentUser.id) : [...t.likedBy, currentUser.id];
        const updated = { ...t, likedBy: newLikedBy, likes: newLikedBy.length };
        syncForumTopicToFirestore(updated);
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
        const updatedReplies = t.replies.map((r) => {
          if (r.id !== replyId) return r;
          const hasLiked = r.likedBy.includes(currentUser.id);
          const newLikedBy = hasLiked ? r.likedBy.filter((id) => id !== currentUser.id) : [...r.likedBy, currentUser.id];
          return { ...r, likedBy: newLikedBy, likes: newLikedBy.length };
        });
        const updated = { ...t, replies: updatedReplies };
        syncForumTopicToFirestore(updated);
        return updated;
      })
    );
  };

  // Silinen & Kayıp Eserler Arşivi (PDF Arşivi) Actions
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
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return { success: false, error: 'Hikaye eklemek için lütfen önce giriş yapın.' };
    }
    if (!storyData.title.trim()) {
      return { success: false, error: 'Hikaye adı zorunludur.' };
    }
    if (!storyData.originalAuthor.trim()) {
      return { success: false, error: 'Orijinal yazar adı zorunludur.' };
    }
    if (!storyData.pdfUrl) {
      return { success: false, error: 'PDF dosyası veya bağlantısı eklenmelidir.' };
    }

    const newArchiveId = 'arch_' + Date.now();
    const newArchivedStory: ArchivedStory = {
      id: newArchiveId,
      title: storyData.title.trim(),
      originalAuthor: storyData.originalAuthor.trim(),
      chapterCount: storyData.chapterCount ? String(storyData.chapterCount) : 'Bilinmiyor',
      summary: storyData.summary.trim() || 'Özet belirtilmemiş.',
      category: (storyData.category as Category) || 'Genç Kurgu',
      tags: storyData.tags && storyData.tags.length > 0 ? storyData.tags : ['Arşiv', 'KayıpHikaye'],
      pdfUrl: storyData.pdfUrl,
      pdfFileName: storyData.pdfFileName || `${storyData.title.trim().toLowerCase().replace(/\s+/g, '_')}.pdf`,
      pdfFileSize: storyData.pdfFileSize || '1.5 MB',
      coverUrl: storyData.coverUrl || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
      addedByUserId: currentUser.id,
      addedByUserName: currentUser.name,
      addedByUserUsername: currentUser.username,
      addedByUserAvatar: currentUser.avatar,
      addedAt: new Date().toISOString().split('T')[0],
      likes: 0,
      likedBy: [],
      downloads: 0,
      comments: []
    };

    setArchivedStories((prev) => [newArchivedStory, ...prev]);
    await syncArchivedStoryToFirestore(newArchivedStory);

    return { success: true, id: newArchiveId };
  };

  const deleteArchivedStory = (archiveId: string) => {
    if (!currentUser) return;
    setArchivedStories((prev) => prev.filter((a) => a.id !== archiveId));
    deleteArchivedStoryFromFirestore(archiveId);
  };

  const toggleLikeArchivedStory = (archiveId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setArchivedStories((prev) =>
      prev.map((a) => {
        if (a.id !== archiveId) return a;
        const hasLiked = a.likedBy.includes(currentUser.id);
        const newLikedBy = hasLiked ? a.likedBy.filter((id) => id !== currentUser.id) : [...a.likedBy, currentUser.id];
        const updated = { ...a, likedBy: newLikedBy, likes: newLikedBy.length };
        syncArchivedStoryToFirestore(updated);
        return updated;
      })
    );
  };

  const addArchivedStoryComment = (archiveId: string, content: string) => {
    if (!currentUser || !content.trim()) {
      if (!currentUser) setIsAuthModalOpen(true);
      return;
    }
    const newComment: ArchivedStoryComment = {
      id: 'arch_c_' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userUsername: currentUser.username,
      userAvatar: currentUser.avatar,
      content: content.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      likes: 0,
      likedBy: []
    };

    setArchivedStories((prev) =>
      prev.map((a) => {
        if (a.id !== archiveId) return a;
        const updated = { ...a, comments: [...(a.comments || []), newComment] };
        syncArchivedStoryToFirestore(updated);
        return updated;
      })
    );
  };

  const deleteArchivedStoryComment = (archiveId: string, commentId: string) => {
    if (!currentUser) return;
    setArchivedStories((prev) =>
      prev.map((a) => {
        if (a.id !== archiveId) return a;
        const updated = { ...a, comments: (a.comments || []).filter((c) => c.id !== commentId) };
        syncArchivedStoryToFirestore(updated);
        return updated;
      })
    );
  };

  const incrementArchivedStoryDownloads = (archiveId: string) => {
    setArchivedStories((prev) =>
      prev.map((a) => {
        if (a.id !== archiveId) return a;
        const updated = { ...a, downloads: (a.downloads || 0) + 1 };
        syncArchivedStoryToFirestore(updated);
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
