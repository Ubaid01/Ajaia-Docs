import { NextResponse } from 'next/server';
import { deleteDocument, getDocumentAccess, getDocumentCollaborators, updateDocument } from '@/lib/documents';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id') || 'u1';
    const { doc, permission } = getDocumentAccess(id, userId);

    if (!doc || !permission) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    const collaborators = getDocumentCollaborators(id);

    return NextResponse.json({ ...doc, permission, collaborators });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id') || 'u1';
    const body = await req.json();
    const { title, content } = body;

    const updated = updateDocument(id, userId, title, content);

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update document: forbidden or not found' }, { status: 403 });
    }

    const collaborators = getDocumentCollaborators(id);

    return NextResponse.json({ ...updated, collaborators });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id') || 'u1';

    const success = deleteDocument(id, userId);

    if (!success) {
      return NextResponse.json({ error: 'Only owner can delete document' }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
