import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skill = parseInt(searchParams.get('skill') || '0'); // 0=experience, 7=magic level, 1-6=skills
    const vocation = parseInt(searchParams.get('vocation') || '0');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    let where: Record<string, unknown> = { hidden: false, deletion: { lt: 0 } };

    if (vocation > 0) {
      where = { ...where, vocation };
    }

    if (skill === 0) {
      // Experience highscores
      const [players, total] = await Promise.all([
        db.player.findMany({
          where,
          orderBy: { experience: 'desc' },
          select: { id: true, name: true, level: true, vocation: true, experience: true, guildMember: { include: { guild: { select: { name: true } }, rank: { select: { name: true, level: true } } } } },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.player.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: players.map((p, i) => ({ ...p, rank: (page - 1) * limit + i + 1 })),
        pagination: { page, totalPages: Math.ceil(total / limit), total, limit },
      });
    }

    if (skill === 7) {
      // Magic level
      const players = await db.player.findMany({
        where,
        orderBy: { maglevel: 'desc' },
        select: { id: true, name: true, level: true, vocation: true, maglevel: true, guildMember: { include: { guild: { select: { name: true } }, rank: { select: { name: true, level: true } } } } },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await db.player.count({ where });

      return NextResponse.json({
        success: true,
        data: players.map((p, i) => ({ ...p, rank: (page - 1) * limit + i + 1, value: p.maglevel })),
        pagination: { page, totalPages: Math.ceil(total / limit), total, limit },
      });
    }

    // Regular skills
    const players = await db.player.findMany({
      where,
      select: {
        id: true, name: true, level: true, vocation: true,
        skills: { where: { skillid: skill } },
        guildMember: { include: { guild: { select: { name: true } }, rank: { select: { name: true, level: true } } } },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const filtered = players
      .filter(p => p.skills.length > 0)
      .sort((a, b) => (b.skills[0]?.value || 0) - (a.skills[0]?.value || 0))
      .map((p, i) => ({ ...p, rank: i + 1, value: p.skills[0]?.value || 0 }));

    const total = await db.player.count({ where });

    return NextResponse.json({
      success: true,
      data: filtered,
      pagination: { page, totalPages: Math.ceil(total / limit), total, limit },
    });
  } catch (error) {
    console.error('Highscores API error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
