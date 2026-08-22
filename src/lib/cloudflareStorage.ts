// Comments Backup & Cloud Storage Engine (Cloudflare KV / D1 / LocalStorage Compatible Sync)

export interface StoryCommentRow {
  id: string;
  story_id: string;
  chapter_index: number;
  paragraph_index: number | null;
  selected_text: string | null;
  parent_id?: string | null;
  reply_to_user_name?: string | null;
  reply_to_comment_id?: string | null;
  content: string;
  user_id: string;
  user_name: string;
  user_username: string;
  user_avatar: string;
  user_role?: string;
  likes_count: number;
  liked_by: string[];
  created_at: string;
  updated_at?: string;
}

const STORAGE_PREFIX = 'wattyboon_cf_comments_';

// Cloudflare Worker / Backup API URL (can be customized via environment)
const CLOUDFLARE_BACKUP_ENDPOINT = 
  (import.meta as any).env?.VITE_BACKUP_ENDPOINT || 
  'https://wattyboon-comments-backup.workers.dev';

/**
 * Backs up a comment payload to the cloud storage endpoint asynchronously.
 */
async function backupToCloud(action: 'upsert' | 'delete', payload: any) {
  try {
    if (typeof window !== 'undefined' && 'fetch' in window) {
      await fetch(`${CLOUDFLARE_BACKUP_ENDPOINT}/api/comments/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }).catch(() => {
        // Silently catch network errors for cloud backup
      });
    }
  } catch {
    // Ignore silent background backup errors
  }
}

/**
 * Fetch comments for a story chapter from persistent storage (LocalStorage + Cloudflare cache).
 */
export async function fetchComments(
  storyId: string,
  chapterIndex: number
): Promise<StoryCommentRow[]> {
  const cacheKey = `${STORAGE_PREFIX}${storyId}_${chapterIndex}`;
  
  // 1. Try local storage cache first for instant UI response
  let localComments: StoryCommentRow[] = [];
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      localComments = JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Comments local cache read notice:', e);
  }

  // 2. Fetch from Cloudflare Worker backup if available
  try {
    if (typeof window !== 'undefined' && 'fetch' in window) {
      const res = await fetch(`${CLOUDFLARE_BACKUP_ENDPOINT}/api/comments?story_id=${encodeURIComponent(storyId)}&chapter_index=${chapterIndex}`).catch(() => null);
      if (res && res.ok) {
        const cloudData = await res.json().catch(() => null);
        if (Array.isArray(cloudData) && cloudData.length > 0) {
          const mergedMap = new Map<string, StoryCommentRow>();
          localComments.forEach((c) => mergedMap.set(c.id, c));
          cloudData.forEach((c) => mergedMap.set(c.id, c));
          const mergedList = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          try {
            localStorage.setItem(cacheKey, JSON.stringify(mergedList));
          } catch {}
          return mergedList;
        }
      }
    }
  } catch (err) {
    console.warn('Cloudflare comments fetch notice:', err);
  }

  return localComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * Sends an email notification to wattyboontr@gmail.com via backend API.
 */
async function sendCommentNotification(payload: {
  storyId: string;
  storyTitle?: string;
  chapterIndex: number;
  chapterTitle?: string;
  paragraphIndex?: number | null;
  selectedText?: string | null;
  parentId?: string | null;
  replyToUserName?: string | null;
  content: string;
  userName: string;
  userUsername: string;
  createdAt: string;
}) {
  try {
    if (typeof window !== 'undefined' && 'fetch' in window) {
      await fetch('/api/notify-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }).catch((e) => console.warn('Email notify fetch error:', e));
    }
  } catch (err) {
    console.warn('Comment email notification error:', err);
  }
}

/**
 * Insert a new comment and back it up to cloud storage.
 */
export async function insertComment(payload: {
  storyId: string;
  storyTitle?: string;
  chapterIndex: number;
  chapterTitle?: string;
  paragraphIndex?: number | null;
  selectedText?: string | null;
  parentId?: string | null;
  replyToUserName?: string | null;
  replyToCommentId?: string | null;
  content: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string;
  userRole?: string;
}): Promise<StoryCommentRow> {
  const commentId = `cm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const createdAt = new Date().toISOString();
  const newRow: StoryCommentRow = {
    id: commentId,
    story_id: payload.storyId,
    chapter_index: payload.chapterIndex,
    paragraph_index: payload.paragraphIndex ?? null,
    selected_text: payload.selectedText ?? null,
    parent_id: payload.parentId ?? null,
    reply_to_user_name: payload.replyToUserName ?? null,
    reply_to_comment_id: payload.replyToCommentId ?? null,
    content: payload.content,
    user_id: payload.userId,
    user_name: payload.userName,
    user_username: payload.userUsername,
    user_avatar: payload.userAvatar,
    user_role: payload.userRole || 'user',
    likes_count: 0,
    liked_by: [],
    created_at: createdAt,
    updated_at: createdAt,
  };

  const cacheKey = `${STORAGE_PREFIX}${payload.storyId}_${payload.chapterIndex}`;

  // 1. Update local cache immediately
  try {
    const cached = localStorage.getItem(cacheKey);
    const list: StoryCommentRow[] = cached ? JSON.parse(cached) : [];
    list.unshift(newRow);
    localStorage.setItem(cacheKey, JSON.stringify(list));
  } catch (e) {
    console.warn('Cache update notice:', e);
  }

  // 2. Backup to Cloudflare storage asynchronously
  backupToCloud('upsert', newRow);

  // 3. Send email notification to wattyboontr@gmail.com
  sendCommentNotification({
    storyId: payload.storyId,
    storyTitle: payload.storyTitle,
    chapterIndex: payload.chapterIndex,
    chapterTitle: payload.chapterTitle,
    paragraphIndex: payload.paragraphIndex,
    selectedText: payload.selectedText,
    parentId: payload.parentId,
    replyToUserName: payload.replyToUserName,
    content: payload.content,
    userName: payload.userName,
    userUsername: payload.userUsername,
    createdAt,
  });

  return newRow;
}

/**
 * Toggle like on a comment.
 */
export async function toggleLikeComment(
  commentId: string,
  userId: string,
  currentLikedBy: string[],
  storyId?: string,
  chapterIndex?: number
): Promise<boolean> {
  const hasLiked = currentLikedBy.includes(userId);
  const updatedLikedBy = hasLiked
    ? currentLikedBy.filter((id) => id !== userId)
    : [...currentLikedBy, userId];
  const newCount = updatedLikedBy.length;

  // 1. Update local cache
  if (storyId !== undefined && chapterIndex !== undefined) {
    const cacheKey = `${STORAGE_PREFIX}${storyId}_${chapterIndex}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const list: StoryCommentRow[] = JSON.parse(cached);
        const updated = list.map((c) =>
          c.id === commentId
            ? { ...c, liked_by: updatedLikedBy, likes_count: newCount, updated_at: new Date().toISOString() }
            : c
        );
        localStorage.setItem(cacheKey, JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('Cache update notice:', e);
    }
  }

  // 2. Backup update to cloud
  backupToCloud('upsert', { id: commentId, liked_by: updatedLikedBy, likes_count: newCount });

  return true;
}

/**
 * Delete a comment from storage and backup.
 */
export async function deleteComment(
  commentId: string,
  storyId?: string,
  chapterIndex?: number
): Promise<boolean> {
  // 1. Update local cache
  if (storyId !== undefined && chapterIndex !== undefined) {
    const cacheKey = `${STORAGE_PREFIX}${storyId}_${chapterIndex}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const list: StoryCommentRow[] = JSON.parse(cached);
        const updated = list.filter((c) => c.id !== commentId);
        localStorage.setItem(cacheKey, JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('Cache update notice:', e);
    }
  }

  // 2. Delete from cloud backup
  backupToCloud('delete', { id: commentId });

  return true;
}
