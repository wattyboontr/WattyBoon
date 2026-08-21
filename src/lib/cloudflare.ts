import { Story, ForumTopic, ParagraphComment } from '../types';

export const CLOUDFLARE_STORAGE_ACCOUNT = 'wattyboontr@gmail.com';

// --- STORIES (Hikayeler) API ---
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
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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
    });
    return res.ok;
  } catch (err) {
    console.warn('[Cloudflare Storage] deleteStory error:', err);
    return false;
  }
}

// --- FORUM TOPICS (Tartışmalar & Forum) API ---
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
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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
    });
    return res.ok;
  } catch (err) {
    console.warn('[Cloudflare Storage] deleteForumTopic error:', err);
    return false;
  }
}

// --- PARAGRAPH COMMENTS API ---
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
      headers: {
        'Content-Type': 'application/json',
      },
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
    });
    return res.ok;
  } catch (err) {
    console.warn('[Cloudflare Storage] deleteParagraphComment error:', err);
    return false;
  }
}

// --- STATUS API ---
export async function getCloudflareStatus(): Promise<any> {
  try {
    const res = await fetch('/api/cloudflare/status');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Cloudflare Storage] getStatus error:', err);
  }
  return { status: 'fallback', email: CLOUDFLARE_STORAGE_ACCOUNT };
}
