# Ajaia Docs - Submission Package

## 1. Submission Links
- **Google Drive Folder**: `[Include Google Drive Link Here]`
- **Walkthrough Video**: `[Include Loom / YouTube Video Link Here]`

---

## 2. Screenshots & Product Previews
![Dashboard](./public/screenshots/dashboard.png)
![Document Editor](./public/screenshots/editor.png)
![Share Modal](./public/screenshots/share_modal.png)

---

## 3. Seeded Accounts for Testing Sharing Flows
No password required. Select active user from the top right dropdown in the app navbar:
- **Alice Chen** (`u1` / `alice@ajaia.com`) - Owner of initial demo document
- **Bob Smith** (`u2` / `bob@ajaia.com`) - Has **Can Edit** access to Alice's demo document
- **Charlie Kim** (`u3` / `charlie@ajaia.com`) - Has **Can View** (Read Only) access to Alice's demo document

---

## 4. Local Setup & Run Instructions
```bash
# 1. Install dependencies
npm install

# 2. Run local dev server
npm run dev
# Open http://localhost:3000

# 3. Run automated tests
npm run test

# 4. Build for production
npm run build
```

---

## 5. Deliverables Checklist & Included Files

- [x] **Source Code**: Clean Next.js App Router codebase in pure JavaScript (`.js` / `.jsx`).
- [x] **`README.md`**: Complete setup, architecture notes, screenshots, and feature matrix.
- [x] **`ARCHITECTURE.md`**: System design, SQLite schema, and security access control tradeoff notes.
- [x] **`AI_WORKFLOW.md`**: Detailed AI acceleration and verification workflow notes.
- [x] **`SUBMISSION.md`**: Deliverable manifest.
- [x] **`Plan.md` & `Progress.md`**: Task tracking & verification logs.

---

## 6. What Is Working (End-to-End Features)

- **Document Creation & Editing**: Create new documents, inline title renaming from dashboard cards or editor header, rich text formatting (Bold, Italic, Underline, Strikethrough, H1/H2, Bullet/Numbered Lists, Blockquotes, Code Blocks, Hyperlinks, Images, Tables with +Row/+Col/-Row/-Col/Delete Table, Text Alignment), debounced auto-save to SQLite, live word counter.
- **File Upload & Export**: Import `.txt`, `.md`, or `.docx` files to generate a new editable document or append into an existing draft. Export active document to `.txt`, `.md`, or `.pdf`.
- **Version History & Snapshot Restoration**: Automatic revision snapshots in SQLite + Version History modal to preview and restore past document versions.
- **Sharing & Permissions**: Owner can grant/revoke `Can Edit` or `Can View` permissions to seeded users. Workspace separates "My Documents" from "Shared with Me". Viewers get enforced read-only UI guards.
- **Collaborator Presence**: Active collaborator avatars in editor header showing online presence and permission badges.
- **Multi-Tab Sync**: Cross-tab visibility focus listeners & 2.0s polling auto-sync documents across windows.
- **Persistence**: Relational SQLite storage in `ajaia.db` initialized with schema & auto-seeded sample data. State preserved across reloads via `localStorage` & URL query parameters (`?doc=id&user=userId`).
- **Automated Tests**: 4 Vitest unit tests verifying access control rules.
