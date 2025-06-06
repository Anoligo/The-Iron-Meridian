import { Npc as BaseNpc } from '@/data/models/types';

export type NpcId = string;

export const RACES = [
  // Core Rulebook
  'Dwarf', 'Elf', 'Gnome', 'Goblin', 'Halfling', 'Human', 'Half-Elf', 'Half-Orc',
  // Advanced Player's Guide
  'Catfolk', 'Kobold', 'Orc', 'Tengu',
  // Lost Omens & Other Expansions
  'Aasimar', 'Beastkin', 'Changeling', 'Dhampir', 'Duskwalker', 'Fetchling', 
  'Fleshwarp', 'Gnoll', 'Hobgoblin', 'Ifrit', 'Kitsune', 'Leshy', 'Lizardfolk', 
  'Nagaji', 'Ratfolk', 'Shoony', 'Skeleton', 'Strix', 'Sylph', 'Tiefling', 'Undine',
  // Custom/Other
  'Other'
] as const;

export const CLASSES = [
  // Core Rulebook
  'Alchemist', 'Barbarian', 'Bard', 'Champion', 'Cleric', 'Druid', 'Fighter',
  'Monk', 'Ranger', 'Rogue', 'Sorcerer', 'Wizard',
  // Advanced Player's Guide
  'Investigator', 'Oracle', 'Swashbuckler', 'Witch',
  // Secrets of Magic
  'Magus', 'Summoner',
  // Guns & Gears
  'Gunslinger', 'Inventor',
  // Dark Archive
  'Psychic', 'Thaumaturge',
  // NPC/Non-adventurer
  'Commoner', 'Noble', 'Merchant', 'Guard', 'Criminal', 'Artisan', 'Scholar', 'Priest',
  'Soldier', 'Spy', 'Cultist', 'Adventurer', 'Mercenary', 'Sage', 'Healer', 'Entertainer'
] as const;

export type Race = typeof RACES[number];
export type Class = typeof CLASSES[number];

// Extend BaseNpc but override the fields with our more specific types
export interface Npc extends Omit<BaseNpc, 'race' | 'type' | 'name' | 'gender' | 'relationships'> {
  type: 'npc';
  name: string;
  race: Race;
  gender: string;
  relationships: Record<string, string>; // Relationship type by entity ID
  age?: number;
  class?: Class | string; // Allow custom classes
  level?: number;
  alignment?: string;
  occupation?: string;
  locationId?: string;
  factionId?: string;
  description: string;
  personality?: string;
  appearance?: string;
  notes?: string;
  isAlive: boolean;
  // Combat stats (optional for important NPCs)
  armorClass?: number;
  hitPoints?: number;
  speed?: number;
  // Ability scores (if needed)
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
}

// Form data type with all fields optional and proper defaults
export type NpcFormData = Partial<Omit<Npc, 'id' | 'type' | 'createdAt' | 'updatedAt'>> & {
  // Form-specific fields can be added here
  isPlayerCharacter?: boolean;
  isImportant?: boolean;
};

export interface NpcFilters {
  search?: string;
  race?: string;
  locationId?: string;
  isAlive?: boolean;
  factionId?: string;
}
