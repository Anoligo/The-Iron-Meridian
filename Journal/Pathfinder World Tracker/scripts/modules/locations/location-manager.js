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
        this.dataManager = dataManager;
        this.container = container || document.createElement('div');
        this.container.className = 'locations-module';
        
        // Initialize services and UI
        this.locationService = new LocationService(dataManager);
        this.locationUI = new LocationUI(this.locationService, dataManager);
        
        // Initialize the UI
        this.locationUI.init();
        
        // Create some sample locations if none exist
        if (this.locationService.getAllLocations().length === 0) {
            this.createSampleLocations();
        }
        
        // Initial render
        this.initialize();
    }
    
    /**
     * Initialize the location manager
     */
    initialize() {
        console.log('Initializing LocationManager');
        // Create the locations section if it doesn't exist
        let locationsSection = document.getElementById('locations');
        if (!locationsSection) {
            console.log('Creating locations section');
            locationsSection = document.createElement('div');
            locationsSection.id = 'locations';
            document.body.appendChild(locationsSection);
        }
        
        // Ensure the container is visible
        locationsSection.style.display = 'block';
        
        // Render the locations module
        this.render();
        
        // Explicitly initialize the UI
        this.locationUI.init();
        
        // Force a refresh to ensure everything is rendered properly
        setTimeout(() => {
            console.log('Forcing UI refresh');
            this.locationUI.refresh();
        }, 500);
    }
    
    /**
     * Render the locations module
     */
    render() {
        let locationsSection = document.getElementById('locations');
        
        // Create the locations section if it doesn't exist
        if (!locationsSection) {
            console.log('Locations section not found, creating it...');
            const mainContent = document.querySelector('main .content-area');
            if (!mainContent) {
                console.error('Main content area not found');
                return;
            }
            
            locationsSection = document.createElement('div');
            locationsSection.id = 'locations';
            locationsSection.className = 'section';
            mainContent.appendChild(locationsSection);
        }

        // Clear any existing content in our container
        this.container.innerHTML = '';
        
        // Important: Check if the container is the same as locationsSection to avoid circular reference
        if (this.container === locationsSection) {
            console.warn('Container is the same as locationsSection, creating a new container');
            // Create a new container to avoid circular reference
            this.container = document.createElement('div');
            this.container.className = 'locations-module';
        }
        
        // Always render the locations content when this method is called
        // Make sure the container is inside the locations section
        if (this.container.parentElement !== locationsSection) {
            locationsSection.appendChild(this.container);
        }
        
        // Set the section as active
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        locationsSection.classList.add('active');
        
        // Refresh the UI to render the location list
        this.locationUI.refresh();
        console.log('Rendered locations list with', this.locationService.getAllLocations().length, 'locations');
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
     * Refresh the UI with the latest data
     */
    refresh() {
        this.locationUI.refresh();
    }
    
    /**
     * Clean up event listeners and resources
     */
    destroy() {
        // Clean up any event listeners or resources
        this.container.innerHTML = '';
    }
}
