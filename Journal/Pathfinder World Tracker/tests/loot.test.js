import { Item, ItemType, ItemRarity, LootManager } from '../scripts/modules/loot.js';
import './test-setup.js';

describe('Item', () => {
    let item;

    beforeEach(() => {
        item = new Item('Test Item', 'A test weapon', ItemType.WEAPON, ItemRarity.COMMON, new Date(), new Date());
    });

    test('should create a new item with correct properties', () => {
        expect(item.name).toBe('Test Item');
        expect(item.type).toBe(ItemType.WEAPON);
        expect(item.description).toBe('A test weapon');
        expect(item.rarity).toBe(ItemRarity.COMMON);
        expect(item.isCursed).toBe(false);
        expect(item.curseEffects).toEqual([]);
        expect(item.owner).toBeNull();
        expect(item.questSource).toBeNull();
        expect(item.createdAt instanceof Date).toBe(true);
        expect(item.updatedAt instanceof Date).toBe(true);
    });

    test('should add curse effect', () => {
        item.addCurseEffect('Causes damage over time');
        expect(item.isCursed).toBe(true);
        expect(item.curseEffects).toContain('Causes damage over time');
    });

    test('should not add duplicate curse effect', () => {
        item.addCurseEffect('Causes damage over time');
        item.addCurseEffect('Causes damage over time');
        expect(item.curseEffects).toHaveLength(1);
    });

    test('should remove curse effect', () => {
        item.addCurseEffect('Causes damage over time');
        item.removeCurseEffect('Causes damage over time');
        expect(item.isCursed).toBe(false);
        expect(item.curseEffects).not.toContain('Causes damage over time');
    });

    test('should assign owner', () => {
        item.assignOwner('Player 1');
        expect(item.owner).toBe('Player 1');
    });

    test('should set quest source', () => {
        item.setQuestSource('Quest 1');
        expect(item.questSource).toBe('Quest 1');
    });

    test('should update name', () => {
        item.updateName('New Name');
        expect(item.name).toBe('New Name');
    });

    test('should update description', () => {
        item.updateDescription('New description');
        expect(item.description).toBe('New description');
    });

    test('should update rarity', () => {
        item.updateRarity(ItemRarity.RARE);
        expect(item.rarity).toBe(ItemRarity.RARE);
    });
});

describe('LootManager', () => {
    let lootManager;
    let mockDataManager;

    beforeEach(() => {
        mockDataManager = new MockDataManager();
        lootManager = new LootManager(mockDataManager);
    });

    test('should initialize loot section', () => {
        const lootSection = document.getElementById('loot');
        expect(lootSection.innerHTML).toContain('Loot &amp; Curses');
        expect(lootSection.innerHTML).toContain('New Item');
    });

    test('should create new item', () => {
        const form = {
            itemName: { value: 'New Item' },
            itemType: { value: ItemType.WEAPON },
            itemDescription: { value: 'A new weapon' },
            itemRarity: { value: ItemRarity.COMMON }
        };

        lootManager.createNewItem(form);
        expect(mockDataManager.appState.loot).toHaveLength(1);
        const item = mockDataManager.appState.loot[0];
        expect(item.name).toBe('New Item');
        expect(item.type).toBe(ItemType.WEAPON);
        expect(item.description).toBe('A new weapon');
        expect(item.rarity).toBe(ItemRarity.COMMON);
    });

    test('should filter items by type', () => {
        const item1 = new Item('Item 1', ItemType.WEAPON, 'A weapon', ItemRarity.COMMON);
        const item2 = new Item('Item 2', ItemType.ARMOR, 'An armor', ItemRarity.COMMON);
        mockDataManager.appState.loot.push(item1, item2);

        lootManager.handleTypeFilter(ItemType.WEAPON);
        const itemList = document.getElementById('itemList');
        expect(itemList.innerHTML).toContain('Item 1');
        expect(itemList.innerHTML).not.toContain('Item 2');
    });

    test('should search items', () => {
        const item1 = new Item('Item 1', ItemType.WEAPON, 'A weapon', ItemRarity.COMMON);
        const item2 = new Item('Item 2', ItemType.WEAPON, 'Another weapon', ItemRarity.COMMON);
        mockDataManager.appState.loot.push(item1, item2);

        lootManager.handleSearch('Item 1');
        const itemList = document.getElementById('itemList');
        expect(itemList.innerHTML).toContain('Item 1');
        expect(itemList.innerHTML).not.toContain('Item 2');
    });

    test('should add curse effect to item', () => {
        const item = new Item('Test Item', ItemType.WEAPON, 'A weapon', ItemRarity.COMMON);
        mockDataManager.appState.loot.push(item);

        lootManager.addCurseEffect(item.id, 'Causes damage over time');
        expect(item.isCursed).toBe(true);
        expect(item.curseEffects).toContain('Causes damage over time');
    });

    test('should assign owner to item', () => {
        const item = new Item('Test Item', ItemType.WEAPON, 'A weapon', ItemRarity.COMMON);
        mockDataManager.appState.loot.push(item);

        lootManager.assignOwner(item.id, 'Player 1');
        expect(item.owner).toBe('Player 1');
    });

    test('should set quest source for item', () => {
        const item = new Item('Test Item', ItemType.WEAPON, 'A weapon', ItemRarity.COMMON);
        mockDataManager.appState.loot.push(item);

        lootManager.setQuestSource(item.id, 'Quest 1');
        expect(item.questSource).toBe('Quest 1');
    });

    test('should update item name', () => {
        const item = new Item('Test Item', ItemType.WEAPON, 'A weapon', ItemRarity.COMMON);
        mockDataManager.appState.loot.push(item);

        const form = {
            itemName: { value: 'New Name' }
        };

        lootManager.updateItemName(item.id, form);
        expect(item.name).toBe('New Name');
    });

    test('should update item description', () => {
        const item = new Item('Test Item', ItemType.WEAPON, 'A weapon', ItemRarity.COMMON);
        mockDataManager.appState.loot.push(item);

        const form = {
            itemDescription: { value: 'New description' }
        };

        lootManager.updateItemDescription(item.id, form);
        expect(item.description).toBe('New description');
    });

    test('should update item rarity', () => {
        const item = new Item('Test Item', ItemType.WEAPON, 'A weapon', ItemRarity.COMMON);
        mockDataManager.appState.loot.push(item);

        const form = {
            itemRarity: { value: ItemRarity.RARE }
        };

        lootManager.updateItemRarity(item.id, form);
        expect(item.rarity).toBe(ItemRarity.RARE);
    });
}); 