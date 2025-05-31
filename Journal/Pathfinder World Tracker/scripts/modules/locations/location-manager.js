import { LocationService } from './services/location-service.js';
import { LocationUI } from './ui/location-ui-new.js';

/**
 * Main manager for the Locations module
 * Coordinates between the service layer and UI components
 */
export class LocationManager {
    /**
     * Create a new LocationManager instance
     * @param {Object} dataManager - The application's data manager
     * @param {HTMLElement} container - The container element for the UI
     */
    constructor(dataManager, container) {
        console.log('LocationManager constructor called');
        this.dataManager = dataManager;
        this.container = document.createElement('div');
        this.container.className = 'locations-module';
        this.initialized = false;
        
        // Initialize services
        this.locationService = new LocationService(dataManager);
        
        // Create some sample locations if none exist
        if (this.locationService.getAllLocations().length === 0) {
            this.createSampleLocations();
        }
        
        // Add event listener for hash changes to handle navigation
        window.addEventListener('hashchange', () => this.handleHashChange());
        
        // Initial check for current hash
        this.handleHashChange();
    }
    
    /**
     * Initialize the location manager
     */
    initialize() {
        console.log('Initializing LocationManager');
        
        // Only initialize if we're on the locations page
        if (window.location.hash !== '#locations') {
            console.log('Not on locations page, skipping initialization');
            return;
        }
        
        // Check if already initialized to prevent duplicate initialization
        if (this.initialized) {
            console.log('LocationManager already initialized, refreshing UI');
            if (this.locationUI) {
                this.locationUI.refresh();
            }
            return;
        }
        
        // Get the locations section
        let locationsSection = document.getElementById('locations');
        if (!locationsSection) {
            console.log('Creating locations section');
            locationsSection = document.createElement('div');
            locationsSection.id = 'locations';
            locationsSection.className = 'section';
            const mainContent = document.querySelector('main .content-area');
            if (mainContent) {
                mainContent.appendChild(locationsSection);
            } else {
                document.body.appendChild(locationsSection);
            }
        }
        
        // Ensure the section is visible
        locationsSection.style.display = 'block';
        locationsSection.classList.add('active');
        
        // Get all locations and log them for debugging
        const allLocations = this.locationService.getAllLocations();
        console.log('All locations from service:', allLocations);
        
        // Check if we have any locations, create samples if not
        if (allLocations.length === 0) {
            console.log('No locations found, creating sample locations');
            this.createSampleLocations();
        }
        
        // DO NOT clear the section content here, as it might remove the map container
        // Instead, create the structure first
        this.setupLocationSection(locationsSection);
        
        // Create the UI if it doesn't exist yet
        if (!this.locationUI) {
            console.log('Creating LocationUI');
            this.locationUI = new LocationUI(this.locationService, this.dataManager);
        }
        
        // Initialize the UI after the DOM structure is ready
        console.log('Initializing LocationUI');
        this.locationUI.init();
        
        // Set up a multi-stage initialization to ensure everything loads properly
        // Stage 1: Initial refresh
        console.log('Stage 1: Initial refresh');
        this.locationUI.refresh();
        
        // Stage 2: Check map initialization after a short delay
        setTimeout(() => {
            console.log('Stage 2: Checking map initialization');
            if (this.locationUI && !this.locationUI.map) {
                console.log('Map not initialized, attempting to render map view');
                this.locationUI.renderMapView();
            }
            
            // Stage 3: Final check and force refresh if needed
            setTimeout(() => {
                console.log('Stage 3: Final check and refresh');
                
                // Log locations again to ensure they're still available
                const locationsAfterDelay = this.locationService.getAllLocations();
                console.log('Locations after delay:', locationsAfterDelay);
                
                // Check if map was initialized properly
                if (this.locationUI && !this.locationUI.map) {
                    console.log('Map still not initialized, final attempt to render map view');
                    this.locationUI.renderMapView();
                }
                
                // Check if locations list is populated
                const locationsList = document.getElementById('locations-list');
                if (locationsList && locationsList.children.length === 0 && locationsAfterDelay.length > 0) {
                    console.log('Locations list is empty but we have locations, forcing list render');
                    if (this.locationUI.renderList) {
                        this.locationUI.renderList(locationsAfterDelay);
                    } else {
                        console.log('renderList method not found, using refresh instead');
                        this.locationUI.refresh();
                    }
                }
                
                // Add a manual refresh button in case all else fails
                const refreshButton = document.createElement('button');
                refreshButton.id = 'manual-refresh-btn';
                refreshButton.className = 'btn btn-sm btn-outline-primary mt-2';
                refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Map & Locations';
                refreshButton.style.position = 'absolute';
                refreshButton.style.top = '10px';
                refreshButton.style.right = '10px';
                refreshButton.style.zIndex = '1000';
                refreshButton.addEventListener('click', () => {
                    console.log('Manual refresh requested');
                    this.locationUI.renderMapView();
                    this.locationUI.refresh();
                });
                
                // Only add if it doesn't already exist
                if (!document.getElementById('manual-refresh-btn')) {
                    const mapContainer = document.getElementById('worldMapContainer');
                    if (mapContainer) {
                        mapContainer.appendChild(refreshButton);
                    } else {
                        locationsSection.appendChild(refreshButton);
                    }
                }
                
            }, 1500);
            
        }, 500);
        
        // Mark as initialized
        this.initialized = true;
    }
    
