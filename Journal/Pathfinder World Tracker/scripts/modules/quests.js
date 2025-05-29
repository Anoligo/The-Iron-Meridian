// Quest type enum
export const QuestType = {
    MAIN: 'main',
    SIDE: 'side',
    GUILD: 'guild',
    OTHER: 'other'
};

// Quest status enum
export const QuestStatus = {
    AVAILABLE: 'available',
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
    FAILED: 'failed'
};

import { Entity } from './entity.js';

export class Quest extends Entity {
    constructor(name, description, type = QuestType.MAIN, createdAt = new Date(), updatedAt = new Date()) {
        super(null, new Date(createdAt), new Date(updatedAt));
        this.name = name;
        this.description = description;
        this.type = type;
        this.status = QuestStatus.ONGOING;
        this.journalEntries = [];
        this.relatedItems = [];
        this.relatedLocations = [];
        this.relatedCharacters = [];
    }

    addJournalEntry(entry) {
        if (!entry || typeof entry !== 'object' || !entry.content) {
            throw new Error('Invalid journal entry');
        }
        // Check for duplicate entries
        if (this.journalEntries.some(e => e.content === entry.content && e.timestamp.getTime() === entry.timestamp.getTime())) {
            return;
        }
        this.journalEntries.push(entry);
    }

    removeJournalEntry(entry) {
        this.journalEntries = this.journalEntries.filter(e => 
            e.content !== entry.content || e.timestamp.getTime() !== entry.timestamp.getTime()
        );
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

    updateTitle(title) {
        if (!title || title.trim() === '') {
            throw new Error('Quest title cannot be empty');
        }
        this.name = title;
    }

    updateDescription(newDescription) {
        this.description = newDescription;
        this.updatedAt = new Date();
    }

    updateType(type) {
        if (!Object.values(QuestType).includes(type)) {
            throw new Error(`Invalid quest type: ${type}`);
        }
        this.type = type;
    }

    updateStatus(status) {
        if (!Object.values(QuestStatus).includes(status)) {
            throw new Error(`Invalid quest status: ${status}`);
        }
        if (!this.statusHistory) {
            this.statusHistory = [];
        }
        this.statusHistory.push({
            status,
            timestamp: new Date()
        });
        this.status = status;
    }

    get title() { return this.name; }
    set title(val) { this.name = val; }
}

export class QuestManager {
    constructor(dataManager, isTest = false) {
        this.dataManager = dataManager;
        if (!this.dataManager.appState.quests) {
            this.dataManager.appState.quests = [];
        }
        if (!isTest) {
            this.initializeQuestsSection();
            this.setupEventListeners();
        }
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
                this.handleTypeFilter(type);
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
        if (!form || !form[name]) return null;
        return form[name].value;
    }

    createNewQuest(form) {
        if (!form || !form.questTitle?.value || !form.questType?.value || !form.questDescription?.value) {
            throw new Error('Invalid form data');
        }
        if (!Object.values(QuestType).includes(form.questType.value)) {
            throw new Error('Invalid quest type');
        }
        const quest = new Quest(
            form.questTitle.value,
            form.questDescription.value,
            form.questType.value
        );
        this.dataManager.addQuest(quest);
        this.renderQuestList();
    }

    renderQuestList(quests = this.dataManager.appState.quests) {
        const questList = document.getElementById('questList');
        if (!questList) return;

        questList.innerHTML = quests.map(quest => `
            <a href="#" class="list-group-item list-group-item-action" data-quest-id="${quest.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${quest.title}</h5>
                    <small class="text-muted">${quest.type}</small>
                </div>
                <p class="mb-1">${quest.description}</p>
                <div>
                    <span class="badge bg-primary">${quest.type}</span>
                    <span class="badge bg-secondary">${quest.status}</span>
                    <span class="badge bg-info">${quest.journalEntries.length} Entries</span>
                    <small class="text-muted ms-2">Last updated: ${quest.updatedAt.toLocaleDateString()}</small>
                </div>
            </a>
        `).join('');
    }

    showQuestDetails(quest) {
        const questDetails = document.getElementById('questDetails');
        questDetails.innerHTML = `
            <h3>${quest.name}</h3>
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
                                <small class="text-muted">${new Date(entry.updatedAt).toLocaleString()}</small>
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
                        <span class="badge bg-secondary me-1">
                            ${itemId}
                            <button class="btn-close btn-close-white" data-item="${itemId}"></button>
                        </span>
                    `).join('')}
                    <button class="btn btn-sm btn-outline-secondary" id="addItemBtn">Add Item</button>
                </div>
            </div>
        `;
    }

    handleTypeFilter(type) {
        const quests = this.dataManager.appState.quests;
        const filteredQuests = type === 'all' ? quests : quests.filter(quest => quest.type === type);
        this.renderQuestList(filteredQuests);
    }

    handleStatusFilter(status) {
        const quests = this.dataManager.appState.quests;
        const filteredQuests = status === 'all' ? quests : quests.filter(quest => quest.status === status);
        this.renderQuestList(filteredQuests);
    }

    handleSearch(query) {
        if (!query) {
            this.renderQuestList();
            return;
        }
        const quests = this.dataManager.appState.quests;
        const filteredQuests = quests.filter(quest => 
            quest.title.toLowerCase().includes(query.toLowerCase()) ||
            quest.description.toLowerCase().includes(query.toLowerCase())
        );
        this.renderQuestList(filteredQuests);
    }

    addJournalEntry(questId, form) {
        const quest = this.dataManager.appState.quests.find(q => q.id === questId);
        if (!quest) return;

        const content = this.getFormValue(form, 'journalEntryContent');
        if (!content) return;

        quest.addJournalEntry(content);
        this.dataManager.saveState();
        this.showQuestDetails(quest);
    }

    addRelatedItem(questId, form) {
        const quest = this.dataManager.appState.quests.find(q => q.id === questId);
        if (!quest) return;

        const itemId = this.getFormValue(form, 'itemId');
        if (!itemId) return;

        quest.addRelatedItem(itemId);
        this.dataManager.saveState();
        this.showQuestDetails(quest);
    }

    updateQuestStatus(questId, form) {
        if (!form || !form.questStatus?.value) {
            throw new Error('Invalid form data');
        }
        if (!Object.values(QuestStatus).includes(form.questStatus.value)) {
            throw new Error('Invalid quest status');
        }
        const quest = this.dataManager.getQuestById(questId);
        quest.status = form.questStatus.value;
        this.dataManager.saveState();
        this.showQuestDetails(quest);
    }

    updateQuestTitle(questId, form) {
        if (!form || !form.questTitle?.value) {
            throw new Error('Invalid form data');
        }
        const quest = this.dataManager.getQuestById(questId);
        quest.title = form.questTitle.value;
        this.renderQuestList();
    }

    updateQuestDescription(questId, form) {
        if (!form || !form.questDescription?.value) {
            throw new Error('Invalid form data');
        }
        const quest = this.dataManager.getQuestById(questId);
        quest.description = form.questDescription.value;
        this.renderQuestList();
    }

    updateQuestType(questId, form) {
        if (!form || !form.questType?.value) {
            throw new Error('Invalid form data');
        }
        if (!Object.values(QuestType).includes(form.questType.value)) {
            throw new Error('Invalid quest type');
        }
        const quest = this.dataManager.getQuestById(questId);
        quest.type = form.questType.value;
        this.renderQuestList();
    }
}