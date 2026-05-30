import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET - List all news with pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const [items, total] = await Promise.all([
      db.news.findMany({
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.news.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        total,
        limit,
      },
    });
  } catch (error) {
    console.error('Admin News GET error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}

// POST - Create news article (requires auth + admin)
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

    const account = await db.account.findUnique({
      where: { id: payload.accountId },
      select: { id: true, type: true, name: true },
    });

    if (!account || account.type < 4) {
      return NextResponse.json({ success: false, error: 'Acceso denegado. Se requiere rol de GameMaster o superior.' }, { status: 403 });
    }

    const body = await request.json();
    const { title, body: newsBody, type = 1, category = 0 } = body;

    if (!title || !newsBody) {
      return NextResponse.json({ success: false, error: 'Título y cuerpo son requeridos.' }, { status: 400 });
    }

    const news = await db.news.create({
      data: {
        title,
        body: newsBody,
        type,
        category,
        date: Math.floor(Date.now() / 1000),
        playerId: 0,
        lastModifiedBy: account.id,
        lastModifiedDate: Math.floor(Date.now() / 1000),
      },
    });

    return NextResponse.json({ success: true, data: news }, { status: 201 });
  } catch (error) {
    console.error('Admin News POST error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
