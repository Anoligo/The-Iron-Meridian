/**
 * Characters Module - Entry Point
 * This file serves as the entry point for the Characters module
 */

import { CharactersManager } from './modules/characters/index.js';
import { CharacterService } from './modules/characters/services/character-service.js';
import { CharacterUI } from './modules/characters/ui/character-ui.js';

// Function to initialize the Characters module
function initializeCharacters() {
    // Check if the dataManager is available
    if (typeof window.dataManager === 'undefined') {
        console.warn('DataManager not found. Will retry initialization...');
        setTimeout(initializeCharacters, 100);
        return;
    }

    try {
        // Initialize the CharacterService
        const characterService = new CharacterService(window.dataManager);
        
        // Initialize the CharactersManager
        const charactersManager = new CharactersManager(window.dataManager);
        charactersManager.initialize();
        
        // Initialize the UI
        const characterUI = new CharacterUI(characterService, window.dataManager);
        
        // Make them available globally for debugging
        window.characterService = characterService;
        window.characterUI = characterUI;
        window.charactersManager = charactersManager;
        
        console.log('Characters module initialized successfully');
    } catch (error) {
        console.error('Error initializing Characters module:', error);
    }
}

// Start the initialization process
if (typeof document !== 'undefined') {
    // Wait for the DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', initializeCharacters);
} else {
    // For non-browser environments, try to initialize immediately
    initializeCharacters();
}

// Export the CharactersManager and other components for use in other modules
export { CharactersManager } from './modules/characters/index.js';
export { Character } from './modules/characters/characters.js';
export { CharacterUI } from './modules/characters/ui/character-ui.js';
export { CharacterService } from './modules/characters/services/character-service.js';
