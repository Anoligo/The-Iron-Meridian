import { Location, LocationType, LocationManager } from '../scripts/modules/locations.js';
import { MockDataManager, testHelpers, mockFormValues } from './test-setup.js';

describe('Location', () => {
    let location;

    beforeEach(() => {
        location = testHelpers.createMockLocation();
    });

    test('should create a new location with correct properties', () => {
        expect(location.name).toBe('Test Location');
        expect(location.type).toBe(LocationType.CITY);
        expect(location.description).toBe('A test city');
        expect(location.isDiscovered).toBe(false);
        expect(location.relatedQuests).toEqual([]);
        expect(location.relatedItems).toEqual([]);
        expect(location.createdAt instanceof Date).toBe(true);
        expect(location.updatedAt instanceof Date).toBe(true);
    });

    test('should add related quest', () => {
        location.addRelatedQuest('Quest 1');
        expect(location.relatedQuests).toContain('Quest 1');
    });

    test('should not add duplicate related quest', () => {
        location.addRelatedQuest('Quest 1');
        location.addRelatedQuest('Quest 1');
        expect(location.relatedQuests).toHaveLength(1);
    });

    test('should remove related quest', () => {
        location.addRelatedQuest('Quest 1');
        location.removeRelatedQuest('Quest 1');
        expect(location.relatedQuests).not.toContain('Quest 1');
    });

    test('should add related item', () => {
        location.addRelatedItem('Item 1');
        expect(location.relatedItems).toContain('Item 1');
    });

    test('should not add duplicate related item', () => {
        location.addRelatedItem('Item 1');
        location.addRelatedItem('Item 1');
        expect(location.relatedItems).toHaveLength(1);
    });

    test('should remove related item', () => {
        location.addRelatedItem('Item 1');
        location.removeRelatedItem('Item 1');
        expect(location.relatedItems).not.toContain('Item 1');
    });

    test('should mark as discovered', () => {
        location.markAsDiscovered();
        expect(location.isDiscovered).toBe(true);
    });

    test('should update name', () => {
        location.updateName('New Name');
        expect(location.name).toBe('New Name');
    });

    test('should update description', () => {
        location.updateDescription('New description');
        expect(location.description).toBe('New description');
    });

    test('should update type', () => {
        location.updateType(LocationType.DUNGEON);
        expect(location.type).toBe(LocationType.DUNGEON);
    });
});

describe('LocationManager', () => {
    let locationManager;
    let mockDataManager;

    beforeEach(() => {
        mockDataManager = new MockDataManager();
        locationManager = new LocationManager(mockDataManager, true);
    });

    test('should initialize locations section', () => {
        const locationsSection = document.getElementById('locations');
        expect(locationsSection.innerHTML).toContain('Locations');
        expect(locationsSection.innerHTML).toContain('New Location');
    });

    test('should create new location', () => {
        const form = testHelpers.createMockForm(mockFormValues.location);
        locationManager.createNewLocation(form);
        expect(mockDataManager.appState.locations).toHaveLength(1);
        const location = mockDataManager.appState.locations[0];
        expect(location.name).toBe('Test Location');
        expect(location.type).toBe('A test city');
        expect(location.description).toBe('city');
    });

    test('should filter locations by type', () => {
        const location1 = testHelpers.createMockLocation({ type: LocationType.CITY, name: 'Location 1' });
        const location2 = testHelpers.createMockLocation({ type: LocationType.DUNGEON, name: 'Location 2' });
        mockDataManager.appState.locations.push(location1, location2);
        locationManager.handleTypeFilter(LocationType.CITY);
        const locationList = document.getElementById('locationList');
        expect(locationList.innerHTML).toContain('Location 1');
        expect(locationList.innerHTML).not.toContain('Location 2');
    });

    test('should search locations', () => {
        const location1 = testHelpers.createMockLocation({ name: 'Location 1' });
        const location2 = testHelpers.createMockLocation({ name: 'Location 2' });
        mockDataManager.appState.locations.push(location1, location2);
        locationManager.handleSearch('Location 1');
        const locationList = document.getElementById('locationList');
        expect(locationList.innerHTML).toContain('Location 1');
        expect(locationList.innerHTML).not.toContain('Location 2');
    });

    test('should add related quest to location', () => {
        const location = testHelpers.createMockLocation();
        mockDataManager.appState.locations.push(location);
        locationManager.addRelatedQuest(location.id, 'Quest 1');
        expect(location.relatedQuests).toContain('Quest 1');
    });

    test('should add related item to location', () => {
        const location = testHelpers.createMockLocation();
        mockDataManager.appState.locations.push(location);
        locationManager.addRelatedItem(location.id, 'Item 1');
        expect(location.relatedItems).toContain('Item 1');
    });

    test('should mark location as discovered', () => {
        const location = testHelpers.createMockLocation();
        mockDataManager.appState.locations.push(location);
        locationManager.markAsDiscovered(location.id);
        expect(location.isDiscovered).toBe(true);
    });

    test('should update location name', () => {
        const location = testHelpers.createMockLocation();
        mockDataManager.appState.locations.push(location);
        const form = testHelpers.createMockForm({ locationName: 'Updated Location' });
        locationManager.updateLocationName(location.id, form);
        const updatedLocation = mockDataManager.getLocationById(location.id);
        expect(updatedLocation.name).toBe('Updated Location');
    });

    test('should update location description', () => {
        const location = testHelpers.createMockLocation();
        mockDataManager.appState.locations.push(location);
        const form = testHelpers.createMockForm({ locationDescription: 'Updated description' });
        locationManager.updateLocationDescription(location.id, form);
        const updatedLocation = mockDataManager.getLocationById(location.id);
        expect(updatedLocation.description).toBe('Updated description');
    });

    test('should update location type', () => {
        const location = testHelpers.createMockLocation();
        mockDataManager.appState.locations.push(location);
        const form = testHelpers.createMockForm({ locationType: LocationType.DUNGEON });
        locationManager.updateLocationType(location.id, form);
        const updatedLocation = mockDataManager.getLocationById(location.id);
        expect(updatedLocation.type).toBe(LocationType.DUNGEON);
    });
}); 