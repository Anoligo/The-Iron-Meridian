import { NotesService } from './services/notes-service.js';
import { NotesUI } from './ui/notes-ui-new.js';
import { NoteCategory } from './enums/note-enums.js';

export class NotesManager {
    constructor(dataManager, isTest = false) {
        this.dataManager = dataManager;
        this.service = new NotesService(dataManager);
        this.ui = new NotesUI(this.service, dataManager);
        this.currentFilter = '';
        
        if (!isTest) {
            this.initialize();
        }
    }

    initialize() {
        this.ui.initialize();
        this.ui.render();
    }

    // Note CRUD Operations
    createNewNote(noteData) {
        try {
            // Create and save the new note
            const note = this.service.createNote(
                noteData.title, 
                noteData.content, 
                noteData.category
            );
            
            if (note) {
                this.ui.refresh();
                return note;
            }
            return null;
        } catch (error) {
            console.error('Error creating note:', error);
            return null;
        }
    }

    updateNote(noteId, updates) {
        try {
            // Update the note
            const updated = this.service.updateNote(noteId, updates);

            if (updated) {
                this.ui.refresh(noteId);
                return updated;
            }
            return null;
        } catch (error) {
            console.error('Error updating note:', error);
            return null;
        }
    }

    deleteNote(noteId) {
        if (this.service.deleteNote(noteId)) {
            // Refresh the UI
            this.ui.refresh();
            return true;
        }
        return false;
    }

    // Note Display
    showNoteDetails(noteId) {
        this.ui.handleSelect(noteId);
    }

    showNewNoteForm() {
        this.ui.handleAdd();
    }

    showEditNoteForm(noteId) {
        const note = this.service.getNoteById(noteId);
        if (note) {
            this.ui.handleEdit(note);
        }
    }

    // Filtering and Searching
    handleCategoryFilter(category) {
        this.currentFilter = category === 'all' ? '' : category;
        const filteredNotes = this.currentFilter 
            ? this.service.getNotesByCategory(this.currentFilter)
            : this.service.getAllNotes();
        this.ui.renderList(filteredNotes);
    }

    handleSearch(query) {
        const filteredNotes = query 
            ? this.service.searchNotes(query)
            : this.service.getAllNotes();
        this.ui.renderList(filteredNotes);
    }

    // Tag Management
    showAddTagForm(noteId) {
        this.ui.handleAddTag(noteId);
    }

    // Related Entities
    showAddRelatedQuestForm(noteId) {
        this.ui.handleAddRelatedEntity(noteId);
    }

    showAddRelatedLocationForm(noteId) {
        this.ui.handleAddRelatedEntity(noteId);
    }

    showAddRelatedCharacterForm(noteId) {
        this.ui.handleAddRelatedEntity(noteId);
    }

    showAddRelatedItemForm(noteId) {
        this.ui.handleAddRelatedEntity(noteId);
    }

    // Utility methods
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getCategoryColor(category) {
        return this.ui.getCategoryColor(category);
    }
}
