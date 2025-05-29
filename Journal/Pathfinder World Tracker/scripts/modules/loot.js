// Item types
export const ItemType = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    MAGIC: 'magic',
    CONSUMABLE: 'consumable',
    CURRENCY: 'currency',
    MISC: 'misc'
};

// Rarity levels
export const ItemRarity = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    VERY_RARE: 'very_rare',
    LEGENDARY: 'legendary'
};

import { Entity } from './entity.js';

export class Item extends Entity {
    constructor(name, description, type = ItemType.WEAPON, rarity = ItemRarity.COMMON, createdAt = new Date(), updatedAt = new Date()) {
        super(null, new Date(createdAt), new Date(updatedAt));
        this.name = name;
        this.description = description;
        this.type = type;
        this.rarity = rarity;
        this.effects = [];
        this.curseEffects = [];
        this.isCursed = false;
        this.owner = null;
        this.questSource = null;
    }

    addCurseEffect(effect) {
        if (!this.curseEffects.includes(effect)) {
            this.isCursed = true;
            this.curseEffects.push(effect);
            this.updatedAt = new Date();
        }
    }

    removeCurseEffect(effect) {
        this.curseEffects = this.curseEffects.filter(e => e !== effect);
        if (this.curseEffects.length === 0) {
            this.isCursed = false;
        }
        this.updatedAt = new Date();
    }

    assignOwner(ownerId) {
        this.owner = ownerId;
        this.updatedAt = new Date();
    }

    setQuestSource(questId) {
        this.questSource = questId;
        this.updatedAt = new Date();
    }

    updateName(newName) {
        this.name = newName;
        this.updatedAt = new Date();
    }

    updateDescription(newDescription) {
        this.description = newDescription;
        this.updatedAt = new Date();
    }

    updateRarity(rarity) {
        if (Object.values(ItemRarity).includes(rarity)) {
            this.rarity = rarity;
            this.updatedAt = new Date();
        }
    }
}

