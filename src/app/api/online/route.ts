import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const players = await db.player.findMany({
      where: { online: true, hidden: false },
      select: { id: true, name: true, level: true, vocation: true, guildMember: { include: { guild: { select: { name: true } } } } },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: { count: players.length, players } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error interno.' }, { status: 500 });
  }
}
