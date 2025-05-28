import { Note, NotesManager, NoteCategory, NoteTag } from '../scripts/modules/notes.js';
import '../tests/test-setup.js';

describe('Note', () => {
    let note;

    beforeEach(() => {
        note = new Note('Test Note', 'Test content', NoteCategory.LORE, new Date(), new Date());
    });

    test('should create a new note with correct properties', () => {
        expect(note.title).toBe('Test Note');
        expect(note.content).toBe('Test content');
        expect(note.category).toBe(NoteCategory.LORE);
        expect(note.tags).toEqual([]);
        expect(note.relatedEntities).toEqual({
            quests: [],
            locations: [],
            characters: [],
            items: []
        });
        expect(note.createdAt instanceof Date).toBe(true);
        expect(note.updatedAt instanceof Date).toBe(true);
    });

    test('should add tag', () => {
        note.addTag(NoteTag.IMPORTANT);
        expect(note.tags).toContain(NoteTag.IMPORTANT);
    });

    test('should not add duplicate tag', () => {
        note.addTag(NoteTag.IMPORTANT);
        note.addTag(NoteTag.IMPORTANT);
        expect(note.tags).toHaveLength(1);
    });

    test('should remove tag', () => {
        note.addTag(NoteTag.IMPORTANT);
        note.removeTag(NoteTag.IMPORTANT);
        expect(note.tags).not.toContain(NoteTag.IMPORTANT);
    });

    test('should add related quest', () => {
        note.addRelatedQuest('Quest 1');
        expect(note.relatedEntities.quests).toContain('Quest 1');
    });

    test('should not add duplicate related quest', () => {
        note.addRelatedQuest('Quest 1');
        note.addRelatedQuest('Quest 1');
        expect(note.relatedEntities.quests).toHaveLength(1);
    });

    test('should remove related quest', () => {
        note.addRelatedQuest('Quest 1');
        note.removeRelatedQuest('Quest 1');
        expect(note.relatedEntities.quests).not.toContain('Quest 1');
    });

    test('should add related location', () => {
        note.addRelatedLocation('Location 1');
        expect(note.relatedEntities.locations).toContain('Location 1');
    });

    test('should not add duplicate related location', () => {
        note.addRelatedLocation('Location 1');
        note.addRelatedLocation('Location 1');
        expect(note.relatedEntities.locations).toHaveLength(1);
    });

    test('should remove related location', () => {
        note.addRelatedLocation('Location 1');
        note.removeRelatedLocation('Location 1');
        expect(note.relatedEntities.locations).not.toContain('Location 1');
    });

    test('should add related character', () => {
        note.addRelatedCharacter('Character 1');
        expect(note.relatedEntities.characters).toContain('Character 1');
    });

    test('should not add duplicate related character', () => {
        note.addRelatedCharacter('Character 1');
        note.addRelatedCharacter('Character 1');
        expect(note.relatedEntities.characters).toHaveLength(1);
    });

    test('should remove related character', () => {
        note.addRelatedCharacter('Character 1');
        note.removeRelatedCharacter('Character 1');
        expect(note.relatedEntities.characters).not.toContain('Character 1');
    });

    test('should add related item', () => {
        note.addRelatedItem('Item 1');
        expect(note.relatedEntities.items).toContain('Item 1');
    });

    test('should not add duplicate related item', () => {
        note.addRelatedItem('Item 1');
        note.addRelatedItem('Item 1');
        expect(note.relatedEntities.items).toHaveLength(1);
    });

    test('should remove related item', () => {
        note.addRelatedItem('Item 1');
        note.removeRelatedItem('Item 1');
        expect(note.relatedEntities.items).not.toContain('Item 1');
    });

    test('should update title', () => {
        note.updateTitle('New Title');
        expect(note.title).toBe('New Title');
    });

    test('should update content', () => {
        note.updateContent('New content');
        expect(note.content).toBe('New content');
    });

    test('should update category', () => {
        note.updateCategory(NoteCategory.PLOT);
        expect(note.category).toBe(NoteCategory.PLOT);
    });
});

