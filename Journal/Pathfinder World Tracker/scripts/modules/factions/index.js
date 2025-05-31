import { FactionUI } from './ui/faction-ui.js';

// Initialize the Factions module when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize the Faction UI
        const factionUI = new FactionUI();
        
        // Make it available globally for debugging (remove in production)
        window.factionUI = factionUI;
        
        console.log('Factions module initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Factions module:', error);
    }
});

// Export the FactionUI class for other modules to use
export { FactionUI } from './ui/faction-ui.js';
