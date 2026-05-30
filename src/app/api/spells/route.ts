import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vocation = searchParams.get('vocation');
    const category = searchParams.get('category');

    const where: Record<string, unknown> = { hidden: false };
    if (vocation) where.vocations = { contains: vocation };
    if (category) where.category = parseInt(category);

    const spells = await db.spell.findMany({
      where,
      orderBy: { level: 'asc' },
    });

    return NextResponse.json({ success: true, data: spells });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error interno.' }, { status: 500 });
  }
}
