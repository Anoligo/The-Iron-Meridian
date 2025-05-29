export class QuestService {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    getAllQuests() {
        return this.dataManager.appState.quests || [];
    }

    getQuestById(id) {
        return this.getAllQuests().find(quest => quest.id === id);
    }

    createQuest(questData) {
        const quests = this.getAllQuests();
        const newQuest = new Quest(
            questData.name,
            questData.description,
            questData.type,
            questData.createdAt,
            questData.updatedAt
        );
        
        if (questData.id) newQuest.id = questData.id;
        if (questData.status) newQuest.status = questData.status;
        
        quests.push(newQuest);
        this._saveQuests(quests);
        return newQuest;
    }

    updateQuest(id, updates) {
        const quests = this.getAllQuests();
        const index = quests.findIndex(q => q.id === id);
        
        if (index === -1) return null;
        
        const quest = quests[index];
        
        // Update fields
        if (updates.name) quest.name = updates.name;
        if (updates.description !== undefined) quest.description = updates.description;
        if (updates.type) quest.type = updates.type;
        if (updates.status) quest.status = updates.status;
        if (updates.journalEntries) quest.journalEntries = updates.journalEntries;
        if (updates.relatedItems) quest.relatedItems = updates.relatedItems;
        if (updates.relatedLocations) quest.relatedLocations = updates.relatedLocations;
        if (updates.relatedCharacters) quest.relatedCharacters = updates.relatedCharacters;
        
        quest.updatedAt = new Date();
        
        this._saveQuests(quests);
        return quest;
    }

    deleteQuest(id) {
        const quests = this.getAllQuests().filter(q => q.id !== id);
        this._saveQuests(quests);
        return true;
    }

    addJournalEntry(questId, entry) {
        const quest = this.getQuestById(questId);
        if (!quest) return null;
        
        quest.addJournalEntry(entry);
        return this.updateQuest(questId, quest);
    }

    _saveQuests(quests) {
        this.dataManager.appState.quests = quests;
        // Trigger state update
        this.dataManager.appState = { ...this.dataManager.appState };
        
        // Notify subscribers of the change
        if (this.dataManager.notifySubscribers) {
            this.dataManager.notifySubscribers(this.dataManager.appState);
        }
    }
}
