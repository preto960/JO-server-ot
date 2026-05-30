import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Token inválido.' }, { status: 401 });
    }

    const body = await request.json();
    const { guildId, playerId } = body;

    if (!guildId || !playerId) {
      return NextResponse.json({ success: false, error: 'Datos inválidos.' }, { status: 400 });
    }

    // Verify guild exists
    const guild = await db.guild.findUnique({
      where: { id: guildId },
      include: { ranks: true },
    });
    if (!guild) {
      return NextResponse.json({ success: false, error: 'Guild no encontrada.' }, { status: 404 });
    }

    // Check permissions: owner or vice leader
    const isOwner = guild.ownerid === payload.accountId;

    if (!isOwner) {
      const userPlayers = await db.player.findMany({
        where: { accountId: payload.accountId },
        select: { id: true },
      });
      const userPlayerIds = userPlayers.map(p => p.id);

      const membership = await db.guildMember.findFirst({
        where: {
          player_id: { in: userPlayerIds },
          guild_id: guildId,
          rank: { level: { in: [1, 2] } },
        },
        include: { rank: true },
      });

      if (!membership) {
        return NextResponse.json({ success: false, error: 'No tienes permisos para expulsar miembros.' }, { status: 403 });
      }
    }

    // Find the member to kick
    const member = await db.guildMember.findUnique({
      where: { player_id: playerId },
      include: { player: true, rank: true },
    });

    if (!member || member.guild_id !== guildId) {
      return NextResponse.json({ success: false, error: 'El jugador no es miembro de esta guild.' }, { status: 404 });
    }

    // Cannot kick the leader
    const leaderRank = guild.ranks.find(r => r.level === 1);
    if (leaderRank && member.rank_id === leaderRank.id) {
      return NextResponse.json({ success: false, error: 'No puedes expulsar al líder de la guild.' }, { status: 400 });
    }

    // Cannot kick yourself
    const playerToKick = await db.player.findUnique({ where: { id: playerId } });
    if (playerToKick && playerToKick.accountId === payload.accountId) {
      return NextResponse.json({ success: false, error: 'No puedes expulsarte a ti mismo. Usa "Abandonar Guild".' }, { status: 400 });
    }

    await db.guildMember.delete({ where: { player_id: playerId } });

    return NextResponse.json({
      success: true,
      message: `¡${member.player.name} ha sido expulsado de la guild!`,
    });
  } catch (error) {
    console.error('Kick guild error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
