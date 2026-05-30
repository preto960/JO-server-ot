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

    // Find all players for this account
    const players = await db.player.findMany({
      where: { accountId: payload.accountId },
      select: { id: true, name: true },
    });

    if (players.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const playerIds = players.map(p => p.id);

    // Find all guild memberships for these players
    const memberships = await db.guildMember.findMany({
      where: { player_id: { in: playerIds } },
      include: {
        guild: { select: { id: true, name: true, description: true, motd: true, logo_gfx_name: true } },
        rank: { select: { id: true, name: true, level: true } },
        player: { select: { id: true, name: true, level: true, vocation: true, online: true } },
      },
    });

    const data = memberships.map(m => ({
      guildId: m.guild.id,
      guildName: m.guild.name,
      guildDescription: m.guild.description,
      guildMotd: m.guild.motd,
      guildLogo: m.guild.logo_gfx_name,
      rankId: m.rank.id,
      rankName: m.rank.name,
      rankLevel: m.rank.level,
      nick: m.nick,
      player: {
        id: m.player.id,
        name: m.player.name,
        level: m.player.level,
        vocation: m.player.vocation,
        online: m.player.online,
      },
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('My guilds error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
