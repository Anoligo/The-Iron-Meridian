// Quest status enum
export const QuestStatus = {
    AVAILABLE: 'available',
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
    FAILED: 'failed'
};

export class Quest {
    constructor(title, description, type, createdAt, updatedAt) {
        this.id = Date.now();
        this.title = title;
        this.description = description;
        this.type = type;
        this.status = QuestStatus.ONGOING;
        this.journalEntries = [];
        this.relatedLocations = [];
        this.relatedCharacters = [];
        this.relatedItems = [];
        this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt || Date.now());
        this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt || Date.now());
    }

    addJournalEntry(content) {
        if (!content) return false;
        
        const entry = {
            id: Date.now().toString(),
            content,
            timestamp: new Date()
        };
        
        this.journalEntries.push(entry);
        this.updatedAt = new Date();
        return true;
    }

    removeJournalEntry(entryId) {
        this.journalEntries = this.journalEntries.filter(entry => entry.id !== entryId);
        this.updatedAt = new Date();
    }

    addRelatedLocation(locationId) {
        if (!this.relatedLocations.includes(locationId)) {
            this.relatedLocations.push(locationId);
            this.updatedAt = new Date();
        }
    }

    removeRelatedLocation(locationId) {
        this.relatedLocations = this.relatedLocations.filter(id => id !== locationId);
        this.updatedAt = new Date();
    }

    addRelatedCharacter(characterId) {
        if (!this.relatedCharacters.includes(characterId)) {
            this.relatedCharacters.push(characterId);
            this.updatedAt = new Date();
        }
    }

    removeRelatedCharacter(characterId) {
        this.relatedCharacters = this.relatedCharacters.filter(id => id !== characterId);
        this.updatedAt = new Date();
    }

    addRelatedItem(itemId) {
        if (!this.relatedItems.includes(itemId)) {
            this.relatedItems.push(itemId);
            this.updatedAt = new Date();
        }
    }

    removeRelatedItem(itemId) {
        this.relatedItems = this.relatedItems.filter(id => id !== itemId);
        this.updatedAt = new Date();
    }

    updateTitle(newTitle) {
        this.title = newTitle;
        this.updatedAt = new Date();
    }

    updateDescription(newDescription) {
        this.description = newDescription;
        this.updatedAt = new Date();
    }

    updateType(newType) {
        this.type = newType;
        this.updatedAt = new Date();
    }

    updateStatus(status) {
        if (!Object.values(QuestStatus).includes(status)) {
            return;
        }
        this.status = status;
        this.updatedAt = new Date();
    }
}

