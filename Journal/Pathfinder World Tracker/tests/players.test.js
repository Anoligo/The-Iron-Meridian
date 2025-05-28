import { Character, PlayerManager, CharacterStatus, CharacterClass } from '../scripts/modules/players.js';
import './test-setup.js';

describe('Character', () => {
    let character;

    beforeEach(() => {
        character = new Character('Test Character', 'human', CharacterClass.FIGHTER, 1, new Date(), new Date());
    });

    test('should create a new character with correct properties', () => {
        expect(character.name).toBe('Test Character');
        expect(character.characterClass).toBe(CharacterClass.FIGHTER);
        expect(character.level).toBe(1);
        expect(character.status).toBe(CharacterStatus.ACTIVE);
        expect(character.conditions).toEqual([]);
        expect(character.equipment).toEqual([]);
        expect(character.notes).toEqual([]);
        expect(character.createdAt instanceof Date).toBe(true);
        expect(character.updatedAt instanceof Date).toBe(true);
    });

    test('should add condition', () => {
        character.addCondition('Poisoned');
        expect(character.conditions).toContain('Poisoned');
    });

    test('should not add duplicate condition', () => {
        character.addCondition('Poisoned');
        character.addCondition('Poisoned');
        expect(character.conditions).toHaveLength(1);
    });

    test('should remove condition', () => {
        character.addCondition('Poisoned');
        character.removeCondition('Poisoned');
        expect(character.conditions).not.toContain('Poisoned');
    });

    test('should add equipment', () => {
        character.addEquipment('Sword');
        expect(character.equipment).toContain('Sword');
    });

    test('should not add duplicate equipment', () => {
        character.addEquipment('Sword');
        character.addEquipment('Sword');
        expect(character.equipment).toHaveLength(1);
    });

    test('should remove equipment', () => {
        character.addEquipment('Sword');
        character.removeEquipment('Sword');
        expect(character.equipment).not.toContain('Sword');
    });

    test('should add note', () => {
        character.addNote('Test note');
        expect(character.notes).toHaveLength(1);
        expect(character.notes[0].content).toBe('Test note');
        expect(character.notes[0].timestamp instanceof Date).toBe(true);
    });

    test('should level up', () => {
        character.levelUp();
        expect(character.level).toBe(2);
    });

    test('should update status', () => {
        character.updateStatus(CharacterStatus.INJURED);
        expect(character.status).toBe(CharacterStatus.INJURED);
    });

    test('should not update status with invalid value', () => {
        character.updateStatus('invalid');
        expect(character.status).toBe(CharacterStatus.ACTIVE);
    });
});

describe('PlayerManager', () => {
    let playerManager;
    let mockDataManager;

    beforeEach(() => {
        mockDataManager = new MockDataManager();
        playerManager = new PlayerManager(mockDataManager);
    });

    test('should initialize player section', () => {
        const playerSection = document.getElementById('players');
        expect(playerSection.innerHTML).toContain('Players');
        expect(playerSection.innerHTML).toContain('New Character');
    });

    test('should create new character', () => {
        const form = {
            characterName: { value: 'New Character' },
            characterClass: { value: CharacterClass.FIGHTER },
            characterLevel: { value: '1' }
        };

        playerManager.createNewCharacter(form);
        expect(mockDataManager.appState.players).toHaveLength(1);
        const character = mockDataManager.appState.players[0];
        expect(character.name).toBe('New Character');
        expect(character.characterClass).toBe(CharacterClass.FIGHTER);
        expect(character.level).toBe(1);
    });

    test('should filter characters by class', () => {
        const char1 = new Character('Character 1', CharacterClass.FIGHTER, 1);
        const char2 = new Character('Character 2', CharacterClass.WIZARD, 1);
        mockDataManager.appState.players.push(char1, char2);

        playerManager.handleClassFilter(CharacterClass.FIGHTER);
        const characterList = document.getElementById('characterList');
        expect(characterList.innerHTML).toContain('Character 1');
        expect(characterList.innerHTML).not.toContain('Character 2');
    });

    test('should search characters', () => {
        const char1 = new Character('Character 1', CharacterClass.FIGHTER, 1);
        const char2 = new Character('Character 2', CharacterClass.FIGHTER, 1);
        mockDataManager.appState.players.push(char1, char2);

        playerManager.handleSearch('Character 1');
        const characterList = document.getElementById('characterList');
        expect(characterList.innerHTML).toContain('Character 1');
        expect(characterList.innerHTML).not.toContain('Character 2');
    });

    test('should add condition to character', () => {
        const character = new Character('Test Character', CharacterClass.FIGHTER, 1);
        mockDataManager.appState.players.push(character);

        playerManager.addCondition(character.id, 'Poisoned');
        expect(character.conditions).toContain('Poisoned');
    });

    test('should add equipment to character', () => {
        const character = new Character('Test Character', CharacterClass.FIGHTER, 1);
        mockDataManager.appState.players.push(character);

        playerManager.addEquipment(character.id, 'Sword');
        expect(character.equipment).toContain('Sword');
    });

    test('should add note to character', () => {
        const character = new Character('Test Character', CharacterClass.FIGHTER, 1);
        mockDataManager.appState.players.push(character);

        const form = {
            noteContent: { value: 'New note' }
        };

        playerManager.addNote(character.id, form);
        expect(character.notes).toHaveLength(1);
        expect(character.notes[0].content).toBe('New note');
    });

    test('should update character status', () => {
        const character = new Character('Test Character', CharacterClass.FIGHTER, 1);
        mockDataManager.appState.players.push(character);

        playerManager.updateCharacterStatus(character.id, CharacterStatus.INJURED);
        expect(character.status).toBe(CharacterStatus.INJURED);
    });
}); 