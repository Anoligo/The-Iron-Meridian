// Data Management Module
import { Quest, QuestType, QuestStatus } from './quests.js';
import { Note } from './notes.js';
import { Item, ItemType, ItemRarity } from './loot.js';
import { Location, LocationType } from './locations.js';
import { Player, PlayerClass } from './players.js';
import { GuildActivity, GuildActivityType, GuildResource, GuildResourceType } from './guild.js';

// State Schema Definition
const STATE_SCHEMA = {
    quests: {
        type: 'array',
        items: {
            type: 'object',
            required: ['id', 'title', 'description', 'type', 'status'],
            properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                type: { enum: Object.values(QuestType) },
                status: { enum: Object.values(QuestStatus) },
                journalEntries: { type: 'array' },
                relatedItems: { type: 'array' },
                relatedLocations: { type: 'array' },
                relatedCharacters: { type: 'array' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    },
    notes: {
        type: 'array',
        items: {
            type: 'object',
            required: ['id', 'title', 'content', 'category'],
            properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                content: { type: 'string' },
                category: { type: 'string' },
                tags: { type: 'array' },
                relatedEntities: { type: 'object' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    },
    loot: {
        type: 'array',
        items: {
            type: 'object',
            required: ['id', 'name', 'description', 'type', 'rarity'],
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                type: { enum: Object.values(ItemType) },
                rarity: { enum: Object.values(ItemRarity) },
                isCursed: { type: 'boolean' },
                curseEffects: { type: 'array' },
                owner: { type: ['string', 'null'] },
                questSource: { type: ['string', 'null'] },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    },
    locations: {
        type: 'array',
        items: {
            type: 'object',
            required: ['id', 'name', 'description', 'type'],
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                type: { enum: Object.values(LocationType) },
                x: { type: 'number' },
                y: { type: 'number' },
                isDiscovered: { type: 'boolean' },
                relatedQuests: { type: 'array' },
                relatedItems: { type: 'array' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    },
    players: {
        type: 'array',
        items: {
            type: 'object',
            required: ['id', 'name', 'class', 'level'],
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                class: { enum: Object.values(PlayerClass) },
                level: { type: 'number', minimum: 1 },
                experience: { type: 'number', minimum: 0 },
                inventory: { type: 'array' },
                activeQuests: { type: 'array' },
                completedQuests: { type: 'array' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    },
    guildLogs: {
        type: 'object',
        required: ['activities', 'resources'],
        properties: {
            activities: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['id', 'name', 'description', 'type'],
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        type: { enum: Object.values(GuildActivityType) },
                        status: { type: 'string' },
                        rewards: { type: 'array' },
                        participants: { type: 'array' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                }
            },
            resources: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['id', 'name', 'description', 'type', 'quantity'],
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        type: { enum: Object.values(GuildResourceType) },
                        quantity: { type: 'number', minimum: 0 },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    }
};

// State Validation
class StateValidator {
    static validateState(state) {
        const errors = [];
        
        // Check if all required top-level keys exist
        Object.keys(STATE_SCHEMA).forEach(key => {
            if (!(key in state)) {
                errors.push(`Missing required state key: ${key}`);
            }
        });

        // Validate each section
        Object.entries(STATE_SCHEMA).forEach(([key, schema]) => {
            if (key in state) {
                const sectionErrors = this.validateSection(state[key], schema);
                errors.push(...sectionErrors.map(error => `${key}: ${error}`));
            }
        });

        return errors;
    }

    static validateSection(data, schema) {
        const errors = [];

        if (schema.type === 'array') {
            if (!Array.isArray(data)) {
                errors.push('Expected array');
                return errors;
            }

            data.forEach((item, index) => {
                const itemErrors = this.validateObject(item, schema.items);
                errors.push(...itemErrors.map(error => `Item ${index}: ${error}`));
            });
        } else if (schema.type === 'object') {
            const objectErrors = this.validateObject(data, schema);
            errors.push(...objectErrors);
        }

        return errors;
    }

    static validateObject(obj, schema) {
        const errors = [];

        // Check required properties
        if (schema.required) {
            schema.required.forEach(prop => {
                if (!(prop in obj)) {
                    errors.push(`Missing required property: ${prop}`);
                }
            });
        }

        // Validate each property
        Object.entries(schema.properties || {}).forEach(([prop, propSchema]) => {
            if (prop in obj) {
                const value = obj[prop];
                const propErrors = this.validateValue(value, propSchema);
                errors.push(...propErrors.map(error => `${prop}: ${error}`));
            }
        });

        return errors;
    }

    static validateValue(value, schema) {
        const errors = [];

        if (schema.type === 'array') {
            if (!Array.isArray(value)) {
                errors.push('Expected array');
            } else if (schema.items) {
                value.forEach((item, index) => {
                    const itemErrors = this.validateValue(item, schema.items);
                    errors.push(...itemErrors.map(error => `Item ${index}: ${error}`));
                });
            }
        } else if (schema.type === 'object') {
            if (typeof value !== 'object' || value === null) {
                errors.push('Expected object');
            } else if (schema.properties) {
                const objectErrors = this.validateObject(value, schema);
                errors.push(...objectErrors);
            }
        } else if (schema.enum) {
            if (!schema.enum.includes(value)) {
                errors.push(`Expected one of: ${schema.enum.join(', ')}`);
            }
        } else if (schema.type === 'number') {
            if (typeof value !== 'number') {
                errors.push('Expected number');
            } else {
                if (schema.minimum !== undefined && value < schema.minimum) {
                    errors.push(`Must be >= ${schema.minimum}`);
                }
                if (schema.maximum !== undefined && value > schema.maximum) {
                    errors.push(`Must be <= ${schema.maximum}`);
                }
            }
        } else if (schema.type === 'string') {
            if (typeof value !== 'string') {
                errors.push('Expected string');
            }
            if (schema.format === 'date-time') {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    errors.push('Invalid date-time format');
                }
            }
        } else if (schema.type === 'boolean') {
            if (typeof value !== 'boolean') {
                errors.push('Expected boolean');
            }
        }

        return errors;
    }
}

// Enhanced Data Manager
export class DataManager {
    constructor() {
        this._state = this._initializeState();
        this._observers = new Set();
        this._loadData();
    }

    _initializeState() {
        return {
            quests: [],
            notes: [],
            loot: [],
            locations: [],
            players: [],
            guildLogs: {
                activities: [],
                resources: []
            }
        };
    }

    _loadData() {
        try {
            const savedState = localStorage.getItem('appState');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                const errors = StateValidator.validateState(parsedState);
                if (errors.length === 0) {
                    this._state = parsedState;
                } else {
                    console.error('Invalid saved state:', errors);
                    this._saveData(); // Save valid initial state
                }
            }
        } catch (error) {
            console.error('Error loading state:', error);
            this._saveData(); // Save valid initial state
        }
    }

    _saveData() {
        try {
            const errors = StateValidator.validateState(this._state);
            if (errors.length === 0) {
                localStorage.setItem('appState', JSON.stringify(this._state));
                this._notifyObservers();
            } else {
                throw new Error(`Invalid state: ${errors.join(', ')}`);
            }
        } catch (error) {
            console.error('Error saving state:', error);
            throw error;
        }
    }

    _notifyObservers() {
        this._observers.forEach(observer => observer(this._state));
    }

    subscribe(observer) {
        this._observers.add(observer);
        return () => this._observers.delete(observer);
    }

    get appState() {
        return this._state;
    }

    // Enhanced CRUD operations with validation
    addQuest(quest) {
        if (!(quest instanceof Quest)) {
            throw new Error('Invalid quest object');
        }
        this._state.quests.push(quest);
        this._saveData();
    }

    addNote(note) {
        if (!(note instanceof Note)) {
            throw new Error('Invalid note object');
        }
        this._state.notes.push(note);
        this._saveData();
    }

    addItem(item) {
        if (!(item instanceof Item)) {
            throw new Error('Invalid item object');
        }
        this._state.loot.push(item);
        this._saveData();
    }

    addLocation(location) {
        if (!(location instanceof Location)) {
            throw new Error('Invalid location object');
        }
        this._state.locations.push(location);
        this._saveData();
    }

    addPlayer(player) {
        if (!(player instanceof Player)) {
            throw new Error('Invalid player object');
        }
        this._state.players.push(player);
        this._saveData();
    }

    addGuildActivity(activity) {
        if (!(activity instanceof GuildActivity)) {
            throw new Error('Invalid guild activity object');
        }
        this._state.guildLogs.activities.push(activity);
        this._saveData();
    }

    addGuildResource(resource) {
        if (!(resource instanceof GuildResource)) {
            throw new Error('Invalid guild resource object');
        }
        this._state.guildLogs.resources.push(resource);
        this._saveData();
    }

    // Enhanced getters with error handling
    getQuestById(id) {
        if (!id) throw new Error('Invalid quest ID');
        const quest = this._state.quests.find(q => q.id === id);
        if (!quest) throw new Error(`Quest with ID ${id} not found`);
        return quest;
    }

    getNoteById(id) {
        if (!id) throw new Error('Invalid note ID');
        const note = this._state.notes.find(n => n.id === id);
        if (!note) throw new Error(`Note with ID ${id} not found`);
        return note;
    }

    getItemById(id) {
        if (!id) throw new Error('Invalid item ID');
        const item = this._state.loot.find(i => i.id === id);
        if (!item) throw new Error(`Item with ID ${id} not found`);
        return item;
    }

    getLocationById(id) {
        if (!id) throw new Error('Invalid location ID');
        const location = this._state.locations.find(l => l.id === id);
        if (!location) throw new Error(`Location with ID ${id} not found`);
        return location;
    }

    getPlayerById(id) {
        if (!id) throw new Error('Invalid player ID');
        const player = this._state.players.find(p => p.id === id);
        if (!player) throw new Error(`Player with ID ${id} not found`);
        return player;
    }

    // Enhanced update operations with validation
    updateQuest(id, updates) {
        const quest = this.getQuestById(id);
        if (!updates || typeof updates !== 'object') {
            throw new Error('Invalid updates object');
        }
        Object.assign(quest, updates);
        quest.updatedAt = new Date();
        this._saveData();
    }

    updateNote(id, updates) {
        const note = this.getNoteById(id);
        if (!updates || typeof updates !== 'object') {
            throw new Error('Invalid updates object');
        }
        Object.assign(note, updates);
        note.updatedAt = new Date();
        this._saveData();
    }

    updateItem(id, updates) {
        const item = this.getItemById(id);
        if (!updates || typeof updates !== 'object') {
            throw new Error('Invalid updates object');
        }
        Object.assign(item, updates);
        item.updatedAt = new Date();
        this._saveData();
    }

    updateLocation(id, updates) {
        const location = this.getLocationById(id);
        if (!updates || typeof updates !== 'object') {
            throw new Error('Invalid updates object');
        }
        Object.assign(location, updates);
        location.updatedAt = new Date();
        this._saveData();
    }

    updatePlayer(id, updates) {
        const player = this.getPlayerById(id);
        if (!updates || typeof updates !== 'object') {
            throw new Error('Invalid updates object');
        }
        Object.assign(player, updates);
        player.updatedAt = new Date();
        this._saveData();
    }

    // Enhanced delete operations with validation
    deleteQuest(id) {
        if (!id) throw new Error('Invalid quest ID');
        const initialLength = this._state.quests.length;
        this._state.quests = this._state.quests.filter(q => q.id !== id);
        if (this._state.quests.length === initialLength) {
            throw new Error(`Quest with ID ${id} not found`);
        }
        this._saveData();
    }

    deleteNote(id) {
        if (!id) throw new Error('Invalid note ID');
        const initialLength = this._state.notes.length;
        this._state.notes = this._state.notes.filter(n => n.id !== id);
        if (this._state.notes.length === initialLength) {
            throw new Error(`Note with ID ${id} not found`);
        }
        this._saveData();
    }

    deleteItem(id) {
        if (!id) throw new Error('Invalid item ID');
        const initialLength = this._state.loot.length;
        this._state.loot = this._state.loot.filter(i => i.id !== id);
        if (this._state.loot.length === initialLength) {
            throw new Error(`Item with ID ${id} not found`);
        }
        this._saveData();
    }

    deleteLocation(id) {
        if (!id) throw new Error('Invalid location ID');
        const initialLength = this._state.locations.length;
        this._state.locations = this._state.locations.filter(l => l.id !== id);
        if (this._state.locations.length === initialLength) {
            throw new Error(`Location with ID ${id} not found`);
        }
        this._saveData();
    }

    deletePlayer(id) {
        if (!id) throw new Error('Invalid player ID');
        const initialLength = this._state.players.length;
        this._state.players = this._state.players.filter(p => p.id !== id);
        if (this._state.players.length === initialLength) {
            throw new Error(`Player with ID ${id} not found`);
        }
        this._saveData();
    }

    // Data export/import
    exportData() {
        const dataStr = JSON.stringify(this._state, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'iron-meridian-backup.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    importData(jsonData) {
        try {
            const parsedData = JSON.parse(jsonData);
            const errors = StateValidator.validateState(parsedData);
            if (errors.length === 0) {
                this._state = parsedData;
                this._saveData();
            } else {
                throw new Error(`Invalid data: ${errors.join(', ')}`);
            }
        } catch (error) {
            console.error('Error importing data:', error);
            throw error;
        }
    }

    // Clear all data
    clearData() {
        this._state = this._initializeState();
        this._saveData();
    }
} 