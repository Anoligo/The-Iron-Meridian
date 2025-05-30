import { GuildService } from './services/guild-service.js';
import { GuildUI } from './ui/guild-ui-new.js';

/**
 * GuildManager coordinates between the UI and the GuildService
 * It serves as the main interface for guild-related operations
 */
export class GuildManager {
    /**
     * Create a new GuildManager instance
     * @param {Object} dataManager - The application's data manager
     */
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.guildService = new GuildService(dataManager);
        this.guildUI = new GuildUI(this.guildService, dataManager);
        this.initializeGuildSection();
    }

    /**
     * Initialize the guild section
     */
    initializeGuildSection() {
        // Initialize guild data if it doesn't exist
        if (!this.dataManager.appState.guildLogs) {
            this.dataManager.appState.guildLogs = {
                activities: [],
                resources: []
            };
        }
        
        // Create or get the guild section
        let guildSection = document.getElementById('guild');
        if (!guildSection) {
            console.log('Guild section not found, creating it...');
            const mainContent = document.querySelector('main .content-area');
            if (!mainContent) {
                console.error('Main content area not found');
                return;
            }
            
            guildSection = document.createElement('div');
            guildSection.id = 'guild';
            guildSection.className = 'section';
            mainContent.appendChild(guildSection);
        }
        
        // Set the section as active and visible
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        guildSection.classList.add('active');
        guildSection.style.display = 'block';
        
        // Ensure the guild section has the necessary content
        guildSection.innerHTML = `
            <div class="container">
                <h2 class="text-accent mb-4">Guild Management</h2>
                <div class="row">
                    <div class="col-md-6">
                        <div class="card mb-4">
                            <div class="card-header bg-card">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h3 class="mb-0 text-accent">Activities</h3>
                                    <button class="button new-activity-btn">
                                        <i class="fas fa-plus"></i> New Activity
                                    </button>
                                </div>
                            </div>
                            <div class="card-body bg-card">
                                <div class="activity-list">
                                    <div class="empty-state p-3 text-center">
                                        <p>No activities found. Create your first activity to get started!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card mb-4">
                            <div class="card-header bg-card">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h3 class="mb-0 text-accent">Resources</h3>
                                    <button class="button new-resource-btn">
                                        <i class="fas fa-plus"></i> New Resource
                                    </button>
                                </div>
                            </div>
                            <div class="card-body bg-card">
                                <div class="resource-list">
                                    <div class="empty-state p-3 text-center">
                                        <p>No resources found. Add your first resource to get started!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Setup event listeners after recreating the DOM elements
        this.guildUI.setupEventListeners();
        
        // Initialize the UI
        this.guildUI.initializeUI();
    }

    // Activity Methods
    /**
     * Create a new guild activity
     * @param {Object} formData - Form data for the new activity
     */
    createNewActivity(formData) {
        const newActivity = this.guildService.createActivity({
            name: formData['activity-name'],
            description: formData['activity-description'],
            type: formData['activity-type'],
            status: 'pending',
            rewards: [],
            participants: []
        });
        this.guildUI.renderActivityList();
        return newActivity;
    }

    /**
     * Update an existing activity
     * @param {string} activityId - ID of the activity to update
     * @param {Object} updates - Object containing the updates
     */
    updateActivity(activityId, updates) {
        const updated = this.guildService.updateActivity(activityId, {
            ...updates,
            updatedAt: new Date()
        });
        this.guildUI.renderActivityList();
        return updated;
    }

    /**
     * Delete an activity
     * @param {string} activityId - ID of the activity to delete
     */
    deleteActivity(activityId) {
        const success = this.guildService.deleteActivity(activityId);
        if (success) {
            this.guildUI.renderActivityList();
        }
        return success;
    }

    // Resource Methods
    /**
     * Create a new guild resource
     * @param {Object} formData - Form data for the new resource
     */
    createNewResource(formData) {
        const newResource = this.guildService.createResource({
            name: formData['resource-name'],
            description: formData['resource-description'],
            type: formData['resource-type'],
            quantity: parseInt(formData['resource-quantity'], 10) || 0
        });
        this.guildUI.renderResourceList();
        return newResource;
    }

    /**
     * Update an existing resource
     * @param {string} resourceId - ID of the resource to update
     * @param {Object} updates - Object containing the updates
     */
    updateResource(resourceId, updates) {
        const updated = this.guildService.updateResource(resourceId, {
            ...updates,
            updatedAt: new Date()
        });
        this.guildUI.renderResourceList();
        return updated;
    }

    /**
     * Delete a resource
     * @param {string} resourceId - ID of the resource to delete
     */
    deleteResource(resourceId) {
        const success = this.guildService.deleteResource(resourceId);
        if (success) {
            this.guildUI.renderResourceList();
        }
        return success;
    }

    /**
     * Add quantity to a resource
     * @param {string} resourceId - ID of the resource
     * @param {number} amount - Amount to add
     */
    addResourceQuantity(resourceId, amount) {
        const resource = this.guildService.getResourceById(resourceId);
        if (resource) {
            resource.quantity += amount;
            this.guildService.updateResource(resourceId, resource);
            this.guildUI.renderResourceList();
            return true;
        }
        return false;
    }

    /**
     * Remove quantity from a resource
     * @param {string} resourceId - ID of the resource
     * @param {number} amount - Amount to remove
     */
    removeResourceQuantity(resourceId, amount) {
        const resource = this.guildService.getResourceById(resourceId);
        if (resource && resource.quantity >= amount) {
            resource.quantity -= amount;
            this.guildService.updateResource(resourceId, resource);
            this.guildUI.renderResourceList();
            return true;
        }
        return false;
    }

    // Getters for UI
    get guildSection() {
        return this.guildUI.guildSection;
    }

    // Delegate to service for direct access if needed
    getActivityById(id) {
        return this.guildService.getActivityById(id);
    }

    getResourceById(id) {
        return this.guildService.getResourceById(id);
    }

    getAllActivities() {
        return this.guildService.getAllActivities();
    }

    getAllResources() {
        return this.guildService.getAllResources();
    }
}