    /**
     * Set up the location section with the basic structure
     * @param {HTMLElement} locationsSection - The locations section element
     */
    setupLocationSection(locationsSection) {
        console.log('Setting up location section structure');
        
        // Check if the section header already exists to prevent duplication
        const existingHeader = locationsSection.querySelector('.section-header');
        if (existingHeader) {
            console.log('Section header already exists, skipping creation');
        } else {
            // Create a section header
            const sectionHeader = document.createElement('div');
            sectionHeader.className = 'section-header d-flex justify-content-between align-items-center mb-3';
            sectionHeader.innerHTML = `
                <h2 class="text-accent">Locations</h2>
                <button class="btn btn-primary" id="addLocationBtn">
                    <i class="fas fa-plus"></i> Add Location
                </button>
            `;
            
            // Insert at the beginning of the locations section
            if (locationsSection.firstChild) {
                locationsSection.insertBefore(sectionHeader, locationsSection.firstChild);
            } else {
                locationsSection.appendChild(sectionHeader);
            }
        }
        
        // Check if map container already exists
        let mapContainer = document.getElementById('worldMapContainer');
        if (!mapContainer) {
            console.log('Creating map container');
            mapContainer = document.createElement('div');
            mapContainer.id = 'worldMapContainer';
            mapContainer.className = 'mb-4';
            // Insert after the header
            const header = locationsSection.querySelector('.section-header');
            if (header && header.nextSibling) {
                locationsSection.insertBefore(mapContainer, header.nextSibling);
            } else {
                locationsSection.appendChild(mapContainer);
            }
        } else {
            console.log('Map container already exists');
        }
        
        // Create a row for the locations list and details
        const row = document.createElement('div');
        row.className = 'row';
        row.innerHTML = `
            <div class="col-md-4">
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">Locations</h5>
                    </div>
                    <div class="card-body p-0">
                        <div class="list-group list-group-flush" id="locations-list"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body" id="location-details">
                        <div class="empty-state">
                            <i class="fas fa-map-marker-alt fa-3x mb-3"></i>
                            <p class="empty-state-message">Select a location to view details</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        locationsSection.appendChild(row);
        
        // Append our container to the locations section
        locationsSection.appendChild(this.container);
        
        console.log('Location section structure set up');
    }
    
    /**
     * Render the locations module
     */
    render() {
        console.log('LocationManager render called');
        
        // Only render if we're on the locations page
        if (window.location.hash !== '#locations') {
            console.log('Not on locations page, skipping render');
            return;
        }
        
        // Get the locations section
        let locationsSection = document.getElementById('locations');
        if (!locationsSection) {
            console.error('Locations section not found, cannot render');
            return;
        }
        
        // Make sure the section is visible
        locationsSection.style.display = 'block';
        locationsSection.classList.add('active');
        
        // Refresh the UI to render the location list
        if (this.locationUI) {
            this.locationUI.refresh();
            console.log('Rendered locations list with', this.locationService.getAllLocations().length, 'locations');
        }
    }
    
    /**
     * Get the HTML element for this module
     * @returns {HTMLElement} The container element
     */
    getElement() {
        return this.container;
    }
    
    /**
     * Create sample locations for demonstration
     */
    createSampleLocations() {
        const sampleLocations = [
            {
                name: 'Ironforge City',
                description: 'A bustling city known for its skilled blacksmiths and imposing stone architecture.',
                type: 'CITY',
                x: 250,
                y: 150,
                discovered: true
            },
            {
                name: 'Whispering Woods',
                description: 'A mysterious forest where the trees seem to whisper ancient secrets.',
                type: 'FOREST',
                x: 150,
                y: 200,
                discovered: true
            },
            {
                name: 'Dragon\'s Lair Cave',
                description: 'A dangerous cave system rumored to house an ancient dragon.',
                type: 'CAVE',
                x: 300,
                y: 100,
                discovered: false
            },
            {
                name: 'Sunhaven Village',
                description: 'A peaceful village known for its annual harvest festival.',
                type: 'TOWN',
                x: 200,
                y: 250,
                discovered: true
            },
            {
                name: 'Ancient Temple Ruins',
                description: 'The crumbling remains of a once-grand temple dedicated to a forgotten deity.',
                type: 'RUINS',
                x: 350,
                y: 200,
                discovered: false
            }
        ];
        
        sampleLocations.forEach(location => {
            this.locationService.createLocation(location);
        });
        
        console.log('Created sample locations');
    }
    
    /**
     * Handle hash change events to show/hide the locations section
     */
    handleHashChange() {
        console.log('Hash changed, current hash:', window.location.hash);
        
        // Check if we're on the locations page
        const isLocationsPage = window.location.hash === '#locations';
        
        // Get all sections
        const sections = document.querySelectorAll('.section');
        
        // Find the locations section
        const locationsSection = document.getElementById('locations');
        
        if (isLocationsPage) {
            console.log('On locations page, showing locations section');
            
            // Initialize if not already initialized
            if (!this.initialized) {
                this.initialize();
            } else {
                // Just render if already initialized
                this.render();
            }
            
            // Make sure the section is visible
            if (locationsSection) {
                locationsSection.style.display = 'block';
                locationsSection.classList.add('active');
            }
        } else {
            console.log('Not on locations page, hiding locations section');
            
            // Hide the locations section
            if (locationsSection) {
                locationsSection.style.display = 'none';
                locationsSection.classList.remove('active');
            }
            
            // Remove any locations modules from other sections
            sections.forEach(section => {
                if (section.id !== 'locations') {
                    const locationModules = section.querySelectorAll('.locations-module');
                    locationModules.forEach(module => {
                        if (module.parentNode) {
                            module.parentNode.removeChild(module);
                        }
                    });
                }
            });
        }
    }
    
    /**
     * Refresh the UI with the latest data
     */
    refresh() {
        if (this.locationUI) {
            this.locationUI.refresh();
        }
    }
    
    /**
     * Clean up event listeners and resources
     */
    destroy() {
        // Clean up any event listeners or resources
        this.container.innerHTML = '';
        
        // Remove hash change event listener
        window.removeEventListener('hashchange', this.handleHashChange);
    }
}
