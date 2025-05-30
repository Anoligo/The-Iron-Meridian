/**
 * Notes UI Component
 * Handles the rendering and interaction for notes-related UI elements
 * Uses the BaseUI class for consistent UI patterns
 */

import { BaseUI } from '../../../components/base-ui.js';
import { createListItem, createDetailsPanel, showToast } from '../../../components/ui-components.js';
import { NoteCategory } from '../enums/note-enums.js';

export class NotesUI extends BaseUI {
    /**
     * Create a new NotesUI instance
     * @param {Object} notesService - Instance of NotesService
     * @param {Object} dataManager - Instance of DataManager for accessing related entities
     */
    constructor(notesService, dataManager) {
        super({
            containerId: 'notes',
            listId: 'noteList',
            detailsId: 'noteDetails',
            searchId: 'noteSearch',
            addButtonId: 'addNoteBtn',
            entityName: 'note',
            getAll: () => notesService.getAllNotes(),
            getById: (id) => notesService.getNoteById(id),
            add: (note) => notesService.createNote(note.title, note.content, note.category),
            update: (id, updates) => notesService.updateNote(id, updates),
            delete: (id) => notesService.deleteNote(id)
        });
        
        this.notesService = notesService;
        this.dataManager = dataManager;
        
        // Bind additional methods
        this.getCategoryBadgeClass = this.getCategoryBadgeClass.bind(this);
        this.getCategoryColor = this.getCategoryColor.bind(this);
        this.formatRelatedEntities = this.formatRelatedEntities.bind(this);
        this.formatTags = this.formatTags.bind(this);
    }
    
    /**
     * Create a list item for a note
     * @param {Object} note - Note to create list item for
     * @returns {HTMLElement} The created list item
     */
    createListItem(note) {
        return createListItem({
            id: note.id,
            title: note.title,
            subtitle: this.formatCategoryName(note.category),
            icon: 'fas fa-book',
            isSelected: this.currentEntity && this.currentEntity.id === note.id,
            badgeClass: this.getCategoryBadgeClass(note.category),
            metadata: {
                'Created': new Date(note.createdAt).toLocaleDateString(),
                'Tags': note.tags && note.tags.length ? note.tags.join(', ') : 'None'
            },
            onClick: (id) => this.handleSelect(id)
        });
    }
    
    /**
     * Render the details for a note
     * @param {Object} note - Note to render details for
     */
    renderDetails(note) {
        // Create sections for the details panel
        const sections = [
            {
                title: 'Content',
                content: `
                    <div class="mb-3 note-content">
                        ${note.content.replace(/\n/g, '<br>')}
                    </div>
                `
            }
        ];
        
        // Add tags section if there are tags
        if (note.tags && note.tags.length > 0) {
            sections.push({
                title: 'Tags',
                content: this.formatTags(note.tags)
            });
        }
        
        // Add related entities sections
        if (note.relatedQuests && note.relatedQuests.length > 0) {
            sections.push({
                title: 'Related Quests',
                content: this.formatRelatedEntities(note.relatedQuests, 'quest')
            });
        }
        
        if (note.relatedLocations && note.relatedLocations.length > 0) {
            sections.push({
                title: 'Related Locations',
                content: this.formatRelatedEntities(note.relatedLocations, 'location')
            });
        }
        
        if (note.relatedCharacters && note.relatedCharacters.length > 0) {
            sections.push({
                title: 'Related Characters',
                content: this.formatRelatedEntities(note.relatedCharacters, 'character')
            });
        }
        
        if (note.relatedItems && note.relatedItems.length > 0) {
            sections.push({
                title: 'Related Items',
                content: this.formatRelatedEntities(note.relatedItems, 'item')
            });
        }
        
        // Add metadata section
        sections.push({
            title: 'Metadata',
            content: `
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Created:</strong> ${new Date(note.createdAt).toLocaleString()}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Last Updated:</strong> ${note.updatedAt ? new Date(note.updatedAt).toLocaleString() : 'Never'}</p>
                    </div>
                </div>
            `
        });
        
        // Create the details panel
        const detailsPanel = createDetailsPanel({
            title: note.title,
            subtitle: `<span class="badge ${this.getCategoryBadgeClass(note.category)}">${this.formatCategoryName(note.category)}</span>`,
            data: note,
            actions: [
                {
                    label: 'Edit',
                    icon: 'fas fa-edit',
                    type: 'primary',
                    onClick: () => this.handleEdit(note)
                },
                {
                    label: 'Delete',
                    icon: 'fas fa-trash',
                    type: 'danger',
                    onClick: () => this.handleDelete(note.id)
                },
                {
                    label: 'Add Tag',
                    icon: 'fas fa-tag',
                    type: 'info',
                    onClick: () => this.handleAddTag(note.id)
                },
                {
                    label: 'Add Related Entity',
                    icon: 'fas fa-link',
                    type: 'secondary',
                    onClick: () => this.handleAddRelatedEntity(note.id)
                }
            ],
            sections: sections
        });
        
        // Clear the details element and append the new details panel
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(detailsPanel);
    }
    
