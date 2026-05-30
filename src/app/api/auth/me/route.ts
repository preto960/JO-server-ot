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
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        premDays: true,
        coins: true,
        createdAt: true,
        players: {
          select: { id: true, name: true, level: true, vocation: true, online: true },
          orderBy: { level: 'desc' },
        },
      },
    });

    if (!account) {
      return NextResponse.json({ success: false, error: 'Cuenta no encontrada.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: account });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
