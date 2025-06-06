import { v4 as uuidv4 } from 'uuid';
import { 
  CampaignData, 
  Entity, 
  EntityId, 
  EntityType,
  EntityTypeMap,
  BaseEntity,
  Faction,
  Location,
  Npc,
  Quest,
  Item
} from '../models/types';

const STORAGE_KEY = 'campaignData';
const DATA_VERSION = '1.0.0';

class CampaignService {
  private data: CampaignData;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.data = this.loadData();
    this.setupAutoSave();
  }

  // Initialize with default data structure
  private getInitialData(): CampaignData {
    const now = new Date().toISOString();
    return {
      version: DATA_VERSION,
      name: 'New Campaign',
      factions: {},
      locations: {},
      npcs: {},
      quests: {},
      items: {},
      metadata: {
        createdAt: now,
        updatedAt: now,
        gameSystem: 'Pathfinder 2e',
        gameMaster: '',
        players: []
      }
    };
  }

  // Load data from localStorage or initialize new
  private loadData(): CampaignData {
    if (typeof window === 'undefined') {
      return this.getInitialData();
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // TODO: Add data migration if version changes
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load campaign data:', error);
    }
    
    return this.getInitialData();
  }

  // Save data to localStorage
  private saveData() {
    if (typeof window === 'undefined') return;
    
    try {
      this.data.metadata.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save campaign data:', error);
    }
  }

  // Setup auto-save on changes
  private setupAutoSave() {
    // Auto-save when page unloads
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.saveData());
    }
  }

  // Notify all listeners that data has changed
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Subscribe to data changes
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Get the entire campaign data
  getCampaignData(): CampaignData {
    return { ...this.data };
  }

  // Update the entire campaign data (useful for imports)
  setCampaignData(data: Partial<CampaignData>) {
    this.data = {
      ...this.getInitialData(),
      ...data,
      metadata: {
        ...this.getInitialData().metadata,
        ...data.metadata
      }
    };
    this.notifyListeners();
    this.saveData();
  }

  // Export campaign data as JSON string
  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  // Import campaign data from JSON string
  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      this.setCampaignData(data);
      return true;
    } catch (error) {
      console.error('Failed to import campaign data:', error);
      return false;
    }
  }

  // Generic entity CRUD operations
  private getEntityCollection<T extends Entity>(type: T['type']): Record<EntityId, T> {
    return (this.data as any)[`${type}s`] as Record<EntityId, T>;
  }

  createEntity<T extends Entity>(type: T['type'], entity: Omit<T, 'id' | 'type' | 'createdAt' | 'updatedAt'>): T {
    const now = new Date().toISOString();
    const newEntity = {
      ...entity,
      id: uuidv4(),
      type,
      createdAt: now,
      updatedAt: now,
    } as T;

    const collection = this.getEntityCollection<T>(type);
    collection[newEntity.id] = newEntity;
    
    this.notifyListeners();
    this.saveData();
    return newEntity;
  }

  getEntity<T extends Entity>(type: T['type'], id: EntityId): T | undefined {
    const collection = this.getEntityCollection<T>(type);
    return collection[id];
  }

  updateEntity<T extends Entity>(
    type: T['type'], 
    id: EntityId, 
    updates: Partial<Omit<T, 'id' | 'type' | 'createdAt'>>
  ): T | undefined {
    const collection = this.getEntityCollection<T>(type);
    const entity = collection[id];
    
    if (!entity) return undefined;

    const updatedEntity = {
      ...entity,
      ...updates,
      id,
      type,
      updatedAt: new Date().toISOString()
    } as T;

    collection[id] = updatedEntity;
    
    this.notifyListeners();
    this.saveData();
    return updatedEntity;
  }

  deleteEntity(type: EntityType, id: EntityId): boolean {
    const collection = this.getEntityCollection(type);
    if (!collection[id]) return false;
    
    // TODO: Handle cascading deletes for related entities
    
    delete collection[id];
    
    this.notifyListeners();
    this.saveData();
    return true;
  }

  // Type-specific helper methods
  // Factions
  createFaction(data: Omit<Faction, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Faction {
    return this.createEntity('faction', {
      ...data,
      members: data.members || [],
      relationships: data.relationships || {}
    });
  }

  // Locations
  createLocation(data: Omit<Location, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Location {
    return this.createEntity('location', {
      ...data,
      subLocations: data.subLocations || [],
      connectedLocations: data.connectedLocations || [],
      notableNpcs: data.notableNpcs || [],
      notableItems: data.notableItems || []
    });
  }

  // NPCs
  createNpc(data: Omit<Npc, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Npc {
    return this.createEntity('npc', {
      ...data,
      isAlive: data.isAlive !== false,
      relationships: data.relationships || {}
    });
  }

  // Quests
  createQuest(data: Omit<Quest, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Quest {
    return this.createEntity('quest', {
      ...data,
      status: data.status || 'available',
      relatedQuests: data.relatedQuests || [],
      relatedLocations: data.relatedLocations || [],
      relatedNpcs: data.relatedNpcs || [],
      objectives: data.objectives || [],
      rewards: data.rewards || {}
    });
  }

  // Items
  createItem(data: Omit<Item, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Item {
    return this.createEntity('item', {
      ...data,
      quantity: data.quantity || 1,
      value: data.value || 0,
      properties: data.properties || {}
    });
  }

  // Relationship management
  addRelationship(
    sourceType: EntityType,
    sourceId: EntityId,
    targetType: EntityType,
    targetId: EntityId,
    relationship: string
  ): boolean {
    // TODO: Implement relationship management
    // This would handle adding bidirectional relationships between entities
    // For example, adding an NPC to a faction would also update the NPC's factionId
    return false;
  }
}

// Export a singleton instance
export const campaignService = new CampaignService();

export default campaignService;
