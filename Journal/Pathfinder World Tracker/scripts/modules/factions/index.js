import { FactionUI } from './ui/faction-ui.js';

/**
 * Initialize the factions section when navigated to.
 */
export async function initializeFactionsSection() {
    try {
        const container = document.getElementById('factions-container');
        if (!container) {
            console.warn('Factions container not found');
            return;
        }

        // Lazily create the UI instance
        if (!window.app) window.app = {};
        if (!window.app.factionUI) {
            const { appState } = await import('../../core/state/app-state.js');
            const dataManager = {
                appState,
                saveData: () => appState.update({}, true)
            };
            window.app.factionUI = new FactionUI(container, dataManager);
        } else {
            window.app.factionUI.refresh?.();
        }

        console.log('Factions section initialized');
    } catch (error) {
        console.error('Failed to initialize Factions section:', error);
    }
}

// Export the FactionUI class for other modules to use
export { FactionUI } from './ui/faction-ui.js';
