'use client';

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  PlusSquare,
  MinusSquare,
  Trash2,
} from 'lucide-react';

export default function EditorToolbar({ editor, disabled }) {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter Link URL', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertImage = () => {
    const url = window.prompt('Enter Image URL', 'https://');
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const isInTable = editor.isActive('table');

  return (
    <div className={`toolbar ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
        title="Bold (Ctrl+B)"
        disabled={disabled}
      >
        <Bold size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
        title="Italic (Ctrl+I)"
        disabled={disabled}
      >
        <Italic size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`toolbar-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
        title="Underline (Ctrl+U)"
        disabled={disabled}
      >
        <UnderlineIcon size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`toolbar-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
        title="Strikethrough"
        disabled={disabled}
      >
        <Strikethrough size={16} />
      </button>

      <div className="toolbar-divider" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
        title="Heading 1"
        disabled={disabled}
      >
        <Heading1 size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
        title="Heading 2"
        disabled={disabled}
      >
        <Heading2 size={16} />
      </button>

      <div className="toolbar-divider" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
        title="Bulleted List"
        disabled={disabled}
      >
        <List size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`toolbar-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
        title="Numbered List"
        disabled={disabled}
      >
        <ListOrdered size={16} />
      </button>

      <div className="toolbar-divider" />

      {/* Alignment */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
        title="Align Left"
        disabled={disabled}
      >
        <AlignLeft size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
        title="Align Center"
        disabled={disabled}
      >
        <AlignCenter size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
        title="Align Right"
        disabled={disabled}
      >
        <AlignRight size={16} />
      </button>

      <div className="toolbar-divider" />

      {/* Insert Link, Image, Table */}
      <button
        type="button"
        onClick={setLink}
        className={`toolbar-btn ${editor.isActive('link') ? 'is-active' : ''}`}
        title="Insert Link"
        disabled={disabled}
      >
        <LinkIcon size={16} />
      </button>

      <button
        type="button"
        onClick={insertImage}
        className="toolbar-btn"
        title="Insert Image URL"
        disabled={disabled}
      >
        <ImageIcon size={16} />
      </button>

      <button
        type="button"
        onClick={insertTable}
        className={`toolbar-btn ${isInTable ? 'is-active' : ''}`}
        title="Insert 3x3 Table"
        disabled={disabled}
      >
        <TableIcon size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`toolbar-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`}
        title="Blockquote"
        disabled={disabled}
      >
        <Quote size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`toolbar-btn ${editor.isActive('codeBlock') ? 'is-active' : ''}`}
        title="Code Block"
        disabled={disabled}
      >
        <Code size={16} />
      </button>

      {/* Contextual Table Controls */}
      {isInTable && (
        <>
          <div className="toolbar-divider" />
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary)', padding: '0 4px' }}>
            Table:
          </span>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="btn btn-secondary btn-sm"
            title="Add Column"
            disabled={disabled}
          >
            +Col
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="btn btn-secondary btn-sm"
            title="Add Row"
            disabled={disabled}
          >
            +Row
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="btn btn-secondary btn-sm"
            title="Delete Column"
            disabled={disabled}
          >
            -Col
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="btn btn-secondary btn-sm"
            title="Delete Row"
            disabled={disabled}
          >
            -Row
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="btn btn-danger btn-sm"
            title="Delete Table"
            disabled={disabled}
          >
            Delete Table
          </button>
        </>
      )}

      <div className="toolbar-divider" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className="toolbar-btn"
        title="Undo (Ctrl+Z)"
        disabled={disabled || !editor.can().undo()}
      >
        <Undo size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className="toolbar-btn"
        title="Redo (Ctrl+Y)"
        disabled={disabled || !editor.can().redo()}
      >
        <Redo size={16} />
      </button>
    </div>
  );
}
