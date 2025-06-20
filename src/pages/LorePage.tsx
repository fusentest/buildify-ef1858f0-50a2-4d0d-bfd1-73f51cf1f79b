
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { loreService } from '../services/loreService';
import { seriesService } from '../services/seriesService';
import { LoreEntry } from '../types';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { formatDate, getTagColor, truncateText } from '../lib/utils';

const LorePage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const seriesParam = searchParams.get('series');
  const tagParam = searchParams.get('tag');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<number | null>(
    seriesParam ? parseInt(seriesParam) : null
  );
  const [selectedTag, setSelectedTag] = useState<string | null>(tagParam);

  // Fetch lore entries
  const { data: loreEntries, isLoading: loreLoading } = useQuery({
    queryKey: ['loreEntries', selectedSeries, selectedTag],
    queryFn: () => loreService.getLoreEntries(
      selectedSeries || undefined,
      selectedTag || undefined
    )
  });

  // Fetch series for filtering
  const { data: allSeries, isLoading: seriesLoading } = useQuery({
    queryKey: ['series'],
    queryFn: seriesService.getAllSeries
  });

  // All possible tags
  const allTags = [
    'Canon',
    'Disputed',
    'Theory',
    'Game Only',
    'Manga Only'
  ];

  // Filter lore entries by search term
  const filteredEntries = loreEntries?.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoading = loreLoading || seriesLoading;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Lore Encyclopedia</h1>
          <p className="text-gray-600">
            Explore the comprehensive lore of the Mega Man universe.
          </p>
        </div>
        
        {user && (
          <Link to="/lore/create">
            <Button variant="megamanBlue">
              Contribute Lore Entry
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Lore
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search by title or content..."
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
          
          {/* Tag filter */}
          <div className="flex-1">
            <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Tag
            </label>
            <select
              id="tag"
              className="w-full p-2 border rounded-md"
              value={selectedTag || ''}
              onChange={(e) => setSelectedTag(e.target.value || null)}
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tag quick filters */}
      <div className="flex flex-wrap gap-2">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedTag === tag 
                ? getTagColor(tag) + ' font-medium' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Lore entries */}
      {isLoading ? (
        <div className="text-center py-8">Loading lore entries...</div>
      ) : filteredEntries && filteredEntries.length > 0 ? (
        <div className="space-y-6">
          {filteredEntries.map(entry => (
            <LoreCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-600">No lore entries found matching your criteria.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchTerm('');
              setSelectedSeries(null);
              setSelectedTag(null);
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

interface LoreCardProps {
  entry: LoreEntry;
}

const LoreCard: React.FC<LoreCardProps> = ({ entry }) => {
  return (
    <Link 
      to={`/lore/${entry.id}`}
      className="block bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow border-t-4"
      style={{ borderColor: entry.series?.color_code }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold">{entry.title}</h3>
          {entry.series && (
            <span 
              className="text-xs px-2 py-1 rounded"
              style={{ 
                backgroundColor: entry.series.color_code,
                color: 'white'
              }}
            >
              {entry.series.name}
            </span>
          )}
        </div>
        
        <div className="mt-2 flex flex-wrap gap-1">
          {entry.tags.map(tag => (
            <span 
              key={tag} 
              className={`text-xs px-2 py-1 rounded ${getTagColor(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
        
        <p className="mt-3 text-gray-700">
          {truncateText(entry.content, 250)}
        </p>
        
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <span>Added {formatDate(entry.created_at)}</span>
          {entry.creator && <span>By {entry.creator.username}</span>}
        </div>
      </div>
    </Link>
  );
};

export default LorePage;