import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Token inválido.' }, { status: 401 });
    }

    const account = await db.account.findUnique({
      where: { id: payload.accountId },
      select: { id: true, type: true },
    });

    if (!account || account.type < 4) {
      return NextResponse.json({ success: false, error: 'Acceso denegado.' }, { status: 403 });
    }

    const [
      totalAccounts,
      totalPlayers,
      onlineCount,
      totalGuilds,
      totalNews,
      totalThreads,
      totalBans,
    ] = await Promise.all([
      db.account.count(),
      db.player.count(),
      db.player.count({ where: { online: true } }),
      db.guild.count(),
      db.news.count(),
      db.forumThread.count(),
      db.ban.count({ where: { active: true } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalAccounts,
        totalPlayers,
        onlineCount,
        totalGuilds,
        totalNews,
        totalThreads,
        totalBans,
      },
    });
  } catch (error) {
    console.error('Admin Stats error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
