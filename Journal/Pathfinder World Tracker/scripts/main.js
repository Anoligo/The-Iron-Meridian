import { QuestsManager as QuestManager } from './modules/quests/index.js';
import { PlayersManager as PlayerManager, Player } from './modules/players/index.js';
import { LootManager } from './modules/loot/index.js';
import { LocationManager } from './modules/locations/index.js';
import { NotesManager } from './modules/notes/index.js';
import { GuildManager } from './modules/guild/index.js';
import { CharactersManager } from './modules/characters/index.js';
import { CharacterService } from './modules/characters/services/character-service.js';
import { CharacterUI } from './modules/characters/ui/character-ui-new.js';
import { FactionUI } from './modules/factions/ui/faction-ui.js';
import { applyGlobalStyles } from './global-styles.js';
import { applyIronMeridianStyling } from './utils/form-styling.js';
import './characters.js';
// Local Storage Management
const StorageManager = {
    save: (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    },
    load: (key) => {
        try {
            // First, check if localStorage is available
            if (typeof localStorage === 'undefined' || !localStorage) {
                console.warn('localStorage is not available in this environment');
                return null;
            }

            // Check if the key is valid
            if (typeof key !== 'string' || key.trim() === '') {
                console.error('Invalid key provided to StorageManager.load:', key);
                return null;
            }

            // Try to get the item from localStorage
            const data = localStorage.getItem(key);
            
            // If no data exists for the key, return null
            if (data === null || data === undefined) {
                console.log(`No data found in localStorage for key: ${key}`);
                return null;
            }
            
            // If the data is not a string, return null
            if (typeof data !== 'string') {
                console.error(`Unexpected data type in localStorage for key ${key}:`, typeof data);
                return null;
            }
            
            // If the data is an empty string, return null
            const trimmedData = data.trim();
            if (trimmedData === '') {
                console.log(`Empty data found in localStorage for key: ${key}`);
                return null;
            }
            
            // Special check for 'undefined' string
            if (trimmedData === 'undefined') {
                console.log(`Found 'undefined' string in localStorage for key: ${key}`);
                return null;
            }
            
            // Try to parse the JSON data
            try {
                return JSON.parse(trimmedData);
            } catch (parseError) {
                console.error(`Failed to parse JSON data for key ${key}:`, parseError);
                // Don't log the data as it might be sensitive
                return null;
            }
        } catch (error) {
            // Catch any unexpected errors
            console.error(`Unexpected error in StorageManager.load for key ${key}:`, error);
            return null;
        }
    },
    clear: (key) => {
        localStorage.removeItem(key);
    }
};

// Data structure for the application
const initialState = {
    quests: [],
    players: [],
    loot: [],
    locations: [],
    notes: [],
    characters: [],
    guildLogs: {
        activities: [],
        resources: []
    },
    guildResources: [],
    factions: []
};

// Initialize managers with DataManager
let questManager, playerManager, lootManager, locationManager, notesManager, guildManager, factionUI, dataManager;

/**
 * Initialize the Factions UI
 * @returns {FactionUI|null} The initialized FactionUI instance or null if initialization fails
 */
const initFactionsUI = () => {
    try {
        const factionsContainer = document.getElementById('factions-container');
        if (factionsContainer) {
            // Clear any existing content to prevent duplicates
            factionsContainer.innerHTML = '';
            
            // Initialize the Faction UI
            factionUI = new FactionUI(factionsContainer, dataManager);
            console.log('Factions module initialized successfully');
            return factionUI;
        }
    } catch (error) {
        console.error('Failed to initialize Factions module:', error);
    }
    return null;
};

// Navigation Management
class NavigationManager {
    constructor() {
        this.setupEventListeners();
        this.loadInitialSection();
    }

    setupEventListeners() {
        console.log('[Navigation] Setting up event listeners');
        
        // Use event delegation for better performance and reliability
        document.addEventListener('click', (e) => {
            // Find the closest nav-link ancestor of the clicked element
            const navLink = e.target.closest('.nav-link');
            if (!navLink) {
                console.log('[Navigation] Click was not on a nav link');
                return;
            }
            
            e.preventDefault();
            
            // Get the href and extract the section ID
            const href = navLink.getAttribute('href');
            console.log('[Navigation] Nav link clicked, href:', href);
            
            if (!href || !href.startsWith('#')) {
                console.log('[Navigation] Invalid href or not a hash link:', href);
                return;
            }
            
            const sectionId = href.substring(1);
            console.log(`[Navigation] Navigating to section: ${sectionId}`);
            
            this.navigateToSection(sectionId);
        });
        
        // Also handle popstate for back/forward navigation
        window.addEventListener('popstate', () => {
            const sectionId = window.location.hash.substring(1) || 'dashboard';
            console.log(`[Navigation] Popstate detected, navigating to: ${sectionId}`);
            this.navigateToSection(sectionId);
        });
        
        console.log('[Navigation] Event listeners set up');
    }

