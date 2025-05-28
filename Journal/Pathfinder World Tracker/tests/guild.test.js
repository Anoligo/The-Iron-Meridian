import { GuildActivity, GuildResource, GuildManager, GuildActivityType, GuildResourceType } from '../scripts/modules/guild.js';
import './test-setup.js';

describe('GuildActivity', () => {
    let activity;

    beforeEach(() => {
        activity = new GuildActivity('Test Activity', GuildActivityType.QUEST, 'Test description', new Date(), new Date());
    });

    test('should create a new activity with correct properties', () => {
        expect(activity.name).toBe('Test Activity');
        expect(activity.type).toBe(GuildActivityType.QUEST);
        expect(activity.description).toBe('Test description');
        expect(activity.status).toBe('pending');
        expect(activity.rewards).toEqual([]);
        expect(activity.participants).toEqual([]);
        expect(activity.createdAt instanceof Date).toBe(true);
        expect(activity.updatedAt instanceof Date).toBe(true);
    });

    test('should add reward', () => {
        activity.addReward('Gold: 100');
        expect(activity.rewards).toContain('Gold: 100');
    });

    test('should not add duplicate reward', () => {
        activity.addReward('Gold: 100');
        activity.addReward('Gold: 100');
        expect(activity.rewards).toHaveLength(1);
    });

    test('should remove reward', () => {
        activity.addReward('Gold: 100');
        activity.removeReward('Gold: 100');
        expect(activity.rewards).not.toContain('Gold: 100');
    });

    test('should add participant', () => {
        activity.addParticipant('Player 1');
        expect(activity.participants).toContain('Player 1');
    });

    test('should not add duplicate participant', () => {
        activity.addParticipant('Player 1');
        activity.addParticipant('Player 1');
        expect(activity.participants).toHaveLength(1);
    });

    test('should remove participant', () => {
        activity.addParticipant('Player 1');
        activity.removeParticipant('Player 1');
        expect(activity.participants).not.toContain('Player 1');
    });

    test('should update status', () => {
        activity.updateStatus('completed');
        expect(activity.status).toBe('completed');
    });

    test('should not update status with invalid value', () => {
        activity.updateStatus('invalid');
        expect(activity.status).toBe('pending');
    });
});

describe('GuildResource', () => {
    let resource;

    beforeEach(() => {
        resource = new GuildResource('Test Resource', GuildResourceType.GOLD, 100, new Date(), new Date());
    });

    test('should create a new resource with correct properties', () => {
        expect(resource.name).toBe('Test Resource');
        expect(resource.type).toBe(GuildResourceType.GOLD);
        expect(resource.quantity).toBe(100);
        expect(resource.createdAt instanceof Date).toBe(true);
        expect(resource.updatedAt instanceof Date).toBe(true);
    });

    test('should add quantity', () => {
        resource.addQuantity(50);
        expect(resource.quantity).toBe(150);
    });

    test('should remove quantity', () => {
        resource.removeQuantity(50);
        expect(resource.quantity).toBe(50);
    });

    test('should not remove more than available quantity', () => {
        resource.removeQuantity(150);
        expect(resource.quantity).toBe(0);
    });

    test('should update name', () => {
        resource.updateName('New Name');
        expect(resource.name).toBe('New Name');
    });

    test('should update type', () => {
        resource.updateType(GuildResourceType.ITEM);
        expect(resource.type).toBe(GuildResourceType.ITEM);
    });
});

