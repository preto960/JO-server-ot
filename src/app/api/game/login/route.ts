import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { VOCATION_NAMES_EN } from '@/lib/types';
import { Prisma } from '@prisma/client';

// ============================================
// Game Server Configuration via Environment Variables
// These replace what login.php reads from config.lua
// ============================================

const GAME_CONFIG = {
  serverName: process.env.GAME_SERVER_NAME || 'OTServBR-Global',
  ip: process.env.GAME_SERVER_IP || '127.0.0.1',
  gamePort: parseInt(process.env.GAME_SERVER_PORT || '7172', 10),
  worldType: process.env.GAME_WORLD_TYPE || 'pvp', // pvp, no-pvp, pvp-enforced
  freePremium: process.env.GAME_FREE_PREMIUM === 'true' || process.env.GAME_FREE_PREMIUM === undefined,
  location: process.env.GAME_LOCATION || 'BRA', // BRA, EUR, USA
};

// ============================================
// Vocation mapping for game client (English names)
// This matches the $config['vocations'] array in MyAAC
// ============================================

const VOCATION_MAP: Record<number, string> = {
  0: 'None',
  1: 'Sorcerer',
  2: 'Druid',
  3: 'Paladin',
  4: 'Knight',
  5: 'Master Sorcerer',
  6: 'Elder Druid',
  7: 'Royal Paladin',
  8: 'Elite Knight',
};

// ============================================
// Error helper - matches login.php's sendError() format
// ============================================

function sendError(message: string, code = 3) {
  return NextResponse.json(
    { errorCode: code, errorMessage: message },
    { status: code === 3 ? 401 : 400 }
  );
}

// ============================================
// POST handler - replaces login.php
// The Tibia client sends JSON POST with a "type" field
// ============================================

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.type || '';

    switch (action) {
      case 'cacheinfo':
        return handleCacheInfo();
      case 'eventschedule':
        return handleEventSchedule();
      case 'boostedcreature':
        return handleBoostedCreature();
      case 'login':
        return handleLogin(body);
      default:
        return sendError(`Unrecognized event ${action}.`);
    }
  } catch (error) {
    console.error('[Game Login API] Error:', error);
    return sendError('Internal server error.', 3);
  }
}

// ============================================
// cacheinfo - returns players online count
// Tibia client calls this to show online count on login screen
// ============================================

async function handleCacheInfo() {
  try {
    const onlineCount = await db.player.count({
      where: { online: true },
    });

    return NextResponse.json({
      playersonline: onlineCount,
      twitchstreams: 0,
      twitchviewer: 0,
      gamingyoutubestreams: 0,
      gamingyoutubeviewer: 0,
    });
  } catch {
    return NextResponse.json({
      playersonline: 0,
      twitchstreams: 0,
      twitchviewer: 0,
      gamingyoutubestreams: 0,
      gamingyoutubeviewer: 0,
    });
  }
}

// ============================================
// eventschedule - returns scheduled in-game events
// Reads from events.xml if the file exists on the game server
// Falls back to empty list if not available
// ============================================

async function handleEventSchedule() {
  // In a production setup, you can either:
  // 1. Read the events.xml from the game server path
  // 2. Store events in the database
  // 3. Return empty (the client handles this gracefully)
  return NextResponse.json({
    eventlist: [],
    lastupdatetimestamp: Math.floor(Date.now() / 1000),
  });
}

// ============================================
// boostedcreature - returns boosted creature/boss info
// Queries boosted_creature and boosted_boss tables (OTServBR)
// Falls back to defaults if tables don't exist
// ============================================

async function handleBoostedCreature() {
  try {
    const boostedRows: any[] = await db.$queryRaw`
      SELECT raceid FROM boosted_creature LIMIT 1
    `;
    const bossRows: any[] = await db.$queryRaw`
      SELECT raceid FROM boosted_boss LIMIT 1
    `;

    const creatureId = boostedRows.length > 0 ? Number(boostedRows[0].raceid) : 0;
    const bossId = bossRows.length > 0 ? Number(bossRows[0].raceid) : 0;

    return NextResponse.json({
      boostedcreature: true,
      creatureraceid: creatureId,
      bossraceid: bossId,
    });
  } catch {
    // Tables don't exist yet (server hasn't run), return defaults
    return NextResponse.json({
      boostedcreature: true,
      creatureraceid: 0,
      bossraceid: 0,
    });
  }
}

// ============================================
// login - THE MAIN AUTHENTICATION HANDLER
// Validates credentials and returns session + character list
// This is the exact replacement for login.php's case 'login'
// ============================================