    loadInitialSection() {
        const hash = window.location.hash.substring(1) || 'dashboard';
        this.navigateToSection(hash);
    }

    navigateToSection(sectionId) {
        console.log(`[Navigation] Attempting to navigate to: ${sectionId}`);
        
        // Default to dashboard if no section is specified
        if (!sectionId) {
            sectionId = 'dashboard';
            window.location.hash = '#' + sectionId;
        }
        
        // Update navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            
            const linkSection = href.substring(1);
            if (linkSection === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Hide all sections first
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            if (section.id !== sectionId) {
                section.classList.remove('active');
                section.style.display = 'none';
            }
        });

        // Show the target section
        let targetSection = document.getElementById(sectionId);
        
        // If the section doesn't exist, try to create it
        if (!targetSection) {
            console.log(`[Navigation] Section ${sectionId} not found, creating it...`);
            const mainContent = document.querySelector('main .content-area') || document.querySelector('main');
            if (mainContent) {
                targetSection = document.createElement('div');
                targetSection.id = sectionId;
                targetSection.className = 'section';
                targetSection.innerHTML = `<h2>${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}</h2>`;
                mainContent.appendChild(targetSection);
            } else {
                console.error('[Navigation] Main content area not found');
                return;
            }
        }

        // Show the target section
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
        
        console.log(`[Navigation] Showing section: ${sectionId}`);
        
        // Initialize section content if it exists
        try {
            switch(sectionId) {
                case 'dashboard':
                    // Dashboard doesn't need special initialization
                    break;
                case 'quests':
                    if (questManager && typeof questManager.initialize === 'function') {
                        questManager.initialize();
                    }
                    break;
                case 'players':
                    if (playerManager && typeof playerManager.initialize === 'function') {
                        playerManager.initialize();
                    }
                    break;
                case 'loot':
                    if (lootManager) {
                        if (typeof lootManager.initialize === 'function' && !lootManager.initialized) {
                            lootManager.initialize();
                        }
                        if (typeof lootManager.render === 'function') {
                            lootManager.render();
                        }
                    }
                    break;
                case 'locations':
                    if (locationManager) {
                        if (typeof locationManager.initialize === 'function') {
                            locationManager.initialize();
                        }
                        if (typeof locationManager.render === 'function') {
                            locationManager.render();
                        }
                    }
                    break;
                case 'notes':
                    if (notesManager && typeof notesManager.initialize === 'function') {
                        notesManager.initialize();
                    }
                    break;
                case 'guild':
                    if (guildManager && typeof guildManager.initializeGuildSection === 'function') {
                        guildManager.initializeGuildSection();
                    }
                    break;
                case 'characters':
                    if (window.charactersManager && typeof window.charactersManager.initialize === 'function') {
                        window.charactersManager.initialize();
                    }
                    break;
                case 'factions':
                    // Initialize or reinitialize the Factions UI
                    if (!factionUI) {
                        factionUI = initFactionsUI();
                    } else if (typeof factionUI.refresh === 'function') {
                        factionUI.refresh();
                    }
                    break;
                default:
                    console.warn(`[Navigation] No handler for section: ${sectionId}`);
            }
        } catch (error) {
            console.error(`[Navigation] Error initializing section ${sectionId}:`, error);
        }
        
        // Update URL hash without triggering navigation
        if (window.location.hash.substring(1) !== sectionId) {
            history.pushState(null, '', `#${sectionId}`);
        }

        // Clean up any lingering location containers in the body
        document.querySelectorAll('body > .locations-module').forEach(container => {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        });

        // Update URL hash without page reload
        if (window.location.hash.substring(1) !== sectionId) {
            history.pushState(null, null, `#${sectionId}`);
        }
    }
}

