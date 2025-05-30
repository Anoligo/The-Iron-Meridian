import { PlayerClass } from '../enums/player-enums.js';

export class PlayerUI {
    constructor(playerManager) {
        this.playerManager = playerManager;
        this.service = playerManager.service;
    }

    initializePlayersSection() {
        const playersSection = document.getElementById('players');
        if (!playersSection) {
            console.error('playersSection element not found');
            return;
        }
        
        // Generate the dropdown menu items for player classes
        const classDropdownItems = Object.entries(PlayerClass)
            .map(([key, value]) => 
                `<li><a class="dropdown-item" href="#" data-class="${value}">${this.formatClassName(value)}</a></li>`
            )
            .join('');
        
        // Set the inner HTML for the players section
        playersSection.innerHTML = `
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <h2 class="text-accent">Players</h2>
                    </div>
                </div>
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header bg-card">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="text-accent">Players List</span>
                                <div class="btn-group">
                                    <button class="button dropdown-toggle" type="button" 
                                            id="classFilter" data-bs-toggle="dropdown">
                                        Filter by Class
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><a class="dropdown-item" href="#" data-class="all">All Classes</a></li>
                                        ${classDropdownItems}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="card-body bg-card">
                            <div class="mb-3">
                                <input type="text" class="form-control bg-card text" id="playerSearch" placeholder="Search players..." />
                            </div>
                            <div id="playerList" class="list-group"></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header bg-card">
                            <span class="text-accent">Player Details</span>
                        </div>
                        <div class="card-body bg-card" id="playerDetails">
                            <p>Select a player to view details</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <button class="button" id="newPlayerBtn">New Player</button>
                </div>
            </div>
        </div>`;
            
        // Log initialization status
        console.log('Player section initialized');
        const playerList = document.getElementById('playerList');
        if (!playerList) {
            console.error('Failed to create playerList element');
        } else {
            console.log('playerList element created successfully');
        }
    }

    renderPlayerList(players = null) {
        const playerList = document.getElementById('playerList');
        if (!playerList) {
            console.error('Could not find playerList element');
            return;
        }

        const playersToRender = players || this.service.getAllPlayers();
        
        if (!Array.isArray(playersToRender)) {
            console.error('Players data is not an array:', playersToRender);
            playerList.innerHTML = '<div class="alert alert-warning">No players found</div>';
            return;
        }

        if (playersToRender.length === 0) {
            playerList.innerHTML = '<div class="alert alert-info">No players found. Add a new player to get started.</div>';
            return;
        }

        playerList.innerHTML = playersToRender.map(player => `
            <a href="#" class="card mb-2 p-2" data-player-id="${player.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1 text-accent">${player.name || 'Unnamed Player'}</h5>
                    <small>Level ${player.level || 1} ${this.formatClassName(player.class) || ''}</small>
                </div>
                <div>
                    <span class="badge bg-accent">${this.formatClassName(player.class) || 'No Class'}</span>
                    <span class="badge bg-card">Level ${player.level || 1}</span>
                    <small class="ms-2">Last updated: ${player.updatedAt ? new Date(player.updatedAt).toLocaleDateString() : 'Never'}</small>
                </div>
            </a>
        `).join('');
    }

