import { QuestsManager as QuestManager } from './modules/quests/index.js';
import { PlayersManager as PlayerManager, Player } from './modules/players/index.js';
import { LootManager } from './modules/loot.js';
import { LocationManager } from './modules/locations.js';
import { NotesManager } from './modules/notes/index.js';
import { GuildManager } from './modules/guild.js';
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
    guildLogs: {
        activities: [],
        resources: []
    },
    guildResources: []
};

// Initialize managers with DataManager
let questManager, playerManager, lootManager, locationManager, notesManager, guildManager;

// Navigation Management
class NavigationManager {
    constructor() {
        this.setupEventListeners();
        this.loadInitialSection();
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = e.target.getAttribute('href').substring(1);
                this.navigateToSection(sectionId);
            });
        });
    }

    loadInitialSection() {
        const hash = window.location.hash.substring(1) || 'dashboard';
        this.navigateToSection(hash);
    }

    navigateToSection(sectionId) {
        // Update navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });

        // Update content sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            // Initialize section content if it exists
            switch(sectionId) {
                case 'quests':
                    questManager.initializeQuestsSection();
                    break;
                case 'players':
                    playerManager.initialize();
                    break;
                case 'loot':
                    lootManager.initializeLootSection();
                    break;
                case 'locations':
                    locationManager.initializeLocationsSection();
                    break;
                case 'notes':
                    notesManager.initialize();
                    break;
                case 'guild':
                    guildManager.initializeGuildSection();
                    break;
            }
        }

        // Update URL hash
        window.location.hash = sectionId;
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
            guildLogs: { activities: [], resources: [] },
            guildResources: []
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
            const arrayFields = ['quests', 'players', 'loot', 'locations', 'notes', 'guildResources'];
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
        const loadedState = StorageManager.load('appState');
        console.log('Loading state:', loadedState);
        this._state = loadedState || {...initialState};
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
        StorageManager.save('appState', this._state);
        this.notifySubscribers();
        // Save all data to localStorage
        Object.keys(this._state).forEach(key => {
            StorageManager.save(key, this._state[key]);
        });
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

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize data manager
    const dataManager = new DataManager();
    
    // Make dataManager available globally for debugging
    window.dataManager = dataManager;

    // Initialize managers with DataManager
    questManager = new QuestManager(dataManager);
    playerManager = new PlayerManager(dataManager);
    lootManager = new LootManager(dataManager);
    locationManager = new LocationManager(dataManager);
    notesManager = new NotesManager(dataManager);
    guildManager = new GuildManager(dataManager);

    // Initialize navigation
    const navigationManager = new NavigationManager();
    
    // Initialize all sections
    questManager.initializeQuestsSection();
    playerManager.initialize();
    lootManager.initializeLootSection();
    locationManager.initializeLocationsSection();
    notesManager.initialize();
    guildManager.initializeGuildSection();

    // Subscribe to state changes for dashboard updates
    dataManager.subscribe(state => {
        const activeQuests = state.quests.filter(q => q.status === 'ongoing').length;
        const partyMembers = state.players.length;
        const locations = state.locations.length;

        document.getElementById('activeQuestsCount').textContent = activeQuests;
        document.getElementById('partyMembersCount').textContent = partyMembers;
        document.getElementById('locationsCount').textContent = locations;
    });

    // Initialize the dashboard with default values
    document.getElementById('activeQuestsCount').textContent = '0';
    document.getElementById('partyMembersCount').textContent = '0';
    document.getElementById('locationsCount').textContent = '0';

    // Make managers available globally for debugging
    window.questManager = questManager;
    window.playerManager = playerManager;
    window.lootManager = lootManager;
    window.locationManager = locationManager;
    window.notesManager = notesManager;
    window.guildManager = guildManager;
    window.navigationManager = navigationManager;

    // Subscribe to state changes for dashboard updates
    dataManager.subscribe(state => {
        const activeQuests = state.quests.filter(q => q.status === 'ongoing').length;
        const partyMembers = state.players.length;
        const locations = state.locations.length;

        document.getElementById('activeQuestsCount').textContent = activeQuests;
        document.getElementById('partyMembersCount').textContent = partyMembers;
        document.getElementById('locationsCount').textContent = locations;
    });
    
    // Make managers available globally for debugging
    window.dataManager = dataManager;
    window.questManager = questManager;
    window.playerManager = playerManager;
    window.lootManager = lootManager;
    window.locationManager = locationManager;
    window.notesManager = notesManager;
    window.guildManager = guildManager;

    // Subscribe to state changes for dashboard updates
    dataManager.subscribe(state => {
        const activeQuests = state.quests.filter(q => q.status === 'ongoing').length;
        const partyMembers = state.players.length;
        const locations = state.locations.length;

        document.getElementById('activeQuestsCount').textContent = activeQuests;
        document.getElementById('partyMembersCount').textContent = partyMembers;
        document.getElementById('locationsCount').textContent = locations;
    });

    // Initial dashboard update
    const state = dataManager.appState;
    const activeQuests = state.quests.filter(q => q.status === 'ongoing').length;
    const partyMembers = state.players.length;
    const locations = state.locations.length;

    document.getElementById('activeQuestsCount').textContent = activeQuests;
    document.getElementById('partyMembersCount').textContent = partyMembers;
    document.getElementById('locationsCount').textContent = locations;
}); 