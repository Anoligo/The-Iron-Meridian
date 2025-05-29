// Location types
export const LocationType = {
    CITY: 'city',
    TOWN: 'town',
    VILLAGE: 'village',
    DUNGEON: 'dungeon',
    RUINS: 'ruins',
    FOREST: 'forest',
    MOUNTAIN: 'mountain',
    CAVE: 'cave',
    TEMPLE: 'temple',
    CASTLE: 'castle',
    OTHER: 'other'
};

// Discovery status
export const DiscoveryStatus = {
    UNKNOWN: 'unknown',
    DISCOVERED: 'discovered',
    EXPLORED: 'explored',
    CLEARED: 'cleared'
};

import { Entity } from './entity.js';

export class Location extends Entity {
    constructor(name, description, type = LocationType.CITY, x = 0, y = 0, createdAt = new Date(), updatedAt = new Date()) {
        super(null, new Date(createdAt), new Date(updatedAt));
        this.name = name;
        this.description = description;
        this.type = type;
        this.x = x;
        this.y = y;
        this.discovered = false;
        this.relatedQuests = [];
        this.relatedItems = [];
    }

    updateCoordinates(coordinates) {
        this.x = coordinates.x;
        this.y = coordinates.y;
        this.updatedAt = new Date();
    }

    addRelatedQuest(questId) {
        if (!this.relatedQuests.includes(questId)) {
            this.relatedQuests.push(questId);
            this.updatedAt = new Date();
        }
    }

