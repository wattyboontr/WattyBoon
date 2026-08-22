import { Story, User, ForumTopic, ParagraphComment, Comment, AppNotification, DirectMessage, StoryReport } from '../types';

export const CLOUDFLARE_STORAGE_ACCOUNT = 'wattyboontr@gmail.com';
const TOKEN_STORAGE_KEY = 'wattyboon_auth_token';

// Auth Token Helpers
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {}
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {}
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ==========================================
// SECURE CLOUDFLARE AUTHENTICATION API
// ==========================================

export async function authLogin(emailOrUsername: string, password?: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername, password }),
    });
    const data = await res.json();
    if (res.ok && data.success && data.user) {
      if (data.token) setAuthToken(data.token);
      return { success: true, user: data.user, token: data.token };
    }
    return { success: false, error: data.error || 'Giriş yapılamadı.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Sunucuya bağlanılamadı.' };
  }
}

export async function authRegister(name: string, username: string, email: string, password?: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, email, password }),
    });
    const data = await res.json();
    if (res.ok && data.success && data.user) {
      if (data.token) setAuthToken(data.token);
      return { success: true, user: data.user, token: data.token };
    }
    return { success: false, error: data.error || 'Kayıt oluşturulamadı.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Sunucuya bağlanılamadı.' };
  }
}

export async function authGoogleLogin(email: string, name?: string, avatar?: string, googleUid?: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  try {
    const res = await fetch('/api/auth/google-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, avatar, googleUid }),
    });
    const data = await res.json();
    if (res.ok && data.success && data.user) {
      if (data.token) setAuthToken(data.token);
      return { success: true, user: data.user, token: data.token };
    }
    return { success: false, error: data.error || 'Google ile giriş yapılamadı.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Sunucuya bağlanılamadı.' };
  }
}

export async function authGetMe(): Promise<{ success: boolean; user?: User }> {
  try {
    const token = getAuthToken();
    if (!token) return { success: false };

    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        return { success: true, user: data.user };
      }
    }
  } catch (err) {
    console.warn('[Cloudflare Auth] session verification notice:', err);
  }
  return { success: false };
}

export async function authLogout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST', headers: getAuthHeaders() });
  } catch {}
  clearAuthToken();
}

export async function authSendVerificationCode(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return { success: res.ok && data.success, error: data.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function authVerifyCode(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    return { success: res.ok && data.success, error: data.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function authResetPassword(email: string, newPassword?: string, code?: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword, code }),
    });
    const data = await res.json();
    return { success: res.ok && data.success, message: data.message, error: data.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// USERS STORAGE API
// ==========================================

export async function fetchUsersFromCloudflare(): Promise<User[]> {
  try {
    const res = await fetch('/api/cloudflare/users');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) return json.data;
    }
  } catch (err) {
    console.warn('[Cloudflare Storage] fetchUsers error:', err);
  }
  return [];
}

export async function saveUserToCloudflare(user: User): Promise<boolean> {
  try {
    const res = await fetch('/api/cloudflare/users', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Cloudflare Storage] saveUser error:', err);
    return false;
  }
}

export async function deleteUserFromCloudflare(userId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/cloudflare/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Cloudflare Storage] deleteUser error:', err);
    return false;
  }
}

// ==========================================
// STORIES (Hikayeler) API - Sınırsız Yayınlama
// ==========================================

export async function fetchStoriesFromCloudflare(): Promise<Story[]> {
  try {
    const res = await fetch('/api/cloudflare/stories');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('[Cloudflare Storage] fetchStories error:', err);
  }
  return [];
}

export async function saveStoryToCloudflare(story: Story): Promise<boolean> {
  try {
    const res = await fetch('/api/cloudflare/stories', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(story),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Cloudflare Storage] saveStory error:', err);
    return false;
  }
}

export async function bulkSaveStoriesToCloudflare(stories: Story[]): Promise<boolean> {
  try {
    const res = await fetch('/api/cloudflare/stories/bulk', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(stories),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Cloudflare Storage] bulkSaveStories error:', err);
    return false;
  }
}

export async function deleteStoryFromCloudflare(storyId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/cloudflare/stories/${encodeURIComponent(storyId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Cloudflare Storage] deleteStory error:', err);
    return false;
  }
}

export async function clearAllStoriesFromCloudflare(): Promise<boolean> {
  try {
    const res = await fetch('/api/cloudflare/stories/clear-all', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Cloudflare Storage] clearAllStories error:', err);
    return false;
  }
}

// ==========================================
// MEDIA & IMAGE BACKUP API (Görseller)
// ==========================================

export async function uploadMediaToCloudflare(imageBase64: string, originalName?: string, userId?: string, type?: string): Promise<{ success: boolean; url?: string; mediaId?: string }> {
  try {
    const res = await fetch('/api/cloudflare/upload', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ imageBase64, originalName, userId, type }),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, url: data.url || imageBase64, mediaId: data.mediaId };
    }
  } catch (err) {
    console.warn('[Cloudflare Media] upload error:', err);
  }
  return { success: true, url: imageBase64 };
}

// ==========================================
// FORUM TOPICS (Tartışmalar & Forum) API
// ==========================================

