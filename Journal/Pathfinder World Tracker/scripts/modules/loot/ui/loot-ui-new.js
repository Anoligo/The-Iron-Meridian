/**
 * Loot UI Component
 * Handles the rendering and interaction for loot-related UI elements
 * Uses the BaseUI class for consistent UI patterns
 */

import { BaseUI } from '../../../components/base-ui.js';
import { createListItem, createDetailsPanel, showToast } from '../../../components/ui-components.js';
import { ItemType, ItemRarity, ItemCondition } from '../enums/loot-enums.js';
import { getRarityBadgeClass, formatEnumValue, getRarityColor, formatCurrency } from '../../../utils/style-utils.js';

export class LootUI extends BaseUI {
    /**
     * Create a new LootUI instance
     * @param {Object} lootService - Instance of LootService
     * @param {Object} dataManager - Instance of DataManager for accessing related entities
     */
    constructor(lootService, dataManager) {
        super({
            containerId: 'loot-container',
            listId: 'itemList',
            detailsId: 'itemDetails',
            searchId: 'itemSearch',
            addButtonId: 'addItemBtn',
            entityName: 'item',
            getAll: () => lootService.getAllItems(),
            getById: (id) => lootService.getItemById(id),
            add: (item) => lootService.createItem(item),
            update: (id, updates) => lootService.updateItem(id, updates),
            delete: (id) => lootService.deleteItem(id)
        });
        
        this.lootService = lootService;
        this.dataManager = dataManager;
        
        // Bind additional methods
        this.formatCurrency = this.formatCurrency.bind(this);
        this.getRarityColor = this.getRarityColor.bind(this);
        this.toggleAttunementSection = this.toggleAttunementSection.bind(this);
        
        console.log('LootUI initialized with container:', this.container);
    }
    
    /**
     * Create a list item for an item
     * @param {Object} item - Item to create list item for
     * @returns {HTMLElement} The created list item
     */
    createListItem(item) {
        return createListItem({
            id: item.id,
            title: item.name,
            subtitle: `${formatEnumValue(item.type)} ${item.attunedTo ? '(Attuned)' : ''}`,
            icon: 'fas fa-coins',
            isSelected: this.currentEntity && this.currentEntity.id === item.id,
            metadata: {
                'Rarity': formatEnumValue(item.rarity),
                'Value': this.formatCurrency(item.value)
            },
            onClick: (id) => this.handleSelect(id)
        });
    }
    
    /**
     * Render the details for an item
     * @param {Object} item - Item to render details for
     */
    renderDetails(item) {
        // Create sections for the details panel
        const sections = [
            {
                title: 'Basic Information',
                content: `
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Type:</strong> ${formatEnumValue(item.type)}</p>
                            <p><strong>Rarity:</strong> <span class="badge bg-${getRarityBadgeClass(item.rarity)}">${formatEnumValue(item.rarity)}</span></p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Value:</strong> ${this.formatCurrency(item.value)}</p>
                            <p><strong>Condition:</strong> ${formatEnumValue(item.condition)}</p>
                        </div>
                    </div>
                `
            },
            {
                title: 'Description',
                content: `
                    <div class="mb-3">
                        <p>${item.description || 'No description available.'}</p>
                    </div>
                `
            }
        ];
        
        // Add attunement section if applicable
        if (item.requiresAttunement) {
            sections.push({
                title: 'Attunement',
                content: `
                    <div class="mb-3">
                        <p><strong>Requires Attunement:</strong> Yes</p>
                        <p><strong>Attuned To:</strong> ${item.attunedTo || 'Not attuned'}</p>
                    </div>
                `
            });
        }
        
        // Add effects section if applicable
        if (item.effects && item.effects.length > 0) {
            sections.push({
                title: 'Effects',
                content: `
                    <div class="mb-3">
                        <ul class="list-group">
                            ${item.effects.map(effect => `
                                <li class="list-group-item bg-card">${effect}</li>
                            `).join('')}
                        </ul>
                    </div>
                `
            });
        }
        
        // Create the details panel
        const detailsPanel = createDetailsPanel({
            title: item.name,
            data: item,
            actions: [
                {
                    label: 'Edit',
                    icon: 'fas fa-edit',
                    type: 'primary',
                    onClick: () => this.handleEdit(item)
                },
                {
                    label: 'Delete',
                    icon: 'fas fa-trash',
                    type: 'danger',
                    onClick: () => this.handleDelete(item.id)
                }
            ],
            sections: sections
        });
        
        // Clear the details element and append the new details panel
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(detailsPanel);
    }
    
