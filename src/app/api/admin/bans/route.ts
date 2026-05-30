import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// POST - Create new ban
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
      return NextResponse.json({ success: false, error: 'Acceso denegado.' }, { status: 403 });
    }

    const body = await request.json();
    const { type, value, reason, duration, adminId } = body;

    if (!type || !value || !reason) {
      return NextResponse.json({ success: false, error: 'Tipo, valor y razón son requeridos.' }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);
    const ban = await db.ban.create({
      data: {
        type,
        value,
        reason,
        active: true,
        expires: duration ? now + duration : 0,
        added: now,
        admin_id: adminId || account.id,
        by: account.name,
        action: type,
        param: 0,
      },
    });

    return NextResponse.json({ success: true, data: ban }, { status: 201 });
  } catch (error) {
    console.error('Admin Bans POST error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}

// DELETE - Remove/inactivate ban
export async function DELETE(request: Request) {
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
    const id = parseInt(searchParams.get('id') || '0');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de ban requerido.' }, { status: 400 });
    }

    const ban = await db.ban.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ success: true, data: ban });
  } catch (error) {
    console.error('Admin Bans DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