export async function fetchForumTopicsFromCloudflare(): Promise<ForumTopic[]> {
  try {
    const res = await fetch('/api/cloudflare/topics');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('[Cloudflare Storage] fetchForumTopics error:', err);
  }
  return [];
}

export async function saveForumTopicToCloudflare(topic: ForumTopic): Promise<boolean> {
  try {
    const res = await fetch('/api/cloudflare/topics', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(topic),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Cloudflare Storage] saveForumTopic error:', err);
    return false;
  }
}

export async function bulkSaveForumTopicsToCloudflare(topics: ForumTopic[]): Promise<boolean> {
  try {
    const res = await fetch('/api/cloudflare/topics/bulk', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(topics),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Cloudflare Storage] bulkSaveForumTopics error:', err);
    return false;
  }
}

export async function deleteForumTopicFromCloudflare(topicId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/cloudflare/topics/${encodeURIComponent(topicId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Cloudflare Storage] deleteForumTopic error:', err);
    return false;
  }
}

// ==========================================
// PARAGRAPH COMMENTS API
// ==========================================

export async function fetchParagraphCommentsFromCloudflare(): Promise<ParagraphComment[]> {
  try {
    const res = await fetch('/api/cloudflare/paragraph-comments');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('[Cloudflare Storage] fetchParagraphComments error:', err);
  }
  return [];
}

export async function saveParagraphCommentToCloudflare(comment: ParagraphComment): Promise<boolean> {
  try {
    const res = await fetch('/api/cloudflare/paragraph-comments', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(comment),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Cloudflare Storage] saveParagraphComment error:', err);
    return false;
  }
}

export async function deleteParagraphCommentFromCloudflare(commentId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/cloudflare/paragraph-comments/${encodeURIComponent(commentId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Cloudflare Storage] deleteParagraphComment error:', err);
    return false;
  }
}

// ==========================================
// CHAPTER / STORY COMMENTS API
// ==========================================

export async function fetchCommentsFromCloudflare(): Promise<Comment[]> {
  try {
    const res = await fetch('/api/cloudflare/comments');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) return json.data;
    }
  } catch (err) {
    console.warn('[Cloudflare Storage] fetchComments error:', err);
  }
  return [];
}

export async function saveCommentToCloudflare(comment: Comment): Promise<boolean> {
  try {
    const res = await fetch('/api/cloudflare/comments', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(comment),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Cloudflare Storage] saveComment error:', err);
    return false;
  }
}

// ==========================================
// NOTIFICATIONS API
// ==========================================

export async function fetchNotificationsFromCloudflare(): Promise<AppNotification[]> {
  try {
    const res = await fetch('/api/cloudflare/notifications');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) return json.data;
    }
  } catch (err) {
    console.warn('[Cloudflare Storage] fetchNotifications error:', err);
  }
  return [];
}

export async function saveNotificationToCloudflare(notif: AppNotification): Promise<boolean> {
  try {
    const res = await fetch('/api/cloudflare/notifications', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(notif),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Cloudflare Storage] saveNotification error:', err);
    return false;
  }
}

// ==========================================
// MESSAGES API
// ==========================================

export async function fetchMessagesFromCloudflare(): Promise<DirectMessage[]> {
  try {
    const res = await fetch('/api/cloudflare/messages');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) return json.data;
    }
  } catch (err) {
    console.warn('[Cloudflare Storage] fetchMessages error:', err);
  }
  return [];
}

export async function saveMessageToCloudflare(msg: DirectMessage): Promise<boolean> {
  try {
    const res = await fetch('/api/cloudflare/messages', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(msg),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Cloudflare Storage] saveMessage error:', err);
    return false;
  }
}

// ==========================================
// STORY REPORTS (Şikayetler & Moderasyon) API
// ==========================================

export async function fetchReportsFromCloudflare(): Promise<StoryReport[]> {
  try {
    const res = await fetch('/api/cloudflare/reports');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) return json.data;
    }
  } catch (err) {
    console.warn('[Cloudflare Storage] fetchReports error:', err);
  }
  return [];
}

export async function saveReportToCloudflare(report: StoryReport): Promise<boolean> {
  try {
    const res = await fetch('/api/cloudflare/reports', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(report),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Cloudflare Storage] saveReport error:', err);
    return false;
  }
}

export async function deleteReportFromCloudflare(reportId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/cloudflare/reports/${reportId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Cloudflare Storage] deleteReport error:', err);
    return false;
  }
}

// ==========================================
// EMAIL NOTIFICATIONS DISPATCHERS
// ==========================================

export async function sendCommentEmailNotification(data: {
  recipientEmail?: string;
  recipientName?: string;
  storyId?: string;
  storyTitle?: string;
  chapterIndex?: number;
  chapterTitle?: string;
  paragraphIndex?: number;
  selectedText?: string;
  parentId?: string | null;
  replyToUserName?: string | null;
  content: string;
  userName: string;
  userUsername: string;
  createdAt?: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/notify-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Email Dispatcher] sendCommentEmailNotification error:', err);
    return false;
  }
}

export async function sendMessageEmailNotification(data: {
  recipientEmail?: string;
  recipientName?: string;
  senderName: string;
  senderUsername: string;
  messageContent: string;
  createdAt?: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/notify-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Email Dispatcher] sendMessageEmailNotification error:', err);
    return false;
  }
}