    /**
     * Handle adding a new item
     */
    handleAdd() {
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.id = 'item-form-container';
        formContainer.className = 'card';
        
        // Create form content
        formContainer.innerHTML = `
            <div class="card-header bg-card">
                <h5 class="card-title mb-0">Add New Item</h5>
            </div>
            <div class="card-body bg-card">
                <form id="item-form">
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <label for="item-name" class="form-label">Name</label>
                            <input type="text" class="form-control" id="item-name" required>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="item-type" class="form-label">Type</label>
                            <select class="form-select" id="item-type">
                                <option value="">Select Type</option>
                                ${Object.entries(ItemType).map(([key, value]) => 
                                    `<option value="${value}">${formatEnumValue(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="item-rarity" class="form-label">Rarity</label>
                            <select class="form-select" id="item-rarity">
                                <option value="">Select Rarity</option>
                                ${Object.entries(ItemRarity).map(([key, value]) => 
                                    `<option value="${value}">${formatEnumValue(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="item-value" class="form-label">Value (in copper pieces)</label>
                            <input type="number" class="form-control" id="item-value" min="0" value="0">
                        </div>
                        <div class="col-md-6">
                            <label for="item-condition" class="form-label">Condition</label>
                            <select class="form-select" id="item-condition">
                                <option value="">Select Condition</option>
                                ${Object.entries(ItemCondition).map(([key, value]) => 
                                    `<option value="${value}">${formatEnumValue(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="item-description" class="form-label">Description</label>
                        <textarea class="form-control" id="item-description" rows="4"></textarea>
                    </div>
                    
                    <div class="mb-3 form-check">
                        <input type="checkbox" class="form-check-input" id="item-requires-attunement">
                        <label class="form-check-label" for="item-requires-attunement">Requires Attunement</label>
                    </div>
                    
                    <div id="attunement-section" class="mb-3" style="display: none;">
                        <label for="item-attuned-to" class="form-label">Attuned To</label>
                        <input type="text" class="form-control" id="item-attuned-to">
                    </div>
                    
                    <div class="mb-3">
                        <label for="item-effects" class="form-label">Effects (one per line)</label>
                        <textarea class="form-control" id="item-effects" rows="3"></textarea>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" id="cancel-item-btn">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-1"></i> Save Item
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Add form to details panel
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(formContainer);
        
        // Set up event listeners
        const form = document.getElementById('item-form');
        const cancelBtn = document.getElementById('cancel-item-btn');
        const requiresAttunementCheckbox = document.getElementById('item-requires-attunement');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleItemFormSubmit(e, false));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.refresh();
            });
        }
        
        if (requiresAttunementCheckbox) {
            requiresAttunementCheckbox.addEventListener('change', this.toggleAttunementSection);
        }
    }
    
    /**
     * Handle editing an item
     * @param {Object} item - Item to edit
     */
    handleEdit(item) {
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.id = 'item-form-container';
        formContainer.className = 'card';
        
        // Create form content
        formContainer.innerHTML = `
            <div class="card-header bg-card">
                <h5 class="card-title mb-0">Edit Item: ${item.name}</h5>
            </div>
            <div class="card-body bg-card">
                <form id="item-form" data-item-id="${item.id}">
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <label for="item-name" class="form-label">Name</label>
                            <input type="text" class="form-control" id="item-name" value="${item.name || ''}" required>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="item-type" class="form-label">Type</label>
                            <select class="form-select" id="item-type">
                                <option value="">Select Type</option>
                                ${Object.entries(ItemType).map(([key, value]) => 
                                    `<option value="${value}" ${item.type === value ? 'selected' : ''}>${formatEnumValue(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="item-rarity" class="form-label">Rarity</label>
                            <select class="form-select" id="item-rarity">
                                <option value="">Select Rarity</option>
                                ${Object.entries(ItemRarity).map(([key, value]) => 
                                    `<option value="${value}" ${item.rarity === value ? 'selected' : ''}>${formatEnumValue(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="item-value" class="form-label">Value (in copper pieces)</label>
                            <input type="number" class="form-control" id="item-value" min="0" value="${item.value || 0}">
                        </div>
                        <div class="col-md-6">
                            <label for="item-condition" class="form-label">Condition</label>
                            <select class="form-select" id="item-condition">
                                <option value="">Select Condition</option>
                                ${Object.entries(ItemCondition).map(([key, value]) => 
                                    `<option value="${value}" ${item.condition === value ? 'selected' : ''}>${formatEnumValue(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="item-description" class="form-label">Description</label>
                        <textarea class="form-control" id="item-description" rows="4">${item.description || ''}</textarea>
                    </div>
                    
                    <div class="mb-3 form-check">
                        <input type="checkbox" class="form-check-input" id="item-requires-attunement" ${item.requiresAttunement ? 'checked' : ''}>
                        <label class="form-check-label" for="item-requires-attunement">Requires Attunement</label>
                    </div>
                    
                    <div id="attunement-section" class="mb-3" style="display: ${item.requiresAttunement ? 'block' : 'none'};">
                        <label for="item-attuned-to" class="form-label">Attuned To</label>
                        <input type="text" class="form-control" id="item-attuned-to" value="${item.attunedTo || ''}">
                    </div>
                    
                    <div class="mb-3">
                        <label for="item-effects" class="form-label">Effects (one per line)</label>
                        <textarea class="form-control" id="item-effects" rows="3">${(item.effects || []).join('\n')}</textarea>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" id="cancel-item-btn">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                        <div>
                            <button type="button" class="btn btn-danger me-2" id="delete-item-btn">
                                <i class="fas fa-trash me-1"></i> Delete
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i> Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        `;
        
        // Add form to details panel
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(formContainer);
        
        // Set up event listeners
        const form = document.getElementById('item-form');
        const cancelBtn = document.getElementById('cancel-item-btn');
        const deleteBtn = document.getElementById('delete-item-btn');
        const requiresAttunementCheckbox = document.getElementById('item-requires-attunement');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleItemFormSubmit(e, true));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.refresh(item.id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.handleDelete(item.id);
            });
        }
        
        if (requiresAttunementCheckbox) {
            requiresAttunementCheckbox.addEventListener('change', this.toggleAttunementSection);
        }
    }
    
    /**
     * Toggle the attunement section based on checkbox state
     */
    toggleAttunementSection() {
        const checkbox = document.getElementById('item-requires-attunement');
        const attunementSection = document.getElementById('attunement-section');
        
        if (checkbox && attunementSection) {
            attunementSection.style.display = checkbox.checked ? 'block' : 'none';
        }
    }
    
    /**
     * Handle item form submission
     * @param {Event} e - Form submit event
     * @param {boolean} isEdit - Whether this is an edit operation
     */
    handleItemFormSubmit(e, isEdit = false) {
        e.preventDefault();
        
        try {
            const form = e.target;
            const itemId = isEdit ? form.getAttribute('data-item-id') : null;
            
            // Get form values
            const itemData = {
                name: document.getElementById('item-name').value,
                type: document.getElementById('item-type').value,
                rarity: document.getElementById('item-rarity').value,
                value: parseInt(document.getElementById('item-value').value) || 0,
                condition: document.getElementById('item-condition').value,
                description: document.getElementById('item-description').value,
                requiresAttunement: document.getElementById('item-requires-attunement').checked,
                attunedTo: document.getElementById('item-attuned-to').value,
                effects: document.getElementById('item-effects').value
                    .split('\n')
                    .map(effect => effect.trim())
                    .filter(effect => effect !== '')
            };
            
            let result;
            
            if (isEdit) {
                // Update existing item
                result = this.update(itemId, itemData);
                showToast({
                    message: 'Item updated successfully',
                    type: 'success'
                });
            } else {
                // Create new item
                result = this.add(itemData);
                showToast({
                    message: 'Item created successfully',
                    type: 'success'
                });
            }
            
            // Refresh the UI and select the item
            this.refresh(isEdit ? itemId : result.id);
        } catch (error) {
            console.error('Error saving item:', error);
            showToast({
                message: `Error saving item: ${error.message}`,
                type: 'error'
            });
        }
    }
    
    /**
     * Get the color for an item rarity
     * @param {string} rarity - The rarity value
     * @returns {string} The color hex code
     */
    getRarityColor(rarity) {
        const colors = {
            'COMMON': '#6c757d',      // Gray
            'UNCOMMON': '#198754',    // Green
            'RARE': '#0d6efd',        // Blue
            'VERY_RARE': '#6f42c1',   // Purple
            'LEGENDARY': '#fd7e14',    // Orange
            'ARTIFACT': '#dc3545',     // Red
            'UNIQUE': '#e91e63',       // Pink
        };
        return colors[rarity] || '#6c757d';  // Default to gray
    }
    
    /**
     * Format a currency value
     * @param {number} value - The value in copper pieces
     * @returns {string} The formatted currency string
     */
    formatCurrency(value) {
        if (value === undefined || value === null) return '0 cp';
        
        const pp = Math.floor(value / 1000);
        const gp = Math.floor((value % 1000) / 100);
        const ep = Math.floor((value % 100) / 50);
        const sp = Math.floor((value % 50) / 10);
        const cp = value % 10;
        
        const parts = [];
        if (pp > 0) parts.push(`${pp} pp`);
        if (gp > 0) parts.push(`${gp} gp`);
        if (ep > 0) parts.push(`${ep} ep`);
        if (sp > 0) parts.push(`${sp} sp`);
        if (cp > 0 || parts.length === 0) parts.push(`${cp} cp`);
        
        return parts.join(', ');
    }
}
