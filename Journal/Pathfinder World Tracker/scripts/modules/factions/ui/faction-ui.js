import { FactionManager } from '../faction-manager.js';
import { Faction } from '../models/faction.js';

/**
 * Handles the UI for managing factions
 */
export class FactionUI {
    /**
     * Create a new FactionUI instance
     * @param {HTMLElement} container - The container element to render the UI in
     * @param {Object} dataManager - The application's data manager
     */
    constructor(container, dataManager) {
        this.container = container || document.body;
        this.manager = new FactionManager(dataManager);
        this.dataManager = dataManager;
        this.currentFaction = null;
        this.initialized = false;
        
        // Initialize the UI
        this.initializeUI();
    }
    
    /**
     * Initialize the UI elements and event listeners
     */
    initializeUI() {
        if (this.initialized) return;
        
        // Create the main UI structure if it doesn't exist
        this.container.innerHTML = `
            <div class="factions-container">
                <!-- Header -->
                <header class="factions-header">
                    <h1><i class="fas fa-flag"></i> Factions</h1>
                    <div class="actions">
                        <button id="add-faction-btn" class="btn btn-primary">
                            <i class="fas fa-plus"></i> Add Faction
                        </button>
                    </div>
                </header>
                
                <!-- Search and Filters -->
                <div class="factions-toolbar">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="faction-search" placeholder="Search factions...">
                    </div>
                    <div class="filters">
                        <select id="faction-type-filter" class="form-select">
                            <option value="">All Types</option>
                            <option value="guild">Guild</option>
                            <option value="noble">Noble House</option>
                            <option value="religious">Religious</option>
                            <option value="criminal">Criminal</option>
                            <option value="political">Political</option>
                            <option value="military">Military</option>
                            <option value="merchant">Merchant</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
                
                <!-- Main Content -->
                <div class="factions-content">
                    <!-- Factions List -->
                    <div class="factions-list" id="factions-list">
                        <!-- Faction cards will be dynamically inserted here -->
                        <div class="empty-state">
                            <i class="fas fa-flag fa-3x"></i>
                            <p>No factions found. Create your first faction to get started!</p>
                        </div>
                    </div>
                    
                    <!-- Faction Details -->
                    <div class="faction-details" id="faction-details" style="display: none;">
                        <div class="empty-state">
                            <i class="fas fa-hand-point-left fa-3x"></i>
                            <p>Select a faction to view details</p>
                        </div>
                    </div>
                </div>
                
                <!-- Faction Form (initially hidden) -->
                <div id="faction-form-container" style="display: none;">
                    <div class="faction-form">
                        <div class="faction-form-header">
                            <h2 id="faction-form-title">Add New Faction</h2>
                            <button type="button" class="btn-close" id="close-faction-form"></button>
                        </div>
                        <form id="faction-form">
                            <div class="mb-3">
                                <label for="faction-name" class="form-label">Name</label>
                                <input type="text" class="form-control" id="faction-name" name="name" required>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="faction-type" class="form-label">Type</label>
                                        <select class="form-select" id="faction-type" name="type" required>
                                            <option value="">Select a type...</option>
                                            <option value="guild">Guild</option>
                                            <option value="noble">Noble House</option>
                                            <option value="religious">Religious</option>
                                            <option value="criminal">Criminal</option>
                                            <option value="political">Political</option>
                                            <option value="military">Military</option>
                                            <option value="merchant">Merchant</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="faction-attitude" class="form-label">Attitude</label>
                                        <select class="form-select" id="faction-attitude" name="attitude" required>
                                            <option value="Allied">Allied</option>
                                            <option value="Cautiously Allied">Cautiously Allied</option>
                                            <option value="Friendly">Friendly</option>
                                            <option value="Friendly Rivals">Friendly Rivals</option>
                                            <option value="Neutral" selected>Neutral</option>
                                            <option value="Suspicious">Suspicious</option>
                                            <option value="Hostile">Hostile</option>
                                            <option value="Bitter Enemies">Bitter Enemies</option>
                                            <option value="Kill on Sight">Kill on Sight</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="faction-description" class="form-label">Description</label>
                                <textarea class="form-control" id="faction-description" name="description" rows="3"></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="faction-headquarters" class="form-label">Headquarters</label>
                                <input type="text" class="form-control" id="faction-headquarters" name="headquarters">
                            </div>
                            <div class="mb-3">
                                <label for="faction-tags" class="form-label">Tags (comma-separated)</label>
                                <input type="text" class="form-control" id="faction-tags" name="tags">
                            </div>
                            <div class="mb-3">
                                <label for="faction-influence" class="form-label">Influence: <span id="influence-value">50</span>%</label>
                                <input type="range" class="form-range" id="faction-influence" name="influence" min="0" max="100" value="50">
                            </div>
                            <div class="d-flex justify-content-between">
                                <button type="button" class="btn btn-outline-secondary" id="cancel-faction-form">Cancel</button>
                                <div>
                                    <button type="submit" class="btn btn-primary" id="save-faction-btn">Save Faction</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Cache DOM elements
        this.elements = {
            factionsList: this.container.querySelector('#factions-list'),
            factionSearch: this.container.querySelector('#faction-search'),
            factionDetails: this.container.querySelector('#faction-details'),
            factionFormContainer: this.container.querySelector('#faction-form-container'),
            factionForm: this.container.querySelector('#faction-form'),
            addFactionBtn: this.container.querySelector('#add-faction-btn'),
            typeFilter: this.container.querySelector('#faction-type-filter'),
            saveFactionBtn: this.container.querySelector('#save-faction-btn'),
            cancelFactionBtn: this.container.querySelector('#cancel-faction-form'),
            closeFactionBtn: this.container.querySelector('#close-faction-form'),
            influenceSlider: this.container.querySelector('#faction-influence'),
            influenceValue: this.container.querySelector('#influence-value')
        };
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Render the factions list
        this.renderFactionsList();
        
        this.initialized = true;
    }
    
    /**
     * Refresh the UI
     */
    refresh() {
        this.renderFactionsList();
        if (this.currentFaction) {
            this.showFactionDetails(this.currentFaction.id);
        }
    }
    
    /**
     * Initialize event listeners for the UI
     */
    initEventListeners() {
        // Search functionality
        if (this.elements.factionSearch) {
            this.elements.factionSearch.addEventListener('input', (e) => {
                this.renderFactionsList(e.target.value);
            });
        }
        
        // Type filter
        if (this.elements.typeFilter) {
            this.elements.typeFilter.addEventListener('change', () => {
                this.renderFactionsList(this.elements.factionSearch?.value || '');
            });
        }
        
        // Add faction button
        if (this.elements.addFactionBtn) {
            this.elements.addFactionBtn.addEventListener('click', () => {
                this.showFactionForm();
            });
        }
        
        // Save faction form
        if (this.elements.factionForm) {
            this.elements.factionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveFaction();
            });
        }
        
        // Cancel/close form buttons
        if (this.elements.cancelFactionBtn) {
            this.elements.cancelFactionBtn.addEventListener('click', () => {
                this.hideFactionForm();
            });
        }
        
        if (this.elements.closeFactionBtn) {
            this.elements.closeFactionBtn.addEventListener('click', () => {
                this.hideFactionForm();
            });
        }
        
        // Influence slider
        if (this.elements.influenceSlider && this.elements.influenceValue) {
            this.elements.influenceSlider.addEventListener('input', (e) => {
                this.elements.influenceValue.textContent = e.target.value;
            });
        }
        
        // Delegate events for dynamic content
        this.container.addEventListener('click', (e) => {
            // Handle edit button clicks
            const editBtn = e.target.closest('.btn-edit');
            if (editBtn) {
                const factionId = editBtn.dataset.id;
                if (factionId) {
                    this.showFactionForm(factionId);
                }
                return;
            }
            
            // Handle delete button clicks
            const deleteBtn = e.target.closest('.btn-delete');
            if (deleteBtn) {
                const factionId = deleteBtn.dataset.id;
                if (factionId) {
                    this.confirmDeleteFaction(factionId);
                }
                return;
            }
            
            // Handle toggle active button clicks
            const toggleBtn = e.target.closest('.btn-toggle');
            if (toggleBtn) {
                const factionId = toggleBtn.dataset.id;
                if (factionId) {
                    this.toggleFactionActive(factionId);
                }
                return;
            }
            
            // Handle log influence button clicks
            const logBtn = e.target.closest('.btn-log-influence');
            if (logBtn) {
                const factionId = logBtn.dataset.id;
                if (factionId) {
                    this.showInfluenceLogForm(factionId);
                }
                return;
            }
            
            // Handle faction card clicks (for showing details)
            const factionCard = e.target.closest('.faction-card');
            if (factionCard) {
                const factionId = factionCard.dataset.id;
                if (factionId) {
                    this.showFactionDetails(factionId);
                }
            }
            
            // Refresh the UI
            this.renderFactionsList();
            
            return true;
        });
    }
    
    /**
     * Render the list of factions with optional filtering
     * @param {string} searchTerm - Optional search term to filter factions by name or description
     */
    renderFactionsList(searchTerm = '') {
        if (!this.elements.factionsList) return;
        
        try {
            // Hide any open faction details
            if (this.elements.factionDetails) {
                this.elements.factionDetails.style.display = 'none';
            }
            
            // Show the factions list
            this.elements.factionsList.style.display = 'block';
            
            // Get all factions
            const allFactions = this.manager.getAllFactions();
            
            // Filter factions by search term and type
            const filteredFactions = allFactions.filter(faction => {
                const matchesSearch = !searchTerm || 
                    faction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (faction.description && faction.description.toLowerCase().includes(searchTerm.toLowerCase()));
                
                const typeFilter = this.elements.typeFilter?.value;
                const matchesType = !typeFilter || faction.type === typeFilter;
                
                return matchesSearch && matchesType;
            });
            
            // Clear the list container
            this.elements.factionsList.innerHTML = '';
            
            // If no factions found, show a message
            if (filteredFactions.length === 0) {
                this.elements.factionsList.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-info mb-0">
                            <i class="fas fa-info-circle me-2"></i>
                            No factions found. Try adjusting your search or filters.
                        </div>
                    </div>
                `;
                return;
            }
            
