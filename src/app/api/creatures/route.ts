import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const monsters = await db.monster.findMany({
      where: { hidden: false },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, exp: true, health: true, mana: true, speedLvl: true, race: true, attackable: true, hostile: true },
    });
    return NextResponse.json({ success: true, data: monsters });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error interno.' }, { status: 500 });
  }
}
