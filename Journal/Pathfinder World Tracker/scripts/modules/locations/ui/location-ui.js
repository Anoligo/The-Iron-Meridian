import { LocationType, DiscoveryStatus } from '../enums/location-enums.js';

/**
 * UI component for handling location-related user interface
 */
export class LocationUI {
    /**
     * Create a new LocationUI instance
     * @param {LocationService} locationService - The location service instance
     * @param {HTMLElement} container - The container element for the UI
     */
    constructor(locationService, container) {
        this.locationService = locationService;
        this.container = container;
        this.currentLocation = null;
        this.setupEventListeners();
    }

    /**
     * Set up event listeners for the UI
     */
    setupEventListeners() {
        // Remove any existing event listeners to prevent duplicates
        const existingContainer = this.container.cloneNode(false);
        this.container.parentNode.replaceChild(existingContainer, this.container);
        this.container = existingContainer;
        
        // Add event delegation for dynamic elements
        this.container.addEventListener('click', (e) => {
            // Check if the Add Location button was clicked
            if (e.target.closest('.add-location-btn')) {
                e.preventDefault();
                // Check if a form is already open
                const existingForm = document.querySelector('.location-form-container');
                if (existingForm) {
                    // Form already exists, don't create another one
                    return;
                }
                this.showAddLocationForm();
            } 
            // Check if the Save Location button was clicked
            else if (e.target.closest('.save-location-btn')) {
                e.preventDefault();
                this.handleSaveLocation();
            } 
            // Check if the Cancel button was clicked
            else if (e.target.closest('.cancel-location-btn')) {
                e.preventDefault();
                this.hideLocationForm();
            } 
            // Check if a location item was clicked
            else if (e.target.closest('.location-item')) {
                const locationId = e.target.closest('.location-item').dataset.id;
                this.showLocationDetails(locationId);
            }
        });

        // Search input handler
        const searchInput = this.container.querySelector('.location-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                this.filterLocations(query);
            });
        }

        // Type filter handler
        const typeFilter = this.container.querySelector('.location-type-filter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                const type = e.target.value === 'all' ? null : e.target.value;
                this.filterLocationsByType(type);
            });
        }
    }

    /**
     * Render the locations list
     * @param {Array} locations - The locations to display
     */
    renderLocationList(locations = null) {
        // Make sure we have a locations section
        const locationsSection = document.getElementById('locations');
        if (!locationsSection) {
            console.error('Locations section not found');
            return;
        }
        const locationsToRender = locations || this.locationService.getAllLocations();
        console.log('Locations to render:', locationsToRender);
        
        // Create a sample location if none exist
        if (!locationsToRender || locationsToRender.length === 0) {
            console.log('No locations found, creating a sample location');
            this.createSampleLocation();
            // Refresh the locations list after creating a sample
            return this.renderLocationList();
        }
        
        this.container.innerHTML = `
            <div class="locations-header container">
                <h2 class="text-accent">Locations</h2>
                <div class="d-flex gap-2 align-items-center">
                    <input type="text" class="form-control bg-card text location-search" id="locationSearch" placeholder="Search locations..." />
                    <select class="form-select bg-card text location-type-filter">
                        <option value="all">All Types</option>
                        ${Object.entries(LocationType).map(([key, value]) => 
                            `<option value="${value}">${key.charAt(0) + key.slice(1).toLowerCase()}</option>`
                        ).join('')}
                    </select>
                    <button class="button add-location-btn">
                        <i class="fas fa-plus"></i> Add Location
                    </button>
                </div>
            </div>
            <div class="locations-list container">
                <div class="display-grid">
                    ${locationsToRender.length > 0 
                        ? locationsToRender.map(location => this.renderLocationItem(location)).join('')
                        : '<div class="no-locations p-3 text-center">No locations found. Add your first location to get started!</div>'
                    }
                </div>
            </div>`;
            
        this.setupEventListeners();
        
        // Add location details container if it doesn't exist
        if (!this.container.querySelector('.location-details-container')) {
            const detailsContainer = document.createElement('div');
            detailsContainer.className = 'location-details-container';
            this.container.appendChild(detailsContainer);
        }
    }
    
    /**
     * Create a sample location for demonstration purposes
     */
    createSampleLocation() {
        const sampleLocation = {
            name: 'The Iron Citadel',
            description: 'A massive fortress built of dark iron, standing as the last bastion against the encroaching wilderness.',
            type: LocationType.SETTLEMENT,
            discoveryStatus: DiscoveryStatus.DISCOVERED,
            coordinates: { x: 50, y: 50 },
            connectedLocations: []
        };
        
        try {
            this.locationService.createLocation(sampleLocation);
            console.log('Sample location created successfully');
        } catch (error) {
            console.error('Error creating sample location:', error);
        }
    }

    /**
     * Render a single location item
     * @param {Location} location - The location to render
     * @returns {string} HTML string for the location item
     */
    renderLocationItem(location) {
        return `
            <div class="card" data-id="${location.id}">
                <div class="d-flex align-items-center mb-2">
                    <div class="location-icon me-2">
                        <i class="fas ${this.getLocationIcon(location.type)}"></i>
                    </div>
                    <div class="location-info">
                        <h3 class="text-accent mb-0">${location.name}</h3>
                        <span class="location-type">${this.formatLocationType(location.type)}</span>
                    </div>
                </div>
                ${location.description ? `<p class="location-description">${location.description.substring(0, 100)}${location.description.length > 100 ? '...' : ''}</p>` : ''}
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <div class="location-status">
                        ${location.discovered 
                            ? '<span class="badge bg-success">Discovered</span>' 
                            : '<span class="badge bg-secondary">Undiscovered</span>'}
                    </div>
                    <div class="location-actions">
                        <button class="button view-location-btn" data-id="${location.id}">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Show the location details view
     * @param {string} locationId - The ID of the location to show
     */
    showLocationDetails(locationId) {
        const location = this.locationService.getLocationById(locationId);
        if (!location) return;

        this.currentLocation = location;
        
        const detailsContainer = this.container.querySelector('.location-details-container') || 
                               document.createElement('div');
        detailsContainer.className = 'location-details-container';
        
        detailsContainer.innerHTML = `
            <div class="location-details card">
                <div class="location-details-header d-flex justify-content-between align-items-center mb-3">
                    <h2 class="text-accent">${location.name}</h2>
                    <div>
                        <button class="button edit-location-btn" data-id="${location.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="button delete-location-btn" data-id="${location.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
                
                <div class="location-details-body">
                    <div class="location-meta mb-3">
                        <div class="d-flex flex-wrap gap-3">
                            <div class="location-type">
                                <strong>Type:</strong> ${this.formatLocationType(location.type)}
                            </div>
                            <div class="location-coordinates">
                                <strong>Coordinates:</strong> (${location.x}, ${location.y})
                            </div>
                            <div class="location-status">
                                <strong>Status:</strong> 
                                ${location.discovered 
                                    ? '<span class="badge bg-success">Discovered</span>' 
                                    : '<span class="badge bg-secondary">Undiscovered</span>'}
                            </div>
                        </div>
                    </div>
                    
                    ${location.description ? `
                        <div class="location-description mb-3">
                            <h4 class="text-accent">Description</h4>
                            <div class="p-3 bg-card rounded border border-secondary text">
                                ${location.description}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="row">
                        ${location.relatedQuests && location.relatedQuests.length > 0 ? `
                            <div class="col-md-6 mb-3">
                                <div class="card">
                                    <div class="card-header d-flex justify-content-between align-items-center">
                                        <span class="text-accent">Related Quests</span>
                                        <button class="btn btn-sm btn-outline-secondary add-quest-btn">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                    <div class="card-body">
                                        <ul class="list-group list-group-flush">
                                            ${location.relatedQuests.map(questId => {
                                                const quest = this.locationService.dataManager.getQuestById(questId);
                                                return `<li class="list-group-item bg-card">${quest ? quest.title : `Quest #${questId}`}</li>`;
                                            }).join('')}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${location.relatedItems && location.relatedItems.length > 0 ? `
                            <div class="col-md-6 mb-3">
                                <div class="card">
                                    <div class="card-header d-flex justify-content-between align-items-center">
                                        <span class="text-accent">Notable Items</span>
                                        <button class="btn btn-sm btn-outline-secondary add-item-btn">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                    <div class="card-body">
                                        <ul class="list-group list-group-flush">
                                            ${location.relatedItems.map(itemId => {
                                                const item = this.locationService.dataManager.getLootById?.(itemId);
                                                return `<li class="list-group-item bg-card">${item ? item.name : `Item #${itemId}`}</li>`;
                                            }).join('')}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${location.npcs && location.npcs.length > 0 ? `
                            <div class="col-md-6 mb-3">
                                <div class="card">
                                    <div class="card-header d-flex justify-content-between align-items-center">
                                        <span class="text-accent">NPCs</span>
                                        <button class="btn btn-sm btn-outline-secondary add-npc-btn">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                    <div class="card-body">
                                        <ul class="list-group list-group-flush">
                                            ${location.npcs.map(npcId => {
                                                const npc = this.locationService.dataManager.getCharacterById?.(npcId);
                                                return `<li class="list-group-item bg-card">${npc ? npc.name : `NPC #${npcId}`}</li>`;
                                            }).join('')}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${location.connections && location.connections.length > 0 ? `
                            <div class="col-md-6 mb-3">
                                <div class="card">
                                    <div class="card-header d-flex justify-content-between align-items-center">
                                        <span class="text-accent">Connections</span>
                                        <button class="btn btn-sm btn-outline-secondary add-connection-btn">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                    <div class="card-body">
                                        <ul class="list-group list-group-flush">
                                            ${location.connections.map(conn => {
                                                const connectedLocation = this.locationService.getLocationById(conn.locationId);
                                                return `<li class="list-group-item bg-card">${conn.type} to ${connectedLocation ? connectedLocation.name : `Location #${conn.locationId}`}</li>`;
                                            }).join('')}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        if (!this.container.contains(detailsContainer)) {
            this.container.appendChild(detailsContainer);
        }
    }

    /**
     * Show the add location form
     */
    showAddLocationForm() {
        // Check if a form already exists
        const existingForm = document.querySelector('.location-form-container');
        if (existingForm) {
            // Form already exists, don't create another one
            return;
        }
        
        // Create the form container
        const formContainer = document.createElement('div');
        formContainer.className = 'location-form-container card';
        formContainer.id = 'locationFormContainer'; // Add an ID for easier reference
        formContainer.innerHTML = `
            <div class="location-form">
                <h3 class="text-accent mb-3">Add New Location</h3>
                <form id="locationForm">
                    <div class="form-group mb-3">
                        <label for="locationName" class="form-label">Name</label>
                        <input type="text" class="form-control bg-card text" id="locationName" required />
                    </div>
                    
                    <div class="form-group mb-3">
                        <label for="locationType" class="form-label">Type</label>
                        <select id="locationType" class="form-select bg-card text" required>
                            ${Object.entries(LocationType).map(([key, value]) => 
                                `<option value="${value}">${key.charAt(0) + key.slice(1).toLowerCase()}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="locationX" class="form-label">X Coordinate</label>
                            <input type="number" class="form-control bg-card text" id="locationX" required />
                        </div>
                        <div class="col-md-6">
                            <label for="locationY" class="form-label">Y Coordinate</label>
                            <input type="number" id="locationY" class="form-control bg-card text" value="0" />
                        </div>
                    </div>
                    
                    <div class="form-group mb-3">
                        <label for="locationDescription" class="form-label">Description</label>
                        <textarea id="locationDescription" class="form-control bg-card text" rows="3"></textarea>
                    </div>
                    
                    <div class="form-check mb-3">
                        <input type="checkbox" class="form-check-input" id="locationDiscovered" />
                        <label class="form-check-label" for="locationDiscovered">Discovered</label>
                    </div>
                    
                    <div class="d-flex justify-content-end gap-2">
                        <button type="button" class="button cancel-location-btn">Cancel</button>
                        <button type="button" class="button save-location-btn">Save Location</button>
                    </div>
                </form>
            </div>
        `;

        // Add form event listeners
        formContainer.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSaveLocation();
        });
        
        formContainer.querySelector('.cancel-location-btn').addEventListener('click', () => {
            this.hideLocationForm();
        });
        
        formContainer.querySelector('.save-location-btn').addEventListener('click', () => {
            this.handleSaveLocation();
        });

        // Replace the details container with the form
        const detailsContainer = this.container.querySelector('.location-details-container');
        if (detailsContainer) {
            detailsContainer.replaceWith(formContainer);
        } else {
            this.container.appendChild(formContainer);
        }

        // Focus the name field after a short delay to ensure the form is rendered
        setTimeout(() => {
            const nameInput = formContainer.querySelector('#locationName');
            if (nameInput) nameInput.focus();
        }, 50);
    }

    /**
     * Handle saving a location from the form
     */
    handleSaveLocation() {
        const form = document.getElementById('locationForm');
        if (!form) return;

        const locationData = {
            name: form.querySelector('#locationName').value,
            type: form.querySelector('#locationType').value,
            x: parseInt(form.querySelector('#locationX').value) || 0,
            y: parseInt(form.querySelector('#locationY').value) || 0,
            description: form.querySelector('#locationDescription').value,
            discovered: form.querySelector('#locationDiscovered')?.checked || false
        };

        if (this.currentLocation) {
            // Update existing location
            this.locationService.updateLocation(this.currentLocation.id, locationData);
        } else {
            // Create new location
            this.locationService.createLocation(locationData);
        }

        // Refresh the UI
        this.renderLocationList();
        this.hideLocationForm();
    }

    /**
     * Hide the location form
     */
    hideLocationForm() {
        const formContainer = this.container.querySelector('.location-form-container');
        if (formContainer) {
            formContainer.remove();
        }
        this.currentLocation = null;
    }

    /**
     * Filter locations by search query
     * @param {string} query - The search query
     */
    filterLocations(query) {
        const filtered = this.locationService.searchLocations(query);
        this.renderLocationList(filtered);
    }

    /**
     * Filter locations by type
     * @param {string} type - The type to filter by
     */
    filterLocationsByType(type) {
        const filtered = this.locationService.filterLocationsByType(type);
        this.renderLocationList(filtered);
    }

    /**
     * Get the location icon based on type
     * @param {string} type - The location type
     * @returns {string} The icon class
     */
    getLocationIcon(type) {
        const icons = {
            'TOWN': 'fa-home',
            'CITY': 'fa-city',
            'DUNGEON': 'fa-dungeon',
            'FOREST': 'fa-tree',
            'MOUNTAIN': 'fa-mountain',
            'CAVE': 'fa-cave',
            'TEMPLE': 'fa-place-of-worship',
            'RUINS': 'fa-landmark',
            'CAMP': 'fa-campground',
            'OTHER': 'fa-map-marker-alt'
        };
        
        return icons[type] || 'fa-map-marker-alt';
    }

    /**
     * Format the location type for display
     * @param {string} type - The location type
     * @returns {string} The formatted type
     */
    formatLocationType(type) {
        if (!type) return 'Unknown';
        
        // Convert from UPPERCASE_WITH_UNDERSCORES to Title Case
        return type.split('_')
            .map(word => word.charAt(0) + word.slice(1).toLowerCase())
            .join(' ');
    }
}
