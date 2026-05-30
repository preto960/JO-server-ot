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
    const { name, description } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 30) {
      return NextResponse.json({ success: false, error: 'El nombre debe tener entre 3 y 30 caracteres.' }, { status: 400 });
    }

    const guildName = name.trim();

    // Check if name is already taken
    const existingGuild = await db.guild.findUnique({ where: { name: guildName } });
    if (existingGuild) {
      return NextResponse.json({ success: false, error: 'Ya existe una guild con ese nombre.' }, { status: 400 });
    }

    // Check if account already owns a guild
    const existingOwnedGuild = await db.guild.findFirst({ where: { ownerid: payload.accountId } });
    if (existingOwnedGuild) {
      return NextResponse.json({ success: false, error: 'Ya eres líder de otra guild.' }, { status: 400 });
    }

    // Find the first player of the account
    const player = await db.player.findFirst({
      where: { accountId: payload.accountId },
      orderBy: { level: 'desc' },
    });

    if (!player) {
      return NextResponse.json({ success: false, error: 'Necesitas al menos un personaje para crear una guild.' }, { status: 400 });
    }

    // Check if player is already in a guild
    const existingMembership = await db.guildMember.findUnique({ where: { player_id: player.id } });
    if (existingMembership) {
      return NextResponse.json({ success: false, error: `Tu personaje "${player.name}" ya pertenece a otra guild.` }, { status: 400 });
    }

    // Create guild with default ranks
    const guild = await db.guild.create({
      data: {
        name: guildName,
        ownerid: payload.accountId,
        description: description || '',
        ranks: {
          create: [
            { name: 'Líder', level: 1 },
            { name: 'Vice Líder', level: 2 },
            { name: 'Miembro', level: 3 },
          ],
        },
      },
      include: { ranks: true },
    });

    const leaderRank = guild.ranks.find(r => r.level === 1);
    if (leaderRank) {
      await db.guildMember.create({
        data: {
          player_id: player.id,
          guild_id: guild.id,
          rank_id: leaderRank.id,
          nick: '',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: guild.id,
        name: guild.name,
        description: guild.description,
        creationdata: guild.creationdata,
      },
    });
  } catch (error) {
    console.error('Create guild error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
