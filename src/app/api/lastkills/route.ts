import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const deaths = await db.playerDeath.findMany({
      orderBy: { date: 'desc' },
      take: 50,
      include: {
        player: {
          select: { id: true, name: true },
        },
      },
    });

    const data = deaths.map(d => ({
      id: d.id,
      playerId: d.player_id,
      playerName: d.player.name,
      level: d.level,
      date: d.date,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Last kills API error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
