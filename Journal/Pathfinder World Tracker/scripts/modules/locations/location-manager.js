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
        
        // Initial render
        this.initialize();
    }
    
    /**
     * Initialize the location manager
     */
    initialize() {
        this.render();
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
        
        // Render the location list
        this.locationUI.render();
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
