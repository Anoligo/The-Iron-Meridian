import { NoteTag } from '../enums/note-enums.js';

export class NotesForms {
    constructor(notesManager) {
        this.notesManager = notesManager;
        this.dataManager = notesManager.dataManager;
        this.service = notesManager.service;
    }

    showAddTagForm(noteId) {
        const note = this.service.getNoteById(noteId);
        if (!note) return;

        const availableTags = Object.values(NoteTag).filter(tag => !note.tags.includes(tag));
        
        if (availableTags.length === 0) {
            alert('No available tags to add.');
            return;
        }

        const tag = prompt(`Available tags: ${availableTags.join(', ')}\nEnter a tag to add:`);
        if (tag && availableTags.includes(tag)) {
            this.service.addTagToNote(noteId, tag);
            this.notesManager.showNoteDetails(noteId);
        }
    }

    showAddRelatedQuestForm(noteId) {
        const note = this.service.getNoteById(noteId);
        if (!note) return;

        const quests = this.dataManager.appState.quests || [];
        const availableQuests = quests.filter(quest => 
            !(note.relatedEntities?.quests || []).includes(quest.id)
        );

        if (availableQuests.length === 0) {
            alert('No available quests to add.');
            return;
        }

        const questOptions = availableQuests.map(quest => 
            `${quest.id}: ${quest.title}`
        ).join('\n');
        
        const questId = prompt(`Available quests:\n${questOptions}\n\nEnter quest ID:`);
        
        if (questId && availableQuests.find(q => q.id === questId)) {
            this.service.addRelatedEntity(noteId, 'quest', questId);
            this.notesManager.showNoteDetails(noteId);
        }
    }

    showAddRelatedLocationForm(noteId) {
        const note = this.service.getNoteById(noteId);
        if (!note) return;

        const locations = this.dataManager.appState.locations || [];
        const availableLocations = locations.filter(location => 
            !(note.relatedEntities?.locations || []).includes(location.id)
        );

        if (availableLocations.length === 0) {
            alert('No available locations to add.');
            return;
        }

        const locationOptions = availableLocations.map(location => 
            `${location.id}: ${location.name}`
        ).join('\n');
        
        const locationId = prompt(`Available locations:\n${locationOptions}\n\nEnter location ID:`);
        
        if (locationId && availableLocations.find(l => l.id === locationId)) {
            this.service.addRelatedEntity(noteId, 'location', locationId);
            this.notesManager.showNoteDetails(noteId);
        }
    }

    showAddRelatedCharacterForm(noteId) {
        const note = this.service.getNoteById(noteId);
        if (!note) return;

        const characters = this.dataManager.appState.players || [];
        const availableCharacters = characters.filter(character => 
            !(note.relatedEntities?.characters || []).includes(character.id)
        );

        if (availableCharacters.length === 0) {
            alert('No available characters to add.');
            return;
        }

        const characterOptions = availableCharacters.map(character => 
            `${character.id}: ${character.name}`
        ).join('\n');
        
        const characterId = prompt(`Available characters:\n${characterOptions}\n\nEnter character ID:`);
        
        if (characterId && availableCharacters.find(c => c.id === characterId)) {
            this.service.addRelatedEntity(noteId, 'character', characterId);
            this.notesManager.showNoteDetails(noteId);
        }
    }

    showAddRelatedItemForm(noteId) {
        const note = this.service.getNoteById(noteId);
        if (!note) return;

        const items = this.dataManager.appState.loot || [];
        const availableItems = items.filter(item => 
            !(note.relatedEntities?.items || []).includes(item.id)
        );

        if (availableItems.length === 0) {
            alert('No available items to add.');
            return;
        }

        const itemOptions = availableItems.map(item => 
            `${item.id}: ${item.name}`
        ).join('\n');
        
        const itemId = prompt(`Available items:\n${itemOptions}\n\nEnter item ID:`);
        
        if (itemId && availableItems.find(i => i.id === itemId)) {
            this.service.addRelatedEntity(noteId, 'item', itemId);
            this.notesManager.showNoteDetails(noteId);
        }
    }

    // Confirmation dialogs for removing related entities
    confirmRemoveTag(noteId, tag) {
        if (confirm(`Remove tag "${tag}"?`)) {
            this.service.removeTagFromNote(noteId, tag);
            this.notesManager.showNoteDetails(noteId);
        }
    }

    confirmRemoveRelatedEntity(noteId, entityType, entityId) {
        if (confirm(`Remove this ${entityType}?`)) {
            this.service.removeRelatedEntity(noteId, entityType, entityId);
            this.notesManager.showNoteDetails(noteId);
        }
    }
}
