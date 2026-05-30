import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { z } from 'zod';

const MAX_PLAYERS_PER_ACCOUNT = 15;

const createCharacterSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.').max(25, 'El nombre no puede superar 25 caracteres.'),
  vocation: z.number().int().min(0, 'Vocación inválida.').max(8, 'Vocación inválida.'),
  sex: z.number().int().min(0, 'Sexo inválido.').max(1, 'Sexo inválido.'),
});

const VOCATION_IDS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

const DEFAULT_SKILLS = [
  { skillid: 0, value: 10, count: 0 }, // Fist
  { skillid: 1, value: 10, count: 0 }, // Club
  { skillid: 2, value: 10, count: 0 }, // Sword
  { skillid: 3, value: 10, count: 0 }, // Axe
  { skillid: 4, value: 10, count: 0 }, // Distance
  { skillid: 5, value: 10, count: 0 }, // Shielding
  { skillid: 6, value: 10, count: 0 }, // Fishing
  { skillid: 7, value: 0, count: 0 },  // Magic Level
];

// Default stats per vocation
function getDefaultStats(vocation: number) {
  const defaults: Record<number, { health: number; healthmax: number; mana: number; manamax: number; cap: number }> = {
    0: { health: 150, healthmax: 150, mana: 0, manamax: 0, cap: 400 },    // None
    1: { health: 145, healthmax: 145, mana: 90, manamax: 90, cap: 390 },    // Sorcerer
    2: { health: 145, healthmax: 145, mana: 90, manamax: 90, cap: 395 },    // Druid
    3: { health: 185, healthmax: 185, mana: 40, manamax: 40, cap: 470 },    // Paladin
    4: { health: 185, healthmax: 185, mana: 0, manamax: 0, cap: 470 },      // Knight
    5: { health: 145, healthmax: 145, mana: 90, manamax: 90, cap: 390 },    // Master Sorcerer
    6: { health: 145, healthmax: 145, mana: 90, manamax: 90, cap: 395 },    // Elder Druid
    7: { health: 185, healthmax: 185, mana: 40, manamax: 40, cap: 470 },    // Royal Paladin
    8: { health: 185, healthmax: 185, mana: 0, manamax: 0, cap: 470 },      // Elite Knight
  };
  return defaults[vocation] || defaults[0];
}

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
    const parsed = createCharacterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, vocation, sex } = parsed.data;

    if (!VOCATION_IDS.includes(vocation)) {
      return NextResponse.json({ success: false, error: 'Vocación inválida.' }, { status: 400 });
    }

    // Check player count limit
    const playerCount = await db.player.count({
      where: { accountId: payload.accountId, deletion: -1 },
    });

    if (playerCount >= MAX_PLAYERS_PER_ACCOUNT) {
      return NextResponse.json({ success: false, error: `No puedes tener más de ${MAX_PLAYERS_PER_ACCOUNT} personajes.` }, { status: 400 });
    }

    // Check if name is taken
    const existingName = await db.player.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existingName) {
      return NextResponse.json({ success: false, error: 'Este nombre ya está en uso.' }, { status: 409 });
    }

    const stats = getDefaultStats(vocation);

    // Look type based on sex and vocation
    const looktype = sex === 1 ? 136 : 128;

    const player = await db.player.create({
      data: {
        name,
        accountId: payload.accountId,
        vocation,
        sex,
        level: 1,
        experience: 0,
        maglevel: 0,
        health: stats.health,
        healthmax: stats.healthmax,
        mana: stats.mana,
        manamax: stats.manamax,
        cap: stats.cap,
        town_id: 1,
        looktype,
        lookbody: 0,
        lookfeet: 0,
        lookhead: 0,
        looklegs: 0,
        lookaddons: 0,
        lookmount: 0,
        deletion: -1,
        group_id: 1,
        posx: 0,
        posy: 0,
        posz: 0,
        soul: 0,
        lastlogin: 0,
        lastip: '',
        save: true,
        skull: 0,
        skulltime: 0,
        comment: '',
        hidden: false,
        online: false,
        balance: 0,
        offlinetraining_time: 43200,
        offlinetraining_skill: -1,
        skills: {
          createMany: {
            data: DEFAULT_SKILLS,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Personaje "${name}" creado exitosamente.`,
      data: {
        id: player.id,
        name: player.name,
        vocation: player.vocation,
        sex: player.sex,
        level: player.level,
      },
    });
  } catch (error) {
    console.error('Create character error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
