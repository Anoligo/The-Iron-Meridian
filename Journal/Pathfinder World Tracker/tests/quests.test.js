import { Quest, QuestManager, QuestStatus } from '../scripts/modules/quests.js';
import './test-setup.js';

describe('Quest', () => {
    let quest;

    beforeEach(() => {
        quest = new Quest('Test Quest', 'Test Description', 'main', new Date(), new Date());
    });

    test('should create a new quest with correct properties', () => {
        expect(quest.title).toBe('Test Quest');
        expect(quest.description).toBe('Test Description');
        expect(quest.status).toBe(QuestStatus.ONGOING);
        expect(quest.journalEntries).toEqual([]);
        expect(quest.relatedItems).toEqual([]);
        expect(quest.createdAt instanceof Date).toBe(true);
        expect(quest.updatedAt instanceof Date).toBe(true);
    });

    test('should add journal entry', () => {
        quest.addJournalEntry('Test Entry');
        expect(quest.journalEntries).toHaveLength(1);
        expect(quest.journalEntries[0].content).toBe('Test Entry');
        expect(quest.journalEntries[0].timestamp instanceof Date).toBe(true);
    });

    test('should add related item', () => {
        quest.addRelatedItem('item1');
        expect(quest.relatedItems).toContain('item1');
    });

    test('should not add duplicate related item', () => {
        quest.addRelatedItem('item1');
        quest.addRelatedItem('item1');
        expect(quest.relatedItems).toHaveLength(1);
    });

    test('should remove related item', () => {
        quest.addRelatedItem('item1');
        quest.removeRelatedItem('item1');
        expect(quest.relatedItems).not.toContain('item1');
    });

    test('should update status', () => {
        quest.updateStatus(QuestStatus.COMPLETED);
        expect(quest.status).toBe(QuestStatus.COMPLETED);
    });

    test('should not update status with invalid value', () => {
        quest.updateStatus('invalid');
        expect(quest.status).toBe(QuestStatus.ONGOING);
    });
});

describe('QuestManager', () => {
    let questManager;
    let mockDataManager;

    beforeEach(() => {
        mockDataManager = new MockDataManager();
        questManager = new QuestManager(mockDataManager);
    });

    test('should initialize quest section', () => {
        const questSection = document.getElementById('quests');
        expect(questSection.innerHTML).toContain('Quests');
        expect(questSection.innerHTML).toContain('New Quest');
    });

    test('should create new quest', () => {
        const form = {
            questTitle: { value: 'New Quest' },
            questDescription: { value: 'Quest description' },
            questType: { value: 'main' }
        };

        questManager.createNewQuest(form);
        expect(mockDataManager.appState.quests).toHaveLength(1);
        const quest = mockDataManager.appState.quests[0];
        expect(quest.title).toBe('New Quest');
        expect(quest.description).toBe('Quest description');
        expect(quest.type).toBe('main');
        expect(quest.createdAt instanceof Date).toBe(true);
        expect(quest.updatedAt instanceof Date).toBe(true);
    });

    test('should filter quests by status', () => {
        const quest1 = new Quest('Quest 1', 'Description 1', QuestStatus.ONGOING);
        const quest2 = new Quest('Quest 2', 'Description 2', QuestStatus.COMPLETED);
        mockDataManager.appState.quests.push(quest1, quest2);

        questManager.handleStatusFilter(QuestStatus.ONGOING);
        const questList = document.getElementById('questList');
        expect(questList.innerHTML).toContain('Quest 1');
        expect(questList.innerHTML).not.toContain('Quest 2');
    });

    test('should search quests', () => {
        const quest1 = new Quest('Quest 1', 'Description 1', QuestStatus.ONGOING);
        const quest2 = new Quest('Quest 2', 'Description 2', QuestStatus.ONGOING);
        mockDataManager.appState.quests.push(quest1, quest2);

        questManager.handleSearch('Quest 1');
        const questList = document.getElementById('questList');
        expect(questList.innerHTML).toContain('Quest 1');
        expect(questList.innerHTML).not.toContain('Quest 2');
    });

    test('should add journal entry to quest', () => {
        const quest = new Quest('Test Quest', 'Description', QuestStatus.ONGOING);
        mockDataManager.appState.quests.push(quest);

        const form = {
            journalEntry: { value: 'New journal entry' }
        };

        questManager.addJournalEntry(quest.id, form);
        expect(quest.journalEntries).toHaveLength(1);
        expect(quest.journalEntries[0].content).toBe('New journal entry');
    });

    test('should update quest status', () => {
        const quest = new Quest('Test Quest', 'Description', QuestStatus.ONGOING);
        mockDataManager.appState.quests.push(quest);

        questManager.updateQuestStatus(quest.id, QuestStatus.COMPLETED);
        expect(quest.status).toBe(QuestStatus.COMPLETED);
    });
}); 