import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    const [bans, total] = await Promise.all([
      db.ban.findMany({
        where: { active: true },
        orderBy: { added: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.ban.count({ where: { active: true } }),
    ]);

    return NextResponse.json({
      success: true,
      data: bans,
      pagination: { page, totalPages: Math.ceil(total / limit), total, limit },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error interno.' }, { status: 500 });
  }
}
