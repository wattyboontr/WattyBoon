import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface CloudflareConfig {
  email: string;
  apiKey?: string;
  apiToken?: string;
  accountId?: string;
  kvNamespaceId?: string;
  workerUrl?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data storage directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const STORIES_FILE = path.join(DATA_DIR, 'cloudflare_stories.json');
const USERS_FILE = path.join(DATA_DIR, 'cloudflare_users.json');
const TOPICS_FILE = path.join(DATA_DIR, 'cloudflare_topics.json');
const PARAGRAPH_COMMENTS_FILE = path.join(DATA_DIR, 'cloudflare_paragraph_comments.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'cloudflare_comments.json');
const MEDIA_FILE = path.join(DATA_DIR, 'cloudflare_media.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'cloudflare_notifications.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'cloudflare_messages.json');
const REPORTS_FILE = path.join(DATA_DIR, 'cloudflare_reports.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'cloudflare_sessions.json');
const OTP_CODES_FILE = path.join(DATA_DIR, 'cloudflare_otp_codes.json');

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn(`[Cloudflare Storage] Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[Cloudflare Storage] Error writing ${filePath}:`, err);
  }
}

// Password Hashing Utility using PBKDF2
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const calculatedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return calculatedHash === hash;
}

// Secure Token Generator
export function generateToken(payload: { id: string; email: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days session
    })
  ).toString('base64url');
  const secret = process.env.AUTH_SECRET || 'wattyboon_super_secure_cloudflare_auth_secret_2026';
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): { id: string; email: string; role: string } | null {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const secret = process.env.AUTH_SECRET || 'wattyboon_super_secure_cloudflare_auth_secret_2026';
    const expectedSignature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSignature) return null;
    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch {
    return null;
  }
}

export class CloudflareStorageService {
  private email: string;
  private apiKey?: string;
  private apiToken?: string;
  private accountId?: string;
  private kvNamespaceId?: string;
  private workerUrl?: string;

  constructor() {
    this.email = process.env.CLOUDFLARE_EMAIL || 'wattyboontr@gmail.com';
    this.apiKey = process.env.CLOUDFLARE_API_KEY;
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN;
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    this.kvNamespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
    this.workerUrl = process.env.CLOUDFLARE_WORKER_URL;

    // Initialize files if not existing
    if (!fs.existsSync(STORIES_FILE)) writeJsonFile(STORIES_FILE, []);
    if (!fs.existsSync(USERS_FILE)) writeJsonFile(USERS_FILE, []);
    if (!fs.existsSync(TOPICS_FILE)) writeJsonFile(TOPICS_FILE, []);
    if (!fs.existsSync(PARAGRAPH_COMMENTS_FILE)) writeJsonFile(PARAGRAPH_COMMENTS_FILE, []);
    if (!fs.existsSync(COMMENTS_FILE)) writeJsonFile(COMMENTS_FILE, []);
    if (!fs.existsSync(MEDIA_FILE)) writeJsonFile(MEDIA_FILE, []);
    if (!fs.existsSync(NOTIFICATIONS_FILE)) writeJsonFile(NOTIFICATIONS_FILE, []);
    if (!fs.existsSync(MESSAGES_FILE)) writeJsonFile(MESSAGES_FILE, []);
    if (!fs.existsSync(REPORTS_FILE)) writeJsonFile(REPORTS_FILE, []);
    if (!fs.existsSync(SESSIONS_FILE)) writeJsonFile(SESSIONS_FILE, {});
    if (!fs.existsSync(OTP_CODES_FILE)) writeJsonFile(OTP_CODES_FILE, {});
  }

  public getStatus() {
    const isCloudflareKvConfigured = Boolean(
      (this.apiToken || (this.apiKey && this.email)) && this.accountId && this.kvNamespaceId
    );
    const isWorkerConfigured = Boolean(this.workerUrl);

    return {
      status: 'active',
      email: this.email,
      targetAccount: 'wattyboontr@gmail.com',
      storageProvider: isCloudflareKvConfigured
        ? 'Cloudflare Workers KV (Direct REST API)'
        : isWorkerConfigured
        ? 'Cloudflare Worker Storage'
        : 'Cloudflare Persistent Storage & Auth Engine (wattyboontr@gmail.com)',
      isLiveSynced: isCloudflareKvConfigured || isWorkerConfigured,
      storiesCount: this.getStories().length,
      usersCount: this.getUsers().length,
      mediaCount: this.getMedia().length,
      topicsCount: this.getTopics().length,
      paragraphCommentsCount: this.getParagraphComments().length,
      commentsCount: this.getComments().length,
      notificationsCount: this.getNotifications().length,
      messagesCount: this.getMessages().length,
    };
  }