    showPlayerDetails(playerId) {
        const player = this.service.getPlayerById(playerId);
        if (!player) return;
        
        // Get all quests and items from the data manager
        const quests = this.playerManager.dataManager.appState.quests || [];
        const items = this.playerManager.dataManager.appState.loot || [];
        
        // Filter out quests that are already assigned to the player
        const availableQuests = quests.filter(quest => 
            !player.activeQuests.some(q => q.id === quest.id) && 
            !player.completedQuests.some(q => q.id === quest.id)
        );
        
        // Filter out items that are already in the player's inventory
        const playerItemIds = new Set(player.inventory);
        const allItems = items || [];
        const availableItems = allItems.filter(item => item && item.id && !playerItemIds.has(item.id));
        
        // Debug logging
        console.log('All items in system:', allItems);
        console.log('Player inventory IDs:', player.inventory);
        console.log('Available items (not in inventory):', availableItems);
        console.log('Available items count:', availableItems.length);
        console.log('Condition for showing Add Item button:', availableItems.length > 0);

        const details = document.getElementById('playerDetails');
        // Use an IIFE to ensure we have access to the items variable in the template
        details.innerHTML = (({ items, availableItems, player }) => `
            <h3>${player.name}</h3>
            <p>Level ${player.level} ${this.formatClassName(player.class)}</p>
            <p>Experience: ${player.experience}</p>
            
            <div class="card mb-3">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h4 class="mb-0">Inventory</h4>
                    ${availableItems.length > 0 ? `
                        <button class="btn btn-sm btn-success" id="addItemBtn">+ Add Item</button>
                    ` : ''}
                </div>
                <div class="card-body">
                    <div id="inventoryItems">
                        ${player.inventory.length > 0 ? 
                            player.inventory.map(itemId => {
                                const item = items.find(i => i.id === itemId);
                                return item ? `
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <span>${item.name || 'Unnamed Item'}</span>
                                        <button class="btn btn-sm btn-outline-danger remove-item" data-item-id="${item.id}">×</button>
                                    </div>
                                ` : '';
                            }).join('') : 
                            '<p class="text-muted mb-0">No items in inventory</p>'
                        }
                    </div>
                    <div id="addItemForm" class="mt-3" style="display: none;">
                        ${availableItems.length === 0 ? '<p class="text-warning">No items available to add. Create some items in the Loot section first.</p>' : ''}
                        <div class="input-group">
                            <select class="form-select" id="itemSelect">
                                <option value="" selected disabled>Select an item...</option>
                                ${availableItems.map(item => 
                                    `<option value="${item.id}">${item.name || 'Unnamed Item'}</option>`
                                ).join('')}
                            </select>
                            <button class="btn btn-primary" id="saveItemBtn" disabled>Add</button>
                            <button class="btn btn-outline-secondary" id="cancelItemBtn">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mb-3">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h4 class="mb-0">Active Quests</h4>
                    ${availableQuests.length > 0 ? `
                        <button class="btn btn-sm btn-success" id="addActiveQuestBtn">+ Add Quest</button>
                    ` : ''}
                </div>
                <div class="card-body">
                    <div id="activeQuestsList">
                        ${player.activeQuests.length > 0 ? 
                            player.activeQuests.map((quest, index) => `
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span>${quest.name || 'Unnamed Quest'}</span>
                                    <div>
                                        <button class="btn btn-sm btn-outline-success complete-quest me-1" data-quest-id="${quest.id}">✓</button>
                                        <button class="btn btn-sm btn-outline-danger remove-quest" data-quest-id="${quest.id}">×</button>
                                    </div>
                                </div>
                            `).join('') : 
                            '<p class="text-muted mb-0">No active quests</p>'
                        }
                    </div>
                    <div id="addActiveQuestForm" class="mt-3" style="display: none;">
                        <div class="input-group">
                            <select class="form-select" id="questSelect">
                                <option value="" selected disabled>Select a quest...</option>
                                ${availableQuests.map(quest => 
                                    `<option value="${quest.id}">${quest.name || 'Unnamed Quest'}</option>`
                                ).join('')}
                            </select>
                            <button class="btn btn-primary" id="saveActiveQuestBtn" disabled>Add</button>
                            <button class="btn btn-outline-secondary" id="cancelActiveQuestBtn">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mb-3">
                <div class="card-header">
                    <h4 class="mb-0">Completed Quests</h4>
                </div>
                <div class="card-body">
                    <div id="completedQuestsList">
                        ${player.completedQuests.length > 0 ? 
                            player.completedQuests.map((quest, index) => `
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span>${quest.name || 'Unnamed Quest'}</span>
                                    <button class="btn btn-sm btn-outline-danger remove-completed-quest" data-quest-id="${quest.id}">×</button>
                                </div>
                            `).join('') : 
                            '<p class="text-muted mb-0">No completed quests</p>'
                        }
                    </div>
                </div>
            </div>

            <div class="mt-3">
                <button class="btn btn-primary" id="editPlayerBtn">Edit Player</button>
                <button class="btn btn-danger ms-2" id="deletePlayerBtn">Delete Player</button>
            </div>
        `)({ items: allItems, availableItems, player });

        this.setupPlayerDetailsEventListeners(player);
    }

