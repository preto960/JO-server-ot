import { SKILL_NAMES, VOCATION_NAMES, VOCATION_NAMES_EN, Vocation } from './types';

export function getVocationConfig(vocationId: number) {
  const configs: Record<number, {
    name: string;
    hpPerLevel: number;
    mpPerLevel: number;
    capGain: number;
    skillMultipliers: Record<number, number>;
    manaMultiplier: number;
  }> = {
    [Vocation.None]: { name: 'Ninguna', hpPerLevel: 5, mpPerLevel: 5, capGain: 10, skillMultipliers: { 0: 1.1, 1: 1.1, 2: 1.1, 3: 1.1, 4: 1.2, 5: 1.1, 6: 1.1 }, manaMultiplier: 4.0 },
    [Vocation.Sorcerer]: { name: 'Hechicero', hpPerLevel: 5, mpPerLevel: 30, capGain: 10, skillMultipliers: { 0: 1.5, 1: 1.8, 2: 1.8, 3: 1.8, 4: 1.4, 5: 1.5, 6: 1.1 }, manaMultiplier: 1.1 },
    [Vocation.Druid]: { name: 'Druida', hpPerLevel: 5, mpPerLevel: 30, capGain: 10, skillMultipliers: { 0: 1.5, 1: 1.8, 2: 1.8, 3: 1.8, 4: 1.4, 5: 1.5, 6: 1.1 }, manaMultiplier: 1.1 },
    [Vocation.Paladin]: { name: 'Paladín', hpPerLevel: 10, mpPerLevel: 15, capGain: 20, skillMultipliers: { 0: 1.2, 1: 1.2, 2: 1.2, 3: 1.2, 4: 1.1, 5: 1.2, 6: 1.1 }, manaMultiplier: 1.4 },
    [Vocation.Knight]: { name: 'Caballero', hpPerLevel: 15, mpPerLevel: 5, capGain: 25, skillMultipliers: { 0: 1.1, 1: 1.1, 2: 1.1, 3: 1.1, 4: 1.4, 5: 1.1, 6: 1.1 }, manaMultiplier: 3.0 },
    [Vocation.MasterSorcerer]: { name: 'Maestro Hechicero', hpPerLevel: 5, mpPerLevel: 30, capGain: 10, skillMultipliers: { 0: 1.5, 1: 1.8, 2: 1.8, 3: 1.8, 4: 1.4, 5: 1.5, 6: 1.1 }, manaMultiplier: 1.1 },
    [Vocation.ElderDruid]: { name: 'Druida Mayor', hpPerLevel: 5, mpPerLevel: 30, capGain: 10, skillMultipliers: { 0: 1.5, 1: 1.8, 2: 1.8, 3: 1.8, 4: 1.4, 5: 1.5, 6: 1.1 }, manaMultiplier: 1.1 },
    [Vocation.RoyalPaladin]: { name: 'Paladín Real', hpPerLevel: 10, mpPerLevel: 15, capGain: 20, skillMultipliers: { 0: 1.2, 1: 1.2, 2: 1.2, 3: 1.2, 4: 1.1, 5: 1.2, 6: 1.1 }, manaMultiplier: 1.4 },
    [Vocation.EliteKnight]: { name: 'Caballero Élite', hpPerLevel: 15, mpPerLevel: 5, capGain: 25, skillMultipliers: { 0: 1.1, 1: 1.1, 2: 1.1, 3: 1.1, 4: 1.4, 5: 1.1, 6: 1.1 }, manaMultiplier: 3.0 },
  };
  return configs[vocationId] || configs[Vocation.None];
}

export function getSkillName(skillId: number): string {
  return SKILL_NAMES[skillId] || 'Desconocido';
}

export function getVocationName(vocationId: number): string {
  return VOCATION_NAMES[vocationId] || 'Desconocido';
}

export function formatNumber(n: number): string {
  return n.toLocaleString('es-ES');
}

export function getExpForLevel(level: number): number {
  return Math.floor(50 * (level - 1) * (level - 1) * (level - 1) / 3 + 50 * (level - 1) * (level - 1) + 100 * (level - 1));
}

export function getLevelForExp(exp: number): number {
  let level = 1;
  while (getExpForLevel(level + 1) <= exp) level++;
  return level;
}

export function getVocationColor(vocationId: number): string {
  const colors: Record<number, string> = {
    [Vocation.None]: 'text-muted-foreground',
    [Vocation.Sorcerer]: 'text-red-400',
    [Vocation.Druid]: 'text-green-400',
    [Vocation.Paladin]: 'text-amber-400',
    [Vocation.Knight]: 'text-cyan-400',
    [Vocation.MasterSorcerer]: 'text-red-400',
    [Vocation.ElderDruid]: 'text-green-400',
    [Vocation.RoyalPaladin]: 'text-amber-400',
    [Vocation.EliteKnight]: 'text-cyan-400',
  };
  return colors[vocationId] || 'text-muted-foreground';
}

export { VOCATION_NAMES_EN };
