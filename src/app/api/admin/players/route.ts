import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Token inválido.' }, { status: 401 });
    }

    const account = await db.account.findUnique({
      where: { id: payload.accountId },
      select: { id: true, type: true },
    });

    if (!account || account.type < 4) {
      return NextResponse.json({ success: false, error: 'Acceso denegado.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [players, total] = await Promise.all([
      db.player.findMany({
        where,
        select: {
          id: true,
          name: true,
          level: true,
          vocation: true,
          online: true,
          accountId: true,
          group_id: true,
          lastlogin: true,
          account: {
            select: { name: true },
          },
        },
        orderBy: { level: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.player.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: players,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        total,
        limit,
      },
    });
  } catch (error) {
    console.error('Admin Players error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