            // Create a row to contain all faction cards
            const row = document.createElement('div');
            row.className = 'row g-4';
            
            // Render each faction as a card
            filteredFactions.forEach((faction) => {
                const col = document.createElement('div');
                col.className = 'col-12 col-md-6 col-lg-4';
                
                // Get influence class for styling
                const influenceClass = this.getInfluenceClass(faction.influence);
                const statusBadge = faction.isActive 
                    ? '<span class="badge bg-success">Active</span>'
                    : '<span class="badge bg-secondary">Inactive</span>';
                
                // Format tags
                const tagsHtml = faction.tags && faction.tags.length > 0 
                    ? `<div class="mt-2">${faction.tags.map(tag => 
                        `<span class="badge bg-secondary me-1 mb-1">${tag}</span>`
                    ).join('')}</div>`
                    : '';
                
                col.innerHTML = `
                    <div class="card h-100 faction-card" data-id="${faction.id}">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">${faction.name}</h5>
                            ${statusBadge}
                        </div>
                        <div class="card-body">
                            ${faction.description ? `<p class="card-text text-muted">${faction.description}</p>` : ''}
                            
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <span class="badge bg-primary">${faction.type || 'No Type'}</span>
                                <span class="badge ${influenceClass}">
                                    <i class="fas fa-chart-line me-1"></i>
                                    ${faction.influence || 0}% Influence
                                </span>
                            </div>
                            
                            ${tagsHtml}
                        </div>
                        <div class="card-footer bg-transparent border-top-0">
                            <div class="d-flex flex-wrap gap-2">
                                <button class="btn btn-sm btn-outline-primary view-faction" data-id="${faction.id}">
                                    <i class="fas fa-eye me-1"></i> View
                                </button>
                                <button class="btn btn-sm btn-outline-secondary edit-faction" data-id="${faction.id}">
                                    <i class="fas fa-edit me-1"></i> Edit
                                </button>
                                <button class="btn btn-sm btn-outline-danger delete-faction" data-id="${faction.id}">
                                    <i class="fas fa-trash me-1"></i> Delete
                                </button>
                                <button class="btn btn-sm btn-outline-info log-influence" data-id="${faction.id}">
                                    <i class="fas fa-chart-line me-1"></i> Log
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                row.appendChild(col);
            });
            
            // Add the row to the factions list
            this.elements.factionsList.appendChild(row);
            
            // Add event delegation for action buttons
            this.elements.factionsList.addEventListener('click', (e) => {
                const button = e.target.closest('button');
                if (!button) return;
                
                const factionId = button.dataset.id;
                if (!factionId) return;
                
                const faction = this.manager.getFaction(factionId);
                if (!faction) return;
                
                if (button.classList.contains('view-faction')) {
                    this.showFactionDetails(factionId);
                } else if (button.classList.contains('edit-faction')) {
                    this.showFactionForm(faction);
                } else if (button.classList.contains('delete-faction')) {
                    this.confirmDeleteFaction(faction);
                } else if (button.classList.contains('log-influence')) {
                    this.showInfluenceLogForm(factionId);
                }
            });
        } catch (error) {
            console.error('Error rendering factions list:', error);
        }
    }
    
    /**
     * Show a form to log influence changes for a faction
     * @param {string} factionId - The ID of the faction to log influence for
     */
    showInfluenceLogForm(factionId) {
        const faction = this.manager.getFaction(factionId);
        if (!faction) return;
        
        const modalId = 'influence-log-modal';
        
        // Remove any existing modals to prevent stacking
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            const bsModal = bootstrap.Modal.getInstance(existingModal);
            if (bsModal) bsModal.dispose();
            existingModal.remove();
        }
        
        // Create the modal container
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'influenceLogModalLabel');
        modal.setAttribute('aria-hidden', 'false');
        modal.style.display = 'block';
        
        // Create modal content
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content bg-dark text-light border border-primary">
                    <div class="modal-header border-primary">
                        <h5 class="modal-title text-primary">
                            <i class="fas fa-chart-line me-2"></i>
                            Log Influence Change
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="influence-log-form">
                            <div class="mb-3">
                                <label for="influence-change" class="form-label">Influence Change</label>
                                <div class="input-group">
                                    <button class="btn btn-outline-primary" type="button" id="decrease-influence">-</button>
                                    <input type="number" class="form-control text-center" id="influence-change" 
                                           name="influenceChange" value="0" min="-100" max="100" required>
                                    <button class="btn btn-outline-primary" type="button" id="increase-influence">+</button>
                                </div>
                                <div class="form-text">Current: ${faction.influence}% → New: <span id="new-influence">${faction.influence}</span>%</div>
                            </div>
                            <div class="mb-3">
                                <label for="log-reason" class="form-label">Reason for Change</label>
                                <textarea class="form-control bg-dark text-light" id="log-reason" 
                                          name="reason" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="log-date" class="form-label">Date</label>
                                <input type="datetime-local" class="form-control bg-dark text-light" 
                                       id="log-date" name="date" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer border-top-0">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="save-influence-log">Save Changes</button>
                    </div>
                </div>
            </div>`;
            
        // Add modal to the DOM first
        document.body.appendChild(modal);
        
        // Set current date/time as default
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(now - timezoneOffset)).toISOString().slice(0, 16);
        const dateInput = modal.querySelector('#log-date');
        if (dateInput) {
            dateInput.value = localISOTime;
        }
        
        // Get references to UI elements
        const influenceInput = modal.querySelector('#influence-change');
        const newInfluenceSpan = modal.querySelector('#new-influence');
        const increaseBtn = modal.querySelector('#increase-influence');
        const decreaseBtn = modal.querySelector('#decrease-influence');
        const form = modal.querySelector('#influence-log-form');
        const saveButton = modal.querySelector('#save-influence-log');
        
        // Update the new influence value when input changes
        const updateInfluenceDisplay = () => {
            const change = parseInt(influenceInput.value) || 0;
            let newInfluence = faction.influence + change;
            
            // Clamp between 0 and 100
            newInfluence = Math.max(0, Math.min(100, newInfluence));
            newInfluenceSpan.textContent = newInfluence;
            
            // Update input value if it was clamped
            if (newInfluence !== faction.influence + change) {
                influenceInput.value = newInfluence - faction.influence;
            }
        };
        
        // Handle + and - buttons
        const updateInfluenceValue = (increment) => {
            const currentValue = parseInt(influenceInput.value) || 0;
            influenceInput.value = increment ? currentValue + 1 : currentValue - 1;
            updateInfluenceDisplay();
        };
        
        // Event listeners
        increaseBtn.addEventListener('click', () => updateInfluenceValue(true));
        decreaseBtn.addEventListener('click', () => updateInfluenceValue(false));
        influenceInput.addEventListener('input', updateInfluenceDisplay);
        
        // Initialize Bootstrap modal with proper options
        const modalInstance = new bootstrap.Modal(modal, {
            backdrop: true,  // Changed from 'static' to allow clicking outside
            keyboard: true,
            focus: true
        });
        
        // Store the modal instance for cleanup
        this._currentInfluenceModal = modalInstance;
        
        // Store reference to this for use in callbacks
        const self = this;
        
        // Show the modal and handle shown event
        const onShown = () => {
            // Focus the reason textarea
            const reasonInput = modal.querySelector('#log-reason');
            if (reasonInput) {
                reasonInput.focus();
            }
            
            // Add click handler to prevent modal from closing when clicking inside
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        };
        
        // Show the modal
        modalInstance.show();
        modal.addEventListener('shown.bs.modal', onShown, { once: true });
        
        // Handle form submission
        const handleSave = async (e) => {
            e && e.preventDefault();
            
            if (!form.checkValidity()) {
                form.reportValidity();
                return false;
            }
            
            const formData = new FormData(form);
            const change = parseInt(formData.get('influenceChange')) || 0;
            const reason = formData.get('reason');
            const date = formData.get('date');
            
            if (!reason || !date) {
                self.showNotification('Please fill in all required fields', 'warning');
                return false;
            }
            
            try {
                // Update faction influence
                const newInfluence = Math.max(0, Math.min(100, faction.influence + change));
                await this.manager.updateFaction(factionId, { 
                    influence: newInfluence,
                    updatedAt: new Date().toISOString()
                });
                
                // Add to influence log
                const logEntry = {
                    id: Date.now().toString(),
                    factionId,
                    change,
                    newInfluence,
                    reason,
                    date: new Date(date).toISOString(),
                    createdAt: new Date().toISOString()
                };
                
                if (this.manager.addInfluenceLogEntry) {
                    await this.manager.addInfluenceLogEntry(logEntry);
                }
                
                self.showNotification(`Influence updated to ${newInfluence}%`, 'success');
                modalInstance.hide();
                
                // Refresh the UI
                self.renderFactionsList();
                
                if (self.currentFaction?.id === factionId) {
                    self.showFactionDetails(factionId);
                }
                
            } catch (error) {
                console.error('Error updating influence:', error);
                self.showNotification(`Failed to update influence: ${error.message}`, 'error');
            }
        };
        
        // Set up form submission
        form.addEventListener('submit', handleSave);
        saveButton.addEventListener('click', handleSave);
        
        // Clean up when modal is closed
        const handleHidden = (e) => {
            // Ensure we're handling the correct modal
            if (e && e.target !== modal) return;
            
            // Remove event listeners
            modal.removeEventListener('shown.bs.modal', onShown);
            
            // Clean up the modal instance
            try {
                if (modalInstance && typeof modalInstance.dispose === 'function') {
                    modalInstance.hide();
                    modalInstance.dispose();
                }
            } catch (error) {
                console.error('Error disposing modal:', error);
            }
            
            // Remove the modal from DOM
            if (modal && modal.parentNode) {
                modal.remove();
            }
            
            // Clear the reference
            if (self._currentInfluenceModal === modalInstance) {
                self._currentInfluenceModal = null;
            }
        };
        
        // Use the 'hidden.bs.modal' event for cleanup
        modal.addEventListener('hidden.bs.modal', handleHidden, { once: true });
    }

