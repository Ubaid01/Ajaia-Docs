import { NextResponse } from 'next/server';
import { getDocumentVersions, restoreDocumentVersion } from '@/lib/documents';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id') || 'u1';
    const versions = getDocumentVersions(id, userId);

    if (versions === null) {
      return NextResponse.json({ error: 'Access denied to document history' }, { status: 403 });
    }

    return NextResponse.json(versions);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id') || 'u1';
    const { versionId } = await req.json();

    if (!versionId) {
      return NextResponse.json({ error: 'Missing versionId' }, { status: 400 });
    }

    const restored = restoreDocumentVersion(id, versionId, userId);

    if (!restored) {
      return NextResponse.json({ error: 'Failed to restore document version' }, { status: 403 });
    }

    return NextResponse.json(restored);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
