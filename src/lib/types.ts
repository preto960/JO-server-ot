// Vocation IDs
export enum Vocation {
  None = 0,
  Sorcerer = 1,
  Druid = 2,
  Paladin = 3,
  Knight = 4,
  MasterSorcerer = 5,
  ElderDruid = 6,
  RoyalPaladin = 7,
  EliteKnight = 8,
}

// Skill IDs
export enum SkillType {
  Fist = 0,
  Club = 1,
  Sword = 2,
  Axe = 3,
  Distance = 4,
  Shielding = 5,
  Fishing = 6,
  MagicLevel = 7,
}

// Player Groups
export enum PlayerGroup {
  Normal = 1,
  Tutor = 2,
  SeniorTutor = 3,
  GameMaster = 4,
  CommunityManager = 5,
  God = 6,
}

// Skull Types
export enum SkullType {
  None = 0,
  Yellow = 1,
  Green = 2,
  White = 3,
  Red = 4,
  Black = 5,
  Orange = 6,
}

// Ban Types
export enum BanType {
  IpBan = 1,
  PlayerBan = 2,
  AccountBan = 3,
  NameLock = 4,
  Notation = 5,
}

export const VOCATION_NAMES: Record<number, string> = {
  [Vocation.None]: 'Sin Vocación',
  [Vocation.Sorcerer]: 'Hechicero',
  [Vocation.Druid]: 'Druida',
  [Vocation.Paladin]: 'Paladín',
  [Vocation.Knight]: 'Caballero',
  [Vocation.MasterSorcerer]: 'Maestro Hechicero',
  [Vocation.ElderDruid]: 'Druida Mayor',
  [Vocation.RoyalPaladin]: 'Paladín Real',
  [Vocation.EliteKnight]: 'Caballero Élite',
};

export const VOCATION_SHORT: Record<number, string> = {
  [Vocation.None]: 'Ninguna',
  [Vocation.Sorcerer]: 'Sorcerer',
  [Vocation.Druid]: 'Druid',
  [Vocation.Paladin]: 'Paladin',
  [Vocation.Knight]: 'Knight',
  [Vocation.MasterSorcerer]: 'MS',
  [Vocation.ElderDruid]: 'ED',
  [Vocation.RoyalPaladin]: 'RP',
  [Vocation.EliteKnight]: 'EK',
};

export const SKILL_NAMES: Record<number, string> = {
  [SkillType.Fist]: 'Puño',
  [SkillType.Club]: 'Maza',
  [SkillType.Sword]: 'Espada',
  [SkillType.Axe]: 'Hacha',
  [SkillType.Distance]: 'Distancia',
  [SkillType.Shielding]: 'Escudo',
  [SkillType.Fishing]: 'Pesca',
  [SkillType.MagicLevel]: 'Nivel Mágico',
};

export const GROUP_NAMES: Record<number, string> = {
  [PlayerGroup.Normal]: 'Jugador',
  [PlayerGroup.Tutor]: 'Tutor',
  [PlayerGroup.SeniorTutor]: 'Tutor Senior',
  [PlayerGroup.GameMaster]: 'GameMaster',
  [PlayerGroup.CommunityManager]: 'Community Manager',
  [PlayerGroup.God]: 'Dios',
};

export const SKULL_COLORS: Record<number, string> = {
  [SkullType.None]: '',
  [SkullType.Yellow]: 'text-yellow-400',
  [SkullType.Green]: 'text-green-400',
  [SkullType.White]: 'text-white',
  [SkullType.Red]: 'text-red-500',
  [SkullType.Black]: 'text-gray-900',
  [SkullType.Orange]: 'text-orange-400',
};

export const BAN_TYPE_NAMES: Record<number, string> = {
  [BanType.IpBan]: 'Ban de IP',
  [BanType.PlayerBan]: 'Ban de Jugador',
  [BanType.AccountBan]: 'Ban de Cuenta',
  [BanType.NameLock]: 'Bloqueo de Nombre',
  [BanType.Notation]: 'Notación',
};

export const BAN_ACTION_NAMES: Record<number, string> = {
  1: 'Ban',
  2: 'Name Lock',
  3: 'Notation',
  4: 'Deletion',
};

export const SKULL_NAMES: Record<number, string> = {
  0: 'None',
  [SkullType.Yellow]: 'Yellow Skull',
  [SkullType.Green]: 'Green Skull',
  [SkullType.White]: 'White Skull',
  [SkullType.Red]: 'Red Skull',
  [SkullType.Black]: 'Black Skull',
  [SkullType.Orange]: 'Orange Skull',
};

export const PLAYER_GROUP_NAMES: Record<number, string> = {
  [PlayerGroup.Normal]: 'Player',
  [PlayerGroup.Tutor]: 'Tutor',
  [PlayerGroup.SeniorTutor]: 'Senior Tutor',
  [PlayerGroup.GameMaster]: 'Game Master',
  [PlayerGroup.CommunityManager]: 'Community Manager',
  [PlayerGroup.God]: 'God',
};

