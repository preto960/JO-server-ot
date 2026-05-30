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
    const { guildId, motd, description, logoName } = body;

    if (!guildId) {
      return NextResponse.json({ success: false, error: 'ID de guild requerido.' }, { status: 400 });
    }

    // Verify guild exists
    const guild = await db.guild.findUnique({ where: { id: guildId } });
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
        return NextResponse.json({ success: false, error: 'No tienes permisos para editar esta guild.' }, { status: 403 });
      }
    }

    // Build update data
    const updateData: Record<string, string> = {};
    if (motd !== undefined && typeof motd === 'string') {
      if (motd.length > 255) {
        return NextResponse.json({ success: false, error: 'El MOTD no puede superar los 255 caracteres.' }, { status: 400 });
      }
      updateData.motd = motd;
    }
    if (description !== undefined && typeof description === 'string') {
      updateData.description = description;
    }
    if (logoName !== undefined && typeof logoName === 'string') {
      if (logoName.length > 100) {
        return NextResponse.json({ success: false, error: 'El nombre del logo no puede superar los 100 caracteres.' }, { status: 400 });
      }
      updateData.logo_gfx_name = logoName;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: 'No hay campos para actualizar.' }, { status: 400 });
    }

    const updatedGuild = await db.guild.update({
      where: { id: guildId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Guild actualizada.',
      data: {
        id: updatedGuild.id,
        name: updatedGuild.name,
        motd: updatedGuild.motd,
        description: updatedGuild.description,
        logo_gfx_name: updatedGuild.logo_gfx_name,
      },
    });
  } catch (error) {
    console.error('Update guild error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
