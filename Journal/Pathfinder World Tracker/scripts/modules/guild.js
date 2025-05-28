// Guild activity types
export const GuildActivityType = {
    QUEST: 'quest',
    MISSION: 'mission',
    RESOURCE: 'resource',
    REPUTATION: 'reputation',
    MEMBER: 'member',
    OTHER: 'other'
};

// Guild resource types
export const GuildResourceType = {
    GOLD: 'gold',
    ITEM: 'item',
    REPUTATION: 'reputation',
    OTHER: 'other'
};

export class GuildActivity {
    constructor(name, type, description, createdAt, updatedAt) {
        this.id = Date.now();
        this.name = name;
        this.type = type;
        this.description = description;
        this.rewards = [];
        this.participants = [];
        this.status = 'pending';
        this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt || Date.now());
        this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt || Date.now());
    }

    addReward(reward) {
        if (!this.rewards.includes(reward)) {
            this.rewards.push(reward);
            this.updatedAt = new Date();
        }
    }

    removeReward(reward) {
        this.rewards = this.rewards.filter(r => r !== reward);
        this.updatedAt = new Date();
    }

    addParticipant(participant) {
        if (!this.participants.includes(participant)) {
            this.participants.push(participant);
            this.updatedAt = new Date();
        }
    }

    removeParticipant(participant) {
        this.participants = this.participants.filter(p => p !== participant);
        this.updatedAt = new Date();
    }

    updateStatus(status) {
        const validStatuses = ['pending', 'active', 'completed', 'failed'];
        if (!validStatuses.includes(status)) {
            return;
        }
        this.status = status;
        this.updatedAt = new Date();
    }
}

export class GuildResource {
    constructor(name, type, quantity, createdAt, updatedAt) {
        this.id = Date.now();
        this.name = name;
        this.type = type;
        this.quantity = quantity;
        this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt || Date.now());
        this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt || Date.now());
    }

    addQuantity(amount) {
        this.quantity += amount;
        this.updatedAt = new Date();
    }

    removeQuantity(amount) {
        this.quantity = Math.max(0, this.quantity - amount);
        this.updatedAt = new Date();
    }

    updateName(name) {
        this.name = name;
        this.updatedAt = new Date();
    }

    updateType(type) {
        if (!Object.values(GuildResourceType).includes(type)) {
            return;
        }
        this.type = type;
        this.updatedAt = new Date();
    }
}

