import { QuestService } from './services/quest-service.js';
import { QuestUI } from './ui/quest-ui.js';

/**
 * QuestsManager coordinates between the UI and the QuestService
 * It serves as the main interface for quest-related operations
 */
export class QuestsManager {
    /**
     * Create a new QuestsManager instance
     * @param {Object} dataManager - The application's data manager
     */
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.questService = new QuestService(dataManager);
        this.questUI = new QuestUI(this);

        // Initialize quests array if it doesn't exist
        if (!dataManager.appState.quests) {
            dataManager.appState.quests = [];
        }

        // Initialize the UI when the DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    /**
     * Initialize the quests manager
     */
    initialize() {
        // Initialize the UI
        this.questUI.initializeUI();

        // Initial render of quests
        this.questUI.renderQuestList(this.questService.getAllQuests());
    }

    /**
     * Search for quests matching the given term
     * @param {string} term - Search term
     * @returns {Array} Matching quests
     */
    searchQuests(term) {
        return this.questService.searchQuests(term);
    }

    /**
     * Create a new quest
     * @param {Object} questData - Quest data
     * @returns {Promise<Object>} The created quest
     */
    createQuest(questData) {
        return this.questService.createQuest(questData);
    }

    /**
     * Get a quest by ID
     * @param {string} id - Quest ID
     * @returns {Object|null} The quest, or null if not found
     */
    getQuestById(id) {
        return this.questService.getQuestById(id);
    }

    /**
     * Update a quest
     * @param {string} id - Quest ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object>} The updated quest
     */
    updateQuest(id, updates) {
        return this.questService.updateQuest(id, updates);
    }

    /**
     * Delete a quest
     * @param {string} id - Quest ID
     * @returns {Promise<boolean>} True if deleted successfully
     */
    deleteQuest(id) {
        return this.questService.deleteQuest(id);
    }

    /**
     * Get all quests
     * @returns {Array} All quests
     */
    getAllQuests() {
        return this.questService.getAllQuests();
    }


}
