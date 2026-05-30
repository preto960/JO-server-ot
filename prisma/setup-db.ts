import { execSync } from 'child_process';
import { existsSync, copyFileSync } from 'fs';
import { resolve } from 'path';

const dbType = process.env.DATABASE_TYPE || 
  (process.env.DATABASE_URL?.startsWith('mysql') ? 'mysql' : 'postgresql');

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
execSync('npx prisma generate', { stdio: 'inherit', cwd: resolve(__dirname, '..') });
console.log('Done!');
