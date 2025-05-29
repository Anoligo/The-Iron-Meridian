/**
 * Quest UI Component
 * Handles the rendering and interaction for quest-related UI elements
 */

export class QuestUI {
    constructor(questsManager) {
        this.questsManager = questsManager;
        this.initializeUI();
    }

    /**
     * Initialize the quests UI
     */
    initializeUI() {
        this.initializeQuestList();
        this.initializeEventListeners();
    }

    /**
     * Initialize the quest list container
     */
    initializeQuestList() {
        // Create or get the quests container
        let container = document.getElementById('quests');
        if (!container) {
            container = document.createElement('div');
            container.id = 'quests';
            document.body.appendChild(container);
        }

        // Set up the basic UI structure
        container.innerHTML = `
            <div class="quests-container">
                <div class="quests-header">
                    <h2>Quests</h2>
                    <button id="new-quest-btn" class="btn btn-primary">New Quest</button>
                </div>
                <div class="quests-content">
                    <div class="quest-list" id="quest-list">
                        <!-- Quest items will be rendered here -->
                        <div class="empty-state">No quests available. Create a new quest to get started.</div>
                    </div>
                    <div class="quest-details" id="quest-details">
                        <!-- Quest details will be shown here -->
                        <div class="empty-state">Select a quest to view details</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Set up event listeners for the quest UI
     */
    initializeEventListeners() {
        // New quest button
        const newQuestBtn = document.getElementById('new-quest-btn');
        if (newQuestBtn) {
            newQuestBtn.addEventListener('click', () => this.showNewQuestForm());
        }

        // Search functionality
        const searchInput = document.getElementById('quest-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterQuests(e.target.value));
        }
    }

    /**
     * Show the new quest form
     */
    showNewQuestForm() {
        const detailsContainer = document.getElementById('quest-details');
        if (!detailsContainer) return;

        detailsContainer.innerHTML = `
            <div class="quest-form">
                <h3>Create New Quest</h3>
                <form id="quest-form">
                    <div class="form-group">
                        <label for="quest-title">Title</label>
                        <input type="text" id="quest-title" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="quest-type">Type</label>
                        <select id="quest-type" class="form-control" required>
                            <option value="main">Main Quest</option>
                            <option value="side">Side Quest</option>
                            <option value="guild">Guild Quest</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="quest-description">Description</label>
                        <textarea id="quest-description" class="form-control" rows="4"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Save Quest</button>
                        <button type="button" class="btn btn-secondary" id="cancel-quest">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        // Add form submission handler
        const form = document.getElementById('quest-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleQuestFormSubmit(e));
        }

        // Add cancel button handler
        const cancelBtn = document.getElementById('cancel-quest');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.clearQuestDetails());
        }
    }

    /**
     * Handle quest form submission
     * @param {Event} e - Form submit event
     */
    async handleQuestFormSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('quest-title').value.trim();
        const type = document.getElementById('quest-type').value;
        const description = document.getElementById('quest-description').value.trim();

        if (!title) return;

        try {
            await this.questsManager.createQuest({
                title,
                type,
                description,
                status: 'active'
            });
            
            this.renderQuestList();
            this.clearQuestDetails();
        } catch (error) {
            console.error('Error creating quest:', error);
            // Show error to user
            alert('Failed to create quest. Please try again.');
        }
    }

    /**
     * Render the list of quests
     * @param {Array} quests - Array of quest objects
     */
    renderQuestList(quests = []) {
        const questList = document.getElementById('quest-list');
        if (!questList) return;

        if (!quests || quests.length === 0) {
            quests = this.questsManager.getAllQuests();
        }

        if (quests.length === 0) {
            questList.innerHTML = '<div class="empty-state">No quests available. Create a new quest to get started.</div>';
            return;
        }

        const questItems = quests.map(quest => `
            <div class="quest-item" data-quest-id="${quest.id}">
                <div class="quest-item-header">
                    <span class="quest-title">${quest.title || 'Untitled Quest'}</span>
                    <span class="quest-type ${quest.type}">${this.formatQuestType(quest.type)}</span>
                </div>
                <div class="quest-item-body">
                    <p class="quest-description">${quest.description || 'No description'}</p>
                    <div class="quest-meta">
                        <span class="quest-status">${quest.status || 'active'}</span>
                        <span class="quest-date">${this.formatDate(quest.updatedAt || quest.createdAt)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        questList.innerHTML = questItems;

        // Add click handlers to quest items
        document.querySelectorAll('.quest-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const questId = item.dataset.questId;
                this.showQuestDetails(questId);
            });
        });
    }

    /**
     * Show details for a specific quest
     * @param {string} questId - ID of the quest to show
     */
    async showQuestDetails(questId) {
        if (!questId) return;

        try {
            const quest = await this.questsManager.getQuestById(questId);
            if (!quest) return;

            const detailsContainer = document.getElementById('quest-details');
            if (!detailsContainer) return;

            detailsContainer.innerHTML = `
                <div class="quest-detail">
                    <div class="quest-detail-header">
                        <h3>${quest.title || 'Untitled Quest'}</h3>
                        <span class="quest-type ${quest.type}">${this.formatQuestType(quest.type)}</span>
                    </div>
                    <div class="quest-detail-body">
                        <div class="quest-description">
                            <h4>Description</h4>
                            <p>${quest.description || 'No description provided.'}</p>
                        </div>
                        <div class="quest-status-info">
                            <h4>Status</h4>
                            <select id="quest-status" class="form-control">
                                <option value="active" ${quest.status === 'active' ? 'selected' : ''}>Active</option>
                                <option value="completed" ${quest.status === 'completed' ? 'selected' : ''}>Completed</option>
                                <option value="failed" ${quest.status === 'failed' ? 'selected' : ''}>Failed</option>
                                <option value="on-hold" ${quest.status === 'on-hold' ? 'selected' : ''}>On Hold</option>
                            </select>
                        </div>
                        <div class="quest-actions">
                            <button class="btn btn-primary" id="save-quest">Save Changes</button>
                            <button class="btn btn-danger" id="delete-quest">Delete Quest</button>
                        </div>
                    </div>
                </div>
            `;

            // Add status change handler
            const statusSelect = document.getElementById('quest-status');
            if (statusSelect) {
                statusSelect.addEventListener('change', (e) => {
                    this.updateQuestStatus(questId, e.target.value);
                });
            }

            // Add delete handler
            const deleteBtn = document.getElementById('delete-quest');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteQuest(questId));
            }

        } catch (error) {
            console.error('Error loading quest details:', error);
            alert('Failed to load quest details.');
        }
    }

    /**
     * Update a quest's status
     * @param {string} questId - ID of the quest to update
     * @param {string} status - New status
     */
    async updateQuestStatus(questId, status) {
        if (!questId || !status) return;

        try {
            await this.questsManager.updateQuest(questId, { status });
            this.renderQuestList();
        } catch (error) {
            console.error('Error updating quest status:', error);
            alert('Failed to update quest status.');
        }
    }

    /**
     * Delete a quest
     * @param {string} questId - ID of the quest to delete
     */
    async deleteQuest(questId) {
        if (!questId || !confirm('Are you sure you want to delete this quest?')) return;

        try {
            await this.questsManager.deleteQuest(questId);
            this.clearQuestDetails();
            this.renderQuestList();
        } catch (error) {
            console.error('Error deleting quest:', error);
            alert('Failed to delete quest.');
        }
    }

    /**
     * Clear the quest details panel
     */
    clearQuestDetails() {
        const detailsContainer = document.getElementById('quest-details');
        if (detailsContainer) {
            detailsContainer.innerHTML = '<div class="empty-state">Select a quest to view details</div>';
        }
    }

    /**
     * Filter quests based on search term
     * @param {string} searchTerm - Term to search for in quest titles and descriptions
     */
    filterQuests(searchTerm) {
        if (!searchTerm) {
            this.renderQuestList();
            return;
        }

        const filteredQuests = this.questsManager.searchQuests(searchTerm);
        this.renderQuestList(filteredQuests);
    }

    /**
     * Format quest type for display
     * @param {string} type - Quest type
     * @returns {string} Formatted type
     */
    formatQuestType(type) {
        if (!type) return '';
        return type
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Format date for display
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        if (!date) return '';
        
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Export as default
export default QuestUI;
