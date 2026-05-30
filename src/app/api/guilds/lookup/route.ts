import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || '';

    if (!name) {
      return NextResponse.json({ success: false, error: 'Nombre requerido.' }, { status: 400 });
    }

    const guild = await db.guild.findUnique({
      where: { name },
      include: {
        members: {
          include: {
            player: { select: { id: true, name: true, level: true, vocation: true, online: true } },
            rank: true,
          },
          orderBy: { rank_id: 'asc' },
        },
        ranks: { orderBy: { level: 'asc' } },
        account: { select: { name: true } },
      },
    });

    if (!guild) {
      return NextResponse.json({ success: false, error: 'Guild no encontrada.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: guild });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error interno.' }, { status: 500 });
  }
}
