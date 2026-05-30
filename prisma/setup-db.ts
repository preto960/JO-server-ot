import { execSync } from 'child_process';
import { existsSync, copyFileSync, readFileSync } from 'fs';
import { resolve } from 'path';

// ====== Load .env file manually (tsx doesn't auto-load it) ======
const rootDir = resolve(__dirname, '..');
const envFile = resolve(rootDir, '.env');
if (existsSync(envFile)) {
  const envContent = readFileSync(envFile, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
  console.log(`Loaded environment from ${envFile}`);
} else {
  console.log('No .env file found, using system environment variables.');
}

// ====== Detect database type ======
const dbType = process.env.DATABASE_TYPE ||
  (process.env.DATABASE_URL?.startsWith('mysql') ? 'mysql' : 'postgresql');

console.log(`Detected DATABASE_TYPE: ${dbType}`);

const prismaDir = resolve(__dirname);
const schemaFile = resolve(prismaDir, 'schema.prisma');

let sourceSchema: string;
if (dbType === 'mysql') {
  sourceSchema = resolve(prismaDir, 'schema.mysql.prisma');
  console.log('Using MySQL schema...');
} else {
  sourceSchema = resolve(prismaDir, 'schema.postgresql.prisma');
  console.log('Using PostgreSQL schema...');
}

if (!existsSync(sourceSchema)) {
  console.error(`Schema file not found: ${sourceSchema}`);
  process.exit(1);
}

copyFileSync(sourceSchema, schemaFile);
console.log(`Copied ${sourceSchema} -> ${schemaFile}`);

console.log('Generating Prisma Client...');
execSync('npx prisma generate', { stdio: 'inherit', cwd: rootDir });
console.log('Done!');
