import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Npc, NpcFilters, Race } from './types';
import { Plus, Search } from 'lucide-react';
import { npcService } from './npcService';

interface NpcFormData {
  name: string;
  description: string;
  race: string;
  level: number;
  isAlive: boolean;
  type?: string;
  gender?: string;
  relationships?: Record<string, string>;
}

interface NpcCardProps {
  npc: Npc;
  onEdit: (npc: Npc) => void;
  onDelete: (id: string) => void;
}

const NpcCard: React.FC<NpcCardProps> = ({ npc, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsExpanded(prev => !prev);
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onEdit(npc);
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete(npc.id);
  };

  return (
    <div className="relative mb-4">
      <div 
        className="bg-gray-800 rounded-lg p-4 shadow-md cursor-pointer transition-all hover:shadow-lg text-gray-100 relative overflow-hidden"
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-white">{npc.name || 'Unnamed NPC'}</h3>
          <div className="flex space-x-2">
            <button 
              className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              onClick={handleEditClick}
            >
              Edit
            </button>
            <button 
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              onClick={handleDeleteClick}
            >
              Delete
            </button>
          </div>
        </div>
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-gray-200">{npc.description || 'No description available'}</p>
            {npc.race && (
              <p className="mt-2 text-sm text-gray-300">
                <span className="font-medium text-gray-100">Race:</span> {npc.race}
              </p>
            )}
            {npc.occupation && (
              <p className="text-sm text-gray-300">
                <span className="font-medium text-gray-100">Occupation:</span> {npc.occupation}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Npcs = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNpc, setEditingNpc] = useState<Npc | null>(null);
  const [formData, setFormData] = useState<NpcFormData>({
    name: '',
    description: '',
    race: 'Human',
    level: 1,
    isAlive: true,
    gender: 'unknown',
    type: 'npc',
    relationships: {}
  });

  // Fetch NPCs with error handling and loading states
  const { data: npcs = [], isLoading, error } = useQuery<Npc[]>({
    queryKey: ['npcs', searchTerm],
    queryFn: () => {
      try {
        const filters: NpcFilters = {};
        if (searchTerm) filters.search = searchTerm;
        const result = npcService.getNpcs(filters);
        console.log('Fetched NPCs:', result);
        return result;
      } catch (err) {
        console.error('Error fetching NPCs:', err);
        throw err;
      }
    },
  });

  // Debug: Log the current state
  React.useEffect(() => {
    console.log('NPCs state:', { npcs, isLoading, error });
  }, [npcs, isLoading, error]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter NPCs based on search term
  const filteredNpcs = useMemo(() => {
    if (!searchTerm) return npcs || [];
    const term = searchTerm.toLowerCase();
    return (npcs || []).filter(npc => 
      (npc.name?.toLowerCase().includes(term) ||
      npc.description?.toLowerCase().includes(term) ||
      npc.race?.toLowerCase().includes(term))
    );
  }, [npcs, searchTerm]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const npcData: Npc = {
        ...formData,
        id: editingNpc?.id || '',
        type: 'npc' as const, // Ensure type is always 'npc'
        race: formData.race as Race, // Cast to Race type
        gender: formData.gender || 'unknown', // Ensure gender is always defined
        relationships: formData.relationships || {}, // Ensure relationships is always defined
        createdAt: editingNpc?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingNpc?.id) {
        await npcService.updateNpc(editingNpc.id, npcData);
      } else {
        await npcService.createNpc(npcData);
      }
      
      queryClient.invalidateQueries({ queryKey: ['npcs'] });
      setIsFormOpen(false);
      setEditingNpc(null);
      setFormData({
        name: '',
        description: '',
        race: 'Human',
        level: 1,
        isAlive: true,
        gender: 'unknown',
        type: 'npc',
        relationships: {}
      });
    } catch (error) {
      console.error('Error saving NPC:', error);
    }
  };

  // Handle editing an NPC
  const handleEditNpc = (npc: Npc) => {
    setEditingNpc(npc);
    setFormData({
      name: npc.name,
      description: npc.description || '',
      race: npc.race,
      level: npc.level || 1,
      isAlive: npc.isAlive ?? true,
      gender: npc.gender || 'unknown',
      type: npc.type || 'npc',
      relationships: npc.relationships || {}
    });
    setIsFormOpen(true);
  };

  // Handle deleting an NPC
  const handleDeleteNpc = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this NPC?')) {
      try {
        await npcService.deleteNpc(id);
        queryClient.invalidateQueries({ queryKey: ['npcs'] });
      } catch (error) {
        console.error('Error deleting NPC:', error);
      }
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error loading NPCs: </strong>
          <span className="block sm:inline">{(error as Error).message || 'Unknown error occurred'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto relative z-0">
      <div className="relative z-10 flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">NPCs</h1>
        <button
          onClick={() => {
            setEditingNpc(null);
            setFormData({
              name: '',
              description: '',
              race: 'Human',
              level: 1,
              isAlive: true,
              gender: 'unknown',
              type: 'npc',
              relationships: {}
            });
            setIsFormOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Add NPC
        </button>
      </div>

      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search NPCs..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNpcs.length > 0 ? (
          filteredNpcs.map((npc: Npc) => (
            <NpcCard
              key={npc.id}
              npc={npc}
              onEdit={handleEditNpc}
              onDelete={handleDeleteNpc}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-400">
            {searchTerm ? 'No NPCs match your search' : 'No NPCs found. Create one to get started!'}
          </div>
        )}
      </div>

      {/* NPC Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingNpc ? 'Edit NPC' : 'Create New NPC'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Race</label>
                  <select
                    name="race"
                    value={formData.race}
                    onChange={(e) => setFormData(prev => ({ ...prev, race: e.target.value as Race }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Human">Human</option>
                    <option value="Elf">Elf</option>
                    <option value="Dwarf">Dwarf</option>
                    <option value="Halfling">Halfling</option>
                    <option value="Dragonborn">Dragonborn</option>
                    <option value="Gnome">Gnome</option>
                    <option value="Half-Elf">Half-Elf</option>
                    <option value="Half-Orc">Half-Orc</option>
                    <option value="Tiefling">Tiefling</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Level</label>
                  <input
                    type="number"
                    name="level"
                    min="1"
                    max="20"
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value, 10) }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="isAlive"
                  name="isAlive"
                  checked={formData.isAlive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAlive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isAlive" className="ml-2 text-sm text-gray-300">
                  Is Alive
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingNpc(null);
                  }}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {editingNpc ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Remove the default export and use a named export instead
export { Npcs };
