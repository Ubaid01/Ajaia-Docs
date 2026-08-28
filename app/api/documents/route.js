import { NextResponse } from 'next/server';
import { createDocument, getDocumentsForUser } from '@/lib/documents';

export async function GET(req) {
  try {
    const userId = req.headers.get('x-user-id') || 'u1';
    const docs = getDocumentsForUser(userId);
    return NextResponse.json(docs);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = req.headers.get('x-user-id') || 'u1';
    const body = await req.json().catch(() => ({}));
    const { title, content } = body;
    
    const doc = createDocument(userId, title, content);
    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
