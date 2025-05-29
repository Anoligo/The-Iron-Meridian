// Note categories
export const NoteCategory = {
    BACKSTORY: 'backstory',
    QUEST: 'quest',
    LOCATION: 'location',
    CHARACTER: 'character',
    ITEM: 'item',
    SESSION: 'session',
    OTHER: 'other',
    GENERAL: 'general',
    LORE: 'lore'
};

// Note tags
export const NoteTag = {
    IMPORTANT: 'important',
    SECRET: 'secret',
    PLOT: 'plot',
    NPC: 'npc',
    PLAYER: 'player',
    LOOT: 'loot',
    LOCATION: 'location',
    QUEST: 'quest',
    OTHER: 'other'
};

import { Entity } from './entity.js';

export class Note extends Entity {
    constructor(title, content, category = 'lore', createdAt = new Date(), updatedAt = new Date()) {
        super(null, new Date(createdAt), new Date(updatedAt));
        this.title = title;
        this.content = content;
        this.category = category;
        this.tags = [];
        this.relatedEntities = {
            quests: [],
            locations: [],
            characters: [],
            items: []
        };
    }

    updateTitle(title) {
        this.title = title;
        this.updatedAt = new Date();
    }

    updateContent(content) {
        this.content = content;
        this.updatedAt = new Date();
    }

    updateCategory(category) {
        if (!Object.values(NoteCategory).includes(category)) {
            return false;
        }
        this.category = category;
        this.updatedAt = new Date();
        return true;
    }

    addTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
            this.updatedAt = new Date();
        }
    }

    removeTag(tag) {
        this.tags = this.tags.filter(t => t !== tag);
        this.updatedAt = new Date();
    }

    addRelatedQuest(questId) {
        if (!this.relatedEntities.quests.includes(questId)) {
            this.relatedEntities.quests.push(questId);
            this.updatedAt = new Date();
        }
    }

    removeRelatedQuest(questId) {
        this.relatedEntities.quests = this.relatedEntities.quests.filter(id => id !== questId);
        this.updatedAt = new Date();
    }

    addRelatedLocation(locationId) {
        if (!this.relatedEntities.locations.includes(locationId)) {
            this.relatedEntities.locations.push(locationId);
            this.updatedAt = new Date();
        }
    }

    removeRelatedLocation(locationId) {
        this.relatedEntities.locations = this.relatedEntities.locations.filter(id => id !== locationId);
        this.updatedAt = new Date();
    }

    addRelatedCharacter(characterId) {
        if (!this.relatedEntities.characters.includes(characterId)) {
            this.relatedEntities.characters.push(characterId);
            this.updatedAt = new Date();
        }
    }

    removeRelatedCharacter(characterId) {
        this.relatedEntities.characters = this.relatedEntities.characters.filter(id => id !== characterId);
        this.updatedAt = new Date();
    }

    addRelatedItem(itemId) {
        if (!this.relatedEntities.items.includes(itemId)) {
            this.relatedEntities.items.push(itemId);
            this.updatedAt = new Date();
        }
    }

    removeRelatedItem(itemId) {
        this.relatedEntities.items = this.relatedEntities.items.filter(id => id !== itemId);
        this.updatedAt = new Date();
    }

    get name() { return this.title; }
    set name(val) { this.title = val; }
}

export class NotesManager {
    constructor(dataManager, isTest = false) {
        this.dataManager = dataManager;
        if (!this.dataManager.appState.notes) {
            this.dataManager.appState.notes = [];
        }
        if (!isTest) {
            this.initializeNotesSection();
            this.setupEventListeners();
        }
    }

