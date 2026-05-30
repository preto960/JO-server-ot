import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

// ============================================
// SHA-256 hashing (web auth - Next.js)
// ============================================

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function hashPasswordWithSalt(password: string, salt: string): string {
  return crypto.createHash('sha256').update(salt + password).digest('hex');
}

// ============================================
// SHA-1 hashing (game server - OTServBR/Canary)
// The C++ game server uses SHA-1 for password verification.
// login.php also uses SHA-1 via PHP's hash('sha1', ...).
// We must use SHA-1 so both the game API and C++ server can verify.
// ============================================

export function hashPasswordSHA1(password: string): string {
  return crypto.createHash('sha1').update(password).digest('hex');
}

export function hashPasswordSHA1WithSalt(password: string, salt: string): string {
  return crypto.createHash('sha1').update(salt + password).digest('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Detects hash algorithm by length and verifies accordingly.
 * SHA-1 = 40 chars (game server / legacy PHP)
 * SHA-256 = 64 chars (Next.js web)
 */
export function detectHashAlgorithm(hash: string): 'sha1' | 'sha256' {
  return hash.length === 40 ? 'sha1' : 'sha256';
}

/**
 * Verify password supporting both SHA-1 and SHA-256 hashes.
 * Auto-detects based on stored hash length.
 */
export function verifyPassword(password: string, storedHash: string, salt?: string): boolean {
  const algo = detectHashAlgorithm(storedHash);
  if (algo === 'sha1') {
    if (salt && salt.length > 0) {
      return hashPasswordSHA1WithSalt(password, salt) === storedHash;
    }
    return hashPasswordSHA1(password) === storedHash;
  }
  // SHA-256 (legacy Next.js accounts)
  if (salt && salt.length > 0) {
    return hashPasswordWithSalt(password, salt) === storedHash;
  }
  return hashPassword(password) === storedHash;
}

export interface TokenPayload {
  accountId: number;
  type: number;
}

export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  // Check cookie first
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/auth_token=([^;]+)/);
    if (match) return match[1];
  }
  // Check authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

// ============================================
// Game login helpers (for /api/game/login)
// ============================================

export function verifyGamePassword(password: string, storedHash: string, salt?: string): boolean {
  return verifyPassword(password, storedHash, salt);
}