async function handleLogin(body: Record<string, any>) {
  const inputEmail = body.email || false;
  const inputAccountName = body.accountname || false;
  const inputPassword = body.password || '';
  const inputToken = body.token || false;

  if (!inputEmail && !inputAccountName) {
    return sendError('Account name or email is required.');
  }

  if (!inputPassword) {
    return sendError('Password is required.');
  }

  // ------------------------------------------
  // 1. Find the account by email or name
  // ------------------------------------------
  const account = await db.account.findFirst({
    where: {
      OR: [
        ...(inputEmail ? [{ email: String(inputEmail) }] : []),
        ...(inputAccountName ? [{ name: String(inputAccountName) }] : []),
      ],
    },
  });

  if (!account) {
    return sendError(`${inputEmail ? 'Email' : 'Account name'} or password is not correct.`);
  }

  // ------------------------------------------
  // 2. Verify password
  // Supports both SHA-1 (game server) and SHA-256 (Next.js web)
  // ------------------------------------------
  const passwordValid = verifyPassword(
    inputPassword,
    account.password,
    account.salt || undefined
  );

  if (!passwordValid) {
    return sendError(`${inputEmail ? 'Email' : 'Account name'} or password is not correct.`);
  }

  // ------------------------------------------
  // 3. Build world info
  // Matches the $world array in login.php
  // ------------------------------------------
  const pvpTypeMap: Record<string, number> = {
    'pvp': 0,
    'no-pvp': 1,
    'pvp-enforced': 2,
  };

  const world = {
    id: 0,
    name: GAME_CONFIG.serverName,
    externaladdress: GAME_CONFIG.ip,
    externalport: GAME_CONFIG.gamePort,
    externaladdressprotected: GAME_CONFIG.ip,
    externalportprotected: GAME_CONFIG.gamePort,
    externaladdressunprotected: GAME_CONFIG.ip,
    externalportunprotected: GAME_CONFIG.gamePort,
    previewstate: 0,
    location: GAME_CONFIG.location,
    anticheatprotection: false,
    pvptype: pvpTypeMap[GAME_CONFIG.worldType] ?? 0,
    istournamentworld: false,
    restrictedstore: false,
    currenttournamentphase: 2,
  };

  // ------------------------------------------
  // 4. Get player characters for this account
  // Matches the SELECT query in login.php
  // ------------------------------------------
  const players = await db.player.findMany({
    where: {
      accountId: account.id,
      deletion: { not: 1 },
    },
    select: {
      id: true,
      name: true,
      level: true,
      sex: true,
      vocation: true,
      looktype: true,
      lookhead: true,
      lookbody: true,
      looklegs: true,
      lookfeet: true,
      lookaddons: true,
    },
  });

  // ------------------------------------------
  // 5. Determine highest level character (ismaincharacter)
  // ------------------------------------------
  let highestLevelId = 0;
  let highestLevel = 0;
  for (const p of players) {
    if (p.level >= highestLevel) {
      highestLevel = p.level;
      highestLevelId = p.id;
    }
  }

  // ------------------------------------------
  // 6. Build character list (playdata format)
  // Matches create_char() function in login.php
  // ------------------------------------------
  const characters = players.map((p) => ({
    worldid: 0,
    name: p.name,
    ismale: p.sex === 1,
    tutorial: false, // istutorial not in Prisma schema, default false
    level: p.level,
    vocation: VOCATION_MAP[p.vocation] || VOCATION_NAMES_EN[p.vocation] || 'None',
    outfitid: p.looktype,
    headcolor: p.lookhead,
    torsocolor: p.lookbody,
    legscolor: p.looklegs,
    detailcolor: p.lookfeet,
    addonsflags: p.lookaddons,
    ishidden: false,
    istournamentparticipant: false,
    ismaincharacter: highestLevelId === p.id,
    dailyrewardstate: 0,
    remainingdailytournamentplaytime: 0,
  }));

  // ------------------------------------------
  // 7. Update premium days (same logic as login.php)
  // Decrements premium based on elapsed time since last login
  // ------------------------------------------
  await updatePremiumDays(account.id, account.premDays, account.lastDay);

  // ------------------------------------------
  // 8. Build session key
  // Format: "email\npassword" (OTServBR/Canary with istutorial)
  // OR: "email\npassword\n" + timestamp (TFS 1.x without istutorial)
  // ------------------------------------------
  const accountIdentifier = inputEmail ? String(inputEmail) : String(inputAccountName);
  let sessionKey = `${accountIdentifier}\n${inputPassword}`;

  // OTServBR format: no extra newline, no timestamp
  // (login.php adds extra fields only if istutorial doesn't exist in players table)
  // Since we're using OTServBR/Canary which HAS istutorial, we use the simpler format.

  // ------------------------------------------
  // 9. Build final response
  // Must match EXACTLY what login.php returns
  // ------------------------------------------
  const session = {
    sessionkey: sessionKey,
    lastlogintime: 0,
    ispremium: GAME_CONFIG.freePremium || account.premDays > 0,
    premiumuntil: account.premDays > 0 ? Math.floor(Date.now() / 1000) + (account.premDays * 86400) : 0,
    status: 'active', // active, frozen, suspended
    returnernotification: false,
    showrewardnews: true,
    isreturner: true,
    fpstracking: false,
    optiontracking: false,
    tournamentticketpurchasestate: 0,
    emailcoderequest: false,
  };

  const playdata = {
    worlds: [world],
    characters,
  };

  return NextResponse.json({ session, playdata });
}

// ============================================
// Premium days management
// Replicates the exact logic from login.php lines 187-224
// ------------------------------------------
// Decrements premium days based on time elapsed since lastday
// This runs on every login, same as the PHP version
// ============================================

async function updatePremiumDays(accountId: number, premDays: number, lastDay: number) {
  try {
    if (premDays === 0 || premDays === 2147483647) {
      // PHP_INT_MAX - permanent premium, skip
      if (lastDay !== 0) {
        await db.account.update({
          where: { id: accountId },
          data: { lastDay: 0 },
        });
      }
      return;
    }

    const timeNow = Math.floor(Date.now() / 1000);
    let newPremDays = premDays;
    let newLastDay = lastDay;
    let save = false;

    if (lastDay === 0) {
      newLastDay = timeNow;
      save = true;
    } else {
      const days = Math.floor((timeNow - lastDay) / 86400);
      if (days > 0) {
        if (days >= newPremDays) {
          newPremDays = 0;
          newLastDay = 0;
        } else {
          newPremDays -= days;
          const reminder = (timeNow - lastDay) % 86400;
          newLastDay = timeNow - reminder;
        }
        save = true;
      }
    }

    if (save) {
      await db.account.update({
        where: { id: accountId },
        data: {
          premDays: newPremDays,
          lastDay: newLastDay,
        },
      });
    }
  } catch (error) {
    console.error('[Game Login API] Error updating premium days:', error);
  }
}
