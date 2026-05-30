import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { z } from 'zod';

const changeEmailSchema = z.object({
  newEmail: z.string().email('Email inválido.').max(255),
});

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
    const parsed = changeEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { newEmail } = parsed.data;

    // Check if email is already taken by another account
    const existing = await db.account.findFirst({
      where: { email: newEmail, NOT: { id: payload.accountId } },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'Este email ya está en uso por otra cuenta.' }, { status: 409 });
    }

    await db.account.update({
      where: { id: payload.accountId },
      data: { email: newEmail },
    });

    return NextResponse.json({ success: true, message: 'Email actualizado correctamente.' });
  } catch (error) {
    console.error('Change email error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
