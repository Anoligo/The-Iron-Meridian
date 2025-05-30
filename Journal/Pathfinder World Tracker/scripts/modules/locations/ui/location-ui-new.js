/**
 * Location UI Component
 * Handles the rendering and interaction for location-related UI elements
 * Uses the BaseUI class for consistent UI patterns
 */

import { BaseUI } from '../../../components/base-ui.js';
import { createListItem, createDetailsPanel, showToast } from '../../../components/ui-components.js';
import { LocationType, DiscoveryStatus } from '../enums/location-enums.js';
import { InteractiveMap } from './interactive-map.js';

export class LocationUI extends BaseUI {
    /**
     * Create a new LocationUI instance
     * @param {Object} locationService - Instance of LocationService
     * @param {Object} dataManager - Instance of DataManager for accessing related entities
     */
    constructor(locationService, dataManager) {
        super({
            containerId: 'locations',
            listId: 'locationList',
            detailsId: 'locationDetails',
            searchId: 'locationSearch',
            addButtonId: 'addLocationBtn',
            entityName: 'location',
            getAll: () => locationService.getAllLocations(),
            getById: (id) => locationService.getLocationById(id),
            add: (location) => locationService.createLocation(location),
            update: (id, updates) => locationService.updateLocation(id, updates),
            delete: (id) => locationService.deleteLocation(id)
        });
        
        this.locationService = locationService;
        this.dataManager = dataManager;
        this.map = null; // Will be initialized in init()
        
        // Bind additional methods
        this.getLocationIcon = this.getLocationIcon.bind(this);
        this.formatLocationType = this.formatLocationType.bind(this);
        this.renderRelatedQuests = this.renderRelatedQuests.bind(this);
        this.handleMapLocationClick = this.handleMapLocationClick.bind(this);
        this.handleMapClick = this.handleMapClick.bind(this);
        this.renderMapView = this.renderMapView.bind(this);
    }
    
    /**
     * Initialize the UI
     */
    init() {
        // Call the parent init method
        super.init();
        
        // Create the map view
        this.renderMapView();
    }
    
    /**
     * Refresh the UI
     * @param {string} entityId - Optional ID of entity to select after refresh
     */
    refresh(entityId = null) {
        super.refresh(entityId);
        
        // Update map locations if map exists
        if (this.map) {
            this.map.updateLocations(this.getAll());
            
            // If a location is selected, highlight it on the map
            if (entityId) {
                this.map.selectLocation(entityId);
                this.map.centerOnLocation(entityId);
            }
        }
    }
    
    /**
     * Render the map view
     */
    renderMapView() {
        console.log('Attempting to render map view');
        // Get the locations container
        const locationsSection = document.getElementById('locations');
        console.log('Locations section:', locationsSection);
        if (!locationsSection) {
            console.error('Locations section not found, cannot render map');
            return;
        }
        
        // Check if map container already exists
        let mapContainer = document.getElementById('worldMapContainer');
        if (!mapContainer) {
            // Create map container
            mapContainer = document.createElement('div');
            mapContainer.id = 'worldMapContainer';
            mapContainer.className = 'mb-4';
            
            // Add map container before the locations list/details row
            const locationsRow = locationsSection.querySelector('.row');
            locationsSection.insertBefore(mapContainer, locationsRow);
        }
        
        // Create the map
        this.map = new InteractiveMap({
            container: mapContainer,
            mapImagePath: './WorldMap.png',
            locations: this.getAll(),
            onLocationClick: this.handleMapLocationClick,
            onMapClick: this.handleMapClick
        });
    }
    
    /**
     * Handle click on a location pin in the map
     * @param {Object} location - The clicked location
     */
    handleMapLocationClick(location) {
        // Select the location in the list
        this.handleSelect(location.id);
    }
    
    /**
     * Handle click on the map (for adding new locations)
     * @param {number} x - X coordinate on the map
     * @param {number} y - Y coordinate on the map
     */
    handleMapClick(x, y) {
        // Show the add location form with pre-filled coordinates
        this.showAddLocationForm(x, y);
    }
    
