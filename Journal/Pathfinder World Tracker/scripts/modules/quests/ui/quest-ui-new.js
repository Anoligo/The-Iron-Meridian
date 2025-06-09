/**
 * Quest UI Component
 * Handles the rendering and interaction for quest-related UI elements
 * Uses the BaseUI class for consistent UI patterns
 */

import { BaseUI } from '../../../components/base-ui.js';
import { createListItem, createDetailsPanel, showToast, createFormField } from '../../../components/ui-components.js';
import { QuestType, QuestStatus } from '../enums/quest-enums.js';
import { formatDate } from '../../../utils/date-utils.js';

// Re-export showToast for consistency
const showToastMessage = (message, type = 'info', duration = 3000) => {
    showToast({ message, type, duration });
};

export class QuestUI extends BaseUI {
    /**
     * Create a new QuestUI instance
     * @param {Object} questService - Instance of QuestService
     * @param {Object} options - Configuration options
     * @param {Object} options.container - Container elements
     * @param {HTMLElement} options.container.list - List container element
     * @param {HTMLElement} options.container.details - Details container element
     * @param {HTMLElement} options.container.search - Search input element
     * @param {HTMLElement} options.container.addButton - Add button element
     * @param {HTMLElement} [options.container.editButton] - Edit button element
     * @param {HTMLElement} [options.container.deleteButton] - Delete button element
     * @param {Object} options.appState - Application state
     */
    constructor(questService, options = {}) {
        super({
            containerId: 'quests',
            listId: 'questList',
            detailsId: 'questDetails',
            searchId: 'questSearch',
            addButtonId: 'addQuestBtn',
            editButtonId: 'editQuestBtn',
            deleteButtonId: 'deleteQuestBtn',
            entityName: 'quest',
            getAll: () => questService.getAllQuests(),
            getById: (id) => questService.getQuestById(id),
            add: (quest) => questService.createQuest(quest),
            update: (id, updates) => questService.updateQuest(id, updates),
            delete: (id) => questService.deleteQuest(id)
        });
        
        this.questService = questService;
        this.dataManager = options.appState || {};
        this.currentEntity = null;
        this.isEditing = false;
        
        // Initialize UI elements
        this.initializeElements();
        this.bindEvents();
        this.refreshQuestList();
    }
    
    /**
     * Initialize UI elements
     */
    initializeElements() {
        this.listContainer = document.getElementById(this.listId) || document.createElement('div');
        this.detailsContainer = document.getElementById(this.detailsId) || document.createElement('div');
        this.searchInput = document.getElementById(this.searchId) || document.createElement('input');
        this.addButton = document.getElementById(this.addButtonId) || document.createElement('button');
        this.editButton = document.getElementById(this.editButtonId) || document.createElement('button');
        this.deleteButton = document.getElementById(this.deleteButtonId) || document.createElement('button');
        
        // Create form container if it doesn't exist
        this.formContainer = document.createElement('div');
        this.formContainer.className = 'quest-form-container';
        this.detailsContainer.appendChild(this.formContainer);
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Add button click
        this.addButton.addEventListener('click', () => this.showQuestForm());
        
        // Edit button click
        this.editButton.addEventListener('click', () => this.showQuestForm(this.currentEntity));
        
        // Delete button click
        this.deleteButton.addEventListener('click', () => {
            if (this.currentEntity) {
                if (confirm('Are you sure you want to delete this quest?')) {
                    this.deleteQuest(this.currentEntity.id);
                }
            }
        });
        
        // Search input
        this.searchInput.addEventListener('input', (e) => this.filterQuests(e.target.value));
    }
        this.elements = {
            container: options.container?.list?.parentElement || document.getElementById('quests'),
            list: options.container?.list || document.getElementById('questList'),
            details: options.container?.details || document.getElementById('questDetails'),
            search: options.container?.search || document.getElementById('questSearch'),
            addButton: options.container?.addButton || document.getElementById('addQuestBtn'),
            editButton: options.container?.editButton || document.getElementById('editQuestBtn'),
            deleteButton: options.container?.deleteButton || document.getElementById('deleteQuestBtn')
        };
        
