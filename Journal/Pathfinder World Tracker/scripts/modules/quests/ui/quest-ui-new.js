/**
 * Quest UI Component
 * Handles the rendering and interaction for quest-related UI elements
 * Uses the BaseUI class for consistent UI patterns
 */

import { BaseUI } from '../../../components/base-ui.js';
import { createListItem, createDetailsPanel, showToast } from '../../../components/ui-components.js';
import { getStatusBadgeClass, getQuestTypeBadgeClass, formatEnumValue } from '../../../utils/style-utils.js';

export class QuestUI extends BaseUI {
    /**
     * Create a new QuestUI instance
     * @param {Object} questService - Instance of QuestService
     * @param {Object} dataManager - Instance of DataManager for accessing related entities
     */
    constructor(questService, dataManager) {
        super({
            containerId: 'quests',
            listId: 'questList',
            detailsId: 'questDetails',
            searchId: 'questSearch',
            addButtonId: 'addQuestBtn',
            entityName: 'quest',
            getAll: () => questService.getAllQuests(),
            getById: (id) => questService.getQuestById(id),
            add: (quest) => questService.createQuest(quest),
            update: (id, updates) => questService.updateQuest(id, updates),
            delete: (id) => questService.deleteQuest(id)
        });
        
        this.questService = questService;
        this.dataManager = dataManager;
        
        // Bind additional methods
        this.renderJournalEntries = this.renderJournalEntries.bind(this);
        this.renderRelatedEntities = this.renderRelatedEntities.bind(this);
        this.setupRelatedEntityListeners = this.setupRelatedEntityListeners.bind(this);
        this.setupJournalEntryListeners = this.setupJournalEntryListeners.bind(this);
        this.addJournalEntry = this.addJournalEntry.bind(this);
        this.editJournalEntry = this.editJournalEntry.bind(this);
        this.deleteJournalEntry = this.deleteJournalEntry.bind(this);
        this.addRelatedEntity = this.addRelatedEntity.bind(this);
        this.removeRelatedEntity = this.removeRelatedEntity.bind(this);
        this.formatDate = this.formatDate.bind(this);
    }
    
    /**
     * Create a list item for a quest
     * @param {Object} quest - Quest to create list item for
     * @returns {HTMLElement} The created list item
     */
    createListItem(quest) {
        return createListItem({
            id: quest.id,
            title: quest.name,
            subtitle: `${formatEnumValue(quest.type)} • ${formatEnumValue(quest.status)}`,
            icon: 'fas fa-scroll',
            isSelected: this.currentEntity && this.currentEntity.id === quest.id,
            metadata: {
                'Updated': this.formatDate(quest.updatedAt)
            },
            onClick: this.handleSelect
        });
    }
    