    initializeNotesSection() {
        const notesSection = document.getElementById('notes');
        if (!notesSection) return;

        notesSection.innerHTML = `
            <h2>Backstories & Notes</h2>
            <div class="row mb-4">
                <div class="col">
                    <button class="btn btn-primary" id="newNoteBtn">New Note</button>
                </div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <span>Notes List</span>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="categoryFilter" data-bs-toggle="dropdown">
                                        Filter by Category
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><a class="dropdown-item" href="#" data-category="all">All Categories</a></li>
                                        <li><a class="dropdown-item" href="#" data-category="backstory">Backstory</a></li>
                                        <li><a class="dropdown-item" href="#" data-category="quest">Quest</a></li>
                                        <li><a class="dropdown-item" href="#" data-category="location">Location</a></li>
                                        <li><a class="dropdown-item" href="#" data-category="character">Character</a></li>
                                        <li><a class="dropdown-item" href="#" data-category="item">Item</a></li>
                                        <li><a class="dropdown-item" href="#" data-category="session">Session</a></li>
                                        <li><a class="dropdown-item" href="#" data-category="other">Other</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <input type="text" class="form-control" id="noteSearch" placeholder="Search notes...">
                            </div>
                            <div id="noteList" class="list-group"></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            Note Details
                        </div>
                        <div class="card-body" id="noteDetails">
                            <p class="text-muted">Select a note to view details</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupNotesSectionEventListeners();
        this.renderNoteList();
    }

    setupNotesSectionEventListeners() {
        document.getElementById('newNoteBtn').addEventListener('click', () => this.showNewNoteForm());
        document.getElementById('categoryFilter').addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            if (category) {
                this.handleCategoryFilter(category);
            }
        });
        document.getElementById('noteSearch').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
    }

    handleCategoryFilter(category) {
        const notes = this.dataManager.appState.notes;
        const filteredNotes = category === 'all' ? notes : notes.filter(note => note.category === category);
        this.renderNoteList(filteredNotes);
    }

    handleSearch(query) {
        if (!query) {
            this.renderNoteList();
            return;
        }
        const notes = this.dataManager.appState.notes;
        const filteredNotes = notes.filter(note => 
            note.title.toLowerCase().includes(query.toLowerCase()) ||
            note.content.toLowerCase().includes(query.toLowerCase())
        );
        this.renderNoteList(filteredNotes);
    }

    getFormValue(form, fieldName) {
        if (form instanceof HTMLFormElement) {
            const input = form.elements[fieldName];
            return input ? input.value : null;
        }
        return form[fieldName]?.value || form[fieldName];
    }

    createNewNote(form) {
        if (!form || !form.noteTitle?.value || !form.noteContent?.value || !form.noteCategory?.value) {
            throw new Error('Invalid form data');
        }
        const note = new Note(
            form.noteTitle.value,
            form.noteContent.value,
            form.noteCategory.value
        );
        this.dataManager.addNote(note);
        this.renderNoteList();
    }

    renderNoteList(notes = this.dataManager.appState.notes) {
        const noteList = document.getElementById('noteList');
        if (!noteList) return;

        noteList.innerHTML = notes.map(note => `
            <a href="#" class="list-group-item list-group-item-action" data-note-id="${note.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${note.title}</h5>
                    <small class="text-muted">${note.category}</small>
                </div>
                <p class="mb-1">${note.content}</p>
                <div>
                    <span class="badge bg-primary">${note.category}</span>
                    <small class="text-muted ms-2">Last updated: ${note.updatedAt.toLocaleDateString()}</small>
                </div>
            </a>
        `).join('');

        this.setupNoteListEventListeners();
    }

    getCategoryColor(category) {
        switch (category) {
            case NoteCategory.LORE: return 'primary';
            case NoteCategory.PLAYER: return 'success';
            case NoteCategory.NPC: return 'info';
            case NoteCategory.QUEST: return 'warning';
            case NoteCategory.LOCATION: return 'danger';
            default: return 'secondary';
        }
    }

    setupNoteListEventListeners() {
        document.querySelectorAll('[data-note-id]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const noteId = element.dataset.noteId;
                this.showNoteDetails(noteId);
            });
        });
    }

    showNoteDetails(noteId) {
        const note = this.dataManager.appState.notes.find(n => n.id === noteId);
        if (!note) return;

        const noteDetails = document.getElementById('noteDetails');
        noteDetails.innerHTML = `
            <h3>${note.title}</h3>
            <p class="text-muted">Category: ${note.category}</p>
            <div class="mb-3">
                <h5>Content</h5>
                <p>${note.content}</p>
            </div>
            <div class="mb-3">
                <h5>Tags</h5>
                <div>
                    ${(note.tags || []).map(tag => `
                        <span class="badge bg-secondary me-1">
                            ${tag}
                            <button class="btn-close btn-close-white" data-tag="${tag}"></button>
                        </span>
                    `).join('')}
                    <button class="btn btn-sm btn-outline-secondary" id="addTagBtn">Add Tag</button>
                </div>
            </div>
            <div class="mb-3">
                <h5>Related Entities</h5>
                <div class="row">
                    <div class="col-md-6">
                        <h6>Quests</h6>
                        <div>
                            ${(note.relatedEntities?.quests || []).map(quest => `
                                <span class="badge bg-primary me-1">
                                    ${quest}
                                    <button class="btn-close btn-close-white" data-quest="${quest}"></button>
                                </span>
                            `).join('')}
                            <button class="btn btn-sm btn-outline-primary" id="addQuestBtn">Add Quest</button>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h6>Locations</h6>
                        <div>
                            ${(note.relatedEntities?.locations || []).map(location => `
                                <span class="badge bg-success me-1">
                                    ${location}
                                    <button class="btn-close btn-close-white" data-location="${location}"></button>
                                </span>
                            `).join('')}
                            <button class="btn btn-sm btn-outline-success" id="addLocationBtn">Add Location</button>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h6>Characters</h6>
                        <div>
                            ${(note.relatedEntities?.characters || []).map(character => `
                                <span class="badge bg-info me-1">
                                    ${character}
                                    <button class="btn-close btn-close-white" data-character="${character}"></button>
                                </span>
                            `).join('')}
                            <button class="btn btn-sm btn-outline-info" id="addCharacterBtn">Add Character</button>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h6>Items</h6>
                        <div>
                            ${(note.relatedEntities?.items || []).map(item => `
                                <span class="badge bg-warning me-1">
                                    ${item}
                                    <button class="btn-close btn-close-white" data-item="${item}"></button>
                                </span>
                            `).join('')}
                            <button class="btn btn-sm btn-outline-warning" id="addItemBtn">Add Item</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-3">
                <button class="btn btn-primary" id="editNoteBtn">Edit Note</button>
            </div>
        `;

        this.setupNoteDetailsEventListeners(note);
    }

    setupNoteDetailsEventListeners(note) {
        document.getElementById('addTagBtn').addEventListener('click', () => this.showAddTagForm(note.id));
        document.getElementById('addQuestBtn').addEventListener('click', () => this.showAddRelatedQuestForm(note.id));
        document.getElementById('addLocationBtn').addEventListener('click', () => this.showAddRelatedLocationForm(note.id));
        document.getElementById('addCharacterBtn').addEventListener('click', () => this.showAddRelatedCharacterForm(note.id));
        document.getElementById('addItemBtn').addEventListener('click', () => this.showAddRelatedItemForm(note.id));
        document.getElementById('editNoteBtn').addEventListener('click', () => this.showEditNoteForm(note.id));

        document.querySelectorAll('[data-tag]').forEach(btn => {
            btn.addEventListener('click', () => this.removeTag(note.id, btn.dataset.tag));
        });
        document.querySelectorAll('[data-quest]').forEach(btn => {
            btn.addEventListener('click', () => this.removeRelatedQuest(note.id, btn.dataset.quest));
        });
        document.querySelectorAll('[data-location]').forEach(btn => {
            btn.addEventListener('click', () => this.removeRelatedLocation(note.id, btn.dataset.location));
        });
        document.querySelectorAll('[data-character]').forEach(btn => {
            btn.addEventListener('click', () => this.removeRelatedCharacter(note.id, btn.dataset.character));
        });
        document.querySelectorAll('[data-item]').forEach(btn => {
            btn.addEventListener('click', () => this.removeRelatedItem(note.id, btn.dataset.item));
        });
    }

    showNewNoteForm() {
        const noteDetails = document.getElementById('noteDetails');
        noteDetails.innerHTML = `
            <form id="newNoteForm">
                <div class="mb-3">
                    <label for="title" class="form-label">Title</label>
                    <input type="text" class="form-control" id="title" name="title" required>
                </div>
                <div class="mb-3">
                    <label for="content" class="form-label">Content</label>
                    <textarea class="form-control" id="content" name="content" rows="5" required></textarea>
                </div>
                <div class="mb-3">
                    <label for="category" class="form-label">Category</label>
                    <select class="form-select" id="category" name="category" required>
                        <option value="backstory">Backstory</option>
                        <option value="quest">Quest</option>
                        <option value="location">Location</option>
                        <option value="character">Character</option>
                        <option value="item">Item</option>
                        <option value="session">Session</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Tags</label>
                    <div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="important" id="tagImportant">
                            <label class="form-check-label" for="tagImportant">Important</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="plot" id="tagPlot">
                            <label class="form-check-label" for="tagPlot">Plot</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="lore" id="tagLore">
                            <label class="form-check-label" for="tagLore">Lore</label>
                        </div>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Create Note</button>
            </form>
        `;

        document.getElementById('newNoteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const note = this.createNewNote(e.target);
            this.showNoteDetails(note.id);
        });
    }

    showEditNoteForm(noteId) {
        const note = this.dataManager.appState.notes.find(n => n.id === noteId);
        if (!note) return;

        const noteDetails = document.getElementById('noteDetails');
        noteDetails.innerHTML = `
            <form id="editNoteForm">
                <div class="mb-3">
                    <label for="title" class="form-label">Title</label>
                    <input type="text" class="form-control" id="title" name="title" value="${note.title}" required>
                </div>
                <div class="mb-3">
                    <label for="content" class="form-label">Content</label>
                    <textarea class="form-control" id="content" name="content" rows="5" required>${note.content}</textarea>
                </div>
                <div class="mb-3">
                    <label for="category" class="form-label">Category</label>
                    <select class="form-select" id="category" name="category" required>
                        <option value="backstory" ${note.category === 'backstory' ? 'selected' : ''}>Backstory</option>
                        <option value="quest" ${note.category === 'quest' ? 'selected' : ''}>Quest</option>
                        <option value="location" ${note.category === 'location' ? 'selected' : ''}>Location</option>
                        <option value="character" ${note.category === 'character' ? 'selected' : ''}>Character</option>
                        <option value="item" ${note.category === 'item' ? 'selected' : ''}>Item</option>
                        <option value="session" ${note.category === 'session' ? 'selected' : ''}>Session</option>
                        <option value="other" ${note.category === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Update Note</button>
            </form>
        `;

        document.getElementById('editNoteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateNote(noteId, e.target);
            this.showNoteDetails(noteId);
        });
    }

    updateNote(noteId, form) {
        const note = this.dataManager.appState.notes.find(n => n.id === noteId);
        if (!note) return;

        const title = this.getFormValue(form, 'title');
        const content = this.getFormValue(form, 'content');
        const category = this.getFormValue(form, 'category');

        if (!title || !content || !category) {
            console.error('Missing required fields');
            return;
        }

        note.updateTitle(title);
        note.updateContent(content);
        note.updateCategory(category);

        this.dataManager.saveData();
        this.renderNoteList();
    }

    addTag(noteId, form) {
        if (!form || !form.tagName?.value) {
            throw new Error('Invalid form data');
        }
        const note = this.dataManager.getNoteById(noteId);
        note.addTag(form.tagName.value);
        this.renderNoteList();
    }

    addRelatedQuest(noteId, form) {
        if (!form || !form.questId?.value) {
            throw new Error('Invalid form data');
        }
        const note = this.dataManager.getNoteById(noteId);
        note.addRelatedQuest(form.questId.value);
        this.renderNoteList();
    }

    addRelatedLocation(noteId, form) {
        if (!form || !form.locationId?.value) {
            throw new Error('Invalid form data');
        }
        const note = this.dataManager.getNoteById(noteId);
        note.addRelatedLocation(form.locationId.value);
        this.renderNoteList();
    }

    addRelatedCharacter(noteId, form) {
        if (!form || !form.characterId?.value) {
            throw new Error('Invalid form data');
        }
        const note = this.dataManager.getNoteById(noteId);
        note.addRelatedCharacter(form.characterId.value);
        this.renderNoteList();
    }

    addRelatedItem(noteId, form) {
        if (!form || !form.itemId?.value) {
            throw new Error('Invalid form data');
        }
        const note = this.dataManager.getNoteById(noteId);
        note.addRelatedItem(form.itemId.value);
        this.renderNoteList();
    }

    showAddTagForm(noteId) {
        const note = this.dataManager.appState.notes.find(n => n.id === noteId);
        if (!note) return;

        const tagSelect = document.createElement('select');
        tagSelect.className = 'form-control';
        tagSelect.innerHTML = `
            <option value="">Select a tag...</option>
            ${Object.entries(NoteTag).map(([key, value]) => 
                `<option value="${value}">${key.toLowerCase()}</option>`
            ).join('')}
        `;

        const tag = prompt('Select a tag to add:', tagSelect.outerHTML);
        if (tag) {
            note.addTag(tag);
            this.dataManager.saveData();
            this.showNoteDetails(noteId);
        }
    }

    showAddRelatedQuestForm(noteId) {
        const note = this.dataManager.appState.notes.find(n => n.id === noteId);
        if (!note) return;

        const quests = this.dataManager.appState.quests || [];
        const availableQuests = quests.filter(quest => !note.relatedEntities.quests.includes(quest.id));

        if (availableQuests.length === 0) {
            alert('No available quests to add.');
            return;
        }

        const questSelect = document.createElement('select');
        questSelect.className = 'form-control';
        questSelect.innerHTML = `
            <option value="">Select a quest...</option>
            ${availableQuests.map(quest => `<option value="${quest.id}">${quest.title}</option>`).join('')}
        `;

        const questId = prompt('Select a quest to add:', questSelect.outerHTML);
        if (questId) {
            note.addRelatedQuest(questId);
            this.dataManager.saveData();
            this.showNoteDetails(noteId);
        }
    }

    showAddRelatedLocationForm(noteId) {
        const note = this.dataManager.appState.notes.find(n => n.id === noteId);
        if (!note) return;

        const locations = this.dataManager.appState.locations || [];
        const availableLocations = locations.filter(location => !note.relatedEntities.locations.includes(location.id));

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
            note.addRelatedLocation(locationId);
            this.dataManager.saveData();
            this.showNoteDetails(noteId);
        }
    }

    showAddRelatedCharacterForm(noteId) {
        const note = this.dataManager.appState.notes.find(n => n.id === noteId);
        if (!note) return;

        const characters = this.dataManager.appState.players || [];
        const availableCharacters = characters.filter(character => !note.relatedEntities.characters.includes(character.id));

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
            note.addRelatedCharacter(characterId);
            this.dataManager.saveData();
            this.showNoteDetails(noteId);
        }
    }

    showAddRelatedItemForm(noteId) {
        const note = this.dataManager.appState.notes.find(n => n.id === noteId);
        if (!note) return;

        const items = this.dataManager.appState.loot || [];
        const availableItems = items.filter(item => !note.relatedEntities.items.includes(item.id));

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
            note.addRelatedItem(itemId);
            this.dataManager.saveData();
            this.showNoteDetails(noteId);
        }
    }

    removeTag(noteId, tag) {
        const note = this.dataManager.appState.notes.find(n => n.id === noteId);
        if (note) {
            note.removeTag(tag);
            this.dataManager.saveData();
            this.showNoteDetails(noteId);
        }
    }

    removeRelatedQuest(noteId, questId) {
        const note = this.dataManager.appState.notes.find(n => n.id === noteId);
        if (note) {
            note.removeRelatedQuest(questId);
            this.dataManager.saveData();
            this.showNoteDetails(noteId);
        }
    }

    removeRelatedLocation(noteId, locationId) {
        const note = this.dataManager.appState.notes.find(n => n.id === noteId);
        if (note) {
            note.removeRelatedLocation(locationId);
            this.dataManager.saveData();
            this.showNoteDetails(noteId);
        }
    }

    removeRelatedCharacter(noteId, characterId) {
        const note = this.dataManager.appState.notes.find(n => n.id === noteId);
        if (note) {
            note.removeRelatedCharacter(characterId);
            this.dataManager.saveData();
            this.showNoteDetails(noteId);
        }
    }

    removeRelatedItem(noteId, itemId) {
        const note = this.dataManager.appState.notes.find(n => n.id === noteId);
        if (note) {
            note.removeRelatedItem(itemId);
            this.dataManager.saveData();
            this.showNoteDetails(noteId);
        }
    }

    updateNoteTitle(noteId, form) {
        if (!form || !form.title?.value) {
            throw new Error('Invalid form data');
        }
        const note = this.dataManager.getNoteById(noteId);
        note.title = form.title.value;
        this.renderNoteList();
    }

    updateNoteContent(noteId, form) {
        if (!form || !form.content?.value) {
            throw new Error('Invalid form data');
        }
        const note = this.dataManager.getNoteById(noteId);
        note.content = form.content.value;
        this.renderNoteList();
    }

    updateNoteCategory(noteId, form) {
        const note = this.dataManager.appState.notes.find(n => n.id === noteId);
        if (!note) return;

        const newCategory = form.noteCategory.value;
        if (!Object.values(NoteCategory).includes(newCategory)) return;

        note.updateCategory(newCategory);
        this.dataManager.saveData();
        this.renderNoteList();
    }
} 