describe('GuildManager', () => {
    let guildManager;
    let mockDataManager;

    beforeEach(() => {
        mockDataManager = new MockDataManager();
        guildManager = new GuildManager(mockDataManager);
    });

    test('should initialize guild section', () => {
        const guildSection = document.getElementById('guild');
        expect(guildSection.innerHTML).toContain('Guild Logs');
        expect(guildSection.innerHTML).toContain('New Activity');
        expect(guildSection.innerHTML).toContain('New Resource');
    });

    test('should create new activity', () => {
        const form = {
            activityName: { value: 'New Activity' },
            activityType: { value: GuildActivityType.QUEST },
            activityDescription: { value: 'New description' }
        };

        guildManager.createNewActivity(form);
        expect(mockDataManager.appState.guildLogs.activities).toHaveLength(1);
        const activity = mockDataManager.appState.guildLogs.activities[0];
        expect(activity.name).toBe('New Activity');
        expect(activity.type).toBe(GuildActivityType.QUEST);
        expect(activity.description).toBe('New description');
    });

    test('should create new resource', () => {
        const form = {
            resourceName: { value: 'New Resource' },
            resourceType: { value: GuildResourceType.GOLD },
            resourceQuantity: { value: '100' }
        };

        guildManager.createNewResource(form);
        expect(mockDataManager.appState.guildLogs.resources).toHaveLength(1);
        const resource = mockDataManager.appState.guildLogs.resources[0];
        expect(resource.name).toBe('New Resource');
        expect(resource.type).toBe(GuildResourceType.GOLD);
        expect(resource.quantity).toBe(100);
    });

    test('should filter activities by type', () => {
        const activity1 = new GuildActivity('Activity 1', GuildActivityType.QUEST, 'Description 1');
        const activity2 = new GuildActivity('Activity 2', GuildActivityType.TRAINING, 'Description 2');
        mockDataManager.appState.guildLogs.activities.push(activity1, activity2);

        guildManager.handleActivityTypeFilter(GuildActivityType.QUEST);
        const activityList = document.getElementById('activityList');
        expect(activityList.innerHTML).toContain('Activity 1');
        expect(activityList.innerHTML).not.toContain('Activity 2');
    });

    test('should filter resources by type', () => {
        const resource1 = new GuildResource('Resource 1', GuildResourceType.GOLD, 100);
        const resource2 = new GuildResource('Resource 2', GuildResourceType.ITEM, 1);
        mockDataManager.appState.guildLogs.resources.push(resource1, resource2);

        guildManager.handleResourceTypeFilter(GuildResourceType.GOLD);
        const resourceList = document.getElementById('resourceList');
        expect(resourceList.innerHTML).toContain('Resource 1');
        expect(resourceList.innerHTML).not.toContain('Resource 2');
    });

    test('should search activities', () => {
        const activity1 = new GuildActivity('Activity 1', GuildActivityType.QUEST, 'Description 1');
        const activity2 = new GuildActivity('Activity 2', GuildActivityType.QUEST, 'Description 2');
        mockDataManager.appState.guildLogs.activities.push(activity1, activity2);

        guildManager.handleActivitySearch('Activity 1');
        const activityList = document.getElementById('activityList');
        expect(activityList.innerHTML).toContain('Activity 1');
        expect(activityList.innerHTML).not.toContain('Activity 2');
    });

    test('should search resources', () => {
        const resource1 = new GuildResource('Resource 1', GuildResourceType.GOLD, 100);
        const resource2 = new GuildResource('Resource 2', GuildResourceType.GOLD, 200);
        mockDataManager.appState.guildLogs.resources.push(resource1, resource2);

        guildManager.handleResourceSearch('Resource 1');
        const resourceList = document.getElementById('resourceList');
        expect(resourceList.innerHTML).toContain('Resource 1');
        expect(resourceList.innerHTML).not.toContain('Resource 2');
    });

    test('should add reward to activity', () => {
        const activity = new GuildActivity('Test Activity', GuildActivityType.QUEST, 'Test description');
        mockDataManager.appState.guildLogs.activities.push(activity);

        guildManager.addReward(activity.id, 'Gold: 100');
        expect(activity.rewards).toContain('Gold: 100');
    });

    test('should add participant to activity', () => {
        const activity = new GuildActivity('Test Activity', GuildActivityType.QUEST, 'Test description');
        mockDataManager.appState.guildLogs.activities.push(activity);

        guildManager.addParticipant(activity.id, 'Player 1');
        expect(activity.participants).toContain('Player 1');
    });

    test('should update activity status', () => {
        const activity = new GuildActivity('Test Activity', GuildActivityType.QUEST, 'Test description');
        mockDataManager.appState.guildLogs.activities.push(activity);

        guildManager.updateActivityStatus(activity.id, 'completed');
        expect(activity.status).toBe('completed');
    });

    test('should add quantity to resource', () => {
        const resource = new GuildResource('Test Resource', GuildResourceType.GOLD, 100);
        mockDataManager.appState.guildLogs.resources.push(resource);

        guildManager.addResourceQuantity(resource.id, 50);
        expect(resource.quantity).toBe(150);
    });

    test('should remove quantity from resource', () => {
        const resource = new GuildResource('Test Resource', GuildResourceType.GOLD, 100);
        mockDataManager.appState.guildLogs.resources.push(resource);

        guildManager.removeResourceQuantity(resource.id, 50);
        expect(resource.quantity).toBe(50);
    });

    test('should update resource name', () => {
        const resource = new GuildResource('Test Resource', GuildResourceType.GOLD, 100);
        mockDataManager.appState.guildLogs.resources.push(resource);

        const form = {
            resourceName: { value: 'New Name' }
        };

        guildManager.updateResourceName(resource.id, form);
        expect(resource.name).toBe('New Name');
    });

    test('should update resource type', () => {
        const resource = new GuildResource('Test Resource', GuildResourceType.GOLD, 100);
        mockDataManager.appState.guildLogs.resources.push(resource);

        const form = {
            resourceType: { value: GuildResourceType.ITEM }
        };

        guildManager.updateResourceType(resource.id, form);
        expect(resource.type).toBe(GuildResourceType.ITEM);
    });
}); 