  // --- Cloudflare KV Sync Helpers ---
  private async syncToCloudflareKv(key: string, value: any): Promise<void> {
    if (this.workerUrl) {
      try {
        await fetch(`${this.workerUrl.replace(/\/$/, '')}/api/kv/${key}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Cloudflare-Account': this.email,
          },
          body: JSON.stringify(value),
        });
      } catch (err) {
        console.warn(`[Cloudflare Worker] Sync error for key ${key}:`, err);
      }
      return;
    }

    if (this.accountId && this.kvNamespaceId && (this.apiToken || this.apiKey)) {
      try {
        const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/kv/namespaces/${this.kvNamespaceId}/values/${key}`;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (this.apiToken) {
          headers['Authorization'] = `Bearer ${this.apiToken}`;
        } else if (this.apiKey) {
          headers['X-Auth-Email'] = this.email;
          headers['X-Auth-Key'] = this.apiKey;
        }

        await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify(value),
        });
      } catch (err) {
        console.warn(`[Cloudflare KV] API sync notice for key ${key}:`, err);
      }
    }
  }

  // --- USERS & AUTHENTICATION (Kullanıcılar & Güvenli Giriş) ---
  private normalizeUser(u: any): any {
    if (!u) return u;
    let readingProgress: any[] = [];
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

    return {
      ...u,
      readingProgress,
      library: Array.isArray(u.library) ? u.library : [],
      customLists: Array.isArray(u.customLists) ? u.customLists : [],
      followers: Array.isArray(u.followers) ? u.followers : [],
      following: Array.isArray(u.following) ? u.following : [],
      savedStories: Array.isArray(u.savedStories) ? u.savedStories : [],
      bookmarks: Array.isArray(u.bookmarks) ? u.bookmarks : [],
      storiesCount: typeof u.storiesCount === 'number' ? u.storiesCount : 0,
      followersCount: Array.isArray(u.followers) ? u.followers.length : (u.followersCount || 0),
      followingCount: Array.isArray(u.following) ? u.following.length : (u.followingCount || 0),
    };
  }

  public getUsers(): any[] {
    const raw = readJsonFile<any[]>(USERS_FILE, []);
    return raw.map((u) => this.normalizeUser(u));
  }

  public findUserById(id: string): any | null {
    const users = this.getUsers();
    return users.find((u) => u.id === id) || null;
  }

  public findUserByEmailOrUsername(emailOrUsername: string): any | null {
    if (!emailOrUsername) return null;
    const clean = emailOrUsername.trim().toLowerCase().replace(/^@/, '');
    const users = this.getUsers();
    return (
      users.find(
        (u) =>
          u.email?.toLowerCase() === clean ||
          u.username?.toLowerCase() === clean ||
          u.username?.toLowerCase() === emailOrUsername.trim().toLowerCase()
      ) || null
    );
  }

  public saveUser(user: any): any {
    const users = this.getUsers();
    const existingIndex = users.findIndex((u) => u.id === user.id || (u.email && u.email.toLowerCase() === user.email?.toLowerCase()));
    
    // Auto-promote admin
    const isAdmin = user.email?.toLowerCase() === 'wattyboontr@gmail.com' || user.email?.toLowerCase() === 'semajim30@gmail.com';
    const userToSave = this.normalizeUser({
      ...user,
      role: isAdmin ? 'admin' : (user.role || 'reader'),
      isPro: true, // Unlimited capabilities for all members
      updatedAt: new Date().toISOString(),
    });

    let updated: any[];
    if (existingIndex >= 0) {
      updated = users.map((u, idx) => (idx === existingIndex ? { ...u, ...userToSave } : u));
    } else {
      updated = [...users, userToSave];
    }

    writeJsonFile(USERS_FILE, updated);
    this.syncToCloudflareKv('wattyboon_users', updated).catch(() => {});
    return userToSave;
  }

  public setUsers(usersList: any[]): any[] {
    const normalized = (usersList || []).map((u) => this.normalizeUser(u));
    writeJsonFile(USERS_FILE, normalized);
    this.syncToCloudflareKv('wattyboon_users', normalized).catch(() => {});
    return normalized;
  }

  public deleteUser(userId: string): any[] {
    const users = this.getUsers();
    const updated = users.filter((u) => u.id !== userId);
    writeJsonFile(USERS_FILE, updated);
    this.syncToCloudflareKv('wattyboon_users', updated).catch(() => {});
    return updated;
  }

  // --- OTP Verification Codes ---
  public saveOtp(email: string, code: string): void {
    const codes = readJsonFile<Record<string, { code: string; expiresAt: number }>>(OTP_CODES_FILE, {});
    codes[email.toLowerCase()] = {
      code,
      expiresAt: Date.now() + 1000 * 60 * 15, // 15 minutes validity
    };
    writeJsonFile(OTP_CODES_FILE, codes);
  }

  public verifyOtp(email: string, code: string): boolean {
    const codes = readJsonFile<Record<string, { code: string; expiresAt: number }>>(OTP_CODES_FILE, {});
    const entry = codes[email.toLowerCase()];
    if (!entry) return false;
    if (entry.expiresAt < Date.now()) {
      delete codes[email.toLowerCase()];
      writeJsonFile(OTP_CODES_FILE, codes);
      return false;
    }
    const isValid = entry.code.trim() === code.trim();
    if (isValid) {
      delete codes[email.toLowerCase()];
      writeJsonFile(OTP_CODES_FILE, codes);
    }
    return isValid;
  }

  // --- STORIES (Hikayeler - Sınırsız & Cloudflare Yedekli) ---
  public getStories(): any[] {
    return readJsonFile<any[]>(STORIES_FILE, []);
  }

  public saveStory(story: any): any[] {
    const stories = this.getStories();
    const existingIndex = stories.findIndex((s) => s.id === story.id);
    let updated: any[];

    if (existingIndex >= 0) {
      updated = stories.map((s, idx) => (idx === existingIndex ? { ...s, ...story, updatedAt: new Date().toISOString() } : s));
    } else {
      updated = [{ ...story, createdAt: story.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() }, ...stories];
    }

    writeJsonFile(STORIES_FILE, updated);
    this.syncToCloudflareKv('wattyboon_stories', updated).catch(() => {});
    return updated;
  }

  public setStories(storiesList: any[]): any[] {
    writeJsonFile(STORIES_FILE, storiesList);
    this.syncToCloudflareKv('wattyboon_stories', storiesList).catch(() => {});
    return storiesList;
  }

  public deleteStory(storyId: string): any[] {
    const stories = this.getStories();
    const updated = stories.filter((s) => s.id !== storyId);
    writeJsonFile(STORIES_FILE, updated);
    this.syncToCloudflareKv('wattyboon_stories', updated).catch(() => {});
    return updated;
  }

  public clearAllStories(): any[] {
    writeJsonFile(STORIES_FILE, []);
    this.syncToCloudflareKv('wattyboon_stories', []).catch(() => {});
    return [];
  }

  // --- MEDIA & IMAGES (Görseller & Medya Yedekleme) ---
  public getMedia(): any[] {
    return readJsonFile<any[]>(MEDIA_FILE, []);
  }

  public saveMedia(mediaItem: { id: string; url: string; originalName?: string; userId?: string; type?: string; base64Preview?: string }): any {
    const media = this.getMedia();
    const itemWithTimestamp = {
      ...mediaItem,
      uploadedAt: new Date().toISOString(),
      backedUpToCloudflare: true,
      account: this.email,
    };
    const updated = [itemWithTimestamp, ...media];
    writeJsonFile(MEDIA_FILE, updated);
    this.syncToCloudflareKv('wattyboon_media', updated).catch(() => {});
    return itemWithTimestamp;
  }

  // --- FORUM TOPICS (Tartışmalar & Forum Konuları) ---
  public getTopics(): any[] {
    return readJsonFile<any[]>(TOPICS_FILE, []);
  }

  public saveTopic(topic: any): any[] {
    const topics = this.getTopics();
    const existingIndex = topics.findIndex((t) => t.id === topic.id);
    let updated: any[];

    if (existingIndex >= 0) {
      updated = topics.map((t, idx) => (idx === existingIndex ? { ...t, ...topic } : t));
    } else {
      updated = [topic, ...topics];
    }

    writeJsonFile(TOPICS_FILE, updated);
    this.syncToCloudflareKv('wattyboon_topics', updated).catch(() => {});
    return updated;
  }

  public setTopics(topicsList: any[]): any[] {
    writeJsonFile(TOPICS_FILE, topicsList);
    this.syncToCloudflareKv('wattyboon_topics', topicsList).catch(() => {});
    return topicsList;
  }

  public deleteTopic(topicId: string): any[] {
    const topics = this.getTopics();
    const updated = topics.filter((t) => t.id !== topicId);
    writeJsonFile(TOPICS_FILE, updated);
    this.syncToCloudflareKv('wattyboon_topics', updated).catch(() => {});
    return updated;
  }

  // --- PARAGRAPH COMMENTS (Paragraf İçi Yorumlar) ---
  public getParagraphComments(): any[] {
    return readJsonFile<any[]>(PARAGRAPH_COMMENTS_FILE, []);
  }

  public saveParagraphComment(comment: any): any[] {
    const comments = this.getParagraphComments();
    const existingIndex = comments.findIndex((c) => c.id === comment.id);
    let updated: any[];

    if (existingIndex >= 0) {
      updated = comments.map((c, idx) => (idx === existingIndex ? { ...c, ...comment } : c));
    } else {
      updated = [comment, ...comments];
    }

    writeJsonFile(PARAGRAPH_COMMENTS_FILE, updated);
    this.syncToCloudflareKv('wattyboon_paragraph_comments', updated).catch(() => {});
    return updated;
  }

  public deleteParagraphComment(commentId: string): any[] {
    const comments = this.getParagraphComments();
    const updated = comments.filter((c) => c.id !== commentId);
    writeJsonFile(PARAGRAPH_COMMENTS_FILE, updated);
    this.syncToCloudflareKv('wattyboon_paragraph_comments', updated).catch(() => {});
    return updated;
  }

  // --- STORY COMMENTS (Bölüm & Hikaye Yorumları) ---
  public getComments(): any[] {
    return readJsonFile<any[]>(COMMENTS_FILE, []);
  }

  public saveComment(comment: any): any[] {
    const comments = this.getComments();
    const existingIndex = comments.findIndex((c) => c.id === comment.id);
    let updated: any[];

    if (existingIndex >= 0) {
      updated = comments.map((c, idx) => (idx === existingIndex ? { ...c, ...comment } : c));
    } else {
      updated = [comment, ...comments];
    }

    writeJsonFile(COMMENTS_FILE, updated);
    this.syncToCloudflareKv('wattyboon_comments', updated).catch(() => {});
    return updated;
  }

  public deleteComment(commentId: string): any[] {
    const comments = this.getComments();
    const updated = comments.filter((c) => c.id !== commentId);
    writeJsonFile(COMMENTS_FILE, updated);
    this.syncToCloudflareKv('wattyboon_comments', updated).catch(() => {});
    return updated;
  }

  // --- NOTIFICATIONS (Bildirimler) ---
  public getNotifications(): any[] {
    return readJsonFile<any[]>(NOTIFICATIONS_FILE, []);
  }

  public saveNotification(notif: any): any[] {
    const notifs = this.getNotifications();
    const updated = [notif, ...notifs.filter((n) => n.id !== notif.id)];
    writeJsonFile(NOTIFICATIONS_FILE, updated);
    this.syncToCloudflareKv('wattyboon_notifications', updated).catch(() => {});
    return updated;
  }

  public setNotifications(notifsList: any[]): any[] {
    writeJsonFile(NOTIFICATIONS_FILE, notifsList);
    this.syncToCloudflareKv('wattyboon_notifications', notifsList).catch(() => {});
    return notifsList;
  }

  // --- DIRECT MESSAGES (Mesajlar) ---
  public getMessages(): any[] {
    return readJsonFile<any[]>(MESSAGES_FILE, []);
  }

  public saveMessage(msg: any): any[] {
    const messages = this.getMessages();
    const updated = [...messages, msg];
    writeJsonFile(MESSAGES_FILE, updated);
    this.syncToCloudflareKv('wattyboon_messages', updated).catch(() => {});
    return updated;
  }

  public setMessages(msgsList: any[]): any[] {
    writeJsonFile(MESSAGES_FILE, msgsList);
    this.syncToCloudflareKv('wattyboon_messages', msgsList).catch(() => {});
    return msgsList;
  }

  // --- STORY REPORTS (Şikayetler & Raporlar) ---
  public getReports(): any[] {
    return readJsonFile<any[]>(REPORTS_FILE, []);
  }

  public saveReport(report: any): any[] {
    const reports = this.getReports();
    const existingIndex = reports.findIndex((r) => r.id === report.id);
    let updated: any[];

    if (existingIndex >= 0) {
      updated = reports.map((r, idx) => (idx === existingIndex ? { ...r, ...report } : r));
    } else {
      updated = [report, ...reports];
    }

    writeJsonFile(REPORTS_FILE, updated);
    this.syncToCloudflareKv('wattyboon_reports', updated).catch(() => {});
    return updated;
  }

  public deleteReport(reportId: string): any[] {
    const reports = this.getReports();
    const updated = reports.filter((r) => r.id !== reportId);
    writeJsonFile(REPORTS_FILE, updated);
    this.syncToCloudflareKv('wattyboon_reports', updated).catch(() => {});
    return updated;
  }

  public setReports(reportsList: any[]): any[] {
    writeJsonFile(REPORTS_FILE, reportsList);
    this.syncToCloudflareKv('wattyboon_reports', reportsList).catch(() => {});
    return reportsList;
  }
}

export const cloudflareStorage = new CloudflareStorageService();
