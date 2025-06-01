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
        this.escapeHtml = this.escapeHtml.bind(this);
    }
    
    /**
     * Initialize the UI
     */
    init() {
        console.log('LocationUI init called');
        
        // Check if already initialized to prevent duplicate initialization
        if (this.initialized) {
            console.log('LocationUI already initialized, refreshing instead');
            this.refresh();
            return;
        }
        
        // Set up references to DOM elements
        this.listElement = document.getElementById('locationList');
        this.detailsElement = document.getElementById('locationDetails');
        this.searchInput = document.getElementById('locationSearch');
        this.addButton = document.getElementById('addLocationBtn');
        
        // Check if required elements exist
        if (!this.listElement) {
            console.error('Location list element not found, retrying in 500ms');
            
            // Retry initialization after a short delay
            setTimeout(() => {
                this.init();
            }, 500);
            return;
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize the map
        this.initializeMap();
        
        // Initial render
        console.log('Performing initial render');
        this.refresh();
        
        // Mark as initialized
        this.initialized = true;
        console.log('LocationUI initialization complete');
        
        // Hide loading overlay after a short delay
        setTimeout(() => {
            const loadingOverlay = document.getElementById('mapLoadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
        }, 1000);
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Add button
        if (this.addButton) {
            this.addButton.addEventListener('click', () => this.handleAdd());
        }
        
        // Search input
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
        
        // List element click delegation
        if (this.listElement) {
            this.listElement.addEventListener('click', (e) => {
                const listItem = e.target.closest('.location-card');
                if (listItem) {
                    const id = listItem.dataset.id;
                    if (id) {
                        this.handleSelect(id);
                    }
                }
            });
        }
    }
    
    /**
     * Initialize the interactive map
     */
    initializeMap() {
        console.log('Initializing map view');
        const mapContainer = document.getElementById('worldMapContainer');
        if (!mapContainer) {
            console.error('Map container not found');
            return;
        }
        
        try {
            this.map = new InteractiveMap({
                container: mapContainer,
                onLocationClick: this.handleMapLocationClick,
                onMapClick: this.handleMapClick
            });
            console.log('Map initialized successfully');
        } catch (error) {
            console.error('Failed to initialize map:', error);
            mapContainer.innerHTML = `
                <div class="alert alert-danger">
                    Failed to load the map. Please refresh the page to try again.
                    <div class="mt-2">${error.message}</div>
                </div>
            `;
        }
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
        
        // Debug: Log the current state of the map and container
        console.log('Current map instance:', this.map);
        
        // Check if map is already initialized to prevent duplicate rendering
        if (this.map) {
            console.log('Map already initialized, updating locations');
            // Just update the locations if the map already exists
            try {
                const locations = this.getAll ? this.getAll() : [];
                console.log(`Updating ${locations.length} locations on the map`);
                this.map.updateLocations(locations);
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
     * Render the list of locations
     * @param {Array} locations - Array of location objects to render
     */
    renderList(locations) {
        if (!this.listElement) {
            console.error('List element not found');
            return;
        }
        
        console.log('Rendering locations list with', locations.length, 'locations');
        
        // Clear the list
        this.listElement.innerHTML = '';
        
        if (!locations || locations.length === 0) {
            this.listElement.innerHTML = `
                <div class="alert alert-info p-2">
                    <i class="fas fa-info-circle me-1"></i>
                    No locations found. Click the map to add a new location.
                </div>
            `;
            return;
        }
        
        // Sort locations by name
        const sortedLocations = [...locations].sort((a, b) => a.name.localeCompare(b.name));
        
        // Create a container for the list
        const listContainer = document.createElement('div');
        listContainer.className = 'list-group';
        
        // Create list items
        sortedLocations.forEach(location => {
            const card = this.createLocationCard(location);
            if (card) {
                listContainer.appendChild(card);
            }
        });
        
        // Add the list to the DOM
        this.listElement.appendChild(listContainer);
        
        // Add click handlers to location cards
        this.listElement.querySelectorAll('.location-card').forEach(card => {
            const id = card.dataset.id;
            if (id) {
                card.addEventListener('click', () => {
                    console.log('Location card clicked:', id);
                    const location = this.locationService.getLocationById(id);
                    if (location) {
                        this.renderDetails(location);
                        
                        // Update map selection and center on the location if map exists
                        // The centerOnLocation method now handles setting a consistent zoom level
                        if (this.map) {
                            this.map.selectLocation(id);
                            this.map.centerOnLocation(id); // Uses default 1.5x zoom
                        }
                    }
                });
            }
        });
    }
    
    /**
     * Create a location card element
     * @param {Object} location - The location data
     * @returns {HTMLElement} The created location card element
     */
    createLocationCard(location) {
        if (!location) return null;
        
        const card = document.createElement('div');
        card.className = 'card mb-2 location-card';
        card.dataset.id = location.id;
        
        const status = location.discovered ? 'Discovered' : 'Undiscovered';
        const statusClass = location.discovered ? 'text-success' : 'text-warning';
        const type = this.formatLocationType(location.type);
        
        card.innerHTML = `
            <div class="card-body p-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="card-title mb-1">
                            <i class="fas ${this.getLocationIcon(location.type)} me-2"></i>
                            ${this.escapeHtml(location.name)}
                        </h5>
                        <div class="d-flex align-items-center mb-1">
                            <span class="badge bg-secondary me-2">${type}</span>
                            <span class="badge ${statusClass}">
                                <i class="fas ${location.discovered ? 'fa-check-circle' : 'fa-question-circle'} me-1"></i>
                                ${status}
                            </span>
                        </div>
                        <div class="text-muted small">
                            <i class="fas fa-map-marker-alt me-1"></i>
                            (${location.x || 0}, ${location.y || 0})
                        </div>
                    </div>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary btn-edit" data-id="${location.id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-delete" data-id="${location.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${location.description ? `
                    <p class="card-text mt-2 mb-0 small text-muted">
                        ${this.escapeHtml(location.description).substring(0, 100)}${location.description.length > 100 ? '...' : ''}
                    </p>
                ` : ''}
            </div>
        `;
        
        // Add event listeners to action buttons
        const editBtn = card.querySelector('.btn-edit');
        const deleteBtn = card.querySelector('.btn-delete');
        
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleEdit(location.id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete ${location.name}?`)) {
                    this.handleDelete(location.id);
                }
            });
        }
        
        return card;
    }
    
    /**
     * Render the details for a location
     * @param {Object} location - Location to render details for
     */
    renderDetails(location) {
        if (!location) {
            console.error('No location provided to renderDetails');
            return;
        }
        
        console.log('Rendering details for location:', location);
        
        // Ensure the details element exists
        if (!this.detailsElement) {
            this.detailsElement = document.getElementById('locationDetails');
            if (!this.detailsElement) {
                console.error('Details element not found');
                return;
            }
        }
        
        // Clear any existing content
        this.detailsElement.innerHTML = '';
        
        // Create the details panel
        const detailsPanel = document.createElement('div');
        detailsPanel.className = 'location-details';
        
        // Create header with title and actions
        const header = document.createElement('div');
        header.className = 'd-flex justify-content-between align-items-center mb-3';
        
        const title = document.createElement('h3');
        title.className = 'mb-0';
        title.textContent = location.name;
        
        const actions = document.createElement('div');
        actions.className = 'btn-group';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-primary';
        editBtn.innerHTML = '<i class="fas fa-edit me-1"></i> Edit';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleEdit(location);
        });
        
        actions.appendChild(editBtn);
        header.appendChild(title);
        header.appendChild(actions);
        
        // Create basic info section
        const basicInfo = document.createElement('div');
        basicInfo.className = 'card mb-3';
        basicInfo.innerHTML = `
            <div class="card-header">
                <h5 class="mb-0">Basic Information</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Type:</strong> ${this.formatLocationType(location.type)}</p>
                        <p><strong>Status:</strong> 
                            <span class="badge ${location.discovered ? 'bg-success' : 'bg-warning'}">
                                ${location.discovered ? 'Discovered' : 'Undiscovered'}
                            </span>
                        </p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Coordinates:</strong> (${location.x || 0}, ${location.y || 0})</p>
                        <p><strong>Created:</strong> ${new Date(location.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        `;
        
        // Create description section
        const description = document.createElement('div');
        description.className = 'card mb-3';
        description.innerHTML = `
            <div class="card-header">
                <h5 class="mb-0">Description</h5>
            </div>
            <div class="card-body">
                ${location.description ? `<p>${this.escapeHtml(location.description)}</p>` : '<p class="text-muted fst-italic">No description available.</p>'}
            </div>
        `;
        
        // Create related quests section
        const relatedQuests = document.createElement('div');
        relatedQuests.className = 'card';
        relatedQuests.innerHTML = `
            <div class="card-header">
                <h5 class="mb-0">Related Quests</h5>
            </div>
            <div class="card-body">
                ${this.renderRelatedQuests(location)}
            </div>
        `;
        
        // Assemble the panel
        detailsPanel.appendChild(header);
        detailsPanel.appendChild(basicInfo);
        detailsPanel.appendChild(description);
        detailsPanel.appendChild(relatedQuests);
        
        // Add to the DOM
        this.detailsElement.appendChild(detailsPanel);
        
        // Scroll to the details panel if it's not fully visible
        this.detailsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Update the selected location in the list
        if (typeof this.updateSelectedLocation === 'function') {
            this.updateSelectedLocation(location.id);
        }
        
        // Update the map selection
        if (this.map && typeof this.map.selectLocation === 'function') {
            this.map.selectLocation(location.id);
        }
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
     * Location types enum
     */
    static get LocationType() {
        return {
            TOWN: 'TOWN',
            CITY: 'CITY',
            DUNGEON: 'DUNGEON',
            FOREST: 'FOREST',
            MOUNTAIN: 'MOUNTAIN',
            CAVE: 'CAVE',
            TEMPLE: 'TEMPLE',
            RUINS: 'RUINS',
            CAMP: 'CAMP',
            OTHER: 'OTHER'
        };
    }

    /**
     * Escape HTML special characters to prevent XSS
     * @param {string} unsafe - The string to escape
     * @returns {string} The escaped string
     */
    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Handle editing a location
     * @param {Object|string} location - Location object or ID to edit
     */
    handleEdit(location) {
        // If location is an ID, try to find the location
        if (typeof location === 'string') {
            location = this.locationService.getLocationById(location);
            if (!location) {
                console.error('Location not found:', location);
                return;
            }
        }

        console.log('Editing location:', location);
        
        // Set edit mode flags
        this.isEditMode = true;
        this.editingLocationId = location.id;
        
        // Ensure details element exists
        if (!this.detailsElement) {
            this.detailsElement = document.getElementById('locationDetails');
            if (!this.detailsElement) {
                console.error('Details element not found');
                return;
            }
        }
        
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.id = 'location-form-container';
        formContainer.className = 'card';
        
        // Get location types
        const locationTypes = LocationUI.LocationType || {};
        
        // Create form content
        formContainer.innerHTML = `
            <div class="card-header bg-dark text-white">
                <h5 class="card-title mb-0">
                    <i class="fas fa-edit me-2"></i>Edit Location: ${location.name || 'New Location'}
                </h5>
            </div>
            <div class="card-body">
                <div class="alert alert-info mb-3">
                    <i class="fas fa-info-circle me-1"></i>
                    <small>Click on the map to update the location's coordinates</small>
                </div>
                <form id="location-form" data-location-id="${location.id || ''}" class="needs-validation" novalidate>
                    <div class="row mb-3">
                        <div class="col-12">
                            <label for="location-name" class="form-label">Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="location-name" 
                                   value="${this.escapeHtml(location.name || '')}" required>
                            <div class="invalid-feedback">Please provide a name for the location.</div>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="location-type" class="form-label">Type <span class="text-danger">*</span></label>
                            <select class="form-select" id="location-type" required>
                                <option value="" ${!location.type ? 'selected' : ''}>-- Select Type --</option>
                                ${Object.entries(locationTypes).map(([key, value]) => 
                                    `<option value="${value}" ${location.type === value ? 'selected' : ''}>
                                        ${this.formatLocationType(value)}
                                    </option>`
                                ).join('')}
                            </select>
                            <div class="invalid-feedback">Please select a location type.</div>
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
                            <div class="input-group">
                                <span class="input-group-text">X</span>
                                <input type="number" class="form-control" id="location-x" 
                                       value="${location.x || 0}" min="0" step="1">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label for="location-y" class="form-label">Y Coordinate</label>
                            <div class="input-group">
                                <span class="input-group-text">Y</span>
                                <input type="number" class="form-control" id="location-y" 
                                       value="${location.y || 0}" min="0" step="1">
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="location-description" class="form-label">Description</label>
                        <textarea class="form-control" id="location-description" rows="4" 
                                  placeholder="Enter a detailed description of this location...">${this.escapeHtml(location.description || '')}</textarea>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <button type="button" class="btn btn-outline-secondary" id="cancel-location-btn">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                        <div class="btn-group">
                            ${location.id ? `
                            <button type="button" class="btn btn-outline-danger me-2" id="delete-location-btn">
                                <i class="fas fa-trash-alt me-1"></i> Delete
                            </button>` : ''}
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i> ${location.id ? 'Save Changes' : 'Create Location'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        `;
        
        // Clear and append the form
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(formContainer);
        
        // Set up form validation
        const form = document.getElementById('location-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleLocationFormSubmit(e, !!location.id));
            
            // Add cancel button handler
            const cancelBtn = document.getElementById('cancel-location-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    if (location.id) {
                        // If editing existing location, show its details
                        this.renderDetails(location);
                    } else {
                        // If adding new location, clear the details
                        this.clearDetails();
                    }
                });
            }
            
            // Add delete button handler if this is an existing location
            if (location.id) {
                const deleteBtn = document.getElementById('delete-location-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => {
                        if (confirm(`Are you sure you want to delete "${location.name}"? This action cannot be undone.`)) {
                            this.handleDelete(location.id);
                        }
                    });
                }
            }
            
            // Add map click handler to update coordinates
            if (this.map && typeof this.map.on === 'function') {
                // Remove any existing click handlers to prevent duplicates
                this.map.off('click');
                
                this.map.on('click', (e) => {
                    const x = Math.round(e.offsetX);
                    const y = Math.round(e.offsetY);
                    
                    const xInput = document.getElementById('location-x');
                    const yInput = document.getElementById('location-y');
                    
                    if (xInput) xInput.value = x;
                    if (yInput) yInput.value = y;
                    
                    // Show feedback to user
                    const feedback = document.createElement('div');
                    feedback.className = 'position-absolute bg-primary text-white px-2 py-1 rounded';
                    feedback.style.left = `${e.offsetX + 10}px`;
                    feedback.style.top = `${e.offsetY + 10}px`;
                    feedback.textContent = `(${x}, ${y})`;
                    feedback.style.zIndex = '1000';
                    
                    const mapContainer = document.getElementById('map-container');
                    if (mapContainer) {
                        mapContainer.appendChild(feedback);
                        
                        // Remove feedback after animation
                        setTimeout(() => {
                            feedback.style.transition = 'opacity 1s';
                            feedback.style.opacity = '0';
                            
                            setTimeout(() => {
                                if (feedback.parentNode) {
                                    feedback.parentNode.removeChild(feedback);
                                }
                            }, 1000);
                        }, 1000);
                    }
                });
            }
            
            // Center the map on this location if it exists
            if (this.map && location.id) {
                if (typeof this.map.centerOnLocation === 'function') {
                    this.map.centerOnLocation(location.id);
                }
                if (typeof this.map.selectLocation === 'function') {
                    this.map.selectLocation(location.id);
                }
            }
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
    
    /**
     * Escape HTML special characters to prevent XSS
     * @param {string} unsafe - The unsafe string to escape
     * @returns {string} The escaped string
     */
    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
