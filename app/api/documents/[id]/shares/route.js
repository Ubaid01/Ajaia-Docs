import { NextResponse } from 'next/server';
import { getDocumentShares, removeShare, shareDocument } from '@/lib/documents';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id') || 'u1';
    const shares = getDocumentShares(id, userId);

    if (shares === null) {
      return NextResponse.json({ error: 'Only document owner can view share settings' }, { status: 403 });
    }

    return NextResponse.json(shares);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const ownerId = req.headers.get('x-user-id') || 'u1';
    const { targetUserId, permission } = await req.json();

    if (!targetUserId || !['read', 'edit'].includes(permission)) {
      return NextResponse.json({ error: 'Invalid user or permission level' }, { status: 400 });
    }

    const success = shareDocument(id, ownerId, targetUserId, permission);

    if (!success) {
      return NextResponse.json({ error: 'Failed to share document. Only owner can manage shares.' }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const ownerId = req.headers.get('x-user-id') || 'u1';
    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing targetUserId' }, { status: 400 });
    }

    const success = removeShare(id, ownerId, targetUserId);

    if (!success) {
      return NextResponse.json({ error: 'Failed to remove share permission.' }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