    /**
     * Get the CSS class for an influence level
     * @param {number} influence - The influence percentage (0-100)
     * @returns {string} The CSS class for the influence level
     */
    getInfluenceClass(influence) {
        if (influence >= 90) return 'influence-very-high';
        if (influence >= 70) return 'influence-high';
        if (influence >= 50) return 'influence-medium';
        if (influence >= 30) return 'influence-low';
        return 'influence-very-low';
    }

    /**
     * Show a notification to the user
     * @param {string} message - The message to display
     * @param {string} type - The type of notification ('success', 'error', 'info', 'warning')
     * @param {number} [duration=3000] - How long to show the notification in ms
     */
    showNotification(message, type = 'info', duration = 3000) {
        // Create notification container if it doesn't exist
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.position = 'fixed';
            container.style.top = '20px';
            container.style.right = '20px';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.role = 'alert';
        notification.style.marginBottom = '10px';
        notification.style.minWidth = '250px';
        notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        
        // Add message
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Add to container
        container.appendChild(notification);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                notification.classList.remove('show');
                notification.addEventListener('transitionend', () => {
                    if (notification.parentNode === container) {
                        container.removeChild(notification);
                    }
                    // Remove container if empty
                    if (container.children.length === 0) {
                        container.remove();
                    }
                }, { once: true });
            }, duration);
        }

        return notification;
    }

    /**
     * Render the influence log entries for a faction
     * @param {string} factionId - The ID of the faction
     * @returns {string} HTML string of the influence log entries
     */
    renderInfluenceLog(factionId) {
        const faction = this.manager.getFaction(factionId);
        if (!faction?.influenceLog?.length) {
            return '<div class="text-muted">No influence changes logged yet.</div>';
        }
        
        // Sort by date descending (newest first)
        const sortedLogs = [...faction.influenceLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return `
            <div class="list-group">
                ${sortedLogs.map(entry => {
                    const changeClass = entry.change > 0 ? 'text-success' : entry.change < 0 ? 'text-danger' : 'text-muted';
                    const changeIcon = entry.change > 0 ? 'fa-arrow-up' : entry.change < 0 ? 'fa-arrow-down' : 'fa-equals';
                    const changeText = entry.change > 0 ? `+${entry.change}` : entry.change;
                    
                    return `
                        <div class="list-group-item bg-dark border-secondary">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="fw-bold">${new Date(entry.timestamp).toLocaleString()}</div>
                                    <div class="small text-muted">${entry.reason || 'No reason provided'}</div>
                                </div>
                                <div class="d-flex align-items-center">
                                    <span class="badge ${changeClass} me-2">
                                        <i class="fas ${changeIcon} me-1"></i>
                                        ${changeText}% (${entry.newInfluence}% total)
                                    </span>
                                </div>
                            </div>
                        </div>`;
                }).join('')}
            </div>
        `;
    }
    
    /**
     * Render the influence log entries for a faction
     * @param {string} factionId - The ID of the faction
     * @returns {string} HTML string of the influence log entries
     */
    renderInfluenceLog(factionId) {
        const faction = this.manager.getFaction(factionId);
        if (!faction?.influenceLog?.length) {
            return '<div class="text-muted">No influence changes logged yet.</div>';
        }
        
        // Sort by date descending (newest first)
        const sortedLogs = [...faction.influenceLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return `
            <div class="list-group">
                ${sortedLogs.map(entry => {
                    const changeClass = entry.change > 0 ? 'text-success' : entry.change < 0 ? 'text-danger' : 'text-muted';
                    const changeIcon = entry.change > 0 ? 'fa-arrow-up' : entry.change < 0 ? 'fa-arrow-down' : 'fa-equals';
                    const changeText = entry.change > 0 ? `+${entry.change}` : entry.change;
                    
                    return `
                        <div class="list-group-item bg-dark border-secondary">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="fw-bold">${new Date(entry.timestamp).toLocaleString()}</div>
                                    <div class="small text-muted">${entry.reason || 'No reason provided'}</div>
                                </div>
                                <div class="d-flex align-items-center">
                                    <span class="badge ${changeClass} me-2">
                                        <i class="fas ${changeIcon} me-1"></i>
                                        ${changeText}% (${entry.newInfluence}% total)
                                    </span>
                                </div>
                            </div>
                        </div>`;
                }).join('')}
            </div>
        `;
    }
    
    // Helper: Get alignment badge HTML
    getAlignmentBadge(alignment) {
        if (!alignment) return '';
        
        const alignments = {
            'LG': { text: 'Lawful Good', class: 'alignment-lg' },
            'NG': { text: 'Neutral Good', class: 'alignment-ng' },
            'CG': { text: 'Chaotic Good', class: 'alignment-cg' },
            'LN': { text: 'Lawful Neutral', class: 'alignment-ln' },
            'N': { text: 'Neutral', class: 'alignment-n' },
            'CN': { text: 'Chaotic Neutral', class: 'alignment-cn' },
            'LE': { text: 'Lawful Evil', class: 'alignment-le' },
            'NE': { text: 'Neutral Evil', class: 'alignment-ne' },
            'CE': { text: 'Chaotic Evil', class: 'alignment-ce' }
        };
        
        const alignmentData = alignments[alignment.toUpperCase()] || { text: alignment, class: 'alignment-other' };
        return `<span class="alignment-badge ${alignmentData.class}" title="${alignmentData.text}">${alignment}</span>`;
    }
}
