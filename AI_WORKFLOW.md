# AI-Native Workflow Note

## 1. AI Tools Used
- **Google Antigravity AI Coding Assistant**: Automated project scaffolding, full-stack route creation, UI component design, and unit testing.

## 2. Where AI Materially Accelerated Work
- **Scaffolding & Database Schema**: Initialized Next.js App Router and SQLite relational schema with seeded users in minutes.
- **Component Drafting**: Generated clean Tiptap editor toolbar, sharing modal popup, file import handlers, version history revision modal, and presence indicators.
- **Test Generation**: Created Vitest unit tests verifying permission boundaries.

## 3. What AI Output Was Changed or Rejected
- **TypeScript Removal**: Replaced TypeScript with pure JavaScript (`.js` / `.jsx`) to eliminate compilation overhead, strict type casting noise, and potential runtime side-effects.
- **Robust File Parsing**: Replaced raw string parsing with `mammoth` (for Microsoft Word `.docx` parsing) and `marked` (for Markdown `.md` parsing).

## 4. Verification & Quality Assurance
- **Automated Tests**: Verified permission logic using `npx vitest run`.
- **Production Build Validation**: Ran `npm run build` to confirm zero compilation or lint errors.
- **UX & Functional Verification**: Tested document creation, inline card title renaming, rich text formatting, file importing (`.txt`, `.md`, `.docx`), file exporting (`.txt`, `.md`, `.pdf`), version history restoration, sharing permission toggle, and account switching.
