import { Npc, NpcId, NpcFilters } from './types';
import { campaignService } from '@/data';
import { v4 as uuidv4 } from 'uuid';

// Helper to convert from data model to our app's Npc type
const toAppNpc = (data: any): Npc => {
  // Ensure all required fields have values
  return {
    id: data.id,
    type: 'npc',
    name: data.name || 'Unnamed NPC',
    description: data.description || '',
    race: data.race || 'Unknown',
    gender: data.gender || 'Unknown',
    age: data.age,
    occupation: data.occupation,
    locationId: data.locationId,
    factionId: data.factionId,
    personality: data.personality,
    appearance: data.appearance,
    notes: data.notes,
    isAlive: data.isAlive !== false, // Default to true if not specified
    relationships: data.relationships || {},
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
};

// Helper to convert to data model format
const toDataModel = (npc: Omit<Npc, 'id' | 'createdAt' | 'updatedAt' | 'type'>) => {
  return {
    ...npc,
    type: 'npc' as const,
    // Ensure required fields have values
    name: npc.name || 'Unnamed NPC',
    description: npc.description || '',
    race: npc.race || 'Unknown',
    gender: npc.gender || 'Unknown',
    isAlive: npc.isAlive !== false, // Default to true if not specified
    relationships: npc.relationships || {},
  };
};

export const npcService = {
  // Get all NPCs with optional filtering
  getNpcs: (filters?: NpcFilters): Npc[] => {
    const campaignData = campaignService.getCampaignData();
    const allNpcs = Object.values(campaignData.npcs || {}).map(toAppNpc);
    
    if (!filters) return allNpcs;
    
    return allNpcs.filter(npc => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          npc.name.toLowerCase().includes(searchLower) ||
          (npc.description && npc.description.toLowerCase().includes(searchLower)) ||
          (npc.notes && npc.notes.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }
      
      // Race filter
      if (filters.race && npc.race !== filters.race) {
        return false;
      }
      
      // Location filter
      if (filters.locationId && npc.locationId !== filters.locationId) {
        return false;
      }
      
      // Faction filter
      if (filters.factionId && npc.factionId !== filters.factionId) {
        return false;
      }
      
      // Alive status filter
      if (filters.isAlive !== undefined && npc.isAlive !== filters.isAlive) {
        return false;
      }
      
      return true;
    });
  },

  // Get a single NPC by ID
  getNpcById: (id: NpcId): Npc | undefined => {
    const npc = campaignService.getEntity('npc', id);
    return npc ? toAppNpc(npc) : undefined;
  },

  // Create a new NPC
  createNpc: (npcData: Omit<Npc, 'id' | 'createdAt' | 'updatedAt' | 'type'>): Npc => {
    return campaignService.createNpc(toDataModel(npcData));
  },

  // Update an existing NPC
  updateNpc: (
    id: NpcId, 
    npcData: Partial<Omit<Npc, 'id' | 'createdAt' | 'updatedAt' | 'type'>>
  ): Npc | undefined => {
    return campaignService.updateEntity('npc', id, npcData);
  },

  // Delete an NPC
  deleteNpc: (id: NpcId): boolean => {
    return campaignService.deleteEntity('npc', id);
  },

  // Get all unique races from existing NPCs
  getUniqueRaces: (): string[] => {
    const races = new Set<string>();
    const npcs = Object.values(campaignService.getCampaignData().npcs || {});
    
    npcs.forEach(npc => {
      if (npc.race) {
        races.add(npc.race);
      }
    });
    
    return Array.from(races).sort();
  },

  // Get all unique locations from existing NPCs
  getUniqueLocations: (): Array<{ id: string; name: string }> => {
    const locations = new Map<string, { id: string; name: string }>();
    const locationData = campaignService.getCampaignData().locations || {};
    
    // Get all unique location IDs from NPCs
    const npcs = Object.values(campaignService.getCampaignData().npcs || {});
    npcs.forEach(npc => {
      if (npc.locationId) {
        const location = locationData[npc.locationId];
        if (location) {
          locations.set(location.id, { id: location.id, name: location.name });
        }
      }
    });
    
    return Array.from(locations.values()).sort((a, b) => a.name.localeCompare(b.name));
  },

  // Get factions
  getFactions: () => {
    return campaignService.getCampaignData().factions || {};
  },
};
