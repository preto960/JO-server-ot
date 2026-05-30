import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { z } from 'zod';

const deleteCharacterSchema = z.object({
  characterId: z.number().int().positive('ID de personaje inválido.'),
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
    const parsed = deleteCharacterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { characterId } = parsed.data;

    // Verify character belongs to the logged-in account
    const character = await db.player.findUnique({
      where: { id: characterId },
      select: { id: true, accountId: true, name: true, deletion: true },
    });

    if (!character) {
      return NextResponse.json({ success: false, error: 'Personaje no encontrado.' }, { status: 404 });
    }

    if (character.accountId !== payload.accountId) {
      return NextResponse.json({ success: false, error: 'No tienes permiso para eliminar este personaje.' }, { status: 403 });
    }

    if (character.deletion !== -1) {
      return NextResponse.json({ success: false, error: 'Este personaje ya está marcado para eliminación.' }, { status: 400 });
    }

    // Set deletion to current timestamp + 7 days
    const deletionTimestamp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);

    await db.player.update({
      where: { id: characterId },
      data: { deletion: deletionTimestamp },
    });

    const deletionDate = new Date(deletionTimestamp * 1000);

    return NextResponse.json({
      success: true,
      message: `Personaje "${character.name}" marcado para eliminación. Se eliminará el ${deletionDate.toLocaleDateString('es-ES')}.`,
    });
  } catch (error) {
    console.error('Delete character error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
