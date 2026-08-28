'use client';

import { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function ShareModal({ docId, docTitle, currentUserId, allUsers, isOpen, onClose }) {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [permission, setPermission] = useState('edit');
  const [error, setError] = useState(null);

  const availableUsers = allUsers.filter((u) => u.id !== currentUserId);

  useEffect(() => {
    if (isOpen && docId) {
      fetchShares();
      if (availableUsers.length > 0) {
        setSelectedUser(availableUsers[0].id);
      }
    }
  }, [isOpen, docId]);

  const fetchShares = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${docId}/shares`, {
        headers: { 'x-user-id': currentUserId },
      });
      if (res.ok) {
        const data = await res.json();
        setShares(data);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to load shares');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShare = async () => {
    if (!selectedUser) return;
    setError(null);

    try {
      const res = await fetch(`/api/documents/${docId}/shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
        },
        body: JSON.stringify({ targetUserId: selectedUser, permission }),
      });

      if (res.ok) {
        fetchShares();
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to share document');
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const handleRemoveShare = async (targetUserId) => {
    setError(null);
    try {
      const res = await fetch(`/api/documents/${docId}/shares`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
        },
        body: JSON.stringify({ targetUserId }),
      });

      if (res.ok) {
        fetchShares();
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to remove share access');
      }
    } catch (e) {
      setError(e.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Share "{docTitle}"</div>
          <button className="toolbar-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        <div className="share-input-row">
          <select
            className="select-input text-input"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>

          <select
            className="select-input"
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
          >
            <option value="edit">Can Edit</option>
            <option value="read">Can View</option>
          </select>

          <button className="btn btn-primary" onClick={handleAddShare} disabled={!selectedUser}>
            <UserPlus size={16} /> Share
          </button>
        </div>

        <div style={{ marginTop: '20px', fontWeight: '600', fontSize: '0.9rem', color: '#64748b' }}>
          People with access:
        </div>

        <div className="share-list">
          {loading ? (
            <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>Loading access list...</div>
          ) : shares.length === 0 ? (
            <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              Only you have access to this document.
            </div>
          ) : (
            shares.map((share) => (
              <div key={share.id} className="share-item">
                <div>
                  <div style={{ fontWeight: '600' }}>{share.user_name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{share.user_email}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`badge ${share.permission === 'edit' ? 'badge-edit' : 'badge-read'}`}>
                    {share.permission === 'edit' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                    {share.permission === 'edit' ? 'Can Edit' : 'Can View'}
                  </span>
                  <button
                    className="toolbar-btn text-danger"
                    onClick={() => handleRemoveShare(share.user_id)}
                    title="Remove Access"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