// Data Management
class DataManager {
    constructor() {
        console.log('Initializing DataManager');
        
        // Initialize subscribers set
        this.subscribers = new Set();
        
        // Define a minimal valid state
        const minimalState = {
            quests: [],
            players: [],
            loot: [],
            locations: [],
            notes: [],
            characters: [],
            guildLogs: { activities: [], resources: [] },
            guildResources: [],
            factions: []
        };
        
        // Function to safely clone an object
        const safeClone = (obj) => {
            try {
                if (obj === undefined || obj === null) return null;
                return JSON.parse(JSON.stringify(obj));
            } catch (error) {
                console.error('Error cloning object:', error);
                return null;
            }
        };
        
        // Function to safely get an item from localStorage
        const safeLoad = (key) => {
            try {
                const data = localStorage.getItem(key);
                if (data === null || data === undefined) return null;
                if (typeof data !== 'string') return null;
                const trimmed = data.trim();
                if (trimmed === '' || trimmed === 'undefined') return null;
                return JSON.parse(trimmed);
            } catch (error) {
                console.error(`Error loading ${key} from localStorage:`, error);
                return null;
            }
        };
        
        // Try to create a deep copy of the initial state
        let initialStateCopy = safeClone(initialState) || {};
        
        // Ensure we have a valid object
        if (typeof initialStateCopy !== 'object' || initialStateCopy === null) {
            console.error('Invalid initial state, using minimal state');
            initialStateCopy = {};
        }
        
        // Ensure all required fields exist
        Object.keys(minimalState).forEach(key => {
            if (!(key in initialStateCopy)) {
                const cloned = safeClone(minimalState[key]);
                if (cloned !== null) {
                    initialStateCopy[key] = cloned;
                } else {
                    console.warn(`Failed to clone default value for ${key}`);
                    initialStateCopy[key] = Array.isArray(minimalState[key]) ? [] : {};
                }
            }
        });
        
        // Initialize with the default state
        this._state = { ...initialStateCopy };
        
        // Try to load the saved state using our safeLoad function
        try {
            const loadedState = safeLoad('appState');
            
            // Only proceed if we have a valid loaded state
            if (loadedState && typeof loadedState === 'object' && !Array.isArray(loadedState)) {
                console.log('Merging loaded state with initial state');
                
                // Create a new state object starting with the default values
                const mergedState = { ...initialStateCopy };
                
                // Revive players into Player class instances if they exist
                if (Array.isArray(loadedState.players)) {
                    console.log('Reviving players from saved state');
                    mergedState.players = loadedState.players.map(playerData => {
                        try {
                            const player = new Player(
                                playerData.name,
                                playerData.class,
                                playerData.level,
                                playerData.id,
                                playerData.createdAt,
                                playerData.updatedAt
                            );
                            // Copy additional properties that might exist
                            Object.assign(player, {
                                experience: playerData.experience || 0,
                                inventory: playerData.inventory || [],
                                activeQuests: playerData.activeQuests || [],
                                completedQuests: playerData.completedQuests || []
                            });
                            return player;
                        } catch (error) {
                            console.error('Error reviving player:', error, playerData);
                            return null;
                        }
                    }).filter(Boolean); // Remove any null entries from failed revivals
                }
                
                // Function to safely merge objects
                const safeMerge = (target, source, key) => {
                    if (!source || typeof source !== 'object' || !(key in source)) {
                        return; // Skip if source is invalid or key doesn't exist
                    }
                    
                    const sourceValue = source[key];
                    const targetValue = target[key];
                    
                    try {
                        // For arrays, ensure we have an array
                        if (Array.isArray(targetValue)) {
                            mergedState[key] = Array.isArray(sourceValue) ? 
                                [...sourceValue] : [];
                        } 
                        // For objects, merge them
                        else if (targetValue && typeof targetValue === 'object' && 
                                sourceValue && typeof sourceValue === 'object') {
                            mergedState[key] = { ...targetValue, ...sourceValue };
                        } 
                        // For other types, copy directly if it exists and is defined
                        else if (sourceValue !== undefined) {
                            mergedState[key] = sourceValue;
                        }
                    } catch (mergeError) {
                        console.error(`Error merging property ${key}:`, mergeError);
                        // Keep the target value if merge fails
                    }
                };
                
                // Only merge properties that exist in the minimal state
                Object.keys(minimalState).forEach(key => {
                    safeMerge(initialStateCopy, loadedState, key);
                });
                
                // Ensure all array properties are arrays and handle special cases
                Object.entries(mergedState).forEach(([key, value]) => {
                    if (Array.isArray(minimalState[key])) {
                        if (!Array.isArray(value)) {
                            mergedState[key] = [];
                        }
                    } else if (key === 'guildLogs') {
                        // Special handling for guildLogs
                        try {
                            if (!value || typeof value !== 'object') {
                                mergedState.guildLogs = { activities: [], resources: [] };
                            } else {
                                mergedState.guildLogs = {
                                    activities: Array.isArray(value.activities) ? 
                                        [...value.activities] : [],
                                    resources: Array.isArray(value.resources) ? 
                                        [...value.resources] : []
                                };
                            }
                        } catch (e) {
                            console.error('Error initializing guildLogs:', e);
                            mergedState.guildLogs = { activities: [], resources: [] };
                        }
                    }
                });
                
                this._state = mergedState;
            } else {
                console.log('Using initial state (no valid loaded state)');
            }
            
            console.log('Initialized state structure:', this._state);
            this.subscribers = new Set();
            
            // Ensure all arrays exist and are valid
            const arrayFields = ['quests', 'players', 'loot', 'locations', 'notes', 'characters', 'guildResources', 'factions'];
            arrayFields.forEach(field => {
                if (!Array.isArray(this._state[field])) {
                    console.warn(`Initializing empty array for ${field}`);
                    this._state[field] = [];
                }
            });
            
            // Ensure guildLogs structure is valid
            if (!this._state.guildLogs || typeof this._state.guildLogs !== 'object') {
                this._state.guildLogs = { activities: [], resources: [] };
            }
            
            // Ensure activities and resources are arrays
            if (!Array.isArray(this._state.guildLogs.activities)) {
                this._state.guildLogs.activities = [];
            }
            if (!Array.isArray(this._state.guildLogs.resources)) {
                this._state.guildLogs.resources = [];
            }
        } catch (error) {
            console.error('Error initializing DataManager:', error);
            // Fall back to a clean initial state
            this._state = JSON.parse(JSON.stringify(initialState));
            this.subscribers = new Set();
        }
        
        console.log('Final initialized state:', this._state);
    }