describe('NotesManager', () => {
    let notesManager;
    let mockDataManager;

    beforeEach(() => {
        mockDataManager = new MockDataManager();
        notesManager = new NotesManager(mockDataManager);
    });

    test('should initialize notes section', () => {
        const notesSection = document.getElementById('notes');
        expect(notesSection.innerHTML).toContain('Backstories & Notes');
        expect(notesSection.innerHTML).toContain('New Note');
    });

    test('should create new note', () => {
        const form = {
            noteTitle: { value: 'New Note' },
            noteContent: { value: 'New content' },
            noteCategory: { value: NoteCategory.LORE }
        };

        notesManager.createNewNote(form);
        expect(mockDataManager.appState.notes).toHaveLength(1);
        const note = mockDataManager.appState.notes[0];
        expect(note.title).toBe('New Note');
        expect(note.content).toBe('New content');
        expect(note.category).toBe(NoteCategory.LORE);
    });

    test('should filter notes by category', () => {
        const note1 = new Note('Note 1', 'Content 1', NoteCategory.LORE);
        const note2 = new Note('Note 2', 'Content 2', NoteCategory.PLOT);
        mockDataManager.appState.notes.push(note1, note2);

        notesManager.handleCategoryFilter(NoteCategory.LORE);
        const noteList = document.getElementById('noteList');
        expect(noteList.innerHTML).toContain('Note 1');
        expect(noteList.innerHTML).not.toContain('Note 2');
    });

    test('should search notes', () => {
        const note1 = new Note('Note 1', 'Content 1', NoteCategory.LORE);
        const note2 = new Note('Note 2', 'Content 2', NoteCategory.LORE);
        mockDataManager.appState.notes.push(note1, note2);

        notesManager.handleSearch('Note 1');
        const noteList = document.getElementById('noteList');
        expect(noteList.innerHTML).toContain('Note 1');
        expect(noteList.innerHTML).not.toContain('Note 2');
    });

    test('should add tag to note', () => {
        const note = new Note('Test Note', 'Test content', NoteCategory.LORE);
        mockDataManager.appState.notes.push(note);

        notesManager.addTag(note.id, NoteTag.IMPORTANT);
        expect(note.tags).toContain(NoteTag.IMPORTANT);
    });

    test('should add related quest to note', () => {
        const note = new Note('Test Note', 'Test content', NoteCategory.LORE);
        mockDataManager.appState.notes.push(note);

        notesManager.addRelatedQuest(note.id, 'Quest 1');
        expect(note.relatedEntities.quests).toContain('Quest 1');
    });

    test('should add related location to note', () => {
        const note = new Note('Test Note', 'Test content', NoteCategory.LORE);
        mockDataManager.appState.notes.push(note);

        notesManager.addRelatedLocation(note.id, 'Location 1');
        expect(note.relatedEntities.locations).toContain('Location 1');
    });

    test('should add related character to note', () => {
        const note = new Note('Test Note', 'Test content', NoteCategory.LORE);
        mockDataManager.appState.notes.push(note);

        notesManager.addRelatedCharacter(note.id, 'Character 1');
        expect(note.relatedEntities.characters).toContain('Character 1');
    });

    test('should add related item to note', () => {
        const note = new Note('Test Note', 'Test content', NoteCategory.LORE);
        mockDataManager.appState.notes.push(note);

        notesManager.addRelatedItem(note.id, 'Item 1');
        expect(note.relatedEntities.items).toContain('Item 1');
    });

    test('should update note title', () => {
        const note = new Note('Test Note', 'Test content', NoteCategory.LORE);
        mockDataManager.appState.notes.push(note);

        const form = {
            noteTitle: { value: 'New Title' }
        };

        notesManager.updateNoteTitle(note.id, form);
        expect(note.title).toBe('New Title');
    });

    test('should update note content', () => {
        const note = new Note('Test Note', 'Test content', NoteCategory.LORE);
        mockDataManager.appState.notes.push(note);

        const form = {
            noteContent: { value: 'New content' }
        };

        notesManager.updateNoteContent(note.id, form);
        expect(note.content).toBe('New content');
    });

    test('should update note category', () => {
        const note = new Note('Test Note', 'Test content', NoteCategory.LORE);
        mockDataManager.appState.notes.push(note);

        const form = {
            noteCategory: { value: NoteCategory.PLOT }
        };

        notesManager.updateNoteCategory(note.id, form);
        expect(note.category).toBe(NoteCategory.PLOT);
    });
}); 