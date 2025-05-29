// Character status enum
export const PlayerStatus = {
    ACTIVE: 'active',
    INJURED: 'injured',
    CURSED: 'cursed',
    MISSING: 'missing',
    DEAD: 'dead'
};

// Pathfinder classes
export const PlayerClass = {
    BARBARIAN: 'barbarian',
    BARD: 'bard',
    CLERIC: 'cleric',
    DRUID: 'druid',
    FIGHTER: 'fighter',
    MONK: 'monk',
    PALADIN: 'paladin',
    RANGER: 'ranger',
    ROGUE: 'rogue',
    SORCERER: 'sorcerer',
    WIZARD: 'wizard'
};

import { Entity } from './entity.js';

export class Player extends Entity {
    constructor(name, playerClass, level = 1, createdAt = new Date(), updatedAt = new Date()) {
        super(null, new Date(createdAt), new Date(updatedAt));
        this.name = name;
        this.class = playerClass;
        this.level = level;
        this.experience = 0;
        this.inventory = [];
        this.activeQuests = [];
        this.completedQuests = [];
    }

    addToInventory(item) {
        if (!this.inventory.includes(item)) {
            this.inventory.push(item);
            this.updatedAt = new Date();
        }
    }

    removeFromInventory(item) {
        this.inventory = this.inventory.filter(i => i !== item);
        this.updatedAt = new Date();
    }

    addActiveQuest(quest) {
        if (!this.activeQuests.includes(quest)) {
            this.activeQuests.push(quest);
            this.updatedAt = new Date();
        }
    }

    removeActiveQuest(quest) {
        this.activeQuests = this.activeQuests.filter(q => q !== quest);
        this.updatedAt = new Date();
    }

    addCompletedQuest(quest) {
        if (!this.completedQuests.includes(quest)) {
            this.completedQuests.push(quest);
            this.updatedAt = new Date();
        }
    }

    removeCompletedQuest(quest) {
        this.completedQuests = this.completedQuests.filter(q => q !== quest);
        this.updatedAt = new Date();
    }

    addExperience(amount) {
        this.experience += amount;
        // Check for level up (1000 XP per level)
        const newLevel = Math.floor(this.experience / 1000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
        }
        this.updatedAt = new Date();
    }

    updateName(name) {
        this.name = name;
        this.updatedAt = new Date();
    }

    updateClass(playerClass) {
        this.class = playerClass;
        this.updatedAt = new Date();
    }
}

