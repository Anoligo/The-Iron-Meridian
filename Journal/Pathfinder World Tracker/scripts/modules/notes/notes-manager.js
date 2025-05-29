import { NotesService } from './services/notes-service.js';
import { NotesUI } from './ui/notes-ui.js';
import { NotesForms } from './ui/notes-forms.js';
import { NoteCategory } from './enums/note-enums.js';

export class NotesManager {
    constructor(dataManager, isTest = false) {
        this.dataManager = dataManager;
        this.service = new NotesService(dataManager);
        this.ui = new NotesUI(this);
        this.forms = new NotesForms(this);
        this.currentFilter = '';
        
        if (!isTest) {
            this.initialize();
        }
    }

    initialize() {
        this.ui.initializeNotesSection();
    }

    // Note CRUD Operations
    createNewNote(form) {
        try {
            if (!form || !(form instanceof HTMLFormElement)) {
                console.error('Invalid form element');
                return;
            }

            const title = form.elements.noteTitle?.value?.trim();
            const content = form.elements.noteContent?.value?.trim();
            const category = form.elements.noteCategory?.value?.trim();

            if (!title || !content || !category) {
                console.error('Missing required fields');
                return;
            }

            // Create and save the new note
            const note = this.service.createNote(title, content, category);
            if (note) {
                this.ui.renderNoteList();
                this.showNoteDetails(note.id);
            }
        } catch (error) {
            console.error('Error creating note:', error);
        }
    }

    updateNote(noteId, form) {
        try {
            console.log('updateNote called with noteId:', noteId, 'form:', form);
            
            if (!form) {
                console.error('Invalid form element');
                return;
            }

            // Debug: Log all form elements and their values
            console.log('Form elements:', form.elements);
            
            const title = form.elements.editNoteTitle?.value?.trim();
            const content = form.elements.editNoteContent?.value?.trim();
            let category = form.elements.editNoteCategory?.value?.trim();
            
            console.log('Form values - title:', title, 'content:', content, 'category:', category);

            if (!title || !content || !category) {
                console.error('Missing required fields');
                return;
            }

            // Ensure the category is a valid NoteCategory value
            category = category.toLowerCase();
            const validCategories = Object.values(NoteCategory);
            
            console.log('Valid categories:', validCategories);
            console.log('Category after toLowerCase:', category);
            
            if (!validCategories.includes(category)) {
                console.error('Invalid category:', category, 'Valid categories:', validCategories);
                return;
            }

            console.log('Updating note with:', { noteId, title, content, category });
            
            // Update the note
            const updated = this.service.updateNote(noteId, { 
                title, 
                content, 
                category 
            });

            console.log('Update result:', updated);

            if (updated) {
                console.log('Update successful, refreshing UI');
                this.ui.renderNoteList();
                this.showNoteDetails(noteId);
            }
        } catch (error) {
            console.error('Error updating note:', error);
        }
    }

    deleteNote(noteId) {
        if (this.service.deleteNote(noteId)) {
            // Clear the details view
            const noteDetails = document.getElementById('noteDetails');
            if (noteDetails) {
                noteDetails.innerHTML = '<p class="text-muted">Select a note to view details</p>';
            }
            // Refresh the list
            this.ui.renderNoteList();
        }
    }

    // Note Display
    showNoteDetails(noteId) {
        const note = this.service.getNoteById(noteId);
        if (note) {
            this.ui.showNoteDetails(note);
        }
    }

    showNewNoteForm() {
        this.ui.showNewNoteForm();
    }

    showEditNoteForm(noteId) {
        const note = this.service.getNoteById(noteId);
        if (note) {
            this.ui.showEditNoteForm(note);
        }
    }

    // Filtering and Searching
    handleCategoryFilter(category) {
        this.currentFilter = category === 'all' ? '' : category;
        this.ui.renderNoteList(
            this.currentFilter 
                ? this.service.getNotesByCategory(this.currentFilter)
                : null
        );
    }

    handleSearch(query) {
        this.ui.renderNoteList(
            query 
                ? this.service.searchNotes(query)
                : null
        );
    }

    // Tag Management
    showAddTagForm(noteId) {
        this.forms.showAddTagForm(noteId);
    }

    // Related Entities
    showAddRelatedQuestForm(noteId) {
        this.forms.showAddRelatedQuestForm(noteId);
    }

    showAddRelatedLocationForm(noteId) {
        this.forms.showAddRelatedLocationForm(noteId);
    }

    showAddRelatedCharacterForm(noteId) {
        this.forms.showAddRelatedCharacterForm(noteId);
    }

    showAddRelatedItemForm(noteId) {
        this.forms.showAddRelatedItemForm(noteId);
    }

    // Proxy methods for UI convenience
    getFormValue(form, fieldName) {
        const input = form.elements[fieldName];
        return input ? input.value : null;
    }

    escapeHtml(text) {
        return this.ui.escapeHtml(text);
    }

    getCategoryColor(category) {
        return this.ui.getCategoryColor(category);
    }
}
