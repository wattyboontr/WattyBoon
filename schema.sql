-- ContactSubmissions Table
CREATE TABLE IF NOT EXISTS ContactSubmissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    message TEXT,
    createdAt TEXT
);

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    name TEXT,
    role TEXT DEFAULT 'user',
    bio TEXT,
    joinedDate TEXT,
    avatar TEXT,
    coverUrl TEXT,
    followers TEXT, -- JSON array of user IDs
    following TEXT  -- JSON array of user IDs
);

-- Stories Table
CREATE TABLE IF NOT EXISTS Stories (
    id TEXT PRIMARY KEY,
    authorId TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    visibility TEXT DEFAULT 'public',
    reads INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    createdAt TEXT,
    FOREIGN KEY(authorId) REFERENCES Users(id)
);

-- Reports Table
CREATE TABLE IF NOT EXISTS Reports (
    id TEXT PRIMARY KEY,
    storyId TEXT NOT NULL,
    reporterId TEXT NOT NULL,
    reason TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending',
    createdAt TEXT,
    FOREIGN KEY(storyId) REFERENCES Stories(id),
    FOREIGN KEY(reporterId) REFERENCES Users(id)
);

-- Messages Table
CREATE TABLE IF NOT EXISTS Messages (
    id TEXT PRIMARY KEY,
    senderId TEXT NOT NULL,
    receiverId TEXT NOT NULL,
    content TEXT,
    createdAt TEXT,
    FOREIGN KEY(senderId) REFERENCES Users(id),
    FOREIGN KEY(receiverId) REFERENCES Users(id)
);

-- CustomLists Table
CREATE TABLE IF NOT EXISTS CustomLists (
    id TEXT PRIMARY KEY,
    ownerId TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    storyIds TEXT, -- JSON array of story IDs
    isPrivate INTEGER DEFAULT 0,
    FOREIGN KEY(ownerId) REFERENCES Users(id)
);
