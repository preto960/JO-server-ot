import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const images = await db.gallery.findMany({
      where: { hidden: false },
      orderBy: { ordering: 'asc' },
    });

    return NextResponse.json({ success: true, data: images });
  } catch (error) {
    console.error('Gallery API error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
