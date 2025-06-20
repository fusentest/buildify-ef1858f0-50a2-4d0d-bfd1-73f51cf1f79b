
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { seriesService } from '../services/seriesService';
import { Character } from '../types';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';

const CharactersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const seriesParam = searchParams.get('series');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<number | null>(
    seriesParam ? parseInt(seriesParam) : null
  );
  const [filter, setFilter] = useState<string>('all');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter form state
  const [formSearchTerm, setFormSearchTerm] = useState(searchTerm);
  const [formSelectedSeries, setFormSelectedSeries] = useState<number | null>(selectedSeries);
  const [formFilter, setFormFilter] = useState<string>(filter);

  // Fetch series for filtering
  const { data: allSeries, isLoading: seriesLoading } = useQuery({
    queryKey: ['series'],
    queryFn: seriesService.getAllSeries
  });

  // Fetch characters directly from Supabase
  useEffect(() => {
    const fetchCharacters = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('characters')
          .select(`
            *,
            series:series_id(id, name, color_code)
          `);
        
        // We don't filter by series here - we'll get all characters and filter client-side
        const { data, error } = await query.order('name');
        
        if (error) {
          throw error;
        }
        
        setCharacters(data || []);
      } catch (error) {
        console.error('Error fetching characters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []); // Remove selectedSeries dependency to always fetch all characters

  // Initialize form values from current filters
  useEffect(() => {
    setFormSearchTerm(searchTerm);
    setFormSelectedSeries(selectedSeries);
    setFormFilter(filter);
  }, [searchTerm, selectedSeries, filter]);

  // Filter and search characters
  const filteredCharacters = characters?.filter(character => {
    // Apply search term filter
    const matchesSearch = 
      character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (character.alias && character.alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (character.description && character.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply series filter
    const matchesSeries = selectedSeries ? character.series_id === selectedSeries : true;
    
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
    
    return matchesSearch && matchesSeries && matchesFilter;
  });

  const handleApplyFilters = () => {
    setSearchTerm(formSearchTerm);
    setSelectedSeries(formSelectedSeries);
    setFilter(formFilter);
    
    // Update URL with filters
    const params = new URLSearchParams();
    if (formSelectedSeries) {
      params.set('series', formSelectedSeries.toString());
    }
    if (formFilter !== 'all') {
      params.set('type', formFilter);
    }
    if (formSearchTerm) {
      params.set('search', formSearchTerm);
    }
    
    navigate({ search: params.toString() });
  };

  const handleClearFilters = () => {
    setFormSearchTerm('');
    setFormSelectedSeries(null);
    setFormFilter('all');
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedSeries(null);
    setFilter('all');
    setFormSearchTerm('');
    setFormSelectedSeries(null);
    setFormFilter('all');
    navigate('/characters');
  };

  const isLoading = loading || seriesLoading;

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
            value={formSearchTerm}
            onChange={(e) => setFormSearchTerm(e.target.value)}
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
              value={formSelectedSeries || ''}
              onChange={(e) => setFormSelectedSeries(e.target.value ? parseInt(e.target.value) : null)}
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
              value={formFilter}
              onChange={(e) => setFormFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="robot-masters">Robot Masters</option>
              <option value="reploids">Reploids</option>
              <option value="humans">Humans</option>
              <option value="mavericks">Mavericks</option>
            </select>
          </div>
        </div>
        
        {/* Filter action buttons */}
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
          <Button 
            variant="megamanBlue" 
            onClick={handleApplyFilters}
          >
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Filter tags display */}
      {(searchTerm || selectedSeries || filter !== 'all') && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700">Active filters:</span>
          
          {searchTerm && (
            <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center">
              Search: {searchTerm}
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFormSearchTerm('');
                }}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                &times;
              </button>
            </span>
          )}
          
          {selectedSeries && allSeries && (
            <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full flex items-center">
              Series: {allSeries.find(s => s.id === selectedSeries)?.name}
              <button 
                onClick={() => {
                  setSelectedSeries(null);
                  setFormSelectedSeries(null);
                }}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                &times;
              </button>
            </span>
          )}
          
          {filter !== 'all' && (
            <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full flex items-center">
              Type: {filter.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              <button 
                onClick={() => {
                  setFilter('all');
                  setFormFilter('all');
                }}
                className="ml-2 text-purple-600 hover:text-purple-800"
              >
                &times;
              </button>
            </span>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClearAllFilters}
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Character count */}
      <div className="text-sm text-gray-600">
        {!isLoading && (
          <p>Showing {filteredCharacters?.length || 0} characters</p>
        )}
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
            onClick={handleClearAllFilters}
          >
            Clear All Filters
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