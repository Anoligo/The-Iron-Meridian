import { QuestManager } from './modules/quests.js';
import { PlayerManager } from './modules/players.js';
import { LootManager } from './modules/loot.js';
import { LocationManager } from './modules/locations.js';
import { NotesManager } from './modules/notes.js';
import { GuildManager } from './modules/guild.js';
import { DataManager } from './modules/data.js';

// Data structure for the application
const appState = {
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

// Initialize managers with StorageManager
const storageManager = StorageManager;
const questManager = new QuestManager(storageManager);
const playerManager = new PlayerManager(storageManager);
const lootManager = new LootManager(storageManager);
const locationManager = new LocationManager(storageManager);
const notesManager = new NotesManager(storageManager);
const guildManager = new GuildManager(storageManager);

// Local Storage Management
const StorageManager = {
    save: (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    },
    load: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    clear: (key) => {
        localStorage.removeItem(key);
    }
};

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
        }

        // Update URL hash
        window.location.hash = sectionId;
    }
}

// Data Management
class DataManager {
    constructor() {
        this.loadData();
    }

    loadData() {
        // Load data from localStorage
        Object.keys(appState).forEach(key => {
            const data = StorageManager.load(key);
            if (data) {
                appState[key] = data;
            }
        });
    }

    saveData() {
        // Save all data to localStorage
        Object.keys(appState).forEach(key => {
            StorageManager.save(key, appState[key]);
        });
    }

    addQuest(quest) {
        appState.quests.push(quest);
        this.saveData();
    }

    addPlayer(player) {
        appState.players.push(player);
        this.saveData();
    }

    addLoot(item) {
        appState.loot.push(item);
        this.saveData();
    }

    addLocation(location) {
        appState.locations.push(location);
        this.saveData();
    }

    addNote(note) {
        appState.notes.push(note);
        this.saveData();
    }

    addGuildLog(log) {
        if (!this.appState.guildLogs) {
            this.appState.guildLogs = {
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
        const dataStr = JSON.stringify(appState, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'iron-meridian-backup.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    get appState() {
        return appState;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize data manager
    const dataManager = new DataManager();
    
    // Initialize managers
    const questManager = new QuestManager(dataManager);
    const playerManager = new PlayerManager(dataManager);
    const lootManager = new LootManager(dataManager);
    const locationManager = new LocationManager(dataManager);
    const notesManager = new NotesManager(dataManager);
    const guildManager = new GuildManager(dataManager);
    
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