    /**
     * Render the details for a quest
     * @param {Object} quest - Quest to render details for
     */
    renderDetails(quest) {
        if (!this.detailsElement) return;
        
        if (!quest) {
            this.detailsElement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-scroll fa-3x mb-3"></i>
                    <p class="empty-state-message">Select a quest to view details</p>
                </div>
            `;
            return;
        }
        
        // Create sections for quest details
        const sections = [
            {
                title: 'Details',
                content: `
                    <div class="mb-3">
                        <span class="badge ${getStatusBadgeClass(quest.status)}">${formatEnumValue(quest.status)}</span>
                        <span class="badge ${getQuestTypeBadgeClass(quest.type)}">${formatEnumValue(quest.type)}</span>
                    </div>
                    <div class="mb-3">
                        <small class="text-meta">Last Updated: ${this.formatDate(quest.updatedAt)}</small>
                    </div>
                    <div class="mb-3">
                        <h6 class="section-title">Description</h6>
                        <p>${quest.description || 'No description provided.'}</p>
                    </div>
                `
            },
            {
                title: 'Related Characters',
                content: this.renderRelatedEntities(quest, 'characters')
            },
            {
                title: 'Related Items',
                content: this.renderRelatedEntities(quest, 'items')
            },
            {
                title: 'Related Locations',
                content: this.renderRelatedEntities(quest, 'locations')
            },
            {
                title: 'Journal Entries',
                content: this.renderJournalEntries(quest)
            }
        ];
        
        // Create details panel
        const detailsPanel = createDetailsPanel({
            title: quest.name,
            data: quest,
            actions: [
                {
                    label: 'Edit',
                    icon: 'fas fa-edit',
                    type: 'primary',
                    onClick: () => this.handleEdit(quest)
                },
                {
                    label: 'Delete',
                    icon: 'fas fa-trash',
                    type: 'danger',
                    onClick: () => this.handleDelete(quest.id)
                }
            ],
            sections: sections
        });
        
        // Clear the details element and append the new details panel
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(detailsPanel);
        
        // Add event listeners for related entity buttons and journal entries
        this.setupRelatedEntityListeners(quest);
        this.setupJournalEntryListeners(quest);
    }
    
    /**
     * Render related entities for a quest
     * @param {Object} quest - Quest to render related entities for
     * @param {string} entityType - Type of entity (characters, items, locations)
     * @returns {string} HTML for related entities
     */
    renderRelatedEntities(quest, entityType) {
        // Initialize arrays if they don't exist
        if (!quest.characters) quest.characters = [];
        if (!quest.items) quest.items = [];
        if (!quest.locations) quest.locations = [];
        
        const entities = quest[entityType] || [];
        
        let html = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span>${entities.length} ${entityType}</span>
                <button class="btn btn-sm btn-outline-primary add-entity-btn" data-entity-type="${entityType}">
                    <i class="fas fa-plus"></i> Add
                </button>
            </div>
        `;
        
        if (entities.length === 0) {
            html += `<p class="text-meta">No ${entityType} associated with this quest.</p>`;
            return html;
        }
        
        html += '<div class="list-group">';
        
        entities.forEach(entityId => {
            let entity;
            let icon;
            
            // Get entity details based on type
            switch (entityType) {
                case 'characters':
                    entity = this.dataManager.appState.characters.find(c => c.id === entityId);
                    icon = 'fa-user-shield';
                    break;
                case 'items':
                    entity = this.dataManager.appState.loot.find(i => i.id === entityId);
                    icon = 'fa-coins';
                    break;
                case 'locations':
                    entity = this.dataManager.appState.locations.find(l => l.id === entityId);
                    icon = 'fa-map-marker-alt';
                    break;
            }
            
            if (!entity) {
                entity = { id: entityId, name: 'Unknown Entity' };
            }
            
            html += `
                <div class="list-group-item d-flex justify-content-between align-items-center bg-card">
                    <div>
                        <i class="fas ${icon} me-2"></i> ${entity.name || entity.title || entityId}
                    </div>
                    <button class="btn btn-sm btn-outline-danger remove-entity-btn" 
                            data-entity-type="${entityType}" 
                            data-entity-id="${entityId}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    /**
     * Render journal entries for a quest
     * @param {Object} quest - Quest to render journal entries for
     * @returns {string} HTML for journal entries
     */
    renderJournalEntries(quest) {
        // Initialize journal entries if they don't exist
        if (!quest.journalEntries) quest.journalEntries = [];
        
        const entries = quest.journalEntries || [];
        
        let html = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span>${entries.length} entries</span>
                <button class="btn btn-sm btn-outline-primary add-journal-btn">
                    <i class="fas fa-plus"></i> Add Entry
                </button>
            </div>
        `;
        
        if (entries.length === 0) {
            html += `<p class="text-meta">No journal entries for this quest.</p>`;
            return html;
        }
        
        html += '<div class="journal-entries">';
        
        entries.forEach((entry, index) => {
            html += `
                <div class="card mb-3 bg-card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <small class="text-meta">${this.formatDate(entry.date)}</small>
                        <div>
                            <button class="btn btn-sm btn-outline-primary edit-journal-btn me-1" data-entry-index="${index}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-journal-btn" data-entry-index="${index}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <p>${entry.content}</p>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    /**
     * Set up event listeners for related entity buttons
     * @param {Object} quest - Quest to set up listeners for
     */
    setupRelatedEntityListeners(quest) {
        // Add entity buttons
        const addEntityBtns = this.detailsElement.querySelectorAll('.add-entity-btn');
        addEntityBtns.forEach(btn => {
            const entityType = btn.dataset.entityType;
            btn.addEventListener('click', () => this.showAddEntityModal(quest.id, entityType));
        });
        
        // Remove entity buttons
        const removeEntityBtns = this.detailsElement.querySelectorAll('.remove-entity-btn');
        removeEntityBtns.forEach(btn => {
            const entityType = btn.dataset.entityType;
            const entityId = btn.dataset.entityId;
            btn.addEventListener('click', () => this.removeRelatedEntity(quest.id, entityType, entityId));
        });
    }
    
    /**
     * Set up event listeners for journal entry buttons
     * @param {Object} quest - Quest to set up listeners for
     */
    setupJournalEntryListeners(quest) {
        // Add journal entry button
        const addJournalBtn = this.detailsElement.querySelector('.add-journal-btn');
        if (addJournalBtn) {
            addJournalBtn.addEventListener('click', () => this.showAddJournalEntryForm(quest.id));
        }
        
        // Edit journal entry buttons
        const editJournalBtns = this.detailsElement.querySelectorAll('.edit-journal-btn');
        editJournalBtns.forEach(btn => {
            const entryIndex = parseInt(btn.dataset.entryIndex);
            btn.addEventListener('click', () => this.showEditJournalEntryForm(quest.id, entryIndex));
        });
        
        // Delete journal entry buttons
        const deleteJournalBtns = this.detailsElement.querySelectorAll('.delete-journal-btn');
        deleteJournalBtns.forEach(btn => {
            const entryIndex = parseInt(btn.dataset.entryIndex);
            btn.addEventListener('click', () => this.showDeleteJournalEntryConfirmation(quest.id, entryIndex));
        });
    }
    
    /**
     * Format date for display
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        if (!date) return 'Unknown';
        
        try {
            const dateObj = new Date(date);
            return dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
        }
    }
    
    /**
     * Handle adding a new quest
     */
    handleAdd() {
        this.showQuestForm();
    }
    
    /**
     * Handle editing a quest
     * @param {Object} quest - Quest to edit
     */
    handleEdit(quest) {
        this.showQuestForm(quest);
    }
    
    /**
     * Show the quest form for adding or editing a quest
     * @param {Object} quest - Optional quest to edit
     */
    showQuestForm(quest = null) {
        const isEdit = !!quest;
        const formTitle = isEdit ? 'Edit Quest' : 'Create New Quest';
        
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.className = 'card';
        
        // Build form HTML
        formContainer.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">${formTitle}</h5>
                <button type="button" class="btn-close" id="closeQuestForm" aria-label="Close"></button>
            </div>
            <div class="card-body">
                <form id="questForm">
                    <div class="mb-3">
                        <label for="questName" class="form-label">Quest Name</label>
                        <input type="text" class="form-control" id="questName" value="${isEdit ? quest.name : ''}" required>
                    </div>
                    <div class="mb-3">
                        <label for="questType" class="form-label">Type</label>
                        <select class="form-select" id="questType" required>
                            <option value="MAIN" ${isEdit && quest.type === 'MAIN' ? 'selected' : ''}>Main Quest</option>
                            <option value="SIDE" ${isEdit && quest.type === 'SIDE' ? 'selected' : ''}>Side Quest</option>
                            <option value="GUILD" ${isEdit && quest.type === 'GUILD' ? 'selected' : ''}>Guild Quest</option>
                            <option value="PERSONAL" ${isEdit && quest.type === 'PERSONAL' ? 'selected' : ''}>Personal Quest</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="questStatus" class="form-label">Status</label>
                        <select class="form-select" id="questStatus" required>
                            <option value="ONGOING" ${isEdit && quest.status === 'ONGOING' ? 'selected' : ''}>Ongoing</option>
                            <option value="COMPLETED" ${isEdit && quest.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                            <option value="ON_HOLD" ${isEdit && quest.status === 'ON_HOLD' ? 'selected' : ''}>On Hold</option>
                            <option value="FAILED" ${isEdit && quest.status === 'FAILED' ? 'selected' : ''}>Failed</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="questDescription" class="form-label">Description</label>
                        <textarea class="form-control" id="questDescription" rows="4">${isEdit ? quest.description || '' : ''}</textarea>
                    </div>
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" id="cancelQuestForm">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-1"></i> ${isEdit ? 'Save Changes' : 'Create Quest'}
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Clear details element and append form
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(formContainer);
        
        // Set up event listeners
        const form = document.getElementById('questForm');
        const closeBtn = document.getElementById('closeQuestForm');
        const cancelBtn = document.getElementById('cancelQuestForm');
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleQuestFormSubmit(e, isEdit ? quest.id : null);
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (isEdit) {
                    this.selectEntity(quest.id);
                } else {
                    this.renderDetails(null);
                }
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (isEdit) {
                    this.selectEntity(quest.id);
                } else {
                    this.renderDetails(null);
                }
            });
        }
    }
    
    /**
     * Handle quest form submission
     * @param {Event} e - Form submit event
     * @param {string} questId - Optional quest ID for editing
     */
    handleQuestFormSubmit(e, questId = null) {
        const isEdit = !!questId;
        
        // Get form values
        const name = document.getElementById('questName').value.trim();
        const type = document.getElementById('questType').value;
        const status = document.getElementById('questStatus').value;
        const description = document.getElementById('questDescription').value.trim();
        
        // Create quest object
        const questData = {
            name,
            type,
            status,
            description,
            updatedAt: new Date()
        };
        
        try {
            let result;
            
            if (isEdit) {
                // Update existing quest
                result = this.update(questId, questData);
                showToast({
                    message: 'Quest updated successfully',
                    type: 'success'
                });
            } else {
                // Add new quest
                questData.createdAt = new Date();
                questData.journalEntries = [];
                questData.characters = [];
                questData.items = [];
                questData.locations = [];
                
                // Ensure these properties are defined to avoid errors
                this.dataManager.appState.characters = this.dataManager.appState.characters || [];
                this.dataManager.appState.loot = this.dataManager.appState.loot || [];
                this.dataManager.appState.locations = this.dataManager.appState.locations || [];
                
                result = this.add(questData);
                showToast({
                    message: 'Quest created successfully',
                    type: 'success'
                });
            }
            
            // Refresh the UI and select the quest
            this.refresh(isEdit ? questId : result.id);
        } catch (error) {
            console.error('Error saving quest:', error);
            showToast({
                message: `Error saving quest: ${error.message}`,
                type: 'error'
            });
        }
    }
    
    /**
     * Show modal to add a related entity to a quest
     * @param {string} questId - ID of the quest
     * @param {string} entityType - Type of entity (characters, items, locations)
     */
    showAddEntityModal(questId, entityType) {
        // Get available entities based on type
        let availableEntities = [];
        let entityIcon = '';
        let entityTitle = '';
        
        const quest = this.getById(questId);
        if (!quest) return;
        
        // Initialize arrays if they don't exist
        if (!quest.characters) quest.characters = [];
        if (!quest.items) quest.items = [];
        if (!quest.locations) quest.locations = [];
        
        // Get entities that are not already associated with the quest
        switch (entityType) {
            case 'characters':
                availableEntities = (this.dataManager.appState.characters || []).filter(
                    c => c && c.id && !quest.characters.includes(c.id)
                );
                entityIcon = 'fa-user-shield';
                entityTitle = 'Character';
                break;
            case 'items':
                availableEntities = (this.dataManager.appState.loot || []).filter(
                    i => i && i.id && !quest.items.includes(i.id)
                );
                entityIcon = 'fa-coins';
                entityTitle = 'Item';
                break;
            case 'locations':
                availableEntities = (this.dataManager.appState.locations || []).filter(
                    l => l && l.id && !quest.locations.includes(l.id)
                );
                entityIcon = 'fa-map-marker-alt';
                entityTitle = 'Location';
                break;
        }
        
        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal fade';
        modalContainer.id = 'addEntityModal';
        modalContainer.tabIndex = '-1';
        modalContainer.setAttribute('aria-hidden', 'true');
        
        // Create modal content
        modalContainer.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add ${entityTitle} to Quest</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${availableEntities.length === 0 ? 
                            `<p class="text-center">No available ${entityType} to add.</p>` : 
                            `<div class="list-group">
                                ${availableEntities.map(entity => `
                                    <button type="button" class="list-group-item list-group-item-action bg-card entity-option"
                                            data-entity-id="${entity.id}">
                                        <i class="fas ${entityIcon} me-2"></i>
                                        ${entity.name || entity.title || entity.id}
                                    </button>
                                `).join('')}
                            </div>`
                        }
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add to document body
        document.body.appendChild(modalContainer);
        
        // Create Bootstrap modal instance
        const modal = new bootstrap.Modal(modalContainer);
        
        // Set up event listeners for entity options
        const entityOptions = modalContainer.querySelectorAll('.entity-option');
        entityOptions.forEach(option => {
            option.addEventListener('click', () => {
                const entityId = option.dataset.entityId;
                this.addRelatedEntity(questId, entityType, entityId);
                modal.hide();
            });
        });
        
        // Set up modal hidden event to remove from DOM
        modalContainer.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modalContainer);
        });
        
        // Show the modal
        modal.show();
    }
    
    /**
     * Add a related entity to a quest
     * @param {string} questId - ID of the quest
     * @param {string} entityType - Type of entity (characters, items, locations)
     * @param {string} entityId - ID of the entity to add
     */
    addRelatedEntity(questId, entityType, entityId) {
        try {
            const quest = this.getById(questId);
            if (!quest) throw new Error('Quest not found');
            
            // Add entity to quest
            if (!quest[entityType]) {
                quest[entityType] = [];
            }
            
            if (!quest[entityType].includes(entityId)) {
                quest[entityType].push(entityId);
                
                // Update quest
                this.update(questId, { [entityType]: quest[entityType] });
                
                // Refresh UI
                this.refresh(questId);
                
                showToast({
                    message: `${entityType.slice(0, -1)} added to quest successfully`,
                    type: 'success'
                });
            }
        } catch (error) {
            console.error(`Error adding ${entityType.slice(0, -1)} to quest:`, error);
            showToast({
                message: `Error adding ${entityType.slice(0, -1)} to quest: ${error.message}`,
                type: 'error'
            });
        }
    }
    
    /**
     * Remove a related entity from a quest
     * @param {string} questId - ID of the quest
     * @param {string} entityType - Type of entity (characters, items, locations)
     * @param {string} entityId - ID of the entity to remove
     */
    removeRelatedEntity(questId, entityType, entityId) {
        try {
            const quest = this.getById(questId);
            if (!quest) throw new Error('Quest not found');
            
            // Remove entity from quest
            if (quest[entityType] && quest[entityType].includes(entityId)) {
                quest[entityType] = quest[entityType].filter(id => id !== entityId);
                
                // Update quest
                this.update(questId, { [entityType]: quest[entityType] });
                
                // Refresh UI
                this.refresh(questId);
                
                showToast({
                    message: `${entityType.slice(0, -1)} removed from quest successfully`,
                    type: 'success'
                });
            }
        } catch (error) {
            console.error(`Error removing ${entityType.slice(0, -1)} from quest:`, error);
            showToast({
                message: `Error removing ${entityType.slice(0, -1)} from quest: ${error.message}`,
                type: 'error'
            });
        }
    }
    
    /**
     * Show form to add or edit a journal entry
     * @param {string} questId - ID of the quest
     * @param {number} entryIndex - Optional index of entry to edit
     */
    showAddJournalEntryForm(questId, entryIndex = null) {
        const quest = this.getById(questId);
        if (!quest) return;
        
        const isEdit = entryIndex !== null;
        const entry = isEdit ? quest.journalEntries[entryIndex] : null;
        const formTitle = isEdit ? 'Edit Journal Entry' : 'Add Journal Entry';
        
        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal fade';
        modalContainer.id = 'journalEntryModal';
        modalContainer.tabIndex = '-1';
        modalContainer.setAttribute('aria-hidden', 'true');
        
        // Create modal content
        modalContainer.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${formTitle}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="journalEntryForm">
                            <div class="mb-3">
                                <label for="entryDate" class="form-label">Date</label>
                                <input type="date" class="form-control" id="entryDate" 
                                       value="${isEdit ? this.formatDateForInput(entry.date) : this.formatDateForInput(new Date())}" required>
                            </div>
                            <div class="mb-3">
                                <label for="entryContent" class="form-label">Content</label>
                                <textarea class="form-control" id="entryContent" rows="5" required>${isEdit ? entry.content : ''}</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="saveJournalEntry">Save Entry</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add to document body
        document.body.appendChild(modalContainer);
        
        // Create Bootstrap modal instance
        const modal = new bootstrap.Modal(modalContainer);
        
        // Set up event listener for save button
        const saveBtn = modalContainer.querySelector('#saveJournalEntry');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const dateInput = document.getElementById('entryDate');
                const contentInput = document.getElementById('entryContent');
                
                if (dateInput && contentInput) {
                    const date = new Date(dateInput.value);
                    const content = contentInput.value.trim();
                    
                    if (content) {
                        if (isEdit) {
                            this.editJournalEntry(questId, entryIndex, { date, content });
                        } else {
                            this.addJournalEntry(questId, { date, content });
                        }
                        
                        modal.hide();
                    }
                }
            });
        }
        
        // Set up modal hidden event to remove from DOM
        modalContainer.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modalContainer);
        });
        
        // Show the modal
        modal.show();
    }
    
    /**
     * Format date for date input field
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date string (YYYY-MM-DD)
     */
    formatDateForInput(date) {
        if (!date) return '';
        
        try {
            const dateObj = new Date(date);
            return dateObj.toISOString().split('T')[0];
        } catch (error) {
            console.error('Error formatting date for input:', error);
            return '';
        }
    }
    
    /**
     * Show form to edit a journal entry
     * @param {string} questId - ID of the quest
     * @param {number} entryIndex - Index of entry to edit
     */
    showEditJournalEntryForm(questId, entryIndex) {
        this.showAddJournalEntryForm(questId, entryIndex);
    }
    
    /**
     * Show confirmation modal for deleting a journal entry
     * @param {string} questId - ID of the quest
     * @param {number} entryIndex - Index of entry to delete
     */
    showDeleteJournalEntryConfirmation(questId, entryIndex) {
        const quest = this.getById(questId);
        if (!quest || !quest.journalEntries || !quest.journalEntries[entryIndex]) return;
        
        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal fade';
        modalContainer.id = 'deleteJournalEntryModal';
        modalContainer.tabIndex = '-1';
        modalContainer.setAttribute('aria-hidden', 'true');
        
        // Create modal content
        modalContainer.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Delete Journal Entry</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to delete this journal entry? This action cannot be undone.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="confirmDeleteJournalEntry">Delete</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add to document body
        document.body.appendChild(modalContainer);
        
        // Create Bootstrap modal instance
        const modal = new bootstrap.Modal(modalContainer);
        
        // Set up event listener for confirm button
        const confirmBtn = modalContainer.querySelector('#confirmDeleteJournalEntry');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.deleteJournalEntry(questId, entryIndex);
                modal.hide();
            });
        }
        
        // Set up modal hidden event to remove from DOM
        modalContainer.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modalContainer);
        });
        
        // Show the modal
        modal.show();
    }
    
    /**
     * Add a journal entry to a quest
     * @param {string} questId - ID of the quest
     * @param {Object} entry - Journal entry to add
     */
    addJournalEntry(questId, entry) {
        try {
            const quest = this.getById(questId);
            if (!quest) throw new Error('Quest not found');
            
            // Initialize journal entries array if it doesn't exist
            if (!quest.journalEntries) {
                quest.journalEntries = [];
            }
            
            // Ensure entry has a valid date
            if (!entry.date) {
                entry.date = new Date();
            }
            
            // Add entry to quest
            quest.journalEntries.push(entry);
            
            // Sort entries by date (newest first)
            quest.journalEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Update quest
            this.update(questId, { journalEntries: quest.journalEntries });
            
            // Refresh UI
            this.refresh(questId);
            
            showToast({
                message: 'Journal entry added successfully',
                type: 'success'
            });
        } catch (error) {
            console.error('Error adding journal entry:', error);
            showToast({
                message: `Error adding journal entry: ${error.message}`,
                type: 'error'
            });
        }
    }
    
    /**
     * Edit a journal entry
     * @param {string} questId - ID of the quest
     * @param {number} entryIndex - Index of entry to edit
     * @param {Object} updatedEntry - Updated journal entry
     */
    editJournalEntry(questId, entryIndex, updatedEntry) {
        try {
            const quest = this.getById(questId);
            if (!quest || !quest.journalEntries || !quest.journalEntries[entryIndex]) {
                throw new Error('Quest or journal entry not found');
            }
            
            // Update entry
            quest.journalEntries[entryIndex] = updatedEntry;
            
            // Sort entries by date (newest first)
            quest.journalEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Update quest
            this.update(questId, { journalEntries: quest.journalEntries });
            
            // Refresh UI
            this.refresh(questId);
            
            showToast({
                message: 'Journal entry updated successfully',
                type: 'success'
            });
        } catch (error) {
            console.error('Error updating journal entry:', error);
            showToast({
                message: `Error updating journal entry: ${error.message}`,
                type: 'error'
            });
        }
    }
    
    /**
     * Delete a journal entry
     * @param {string} questId - ID of the quest
     * @param {number} entryIndex - Index of entry to delete
     */
    deleteJournalEntry(questId, entryIndex) {
        try {
            const quest = this.getById(questId);
            if (!quest || !quest.journalEntries || !quest.journalEntries[entryIndex]) {
                throw new Error('Quest or journal entry not found');
            }
            
            // Remove entry
            quest.journalEntries.splice(entryIndex, 1);
            
            // Update quest
            this.update(questId, { journalEntries: quest.journalEntries });
            
            // Refresh UI
            this.refresh(questId);
            
            showToast({
                message: 'Journal entry deleted successfully',
                type: 'success'
            });
        } catch (error) {
            console.error('Error deleting journal entry:', error);
            showToast({
                message: `Error deleting journal entry: ${error.message}`,
                type: 'error'
            });
        }
    }
}
