import { createClient } from '@supabase/supabase-js';

// Default / fallback Supabase URL & Anon Key for Wattyboon
// These can be overridden via process.env or import.meta.env VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY3MDA0ODAwMCwiZXhwIjoyMDE1NjI0MDAwfQ.placeholder_key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SupabaseCommentRow {
  id: string;
  story_id: string;
  chapter_index: number;
  paragraph_index: number | null;
  selected_text: string | null;
  content: string;
  user_id: string;
  user_name: string;
  user_username: string;
  user_avatar: string | null;
  user_role?: string | null;
  likes_count: number;
  liked_by: string[];
  created_at: string;
  updated_at?: string;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    (import.meta as any).env?.VITE_SUPABASE_URL && 
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY &&
    !(import.meta as any).env?.VITE_SUPABASE_URL?.includes('xyzcompany')
  );
}

/**
 * Fetch all comments for a specific chapter from Supabase.
 * Includes both general chapter comments (paragraph_index IS NULL) and paragraph/inline comments.
 */
export async function fetchCommentsFromSupabase(storyId: string, chapterIndex: number): Promise<SupabaseCommentRow[]> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('story_id', storyId)
      .eq('chapter_index', chapterIndex)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetchComments notice:', error.message);
      return [];
    }

    return data as SupabaseCommentRow[];
  } catch (err) {
    console.warn('Supabase fetchComments error:', err);
    return [];
  }
}

/**
 * Insert a new comment into Supabase.
 * Supports both general chapter comments (paragraphIndex = null) and text/paragraph selection comments.
 */
export async function insertCommentToSupabase(payload: {
  storyId: string;
  chapterIndex: number;
  paragraphIndex?: number | null;
  selectedText?: string | null;
  content: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar?: string;
  userRole?: string | null;
}): Promise<SupabaseCommentRow | null> {
  const newRow = {
    story_id: payload.storyId,
    chapter_index: payload.chapterIndex,
    paragraph_index: payload.paragraphIndex ?? null,
    selected_text: payload.selectedText ?? null,
    content: payload.content,
    user_id: payload.userId,
    user_name: payload.userName,
    user_username: payload.userUsername,
    user_avatar: payload.userAvatar || '',
    user_role: payload.userRole || 'user',
    likes_count: 0,
    liked_by: [],
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([newRow])
      .select()
      .single();

    if (error) {
      console.warn('Supabase insertComment notice:', error.message);
      return null;
    }

    return data as SupabaseCommentRow;
  } catch (err) {
    console.warn('Supabase insertComment error:', err);
    return null;
  }
}

/**
 * Toggle like for a comment in Supabase.
 */
export async function toggleLikeCommentInSupabase(
  commentId: string, 
  userId: string,
  currentLikedBy: string[] = []
): Promise<boolean> {
  const hasLiked = currentLikedBy.includes(userId);
  const updatedLikedBy = hasLiked 
    ? currentLikedBy.filter((id) => id !== userId) 
    : [...currentLikedBy, userId];

  try {
    const { error } = await supabase
      .from('comments')
      .update({
        liked_by: updatedLikedBy,
        likes_count: updatedLikedBy.length,
      })
      .eq('id', commentId);

    if (error) {
      console.warn('Supabase toggleLikeComment notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase toggleLikeComment error:', err);
    return false;
  }
}

/**
 * Delete a comment from Supabase by ID.
 */
export async function deleteCommentFromSupabase(commentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.warn('Supabase deleteComment notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase deleteComment error:', err);
    return false;
  }
}