    setupPlayerDetailsEventListeners(player) {
        // Existing buttons
        const editBtn = document.getElementById('editPlayerBtn');
        const deleteBtn = document.getElementById('deletePlayerBtn');
        
        // Add Item button
        const addItemBtn = document.getElementById('addItemBtn');
        const addItemForm = document.getElementById('addItemForm');
        const itemSelect = document.getElementById('itemSelect');
        const saveItemBtn = document.getElementById('saveItemBtn');
        const cancelItemBtn = document.getElementById('cancelItemBtn');
        
        // Make sure player.inventory is an array
        if (!Array.isArray(player.inventory)) {
            player.inventory = [];
        }
        
        // Clean up any non-string items in inventory (legacy data)
        const items = this.playerManager.dataManager.appState.loot || [];
        const validItemIds = new Set(items.map(item => item.id));
        
        player.inventory = player.inventory.filter(itemId => {
            if (typeof itemId !== 'string' || !validItemIds.has(itemId)) {
                console.warn('Removing invalid item from inventory:', itemId);
                return false;
            }
            return true;
        });
        
        // Update the player's inventory in the service if we made changes
        if (player.inventory.length !== player.inventory.length) {
            this.playerManager.service.updatePlayer(player.id, { inventory: player.inventory });
        }
        
        // Get available items (items not in player's inventory)
        const playerItemIds = new Set(player.inventory);
        const availableItems = items.filter(item => !playerItemIds.has(item.id));
        
        console.log('Available items:', availableItems);
        console.log('Player inventory IDs:', player.inventory);
        
        // Active quests elements
        const addActiveQuestBtn = document.getElementById('addActiveQuestBtn');
        const addActiveQuestForm = document.getElementById('addActiveQuestForm');
        const questSelect = document.getElementById('questSelect');
        const saveActiveQuestBtn = document.getElementById('saveActiveQuestBtn');
        const cancelActiveQuestBtn = document.getElementById('cancelActiveQuestBtn');
        
        // Get references to the player service
        const playerService = this.playerManager.service;
        
        // Edit/Delete player
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.playerManager.forms.showEditPlayerForm(player.id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm(`Are you sure you want to delete ${player.name}? This cannot be undone.`)) {
                    this.playerManager.deletePlayer(player.id);
                }
            });
        }
        
        // Inventory management
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                addItemForm.style.display = 'block';
                addItemBtn.style.display = 'none';
                if (itemSelect) itemSelect.focus();
            });
        }
        
        // Enable/disable save button based on selection
        if (itemSelect) {
            itemSelect.addEventListener('change', () => {
                if (saveItemBtn) {
                    saveItemBtn.disabled = !itemSelect.value;
                }
            });
        }
        
        if (saveItemBtn) {
            saveItemBtn.addEventListener('click', () => {
                if (!itemSelect || !itemSelect.value) return;
                
                // Find the selected item in the loot array
                const selectedItem = this.playerManager.dataManager.appState.loot.find(item => item.id === itemSelect.value);
                if (selectedItem) {
                    // Add the item to the player's inventory using the service
                    if (playerService.addItemToPlayer(player.id, selectedItem)) {
                        // Refresh the player details view
                        this.showPlayerDetails(player.id);
                    }
                }
            });
        }
        
        if (cancelItemBtn) {
            cancelItemBtn.addEventListener('click', () => {
                addItemForm.style.display = 'none';
                addItemBtn.style.display = 'block';
                if (itemSelect) itemSelect.value = '';
                if (saveItemBtn) saveItemBtn.disabled = true;
            });
        }
        
        // Remove inventory item
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.getAttribute('data-item-id');
                if (confirm('Are you sure you want to remove this item from the inventory?')) {
                    // Use the service method to remove the item
                    if (playerService.removeItemFromPlayer(player.id, itemId)) {
                        // Refresh the player details view
                        this.showPlayerDetails(player.id);
                    }
                }
            });
        });
        
        // Active quests management
        if (addActiveQuestBtn) {
            addActiveQuestBtn.addEventListener('click', () => {
                addActiveQuestForm.style.display = 'block';
                addActiveQuestBtn.style.display = 'none';
                if (questSelect) questSelect.focus();
            });
        }
        
        // Enable/disable save button based on selection
        if (questSelect) {
            questSelect.addEventListener('change', () => {
                if (saveActiveQuestBtn) {
                    saveActiveQuestBtn.disabled = !questSelect.value;
                }
            });
        }
        
        if (saveActiveQuestBtn) {
            saveActiveQuestBtn.addEventListener('click', () => {
                if (!questSelect || !questSelect.value) return;
                
                // Find the selected quest in the quests array
                const selectedQuest = this.playerManager.dataManager.appState.quests.find(quest => quest.id === questSelect.value);
                if (selectedQuest) {
                    // Add the quest to the player's active quests
                    const updatedActiveQuests = [...player.activeQuests, selectedQuest];
                    if (playerService.updatePlayer(player.id, { activeQuests: updatedActiveQuests })) {
                        // Refresh the player details view
                        this.showPlayerDetails(player.id);
                    }
                }
            });
        }
        
        if (cancelActiveQuestBtn) {
            cancelActiveQuestBtn.addEventListener('click', () => {
                addActiveQuestForm.style.display = 'none';
                addActiveQuestBtn.style.display = 'block';
                if (questSelect) questSelect.value = '';
                if (saveActiveQuestBtn) saveActiveQuestBtn.disabled = true;
            });
        }
        
        // Complete quest
        document.querySelectorAll('.complete-quest').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const questId = e.target.getAttribute('data-quest-id');
                // Find the quest in the active quests
                const questIndex = player.activeQuests.findIndex(q => q.id === questId);
                if (questIndex !== -1) {
                    // Move the quest from active to completed
                    const updatedActiveQuests = player.activeQuests.filter(q => q.id !== questId);
                    const completedQuest = player.activeQuests.find(q => q.id === questId);
                    const updatedCompletedQuests = [...player.completedQuests, completedQuest];
                    
                    if (playerService.updatePlayer(player.id, {
                        activeQuests: updatedActiveQuests,
                        completedQuests: updatedCompletedQuests
                    })) {
                        // Refresh the player details view
                        this.showPlayerDetails(player.id);
                    }
                }
            });
        });
        
        // Remove active quest
        document.querySelectorAll('.remove-quest').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const questId = e.target.getAttribute('data-quest-id');
                if (confirm('Are you sure you want to remove this quest?')) {
                    // Remove the quest from active quests
                    const updatedActiveQuests = player.activeQuests.filter(q => q.id !== questId);
                    if (playerService.updatePlayer(player.id, { activeQuests: updatedActiveQuests })) {
                        // Refresh the player details view
                        this.showPlayerDetails(player.id);
                    }
                }
            });
        });
        
        // Remove completed quest
        document.querySelectorAll('.remove-completed-quest').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const questId = e.target.getAttribute('data-quest-id');
                if (confirm('Are you sure you want to remove this completed quest?')) {
                    // Remove the quest from completed quests
                    const updatedCompletedQuests = player.completedQuests.filter(q => q.id !== questId);
                    if (playerService.updatePlayer(player.id, { completedQuests: updatedCompletedQuests })) {
                        // Refresh the player details view
                        this.showPlayerDetails(player.id);
                    }
                }
            });
        });
    }

    formatClassName(className) {
        if (!className) return '';
        return className
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
}
