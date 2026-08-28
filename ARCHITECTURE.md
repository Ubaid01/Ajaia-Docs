# Architecture Note - Ajaia Docs

## System Design & Tradeoffs

### 1. Framework Choice: Next.js App Router
- **Tradeoff**: Chose Next.js App Router to co-locate React UI components and Server API Routes in a single codebase.
- **Benefit**: Zero CORS configuration, single process execution (`npm run dev`), fast iteration speed within the 4-6 hour timebox.

### 2. Storage Engine: SQLite (`better-sqlite3`)
- **Tradeoff**: Chose local embedded SQLite file database over external cloud databases (Postgres / Supabase).
- **Benefit**: Zero reviewer setup cost, zero external API key requirements, deterministic local execution, synchronous fast reads/writes stored in `ajaia.db`. Includes relational tables for `users`, `documents`, `document_shares`, and `document_versions`.

### 3. Rich Text Editing: Tiptap Editor
- **Tradeoff**: Used Tiptap (`@tiptap/react` + StarterKit) instead of raw `contentEditable` or heavy legacy editors.
- **Benefit**: Clean HTML representation, extensible formatting extensions (Bold, Italic, Underline, Strike, Headings, Bullet/Numbered Lists, Blockquotes, Code Blocks, Links, Images, Tables with contextual +Row/+Col controls, and Text Alignment).

### 4. Versioning & Snapshot Revision Model
- Automatically records document revision snapshots in SQLite (`document_versions` table).
- Provides a Version History modal for previewing and one-click restoration of previous document states.

### 5. Access Control Architecture
- Business access logic is centralized in pure helper functions (`canUserEdit`, `canUserView`, `getDocumentAccess`, `getDocumentCollaborators`) in `lib/documents.js`.
- Keeps security logic isolated from UI rendering and allows 100% unit test coverage via Vitest.
