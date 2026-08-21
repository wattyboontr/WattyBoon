import fs from 'fs';
import path from 'path';

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
const TOPICS_FILE = path.join(DATA_DIR, 'cloudflare_topics.json');
const PARAGRAPH_COMMENTS_FILE = path.join(DATA_DIR, 'cloudflare_paragraph_comments.json');

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
        : 'Cloudflare Persistent Storage Layer (Ready for wattyboontr@gmail.com)',
      isLiveSynced: isCloudflareKvConfigured || isWorkerConfigured,
      storiesCount: this.getStories().length,
      topicsCount: this.getTopics().length,
      paragraphCommentsCount: this.getParagraphComments().length,
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

  // --- STORIES (Hikayeler) ---
  public getStories(): any[] {
    return readJsonFile<any[]>(STORIES_FILE, []);
  }

  public saveStory(story: any): any[] {
    const stories = this.getStories();
    const existingIndex = stories.findIndex((s) => s.id === story.id);
    let updated: any[];

    if (existingIndex >= 0) {
      updated = stories.map((s, idx) => (idx === existingIndex ? { ...s, ...story } : s));
    } else {
      updated = [story, ...stories];
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
}

export const cloudflareStorage = new CloudflareStorageService();
