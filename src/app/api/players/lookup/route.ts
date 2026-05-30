import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || '';

    if (!name) {
      return NextResponse.json({ success: false, error: 'Nombre requerido.' }, { status: 400 });
    }

    const player = await db.player.findUnique({
      where: { name },
      include: {
        account: { select: { id: true, name: true } },
        skills: true,
        guildMember: { include: { guild: { select: { name: true, id: true } }, rank: { select: { name: true, level: true } } } },
        deaths: { orderBy: { date: 'desc' }, take: 20 },
      },
    });

    if (!player) {
      return NextResponse.json({ success: false, error: 'Jugador no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: player });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error interno.' }, { status: 500 });
  }
}