export class PlayerManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.playersSection = document.getElementById('players');
        if (!this.dataManager.appState.players) {
            this.dataManager.appState.players = [];
        }
        this.initializePlayersSection();
        this.setupEventListeners();
    }

    initializePlayersSection() {
        this.playersSection.innerHTML = `
            <h2>Players</h2>
            <div class="row mb-4">
                <div class="col">
                    <button class="btn btn-primary" id="newPlayerBtn">New Player</button>
                </div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <span>Players List</span>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="classFilter" data-bs-toggle="dropdown">
                                        Filter by Class
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><a class="dropdown-item" href="#" data-class="all">All Classes</a></li>
                                        <li><a class="dropdown-item" href="#" data-class="fighter">Fighter</a></li>
                                        <li><a class="dropdown-item" href="#" data-class="wizard">Wizard</a></li>
                                        <li><a class="dropdown-item" href="#" data-class="rogue">Rogue</a></li>
                                        <li><a class="dropdown-item" href="#" data-class="cleric">Cleric</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <input type="text" class="form-control" id="playerSearch" placeholder="Search players...">
                            </div>
                            <div id="playerList" class="list-group"></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            Player Details
                        </div>
                        <div class="card-body" id="playerDetails">
                            <p class="text-muted">Select a player to view details</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('newPlayerBtn').addEventListener('click', () => this.showNewPlayerForm());
        document.getElementById('classFilter').addEventListener('click', (e) => {
            const playerClass = e.target.dataset.class;
            if (playerClass) {
                this.handleClassFilter(playerClass);
            }
        });
        document.getElementById('playerSearch').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
    }

    getFormValue(form, fieldName) {
        if (form instanceof HTMLFormElement) {
            const input = form.elements[fieldName];
            return input ? input.value : null;
        }
        return form[fieldName]?.value || form[fieldName];
    }

    createNewPlayer(form) {
        if (!form || !form.playerName?.value || !form.playerClass?.value || !form.playerLevel?.value) {
            throw new Error('Invalid form data');
        }
        const player = new Player(
            form.playerName.value,
            form.playerClass.value,
            parseInt(form.playerLevel.value)
        );
        this.dataManager.addPlayer(player);
        this.renderPlayerList();
    }

    handleClassFilter(classType) {
        const players = this.dataManager.appState.players;
        const filteredPlayers = classType === 'all' ? players : players.filter(player => player.class === classType);
        this.renderPlayerList(filteredPlayers);
    }

    handleSearch(query) {
        if (!query) {
            this.renderPlayerList();
            return;
        }
        const players = this.dataManager.appState.players;
        const filteredPlayers = players.filter(player => 
            player.name.toLowerCase().includes(query.toLowerCase()) ||
            player.class.toLowerCase().includes(query.toLowerCase())
        );
        this.renderPlayerList(filteredPlayers);
    }

    addToInventory(playerId, item) {
        const player = this.dataManager.appState.players.find(p => p.id === playerId);
        if (!player) return;

        player.addToInventory(item);
        this.dataManager.saveData();
        this.showPlayerDetails(playerId);
    }

    addActiveQuest(playerId, quest) {
        const player = this.dataManager.appState.players.find(p => p.id === playerId);
        if (!player) return;

        player.addActiveQuest(quest);
        this.dataManager.saveData();
        this.showPlayerDetails(playerId);
    }

    addCompletedQuest(playerId, quest) {
        const player = this.dataManager.appState.players.find(p => p.id === playerId);
        if (!player) return;

        player.addCompletedQuest(quest);
        this.dataManager.saveData();
        this.showPlayerDetails(playerId);
    }

    addExperience(playerId, amount) {
        const player = this.dataManager.appState.players.find(p => p.id === playerId);
        if (!player) return;

        player.addExperience(amount);
        this.dataManager.saveData();
        this.showPlayerDetails(playerId);
    }

    updatePlayerName(playerId, form) {
        if (!form || !form.playerName?.value) {
            throw new Error('Invalid form data');
        }
        const player = this.dataManager.getPlayerById(playerId);
        player.name = form.playerName.value;
        this.renderPlayerList();
    }

    updatePlayerClass(playerId, form) {
        if (!form || !form.playerClass?.value) {
            throw new Error('Invalid form data');
        }
        const player = this.dataManager.getPlayerById(playerId);
        player.class = form.playerClass.value;
        this.renderPlayerList();
    }

    updatePlayerLevel(playerId, form) {
        if (!form || !form.playerLevel?.value) {
            throw new Error('Invalid form data');
        }
        const player = this.dataManager.getPlayerById(playerId);
        player.level = parseInt(form.playerLevel.value);
        this.renderPlayerList();
    }

    addPlayerQuest(playerId, form) {
        if (!form || !form.questId?.value) {
            throw new Error('Invalid form data');
        }
        const player = this.dataManager.getPlayerById(playerId);
        player.addQuest(form.questId.value);
        this.renderPlayerList();
    }

    addPlayerItem(playerId, form) {
        if (!form || !form.itemId?.value) {
            throw new Error('Invalid form data');
        }
        const player = this.dataManager.getPlayerById(playerId);
        player.addItem(form.itemId.value);
        this.renderPlayerList();
    }

    renderPlayerList(players = this.dataManager.appState.players) {
        const playerList = document.getElementById('playerList');
        if (!playerList) return;

        playerList.innerHTML = players.map(player => `
            <a href="#" class="list-group-item list-group-item-action" data-player-id="${player.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${player.name}</h5>
                    <small class="text-muted">Level ${player.level} ${player.class}</small>
                </div>
                <div>
                    <span class="badge bg-primary">${player.class}</span>
                    <span class="badge bg-secondary">Level ${player.level}</span>
                    <small class="text-muted ms-2">Last updated: ${player.updatedAt.toLocaleDateString()}</small>
                </div>
            </a>
        `).join('');
    }

    showPlayerDetails(playerId) {
        const player = this.dataManager.appState.players.find(p => p.id === playerId);
        if (!player) return;

        const details = document.getElementById('playerDetails');
        details.innerHTML = `
            <h3>${player.name}</h3>
            <p>Level ${player.level} ${player.class}</p>
            <p>Experience: ${player.experience}</p>
            
            <h4>Inventory</h4>
            <ul>
                ${player.inventory.map(item => `<li>${item}</li>`).join('')}
            </ul>

            <h4>Active Quests</h4>
            <ul>
                ${player.activeQuests.map(quest => `<li>${quest}</li>`).join('')}
            </ul>

            <h4>Completed Quests</h4>
            <ul>
                ${player.completedQuests.map(quest => `<li>${quest}</li>`).join('')}
            </ul>

            <div class="mt-3">
                <button class="btn btn-primary" id="editPlayerBtn">Edit Player</button>
            </div>
        `;

        this.setupPlayerDetailsEventListeners(player);
    }

    setupPlayerDetailsEventListeners(player) {
        document.getElementById('editPlayerBtn').addEventListener('click', () => {
            this.showEditPlayerForm(player.id);
        });
    }

    showNewPlayerForm() {
        const details = document.getElementById('playerDetails');
        details.innerHTML = `
            <h3>New Player</h3>
            <form id="newPlayerForm">
                <div class="mb-3">
                    <label for="playerName" class="form-label">Name</label>
                    <input type="text" class="form-control" id="playerName" name="playerName" required>
                </div>
                <div class="mb-3">
                    <label for="playerClass" class="form-label">Class</label>
                    <select class="form-select" id="playerClass" name="playerClass" required>
                        <option value="">Select a class</option>
                        <option value="fighter">Fighter</option>
                        <option value="wizard">Wizard</option>
                        <option value="rogue">Rogue</option>
                        <option value="cleric">Cleric</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="playerLevel" class="form-label">Level</label>
                    <input type="number" class="form-control" id="playerLevel" name="playerLevel" value="1" min="1">
                </div>
                <button type="submit" class="btn btn-primary">Create Player</button>
            </form>
        `;

        document.getElementById('newPlayerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createNewPlayer(e.target);
        });
    }

    showEditPlayerForm(playerId) {
        const player = this.dataManager.appState.players.find(p => p.id === playerId);
        if (!player) return;

        const details = document.getElementById('playerDetails');
        details.innerHTML = `
            <h3>Edit Player</h3>
            <form id="editPlayerForm">
                <div class="mb-3">
                    <label for="playerName" class="form-label">Name</label>
                    <input type="text" class="form-control" id="playerName" name="playerName" value="${player.name}" required>
                </div>
                <div class="mb-3">
                    <label for="playerClass" class="form-label">Class</label>
                    <select class="form-select" id="playerClass" name="playerClass" required>
                        <option value="fighter" ${player.class === 'fighter' ? 'selected' : ''}>Fighter</option>
                        <option value="wizard" ${player.class === 'wizard' ? 'selected' : ''}>Wizard</option>
                        <option value="rogue" ${player.class === 'rogue' ? 'selected' : ''}>Rogue</option>
                        <option value="cleric" ${player.class === 'cleric' ? 'selected' : ''}>Cleric</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Update Player</button>
            </form>
        `;

        document.getElementById('editPlayerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updatePlayer(playerId, e.target);
        });
    }
} 