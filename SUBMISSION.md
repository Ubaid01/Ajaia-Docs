# Ajaia Docs - Submission Package

## 1. Submission Links
- **GitHub Repository**: https://github.com/Ubaid01/Ajaia-Docs
- **Walkthrough Video**: https://youtu.be/5LyfaGrXrGs

---

## 2. Deployment & Repository Note
- **Public GitHub Repository**: Provided public GitHub repo containing full source code, documentation, test suite, and embedded screenshots instead of Google Drive link for direct reviewer inspection.
- **Local Deployment Rationale**: Built with embedded SQLite (`better-sqlite3`) to ensure zero external API setup and instant reviewer setup. Serverless cloud deployment (Vercel) was intentionally bypassed because serverless functions wipe local SQLite file state between requests; running locally via `npm run dev` guarantees 100% deterministic, stateful persistence.

---

## 3. Seeded Accounts for Testing Sharing Flows
No password required. Select active user from top right navbar dropdown:
- **Alice Chen** (`u1` / `alice@ajaia.com`) - Owner of initial demo documents
- **Bob Smith** (`u2` / `bob@ajaia.com`) - Has **Can Edit** access to shared documents
- **Charlie Kim** (`u3` / `charlie@ajaia.com`) - Has **Can View** (Read-Only) access

---

## 4. Local Setup & Execution
```bash
# 1. Install dependencies
npm install

# 2. Run local dev server (http://localhost:3000)
npm run dev

# 3. Run automated test suite
npm run test

# 4. Production build validation
npm run build

# 5. Run production build
npm start
```

---

## 5. What Is Working vs What Was Deprioritized

### What Is Working (End-to-End Features)
- **Document Creation & Editing**: Inline title rename (dashboard cards & editor header), rich text (Bold, Italic, Underline, Strike, H1/H2, Bullet/Numbered Lists, Code Blocks, Hyperlinks, Images, Tables with +Row/+Col/-Row/-Col/Delete Table, Text Alignment), debounced auto-save, live word count.
- **File Upload & Export**: Import `.txt`, `.md` (via `marked`), `.docx` (via `mammoth`). Export `.txt`, `.md`, `.pdf`.
- **Version History & Snapshot Restoration**: SQLite `document_versions` snapshots + Version History modal to preview and restore revisions.
- **Sharing & Access Control**: Owner grants `Can Edit` or `Can View` permissions to seeded users. Read-only toolbar guards and warning banner for viewers.
- **Collaborator Presence & Multi-Tab Sync**: Header presence avatars filtered by document access rights + multi-tab polling sync.
- **Automated Tests**: 4 Vitest unit tests in `__tests__/documents.test.js` verifying access control rules.

### What Was Intentionally Deprioritized (Scope Cuts)
- Real-time WebSocket CRDT / Operational Transform engine (used rapid polling & window focus sync to guarantee reliable state under time limit).
- Cloud Auth provider setup (used instant zero-password user switcher for reviewer convenience).

### What I Would Build Next (Next 2-4 Hours)
1. **Inline Text Comment Threads**: Highlight text ranges to leave comments and resolve discussions.
2. **Collaborative Cursor Position Avatars**: Render colored cursor indicators showing active typing position.