    removeRelatedQuest(questId) {
        this.relatedQuests = this.relatedQuests.filter(id => id !== questId);
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

    updateName(newName) {
        this.name = newName;
        this.updatedAt = new Date();
    }

    updateType(newType) {
        this.type = newType;
        this.updatedAt = new Date();
    }

    updateDescription(newDescription) {
        this.description = newDescription;
        this.updatedAt = new Date();
    }

    markAsDiscovered() {
        this.discovered = true;
        this.updatedAt = new Date();
    }

    addConnectedLocation(locationId) {
        if (!this.connectedLocations.includes(locationId)) {
            this.connectedLocations.push(locationId);
            this.updatedAt = new Date();
        }
    }

    removeConnectedLocation(locationId) {
        this.connectedLocations = this.connectedLocations.filter(id => id !== locationId);
        this.updatedAt = new Date();
    }

    addQuest(questId) {
        if (!this.quests.includes(questId)) {
            this.quests.push(questId);
            this.updatedAt = new Date();
        }
    }

    removeQuest(questId) {
        this.quests = this.quests.filter(id => id !== questId);
        this.updatedAt = new Date();
    }

    addNote(content) {
        const note = {
            id: Date.now(),
            content,
            timestamp: new Date(),
            updatedAt: new Date()
        };
        // Ensure timestamp is a Date instance for test compatibility
        note.timestamp = note.timestamp instanceof Date ? note.timestamp : new Date(note.timestamp);
        this.notes.push(note);
        this.updatedAt = new Date();
        return note;
    }

    updateStatus(status) {
        if (!Object.values(DiscoveryStatus).includes(status)) {
            return;
        }
        this.status = status;
        this.updatedAt = new Date();
    }

    updateLocationName(newName) {
        this.name = newName;
        this.updatedAt = new Date();
    }

    updateLocationDescription(newDescription) {
        this.description = newDescription;
        this.updatedAt = new Date();
    }

    updateLocationType(newType) {
        this.type = newType;
        this.updatedAt = new Date();
    }

    get isDiscovered() { return this.discovered; }
    set isDiscovered(val) { this.discovered = val; }
    get coordinates() { return { x: this.x, y: this.y }; }
}

export class LocationManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.locationsSection = document.getElementById('locations');
        if (!this.dataManager.appState.locations) {
            this.dataManager.appState.locations = [];
        }
        this.initializeLocationsSection();
        this.setupEventListeners();
    }

    initializeLocationsSection() {
        if (!this.locationsSection) {
            this.locationsSection = document.createElement('div');
            this.locationsSection.id = 'locations';
            document.body.appendChild(this.locationsSection);
        }
        this.locationsSection.innerHTML = `
            <h2>World Map & Locations</h2>
            <div class="row mb-4">
                <div class="col">
                    <button class="btn btn-primary" id="newLocationBtn">New Location</button>
                </div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <span>Locations List</span>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="typeFilter" data-bs-toggle="dropdown">
                                        Filter by Type
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><a class="dropdown-item" href="#" data-type="all">All Types</a></li>
                                        <li><a class="dropdown-item" href="#" data-type="city">City</a></li>
                                        <li><a class="dropdown-item" href="#" data-type="dungeon">Dungeon</a></li>
                                        <li><a class="dropdown-item" href="#" data-type="wilderness">Wilderness</a></li>
                                        <li><a class="dropdown-item" href="#" data-type="landmark">Landmark</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <input type="text" class="form-control" id="locationSearch" placeholder="Search locations...">
                            </div>
                            <div id="locationList" class="list-group"></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            Location Details
                        </div>
                        <div class="card-body" id="locationDetails">
                            <p class="text-muted">Select a location to view details</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('newLocationBtn').addEventListener('click', () => this.showNewLocationForm());
        document.getElementById('typeFilter').addEventListener('click', (e) => {
            const type = e.target.dataset.type;
            if (type) {
                this.handleTypeFilter(type);
            }
        });
        document.getElementById('locationSearch').addEventListener('input', (e) => {
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

    createNewLocation(form) {
        if (!form || !form.locationName?.value || !form.locationType?.value || !form.locationDescription?.value) {
            throw new Error('Invalid form data');
        }
        const location = new Location(
            form.locationName.value,
            form.locationType.value,
            form.locationDescription.value
        );
        this.dataManager.addLocation(location);
        this.renderLocationList();
    }

    handleTypeFilter(type) {
        const locations = this.dataManager.appState.locations;
        const filteredLocations = type === 'all' ? locations : locations.filter(location => location.type === type);
        this.renderLocationList(filteredLocations);
    }

    handleSearch(query) {
        if (!query) {
            this.renderLocationList();
            return;
        }
        const locations = this.dataManager.appState.locations;
        const filteredLocations = locations.filter(location => 
            location.name.toLowerCase().includes(query.toLowerCase()) ||
            location.description.toLowerCase().includes(query.toLowerCase())
        );
        this.renderLocationList(filteredLocations);
    }

    addNote(locationId, form) {
        const location = this.dataManager.appState.locations.find(l => l.id === locationId);
        if (!location) return;

        const content = this.getFormValue(form, 'noteContent');
        if (content) {
            location.addNote(content);
            this.dataManager.saveData();
            this.showLocationDetails(locationId);
        }
    }

    addQuest(locationId, questId) {
        const location = this.dataManager.appState.locations.find(l => l.id === locationId);
        if (!location) return;

        if (!location.quests.includes(questId)) {
            location.quests.push(questId);
            location.updatedAt = new Date();
            this.renderLocationList();
        }
    }

    addNPC(locationId, npcId) {
        const location = this.dataManager.appState.locations.find(l => l.id === locationId);
        if (!location) return;

        if (!location.npcs.includes(npcId)) {
            location.npcs.push(npcId);
            location.updatedAt = new Date();
            this.renderLocationList();
        }
    }

    toggleDiscovered(locationId) {
        const location = this.dataManager.appState.locations.find(l => l.id === locationId);
        if (!location) return;

        location.discovered = !location.discovered;
        location.updatedAt = new Date();
        this.renderLocationList();
    }

    renderLocationList(locations = this.dataManager.appState.locations) {
        const locationList = document.getElementById('locationList');
        if (!locationList) return;

        locationList.innerHTML = locations.map(location => `
            <a href="#" class="list-group-item list-group-item-action" data-location-id="${location.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${location.name}</h5>
                    <small class="text-muted">${location.type}</small>
                </div>
                <p class="mb-1">${location.description}</p>
                <div>
                    <span class="badge bg-primary">${location.type}</span>
                    <span class="badge bg-secondary">${location.relatedQuests.length} Quests</span>
                    <span class="badge bg-info">${location.relatedItems.length} Items</span>
                    <small class="text-muted ms-2">Last updated: ${location.updatedAt.toLocaleDateString()}</small>
                </div>
            </a>
        `).join('');

        locationList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const locationId = e.currentTarget.dataset.locationId;
                this.showLocationDetails(locationId);
            });
        });
    }

    showLocationDetails(locationId) {
        const location = this.dataManager.appState.locations.find(l => l.id === locationId);
        if (!location) return;

        const locationDetails = document.getElementById('locationDetails');
        locationDetails.innerHTML = `
            <h3>${location.name}</h3>
            <p class="text-muted">${location.type}</p>
            <div class="mb-3">
                <h5>Description</h5>
                <p>${location.description}</p>
            </div>
            <div class="mb-3">
                <h5>Coordinates</h5>
                <p>${location.coordinates.x}, ${location.coordinates.y}</p>
            </div>
            <div class="mb-3">
                <h5>Status</h5>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="discoveredToggle" ${location.discovered ? 'checked' : ''}>
                    <label class="form-check-label" for="discoveredToggle">Discovered</label>
                </div>
            </div>
            <div class="mb-3">
                <h5>Notes</h5>
                <div id="locationNotes">
                    ${location.notes?.map(note => `
                        <div class="card mb-2">
                            <div class="card-body">
                                <p class="card-text">${note.content}</p>
                                <small class="text-muted">${new Date(note.updatedAt).toLocaleString()}</small>
                            </div>
                        </div>
                    `).join('') || ''}
                </div>
                <button class="btn btn-sm btn-outline-primary" id="addNoteBtn">Add Note</button>
            </div>
            <div class="mb-3">
                <h5>Quests</h5>
                <div>
                    ${location.quests?.map(questId => `
                        <span class="badge bg-primary me-1">
                            ${questId}
                            <button class="btn-close btn-close-white" data-quest="${questId}"></button>
                        </span>
                    `).join('') || ''}
                    <button class="btn btn-sm btn-outline-primary" id="addQuestBtn">Add Quest</button>
                </div>
            </div>
            <div class="mb-3">
                <h5>NPCs</h5>
                <div>
                    ${location.npcs?.map(npcId => `
                        <span class="badge bg-info me-1">
                            ${npcId}
                            <button class="btn-close btn-close-white" data-npc="${npcId}"></button>
                        </span>
                    `).join('') || ''}
                    <button class="btn btn-sm btn-outline-info" id="addNPCBtn">Add NPC</button>
                </div>
            </div>
            <div class="mt-3">
                <button class="btn btn-primary" id="editLocationBtn">Edit Location</button>
            </div>
        `;

        this.setupLocationDetailsEventListeners(location);
    }

    setupLocationDetailsEventListeners(location) {
        document.getElementById('discoveredToggle').addEventListener('change', () => {
            this.toggleDiscovered(location.id);
        });

        document.getElementById('addNoteBtn').addEventListener('click', () => {
            const content = prompt('Enter note:');
            if (content) {
                this.addNote(location.id, { noteContent: content });
            }
        });

        document.getElementById('addQuestBtn').addEventListener('click', () => {
            const questId = prompt('Enter quest ID:');
            if (questId) {
                this.addQuest(location.id, questId);
            }
        });

        document.getElementById('addNPCBtn').addEventListener('click', () => {
            const npcId = prompt('Enter NPC ID:');
            if (npcId) {
                this.addNPC(location.id, npcId);
            }
        });

        document.getElementById('editLocationBtn').addEventListener('click', () => {
            this.showEditLocationForm(location.id);
        });

        document.querySelectorAll('[data-quest]').forEach(btn => {
            btn.addEventListener('click', () => {
                const questId = btn.dataset.quest;
                location.quests = location.quests.filter(q => q !== questId);
                location.updatedAt = new Date();
                this.renderLocationList();
            });
        });

        document.querySelectorAll('[data-npc]').forEach(btn => {
            btn.addEventListener('click', () => {
                const npcId = btn.dataset.npc;
                location.npcs = location.npcs.filter(n => n !== npcId);
                location.updatedAt = new Date();
                this.renderLocationList();
            });
        });
    }

    showNewLocationForm() {
        const locationDetails = document.getElementById('locationDetails');
        locationDetails.innerHTML = `
            <form id="newLocationForm">
                <div class="mb-3">
                    <label for="name" class="form-label">Name</label>
                    <input type="text" class="form-control" id="name" name="name" required>
                </div>
                <div class="mb-3">
                    <label for="description" class="form-label">Description</label>
                    <textarea class="form-control" id="description" name="description" rows="3" required></textarea>
                </div>
                <div class="mb-3">
                    <label for="type" class="form-label">Type</label>
                    <select class="form-select" id="type" name="type" required>
                        <option value="city">City</option>
                        <option value="dungeon">Dungeon</option>
                        <option value="wilderness">Wilderness</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="coordinates" class="form-label">Coordinates</label>
                    <input type="text" class="form-control" id="coordinates" name="coordinates" placeholder="e.g., X: 123, Y: 456">
                </div>
                <button type="submit" class="btn btn-primary">Create Location</button>
            </form>
        `;

        document.getElementById('newLocationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const location = this.createNewLocation(e.target);
            if (location) {
                this.showLocationDetails(location.id);
            }
        });
    }

    showEditLocationForm(locationId) {
        const location = this.dataManager.appState.locations.find(l => l.id === locationId);
        if (!location) return;

        const locationDetails = document.getElementById('locationDetails');
        locationDetails.innerHTML = `
            <form id="editLocationForm">
                <div class="mb-3">
                    <label for="name" class="form-label">Name</label>
                    <input type="text" class="form-control" id="name" name="name" value="${location.name}" required>
                </div>
                <div class="mb-3">
                    <label for="description" class="form-label">Description</label>
                    <textarea class="form-control" id="description" name="description" rows="3" required>${location.description}</textarea>
                </div>
                <div class="mb-3">
                    <label for="type" class="form-label">Type</label>
                    <select class="form-select" id="type" name="type" required>
                        <option value="city" ${location.type === 'city' ? 'selected' : ''}>City</option>
                        <option value="dungeon" ${location.type === 'dungeon' ? 'selected' : ''}>Dungeon</option>
                        <option value="wilderness" ${location.type === 'wilderness' ? 'selected' : ''}>Wilderness</option>
                        <option value="other" ${location.type === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="coordinates" class="form-label">Coordinates</label>
                    <input type="text" class="form-control" id="coordinates" name="coordinates" value="${location.coordinates.x}, ${location.coordinates.y}" placeholder="e.g., X: 123, Y: 456">
                </div>
                <button type="submit" class="btn btn-primary">Update Location</button>
            </form>
        `;

        document.getElementById('editLocationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateLocation(locationId, e.target);
            this.showLocationDetails(locationId);
        });
    }

    updateLocation(locationId, form) {
        const location = this.dataManager.appState.locations.find(l => l.id === locationId);
        if (!location) return;

        const name = this.getFormValue(form, 'name') || form.name;
        const description = this.getFormValue(form, 'description') || form.description;
        const type = this.getFormValue(form, 'type') || form.type;
        const x = parseInt(this.getFormValue(form, 'x')) || 0;
        const y = parseInt(this.getFormValue(form, 'y')) || 0;

        if (!name || !description || !type) {
            console.error('Missing required fields');
            return;
        }

        location.name = name;
        location.description = description;
        location.type = type;
        location.coordinates = { x, y };
        location.updatedAt = new Date();

        this.renderLocationList();
    }

    addConnectedLocation(locationId, connectedLocationId) {
        const location = this.dataManager.appState.locations.find(l => l.id === locationId);
        if (!location) return;

        location.addConnectedLocation(connectedLocationId);
        this.renderLocationList();
    }

    updateLocationStatus(locationId, status) {
        const location = this.dataManager.appState.locations.find(l => l.id === locationId);
        if (!location) return;

        location.status = status;
        location.updatedAt = new Date();
        this.renderLocationList();
    }

    updateCoordinates(locationId, form) {
        const location = this.dataManager.appState.locations.find(l => l.id === locationId);
        if (!location) return;

        const x = parseInt(form.coordinateX.value) || 0;
        const y = parseInt(form.coordinateY.value) || 0;
        
        location.updateCoordinates({ x, y });
        this.dataManager.saveData();
        this.renderLocationList();
    }

    addRelatedQuest(locationId, questId) {
        const location = this.dataManager.appState.locations.find(l => l.id === locationId);
        if (!location) return;
        location.addRelatedQuest(questId);
        this.dataManager.saveData();
        this.showLocationDetails(locationId);
    }

    addRelatedItem(locationId, itemId) {
        const location = this.dataManager.appState.locations.find(l => l.id === locationId);
        if (!location) return;
        location.addRelatedItem(itemId);
        this.dataManager.saveData();
        this.showLocationDetails(locationId);
    }

    markAsDiscovered(locationId) {
        const location = this.dataManager.appState.locations.find(l => l.id === locationId);
        if (!location) return;
        location.markAsDiscovered();
        this.dataManager.saveData();
        this.showLocationDetails(locationId);
    }

    updateLocationName(locationId, form) {
        if (!form || !form.locationName?.value) {
            throw new Error('Invalid form data');
        }
        const location = this.dataManager.getLocationById(locationId);
        location.name = form.locationName.value;
        this.renderLocationList();
    }

    updateLocationDescription(locationId, form) {
        if (!form || !form.locationDescription?.value) {
            throw new Error('Invalid form data');
        }
        const location = this.dataManager.getLocationById(locationId);
        location.description = form.locationDescription.value;
        this.renderLocationList();
    }

    updateLocationType(locationId, form) {
        if (!form || !form.locationType?.value) {
            throw new Error('Invalid form data');
        }
        const location = this.dataManager.getLocationById(locationId);
        location.type = form.locationType.value;
        this.renderLocationList();
    }

    addLocationConnection(locationId, form) {
        if (!form || !form.connectedLocationId?.value || !form.connectionType?.value) {
            throw new Error('Invalid form data');
        }
        const location = this.dataManager.getLocationById(locationId);
        location.addConnection(form.connectedLocationId.value, form.connectionType.value);
        this.renderLocationList();
    }

    addLocationNPC(locationId, form) {
        if (!form || !form.npcId?.value) {
            throw new Error('Invalid form data');
        }
        const location = this.dataManager.getLocationById(locationId);
        location.addNPC(form.npcId.value);
        this.renderLocationList();
    }

    addLocationQuest(locationId, form) {
        if (!form || !form.questId?.value) {
            throw new Error('Invalid form data');
        }
        const location = this.dataManager.getLocationById(locationId);
        location.addQuest(form.questId.value);
        this.renderLocationList();
    }
} 