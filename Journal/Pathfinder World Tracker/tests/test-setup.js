// Mock localStorage
const localStorageMock = {
    getItem: () => null,
    setItem: () => {},
    clear: () => {}
};

global.localStorage = localStorageMock;

// Mock document
document.body.innerHTML = `
    <div id="dashboard"></div>
    <div id="quests"></div>
    <div id="players"></div>
    <div id="loot">
        <h2>Loot & Curses</h2>
        <div class="row mb-4">
            <div class="col">
                <button class="btn btn-primary" id="newItemBtn">New Item</button>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <span>Items List</span>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="typeFilter" data-bs-toggle="dropdown">
                                    Filter by Type
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" data-type="all">All Types</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <input type="text" class="form-control" id="itemSearch" placeholder="Search items...">
                        </div>
                        <div id="itemList" class="list-group">
                            <!-- Items will be listed here -->
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        Item Details
                    </div>
                    <div class="card-body" id="itemDetails">
                        <!-- Item details will be shown here -->
                        <p class="text-muted">Select an item to view details</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="locations"></div>
    <div id="notes">
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
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <input type="text" class="form-control" id="noteSearch" placeholder="Search notes...">
                        </div>
                        <div id="noteList" class="list-group">
                            <!-- Notes will be listed here -->
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        Note Details
                    </div>
                    <div class="card-body" id="noteDetails">
                        <!-- Note details will be shown here -->
                        <p class="text-muted">Select a note to view details</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="guild">
        <h2>Guild Logs</h2>
        <div class="row mb-4">
            <div class="col">
                <button class="btn btn-primary" id="newActivityBtn">New Activity</button>
                <button class="btn btn-primary" id="newResourceBtn">New Resource</button>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <span>Activities List</span>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="activityTypeFilter" data-bs-toggle="dropdown">
                                    Filter by Type
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" data-type="all">All Types</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <input type="text" class="form-control" id="activitySearch" placeholder="Search activities...">
                        </div>
                        <div id="activityList" class="list-group">
                            <!-- Activities will be listed here -->
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        Activity Details
                    </div>
                    <div class="card-body" id="activityDetails">
                        <!-- Activity details will be shown here -->
                        <p class="text-muted">Select an activity to view details</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-4">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <span>Resources List</span>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="resourceTypeFilter" data-bs-toggle="dropdown">
                                    Filter by Type
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" data-type="all">All Types</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <input type="text" class="form-control" id="resourceSearch" placeholder="Search resources...">
                        </div>
                        <div id="resourceList" class="list-group">
                            <!-- Resources will be listed here -->
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        Resource Details
                    </div>
                    <div class="card-body" id="resourceDetails">
                        <!-- Resource details will be shown here -->
                        <p class="text-muted">Select a resource to view details</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

// Mock DataManager
global.MockDataManager = class {
    constructor() {
        this.appState = {
            quests: [],
            players: [],
            loot: [],
            locations: [],
            notes: [],
            guildLogs: { activities: [], resources: [] },
            guildResources: []
        };
    }
    save() {}
    load() { return this.appState; }
    addNote(note) {
        this.appState.notes.push(note);
    }
    saveData() {}
};

// Mock UUID generation
let mockId = 0;
global.crypto = {
    randomUUID: () => `mock-uuid-${mockId++}`
};

// Mock Date to always return a fixed date for Date.now(), but do not override the constructor
const fixedDate = new Date('2024-01-01T00:00:00.000Z');
Date.now = () => fixedDate.getTime(); 