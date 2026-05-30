import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const guilds = await db.guild.findMany({
      include: {
        members: { select: { player_id: true } },
        account: { select: { name: true } },
      },
      orderBy: { creationdata: 'desc' },
    });

    const data = guilds.map(g => ({
      id: g.id,
      name: g.name,
      ownerName: g.account.name,
      creationdate: g.creationdata,
      motd: g.motd,
      description: g.description,
      logoGfxName: g.logo_gfx_name,
      memberCount: g.members.length,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error interno.' }, { status: 500 });
  }
}
