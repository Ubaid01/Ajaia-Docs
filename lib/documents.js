import db from './db';
import crypto from 'crypto';

function generateId() {
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 12);
}

export function getAllUsers() {
  return db.prepare('SELECT id, name, email, avatar FROM users ORDER BY name ASC').all();
}

export function getDocumentsForUser(userId) {
  const owned = db.prepare(`
    SELECT d.id, d.title, d.content, d.owner_id, d.created_at, d.updated_at, 'owner' as permission
    FROM documents d
    WHERE d.owner_id = ?
    ORDER BY d.updated_at DESC
  `).all(userId);

  const shared = db.prepare(`
    SELECT d.id, d.title, d.content, d.owner_id, u.name as owner_name, d.created_at, d.updated_at, s.permission
    FROM documents d
    JOIN document_shares s ON d.id = s.document_id
    JOIN users u ON d.owner_id = u.id
    WHERE s.user_id = ?
    ORDER BY d.updated_at DESC
  `).all(userId);

  return { owned, shared };
}

export function getDocumentAccess(docId, userId) {
  const doc = db.prepare('SELECT id, title, content, owner_id, created_at, updated_at FROM documents WHERE id = ?').get(docId);
  
  if (!doc) return { doc: null, permission: null };

  if (doc.owner_id === userId) {
    return { doc, permission: 'owner' };
  }

  const share = db.prepare('SELECT permission FROM document_shares WHERE document_id = ? AND user_id = ?').get(docId, userId);

  if (share) {
    return { doc, permission: share.permission };
  }

  return { doc, permission: null };
}

export function getDocumentCollaborators(docId) {
  const doc = db.prepare('SELECT owner_id FROM documents WHERE id = ?').get(docId);
  if (!doc) return [];

  const owner = db.prepare('SELECT id, name, email, avatar FROM users WHERE id = ?').get(doc.owner_id);
  const shares = db.prepare(`
    SELECT u.id, u.name, u.email, u.avatar, s.permission
    FROM document_shares s
    JOIN users u ON s.user_id = u.id
    WHERE s.document_id = ?
  `).all(docId);

  return [
    { ...owner, permission: 'owner' },
    ...shares
  ];
}

export function createDocument(userId, title = 'Untitled Document', content = '<p></p>') {
  const id = generateId();
  db.prepare(`
    INSERT INTO documents (id, title, content, owner_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(id, title, content, userId);

  createDocumentVersion(id, title, content);

  const doc = db.prepare('SELECT id, title, content, owner_id, created_at, updated_at FROM documents WHERE id = ?').get(id);
  return { ...doc, permission: 'owner' };
}

export function updateDocument(docId, userId, title, content) {
  const { doc, permission } = getDocumentAccess(docId, userId);

  if (!doc || (permission !== 'owner' && permission !== 'edit')) {
    return null;
  }

  db.prepare(`
    UPDATE documents
    SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title, content, docId);

  createDocumentVersion(docId, title, content);

  const updated = db.prepare('SELECT id, title, content, owner_id, created_at, updated_at FROM documents WHERE id = ?').get(docId);
  return { ...updated, permission };
}

export function deleteDocument(docId, userId) {
  const { doc, permission } = getDocumentAccess(docId, userId);
  if (!doc || permission !== 'owner') {
    return false;
  }

  db.prepare('DELETE FROM documents WHERE id = ?').run(docId);
  return true;
}

export function getDocumentShares(docId, userId) {
  const { doc, permission } = getDocumentAccess(docId, userId);
  if (!doc || permission !== 'owner') {
    return null;
  }

  return db.prepare(`
    SELECT s.id, s.document_id, s.user_id, s.permission, u.name as user_name, u.email as user_email
    FROM document_shares s
    JOIN users u ON s.user_id = u.id
    WHERE s.document_id = ?
  `).all(docId);
}

export function shareDocument(docId, ownerId, targetUserId, permission) {
  const { doc, permission: userPermission } = getDocumentAccess(docId, ownerId);
  if (!doc || userPermission !== 'owner') {
    return false;
  }

  if (ownerId === targetUserId) {
    return false;
  }

  const existing = db.prepare('SELECT id FROM document_shares WHERE document_id = ? AND user_id = ?').get(docId, targetUserId);

  if (existing) {
    db.prepare('UPDATE document_shares SET permission = ? WHERE id = ?').run(permission, existing.id);
  } else {
    const id = generateId();
    db.prepare('INSERT INTO document_shares (id, document_id, user_id, permission) VALUES (?, ?, ?, ?)').run(id, docId, targetUserId, permission);
  }

  return true;
}

export function removeShare(docId, ownerId, targetUserId) {
  const { doc, permission: userPermission } = getDocumentAccess(docId, ownerId);
  if (!doc || userPermission !== 'owner') {
    return false;
  }

  db.prepare('DELETE FROM document_shares WHERE document_id = ? AND user_id = ?').run(docId, targetUserId);
  return true;
}

export function createDocumentVersion(docId, title, content) {
  const id = generateId();
  db.prepare(`
    INSERT INTO document_versions (id, document_id, title, content, created_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(id, docId, title, content);
}

export function getDocumentVersions(docId, userId) {
  const { doc, permission } = getDocumentAccess(docId, userId);
  if (!doc || !permission) {
    return null;
  }

  return db.prepare(`
    SELECT id, document_id, title, content, created_at
    FROM document_versions
    WHERE document_id = ?
    ORDER BY created_at DESC
    LIMIT 15
  `).all(docId);
}

export function restoreDocumentVersion(docId, versionId, userId) {
  const { doc, permission } = getDocumentAccess(docId, userId);
  if (!doc || (permission !== 'owner' && permission !== 'edit')) {
    return null;
  }

  const version = db.prepare('SELECT title, content FROM document_versions WHERE id = ? AND document_id = ?').get(versionId, docId);
  if (!version) return null;

  return updateDocument(docId, userId, version.title, version.content);
}

export function canUserEdit(permission) {
  return permission === 'owner' || permission === 'edit';
}

export function canUserView(permission) {
  return permission === 'owner' || permission === 'edit' || permission === 'read';
}
