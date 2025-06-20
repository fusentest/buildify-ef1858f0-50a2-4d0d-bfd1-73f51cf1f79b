
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { characterService } from '../services/characterService';
import { seriesService } from '../services/seriesService';
import { Character } from '../types';
import { Button } from '../components/ui/Button';

const CharactersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const seriesParam = searchParams.get('series');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<number | null>(
    seriesParam ? parseInt(seriesParam) : null
  );
  const [filter, setFilter] = useState<string>('all');

  // Fetch characters
  const { data: characters, isLoading: charactersLoading } = useQuery({
    queryKey: ['characters', selectedSeries],
    queryFn: () => characterService.getAllCharacters(selectedSeries || undefined)
  });

  // Fetch series for filtering
  const { data: allSeries, isLoading: seriesLoading } = useQuery({
    queryKey: ['series'],
    queryFn: seriesService.getAllSeries
  });

  // Filter and search characters
  const filteredCharacters = characters?.filter(character => {
    // Apply search term filter
    const matchesSearch = 
      character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (character.alias && character.alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (character.description && character.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply character type filter
    let matchesFilter = true;
    if (filter === 'robot-masters') {
      matchesFilter = character.is_robot_master;
    } else if (filter === 'humans') {
      matchesFilter = character.is_human;
    } else if (filter === 'reploids') {
      matchesFilter = character.is_reploid;
    } else if (filter === 'mavericks') {
      matchesFilter = character.is_maverick;
    }
    
    return matchesSearch && matchesFilter;
  });

  const isLoading = charactersLoading || seriesLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Character Database</h1>
        <p className="text-gray-600">
          Explore all characters from across the Mega Man universe.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Characters
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search by name, alias, or description..."
            className="w-full p-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Series filter */}
          <div className="flex-1">
            <label htmlFor="series" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Series
            </label>
            <select
              id="series"
              className="w-full p-2 border rounded-md"
              value={selectedSeries || ''}
              onChange={(e) => setSelectedSeries(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">All Series</option>
              {allSeries?.map(series => (
                <option key={series.id} value={series.id}>
                  {series.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Character type filter */}
          <div className="flex-1">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Type
            </label>
            <select
              id="type"
              className="w-full p-2 border rounded-md"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="robot-masters">Robot Masters</option>
              <option value="reploids">Reploids</option>
              <option value="humans">Humans</option>
              <option value="mavericks">Mavericks</option>
            </select>
          </div>
        </div>
      </div>

      {/* Character grid */}
      {isLoading ? (
        <div className="text-center py-8">Loading characters...</div>
      ) : filteredCharacters && filteredCharacters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCharacters.map(character => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-600">No characters found matching your criteria.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchTerm('');
              setSelectedSeries(null);
              setFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

interface CharacterCardProps {
  character: Character;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character }) => {
  return (
    <Link 
      to={`/characters/${character.id}`}
      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow border-t-4"
      style={{ borderColor: character.series?.color_code }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{character.name}</h3>
          {character.series && (
            <span 
              className="text-xs px-2 py-1 rounded"
              style={{ 
                backgroundColor: character.series.color_code,
                color: 'white'
              }}
            >
              {character.series.name}
            </span>
          )}
        </div>
        
        {character.alias && (
          <p className="text-sm text-gray-500">Also known as: {character.alias}</p>
        )}
        
        {character.description && (
          <p className="mt-2 text-sm text-gray-700 line-clamp-3">
            {character.description}
          </p>
        )}
        
        <div className="mt-3 flex flex-wrap gap-1">
          {character.is_robot_master && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Robot Master
            </span>
          )}
          {character.is_reploid && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              Reploid
            </span>
          )}
          {character.is_human && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Human
            </span>
          )}
          {character.is_maverick && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              Maverick
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CharactersPage;