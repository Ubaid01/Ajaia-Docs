'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import DocumentEditor from '@/components/DocumentEditor';

export default function Home() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [ownedDocs, setOwnedDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize active doc & user from URL search params or localStorage
  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        if (data.length > 0) {
          const urlParams = new URLSearchParams(window.location.search);
          const savedUserId = urlParams.get('user') || localStorage.getItem('ajaia_active_user') || data[0].id;
          const initialUser = data.find((u) => u.id === savedUserId) || data[0];
          setCurrentUser(initialUser);

          const savedDocId = urlParams.get('doc') || localStorage.getItem('ajaia_active_doc');
          if (savedDocId) {
            setActiveDocId(savedDocId);
          }
        }
      })
      .catch((err) => console.error('Failed to load users:', err));
  }, []);

  // Sync state with URL & localStorage
  const updateActiveDocState = (docId) => {
    setActiveDocId(docId);
    if (docId) {
      localStorage.setItem('ajaia_active_doc', docId);
      const url = new URL(window.location.href);
      url.searchParams.set('doc', docId);
      window.history.replaceState({}, '', url.toString());
    } else {
      localStorage.removeItem('ajaia_active_doc');
      const url = new URL(window.location.href);
      url.searchParams.delete('doc');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const updateActiveUserState = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('ajaia_active_user', user.id);
      const url = new URL(window.location.href);
      url.searchParams.set('user', user.id);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Fetch documents for active user
  const fetchDocuments = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await fetch('/api/documents', {
        headers: { 'x-user-id': currentUser.id },
      });
      if (res.ok) {
        const data = await res.json();
        setOwnedDocs(data.owned || []);
        setSharedDocs(data.shared || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchDocuments();

    // Auto-refetch documents on tab focus / visibility change / storage event
    const onFocus = () => fetchDocuments();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('storage', onFocus);

    const interval = setInterval(fetchDocuments, 3000);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('storage', onFocus);
      clearInterval(interval);
    };
  }, [currentUser, fetchDocuments]);

  // Create new document handler
  const handleCreateDocument = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ title: 'Untitled Document', content: '<p></p>' }),
      });

      if (res.ok) {
        const doc = await res.json();
        updateActiveDocState(doc.id);
        fetchDocuments();
      }
    } catch (err) {
      console.error('Failed to create document:', err);
    }
  };

  // Import document from file handler
  const handleImportDocument = async (title, content) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        const doc = await res.json();
        updateActiveDocState(doc.id);
        fetchDocuments();
      }
    } catch (err) {
      console.error('Failed to import document:', err);
    }
  };

  // Delete document handler
  const handleDeleteDocument = async (docId) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.id },
      });

      if (res.ok) {
        if (activeDocId === docId) {
          updateActiveDocState(null);
        }
        fetchDocuments();
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  return (
    <main>
      <Navbar
        users={users}
        currentUser={currentUser}
        onSelectUser={(u) => {
          updateActiveUserState(u);
        }}
        onHomeClick={() => updateActiveDocState(null)}
      />

      {activeDocId && currentUser ? (
        <DocumentEditor
          docId={activeDocId}
          currentUser={currentUser}
          allUsers={users}
          onBack={() => {
            updateActiveDocState(null);
            fetchDocuments();
          }}
        />
      ) : currentUser ? (
        <Dashboard
          currentUser={currentUser}
          ownedDocs={ownedDocs}
          sharedDocs={sharedDocs}
          loading={loading}
          onOpenDoc={(id) => updateActiveDocState(id)}
          onCreateDoc={handleCreateDocument}
          onImportDoc={handleImportDocument}
          onDeleteDoc={handleDeleteDocument}
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Initializing application...</div>
      )}
    </main>
  );
}
