import { FactionManager } from '../faction-manager.js';

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
                    <div class="faction-details" id="faction-details">
                        <div class="empty-state">
                            <i class="fas fa-hand-point-left fa-3x"></i>
                            <p>Select a faction to view details</p>
                        </div>
                    </div>
                </div>
                
                <!-- Faction Form (initially hidden) -->
                <div id="faction-form-container" style="display: none;">
                    <!-- Form will be inserted here -->
                </div>
            </div>
        `;
        
        // Cache DOM elements
        this.elements = {
            factionsList: this.container.querySelector('#factions-list'),
            factionSearch: this.container.querySelector('#faction-search'),
            factionDetails: this.container.querySelector('#faction-details'),
            factionFormContainer: this.container.querySelector('#faction-form-container'),
            addFactionBtn: this.container.querySelector('#add-faction-btn'),
            typeFilter: this.container.querySelector('#faction-type-filter')
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
     * Render the list of factions with optional filtering
     * @param {string} searchTerm - Optional search term to filter factions by name or description
     */
    renderFactionsList(searchTerm = '') {
        try {
            if (!this.manager.initialized) {
                console.log('Faction manager not yet initialized, waiting...');
                setTimeout(() => this.renderFactionsList(searchTerm), 100);
                return;
            }

            const factions = Array.from(this.manager.factions.values());
            const searchLower = searchTerm ? searchTerm.toLowerCase() : '';
            const selectedType = this.elements.typeFilter ? this.elements.typeFilter.value : '';

            const filteredFactions = factions.filter(faction => {
                // Filter by search term if provided
                const matchesSearch = !searchLower || 
                    (faction.name && faction.name.toLowerCase().includes(searchLower)) ||
                    (faction.description && faction.description.toLowerCase().includes(searchLower));
                
                // Filter by type if selected
                const matchesType = !selectedType || faction.type === selectedType;
                
                return matchesSearch && matchesType;
            });

            // Clear the current list
            this.elements.factionsList.innerHTML = '';

            // Show empty state if no factions match the filters
            if (filteredFactions.length === 0) {
                this.elements.factionsList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-flag fa-3x"></i>
                        <p>${searchTerm || selectedType ? 'No matching factions found.' : 'No factions found. Create your first faction to get started!'}</p>
                    </div>
                `;
                return;
            }

            // Sort factions by name
            const sortedFactions = [...filteredFactions].sort((a, b) => 
                a.name.localeCompare(b.name)
            );

            // Render each faction card
            sortedFactions.forEach(faction => {
                const factionCard = this.createFactionCard(faction);
                if (factionCard) {
                    this.elements.factionsList.appendChild(factionCard);
                }
            });
        } catch (error) {
            console.error('Error rendering factions list:', error);
            this.elements.factionsList.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                    <p>Error loading factions. Please try refreshing the page.</p>
                </div>
            `;
        }
    }

    // Initialize event listeners
    initEventListeners() {
        // Search functionality
        if (this.elements.factionSearch) {
            this.elements.factionSearch.addEventListener('input', (e) => {
                this.renderFactionsList(e.target.value);
            });
        }

        // Type filter
        if (this.elements.typeFilter) {
            this.elements.typeFilter.addEventListener('change', (e) => {
                this.renderFactionsList();
            });
        }

        // Add faction button
        if (this.elements.addFactionBtn) {
            this.elements.addFactionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showFactionForm();
            });
        }

        // Save faction
        if (this.elements.factionForm) {
            this.elements.factionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveFaction();
            });
        }

        // Delete faction
        if (this.elements.deleteFactionBtn) {
            this.elements.deleteFactionBtn.addEventListener('click', () => {
                if (this.currentFaction) {
                    if (confirm(`Are you sure you want to delete ${this.currentFaction.name}?`)) {
                        this.deleteFaction(this.currentFaction.id);
                    }
                }
            });
        }

        // Influence slider
        if (this.elements.influenceSlider) {
            this.elements.influenceSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                this.elements.influenceValue.textContent = value;
                if (this.currentFaction) {
                    this.currentFaction.influence = parseInt(value, 10);
                }
            });
        }
    }

    // Render the factions list
    renderFactionsList(searchTerm = '') {
        if (!this.elements.factionsList) return;

        let factions = searchTerm 
            ? this.manager.searchFactions(searchTerm)
            : this.manager.getAllFactions();

        // Sort by name by default
        factions.sort((a, b) => a.name.localeCompare(b.name));

        this.elements.factionsList.innerHTML = factions.length > 0
            ? factions.map(faction => this.createFactionCard(faction)).join('')
            : '<div class="empty-state">No factions found. Click "Add Faction" to create one.</div>';

        // Add click handlers to faction cards
        document.querySelectorAll('.faction-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const factionId = card.dataset.id;
                this.showFactionDetails(factionId);
            });
        });
    }

    // Create a faction card element
    createFactionCard(faction) {
        const influenceClass = this.getInfluenceClass(faction.influence);
        const alignment = this.getAlignmentBadge(faction.alignment);
        const tags = faction.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        return `
            <div class="faction-card" data-id="${faction.id}">
                <div class="faction-header">
                    <h3>${faction.name}</h3>
                    <span class="faction-type">${faction.type}</span>
                    ${alignment}
                </div>
                <div class="faction-influence">
                    <div class="influence-bar ${influenceClass}" style="width: ${faction.influence}%"></div>
                    <span class="influence-text">${faction.influence}%</span>
                </div>
                <div class="faction-tags">${tags}</div>
                <div class="faction-description">${faction.description.substring(0, 100)}${faction.description.length > 100 ? '...' : ''}</div>
            </div>
        `;
    }

    // Show the faction form (for add/edit)
    showFactionForm(faction = null) {
        this.currentFaction = faction || new Faction();
        
        // Populate the form
        if (this.elements.factionForm) {
            this.elements.factionForm.elements['name'].value = this.currentFaction.name || '';
            this.elements.factionForm.elements['type'].value = this.currentFaction.type || '';
            this.elements.factionForm.elements['alignment'].value = this.currentFaction.alignment || 'N';
            this.elements.factionForm.elements['description'].value = this.currentFaction.description || '';
            this.elements.factionForm.elements['headquarters'].value = this.currentFaction.headquarters || '';
            this.elements.factionForm.elements['notes'].value = this.currentFaction.notes || '';
            this.elements.factionForm.elements['tags'].value = this.currentFaction.tags.join(', ');
            this.elements.influenceSlider.value = this.currentFaction.influence;
            this.elements.influenceValue.textContent = this.currentFaction.influence;

            // Show the form and hide the details
            if (this.elements.factionDetails) {
                this.elements.factionDetails.style.display = 'none';
            }
            this.elements.factionForm.style.display = 'block';
            
            // Update button text based on add/edit mode
            if (this.elements.saveFactionBtn) {
                this.elements.saveFactionBtn.textContent = faction ? 'Update Faction' : 'Create Faction';
            }
        }
    }

    // Show faction details
    showFactionDetails(factionId) {
        const faction = this.manager.getFaction(factionId);
        if (!faction) return;

        this.currentFaction = faction;
        
        if (this.elements.factionDetails) {
            const influenceClass = this.getInfluenceClass(faction.influence);
            const alignment = this.getAlignmentBadge(faction.alignment);
            const tags = faction.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            
            this.elements.factionDetails.innerHTML = `
                <div class="faction-details-header">
                    <h2>${faction.name}</h2>
                    <div class="faction-meta">
                        <span class="faction-type">${faction.type}</span>
                        ${alignment}
                        <span class="faction-status ${faction.isActive ? 'active' : 'inactive'}">
                            ${faction.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div class="faction-tags">${tags}</div>
                </div>
                
                <div class="faction-details-body">
                    <div class="faction-section">
                        <h3>Influence</h3>
                        <div class="influence-display">
                            <div class="influence-bar ${influenceClass}" style="width: ${faction.influence}%"></div>
                            <span class="influence-text">${faction.influence}%</span>
                        </div>
                        <input type="range" id="influence-slider" min="0" max="100" value="${faction.influence}">
                        <span id="influence-value">${faction.influence}</span>
                    </div>
                    
                    <div class="faction-section">
                        <h3>Description</h3>
                        <p>${faction.description || 'No description provided.'}</p>
                    </div>
                    
                    ${faction.headquarters ? `
                        <div class="faction-section">
                            <h3>Headquarters</h3>
                            <p>${faction.headquarters}</p>
                        </div>
                    ` : ''}
                    
                    ${faction.leaders.length > 0 ? `
                        <div class="faction-section">
                            <h3>Leaders</h3>
                            <ul>
                                ${faction.leaders.map(leader => `<li>${leader}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${faction.goals.length > 0 ? `
                        <div class="faction-section">
                            <h3>Goals</h3>
                            <ul>
                                ${faction.goals.map(goal => `<li>${goal}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${faction.assets.length > 0 ? `
                        <div class="faction-section">
                            <h3>Assets</h3>
                            <ul>
                                ${faction.assets.map(asset => `<li>${asset}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${faction.notes ? `
                        <div class="faction-section">
                            <h3>Notes</h3>
                            <p>${faction.notes}</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="faction-details-footer">
                    <button id="edit-faction-btn" class="btn btn-edit">Edit</button>
                    <button id="toggle-active-btn" class="btn ${faction.isActive ? 'btn-warning' : 'btn-success'}">
                        ${faction.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button id="delete-faction-btn" class="btn btn-danger">Delete</button>
                </div>
            `;
            
            // Show the details and hide the form
            this.elements.factionForm.style.display = 'none';
            this.elements.factionDetails.style.display = 'block';
            
            // Add event listeners for the action buttons
            const editBtn = document.getElementById('edit-faction-btn');
            const toggleBtn = document.getElementById('toggle-active-btn');
            const deleteBtn = document.getElementById('delete-faction-btn');
            
            if (editBtn) {
                editBtn.addEventListener('click', () => this.showFactionForm(faction));
            }
            
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => this.toggleFactionActive(faction.id));
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    if (confirm(`Are you sure you want to delete ${faction.name}?`)) {
                        this.deleteFaction(faction.id);
                    }
                });
            }
            
            // Update the influence slider
            const influenceSlider = document.getElementById('influence-slider');
            const influenceValue = document.getElementById('influence-value');
            
            if (influenceSlider) {
                influenceSlider.addEventListener('input', (e) => {
                    const value = e.target.value;
                    influenceValue.textContent = value;
                    this.manager.updateFaction(faction.id, { influence: parseInt(value, 10) });
                    this.renderFactionsList(this.elements.factionSearch?.value || '');
                });
            }
        }
    }

    // Save the current faction
    saveFaction() {
        if (!this.elements.factionForm) return;
        
        const formData = new FormData(this.elements.factionForm);
        const factionData = {
            name: formData.get('name') || 'Unnamed Faction',
            type: formData.get('type') || '',
            alignment: formData.get('alignment') || 'N',
            description: formData.get('description') || '',
            headquarters: formData.get('headquarters') || '',
            notes: formData.get('notes') || '',
            tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            influence: parseInt(this.elements.influenceSlider?.value || '50', 10)
        };
        
        if (this.currentFaction && this.currentFaction.id) {
            // Update existing faction
            this.manager.updateFaction(this.currentFaction.id, factionData);
        } else {
            // Create new faction
            this.manager.createFaction(factionData);
        }
        
        // Refresh the UI
        this.renderFactionsList(this.elements.factionSearch?.value || '');
        
        // Show the details for the updated/created faction
        if (this.currentFaction && this.currentFaction.id) {
            this.showFactionDetails(this.currentFaction.id);
        } else if (this.currentFaction) {
            // If it's a new faction, find it by name (this is a bit of a hack)
            const allFactions = this.manager.getAllFactions();
            const newFaction = allFactions.find(f => f.name === factionData.name);
            if (newFaction) {
                this.showFactionDetails(newFaction.id);
            }
        }
        
        // Hide the form
        this.elements.factionForm.style.display = 'none';
        if (this.elements.factionDetails) {
            this.elements.factionDetails.style.display = 'block';
        }
    }

    // Delete a faction
    deleteFaction(factionId) {
        if (this.manager.deleteFaction(factionId)) {
            // Clear the current faction
            this.currentFaction = null;
            
            // Refresh the UI
            this.renderFactionsList(this.elements.factionSearch?.value || '');
            
            // Clear the details panel
            if (this.elements.factionDetails) {
                this.elements.factionDetails.style.display = 'none';
            }
            
            // Show the empty state if no factions left
            if (this.manager.getAllFactions().length === 0) {
                this.elements.factionsList.innerHTML = '<div class="empty-state">No factions found. Click "Add Faction" to create one.</div>';
            }
            
            return true;
        }
        return false;
    }

    // Toggle faction active status
    toggleFactionActive(factionId) {
        const faction = this.manager.getFaction(factionId);
        if (!faction) return;
        
        const isActive = this.manager.toggleFactionActive(factionId);
        
        // Update the UI
        const toggleBtn = document.getElementById('toggle-active-btn');
        if (toggleBtn) {
            toggleBtn.textContent = isActive ? 'Deactivate' : 'Activate';
            toggleBtn.className = isActive ? 'btn btn-warning' : 'btn btn-success';
        }
        
        // Update the status in the details header if it exists
        const statusElement = document.querySelector('.faction-status');
        if (statusElement) {
            statusElement.textContent = isActive ? 'Active' : 'Inactive';
            statusElement.className = `faction-status ${isActive ? 'active' : 'inactive'}`;
        }
        
        // Refresh the list to update the status
        this.renderFactionsList(this.elements.factionSearch?.value || '');
    }

    // Helper: Get CSS class for influence level
    getInfluenceClass(influence) {
        if (influence >= 75) return 'influence-high';
        if (influence >= 50) return 'influence-medium';
        if (influence >= 25) return 'influence-low';
        return 'influence-very-low';
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