export class GuildManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.guildSection = document.getElementById('guild');
        if (!this.dataManager.appState.guildLogs) {
            this.dataManager.appState.guildLogs = {
                activities: [],
                resources: []
            };
        }
        this.initializeGuildSection();
        this.setupEventListeners();
    }

    initializeGuildSection() {
        this.guildSection.innerHTML = `
            <h2>Guild Logs</h2>
            <div class="row mb-4">
                <div class="col">
                    <button class="btn btn-primary" id="newActivityBtn">New Activity</button>
                    <button class="btn btn-primary ms-2" id="newResourceBtn">New Resource</button>
                </div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <span>Activities</span>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="activityTypeFilter" data-bs-toggle="dropdown">
                                        Filter by Type
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><a class="dropdown-item" href="#" data-type="all">All Types</a></li>
                                        <li><a class="dropdown-item" href="#" data-type="quest">Quest</a></li>
                                        <li><a class="dropdown-item" href="#" data-type="training">Training</a></li>
                                        <li><a class="dropdown-item" href="#" data-type="resource">Resource</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <input type="text" class="form-control" id="activitySearch" placeholder="Search activities...">
                            </div>
                            <div id="activityList" class="list-group"></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            Activity Details
                        </div>
                        <div class="card-body" id="activityDetails">
                            <p class="text-muted">Select an activity to view details</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('newActivityBtn').addEventListener('click', () => this.showNewActivityForm());
        document.getElementById('newResourceBtn').addEventListener('click', () => this.showNewResourceForm());
        document.getElementById('activityTypeFilter').addEventListener('click', (e) => {
            e.preventDefault();
            const type = e.target.dataset.type;
            if (type) {
                this.handleActivityTypeFilter(type);
            }
        });
        document.getElementById('activitySearch').addEventListener('input', (e) => {
            this.handleActivitySearch(e.target.value);
        });
    }

    getFormValue(form, fieldName) {
        const field = form[fieldName];
        if (field) {
            return field.value;
        }
        return null;
    }

    createNewActivity(form) {
        const activity = new GuildActivity(
            form.activityName.value,
            form.activityType.value,
            form.activityDescription.value,
            new Date(),
            new Date()
        );
        this.dataManager.appState.guildLogs.activities.push(activity);
        this.dataManager.saveData();
        this.renderActivityList();
    }

    createNewResource(form) {
        const resource = new GuildResource(
            form.resourceName.value,
            form.resourceType.value,
            parseInt(form.resourceQuantity.value),
            new Date(),
            new Date()
        );
        this.dataManager.appState.guildLogs.resources.push(resource);
        this.dataManager.saveData();
        this.renderResourceList();
    }

    handleActivityTypeFilter(type) {
        const activities = this.dataManager.appState.guildLogs.activities || [];
        const filteredActivities = type === 'all' 
            ? activities 
            : activities.filter(activity => activity.type === type);
        this.renderActivityList(filteredActivities);
    }

    handleActivitySearch(searchTerm) {
        const activities = this.dataManager.appState.guildLogs.activities || [];
        const filteredActivities = searchTerm
            ? activities.filter(activity => 
                activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.description.toLowerCase().includes(searchTerm.toLowerCase()))
            : activities;
        this.renderActivityList(filteredActivities);
    }

    handleResourceTypeFilter(type) {
        const resources = type === 'all'
            ? this.dataManager.appState.guildResources
            : this.dataManager.appState.guildResources.filter(r => r.type === type);
        this.renderResourceList(resources);
    }

    handleResourceSearch(searchTerm) {
        const resources = this.dataManager.appState.guildResources.filter(r =>
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderResourceList(resources);
    }

    addReward(activityId, reward) {
        const activity = this.dataManager.appState.guildLogs.activities?.find(a => a.id === activityId);
        if (!activity) return;

        activity.addReward(reward);
        this.dataManager.saveData();
        this.showActivityDetails(activityId);
    }

    addParticipant(activityId, participant) {
        const activity = this.dataManager.appState.guildLogs.activities?.find(a => a.id === activityId);
        if (!activity) return;

        activity.addParticipant(participant);
        this.dataManager.saveData();
        this.showActivityDetails(activityId);
    }

    updateActivityStatus(activityId, status) {
        const activity = this.dataManager.appState.guildLogs.activities?.find(a => a.id === activityId);
        if (!activity) return;

        activity.status = status;
        activity.updatedAt = new Date();
        this.renderActivityList();
    }

    addResourceQuantity(resourceId, amount) {
        const resource = this.dataManager.appState.guildLogs.resources.find(r => r.id === resourceId);
        if (!resource) return;

        resource.addQuantity(amount);
        this.dataManager.saveData();
        this.renderResourceList();
    }

    removeResourceQuantity(resourceId, amount) {
        const resource = this.dataManager.appState.guildLogs.resources.find(r => r.id === resourceId);
        if (!resource) return;

        resource.removeQuantity(amount);
        this.dataManager.saveData();
        this.renderResourceList();
    }

    updateResourceName(resourceId, form) {
        const resource = this.dataManager.appState.guildResources.find(r => r.id === resourceId);
        if (resource) {
            const newName = this.getFormValue(form, 'name');
            if (newName) {
                resource.updateName(newName);
                this.dataManager.saveData();
                this.showResourceDetails(resourceId);
            }
        }
    }

    updateResourceType(resourceId, form) {
        const resource = this.dataManager.appState.guildResources.find(r => r.id === resourceId);
        if (resource) {
            const newType = this.getFormValue(form, 'type');
            if (newType && Object.values(GuildResourceType).includes(newType)) {
                resource.updateType(newType);
                this.dataManager.saveData();
                this.showResourceDetails(resourceId);
            }
        }
    }

    renderActivityList(activities = this.dataManager.appState.guildLogs.activities) {
        const activityList = document.getElementById('activityList');
        activityList.innerHTML = activities.map(activity => `
            <a href="#" class="list-group-item list-group-item-action" data-activity-id="${activity.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${activity.name}</h5>
                    <small class="text-muted">${activity.type}</small>
                </div>
                <p class="mb-1">${activity.description}</p>
                <div>
                    <span class="badge bg-info">${activity.status}</span>
                    ${activity.rewards.map(reward => 
                        `<span class="badge bg-warning me-1">${reward}</span>`
                    ).join('')}
                </div>
            </a>
        `).join('');

        activityList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const activityId = e.currentTarget.dataset.activityId;
                this.showActivityDetails(activityId);
            });
        });
    }

    showActivityDetails(activityId) {
        const activity = this.dataManager.appState.guildLogs.activities.find(a => a.id === activityId);
        if (!activity) return;

        const activityDetails = document.getElementById('activityDetails');
        activityDetails.innerHTML = `
            <h3>${activity.name}</h3>
            <p class="text-muted">Type: ${activity.type}</p>
            <div class="mb-3">
                <h5>Description</h5>
                <p>${activity.description}</p>
            </div>
            <div class="mb-3">
                <h5>Status</h5>
                <p>${activity.status}</p>
            </div>
            <div class="mb-3">
                <h5>Rewards</h5>
                <div>
                    ${activity.rewards.map(reward => `
                        <span class="badge bg-warning me-1">
                            ${reward}
                            <button class="btn-close btn-close-white" data-reward="${reward}"></button>
                        </span>
                    `).join('')}
                    <button class="btn btn-sm btn-outline-warning" id="addRewardBtn">Add Reward</button>
                </div>
            </div>
            <div class="mb-3">
                <h5>Participants</h5>
                <div>
                    ${activity.participants.map(participant => `
                        <span class="badge bg-info me-1">
                            ${participant}
                            <button class="btn-close btn-close-white" data-participant="${participant}"></button>
                        </span>
                    `).join('')}
                    <button class="btn btn-sm btn-outline-info" id="addParticipantBtn">Add Participant</button>
                </div>
            </div>
            <div class="mt-3">
                <button class="btn btn-primary" id="editActivityBtn">Edit Activity</button>
            </div>
        `;

        this.setupActivityDetailsEventListeners(activity);
    }

    setupActivityDetailsEventListeners(activity) {
        document.getElementById('addRewardBtn').addEventListener('click', () => {
            const reward = prompt('Enter reward:');
            if (reward) {
                this.addReward(activity.id, reward);
            }
        });

        document.getElementById('addParticipantBtn').addEventListener('click', () => {
            const participant = prompt('Enter participant:');
            if (participant) {
                this.addParticipant(activity.id, participant);
            }
        });

        document.getElementById('editActivityBtn').addEventListener('click', () => {
            this.showEditActivityForm(activity.id);
        });

        document.querySelectorAll('[data-reward]').forEach(btn => {
            btn.addEventListener('click', () => {
                const reward = btn.dataset.reward;
                activity.rewards = activity.rewards.filter(r => r !== reward);
                activity.updatedAt = new Date();
                this.dataManager.saveData();
                this.showActivityDetails(activity.id);
            });
        });

        document.querySelectorAll('[data-participant]').forEach(btn => {
            btn.addEventListener('click', () => {
                const participant = btn.dataset.participant;
                activity.participants = activity.participants.filter(p => p !== participant);
                activity.updatedAt = new Date();
                this.dataManager.saveData();
                this.showActivityDetails(activity.id);
            });
        });
    }

    showNewActivityForm() {
        const activityDetails = document.getElementById('activityDetails');
        activityDetails.innerHTML = `
            <form id="newActivityForm">
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
                        <option value="quest">Quest</option>
                        <option value="training">Training</option>
                        <option value="resource">Resource</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="status" class="form-label">Status</label>
                    <select class="form-select" id="status" name="status" required>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Create Activity</button>
            </form>
        `;

        document.getElementById('newActivityForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const activity = this.createNewActivity(e.target);
            if (activity) {
                this.showActivityDetails(activity.id);
            }
        });
    }

    showEditActivityForm(activityId) {
        const activity = this.dataManager.appState.guildLogs.activities.find(a => a.id === activityId);
        if (!activity) return;

        const activityDetails = document.getElementById('activityDetails');
        activityDetails.innerHTML = `
            <form id="editActivityForm">
                <div class="mb-3">
                    <label for="name" class="form-label">Name</label>
                    <input type="text" class="form-control" id="name" name="name" value="${activity.name}" required>
                </div>
                <div class="mb-3">
                    <label for="description" class="form-label">Description</label>
                    <textarea class="form-control" id="description" name="description" rows="3" required>${activity.description}</textarea>
                </div>
                <div class="mb-3">
                    <label for="type" class="form-label">Type</label>
                    <select class="form-select" id="type" name="type" required>
                        <option value="quest" ${activity.type === 'quest' ? 'selected' : ''}>Quest</option>
                        <option value="training" ${activity.type === 'training' ? 'selected' : ''}>Training</option>
                        <option value="resource" ${activity.type === 'resource' ? 'selected' : ''}>Resource</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="status" class="form-label">Status</label>
                    <select class="form-select" id="status" name="status" required>
                        <option value="active" ${activity.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="completed" ${activity.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="failed" ${activity.status === 'failed' ? 'selected' : ''}>Failed</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Update Activity</button>
            </form>
        `;

        document.getElementById('editActivityForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateActivity(activityId, e.target);
            this.showActivityDetails(activityId);
        });
    }

    updateActivity(activityId, form) {
        const activity = this.dataManager.appState.guildLogs.activities.find(a => a.id === activityId);
        if (!activity) return;

        const name = this.getFormValue(form, 'name');
        const description = this.getFormValue(form, 'description');
        const type = this.getFormValue(form, 'type');
        const status = this.getFormValue(form, 'status');

        if (!name || !description || !type || !status) {
            console.error('Missing required fields');
            return;
        }

        activity.name = name;
        activity.description = description;
        activity.type = type;
        activity.status = status;
        activity.updatedAt = new Date();

        this.dataManager.saveData();
        this.renderActivityList();
    }

    renderResourceList() {
        const resourceList = document.getElementById('resourceList');
        if (!resourceList) return;

        const resources = this.dataManager.appState.guildLogs.resources || [];
        resourceList.innerHTML = resources.map(resource => `
            <a href="#" class="list-group-item list-group-item-action" data-resource-id="${resource.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${resource.name}</h5>
                    <small class="text-muted">${resource.type}</small>
                </div>
                <p class="mb-1">Quantity: ${resource.quantity}</p>
            </a>
        `).join('');

        resourceList.querySelectorAll('[data-resource-id]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const resourceId = parseInt(element.dataset.resourceId);
                this.showResourceDetails(resourceId);
            });
        });
    }
} 