'use client';

import { useState } from 'react';
import { Plus, Upload, Search, FileText, User as UserIcon, ShieldCheck, ShieldAlert, Trash2, Edit2, Check, X } from 'lucide-react';
import FileUploadModal from './FileUploadModal';

export default function Dashboard({
  currentUser,
  ownedDocs,
  sharedDocs,
  loading,
  onOpenDoc,
  onCreateDoc,
  onImportDoc,
  onDeleteDoc,
}) {
  const [activeTab, setActiveTab] = useState('owned');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const currentDocs = activeTab === 'owned' ? ownedDocs : sharedDocs;
  const filteredDocs = currentDocs.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.owner_name && doc.owner_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const startInlineRename = (e, doc) => {
    e.stopPropagation();
    setEditingDocId(doc.id);
    setEditingTitle(doc.title);
  };

  const saveInlineRename = async (e, docId) => {
    e.stopPropagation();
    if (!editingTitle.trim()) {
      setEditingDocId(null);
      return;
    }

    try {
      await fetch(`/api/documents/${docId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ title: editingTitle }),
      });
      // Trigger document list reload
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Failed to rename document:', err);
    } finally {
      setEditingDocId(null);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '700' }}>Welcome, {currentUser.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage your personal documents and team collaborations.
          </p>
        </div>

        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={() => setIsUploadOpen(true)}>
            <Upload size={16} /> Import File (.txt / .md / .docx)
          </button>
          <button className="btn btn-primary" onClick={onCreateDoc}>
            <Plus size={16} /> New Document
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div className="tabs" style={{ marginBottom: 0 }}>
          <div className={`tab ${activeTab === 'owned' ? 'active' : ''}`} onClick={() => setActiveTab('owned')}>
            My Documents ({ownedDocs.length})
          </div>
          <div className={`tab ${activeTab === 'shared' ? 'active' : ''}`} onClick={() => setActiveTab('shared')}>
            Shared with Me ({sharedDocs.length})
          </div>
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="text-input"
            style={{ paddingLeft: '36px', width: '100%' }}
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading documents...</div>
      ) : filteredDocs.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
          <FileText size={40} className="text-muted" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '4px' }}>
            {searchQuery ? 'No documents match your search' : activeTab === 'owned' ? 'No personal documents yet' : 'No shared documents'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
            {activeTab === 'owned' ? 'Create your first document or import a file to get started.' : 'Documents shared with you by teammates will appear here.'}
          </p>
          {activeTab === 'owned' && !searchQuery && (
            <button className="btn btn-primary" onClick={onCreateDoc}>
              <Plus size={16} /> Create New Document
            </button>
          )}
        </div>
      ) : (
        <div className="doc-grid">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="doc-card" onClick={() => onOpenDoc(doc.id)}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  {editingDocId === doc.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        className="text-input"
                        style={{ padding: '2px 6px', fontSize: '0.9rem', width: '100%' }}
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveInlineRename(e, doc.id);
                          if (e.key === 'Escape') setEditingDocId(null);
                        }}
                        autoFocus
                      />
                      <button className="toolbar-btn text-success" onClick={(e) => saveInlineRename(e, doc.id)}>
                        <Check size={14} />
                      </button>
                      <button className="toolbar-btn text-danger" onClick={(e) => { e.stopPropagation(); setEditingDocId(null); }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="doc-card-title">{doc.title}</div>
                      {doc.permission === 'owner' && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            className="toolbar-btn text-muted"
                            onClick={(e) => startInlineRename(e, doc)}
                            title="Rename title"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="toolbar-btn text-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete "${doc.title}"?`)) onDeleteDoc(doc.id);
                            }}
                            title="Delete document"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="doc-card-preview">
                  {doc.content ? doc.content.replace(/<[^>]*>?/gm, '') : 'Empty document...'}
                </div>
              </div>

              <div className="doc-card-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserIcon size={12} />
                  <span>{activeTab === 'owned' ? 'You' : doc.owner_name || 'Teammate'}</span>
                </div>

                <span className={`badge ${doc.permission === 'owner' ? 'badge-owner' : doc.permission === 'edit' ? 'badge-edit' : 'badge-read'}`}>
                  {doc.permission === 'owner' && 'Owner'}
                  {doc.permission === 'edit' && <ShieldCheck size={10} />}
                  {doc.permission === 'edit' && 'Can Edit'}
                  {doc.permission === 'read' && <ShieldAlert size={10} />}
                  {doc.permission === 'read' && 'Can View'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImport={(title, content) => onImportDoc(title, content)}
        isEditorOpen={false}
      />
    </div>
  );
}
