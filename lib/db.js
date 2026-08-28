import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'ajaia.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS document_shares (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    permission TEXT CHECK(permission IN ('read', 'edit')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_id, user_id),
    FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS document_versions (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
  );
`);

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  const insertUser = db.prepare('INSERT INTO users (id, name, email, avatar) VALUES (?, ?, ?, ?)');
  insertUser.run('u1', 'Alice Chen', 'alice@ajaia.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice');
  insertUser.run('u2', 'Bob Smith', 'bob@ajaia.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob');
  insertUser.run('u3', 'Charlie Kim', 'charlie@ajaia.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie');

  const insertDoc = db.prepare(`
    INSERT INTO documents (id, title, content, owner_id, created_at, updated_at) 
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);
  insertDoc.run(
    'doc1',
    'Welcome to Ajaia Docs',
    '<h1>Welcome to Ajaia Docs</h1><p>This is a <strong>collaborative document editor</strong> built with Next.js, SQLite, and Tiptap.</p><ul><li>Edit rich text in real time</li><li>Import <code>.txt</code> or <code>.md</code> files</li><li>Share with team members</li></ul>',
    'u1'
  );

  const insertShare = db.prepare('INSERT INTO document_shares (id, document_id, user_id, permission) VALUES (?, ?, ?, ?)');
  insertShare.run('s1', 'doc1', 'u2', 'edit');
  insertShare.run('s2', 'doc1', 'u3', 'read');
}

export default db;