    loadData() {
        try {
            const loadedState = StorageManager.load('appState');
            console.log('Loading state:', loadedState);
            
            if (loadedState) {
                // Ensure characters array exists and is properly formatted
                const characters = Array.isArray(loadedState.characters) ? 
                    loadedState.characters.map(char => ({
                        ...char,
                        // Ensure required fields exist
                        id: char.id || `char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        name: char.name || 'Unnamed Character',
                        race: char.race || 'Unknown',
                        classType: char.classType || 'Adventurer',
                        level: typeof char.level === 'number' ? char.level : 1,
                        attributes: {
                            strength: typeof char.attributes?.strength === 'number' ? char.attributes.strength : 10,
                            dexterity: typeof char.attributes?.dexterity === 'number' ? char.attributes.dexterity : 10,
                            constitution: typeof char.attributes?.constitution === 'number' ? char.attributes.constitution : 10,
                            intelligence: typeof char.attributes?.intelligence === 'number' ? char.attributes.intelligence : 10,
                            wisdom: typeof char.attributes?.wisdom === 'number' ? char.attributes.wisdom : 10,
                            charisma: typeof char.attributes?.charisma === 'number' ? char.attributes.charisma : 10
                        },
                        skills: Array.isArray(char.skills) ? char.skills : [],
                        inventory: Array.isArray(char.inventory) ? char.inventory : [],
                        quests: Array.isArray(char.quests) ? char.quests : [],
                        bio: typeof char.bio === 'string' ? char.bio : '',
                        notes: typeof char.notes === 'string' ? char.notes : '',
                        createdAt: char.createdAt || new Date().toISOString(),
                        updatedAt: char.updatedAt || new Date().toISOString()
                    })) : [];
                
                // Update the state with the loaded data
                this._state = {
                    ...initialState, // Start with default values
                    ...loadedState,  // Override with loaded values
                    characters      // Ensure characters is properly formatted
                };
            } else {
                // No saved state, use initial state
                this._state = { ...initialState };
            }
            
            // Ensure characters array exists
            if (!Array.isArray(this._state.characters)) {
                this._state.characters = [];
            }
            
            console.log('State after loading:', this._state);
        } catch (error) {
            console.error('Error loading state:', error);
            this._state = { ...initialState };
        }
    }

    // State management methods
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    notifySubscribers() {
        this.subscribers.forEach(callback => callback(this._state));
    }

    // Get the current state
    get appState() {
        return this._state;
    }

    // Set the state (private)
    set appState(value) {
        this._state = value;
    }

    saveData() {
        try {
            // First save the entire state
            const stateToSave = {
                ...this._state,
                // Ensure characters is properly serialized
                characters: Array.isArray(this._state.characters) ? 
                    this._state.characters.map(char => ({
                        ...char,
                        // Ensure dates are properly serialized
                        createdAt: char.createdAt || new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    })) : []
            };
            
            console.log('Saving state:', stateToSave);
            StorageManager.save('appState', stateToSave);
            
            // Also save individual keys for backward compatibility
            Object.keys(stateToSave).forEach(key => {
                StorageManager.save(key, stateToSave[key]);
            });
            
            this.notifySubscribers();
            console.log('State saved successfully');
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    addQuest(quest) {
        this._state.quests.push(quest);
        this.saveData();
    }



    addLoot(item) {
        this.state.loot.push(item);
        this.saveData();
    }

    addLocation(location) {
        this.state.locations.push(location);
        this.saveData();
    }

    addNote(note) {
        this._state.notes.push(note);
        this.saveData();
    }
    
    /**
     * Adds a new player to the application state
     * @param {Player} player - The player to add
     */
    addPlayer(player) {
        if (!this._state.players) {
            this._state.players = [];
        }
        this._state.players.push(player);
        this.saveData();
        this.notifySubscribers();
    }

    addGuildLog(log) {
        if (!this.state.guildLogs) {
            this.state.guildLogs = {
                activities: [],
                resources: []
            };
        }
        if (log.type === 'activity') {
            this.appState.guildLogs.activities.push(log);
        } else if (log.type === 'resource') {
            this.appState.guildLogs.resources.push(log);
        }
        this.saveData();
    }

    // Export data as JSON
    exportData() {
        const dataStr = JSON.stringify(this.appState, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'iron-meridian-backup.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    // Get quest by ID
    getQuestById(id) {
        if (!id) throw new Error('Invalid quest ID');
        const quest = this._state.quests.find(q => q.id === id);
        if (!quest) throw new Error(`Quest with ID ${id} not found`);
        return quest;
    }

    get appState() {
        return this._state;
    }
}

// Data Management Functions
class DataManagement {
    /**
     * Export all application data to a JSON file
     * @param {Object} data - The data to export
     */
    static exportData(data) {
        try {
            // Create a blob with the data
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            
            // Create a download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            
            a.href = url;
            a.download = `iron-meridian-backup-${timestamp}.json`;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);
            
            return true;
        } catch (error) {
            console.error('Error exporting data:', error);
            return false;
        }
    }
    
    /**
     * Import data from a file
     * @param {File} file - The file to import
     * @returns {Promise<Object>} - The parsed data or null if there was an error
     */
    static importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    resolve(data);
                } catch (error) {
                    console.error('Error parsing JSON file:', error);
                    reject(new Error('Invalid JSON file'));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Error reading file'));
            };
            
            reader.readAsText(file);
        });
    }
}

// Global variables will be declared at the module level
// to avoid polluting the global scope

// Initialize the application
function initializeApplication() {
    // Apply global styles
    applyGlobalStyles();
    
    // Apply Iron Meridian styling to form elements
    applyIronMeridianStyling();
    
    // Set up a MutationObserver to apply styling to dynamically added elements
    const bodyObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Apply styling to newly added nodes
                applyIronMeridianStyling();
            }
        });
    });
    
    // Start observing the body for changes
    bodyObserver.observe(document.body, { childList: true, subtree: true });

    try {
        // Initialize data manager
        const dataManager = new DataManager();
        window.dataManager = dataManager; // Make it globally available

        // Initialize navigation manager
        const navigationManager = new NavigationManager();
        window.navigationManager = navigationManager;

        // Initialize quest manager
        const questManager = new QuestManager(dataManager);
        window.questManager = questManager;

        // Initialize player manager
        const playerManager = new PlayerManager(dataManager);
        window.playerManager = playerManager;

        // Initialize loot manager
        const lootManager = new LootManager(dataManager);
        window.lootManager = lootManager;

        // Initialize location manager
        const locationManager = new LocationManager(dataManager);
        window.locationManager = locationManager;

        // Initialize notes manager
        const notesManager = new NotesManager(dataManager);
        window.notesManager = notesManager;

        // Initialize guild manager
        const guildManager = new GuildManager(dataManager);
        window.guildManager = guildManager;

        // Initialize data management UI
        initializeDataManagement();

        // Initialize Characters components
        const characterService = new CharacterService(dataManager);
        const characterUI = new CharacterUI(characterService, dataManager);
        const charactersManager = new CharactersManager(dataManager);

        // Make them available globally for debugging
        window.characterService = characterService;
        window.characterUI = characterUI;
        window.charactersManager = charactersManager;

        // Initialize Factions UI if we're on the factions page or section
        if (window.location.pathname.endsWith('factions.html') || window.location.hash === '#factions') {
            initFactionsUI();
        }

        // Initialize all sections
        questManager.initialize();
        playerManager.initialize();
        lootManager.initialize(); // Initialize loot manager
        locationManager.initialize();
        notesManager.initialize();
        guildManager.initializeGuildSection();

        // Initialize characters module and handle any errors
        charactersManager.initialize().catch(error => {
            console.error('Error initializing characters module:', error);
        });

        // Single subscription to state changes for dashboard updates
        dataManager.subscribe(updateDashboardCounters);
        
        // Initial dashboard update
        updateDashboardCounters(dataManager.appState);

    } catch (error) {
        console.error('Error initializing application:', error);
        showToast('Error initializing application. Please check the console for details.', 'danger');
    }
}

// Helper function to show toast messages
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer') || (() => {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    })();
    
    const toast = document.createElement('div');
    toast.className = `toast show align-items-center text-white bg-${type} border-0`;
    toast.role = 'alert';
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove the toast after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode === toastContainer) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 5000);
    
    // Add click handler to close button
    const closeBtn = toast.querySelector('.btn-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode === toastContainer) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        });
    }
}

// Initialize data management after the DOM is fully loaded
function initializeDataManagement() {
    console.log('Initializing data management...');
    
    const exportBtn = document.getElementById('exportDataBtn');
    const importBtn = document.getElementById('importDataBtn');
    const importFileInput = document.getElementById('importFileInput');
    const importStatus = document.getElementById('importStatus');
    
    console.log('Export button:', exportBtn);
    console.log('Import button:', importBtn);
    console.log('File input:', importFileInput);
    
    // Export button click handler
    if (exportBtn) {
        console.log('Adding export button click handler');
        exportBtn.addEventListener('click', () => {
            console.log('Export button clicked');
            try {
                const success = DataManagement.exportData(window.dataManager.appState);
                console.log('Export result:', success ? 'success' : 'failed');
                if (success) {
                    showToast('Data exported successfully!', 'success');
                } else {
                    showToast('Failed to export data', 'danger');
                }
            } catch (error) {
                console.error('Error in export handler:', error);
                showToast('Error exporting data', 'danger');
            }
        });
    } else {
        console.error('Export button not found');
    }
    
    // Enable/disable import button based on file selection
    if (importFileInput && importBtn) {
        importFileInput.addEventListener('change', (e) => {
            importBtn.disabled = !e.target.files || e.target.files.length === 0;
        });
    }
    
    // Import button click handler
    if (importBtn) {
        importBtn.addEventListener('click', async () => {
            const file = importFileInput.files[0];
            if (!file) return;
            
            try {
                importBtn.disabled = true;
                importStatus.textContent = 'Importing data...';
                importStatus.className = 'text-info';
                
                const data = await DataManagement.importData(file);
                
                // Validate the imported data structure
                if (!data || typeof data !== 'object') {
                    throw new Error('Invalid data format');
                }
                
                // Show confirmation dialog before importing
                if (confirm('WARNING: This will overwrite all current data. Are you sure you want to continue?')) {
                    // Update the app state with the imported data
                    window.dataManager.appState = data;
                    window.dataManager.saveData();
                    
                    // Show success message
                    importStatus.textContent = 'Data imported successfully! Refreshing...';
                    importStatus.className = 'text-success';
                    
                    // Refresh the page to apply changes
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    importStatus.textContent = 'Import cancelled';
                    importStatus.className = 'text-muted';
                }
            } catch (error) {
                console.error('Error in import handler:', error);
                importStatus.textContent = `Error: ${error.message || 'Failed to import data'}`;
                importStatus.className = 'text-danger';
            } finally {
                importBtn.disabled = false;
            }
        });
    } else {
        console.error('Import button not found');
    }
}

// Initialize application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    initializeApplication();
}

function updateDashboardCounters(state) {
    const activeQuests = state.quests.filter(q => q.status === 'ongoing').length;
    const partyMembers = state.players.length;
    const locations = state.locations.length;

    document.getElementById('activeQuestsCount').textContent = activeQuests;
    document.getElementById('partyMembersCount').textContent = partyMembers;
    document.getElementById('locationsCount').textContent = locations;
}