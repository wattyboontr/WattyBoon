export type Category = 
  | 'Genel'
  | 'Romantik'
  | 'Bilim Kurgu'
  | 'Fantastik'
  | 'Gizem'
  | 'Gerilim'
  | 'Korku'
  | 'Polisiye'
  | 'Paranormal'
  | 'Aksiyon'
  | 'Kişisel Blog'
  | 'Dram'
  | 'Şiir'
  | 'Teknoloji'
  | 'Hayran Kurgu'
  | 'Macera'
  | 'LGBTQ'
  | 'LGBTQ+'
  | 'Mitoloji'
  | 'Mizah'
  | 'Felsefe'
  | 'Psikoloji'
  | 'Tarihi'
  | 'Gizem / Gerilim'
  | 'Genç Kurgu';

export type Visibility = 'public' | 'private';

export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  readCount: number;
  createdAt: string;
  likes?: number;
  likedBy?: string[];
  musicUrl?: string; // Spotify or YouTube track link
}

export type UserRole = 'admin' | 'moderator' | 'author' | 'user';

export interface Comment {
  id: string;
  chapterId?: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string;
  userRole?: UserRole;
  content: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  replies?: Comment[];
}

export interface Story {
  id: string;
  title: string;
  summary: string;
  coverUrl: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  category: Category;
  tags: string[];
  visibility: Visibility; // 'public' | 'private'
  status: 'ongoing' | 'completed';
  isCompleted?: boolean;
  likes: number;
  likedBy: string[];
  reads: number;
  chapters: Chapter[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  isNsfw?: boolean;
  isShortStory?: boolean; // Tag for Short Story / Kısa Hikaye
  musicUrl?: string; // Background / Inspiration music link for story
}

export interface ReadingProgress {
  storyId: string;
  lastChapterIndex: number;
  updatedAt: string;
}

export interface CustomList {
  id: string;
  name: string;
  description?: string;
  storyIds: string[];
  createdAt: string;
  isPrivate?: boolean;
}

export type ReportReason = 
  | 'copyright_theft' // Çalıntı / Telif Hakkı İhlali
  | 'inappropriate_content' // Uygunsuz / Müstehcen İçerik
  | 'hate_harassment' // Nefret Söylemi / Zorbalık
  | 'spam_misleading' // Spam veya Yanıltıcı İçerik
  | 'other'; // Diğer

export type ReportStatus = 'pending' | 'resolved' | 'dismissed' | 'investigating';

export interface StoryReport {
  id: string;
  storyId: string;
  storyTitle: string;
  storyCoverUrl?: string;
  authorId: string;
  authorName: string;
  authorUsername?: string;
  reporterId: string;
  reporterName: string;
  reporterUsername: string;
  reporterEmail?: string;
  reason: ReportReason;
  reasonTitle: string;
  description: string;
  originalSourceUrl?: string; // Stolen original story link / proof
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface ParagraphComment {
  id: string;
  storyId: string;
  chapterIndex: number;
  paragraphIndex: number;
  selectedText?: string;
  parentId?: string | null;
  replyToUserName?: string | null;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string;
  userRole?: UserRole;
  content: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  coverUrl?: string;
  bio: string;
  role?: UserRole;
  followers: string[]; // userIds following this user
  following: string[]; // userIds this user follows
  library: {
    storyId: string;
    status: 'reading' | 'want_to_read' | 'completed' | 'favorite';
    lastChapterIndex: number;
    updatedAt: string;
  }[];
  readingProgress?: ReadingProgress[];
  customLists?: CustomList[];
  joinedDate: string;
}

export type NotificationType = 'follow' | 'like' | 'comment' | 'new_chapter' | 'system';

export interface AppNotification {
  id: string;
  userId: string; // Recipient user ID
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  actorId?: string;
  type: NotificationType;
  title: string;
  message: string;
  targetStoryId?: string;
  storyId?: string;
  targetChapterIndex?: number;
  chapterIndex?: number;
  targetUserId?: string;
  isRead: boolean;
  createdAt: string;
}

export type ViewType = 
  | 'home'
  | 'explore'
  | 'categories'
  | 'library'
  | 'editor'
  | 'profile'
  | 'reader'
  | 'notifications'
  | 'story-detail'
  | 'forum'
  | 'sitemap'
  | 'admin';

export interface SearchFilters {
  query: string;
  category: Category | 'Tümü';
  sortBy: 'popular' | 'reads' | 'newest' | 'likes';
  status: 'all' | 'ongoing' | 'completed';
  tag?: string;
}

export interface ForumReply {
  id: string;
  topicId?: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string;
  userRole?: UserRole;
  content: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
}

export interface ForumTopic {
  id: string;
  title: string;
  content: string;
  category: 'Genel Sohbet' | 'Hikaye İncelemeleri' | 'Yazarlık Tüyoları' | 'Teoriler & Keşifler' | 'Duyuru & Öneriler' | 'Arşiv & Kayıp Hikayeler';
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorRole?: UserRole;
  tags: string[];
  createdAt: string;
  likes: number;
  likedBy: string[];
  replies: ForumReply[];
  isPinned?: boolean;
  views?: number;
}

export interface ArchivedStoryComment {
  id: string;
  archiveId?: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string;
  userRole?: UserRole;
  content: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
}

export interface ArchivedStory {
  id: string;
  title: string;
  originalAuthor: string;
  chapterCount: string | number;
  summary: string;
  category: Category | string;
  tags?: string[];
  pdfUrl: string; // Base64 data URL (data:application/pdf;base64,...) or remote PDF link
  pdfFileName?: string;
  pdfFileSize?: string;
  coverUrl?: string;
  addedByUserId: string;
  addedByUserName: string;
  addedByUserUsername: string;
  addedByUserAvatar: string;
  addedAt: string;
  likes: number;
  likedBy: string[];
  downloads: number;
  downloadsCount?: number;
  comments: ArchivedStoryComment[];
}