export class LootManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.lootSection = document.getElementById('loot');
        if (!this.dataManager.appState.loot) {
            this.dataManager.appState.loot = [];
        }
        this.initializeLootSection();
        this.setupEventListeners();
    }

    initializeLootSection() {
        this.lootSection.innerHTML = `
            <h2>Loot & Curses</h2>
            <div class="row mb-4">
                <div class="col">
                    <button class="btn btn-primary" id="newItemBtn">New Item</button>
                </div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <span>Items List</span>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="itemTypeFilter" data-bs-toggle="dropdown">
                                        Filter by Type
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><a class="dropdown-item" href="#" data-type="all">All Types</a></li>
                                        <li><a class="dropdown-item" href="#" data-type="weapon">Weapon</a></li>
                                        <li><a class="dropdown-item" href="#" data-type="armor">Armor</a></li>
                                        <li><a class="dropdown-item" href="#" data-type="magic">Magic</a></li>
                                        <li><a class="dropdown-item" href="#" data-type="consumable">Consumable</a></li>
                                        <li><a class="dropdown-item" href="#" data-type="currency">Currency</a></li>
                                        <li><a class="dropdown-item" href="#" data-type="misc">Misc</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <input type="text" class="form-control" id="itemSearch" placeholder="Search items...">
                            </div>
                            <div id="itemList" class="list-group"></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            Item Details
                        </div>
                        <div class="card-body" id="itemDetails">
                            <p class="text-muted">Select an item to view details</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('newItemBtn').addEventListener('click', () => this.showNewItemForm());
        document.getElementById('itemTypeFilter').addEventListener('click', (e) => {
            e.preventDefault();
            const type = e.target.dataset.type;
            this.handleTypeFilter(type);
        });
        document.getElementById('itemSearch').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
    }

    createNewItem(form) {
        const item = new Item(
            form.itemName.value,
            form.itemDescription.value,
            form.itemType.value,
            form.itemRarity.value,
            new Date(),
            new Date()
        );
        this.dataManager.appState.loot.push(item);
        this.dataManager.saveData();
        this.renderItemList();
    }

    handleFilter(filter) {
        const items = this.dataManager.appState.loot;
        const filteredItems = filter === 'all' 
            ? items 
            : items.filter(item => item.isCursed);
        this.renderItemList(filteredItems);
    }

    handleSearch(searchTerm) {
        const items = this.dataManager.appState.loot;
        const filteredItems = searchTerm
            ? items.filter(item => 
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase()))
            : items;
        this.renderItemList(filteredItems);
    }

    addEffect(itemId, effect) {
        const item = this.dataManager.appState.loot.find(i => i.id === itemId);
        if (!item) return;

        if (!item.effects.includes(effect)) {
            item.effects.push(effect);
            item.updatedAt = new Date();
            this.dataManager.saveData();
            this.showItemDetails(itemId);
        }
    }

    updateItemLocation(itemId, location) {
        const item = this.dataManager.appState.loot.find(i => i.id === itemId);
        if (!item) return;

        item.location = location;
        item.updatedAt = new Date();
        this.dataManager.saveData();
        this.showItemDetails(itemId);
    }

    updateItemOwner(itemId, owner) {
        const item = this.dataManager.appState.loot.find(i => i.id === itemId);
        if (!item) return;

        item.owner = owner;
        item.updatedAt = new Date();
        this.dataManager.saveData();
        this.showItemDetails(itemId);
    }

    renderItemList(items = []) {
        const itemList = document.getElementById('itemList');
        if (!itemList) return;

        itemList.innerHTML = items.map(item => `
            <a href="#" class="list-group-item list-group-item-action" data-item-id="${item.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${item.name}</h5>
                    <small class="text-muted">${item.type}</small>
                </div>
                <p class="mb-1">${item.description}</p>
                <div>
                    <span class="badge bg-${this.getRarityColor(item.rarity)}">${item.rarity}</span>
                    ${item.isCursed ? '<span class="badge bg-danger ms-1">Cursed</span>' : ''}
                    ${item.effects.length > 0 ? 
                        `<span class="badge bg-warning ms-1">${item.effects.length} effects</span>` : 
                        ''}
                </div>
            </a>
        `).join('');

        this.setupItemListEventListeners();
    }

    showItemDetails(itemId) {
        const item = this.dataManager.appState.loot.find(i => i.id === itemId);
        if (!item) return;

        const itemDetails = document.getElementById('itemDetails');
        itemDetails.innerHTML = `
            <h3>${item.name}</h3>
            <p class="text-muted">Type: ${item.type}</p>
            <div class="mb-3">
                <h5>Description</h5>
                <p>${item.description}</p>
            </div>
            <div class="mb-3">
                <h5>Rarity</h5>
                <p>${item.rarity}</p>
            </div>
            <div class="mb-3">
                <h5>Effects</h5>
                <div>
                    ${item.effects.map(effect => `
                        <span class="badge bg-warning me-1">
                            ${effect}
                            <button class="btn-close btn-close-white" data-effect="${effect}"></button>
                        </span>
                    `).join('')}
                    <button class="btn btn-sm btn-outline-warning" id="addEffectBtn">Add Effect</button>
                </div>
            </div>
            <div class="mb-3">
                <h5>Curses</h5>
                <div>
                    ${item.curseEffects.map(curse => `
                        <span class="badge bg-danger me-1">
                            ${curse}
                            <button class="btn-close btn-close-white" data-curse="${curse}"></button>
                        </span>
                    `).join('')}
                    <button class="btn btn-sm btn-outline-danger" id="addCurseBtn">Add Curse</button>
                </div>
            </div>
            <div class="mb-3">
                <h5>Owner</h5>
                <p>${item.owner || 'None'}</p>
            </div>
            <div class="mb-3">
                <h5>Quest Source</h5>
                <p>${item.questSource || 'None'}</p>
            </div>
            <div class="mt-3">
                <button class="btn btn-primary" id="editItemBtn">Edit Item</button>
            </div>
        `;

        this.setupItemDetailsEventListeners(item);
    }

    setupItemDetailsEventListeners(item) {
        const addEffectBtn = document.getElementById('addEffectBtn');
        if (addEffectBtn) {
            addEffectBtn.addEventListener('click', () => {
                const effect = prompt('Enter effect:');
                if (effect) {
                    this.addEffect(item.id, effect);
                }
            });
        }

        const editItemBtn = document.getElementById('editItemBtn');
        if (editItemBtn) {
            editItemBtn.addEventListener('click', () => {
                this.showEditItemForm(item.id);
            });
        }

        document.querySelectorAll('[data-effect]').forEach(btn => {
            btn.addEventListener('click', () => {
                const effect = btn.dataset.effect;
                item.effects = item.effects.filter(e => e !== effect);
                item.updatedAt = new Date();
                this.dataManager.saveData();
                this.showItemDetails(item.id);
            });
        });
    }

    showNewItemForm() {
        const itemDetails = document.getElementById('itemDetails');
        itemDetails.innerHTML = `
            <form id="newItemForm">
                <div class="mb-3">
                    <label for="name" class="form-label">Name</label>
                    <input type="text" class="form-control" id="name" name="name" required>
                </div>
                <div class="mb-3">
                    <label for="description" class="form-label">Description</label>
                    <textarea class="form-control" id="description" name="description" rows="3" required></textarea>
                </div>
                <div class="mb-3">
                    <label for="type" class="form-label">Type</label>
                    <select class="form-select" id="type" name="type" required>
                        <option value="weapon">Weapon</option>
                        <option value="armor">Armor</option>
                        <option value="potion">Potion</option>
                        <option value="scroll">Scroll</option>
                        <option value="ring">Ring</option>
                        <option value="wand">Wand</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="rarity" class="form-label">Rarity</label>
                    <select class="form-select" id="rarity" name="rarity" required>
                        <option value="common">Common</option>
                        <option value="uncommon">Uncommon</option>
                        <option value="rare">Rare</option>
                        <option value="very_rare">Very Rare</option>
                        <option value="legendary">Legendary</option>
                    </select>
                </div>
                <div class="mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="isCursed" name="isCursed">
                        <label class="form-check-label" for="isCursed">Cursed Item</label>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Create Item</button>
            </form>
        `;

        document.getElementById('newItemForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const item = this.createNewItem(e.target);
            if (item) {
                this.showItemDetails(item.id);
            }
        });
    }

    showEditItemForm(itemId) {
        const item = this.dataManager.appState.loot.find(i => i.id === itemId);
        if (!item) return;

        const itemDetails = document.getElementById('itemDetails');
        itemDetails.innerHTML = `
            <form id="editItemForm">
                <div class="mb-3">
                    <label for="name" class="form-label">Name</label>
                    <input type="text" class="form-control" id="name" name="name" value="${item.name}" required>
                </div>
                <div class="mb-3">
                    <label for="description" class="form-label">Description</label>
                    <textarea class="form-control" id="description" name="description" rows="3" required>${item.description}</textarea>
                </div>
                <div class="mb-3">
                    <label for="type" class="form-label">Type</label>
                    <select class="form-select" id="type" name="type" required>
                        <option value="weapon" ${item.type === 'weapon' ? 'selected' : ''}>Weapon</option>
                        <option value="armor" ${item.type === 'armor' ? 'selected' : ''}>Armor</option>
                        <option value="potion" ${item.type === 'potion' ? 'selected' : ''}>Potion</option>
                        <option value="scroll" ${item.type === 'scroll' ? 'selected' : ''}>Scroll</option>
                        <option value="ring" ${item.type === 'ring' ? 'selected' : ''}>Ring</option>
                        <option value="wand" ${item.type === 'wand' ? 'selected' : ''}>Wand</option>
                        <option value="other" ${item.type === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="rarity" class="form-label">Rarity</label>
                    <select class="form-select" id="rarity" name="rarity" required>
                        <option value="common" ${item.rarity === 'common' ? 'selected' : ''}>Common</option>
                        <option value="uncommon" ${item.rarity === 'uncommon' ? 'selected' : ''}>Uncommon</option>
                        <option value="rare" ${item.rarity === 'rare' ? 'selected' : ''}>Rare</option>
                        <option value="very_rare" ${item.rarity === 'very_rare' ? 'selected' : ''}>Very Rare</option>
                        <option value="legendary" ${item.rarity === 'legendary' ? 'selected' : ''}>Legendary</option>
                    </select>
                </div>
                <div class="mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="isCursed" name="isCursed" ${item.isCursed ? 'checked' : ''}>
                        <label class="form-check-label" for="isCursed">Cursed Item</label>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Update Item</button>
            </form>
        `;

        document.getElementById('editItemForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateItem(itemId, e.target);
            this.showItemDetails(itemId);
        });
    }

    updateItem(itemId, form) {
        const item = this.dataManager.appState.loot.find(i => i.id === itemId);
        if (!item) return;

        const name = this.getFormValue(form, 'name');
        const description = this.getFormValue(form, 'description');
        const type = this.getFormValue(form, 'type');
        const rarity = this.getFormValue(form, 'rarity');
        const isCursed = form.isCursed?.checked || form.isCursed;

        if (!name || !description || !type || !rarity) {
            console.error('Missing required fields');
            return;
        }

        item.name = name;
        item.description = description;
        item.type = type;
        item.rarity = rarity;
        item.isCursed = isCursed;
        item.updatedAt = new Date();

        this.dataManager.saveData();
        this.renderItemList();
    }

    addCurseEffect(itemId, effect) {
        const item = this.dataManager.appState.loot.find(i => i.id === itemId);
        if (!item) return;

        item.addCurseEffect(effect);
        this.dataManager.saveData();
        this.showItemDetails(itemId);
    }

    removeCurseEffect(itemId, effect) {
        const item = this.dataManager.appState.loot.find(i => i.id === itemId);
        if (!item) return;

        item.removeCurseEffect(effect);
        this.dataManager.saveData();
        this.showItemDetails(itemId);
    }

    assignOwner(itemId, owner) {
        const item = this.dataManager.appState.loot.find(i => i.id === itemId);
        if (!item) return;

        item.assignOwner(owner);
        this.dataManager.saveData();
        this.showItemDetails(itemId);
    }

    setQuestSource(itemId, quest) {
        const item = this.dataManager.appState.loot.find(i => i.id === itemId);
        if (!item) return;

        item.setQuestSource(quest);
        this.dataManager.saveData();
        this.showItemDetails(itemId);
    }

    updateItemName(itemId, form) {
        const item = this.dataManager.appState.loot.find(i => i.id === itemId);
        if (!item) return;

        const newName = form.itemName.value;
        if (newName) {
            item.updateName(newName);
            this.dataManager.saveData();
            this.showItemDetails(itemId);
        }
    }

    updateItemDescription(itemId, form) {
        const item = this.dataManager.appState.loot.find(i => i.id === itemId);
        if (!item) return;

        const newDescription = form.itemDescription.value;
        if (newDescription) {
            item.updateDescription(newDescription);
            this.dataManager.saveData();
            this.showItemDetails(itemId);
        }
    }

    updateItemRarity(itemId, form) {
        const item = this.dataManager.appState.loot.find(i => i.id === itemId);
        if (!item) return;

        const newRarity = form.itemRarity.value;
        if (newRarity && Object.values(ItemRarity).includes(newRarity)) {
            item.updateRarity(newRarity);
            this.dataManager.saveData();
            this.showItemDetails(itemId);
        }
    }

    handleTypeFilter(type) {
        const items = type === 'all' 
            ? this.dataManager.appState.loot 
            : this.dataManager.appState.loot.filter(item => item.type === type);
        
        this.renderItemList(items);
    }

    getFormValue(form, fieldName) {
        if (form instanceof HTMLFormElement) {
            const input = form.elements[fieldName];
            return input ? input.value : null;
        }
        return form[fieldName]?.value || form[fieldName];
    }

    getRarityColor(rarity) {
        switch (rarity) {
            case ItemRarity.COMMON: return 'secondary';
            case ItemRarity.UNCOMMON: return 'success';
            case ItemRarity.RARE: return 'primary';
            case ItemRarity.VERY_RARE: return 'info';
            case ItemRarity.LEGENDARY: return 'warning';
            default: return 'secondary';
        }
    }

    setupItemListEventListeners() {
        document.querySelectorAll('[data-item-id]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const itemId = element.dataset.itemId;
                this.showItemDetails(itemId);
            });
        });
    }
} 