    /**
     * Show the add location form with optional pre-filled coordinates
     * @param {number} x - Optional X coordinate
     * @param {number} y - Optional Y coordinate
     */
    showAddLocationForm(x, y) {
        // Create a form for adding a new location
        const formContainer = document.createElement('div');
        formContainer.className = 'card';
        
        formContainer.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Add New Location</h5>
                <button type="button" class="btn-close" id="close-form-btn" aria-label="Close"></button>
            </div>
            <div class="card-body">
                <form id="location-form">
                    <div class="mb-3">
                        <label for="location-name" class="form-label">Name</label>
                        <input type="text" class="form-control" id="location-name" required>
                    </div>
                    <div class="mb-3">
                        <label for="location-type" class="form-label">Type</label>
                        <select class="form-select" id="location-type" required>
                            ${Object.values(LocationType).map(type => `
                                <option value="${type}">${this.formatLocationType(type)}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="location-status" class="form-label">Status</label>
                        <select class="form-select" id="location-status">
                            <option value="true">Discovered</option>
                            <option value="false">Undiscovered</option>
                        </select>
                    </div>
                    <div class="row mb-3">
                        <div class="col">
                            <label for="location-x" class="form-label">X Coordinate</label>
                            <input type="number" class="form-control" id="location-x" value="${x || 0}">
                        </div>
                        <div class="col">
                            <label for="location-y" class="form-label">Y Coordinate</label>
                            <input type="number" class="form-control" id="location-y" value="${y || 0}">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="location-description" class="form-label">Description</label>
                        <textarea class="form-control" id="location-description" rows="3"></textarea>
                    </div>
                    <div class="d-flex justify-content-end">
                        <button type="button" class="btn btn-secondary me-2" id="cancel-location-btn">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-1"></i> Save Location
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Add form to details panel
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(formContainer);
        
        // Set up event listeners
        const form = document.getElementById('location-form');
        const cancelBtn = document.getElementById('cancel-location-btn');
        const closeBtn = document.getElementById('close-form-btn');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleLocationFormSubmit(e, false));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.clearDetails();
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.clearDetails();
            });
        }
    }
    
    /**
     * Create a list item for a location
     * @param {Object} location - Location to create list item for
     * @returns {HTMLElement} The created list item
     */
    createListItem(location) {
        return createListItem({
            id: location.id,
            title: location.name,
            subtitle: this.formatLocationType(location.type),
            icon: `fas ${this.getLocationIcon(location.type)}`,
            isSelected: this.currentEntity && this.currentEntity.id === location.id,
            metadata: {
                'Status': location.discovered ? 'Discovered' : 'Undiscovered',
                'Coordinates': `(${location.x || 0}, ${location.y || 0})`
            },
            onClick: (id) => this.handleSelect(id)
        });
    }
    
    /**
     * Render the details for a location
     * @param {Object} location - Location to render details for
     */
    renderDetails(location) {
        // Create sections for the details panel
        const sections = [
            {
                title: 'Basic Information',
                content: `
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Type:</strong> ${this.formatLocationType(location.type)}</p>
                            <p><strong>Status:</strong> ${location.discovered ? 'Discovered' : 'Undiscovered'}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Coordinates:</strong> (${location.x || 0}, ${location.y || 0})</p>
                        </div>
                    </div>
                `
            },
            {
                title: 'Description',
                content: `
                    <div class="mb-3">
                        <p>${location.description || 'No description available.'}</p>
                    </div>
                `
            },
            {
                title: 'Related Quests',
                content: this.renderRelatedQuests(location)
            }
        ];
        
        // Create the details panel
        const detailsPanel = createDetailsPanel({
            title: location.name,
            data: location,
            actions: [
                {
                    label: 'Edit',
                    icon: 'fas fa-edit',
                    type: 'primary',
                    onClick: () => this.handleEdit(location)
                },
                {
                    label: 'Delete',
                    icon: 'fas fa-trash',
                    type: 'danger',
                    onClick: () => this.handleDelete(location.id)
                }
            ],
            sections: sections
        });
        
        // Clear the details element and append the new details panel
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(detailsPanel);
    }
    
    /**
     * Render related quests for a location
     * @param {Object} location - Location object
     * @returns {string} HTML content for related quests
     */
    renderRelatedQuests(location) {
        // Get quests that reference this location
        const quests = (this.dataManager.appState.quests || []).filter(quest => 
            quest.locations && quest.locations.includes(location.id)
        );
        
        if (quests.length === 0) {
            return '<p>No quests associated with this location.</p>';
        }
        
        return `
            <div class="list-group mb-3">
                ${quests.map(quest => `
                    <div class="list-group-item bg-card d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${quest.name}</h6>
                            <small>${quest.status || 'Unknown status'}</small>
                        </div>
                        <span class="badge bg-accent">${quest.type || 'Quest'}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Handle adding a new location
     */
    handleAdd() {
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.id = 'location-form-container';
        formContainer.className = 'card';
        
        // Create form content
        formContainer.innerHTML = `
            <div class="card-header bg-card">
                <h5 class="card-title mb-0">Add New Location</h5>
            </div>
            <div class="card-body bg-card">
                <form id="location-form">
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <label for="location-name" class="form-label">Name</label>
                            <input type="text" class="form-control" id="location-name" required>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="location-type" class="form-label">Type</label>
                            <select class="form-select" id="location-type">
                                <option value="">Select Type</option>
                                ${Object.entries(LocationType).map(([key, value]) => 
                                    `<option value="${value}">${this.formatLocationType(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="location-status" class="form-label">Status</label>
                            <select class="form-select" id="location-status">
                                <option value="false">Undiscovered</option>
                                <option value="true">Discovered</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="location-x" class="form-label">X Coordinate</label>
                            <input type="number" class="form-control" id="location-x" value="0">
                        </div>
                        <div class="col-md-6">
                            <label for="location-y" class="form-label">Y Coordinate</label>
                            <input type="number" class="form-control" id="location-y" value="0">
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="location-description" class="form-label">Description</label>
                        <textarea class="form-control" id="location-description" rows="4"></textarea>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" id="cancel-location-btn">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-1"></i> Save Location
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Add form to details panel
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(formContainer);
        
        // Set up event listeners
        const form = document.getElementById('location-form');
        const cancelBtn = document.getElementById('cancel-location-btn');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleLocationFormSubmit(e, false));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.refresh();
            });
        }
    }
    
    /**
     * Handle editing a location
     * @param {Object} location - Location to edit
     */
    handleEdit(location) {
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.id = 'location-form-container';
        formContainer.className = 'card';
        
        // Create form content
        formContainer.innerHTML = `
            <div class="card-header bg-card">
                <h5 class="card-title mb-0">Edit Location: ${location.name}</h5>
            </div>
            <div class="card-body bg-card">
                <form id="location-form" data-location-id="${location.id}">
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <label for="location-name" class="form-label">Name</label>
                            <input type="text" class="form-control" id="location-name" value="${location.name || ''}" required>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="location-type" class="form-label">Type</label>
                            <select class="form-select" id="location-type">
                                <option value="">Select Type</option>
                                ${Object.entries(LocationType).map(([key, value]) => 
                                    `<option value="${value}" ${location.type === value ? 'selected' : ''}>${this.formatLocationType(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="location-status" class="form-label">Status</label>
                            <select class="form-select" id="location-status">
                                <option value="false" ${!location.discovered ? 'selected' : ''}>Undiscovered</option>
                                <option value="true" ${location.discovered ? 'selected' : ''}>Discovered</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="location-x" class="form-label">X Coordinate</label>
                            <input type="number" class="form-control" id="location-x" value="${location.x || 0}">
                        </div>
                        <div class="col-md-6">
                            <label for="location-y" class="form-label">Y Coordinate</label>
                            <input type="number" class="form-control" id="location-y" value="${location.y || 0}">
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="location-description" class="form-label">Description</label>
                        <textarea class="form-control" id="location-description" rows="4">${location.description || ''}</textarea>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" id="cancel-location-btn">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                        <div>
                            <button type="button" class="btn btn-danger me-2" id="delete-location-btn">
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
        const form = document.getElementById('location-form');
        const cancelBtn = document.getElementById('cancel-location-btn');
        const deleteBtn = document.getElementById('delete-location-btn');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleLocationFormSubmit(e, true));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.refresh(location.id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.handleDelete(location.id);
            });
        }
    }
    
    /**
     * Handle location form submission
     * @param {Event} e - Form submit event
     * @param {boolean} isEdit - Whether this is an edit operation
     */
    handleLocationFormSubmit(e, isEdit = false) {
        e.preventDefault();
        
        try {
            const form = e.target;
            const locationId = isEdit ? form.getAttribute('data-location-id') : null;
            
            // Get form values
            const locationData = {
                name: document.getElementById('location-name').value,
                type: document.getElementById('location-type').value,
                discovered: document.getElementById('location-status').value === 'true',
                x: parseInt(document.getElementById('location-x').value) || 0,
                y: parseInt(document.getElementById('location-y').value) || 0,
                description: document.getElementById('location-description').value
            };
            
            let result;
            
            if (isEdit) {
                // Update existing location
                result = this.update(locationId, locationData);
                showToast({
                    message: 'Location updated successfully',
                    type: 'success'
                });
            } else {
                // Create new location
                result = this.add(locationData);
                showToast({
                    message: 'Location created successfully',
                    type: 'success'
                });
            }
            
            // Refresh the UI and select the location
            this.refresh(isEdit ? locationId : result.id);
        } catch (error) {
            console.error('Error saving location:', error);
            showToast({
                message: `Error saving location: ${error.message}`,
                type: 'error'
            });
        }
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
