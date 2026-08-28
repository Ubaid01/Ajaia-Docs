import { NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/documents';

export async function GET() {
  try {
    const users = getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
