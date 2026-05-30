import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || '';

    if (!name) {
      return NextResponse.json({ success: false, error: 'Nombre requerido.' }, { status: 400 });
    }

    const players = await db.player.findMany({
      where: {
        name: { contains: name, mode: 'insensitive' },
        hidden: false,
        deletion: { lt: 0 },
      },
      select: { id: true, name: true, level: true, vocation: true, online: true },
      take: 20,
    });

    return NextResponse.json({ success: true, data: players });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error interno.' }, { status: 500 });
  }
}
