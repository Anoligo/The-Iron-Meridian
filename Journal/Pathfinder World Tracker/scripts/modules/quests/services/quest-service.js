import { Quest } from '../models/quest-model.js';

export class QuestService {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    getAllQuests() {
        const quests = this.dataManager.appState.quests || [];
        console.log('QuestService.getAllQuests:', quests);
        return quests;
    }

    getQuestById(id) {
        return this.getAllQuests().find(quest => quest.id === id);
    }

    createQuest(questData) {
        const quests = this.getAllQuests();
        
        // Create a new quest with proper defaults
        const newQuest = new Quest(
            questData.name,
            questData.description,
            questData.type,
            questData.createdAt || new Date(),
            questData.updatedAt || new Date()
        );
        
        // Set additional properties if they exist in the data
        if (questData.id) newQuest.id = questData.id;
        if (questData.status) newQuest.status = questData.status;
        
        // Add journal entries if they exist
        if (Array.isArray(questData.journalEntries) && questData.journalEntries.length > 0) {
            newQuest.journalEntries = [...questData.journalEntries];
        }
        
        // Add related entities if they exist
        if (Array.isArray(questData.relatedItems)) {
            newQuest.relatedItems = [...questData.relatedItems];
        }
        
        if (Array.isArray(questData.relatedLocations)) {
            newQuest.relatedLocations = [...questData.relatedLocations];
        }
        
        if (Array.isArray(questData.relatedCharacters)) {
            newQuest.relatedCharacters = [...questData.relatedCharacters];
        }
        
        console.log('Creating new quest:', newQuest);
        
        quests.push(newQuest);
        this._saveQuests(quests);
        return newQuest;
    }

    updateQuest(id, updates) {
        const quests = this.getAllQuests();
        const index = quests.findIndex(q => q.id === id);
        
        if (index === -1) return null;
        
        // Create a new quest object with updated fields
        const updatedQuest = { ...quests[index] };
        
        // Update fields if they exist in updates
        if (updates.name !== undefined) updatedQuest.name = updates.name;
        if (updates.description !== undefined) updatedQuest.description = updates.description;
        if (updates.type !== undefined) updatedQuest.type = updates.type;
        if (updates.status !== undefined) updatedQuest.status = updates.status;
        if (updates.journalEntries !== undefined) updatedQuest.journalEntries = [...updates.journalEntries];
        if (updates.relatedItems !== undefined) updatedQuest.relatedItems = [...updates.relatedItems];
        if (updates.relatedLocations !== undefined) updatedQuest.relatedLocations = [...updates.relatedLocations];
        if (updates.relatedCharacters !== undefined) updatedQuest.relatedCharacters = [...updates.relatedCharacters];
        
        // Always update the timestamp
        updatedQuest.updatedAt = new Date();
        
        // Update the quest in the array
        quests[index] = updatedQuest;
        
        // Save the updated quests array
        this._saveQuests(quests);
        
        return updatedQuest;
    }

    deleteQuest(id) {
        const quests = this.getAllQuests().filter(q => q.id !== id);
        this._saveQuests(quests);
        return true;
    }

    addJournalEntry(questId, entry) {
        const quest = this.getQuestById(questId);
        if (!quest) return null;
        
        // Create a new journal entries array with the new entry
        const updatedEntries = [
            ...(quest.journalEntries || []),
            {
                ...entry,
                timestamp: entry.timestamp || new Date()
            }
        ];
        
        // Update the quest with the new journal entries
        return this.updateQuest(questId, {
            ...quest,
            journalEntries: updatedEntries
        });
    }

    _saveQuests(quests) {
        // Create a new array to ensure reactivity
        const updatedQuests = [...quests];
        
        // Update the state with the new quests array
        this.dataManager.appState = {
            ...this.dataManager.appState,
            quests: updatedQuests
        };
        
        // Save to local storage if available
        if (typeof Storage !== 'undefined') {
            try {
                localStorage.setItem('appState', JSON.stringify(this.dataManager.appState));
            } catch (error) {
                console.error('Error saving to local storage:', error);
            }
        }
        
        // Notify subscribers of the change
        if (this.dataManager.notifySubscribers) {
            this.dataManager.notifySubscribers(this.dataManager.appState);
        }
        
        return updatedQuests;
    }
}
