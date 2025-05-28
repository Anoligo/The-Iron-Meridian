import { Location, LocationManager, LocationType, DiscoveryStatus } from '../scripts/modules/locations.js';
import './test-setup.js';

describe('Location', () => {
    let location;

    beforeEach(() => {
        location = new Location('Test Location', LocationType.CITY, 'A test city', 0, 0, new Date(), new Date());
    });

    test('should create a new location with correct properties', () => {
        expect(location.name).toBe('Test Location');
        expect(location.type).toBe(LocationType.CITY);
        expect(location.description).toBe('A test city');
        expect(location.coordinates).toEqual({ x: 0, y: 0 });
        expect(location.status).toBe(DiscoveryStatus.UNKNOWN);
        expect(location.connectedLocations).toEqual([]);
        expect(location.quests).toEqual([]);
        expect(location.notes).toEqual([]);
        expect(location.createdAt instanceof Date).toBe(true);
        expect(location.updatedAt instanceof Date).toBe(true);
    });

    test('should add connected location', () => {
        const connectedLocation = new Location('Connected Location', LocationType.TOWN, 'A connected town', { x: 1, y: 1 });
        location.addConnectedLocation(connectedLocation.id);
        expect(location.connectedLocations).toContain(connectedLocation.id);
    });

    test('should not add duplicate connected location', () => {
        const connectedLocation = new Location('Connected Location', LocationType.TOWN, 'A connected town', { x: 1, y: 1 });
        location.addConnectedLocation(connectedLocation.id);
        location.addConnectedLocation(connectedLocation.id);
        expect(location.connectedLocations).toHaveLength(1);
    });

    test('should remove connected location', () => {
        const connectedLocation = new Location('Connected Location', LocationType.TOWN, 'A connected town', { x: 1, y: 1 });
        location.addConnectedLocation(connectedLocation.id);
        location.removeConnectedLocation(connectedLocation.id);
        expect(location.connectedLocations).not.toContain(connectedLocation.id);
    });

    test('should add quest', () => {
        location.addQuest('Quest 1');
        expect(location.quests).toContain('Quest 1');
    });

    test('should not add duplicate quest', () => {
        location.addQuest('Quest 1');
        location.addQuest('Quest 1');
        expect(location.quests).toHaveLength(1);
    });

    test('should remove quest', () => {
        location.addQuest('Quest 1');
        location.removeQuest('Quest 1');
        expect(location.quests).not.toContain('Quest 1');
    });

    test('should add note', () => {
        location.addNote('Test note');
        expect(location.notes).toHaveLength(1);
        expect(location.notes[0].content).toBe('Test note');
        expect(location.notes[0].timestamp instanceof Date).toBe(true);
    });

    test('should update status', () => {
        location.updateStatus(DiscoveryStatus.DISCOVERED);
        expect(location.status).toBe(DiscoveryStatus.DISCOVERED);
    });

    test('should not update status with invalid value', () => {
        location.updateStatus('invalid');
        expect(location.status).toBe(DiscoveryStatus.UNKNOWN);
    });

    test('should update coordinates', () => {
        location.updateCoordinates({ x: 1, y: 1 });
        expect(location.coordinates).toEqual({ x: 1, y: 1 });
    });
});

describe('LocationManager', () => {
    let locationManager;
    let mockDataManager;

    beforeEach(() => {
        mockDataManager = new MockDataManager();
        locationManager = new LocationManager(mockDataManager);
    });

    test('should initialize location section', () => {
        const locationSection = document.getElementById('locations');
        expect(locationSection.innerHTML).toContain('World Map &amp; Locations');
        expect(locationSection.innerHTML).toContain('New Location');
    });

    test('should create new location', () => {
        const form = {
            locationName: { value: 'New Location' },
            locationType: { value: LocationType.CITY },
            locationDescription: { value: 'A new city' },
            locationX: { value: '0' },
            locationY: { value: '0' }
        };

        locationManager.createNewLocation(form);
        expect(mockDataManager.appState.locations).toHaveLength(1);
        const location = mockDataManager.appState.locations[0];
        expect(location.name).toBe('New Location');
        expect(location.type).toBe(LocationType.CITY);
        expect(location.description).toBe('A new city');
        expect(location.coordinates).toEqual({ x: 0, y: 0 });
    });

    test('should filter locations by type', () => {
        const loc1 = new Location('Location 1', LocationType.CITY, 'A city', { x: 0, y: 0 });
        const loc2 = new Location('Location 2', LocationType.DUNGEON, 'A dungeon', { x: 1, y: 1 });
        mockDataManager.appState.locations.push(loc1, loc2);

        locationManager.handleTypeFilter(LocationType.CITY);
        const locationList = document.getElementById('locationList');
        expect(locationList.innerHTML).toContain('Location 1');
        expect(locationList.innerHTML).not.toContain('Location 2');
    });

    test('should search locations', () => {
        const loc1 = new Location('Location 1', LocationType.CITY, 'A city', { x: 0, y: 0 });
        const loc2 = new Location('Location 2', LocationType.CITY, 'Another city', { x: 1, y: 1 });
        mockDataManager.appState.locations.push(loc1, loc2);

        locationManager.handleSearch('Location 1');
        const locationList = document.getElementById('locationList');
        expect(locationList.innerHTML).toContain('Location 1');
        expect(locationList.innerHTML).not.toContain('Location 2');
    });

    test('should add connected location', () => {
        const loc1 = new Location('Location 1', LocationType.CITY, 'A city', { x: 0, y: 0 });
        const loc2 = new Location('Location 2', LocationType.TOWN, 'A town', { x: 1, y: 1 });
        mockDataManager.appState.locations.push(loc1, loc2);

        locationManager.addConnectedLocation(loc1.id, loc2.id);
        expect(loc1.connectedLocations).toContain(loc2.id);
    });

    test('should add quest to location', () => {
        const location = new Location('Test Location', LocationType.CITY, 'A city', { x: 0, y: 0 });
        mockDataManager.appState.locations.push(location);

        locationManager.addQuest(location.id, 'Quest 1');
        expect(location.quests).toContain('Quest 1');
    });

    test('should add note to location', () => {
        const location = new Location('Test Location', LocationType.CITY, 'A city', { x: 0, y: 0 });
        mockDataManager.appState.locations.push(location);

        const form = {
            noteContent: { value: 'New note' }
        };

        locationManager.addNote(location.id, form);
        expect(location.notes).toHaveLength(1);
        expect(location.notes[0].content).toBe('New note');
    });

    test('should update location status', () => {
        const location = new Location('Test Location', LocationType.CITY, 'A city', { x: 0, y: 0 });
        mockDataManager.appState.locations.push(location);

        locationManager.updateLocationStatus(location.id, DiscoveryStatus.DISCOVERED);
        expect(location.status).toBe(DiscoveryStatus.DISCOVERED);
    });

    test('should update location coordinates', () => {
        const location = new Location('Test Location', LocationType.CITY, 'A city', { x: 0, y: 0 });
        mockDataManager.appState.locations.push(location);

        const form = {
            locationX: { value: '1' },
            locationY: { value: '1' }
        };

        locationManager.updateCoordinates(location.id, form);
        expect(location.coordinates).toEqual({ x: 1, y: 1 });
    });
}); 