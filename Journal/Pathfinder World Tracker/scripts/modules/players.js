// Character status enum
export const CharacterStatus = {
    ACTIVE: 'active',
    INJURED: 'injured',
    CURSED: 'cursed',
    MISSING: 'missing',
    DEAD: 'dead'
};

// Pathfinder classes
export const CharacterClass = {
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

export class Character {
    constructor(name, race, characterClass, level = 1, createdAt, updatedAt) {
        this.id = Date.now();
        this.name = name;
        this.race = race;
        this.characterClass = characterClass;
        this.level = level;
        this.status = CharacterStatus.ACTIVE;
        this.quests = [];
        this.conditions = [];
        this.equipment = [];
        this.notes = [];
        this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt || Date.now());
        this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt || Date.now());
    }

    addCondition(condition) {
        if (!this.conditions.includes(condition)) {
            this.conditions.push(condition);
            this.updatedAt = new Date();
        }
    }

    removeCondition(condition) {
        this.conditions = this.conditions.filter(c => c !== condition);
        this.updatedAt = new Date();
    }

    addEquipment(item) {
        if (!this.equipment.includes(item)) {
            this.equipment.push(item);
            this.updatedAt = new Date();
        }
    }

    removeEquipment(item) {
        this.equipment = this.equipment.filter(i => i !== item);
        this.updatedAt = new Date();
    }

    addNote(content) {
        this.notes.push({
            content,
            timestamp: new Date()
        });
        this.updatedAt = new Date();
    }

    updateStatus(status) {
        if (!Object.values(CharacterStatus).includes(status)) {
            return;
        }
        this.status = status;
        this.updatedAt = new Date();
    }

    levelUp() {
        this.level++;
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
                    <button class="btn btn-primary" id="newCharacterBtn">New Character</button>
                </div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <span>Characters List</span>
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
                                <input type="text" class="form-control" id="characterSearch" placeholder="Search characters...">
                            </div>
                            <div id="characterList" class="list-group"></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            Character Details
                        </div>
                        <div class="card-body" id="characterDetails">
                            <p class="text-muted">Select a character to view details</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('newCharacterBtn').addEventListener('click', () => this.showNewCharacterForm());
        document.getElementById('classFilter').addEventListener('click', (e) => {
            const characterClass = e.target.dataset.class;
            if (characterClass) {
                this.handleClassFilter(characterClass);
            }
        });
        document.getElementById('characterSearch').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
    }

    getFormValue(form, fieldName) {
        const field = form[fieldName];
        if (field) {
            return field.value;
        }
        return null;
    }

    createNewCharacter(form) {
        const name = this.getFormValue(form, 'characterName');
        const race = this.getFormValue(form, 'characterRace');
        const classType = this.getFormValue(form, 'characterClass');
        const level = parseInt(this.getFormValue(form, 'characterLevel')) || 1;

        if (name && race && classType) {
            const character = new Character(name, race, classType, level);
            this.dataManager.appState.players.push(character);
            this.dataManager.saveData();
            this.renderCharacterList();
        }
    }

    handleClassFilter(classType) {
        const characters = classType === 'all'
            ? this.dataManager.appState.players
            : this.dataManager.appState.players.filter(c => c.classType === classType);
        this.renderCharacterList(characters);
    }

    handleSearch(searchTerm) {
        const players = this.dataManager.appState.players;
        const filteredPlayers = searchTerm
            ? players.filter(player => 
                player.name.toLowerCase().includes(searchTerm.toLowerCase()))
            : players;
        this.renderCharacterList(filteredPlayers);
    }

    addCondition(characterId, condition) {
        const character = this.dataManager.appState.players.find(p => p.id === characterId);
        if (!character) return;

        if (!character.conditions.includes(condition)) {
            character.conditions.push(condition);
            character.updatedAt = new Date();
            this.dataManager.saveData();
            this.showCharacterDetails(characterId);
        }
    }

    addEquipment(characterId, equipment) {
        const character = this.dataManager.appState.players.find(p => p.id === characterId);
        if (!character) return;

        if (!character.equipment.includes(equipment)) {
            character.equipment.push(equipment);
            character.updatedAt = new Date();
            this.dataManager.saveData();
            this.showCharacterDetails(characterId);
        }
    }

    addNote(characterId, form) {
        const character = this.dataManager.appState.players.find(c => c.id === characterId);
        if (character) {
            const content = this.getFormValue(form, 'content');
            if (content) {
                character.addNote(content);
                this.dataManager.saveData();
                this.showCharacterDetails(characterId);
            }
        }
    }

    updateCharacterStatus(characterId, status) {
        const character = this.dataManager.appState.players.find(c => c.id === characterId);
        if (!character) return;

        character.status = status;
        character.updatedAt = new Date();
        this.renderCharacterList();
    }

    renderCharacterList(players = this.dataManager.appState.players) {
        const characterList = document.getElementById('characterList');
        characterList.innerHTML = players.map(character => `
            <a href="#" class="list-group-item list-group-item-action" data-character-id="${character.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${character.name}</h5>
                    <small class="text-muted">${character.characterClass}</small>
                </div>
                <p class="mb-1">Level ${character.level}</p>
                <div>
                    ${character.conditions.map(condition => 
                        `<span class="badge bg-danger me-1">${condition}</span>`
                    ).join('')}
                </div>
            </a>
        `).join('');

        characterList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const characterId = e.currentTarget.dataset.characterId;
                this.showCharacterDetails(characterId);
            });
        });
    }

    showCharacterDetails(characterId) {
        const character = this.dataManager.appState.players.find(p => p.id === characterId);
        if (!character) return;

        const characterDetails = document.getElementById('characterDetails');
        characterDetails.innerHTML = `
            <h3>${character.name}</h3>
            <p class="text-muted">Level ${character.level} ${character.characterClass}</p>
            <div class="mb-3">
                <h5>Conditions</h5>
                <div>
                    ${character.conditions.map(condition => `
                        <span class="badge bg-danger me-1">
                            ${condition}
                            <button class="btn-close btn-close-white" data-condition="${condition}"></button>
                        </span>
                    `).join('')}
                    <button class="btn btn-sm btn-outline-danger" id="addConditionBtn">Add Condition</button>
                </div>
            </div>
            <div class="mb-3">
                <h5>Equipment</h5>
                <div>
                    ${character.equipment.map(item => `
                        <span class="badge bg-secondary me-1">
                            ${item}
                            <button class="btn-close btn-close-white" data-equipment="${item}"></button>
                        </span>
                    `).join('')}
                    <button class="btn btn-sm btn-outline-secondary" id="addEquipmentBtn">Add Equipment</button>
                </div>
            </div>
            <div class="mb-3">
                <h5>Notes</h5>
                <div id="characterNotes">
                    ${character.notes.map(note => `
                        <div class="card mb-2">
                            <div class="card-body">
                                <p class="card-text">${note.content}</p>
                                <small class="text-muted">${new Date(note.timestamp).toLocaleString()}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-sm btn-outline-primary" id="addNoteBtn">Add Note</button>
            </div>
            <div class="mt-3">
                <button class="btn btn-primary" id="editCharacterBtn">Edit Character</button>
            </div>
        `;

        this.setupCharacterDetailsEventListeners(character);
    }

    setupCharacterDetailsEventListeners(character) {
        document.getElementById('addConditionBtn').addEventListener('click', () => {
            const condition = prompt('Enter condition:');
            if (condition) {
                this.addCondition(character.id, condition);
            }
        });

        document.getElementById('addEquipmentBtn').addEventListener('click', () => {
            const equipment = prompt('Enter equipment:');
            if (equipment) {
                this.addEquipment(character.id, equipment);
            }
        });

        document.getElementById('addNoteBtn').addEventListener('click', () => {
            const content = prompt('Enter note:');
            if (content) {
                this.addNote(character.id, { content });
            }
        });

        document.getElementById('editCharacterBtn').addEventListener('click', () => {
            this.showEditCharacterForm(character.id);
        });

        document.querySelectorAll('[data-condition]').forEach(btn => {
            btn.addEventListener('click', () => {
                const condition = btn.dataset.condition;
                character.conditions = character.conditions.filter(c => c !== condition);
                character.updatedAt = new Date();
                this.dataManager.saveData();
                this.showCharacterDetails(character.id);
            });
        });

        document.querySelectorAll('[data-equipment]').forEach(btn => {
            btn.addEventListener('click', () => {
                const equipment = btn.dataset.equipment;
                character.equipment = character.equipment.filter(e => e !== equipment);
                character.updatedAt = new Date();
                this.dataManager.saveData();
                this.showCharacterDetails(character.id);
            });
        });
    }

    showNewCharacterForm() {
        const characterDetails = document.getElementById('characterDetails');
        characterDetails.innerHTML = `
            <form id="newCharacterForm">
                <div class="mb-3">
                    <label for="name" class="form-label">Name</label>
                    <input type="text" class="form-control" id="name" name="name" required>
                </div>
                <div class="mb-3">
                    <label for="class" class="form-label">Class</label>
                    <select class="form-select" id="class" name="class" required>
                        <option value="fighter">Fighter</option>
                        <option value="wizard">Wizard</option>
                        <option value="rogue">Rogue</option>
                        <option value="cleric">Cleric</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="level" class="form-label">Level</label>
                    <input type="number" class="form-control" id="level" name="level" value="1" min="1" max="20" required>
                </div>
                <button type="submit" class="btn btn-primary">Create Character</button>
            </form>
        `;

        document.getElementById('newCharacterForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const character = this.createNewCharacter(e.target);
            if (character) {
                this.showCharacterDetails(character.id);
            }
        });
    }

    showEditCharacterForm(characterId) {
        const character = this.dataManager.appState.players.find(p => p.id === characterId);
        if (!character) return;

        const characterDetails = document.getElementById('characterDetails');
        characterDetails.innerHTML = `
            <form id="editCharacterForm">
                <div class="mb-3">
                    <label for="name" class="form-label">Name</label>
                    <input type="text" class="form-control" id="name" name="name" value="${character.name}" required>
                </div>
                <div class="mb-3">
                    <label for="class" class="form-label">Class</label>
                    <select class="form-select" id="class" name="class" required>
                        <option value="fighter" ${character.characterClass === 'fighter' ? 'selected' : ''}>Fighter</option>
                        <option value="wizard" ${character.characterClass === 'wizard' ? 'selected' : ''}>Wizard</option>
                        <option value="rogue" ${character.characterClass === 'rogue' ? 'selected' : ''}>Rogue</option>
                        <option value="cleric" ${character.characterClass === 'cleric' ? 'selected' : ''}>Cleric</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="level" class="form-label">Level</label>
                    <input type="number" class="form-control" id="level" name="level" value="${character.level}" min="1" max="20" required>
                </div>
                <button type="submit" class="btn btn-primary">Update Character</button>
            </form>
        `;

        document.getElementById('editCharacterForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateCharacter(characterId, e.target);
            this.showCharacterDetails(characterId);
        });
    }

    updateCharacter(characterId, form) {
        const character = this.dataManager.appState.players.find(p => p.id === characterId);
        if (!character) return;

        const name = this.getFormValue(form, 'name');
        const characterClass = this.getFormValue(form, 'class');
        const level = parseInt(this.getFormValue(form, 'level')) || 1;

        if (!name || !characterClass) {
            console.error('Missing required fields');
            return;
        }

        character.name = name;
        character.characterClass = characterClass;
        character.level = level;
        character.updatedAt = new Date();

        this.dataManager.saveData();
        this.renderCharacterList();
    }
} 