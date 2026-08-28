'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextAlign } from '@tiptap/extension-text-align';

import { ArrowLeft, Save, Share2, Upload, Download, Trash2, ShieldCheck, ShieldAlert, Check, History, Printer } from 'lucide-react';
import EditorToolbar from './EditorToolbar';
import ShareModal from './ShareModal';
import FileUploadModal from './FileUploadModal';
import VersionHistoryModal from './VersionHistoryModal';

export default function DocumentEditor({ docId, currentUser, allUsers, onBack }) {
  const [doc, setDoc] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const autoSaveTimerRef = useRef(null);
  const isInitialContentSetRef = useRef(false);

  const canEdit = doc?.permission === 'owner' || doc?.permission === 'edit';
  const isOwner = doc?.permission === 'owner';

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your document here...',
      }),
      Image.configure({
        allowBase64: true,
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    editable: canEdit,
    immediatelyRender: false,
    onUpdate: () => {
      triggerAutoSave();
    },
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(canEdit);
    }
  }, [canEdit, editor]);

  // Sync editor content whenever doc content loads or editor is ready
  useEffect(() => {
    if (editor && !editor.isDestroyed && doc && (!isInitialContentSetRef.current || !editor.isFocused)) {
      const currentEditorHTML = editor.getHTML();
      if (currentEditorHTML !== doc.content && doc.content !== undefined) {
        editor.commands.setContent(doc.content || '');
        isInitialContentSetRef.current = true;
      }
    }
  }, [editor, doc?.content, doc]);

  const fetchDocument = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        headers: { 'x-user-id': currentUser.id },
      });

      if (res.ok) {
        const data = await res.json();
        setDoc(data);
        setTitle(data.title);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to load document');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [docId, currentUser.id]);

  useEffect(() => {
    isInitialContentSetRef.current = false;
    fetchDocument();
  }, [docId, currentUser.id, fetchDocument]);

  const saveDocument = async (newTitle, newContent) => {
    if (!canEdit || !doc || !editor || editor.isDestroyed) return;

    setSaving(true);
    const saveTitle = newTitle !== undefined ? newTitle : title;
    let saveContent = newContent;

    if (saveContent === undefined) {
      if (!editor || editor.isDestroyed) {
        setSaving(false);
        return;
      }
      try {
        saveContent = editor.getHTML() || '';
      } catch (e) {
        setSaving(false);
        return;
      }
    }

    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ title: saveTitle, content: saveContent }),
      });

      if (res.ok) {
        const updated = await res.json();
        setDoc(updated);
        setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to save changes');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      if (editor && !editor.isDestroyed) {
        saveDocument();
      }
    }, 1000);
  }, [editor, saveDocument]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Poll / Refetch document on tab focus or interval for shared collaborators
  useEffect(() => {
    const checkDocumentUpdates = async () => {
      if (!docId || !currentUser) return;
      if (editor && editor.isFocused) return;

      try {
        const res = await fetch(`/api/documents/${docId}`, {
          headers: { 'x-user-id': currentUser.id },
        });
        if (res.ok) {
          const freshDoc = await res.json();
          if (freshDoc) {
            if (freshDoc.content !== doc?.content || freshDoc.title !== doc?.title || freshDoc.permission !== doc?.permission || JSON.stringify(freshDoc.collaborators) !== JSON.stringify(doc?.collaborators)) {
              setDoc(freshDoc);
              setTitle(freshDoc.title);
              if (editor && !editor.isDestroyed && !editor.isFocused) {
                editor.commands.setContent(freshDoc.content || '');
              }
            }
          }
        }
      } catch (e) {
        // Silently catch polling error
      }
    };

    const interval = setInterval(checkDocumentUpdates, 2000);

    const onFocus = () => checkDocumentUpdates();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [docId, currentUser, doc?.content, doc?.title, doc?.permission, doc?.collaborators, editor]);

  const handleDelete = async () => {
    if (!isOwner) return;
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.id },
      });

      if (res.ok) {
        onBack();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete document');
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleImportFile = (importedTitle, importedContent, mode) => {
    if (mode === 'append' && editor && !editor.isDestroyed && canEdit) {
      editor.commands.insertContent(importedContent);
      saveDocument(title, editor.getHTML() + importedContent);
    } else {
      fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ title: importedTitle, content: importedContent }),
      })
        .then((res) => res.json())
        .then((newDoc) => {
          setDoc(newDoc);
          setTitle(newDoc.title);
          if (editor && !editor.isDestroyed) {
            editor.commands.setContent(newDoc.content || '');
          }
        });
    }
  };

  const handleExport = (format) => {
    if (!doc) return;
    if (format === 'pdf') {
      window.print();
      return;
    }

    let contentToExport = doc.content || '';
    let mimeType = 'text/plain';
    let ext = 'txt';

    if (format === 'md') {
      contentToExport = doc.content
        .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n')
        .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n')
        .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
        .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<em>(.*?)<\/em>/gi, '*$1*')
        .replace(/<[^>]*>?/gm, '');
      mimeType = 'text/markdown';
      ext = 'md';
    } else {
      contentToExport = doc.content.replace(/<[^>]*>?/gm, '');
    }

    const blob = new Blob([contentToExport], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title || 'document'}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const rawText = editor ? editor.getText() : '';
  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;

  // Filter collaborators ONLY to users with actual access (owner + shared) for THIS document
  const documentAccessList = doc?.collaborators || [];
  const otherCollaborators = documentAccessList.filter((c) => c.id !== currentUser.id);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: '#64748b' }}>
        Loading document...
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '24px', backgroundColor: 'white', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
        <h3 style={{ color: '#ef4444', marginBottom: '12px' }}>Access Restricted</h3>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>{error || 'Document not found or you lack access permission.'}</p>
        <button className="btn btn-primary" onClick={onBack}>
          <ArrowLeft size={16} /> Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="editor-layout">
      <div className="editor-header">
        <div className="editor-title-container">
          <button className="toolbar-btn" onClick={onBack} title="Back to Dashboard">
            <ArrowLeft size={18} />
          </button>

          <input
            type="text"
            className="title-input"
            value={title}
            disabled={!canEdit}
            onChange={(e) => {
              setTitle(e.target.value);
              saveDocument(e.target.value);
            }}
            placeholder="Untitled Document"
          />

          <span className={`badge ${doc.permission === 'owner' ? 'badge-owner' : doc.permission === 'edit' ? 'badge-edit' : 'badge-read'}`}>
            {doc.permission === 'owner' && 'Owner'}
            {doc.permission === 'edit' && <ShieldCheck size={12} />}
            {doc.permission === 'edit' && 'Can Edit'}
            {doc.permission === 'read' && <ShieldAlert size={12} />}
            {doc.permission === 'read' && 'Read Only'}
          </span>

          <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {saving ? 'Saving...' : lastSaved ? <><Check size={12} className="text-success" /> Saved at {lastSaved}</> : null}
            <span style={{ marginLeft: '8px', borderLeft: '1px solid #e2e8f0', paddingLeft: '8px' }}>
              {wordCount} words
            </span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Active Collaborator Avatars (Only users with access to THIS doc) */}
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', color: 'white', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }} title={`Active User: ${currentUser.name}`}>
                {currentUser.name.charAt(0)}
              </div>
              <span style={{ position: 'absolute', bottom: '0', right: '0', width: '9px', height: '9px', backgroundColor: '#10b981', borderRadius: '50%', border: '1.5px solid white' }} title="Online" />
            </div>

            {otherCollaborators.map((c) => (
              <div key={c.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '-6px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: c.permission === 'owner' ? '#e0e7ff' : c.permission === 'edit' ? '#dcfce7' : '#fef3c7',
                    color: c.permission === 'owner' ? '#3730a3' : c.permission === 'edit' ? '#166534' : '#92400e',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                  }}
                  title={`${c.name} (${c.permission === 'owner' ? 'Owner' : c.permission === 'edit' ? 'Can Edit' : 'Can View'})`}
                >
                  {c.name.charAt(0)}
                </div>
                <span
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '8px',
                    height: '8px',
                    backgroundColor: c.permission === 'edit' || c.permission === 'owner' ? '#3b82f6' : '#f59e0b',
                    borderRadius: '50%',
                    border: '1px solid white',
                  }}
                  title={c.permission === 'edit' ? 'Can Edit Access' : 'Can View Access'}
                />
              </div>
            ))}
          </div>

          <button className="btn btn-secondary btn-sm" onClick={() => setIsHistoryModalOpen(true)} title="View version history and revisions">
            <History size={14} /> Revisions
          </button>

          {canEdit && (
            <button className="btn btn-secondary btn-sm" onClick={() => saveDocument()}>
              <Save size={14} /> Save
            </button>
          )}

          {canEdit && (
            <button className="btn btn-secondary btn-sm" onClick={() => setIsUploadModalOpen(true)} title="Import file content">
              <Upload size={14} /> Import
            </button>
          )}

          <div style={{ display: 'flex', gap: '4px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => handleExport('txt')} title="Export as Plain Text (.txt)">
              <Download size={13} /> .TXT
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleExport('md')} title="Export as Markdown (.md)">
              <Download size={13} /> .MD
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleExport('pdf')} title="Export / Save to PDF">
              <Printer size={13} /> PDF
            </button>
          </div>

          {isOwner && (
            <button className="btn btn-primary btn-sm" onClick={() => setIsShareModalOpen(true)}>
              <Share2 size={14} /> Share
            </button>
          )}

          {isOwner && (
            <button className="btn btn-danger btn-sm" onClick={handleDelete} title="Delete Document">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <EditorToolbar editor={editor} disabled={!canEdit} />

      {!canEdit && (
        <div style={{ backgroundColor: '#fffbe5', color: '#b45309', borderBottom: '1px solid #fef08a', padding: '8px 24px', fontSize: '0.85rem', textAlign: 'center', fontWeight: '500' }}>
          You have view-only access to this document. Changes cannot be saved.
        </div>
      )}

      <div className="editor-workspace">
        <div className="paper-page">
          <EditorContent editor={editor} />
        </div>
      </div>

      <ShareModal
        docId={docId}
        docTitle={doc.title}
        currentUserId={currentUser.id}
        allUsers={allUsers}
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          fetchDocument();
        }}
      />

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImport={handleImportFile}
        isEditorOpen={true}
      />

      <VersionHistoryModal
        docId={docId}
        currentUserId={currentUser.id}
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onRestore={(restored) => {
          setDoc(restored);
          setTitle(restored.title);
          if (editor && !editor.isDestroyed) {
            editor.commands.setContent(restored.content || '');
          }
        }}
      />
    </div>
  );
}
