-- WATTYBOON SUPABASE COMMENTS TABLE SCHEMA
-- Run this SQL code in your Supabase Project's SQL Editor (https://app.supabase.com -> SQL Editor)

-- 1. Create the Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id TEXT NOT NULL,
    chapter_index INTEGER NOT NULL,
    paragraph_index INTEGER DEFAULT NULL, -- NULL for general chapter comments, integer for inline paragraph comments
    selected_text TEXT DEFAULT NULL,       -- Selected quote snippet if made by selecting text
    content TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_username TEXT NOT NULL,
    user_avatar TEXT DEFAULT NULL,
    likes_count INTEGER DEFAULT 0,
    liked_by TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_comments_story_chapter ON public.comments (story_id, chapter_index);
CREATE INDEX IF NOT EXISTS idx_comments_paragraph ON public.comments (story_id, chapter_index, paragraph_index);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Allow anyone to read comments
CREATE POLICY "Allow public read access" 
ON public.comments FOR SELECT 
USING (true);

-- Allow anyone (or authenticated users) to post comments
CREATE POLICY "Allow public insert access" 
ON public.comments FOR INSERT 
WITH CHECK (true);

-- Allow comment author or story owner to update/delete comments
CREATE POLICY "Allow public update access" 
ON public.comments FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access" 
ON public.comments FOR DELETE 
USING (true);

-- Enable Realtime for the comments table
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
