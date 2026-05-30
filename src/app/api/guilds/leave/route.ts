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
    const { guildId } = body;

    if (!guildId) {
      return NextResponse.json({ success: false, error: 'ID de guild requerido.' }, { status: 400 });
    }

    // Verify guild exists
    const guild = await db.guild.findUnique({
      where: { id: guildId },
      include: {
        ranks: { orderBy: { level: 'asc' } },
        members: {
          include: { rank: true },
        },
      },
    });

    if (!guild) {
      return NextResponse.json({ success: false, error: 'Guild no encontrada.' }, { status: 404 });
    }

    // Find all characters of this account
    const userPlayers = await db.player.findMany({
      where: { accountId: payload.accountId },
      select: { id: true, name: true },
    });

    if (userPlayers.length === 0) {
      return NextResponse.json({ success: false, error: 'No tienes personajes.' }, { status: 400 });
    }

    // Find which of the user's characters are in this guild
    const userPlayerIds = userPlayers.map(p => p.id);
    const userMemberships = guild.members.filter(m => userPlayerIds.includes(m.player_id));

    if (userMemberships.length === 0) {
      return NextResponse.json({ success: false, error: 'No perteneces a esta guild.' }, { status: 400 });
    }

    // Check if the user is the leader
    const isOwner = guild.ownerid === payload.accountId;

    if (isOwner) {
      // Check if there are other members
      const otherMembers = guild.members.filter(m => !userPlayerIds.includes(m.player_id));

      if (otherMembers.length === 0) {
        // No other members, delete the guild
        await db.guild.delete({ where: { id: guildId } });
        return NextResponse.json({ success: true, message: 'Guild disuelta porque no había otros miembros.' });
      }

      // Find a vice leader to transfer leadership to
      const viceLeader = otherMembers.find(m => m.rank.level === 2);
      if (!viceLeader) {
        // No vice leader, find any other member
        const newLeader = otherMembers[0];
        if (newLeader) {
          const leaderRank = guild.ranks.find(r => r.level === 1);
          const memberRank = guild.ranks.find(r => r.level === 3);

          // Transfer leadership
          await db.guild.update({
            where: { id: guildId },
            data: {
              ownerid: (await db.player.findUnique({ where: { id: newLeader.player_id } }))!.accountId,
            },
          });

          // Update ranks
          if (leaderRank) {
            await db.guildMember.update({
              where: { player_id: newLeader.player_id },
              data: { rank_id: leaderRank.id },
            });
          }

          // Remove all user characters from guild
          for (const membership of userMemberships) {
            await db.guildMember.delete({ where: { player_id: membership.player_id } });
          }

          return NextResponse.json({ success: true, message: 'Has abandonado la guild. La liderazgo fue transferida.' });
        }
      } else {
        const vicePlayer = await db.player.findUnique({ where: { id: viceLeader.player_id } });
        const leaderRank = guild.ranks.find(r => r.level === 1);
        const viceRank = guild.ranks.find(r => r.level === 2);

        // Transfer leadership
        await db.guild.update({
          where: { id: guildId },
          data: { ownerid: vicePlayer!.accountId },
        });

        if (leaderRank) {
          await db.guildMember.update({
            where: { player_id: viceLeader.player_id },
            data: { rank_id: leaderRank.id },
          });
        }

        // Remove all user characters from guild
        for (const membership of userMemberships) {
          await db.guildMember.delete({ where: { player_id: membership.player_id } });
        }

        return NextResponse.json({ success: true, message: 'Has abandonado la guild. La liderazgo fue transferida al Vice Líder.' });
      }
    }

    // Regular member or vice leader leaving
    for (const membership of userMemberships) {
      await db.guildMember.delete({ where: { player_id: membership.player_id } });
    }

    return NextResponse.json({ success: true, message: 'Has abandonado la guild.' });
  } catch (error) {
    console.error('Leave guild error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