        // Validate required elements
        if (!this.elements.container || !this.elements.list || !this.elements.details) {
            console.error('Required quest UI elements not found');
            return;
        }
        
        // Initialize event listeners
        this._initEventListeners();
        
        // Initial render
        this.render();
    }
    
    /**
     * Initialize event listeners
     * @private
     */
    _initEventListeners() {
        // Add button click
        if (this.elements.addButton) {
            this.elements.addButton.addEventListener('click', () => this._handleAddQuest());
        }
        
        // Edit button click
        if (this.elements.editButton) {
            this.elements.editButton.addEventListener('click', () => this._handleEditQuest());
        }
        
        // Delete button click
        if (this.elements.deleteButton) {
            this.elements.deleteButton.addEventListener('click', () => this._handleDeleteQuest());
        }
        
        // Search input
        if (this.elements.search) {
            this.elements.search.addEventListener('input', (e) => this._handleSearch(e));
        }
    }
    
    /**
     * Render the quest list and details
     */
    filterQuests(searchTerm) {
        const quests = this.questService.getAllQuests();
        const filtered = quests.filter(quest => 
            quest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quest.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderQuestList(filtered);
    }
    
    /**
     * Render the quest list
     * @param {Array} quests - Array of quests to display
     */
    renderQuestList(quests = []) {
        this.listContainer.innerHTML = '';
        
        if (quests.length === 0) {
            this.listContainer.innerHTML = '<div class="empty-state">No quests found. Click the + button to add a new quest.</div>';
                <div class="text-center text-muted py-3">
                    <i class="fas fa-scroll fa-2x mb-2"></i>
                    <p>No quests found. Click "Add Quest" to get started.</p>
                </div>`;
            return;
        }
        
        quests.forEach(quest => {
            const item = this._createQuestListItem(quest);
            this.elements.list.appendChild(item);
        });
    }
    
    /**
     * Create a quest list item element
     * @param {Object} quest - The quest data
     * @returns {HTMLElement} The created list item
     * @private
     */
    _createQuestListItem(quest) {
        const item = document.createElement('div');
        item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        item.dataset.id = quest.id;
        
        if (this.currentEntity && this.currentEntity.id === quest.id) {
            item.classList.add('active');
        }
        
        const statusClass = getStatusBadgeClass(quest.status);
        const typeClass = getQuestTypeBadgeClass(quest.type);
        
        item.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${statusClass} me-2">${formatEnumValue(quest.status)}</span>
                <span class="badge ${typeClass} me-2">${formatEnumValue(quest.type)}</span>
                <span class="quest-title">${quest.name || 'Unnamed Quest'}</span>
            </div>
            <small class="text-muted">${new Date(quest.updatedAt).toLocaleDateString()}</small>
        `;
        
        item.addEventListener('click', () => this._selectQuest(quest.id));
        
        return item;
    }
    
    /**
     * Render the quest details
     * @private
     */
    _renderQuestDetails() {
        if (!this.elements.details) return;
        
        if (!this.currentEntity) {
            this.elements.details.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-scroll fa-3x mb-3"></i>
                    <p>Select a quest to view details</p>
                </div>`;
            
            // Hide edit/delete buttons when no quest is selected
            if (this.elements.editButton) this.elements.editButton.style.display = 'none';
            if (this.elements.deleteButton) this.elements.deleteButton.style.display = 'none';
            return;
        }
        
        const quest = this.currentEntity;
        const statusClass = getStatusBadgeClass(quest.status);
        const typeClass = getQuestTypeBadgeClass(quest.type);
        
        this.elements.details.innerHTML = `
            <h3 class="h4 mb-3">${quest.name || 'Unnamed Quest'}</h3>
            
            <div class="mb-3">
                <span class="badge ${statusClass} me-2">${formatEnumValue(quest.status)}</span>
                <span class="badge ${typeClass}">${formatEnumValue(quest.type)}</span>
            </div>
            
            ${quest.description ? `<div class="mb-3"><p>${quest.description}</p></div>` : ''}
            
            <div class="text-muted small">
                <div>Created: ${new Date(quest.createdAt).toLocaleString()}</div>
                <div>Updated: ${new Date(quest.updatedAt).toLocaleString()}</div>
            </div>
        `;
        
        // Show edit/delete buttons when a quest is selected
        if (this.elements.editButton) this.elements.editButton.style.display = 'inline-block';
        if (this.elements.deleteButton) this.elements.deleteButton.style.display = 'inline-block';
    }
    
    /**
     * Handle search input
     * @param {Event} e - The input event
     * @private
     */
    _handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const quests = this.questService.getAllQuests();
        
        if (!searchTerm) {
            this._renderQuestList();
            return;
        }
        
        const filteredQuests = quests.filter(quest => 
            (quest.name && quest.name.toLowerCase().includes(searchTerm)) ||
            (quest.description && quest.description.toLowerCase().includes(searchTerm)) ||
            (quest.status && quest.status.toLowerCase().includes(searchTerm)) ||
            (quest.type && quest.type.toLowerCase().includes(searchTerm))
        );
        
        this._renderFilteredQuests(filteredQuests);
    }
    
    /**
     * Render filtered quests
     * @param {Array} quests - The filtered quests to render
     * @private
     */
    _renderFilteredQuests(quests) {
        if (!this.elements.list) return;
        
        this.elements.list.innerHTML = '';
        
        if (quests.length === 0) {
            this.elements.list.innerHTML = `
                <div class="text-center text-muted py-3">
                    <i class="fas fa-search fa-2x mb-2"></i>
                    <p>No quests match your search</p>
                </div>`;
            return;
        }
        
        quests.forEach(quest => {
            const item = this._createQuestListItem(quest);
            this.elements.list.appendChild(item);
        });
    }
    
    /**
     * Select a quest and display its details
     * @param {string} questId - The ID of the quest to select
     * @private
     */
    _selectQuest(questId) {
        const quest = this.questService.getQuestById(questId);
        if (!quest) return;
        
        this.currentEntity = quest;
        this._renderQuestList(); // Update active state in the list
        this._renderQuestDetails();
    }
    
    /**
     * Handle add quest button click
     * @private
     */
    _handleAddQuest() {
        const newQuest = {
            name: 'New Quest',
            description: '',
            type: 'MAIN',
            status: 'NOT_STARTED',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        try {
            const createdQuest = this.questService.createQuest(newQuest);
            this.currentEntity = createdQuest;
            this.render();
            showToastMessage('Quest created successfully', 'success');
        } catch (error) {
            console.error('Error creating quest:', error);
            showToastMessage('Failed to create quest', 'error');
        }
    }
    
    /**
     * Handle edit quest button click
     * @private
     */
    _handleEditQuest() {
        if (!this.currentEntity) return;
        
        // In a real implementation, this would open a modal or form for editing
        // For now, we'll just show a message
        showToastMessage('Edit functionality coming soon!', 'info');
    }
    
    /**
     * Handle delete quest button click
     * @private
     */
    _handleDeleteQuest() {
        if (!this.currentEntity) return;
        
        if (confirm('Are you sure you want to delete this quest? This action cannot be undone.')) {
            try {
                this.questService.deleteQuest(this.currentEntity.id);
                this.currentEntity = null;
                this.render();
                showToastMessage('Quest deleted successfully', 'success');
            } catch (error) {
                console.error('Error deleting quest:', error);
                showToastMessage('Failed to delete quest', 'error');
            }
        }
    }
}