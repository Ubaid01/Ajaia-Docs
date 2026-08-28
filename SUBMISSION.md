# Ajaia Docs - Submission Package

## 1. Submission Links
- **GitHub Repository**: https://github.com/Ubaid01/Ajaia-Docs
- **Walkthrough Video**: https://youtu.be/5LyfaGrXrGs

---

## 2. Seeded Test Accounts
No password required. Select active user from top right dropdown:
- **Alice Chen** (`u1` / `alice@ajaia.com`) - Owner of demo documents
- **Bob Smith** (`u2` / `bob@ajaia.com`) - Has **Can Edit** access to shared documents
- **Charlie Kim** (`u3` / `charlie@ajaia.com`) - Has **Can View** (Read-Only) access

---

## 3. Quick Setup & Local Run Commands
```bash
# 1. Install dependencies
npm install

# 2. Run local dev server (http://localhost:3000)
npm run dev

# 3. Run automated test suite
npm run test

# 4. Production build validation
npm run build
```

---

## 4. Key Architectural & System Decisions

### Framework & Database
- **Next.js App Router**: Co-locates React UI components and Server API Routes in pure JavaScript (`.js` / `.jsx`), zero CORS configuration overhead.
- **SQLite (`better-sqlite3`)**: Relational database stored in `ajaia.db`. Tracks `users`, `documents`, `document_shares`, and `document_versions` with zero external API key requirements.

### Rich Text Editor & Extensions
- **Tiptap Editor (`@tiptap/react` + StarterKit)**: Configured with custom formatting extensions for Bold, Italic, Underline, Strikethrough, Headings (H1/H2), Bullet/Numbered Lists, Code Blocks, Hyperlinks, Images (HTTP URLs & Base64), Tables (with contextual +Row, +Col, -Row, -Col, Delete Table controls), and Text Alignment (Left, Center, Right).

### File Import & Export
- **Multi-Format Import**: Client-side parsing for plain text (`.txt`), Markdown (`.md` via `marked`), and Microsoft Word (`.docx` via `mammoth`) directly into editable document canvas or draft appends.
- **Multi-Format Export**: Direct file download as plain text (`.txt`), Markdown (`.md`), or PDF (`.pdf` via print layout styling).

### Access Control & Version History
- **Role-Based Sharing**: Granular **Can Edit** and **Can View** access enforcement in `lib/documents.js`. Viewers get enforced read-only toolbar guards and warning banner.
- **Revision Snapshots**: Automatic snapshot recording on auto-saves. Dedicated Version History modal allows previewing and restoring prior document revisions with one click.
- **Collaborator Presence & Multi-Tab Sync**: Header presence avatars reflect active document access rights. Multi-tab focus listeners and fast polling maintain real-time document sync.

---

## 5. Verification & Testing Summary

- **Automated Tests**: 4 Vitest unit tests in `__tests__/documents.test.js` verifying owner permissions, share access rules, and viewer restrictions (`npm run test` 100% passing).
- **Production Build**: Verified clean Next.js build compilation (`npm run build` exit code 0).