    /**
     * Format related entities for display
     * @param {Array} entities - Array of related entities
     * @param {string} type - Type of entity (quest, location, character, item)
     * @returns {string} HTML content for related entities
     */
    formatRelatedEntities(entities, type) {
        if (!entities || entities.length === 0) {
            return '<p>None</p>';
        }
        
        const icons = {
            quest: 'fas fa-scroll',
            location: 'fas fa-map-marker-alt',
            character: 'fas fa-user',
            item: 'fas fa-coins'
        };
        
        return `
            <div class="list-group">
                ${entities.map(entity => `
                    <a href="#" class="list-group-item list-group-item-action bg-card" data-${type}-id="${entity.id}">
                        <i class="${icons[type] || 'fas fa-link'} me-2"></i>
                        ${entity.name || entity.title}
                    </a>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Format tags for display
     * @param {Array} tags - Array of tags
     * @returns {string} HTML content for tags
     */
    formatTags(tags) {
        if (!tags || tags.length === 0) {
            return '<p>No tags</p>';
        }
        
        return `
            <div class="d-flex flex-wrap gap-2">
                ${tags.map(tag => `
                    <span class="badge bg-secondary">${tag}</span>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Handle adding a new note
     */
    handleAdd() {
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.id = 'note-form-container';
        formContainer.className = 'card';
        
        // Create form content
        formContainer.innerHTML = `
            <div class="card-header bg-card">
                <h5 class="card-title mb-0">Add New Note</h5>
            </div>
            <div class="card-body bg-card">
                <form id="note-form">
                    <div class="mb-3">
                        <label for="note-title" class="form-label">Title</label>
                        <input type="text" class="form-control" id="note-title" required>
                    </div>
                    
                    <div class="mb-3">
                        <label for="note-category" class="form-label">Category</label>
                        <select class="form-select" id="note-category" required>
                            <option value="">Select Category</option>
                            ${Object.entries(NoteCategory).map(([key, value]) => 
                                `<option value="${value}">${this.formatCategoryName(value)}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label for="note-content" class="form-label">Content</label>
                        <textarea class="form-control" id="note-content" rows="8" required></textarea>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" id="cancel-note-btn">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-1"></i> Save Note
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Add form to details panel
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(formContainer);
        
        // Set up event listeners
        const form = document.getElementById('note-form');
        const cancelBtn = document.getElementById('cancel-note-btn');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleNoteFormSubmit(e, false));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.refresh();
            });
        }
    }
    
    /**
     * Handle editing a note
     * @param {Object} note - Note to edit
     */
    handleEdit(note) {
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.id = 'note-form-container';
        formContainer.className = 'card';
        
        // Create form content
        formContainer.innerHTML = `
            <div class="card-header bg-card">
                <h5 class="card-title mb-0">Edit Note: ${note.title}</h5>
            </div>
            <div class="card-body bg-card">
                <form id="note-form" data-note-id="${note.id}">
                    <div class="mb-3">
                        <label for="note-title" class="form-label">Title</label>
                        <input type="text" class="form-control" id="note-title" value="${note.title || ''}" required>
                    </div>
                    
                    <div class="mb-3">
                        <label for="note-category" class="form-label">Category</label>
                        <select class="form-select" id="note-category" required>
                            <option value="">Select Category</option>
                            ${Object.entries(NoteCategory).map(([key, value]) => 
                                `<option value="${value}" ${note.category === value ? 'selected' : ''}>${this.formatCategoryName(value)}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label for="note-content" class="form-label">Content</label>
                        <textarea class="form-control" id="note-content" rows="8" required>${note.content || ''}</textarea>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" id="cancel-note-btn">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                        <div>
                            <button type="button" class="btn btn-danger me-2" id="delete-note-btn">
                                <i class="fas fa-trash me-1"></i> Delete
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i> Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        `;
        
        // Add form to details panel
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(formContainer);
        
        // Set up event listeners
        const form = document.getElementById('note-form');
        const cancelBtn = document.getElementById('cancel-note-btn');
        const deleteBtn = document.getElementById('delete-note-btn');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleNoteFormSubmit(e, true));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.refresh(note.id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.handleDelete(note.id);
            });
        }
    }
    
    /**
     * Handle note form submission
     * @param {Event} e - Form submit event
     * @param {boolean} isEdit - Whether this is an edit operation
     */
    handleNoteFormSubmit(e, isEdit = false) {
        e.preventDefault();
        
        try {
            const form = e.target;
            const noteId = isEdit ? form.getAttribute('data-note-id') : null;
            
            // Get form values
            const noteData = {
                title: document.getElementById('note-title').value,
                category: document.getElementById('note-category').value,
                content: document.getElementById('note-content').value
            };
            
            let result;
            
            if (isEdit) {
                // Update existing note
                result = this.update(noteId, noteData);
                showToast({
                    message: 'Note updated successfully',
                    type: 'success'
                });
            } else {
                // Create new note
                result = this.add(noteData);
                showToast({
                    message: 'Note created successfully',
                    type: 'success'
                });
            }
            
            // Refresh the UI and select the note
            this.refresh(isEdit ? noteId : result.id);
        } catch (error) {
            console.error('Error saving note:', error);
            showToast({
                message: `Error saving note: ${error.message}`,
                type: 'error'
            });
        }
    }
    
    /**
     * Handle adding a tag to a note
     * @param {string} noteId - ID of the note to add a tag to
     */
    handleAddTag(noteId) {
        const note = this.getById(noteId);
        if (!note) return;
        
        const tag = prompt('Enter a new tag:');
        if (!tag || tag.trim() === '') return;
        
        const tags = note.tags || [];
        if (tags.includes(tag)) {
            showToast({
                message: 'Tag already exists',
                type: 'warning'
            });
            return;
        }
        
        tags.push(tag);
        this.update(noteId, { tags });
        this.refresh(noteId);
        
        showToast({
            message: 'Tag added successfully',
            type: 'success'
        });
    }
    
    /**
     * Handle adding a related entity to a note
     * @param {string} noteId - ID of the note to add a related entity to
     */
    handleAddRelatedEntity(noteId) {
        const note = this.getById(noteId);
        if (!note) return;
        
        // Create a dropdown to select entity type
        const entityType = prompt('Select entity type to add (quest, location, character, item):');
        if (!entityType) return;
        
        const validTypes = ['quest', 'location', 'character', 'item'];
        if (!validTypes.includes(entityType.toLowerCase())) {
            showToast({
                message: 'Invalid entity type',
                type: 'error'
            });
            return;
        }
        
        // This is a simplified implementation - in a real application, you would show a modal with a dropdown of available entities
        const entityId = prompt(`Enter the ID of the ${entityType} to add:`);
        if (!entityId) return;
        
        // Update the note with the new related entity
        const relatedEntitiesKey = `related${entityType.charAt(0).toUpperCase() + entityType.slice(1)}s`;
        const relatedEntities = note[relatedEntitiesKey] || [];
        
        if (relatedEntities.some(entity => entity.id === entityId)) {
            showToast({
                message: 'Entity already related to this note',
                type: 'warning'
            });
            return;
        }
        
        // In a real implementation, you would fetch the entity details and add them to the note
        // For this example, we'll just add a placeholder
        relatedEntities.push({
            id: entityId,
            name: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} ${entityId.substring(0, 6)}`
        });
        
        const update = {};
        update[relatedEntitiesKey] = relatedEntities;
        
        this.update(noteId, update);
        this.refresh(noteId);
        
        showToast({
            message: 'Related entity added successfully',
            type: 'success'
        });
    }
    
    /**
     * Format a category name for display
     * @param {string} category - Category value from NoteCategory enum
     * @returns {string} Formatted category name
     */
    formatCategoryName(category) {
        if (!category) return 'Unknown';
        
        // Find the key for this value in the NoteCategory enum
        const entry = Object.entries(NoteCategory).find(([_, value]) => value === category);
        if (entry) {
            const [key] = entry;
            return key.charAt(0) + key.slice(1).toLowerCase();
        }
        
        // Fallback to formatting the value directly
        return category
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    
    /**
     * Get the badge class for a category
     * @param {string} category - Category value from NoteCategory enum
     * @returns {string} CSS class for the badge
     */
    getCategoryBadgeClass(category) {
        const categoryClasses = {
            [NoteCategory.BACKSTORY]: 'bg-primary',
            [NoteCategory.QUEST]: 'bg-success',
            [NoteCategory.LOCATION]: 'bg-info',
            [NoteCategory.CHARACTER]: 'bg-warning text-dark',
            [NoteCategory.ITEM]: 'bg-secondary',
            [NoteCategory.SESSION]: 'bg-dark',
            [NoteCategory.LORE]: 'bg-purple',
            [NoteCategory.OTHER]: 'bg-secondary',
            [NoteCategory.GENERAL]: 'bg-light text-dark border'
        };
        return categoryClasses[category] || 'bg-secondary';
    }
    
    /**
     * Get the color for a category
     * @param {string} category - Category value from NoteCategory enum
     * @returns {string} Color hex code
     */
    getCategoryColor(category) {
        const colors = {
            [NoteCategory.BACKSTORY]: '#0d6efd',
            [NoteCategory.QUEST]: '#198754',
            [NoteCategory.LOCATION]: '#0dcaf0',
            [NoteCategory.CHARACTER]: '#ffc107',
            [NoteCategory.ITEM]: '#6c757d',
            [NoteCategory.SESSION]: '#212529',
            [NoteCategory.LORE]: '#6f42c1',
            [NoteCategory.OTHER]: '#6c757d',
            [NoteCategory.GENERAL]: '#f8f9fa'
        };
        return colors[category] || '#6c757d';
    }
}
