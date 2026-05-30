import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromRequest, verifyToken, hashPasswordSHA1, verifyPassword } from '@/lib/auth';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida.'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres.').max(40),
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
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.data;

    const account = await db.account.findUnique({
      where: { id: payload.accountId },
      select: { id: true, password: true, salt: true },
    });

    if (!account) {
      return NextResponse.json({ success: false, error: 'Cuenta no encontrada.' }, { status: 404 });
    }

    const valid = verifyPassword(currentPassword, account.password, account.salt || undefined);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Contraseña actual incorrecta.' }, { status: 401 });
    }

    const hashedNewPassword = hashPasswordSHA1(newPassword);

    await db.account.update({
      where: { id: payload.accountId },
      data: { password: hashedNewPassword, salt: null },
    });

    return NextResponse.json({ success: true, message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