export class QuestManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.questsSection = document.getElementById('quests');
        if (!this.dataManager.appState.quests) {
            this.dataManager.appState.quests = [];
        }
        this.initializeQuestsSection();
        this.setupEventListeners();
    }

    initializeQuestsSection() {
        const questSection = document.getElementById('quests');
        if (!questSection) return;

        questSection.innerHTML = `
            <h2>Quests</h2>
            <div class="row mb-4">
                <div class="col">
                    <button class="btn btn-primary" id="newQuestBtn">New Quest</button>
                </div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <span>Quests List</span>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="questTypeFilter" data-bs-toggle="dropdown">
                                        Filter by Type
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><a class="dropdown-item" href="#" data-type="all">All Types</a></li>
                                        <li><a class="dropdown-item" href="#" data-type="main">Main Quest</a></li>
                                        <li><a class="dropdown-item" href="#" data-type="side">Side Quest</a></li>
                                        <li><a class="dropdown-item" href="#" data-type="guild">Guild Quest</a></li>
                                        <li><a class="dropdown-item" href="#" data-type="other">Other</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <input type="text" class="form-control" id="questSearch" placeholder="Search quests...">
                            </div>
                            <div id="questList" class="list-group"></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            Quest Details
                        </div>
                        <div class="card-body" id="questDetails">
                            <!-- Quest details will be shown here -->
                            <p class="text-muted">Select a quest to view details</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.renderQuestList();
    }

    setupEventListeners() {
        const newQuestBtn = document.getElementById('newQuestBtn');
        if (newQuestBtn) {
            newQuestBtn.addEventListener('click', () => this.showNewQuestForm());
        }

        const questSearch = document.getElementById('questSearch');
        if (questSearch) {
            questSearch.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Setup quest type filter
        document.querySelectorAll('.dropdown-item[data-type]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const type = e.target.dataset.type;
                this.handleQuestTypeFilter(type);
            });
        });
    }

    showNewQuestForm() {
        const questDetails = document.getElementById('questDetails');
        questDetails.innerHTML = `
            <form id="newQuestForm">
                <div class="form-group">
                    <label for="questTitle">Title</label>
                    <input type="text" class="form-control" id="questTitle" required>
                </div>
                <div class="form-group">
                    <label for="questType">Type</label>
                    <select class="form-control" id="questType" required>
                        <option value="main">Main Quest</option>
                        <option value="side">Side Quest</option>
                        <option value="guild">Guild Quest</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="questDescription">Description</label>
                    <textarea class="form-control" id="questDescription" rows="3" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Create Quest</button>
            </form>
        `;

        const form = document.getElementById('newQuestForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createNewQuest(form);
        });
    }

    getFormValue(form, name) {
        if (form instanceof HTMLFormElement) {
            const element = form.querySelector(`[name="${name}"]`);
            return element ? element.value : null;
        }
        return form[name] || null;
    }

    createNewQuest(form) {
        const quest = new Quest(
            form.questTitle.value,
            form.questDescription.value,
            form.questType.value,
            new Date(),
            new Date()
        );
        this.dataManager.appState.quests.push(quest);
        this.dataManager.saveData();
        this.renderQuestList();
    }

    renderQuestList(type = 'all', searchTerm = '') {
        const questList = document.getElementById('questList');
        if (!questList) return;

        let quests = this.dataManager.appState.quests || [];

        // Apply type filter
        if (type !== 'all') {
            quests = quests.filter(quest => quest.type === type);
        }

        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            quests = quests.filter(quest => 
                quest.title.toLowerCase().includes(searchLower) ||
                quest.description.toLowerCase().includes(searchLower)
            );
        }

        questList.innerHTML = quests
            .map(quest => `
                <a href="#" class="list-group-item list-group-item-action" data-quest-id="${quest.id}">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${quest.title}</h5>
                        <small class="text-muted">${quest.type}</small>
                    </div>
                    <p class="mb-1">${quest.description}</p>
                    <div>
                        <span class="badge bg-${quest.status === 'completed' ? 'success' : 'warning'}">${quest.status}</span>
                    </div>
                </a>
            `)
            .join('');

        questList.querySelectorAll('.list-group-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const questId = item.dataset.questId;
                const quest = this.dataManager.appState.quests.find(q => q.id === questId);
                if (quest) {
                    this.showQuestDetails(quest);
                }
            });
        });
    }

    showQuestDetails(quest) {
        const questDetails = document.getElementById('questDetails');
        questDetails.innerHTML = `
            <h3>${quest.title}</h3>
            <p class="text-muted">${quest.type}</p>
            <div class="mb-3">
                <h5>Description</h5>
                <p>${quest.description}</p>
            </div>
            <div class="mb-3">
                <h5>Status</h5>
                <p>${quest.status}</p>
            </div>
            <div class="mb-3">
                <h5>Journal Entries</h5>
                <div id="questJournalEntries">
                    ${quest.journalEntries.map(entry => `
                        <div class="card mb-2">
                            <div class="card-body">
                                <p class="card-text">${entry.content}</p>
                                <small class="text-muted">${new Date(entry.timestamp).toLocaleString()}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-sm btn-outline-primary" id="addJournalEntryBtn">Add Journal Entry</button>
            </div>
            <div class="mb-3">
                <h5>Related Locations</h5>
                <div>
                    ${quest.relatedLocations.map(locationId => `
                        <span class="badge bg-primary me-1">
                            ${locationId}
                            <button class="btn-close btn-close-white" data-location="${locationId}"></button>
                        </span>
                    `).join('')}
                    <button class="btn btn-sm btn-outline-primary" id="addLocationBtn">Add Location</button>
                </div>
            </div>
            <div class="mb-3">
                <h5>Related Characters</h5>
                <div>
                    ${quest.relatedCharacters.map(characterId => `
                        <span class="badge bg-info me-1">
                            ${characterId}
                            <button class="btn-close btn-close-white" data-character="${characterId}"></button>
                        </span>
                    `).join('')}
                    <button class="btn btn-sm btn-outline-info" id="addCharacterBtn">Add Character</button>
                </div>
            </div>
            <div class="mb-3">
                <h5>Related Items</h5>
                <div>
                    ${quest.relatedItems.map(itemId => `
                        <span class="badge bg-warning me-1">
                            ${itemId}
                            <button class="btn-close btn-close-white" data-item="${itemId}"></button>
                        </span>
                    `).join('')}
                    <button class="btn btn-sm btn-outline-warning" id="addItemBtn">Add Item</button>
                </div>
            </div>
            <div class="mt-3">
                <button class="btn btn-primary" id="editQuestBtn">Edit Quest</button>
            </div>
        `;

        this.setupQuestDetailsEventListeners(quest);
    }

    setupQuestDetailsEventListeners(quest) {
        const addJournalEntryBtn = document.getElementById('addJournalEntryBtn');
        if (addJournalEntryBtn) {
            addJournalEntryBtn.addEventListener('click', () => this.showAddJournalEntryForm(quest.id));
        }

        const addLocationBtn = document.getElementById('addLocationBtn');
        if (addLocationBtn) {
            addLocationBtn.addEventListener('click', () => this.showAddRelatedLocationForm(quest.id));
        }

        const addCharacterBtn = document.getElementById('addCharacterBtn');
        if (addCharacterBtn) {
            addCharacterBtn.addEventListener('click', () => this.showAddRelatedCharacterForm(quest.id));
        }

        const addItemBtn = document.getElementById('addItemBtn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => this.showAddRelatedItemForm(quest.id));
        }

        const editQuestBtn = document.getElementById('editQuestBtn');
        if (editQuestBtn) {
            editQuestBtn.addEventListener('click', () => this.showEditQuestForm(quest.id));
        }

        document.querySelectorAll('.btn-close').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = button.dataset.action;
                const id = button.dataset.id;
                const value = button.dataset.value;
                this.handleAction(action, id, value);
            });
        });
    }

    handleQuestSearch(searchTerm) {
        this.renderQuestList(this.currentQuestType, searchTerm);
    }

    handleQuestTypeFilter(type) {
        this.currentQuestType = type;
        this.renderQuestList(type, document.getElementById('questSearch')?.value || '');
    }

    // Methods exposed to window for button clicks
    showEditQuestForm(questId) {
        const quest = this.dataManager.appState.quests.find(q => q.id === questId);
        if (!quest) return;

        const questDetails = document.getElementById('questDetails');
        questDetails.innerHTML = `
            <form id="editQuestForm">
                <div class="form-group">
                    <label for="questTitle">Title</label>
                    <input type="text" class="form-control" id="questTitle" value="${quest.title}" required>
                </div>
                <div class="form-group">
                    <label for="questType">Type</label>
                    <select class="form-control" id="questType" required>
                        <option value="main" ${quest.type === 'main' ? 'selected' : ''}>Main Quest</option>
                        <option value="side" ${quest.type === 'side' ? 'selected' : ''}>Side Quest</option>
                        <option value="guild" ${quest.type === 'guild' ? 'selected' : ''}>Guild Quest</option>
                        <option value="other" ${quest.type === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="questDescription">Description</label>
                    <textarea class="form-control" id="questDescription" rows="3" required>${quest.description}</textarea>
                </div>
                <div class="form-group">
                    <label for="questStatus">Status</label>
                    <select class="form-control" id="questStatus" required>
                        <option value="pending" ${quest.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="in_progress" ${quest.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${quest.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="failed" ${quest.status === 'failed' ? 'selected' : ''}>Failed</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Update Quest</button>
            </form>
        `;

        const form = document.getElementById('editQuestForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateQuest(quest, form);
        });
    }

    updateQuest(quest, form) {
        quest.updateTitle(form.questTitle.value);
        quest.updateType(form.questType.value);
        quest.updateDescription(form.questDescription.value);
        quest.updateStatus(form.questStatus.value);

        this.dataManager.saveData();
        this.showQuestDetails(quest);
    }

    showAddJournalEntryForm(questId) {
        const quest = this.dataManager.appState.quests.find(q => q.id === questId);
        if (!quest) return;

        const entry = prompt('Enter journal entry:');
        if (entry) {
            quest.addJournalEntry(entry);
            this.dataManager.saveData();
            this.showQuestDetails(quest);
        }
    }

    showAddRelatedLocationForm(questId) {
        const quest = this.dataManager.appState.quests.find(q => q.id === questId);
        if (!quest) return;

        const locations = this.dataManager.appState.locations || [];
        const availableLocations = locations.filter(location => !quest.relatedLocations.includes(location.id));

        if (availableLocations.length === 0) {
            alert('No available locations to add.');
            return;
        }

        const locationSelect = document.createElement('select');
        locationSelect.className = 'form-control';
        locationSelect.innerHTML = `
            <option value="">Select a location...</option>
            ${availableLocations.map(location => `<option value="${location.id}">${location.name}</option>`).join('')}
        `;

        const locationId = prompt('Select a location to add:', locationSelect.outerHTML);
        if (locationId) {
            quest.addRelatedLocation(locationId);
            this.dataManager.saveData();
            this.showQuestDetails(quest);
        }
    }

    showAddRelatedCharacterForm(questId) {
        const quest = this.dataManager.appState.quests.find(q => q.id === questId);
        if (!quest) return;

        const characters = this.dataManager.appState.players || [];
        const availableCharacters = characters.filter(character => !quest.relatedCharacters.includes(character.id));

        if (availableCharacters.length === 0) {
            alert('No available characters to add.');
            return;
        }

        const characterSelect = document.createElement('select');
        characterSelect.className = 'form-control';
        characterSelect.innerHTML = `
            <option value="">Select a character...</option>
            ${availableCharacters.map(character => `<option value="${character.id}">${character.name}</option>`).join('')}
        `;

        const characterId = prompt('Select a character to add:', characterSelect.outerHTML);
        if (characterId) {
            quest.addRelatedCharacter(characterId);
            this.dataManager.saveData();
            this.showQuestDetails(quest);
        }
    }

    showAddRelatedItemForm(questId) {
        const quest = this.dataManager.appState.quests.find(q => q.id === questId);
        if (!quest) return;

        const items = this.dataManager.appState.loot || [];
        const availableItems = items.filter(item => !quest.relatedItems.includes(item.id));

        if (availableItems.length === 0) {
            alert('No available items to add.');
            return;
        }

        const itemSelect = document.createElement('select');
        itemSelect.className = 'form-control';
        itemSelect.innerHTML = `
            <option value="">Select an item...</option>
            ${availableItems.map(item => `<option value="${item.id}">${item.name}</option>`).join('')}
        `;

        const itemId = prompt('Select an item to add:', itemSelect.outerHTML);
        if (itemId) {
            quest.addRelatedItem(itemId);
            this.dataManager.saveData();
            this.showQuestDetails(quest);
        }
    }

    handleStatusFilter(status) {
        const quests = status === 'all' 
            ? this.dataManager.appState.quests 
            : this.dataManager.appState.quests.filter(quest => quest.status === status);
        
        this.renderQuestList(quests);
    }

    handleSearch(searchTerm) {
        const quests = this.dataManager.appState.quests;
        const filteredQuests = searchTerm
            ? quests.filter(quest => 
                quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quest.description.toLowerCase().includes(searchTerm.toLowerCase()))
            : quests;
        this.renderQuestList(filteredQuests);
    }

    addJournalEntry(questId, form) {
        const quest = this.dataManager.appState.quests.find(q => q.id === questId);
        if (quest) {
            const content = this.getFormValue(form, 'content');
            if (content) {
                quest.addJournalEntry(content);
                this.dataManager.saveData();
                this.showQuestDetails(questId);
            }
        }
    }

    updateQuestStatus(questId, status) {
        const quest = this.dataManager.appState.quests.find(q => q.id === questId);
        if (!quest) return;

        quest.status = status;
        quest.updatedAt = new Date();
        this.renderQuestList();
    }

    handleAction(action, id, value) {
        const quest = this.dataManager.appState.quests.find(q => q.id === id);
        if (!quest) return;

        switch (action) {
            case 'removeJournalEntry':
                quest.removeJournalEntry(value);
                break;
            case 'removeLocation':
                quest.removeRelatedLocation(value);
                break;
            case 'removeCharacter':
                quest.removeRelatedCharacter(value);
                break;
            case 'removeItem':
                quest.removeRelatedItem(value);
                break;
            default:
                console.error(`Unknown action: ${action}`);
        }

        this.dataManager.saveData();
        this.showQuestDetails(quest);
    }

    renderQuestList(quests = []) {
        const questList = document.getElementById('questList');
        if (!questList) return;

        questList.innerHTML = quests.map(quest => `
            <a href="#" class="list-group-item list-group-item-action" data-quest-id="${quest.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${quest.title}</h5>
                    <small class="text-muted">${quest.status}</small>
                </div>
                <p class="mb-1">${quest.description}</p>
                <div>
                    <span class="badge bg-${this.getStatusColor(quest.status)}">${quest.status}</span>
                    ${quest.relatedEntities?.length > 0 ? 
                        `<span class="badge bg-info ms-1">${quest.relatedEntities.length} related</span>` : 
                        ''}
                </div>
            </a>
        `).join('');

        this.setupQuestListEventListeners();
    }

    getStatusColor(status) {
        switch (status) {
            case QuestStatus.ACTIVE: return 'success';
            case QuestStatus.COMPLETED: return 'primary';
            case QuestStatus.FAILED: return 'danger';
            case QuestStatus.ON_HOLD: return 'warning';
            default: return 'secondary';
        }
    }

    setupQuestListEventListeners() {
        document.querySelectorAll('[data-quest-id]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const questId = element.dataset.questId;
                this.showQuestDetails(questId);
            });
        });
    }
} 