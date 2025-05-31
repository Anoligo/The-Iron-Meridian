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
        this.isEditMode = false; // Track if we're editing a location
        this.editingLocationId = null; // Track which location is being edited
        
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
        console.log('LocationUI init called');
        
        // Check if already initialized to prevent duplicate initialization
        if (this.initialized) {
            console.log('LocationUI already initialized, skipping');
            return;
        }
        
        // Set up references to DOM elements
        this.listElement = document.getElementById('locations-list');
        this.detailsElement = document.getElementById('location-details');
        this.addButton = document.getElementById('addLocationBtn');
        
        // Check if required elements exist
        if (!this.listElement || !this.detailsElement) {
            console.error('Required DOM elements not found, retrying in 500ms');
            
            // Retry initialization after a short delay
            setTimeout(() => {
                this.init();
            }, 500);
            return;
        }
        
        // Add event listener for the add button
        if (this.addButton) {
            this.addButton.addEventListener('click', () => this.handleAdd());
        } else {
            console.warn('Add button not found');
        }
        
        // Create the map view only once
        console.log('Initializing map view');
        this.renderMapView();
        
        // Initial render
        console.log('Performing initial render');
        this.refresh();
        
        // Mark as initialized
        this.initialized = true;
        console.log('LocationUI initialization complete');
    }
    
    /**
     * Clear the details panel
     */
    clearDetails() {
        console.log('Clearing location details');
        if (this.detailsElement) {
            this.detailsElement.innerHTML = '';
            
            // Create a placeholder message
            const placeholder = document.createElement('div');
            placeholder.className = 'text-center p-4 text-muted';
            placeholder.innerHTML = `
                <i class="fas fa-map-marker-alt fa-3x mb-3"></i>
                <p>Select a location from the list or click on the map to view details</p>
            `;
            this.detailsElement.appendChild(placeholder);
        }
    }
    
    /**
     * Refresh the UI
     * @param {string} entityId - Optional ID of entity to select after refresh
     */
    refresh(entityId = null) {
        console.log('Refreshing LocationUI, selecting entity:', entityId);
        
        try {
            // Get all locations
            const locations = this.getAll ? this.getAll() : [];
            console.log('Got locations for refresh:', locations.length);
            
            // Render the locations list
            this.renderList(locations);
            
            // Select the entity if specified
            if (entityId) {
                const location = locations.find(loc => loc.id === entityId);
                if (location) {
                    console.log('Selecting location:', location.id);
                    this.renderDetails(location);
                    
                    // Update map selection if map exists
                    if (this.map) {
                        this.map.selectLocation(location.id);
                    }
                }
            } else {
                // Clear details if no entity selected
                this.clearDetails();
            }
            
            // Update map locations if map exists
            if (this.map) {
                console.log('Updating map locations');
                this.map.updateLocations(locations);
            }
        } catch (error) {
            console.error('Error refreshing UI:', error);
        }
    }
    
    /**
     * Render the list of locations
     * @param {Array} locations - Array of location objects
     */
    renderList(locations) {
        console.log('Rendering location list');
        
        // Clear existing list
        if (this.listElement) {
            this.listElement.innerHTML = '';
        }
        
        // Create list items for each location
        locations.forEach(location => {
            const listItem = createListItem({
                id: location.id,
                name: location.name,
                icon: this.getLocationIcon(location.type),
                onClick: () => this.handleSelect(location.id)
            });
            this.listElement.appendChild(listItem);
        });
    }
    
    /**
     * Render the map view
     */
    renderMapView() {
        console.log('Attempting to render map view');
        
        // Check if map is already initialized to prevent duplicate rendering
        if (this.map) {
            console.log('Map already initialized, updating locations');
            // Just update the locations if the map already exists
            try {
                this.map.updateLocations(this.getAll ? this.getAll() : []);
                return;
            } catch (error) {
                console.error('Error updating map locations:', error);
                // Continue with re-initialization if update fails
            }
        }
        
        // Get the locations container
        const locationsSection = document.getElementById('locations');
        if (!locationsSection) {
            console.error('Locations section not found, cannot render map');
            return;
        }
        
        // Get or create the map container
        let mapContainer = document.getElementById('worldMapContainer');
        if (!mapContainer) {
            console.log('Creating map container');
            mapContainer = document.createElement('div');
            mapContainer.id = 'worldMapContainer';
            mapContainer.className = 'mb-4';
            mapContainer.style.width = '100%';
            mapContainer.style.minHeight = '400px';
            mapContainer.style.border = '1px solid #ddd';
            mapContainer.style.borderRadius = '4px';
            mapContainer.style.overflow = 'hidden';
            mapContainer.style.position = 'relative';
            
            // Add a refresh button
            const refreshButton = document.createElement('button');
            refreshButton.className = 'btn btn-sm btn-outline-secondary position-absolute';
            refreshButton.style.top = '10px';
            refreshButton.style.right = '10px';
            refreshButton.style.zIndex = '100';
            refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Map & Locations';
            refreshButton.addEventListener('click', () => {
                console.log('Manual refresh requested');
                this.map = null; // Force recreation
                this.renderMapView();
                this.refresh();
            });
            mapContainer.appendChild(refreshButton);
            
            // Insert at the beginning of the locations section
            if (locationsSection.firstChild) {
                locationsSection.insertBefore(mapContainer, locationsSection.firstChild);
            } else {
                locationsSection.appendChild(mapContainer);
            }
        }
        
        // Clear existing map container to prevent duplication
        console.log('Clearing map container');
        mapContainer.innerHTML = '';
        
        // Create map instructions
        const instructionsDiv = document.createElement('div');
        instructionsDiv.className = 'alert alert-info mb-2';
        instructionsDiv.innerHTML = `
            <strong>Map Controls:</strong>
            <ul class="mb-0">
                <li>Click and drag to pan the map</li>
                <li>Use mouse wheel or controls to zoom in/out</li>
                <li>Click on the map to add a new location</li>
                <li>Click on a pin to view location details</li>
            </ul>
        `;
        mapContainer.appendChild(instructionsDiv);
        
        // Try multiple possible map image paths
        const possiblePaths = [
            './WorldMap.png',
            '../WorldMap.png',
            '../../WorldMap.png',
            '../../../WorldMap.png',
            './images/WorldMap.png',
            '../images/WorldMap.png',
            '../../images/WorldMap.png',
            '/images/WorldMap.png'
        ];
        
        // Create the map with properly bound event handlers
        console.log('Creating new InteractiveMap instance');
        try {
            this.map = new InteractiveMap({
                container: mapContainer,
                mapImagePath: possiblePaths[0], // Start with first path, InteractiveMap will try others
                locations: this.getAll ? this.getAll() : [],
                onLocationClick: (location) => this.handleMapLocationClick(location),
                onMapClick: (x, y) => this.handleMapClick(x, y)
            });
            console.log('InteractiveMap created successfully');
            
            // Add a retry button in case the map fails to load
            const retryButton = document.createElement('button');
            retryButton.className = 'btn btn-sm btn-outline-secondary mt-2';
            retryButton.innerHTML = '<i class="fas fa-sync-alt"></i> Retry Map Load';
            retryButton.style.display = 'none'; // Hide initially
            retryButton.addEventListener('click', () => {
                console.log('Manual map reload requested');
                this.map = null; // Force recreation
                this.renderMapView();
            });
            mapContainer.appendChild(retryButton);
            
            // Show retry button after a delay if map might be having issues
            setTimeout(() => {
                if (!this.map || !this.map.mapImage || !this.map.mapImage.complete) {
                    console.log('Map may be having issues, showing retry button');
                    retryButton.style.display = 'block';
                }
            }, 3000);
            
        } catch (error) {
            console.error('Failed to create InteractiveMap:', error);
            // Show error message in the container
            mapContainer.innerHTML += `
                <div class="alert alert-danger">
                    <strong>Error:</strong> Failed to initialize map. Please refresh the page and try again.
                    <br><small>${error.message}</small>
                </div>
                <button id="retryMapBtn" class="btn btn-primary">Retry Map Load</button>
            `;
            
            // Add event listener to retry button
            const retryBtn = document.getElementById('retryMapBtn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    this.map = null; // Force recreation
                    this.renderMapView();
                });
            }
        }
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
     * Handle click on the map (for adding new locations or updating existing ones)
     * @param {number} x - X coordinate on the map
     * @param {number} y - Y coordinate on the map
     */
    handleMapClick(x, y) {
        console.log('Map clicked at coordinates:', x, y);
        console.log('Edit mode:', this.isEditMode, 'Editing location ID:', this.editingLocationId);
        
        if (this.isEditMode && this.editingLocationId) {
            // If we're in edit mode, update the coordinates in the form
            const xInput = document.getElementById('location-x');
            const yInput = document.getElementById('location-y');
            
            if (xInput && yInput) {
                xInput.value = x;
                yInput.value = y;
                console.log('Updated coordinates in edit form:', x, y);
            } else {
                console.error('Could not find coordinate inputs in the form');
            }
        } else {
            // Otherwise, show the add location form with pre-filled coordinates
            this.handleAdd(x, y);
        }
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
     * Render the locations list
     * @param {Array} locations - Array of location objects to render
     */
    renderList(locations) {
        console.log('Rendering locations list with', locations.length, 'locations');
        
        if (!this.listElement) {
            console.error('List element not found, cannot render list');
            this.listElement = document.getElementById('locations-list');
            
            if (!this.listElement) {
                console.error('Could not find locations-list element, creating it');
                const locationsSection = document.getElementById('locations');
                if (locationsSection) {
                    // Try to find the list container
                    let listContainer = locationsSection.querySelector('.list-container');
                    if (!listContainer) {
                        // Create list container if it doesn't exist
                        listContainer = document.createElement('div');
                        listContainer.className = 'list-container';
                        locationsSection.appendChild(listContainer);
                    }
                    
                    // Create the list element
                    this.listElement = document.createElement('ul');
                    this.listElement.id = 'locations-list';
                    this.listElement.className = 'list-group';
                    listContainer.appendChild(this.listElement);
                } else {
                    console.error('Locations section not found, cannot create list element');
                    return;
                }
            }
        }
        
        // Clear the list
        this.listElement.innerHTML = '';
        
        if (locations.length === 0) {
            // Show a message if there are no locations
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'list-group-item text-center text-muted';
            emptyMessage.textContent = 'No locations found. Click the map to add a new location.';
            this.listElement.appendChild(emptyMessage);
            return;
        }
        
        // Add each location to the list
        locations.forEach(location => {
            const listItem = this.createListItem(location);
            this.listElement.appendChild(listItem);
            
            // Add click event to show details
            listItem.addEventListener('click', () => {
                console.log('Location clicked:', location.id);
                this.renderDetails(location);
                
                // Update map selection if map exists
                if (this.map) {
                    this.map.selectLocation(location.id);
                }
            });
        });
    }
    
    /**
     * Create a list item for a location
     * @param {Object} location - Location to create list item for
     * @returns {HTMLElement} The created list item
     */
    createListItem(location) {
        console.log('Creating list item for location:', location);
        
        // Create a list item element
        const listItem = document.createElement('div');
        listItem.className = 'list-group-item entity-card';
        if (this.currentEntity && this.currentEntity.id === location.id) {
            listItem.classList.add('entity-card-selected');
        }
        listItem.setAttribute('data-entity-id', location.id);
        
        // Add click handler
        listItem.addEventListener('click', () => this.handleSelect(location.id));
        
        // Create the content
        listItem.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="entity-icon">
                    <i class="fas ${this.getLocationIcon(location.type)}"></i>
                </div>
                <div class="entity-info">
                    <h5 class="entity-title mb-1">${location.name}</h5>
                    <p class="entity-subtitle mb-1">${this.formatLocationType(location.type)}</p>
                    <div class="entity-metadata">
                        <span class="badge ${location.discovered ? 'bg-success' : 'bg-secondary'}">
                            ${location.discovered ? 'Discovered' : 'Undiscovered'}
                        </span>
                        <span class="badge bg-info">
                            (${location.x || 0}, ${location.y || 0})
                        </span>
                    </div>
                </div>
            </div>
        `;
        
        return listItem;
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
     * @param {number} x - Optional X coordinate for the new location
     * @param {number} y - Optional Y coordinate for the new location
     */
    handleAdd(x = 0, y = 0) {
        console.log('Adding new location with coordinates:', x, y);
        
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.id = 'location-form-container';
        formContainer.className = 'card';
        
        // Create form content
        formContainer.innerHTML = `
            <div class="card-header">
                <h5 class="card-title mb-0">Add New Location</h5>
            </div>
            <div class="card-body">
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
                            <select class="form-select" id="location-type" required>
                                <option value="">Select Type</option>
                                ${Object.values(LocationType).map(type => 
                                    `<option value="${type}">${this.formatLocationType(type)}</option>`
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
                            <input type="number" class="form-control" id="location-x" value="${x}">
                        </div>
                        <div class="col-md-6">
                            <label for="location-y" class="form-label">Y Coordinate</label>
                            <input type="number" class="form-control" id="location-y" value="${y}">
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
        if (this.detailsElement) {
            this.detailsElement.innerHTML = '';
            this.detailsElement.appendChild(formContainer);
            
            // Set up event listeners
            const form = document.getElementById('location-form');
            const cancelBtn = document.getElementById('cancel-location-btn');
            
            if (form) {
                console.log('Setting up form submit handler');
                form.addEventListener('submit', (e) => {
                    console.log('Form submitted');
                    this.handleLocationFormSubmit(e, false);
                });
            } else {
                console.error('Location form not found');
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    console.log('Cancel button clicked');
                    this.refresh();
                });
            } else {
                console.error('Cancel button not found');
            }
        } else {
            console.error('Details element not found');
        }
    }
    
    /**
     * Handle editing a location
     * @param {Object} location - Location to edit
     */
    handleEdit(location) {
        console.log('Editing location:', location);
        
        // Set edit mode flags
        this.isEditMode = true;
        this.editingLocationId = location.id;
        
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.id = 'location-form-container';
        formContainer.className = 'card';
        
        // Create form content
        formContainer.innerHTML = `
            <div class="card-header">
                <h5 class="card-title mb-0">Edit Location: ${location.name}</h5>
            </div>
            <div class="card-body">
                <div class="alert alert-info mb-3">
                    <small><i class="fas fa-info-circle me-1"></i> Click on the map to update the location's coordinates</small>
                </div>
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
                            <select class="form-select" id="location-type" required>
                                <option value="">Select Type</option>
                                ${Object.values(LocationType).map(type => 
                                    `<option value="${type}" ${location.type === type ? 'selected' : ''}>${this.formatLocationType(type)}</option>`
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
        if (this.detailsElement) {
            this.detailsElement.innerHTML = '';
            this.detailsElement.appendChild(formContainer);
            
            // Set up event listeners
            const form = document.getElementById('location-form');
            const cancelBtn = document.getElementById('cancel-location-btn');
            const deleteBtn = document.getElementById('delete-location-btn');
            
            if (form) {
                console.log('Setting up form submit handler for edit');
                form.addEventListener('submit', (e) => {
                    console.log('Edit form submitted');
                    this.handleLocationFormSubmit(e, true);
                });
            } else {
                console.error('Location form not found');
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    console.log('Cancel button clicked');
                    // Reset edit mode flags
                    this.isEditMode = false;
                    this.editingLocationId = null;
                    this.refresh(location.id);
                });
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    console.log('Delete button clicked');
                    // Reset edit mode flags
                    this.isEditMode = false;
                    this.editingLocationId = null;
                    this.handleDelete(location.id);
                });
            }
            
            // Center the map on this location
            if (this.map) {
                this.map.centerOnLocation(location.id);
                this.map.selectLocation(location.id);
            }
        } else {
            console.error('Details element not found');
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
            console.log('Form submitted, isEdit:', isEdit);
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
            
            console.log('Location data:', locationData);
            
            // Validate the form data
            if (!locationData.name) {
                throw new Error('Location name is required');
            }
            
            if (!locationData.type) {
                throw new Error('Location type is required');
            }
            
            let result;
            
            if (isEdit) {
                // Update existing location
                console.log('Updating location:', locationId, locationData);
                result = this.update(locationId, locationData);
                console.log('Update result:', result);
                showToast({
                    message: 'Location updated successfully',
                    type: 'success'
                });
            } else {
                // Create new location
                console.log('Creating new location:', locationData);
                result = this.add(locationData);
                console.log('Add result:', result);
                showToast({
                    message: 'Location created successfully',
                    type: 'success'
                });
            }
            
            // Reset edit mode flags
            this.isEditMode = false;
            this.editingLocationId = null;
            
            // Refresh the UI and select the location
            console.log('Refreshing UI with location ID:', isEdit ? locationId : (result ? result.id : null));
            this.refresh(isEdit ? locationId : (result ? result.id : null));
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
