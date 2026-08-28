'use client';

import { useState, useEffect } from 'react';
import { X, History, RotateCcw, Clock } from 'lucide-react';

export default function VersionHistoryModal({ docId, currentUserId, isOpen, onClose, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && docId) {
      fetchVersions();
    }
  }, [isOpen, docId]);

  const fetchVersions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${docId}/versions`, {
        headers: { 'x-user-id': currentUserId },
      });
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
        if (data.length > 0) {
          setSelectedVersion(data[0]);
        }
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to load document history');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (versionId) => {
    if (!confirm('Restore this document snapshot? Current unsaved changes will be replaced.')) return;
    setError(null);

    try {
      const res = await fetch(`/api/documents/${docId}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
        },
        body: JSON.stringify({ versionId }),
      });

      if (res.ok) {
        const restoredDoc = await res.json();
        onRestore(restoredDoc);
        onClose();
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to restore version');
      }
    } catch (e) {
      setError(e.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={20} className="text-primary" />
            <span>Version History & Revisions</span>
          </div>
          <button className="toolbar-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '16px', minHeight: '320px', maxHeight: '420px' }}>
          {/* Version list */}
          <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {loading ? (
              <div style={{ padding: '12px', fontSize: '0.85rem', color: '#94a3b8' }}>Loading history...</div>
            ) : versions.length === 0 ? (
              <div style={{ padding: '12px', fontSize: '0.85rem', color: '#94a3b8' }}>No saved snapshots yet.</div>
            ) : (
              versions.map((ver, idx) => (
                <div
                  key={ver.id}
                  onClick={() => setSelectedVersion(ver)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    backgroundColor: selectedVersion?.id === ver.id ? 'var(--primary-light)' : 'transparent',
                    border: '1px solid',
                    borderColor: selectedVersion?.id === ver.id ? '#bfdbfe' : 'transparent',
                  }}
                >
                  <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                    {idx === 0 ? 'Current Snapshot' : `Version ${versions.length - idx}`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Clock size={11} /> {new Date(ver.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Version preview & restore action */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingLeft: '4px' }}>
            {selectedVersion ? (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  <div style={{ fontWeight: '700', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                    {selectedVersion.title}
                  </div>
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedVersion.content || '<em>Empty version</em>' }}
                    style={{ opacity: 0.9 }}
                  />
                </div>

                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button className="btn btn-secondary" onClick={onClose}>
                    Close
                  </button>
                  <button className="btn btn-primary" onClick={() => handleRestore(selectedVersion.id)}>
                    <RotateCcw size={16} /> Restore Snapshot
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '0.9rem' }}>
                Select a version from the left panel to preview.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
