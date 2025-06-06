export type EntityId = string;

export interface BaseEntity {
  id: EntityId;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface Faction extends BaseEntity {
  type: 'faction';
  members: EntityId[]; // NPC IDs
  headquarters?: EntityId; // Location ID
  relationships: {
    [factionId: string]: 'ally' | 'neutral' | 'enemy' | string;
  };
}

export interface Location extends BaseEntity {
  type: 'location';
  parentLocation?: EntityId; // For hierarchical locations
  subLocations: EntityId[];
  connectedLocations: EntityId[];
  notableNpcs: EntityId[];
  notableItems: EntityId[];
  coordinates?: {
    x: number;
    y: number;
    mapId?: string;
  };
}

export interface Npc extends BaseEntity {
  type: 'npc';
  race?: string; // Made optional to match our extended interface
  gender: string;
  age?: number;
  occupation?: string;
  locationId?: EntityId;
  factionId?: EntityId;
  isAlive: boolean;
  relationships: {
    [npcId: string]: 'friend' | 'ally' | 'rival' | 'enemy' | string;
  };
}

export interface Quest extends BaseEntity {
  type: 'quest';
  status: 'available' | 'in_progress' | 'completed' | 'failed';
  giverId?: EntityId; // NPC ID
  relatedQuests: EntityId[];
  relatedLocations: EntityId[];
  relatedNpcs: EntityId[];
  objectives: {
    description: string;
    completed: boolean;
  }[];
  rewards?: {
    experience?: number;
    items?: EntityId[];
    gold?: number;
  };
}

export interface Item extends BaseEntity {
  type: 'item';
  itemType: 'weapon' | 'armor' | 'consumable' | 'quest' | 'treasure' | 'other';
  quantity: number;
  weight?: number;
  value: number;
  properties: Record<string, any>;
  ownerId?: EntityId; // NPC or Location ID
}

export interface CampaignData {
  version: string;
  name: string;
  factions: Record<EntityId, Faction>;
  locations: Record<EntityId, Location>;
  npcs: Record<EntityId, Npc>;
  quests: Record<EntityId, Quest>;
  items: Record<EntityId, Item>;
  metadata: {
    createdAt: string;
    updatedAt: string;
    gameSystem?: string;
    gameMaster?: string;
    players?: string[];
  };
}

export type Entity = Faction | Location | Npc | Quest | Item;
export type EntityType = Entity['type'];

// Helper types for entity maps
export type EntityMap<T extends Entity> = Record<EntityId, T>;
export type EntityTypeMap = {
  faction: Faction;
  location: Location;
  npc: Npc;
  quest: Quest;
  item: Item;
};
