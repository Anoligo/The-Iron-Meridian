import { PlayerService } from './services/player-service.js';
import { PlayerUI } from './ui/player-ui.js';
import { PlayerForms } from './ui/player-forms.js';

export class PlayersManager {
    constructor(dataManager, isTest = false) {
        this.dataManager = dataManager;
        this.service = new PlayerService(dataManager);
        this.ui = new PlayerUI(this);
        this.forms = new PlayerForms(this);
        
        if (!isTest) {
            this.initialize();
        }
    }

    initialize() {
        this.ui.initializePlayersSection();
        this.setupEventListeners();
        this.ui.renderPlayerList();
    }

    setupEventListeners() {
        // Event delegation for player list items
        document.addEventListener('click', (e) => {
            // Handle player list item clicks
            const playerItem = e.target.closest('[data-player-id]');
            if (playerItem) {
                e.preventDefault();
                const playerId = playerItem.getAttribute('data-player-id');
                this.ui.showPlayerDetails(playerId);
            }
            
            // Handle class filter clicks
            const classFilterItem = e.target.closest('[data-class]');
            if (classFilterItem) {
                e.preventDefault();
                const className = classFilterItem.getAttribute('data-class');
                this.filterPlayersByClass(className);
            }
            
            // Handle new player button
            if (e.target.matches('#newPlayerBtn')) {
                e.preventDefault();
                this.forms.showNewPlayerForm();
            }
        });
        
        // Search functionality
        const searchInput = document.getElementById('playerSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                this.searchPlayers(searchTerm);
            });
        }
    }

    // Player CRUD Operations
    createNewPlayer(form) {
        try {
            if (!form || !form.playerName?.value || !form.playerClass?.value) {
                throw new Error('Missing required fields');
            }
            
            const player = this.service.createPlayer(
                form.playerName.value,
                form.playerClass.value,
                parseInt(form.playerLevel?.value) || 1
            );
            
            this.ui.renderPlayerList();
            this.ui.showPlayerDetails(player.id);
            
            // Reset the form
            form.reset();
            
        } catch (error) {
            console.error('Error creating new player:', error);
            alert(`Failed to create player: ${error.message}`);
        }
    }

    updatePlayer(playerId, form) {
        try {
            if (!form || !form.playerName?.value || !form.playerClass?.value) {
                throw new Error('Missing required fields');
            }
            
            const updates = {
                name: form.playerName.value,
                class: form.playerClass.value,
                level: parseInt(form.playerLevel?.value) || 1
            };
            
            this.service.updatePlayer(playerId, updates);
            this.ui.renderPlayerList();
            this.ui.showPlayerDetails(playerId);
            
        } catch (error) {
            console.error('Error updating player:', error);
            alert(`Failed to update player: ${error.message}`);
        }
    }

    deletePlayer(playerId) {
        try {
            const success = this.service.deletePlayer(playerId);
            if (success) {
                this.ui.renderPlayerList();
                // Clear player details
                const details = document.getElementById('playerDetails');
                if (details) {
                    details.innerHTML = '<p class="text-muted">Select a player to view details</p>';
                }
            }
        } catch (error) {
            console.error('Error deleting player:', error);
            alert(`Failed to delete player: ${error.message}`);
        }
    }

    // Helper Methods
    filterPlayersByClass(className) {
        if (className === 'all') {
            this.ui.renderPlayerList();
            return;
        }
        
        const filteredPlayers = this.service.getAllPlayers().filter(
            player => player.class === className
        );
        this.ui.renderPlayerList(filteredPlayers);
    }

    searchPlayers(term) {
        if (!term) {
            this.ui.renderPlayerList();
            return;
        }
        
        const filteredPlayers = this.service.getAllPlayers().filter(
            player => player.name.toLowerCase().includes(term.toLowerCase())
        );
        this.ui.renderPlayerList(filteredPlayers);
    }
}
