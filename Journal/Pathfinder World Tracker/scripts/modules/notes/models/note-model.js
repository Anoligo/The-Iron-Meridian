import { Entity } from '../../entity.js';
import { NoteCategory } from '../enums/note-enums.js';

export class Note extends Entity {
    constructor(title, content, category = 'lore', createdAt = new Date(), updatedAt = new Date()) {
        // First call the parent constructor with the ID and timestamps
        super(null, createdAt, updatedAt);
        
        // Initialize properties
        this.title = title;
        this.content = content;
        this.category = category;
        this.tags = [];
        
        // Initialize relatedEntities with default values
        this.initializeRelatedEntities();
        
        // Ensure timestamps are Date objects
        this.createdAt = new Date(this.createdAt);
        this.updatedAt = new Date(this.updatedAt);
        
        // Ensure ID is set
        if (!this.id) {
            this.id = `note-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        }
    }
    
    // Initialize related entities (kept for backward compatibility)
    initializeRelatedEntities() {
        // If relatedEntities doesn't exist or is not an object, initialize it
        if (!this.relatedEntities || typeof this.relatedEntities !== 'object') {
            this.relatedEntities = {
                quests: [],
                locations: [],
                characters: [],
                items: []
            };
        }
        
        // Ensure all required arrays exist and are arrays
        this.relatedEntities = {
            quests: Array.isArray(this.relatedEntities.quests) ? this.relatedEntities.quests : [],
            locations: Array.isArray(this.relatedEntities.locations) ? this.relatedEntities.locations : [],
            characters: Array.isArray(this.relatedEntities.characters) ? this.relatedEntities.characters : [],
            items: Array.isArray(this.relatedEntities.items) ? this.relatedEntities.items : []
        };
        
        return this.relatedEntities;
    }

    updateTitle(title) {
        this.title = title;
        this.updatedAt = new Date();
    }

    updateContent(content) {
        this.content = content;
        this.updatedAt = new Date();
    }

    updateCategory(category) {
        if (!Object.values(NoteCategory).includes(category)) {
            return false;
        }
        this.category = category;
        this.updatedAt = new Date();
        return true;
    }

    addTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
            this.updatedAt = new Date();
        }
    }

    removeTag(tag) {
        this.tags = this.tags.filter(t => t !== tag);
        this.updatedAt = new Date();
    }

    addRelatedQuest(questId) {
        if (!questId) return false;
        
        try {
            // Ensure relatedEntities is properly initialized
            const relatedEntities = this.initializeRelatedEntities();
            
            // Add the quest if it doesn't already exist
            if (!relatedEntities.quests.includes(questId)) {
                relatedEntities.quests.push(questId);
                this.updatedAt = new Date();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding related quest:', error);
            return false;
        }
    }

    removeRelatedQuest(questId) {
        if (!questId) return false;
        
        try {
            // Ensure relatedEntities is properly initialized
            const relatedEntities = this.initializeRelatedEntities();
            
            // Remove the quest if it exists
            const initialLength = relatedEntities.quests.length;
            relatedEntities.quests = relatedEntities.quests.filter(id => id !== questId);
            
            // If the length changed, update the timestamp
            if (relatedEntities.quests.length !== initialLength) {
                this.updatedAt = new Date();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing related quest:', error);
            return false;
        }
    }

    addRelatedLocation(locationId) {
        if (!locationId) return false;
        
        try {
            const relatedEntities = this.initializeRelatedEntities();
            
            if (!relatedEntities.locations.includes(locationId)) {
                relatedEntities.locations.push(locationId);
                this.updatedAt = new Date();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding related location:', error);
            return false;
        }
    }

    removeRelatedLocation(locationId) {
        if (!locationId) return false;
        
        try {
            const relatedEntities = this.initializeRelatedEntities();
            const initialLength = relatedEntities.locations.length;
            relatedEntities.locations = relatedEntities.locations.filter(id => id !== locationId);
            
            if (relatedEntities.locations.length !== initialLength) {
                this.updatedAt = new Date();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing related location:', error);
            return false;
        }
    }

    addRelatedCharacter(characterId) {
        if (!characterId) return false;
        
        try {
            const relatedEntities = this.initializeRelatedEntities();
            
            if (!relatedEntities.characters.includes(characterId)) {
                relatedEntities.characters.push(characterId);
                this.updatedAt = new Date();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding related character:', error);
            return false;
        }
    }

    removeRelatedCharacter(characterId) {
        if (!characterId) return false;
        
        try {
            const relatedEntities = this.initializeRelatedEntities();
            const initialLength = relatedEntities.characters.length;
            relatedEntities.characters = relatedEntities.characters.filter(id => id !== characterId);
            
            if (relatedEntities.characters.length !== initialLength) {
                this.updatedAt = new Date();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing related character:', error);
            return false;
        }
    }

    addRelatedItem(itemId) {
        if (!itemId) return false;
        
        try {
            const relatedEntities = this.initializeRelatedEntities();
            
            if (!relatedEntities.items.includes(itemId)) {
                relatedEntities.items.push(itemId);
                this.updatedAt = new Date();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding related item:', error);
            return false;
        }
    }

    removeRelatedItem(itemId) {
        if (!itemId) return false;
        
        try {
            const relatedEntities = this.initializeRelatedEntities();
            const initialLength = relatedEntities.items.length;
            relatedEntities.items = relatedEntities.items.filter(id => id !== itemId);
            
            if (relatedEntities.items.length !== initialLength) {
                this.updatedAt = new Date();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing related item:', error);
            return false;
        }
    }

    get name() { return this.title; }
    set name(val) { this.title = val; }
}