export const PLAYER_GROUP_COLORS: Record<number, string> = {
  [PlayerGroup.Normal]: 'text-foreground',
  [PlayerGroup.Tutor]: 'text-green-400',
  [PlayerGroup.SeniorTutor]: 'text-cyan-400',
  [PlayerGroup.GameMaster]: 'text-purple-400',
  [PlayerGroup.CommunityManager]: 'text-amber-400',
  [PlayerGroup.God]: 'text-red-400',
};

export const VOCATION_NAMES_EN: Record<number, string> = {
  [Vocation.None]: 'None',
  [Vocation.Sorcerer]: 'Sorcerer',
  [Vocation.Druid]: 'Druid',
  [Vocation.Paladin]: 'Paladin',
  [Vocation.Knight]: 'Knight',
  [Vocation.MasterSorcerer]: 'Master Sorcerer',
  [Vocation.ElderDruid]: 'Elder Druid',
  [Vocation.RoyalPaladin]: 'Royal Paladin',
  [Vocation.EliteKnight]: 'Elite Knight',
};

export const SPELL_CATEGORY_NAMES: Record<number, string> = {
  1: 'Attack',
  2: 'Healing',
  3: 'Support',
  4: 'Utility',
  5: 'Conjure',
};

// Extended Types for Components

export interface HighscoreEntry {
  rank: number;
  id: number;
  name: string;
  level: number;
  vocation: number;
  experience?: number;
  value?: number;
  maglevel?: number;
  guildMember?: { guild: { name: string } };
}

export interface OnlinePlayer {
  id: number;
  name: string;
  level: number;
  vocation: number;
  online: boolean;
  guildMember?: { guild: { name: string } };
}

export interface SpellInfo {
  id: number;
  name: string;
  words: string;
  category: number;
  type: number;
  level: number;
  maglevel: number;
  mana: number;
  vocation: string;
  vocations?: string;
}

export interface MonsterInfo {
  id: number;
  name: string;
  exp: number;
  health: number;
  mana: number;
  speedLvl: number;
  race: string;
  attackable: boolean;
  hostile: boolean;
  defense: number;
  armor: number;
  summonable: boolean;
  convinceable: boolean;
}

export interface BanInfo {
  id: number;
  type: number;
  action: number;
  value: string;
  active: boolean;
  expires: number;
  added: number;
  reason: string;
  comment: string;
  by: string;
}

export interface ForumBoardInfo {
  id: number;
  name: string;
  description: string;
  threadCount: number;
  threads: number;
  closed: boolean;
  hidden: boolean;
  lastPost?: {
    topic: string;
    date: number;
  };
}

export interface ForumThreadInfo {
  id: number;
  topic: string;
  postTopic: string;
  section: number;
  authorAid: number;
  authorGuid: number;
  author: string;
  postDate: number;
  lastPostDate: number;
  lastPost: number;
  replies: number;
  views: number;
  sticked: boolean;
  closed: boolean;
}

export interface AccountInfo {
  id: number;
  name: string;
  email: string;
  type: number;
  premDays: number;
  createdAt: string;
  coins: number;
  playerCount: number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  };
}

export interface AccountInfo {
  id: number;
  name: string;
  email: string;
  type: number;
  premDays: number;
  createdAt: Date;
  coins: number;
}

export interface PlayerInfo {
  id: number;
  name: string;
  accountId: number;
  level: number;
  groupId: number;
  vocation: number;
  experience: number;
  maglevel: number;
  sex: number;
  lastlogin: number;
  online: boolean;
  skills: PlayerSkillInfo[];
  guildMember?: GuildMemberInfo;
  deaths: PlayerDeathInfo[];
}

export interface PlayerSkillInfo {
  skillId: number;
  value: number;
}

export interface PlayerDeathInfo {
  id: number;
  date: Date;
  level: number;
}

export interface GuildMemberInfo {
  guildId: number;
  guildName: string;
  rankId: number;
  rankName: string;
  nick: string;
}

export interface GuildInfo {
  id: number;
  name: string;
  ownerName: string;
  creationdate: Date;
  motd: string;
  description: string;
  logoGfxName: string;
  memberCount: number;
  members: GuildMemberInfo[];
}

export interface NewsItem {
  id: number;
  title: string;
  body: string;
  type: number;
  date: number;
  category: number;
  articleText: string;
  articleImage: string;
}

export interface ForumThreadInfo {
  id: number;
  postTopic: string;
  section: number;
  authorAid: number;
  authorGuid: number;
  postDate: number;
  replies: number;
  views: number;
  lastPost: number;
  sticked: boolean;
  closed: boolean;
}

export type PageTab = 'home' | 'highscores' | 'online' | 'characters' | 'guilds' | 'spells' | 'creatures' | 'bans' | 'forum' | 'rules' | 'login' | 'register' | 'account' | 'admin' | 'news-archive' | 'faq' | 'gallery' | 'changelog' | 'polls' | 'server-info' | 'houses' | 'last-kills' | 'team' | 'commands' | 'bugs';
