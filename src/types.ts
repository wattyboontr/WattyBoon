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
}

export interface Comment {
  id: string;
  chapterId?: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string;
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
  likes: number;
  likedBy: string[];
  reads: number;
  chapters: Chapter[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  isNsfw?: boolean;
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
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string;
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
  type: NotificationType;
  title: string;
  message: string;
  targetStoryId?: string;
  targetChapterIndex?: number;
  targetUserId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SearchFilters {
  query: string;
  category: Category | 'Tümü';
  sortBy: 'popular' | 'reads' | 'newest' | 'likes';
  status: 'all' | 'ongoing' | 'completed';
  tag?: string;
}
