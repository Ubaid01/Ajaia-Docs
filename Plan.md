# Plan & Scope Matrix

## Phase 1: Core Foundation & Database
- [x] SQLite schema setup (`users`, `documents`, `document_shares`)
- [x] Seed data (Alice, Bob, Charlie + demo document)

## Phase 2: Document Creation & Editing
- [x] Create document
- [x] Inline rename title from editor and dashboard cards
- [x] Tiptap rich-text formatting (Bold, Italic, Underline, Strikethrough, Headings, Lists, Blockquote, Code block, Links, Images, Tables, Text Alignment)
- [x] Debounced auto-save to backend SQLite DB
- [x] Word count indicator

## Phase 3: File Import & Export
- [x] Support plain text (`.txt`), Markdown (`.md`), and Word (`.docx` via `mammoth`) client-side parsing.
- [x] Export active document as `.txt` or `.md`.

## Phase 4: Sharing & Permission Enforcement
- [x] Document Owner vs Share Access (`Can Edit` vs `Can View`)
- [x] Shared with Me vs My Documents workspace separation
- [x] Read-only UI guards for view-only collaborators

## Phase 5: Persistence & State Management
- [x] URL parameters + LocalStorage state persistence across browser reloads
- [x] Automatic cross-tab focus refetch & polling sync

## Phase 6: Automated Testing & Deliverables
- [x] Vitest automated tests for access control rules
- [x] `README.md`, `SUBMISSION.md`, `ARCHITECTURE.md`, `AI_WORKFLOW.md`, `Plan.md`, `Progress.md`
