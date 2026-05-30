import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bug = await db.bugTracker.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        subject: true,
        type: true,
        status: true,
        text: true,
        account: true,
        date: true,
        reply: true,
        who: true,
        tag: true,
      },
    });

    if (!bug) {
      return NextResponse.json({ success: false, error: 'Bug no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: bug });
  } catch (error) {
    console.error('Bug detail API error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
