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
    const { guildId, playerName } = body;

    if (!guildId || !playerName || typeof playerName !== 'string' || !playerName.trim()) {
      return NextResponse.json({ success: false, error: 'Datos inválidos.' }, { status: 400 });
    }

    const playerInputName = playerName.trim();

    // Verify the guild exists
    const guild = await db.guild.findUnique({
      where: { id: guildId },
      include: { ranks: true },
    });

    if (!guild) {
      return NextResponse.json({ success: false, error: 'Guild no encontrada.' }, { status: 404 });
    }

    // Check if user is leader or vice leader
    const isOwner = guild.ownerid === payload.accountId;

    // If not the owner, check if any of the user's characters is a vice leader
    let isVice = false;
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

      if (membership && membership.rank.level <= 2) {
        isVice = true;
      }
    }

    if (!isOwner && !isVice) {
      return NextResponse.json({ success: false, error: 'No tienes permisos para invitar miembros.' }, { status: 403 });
    }

    // Find the player to invite
    const targetPlayer = await db.player.findUnique({
      where: { name: playerInputName },
    });

    if (!targetPlayer) {
      return NextResponse.json({ success: false, error: 'Jugador no encontrado.' }, { status: 404 });
    }

    // Check if player is already in a guild
    const existingMembership = await db.guildMember.findUnique({
      where: { player_id: targetPlayer.id },
    });

    if (existingMembership) {
      return NextResponse.json({ success: false, error: 'El jugador ya pertenece a una guild.' }, { status: 400 });
    }

    // Add player to guild as member (level 3)
    const memberRank = guild.ranks.find(r => r.level === 3);
    if (!memberRank) {
      return NextResponse.json({ success: false, error: 'La guild no tiene rango de miembro.' }, { status: 500 });
    }

    await db.guildMember.create({
      data: {
        player_id: targetPlayer.id,
        guild_id: guildId,
        rank_id: memberRank.id,
        nick: '',
      },
    });

    return NextResponse.json({
      success: true,
      message: `¡${targetPlayer.name} ha sido añadido a la guild!`,
    });
  } catch (error) {
    console.error('Invite guild error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
