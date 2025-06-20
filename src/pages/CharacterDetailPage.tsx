
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { characterService } from '../services/characterService';
import { Button } from '../components/ui/Button';
import { getRelationshipColor, getTagColor } from '../lib/utils';

const CharacterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: character, isLoading } = useQuery({
    queryKey: ['character', id],
    queryFn: () => characterService.getCharacter(parseInt(id!)),
    enabled: !!id
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading character data...</div>;
  }

  if (!character) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Character Not Found</h2>
        <p className="mb-4">The character you're looking for doesn't exist or has been removed.</p>
        <Link to="/characters">
          <Button variant="outline">Back to Characters</Button>
        </Link>
      </div>
    );
  }

  // Group relationships by type
  const relationshipsByType: Record<string, typeof character.relationships> = {};
  character.relationships.forEach(rel => {
    if (!relationshipsByType[rel.relationshipType]) {
      relationshipsByType[rel.relationshipType] = [];
    }
    relationshipsByType[rel.relationshipType].push(rel);
  });

  return (
    <div className="space-y-8">
      {/* Character header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border-t-4" style={{ borderColor: character.series?.color_code }}>
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{character.name}</h1>
              {character.alias && (
                <p className="text-gray-600">Also known as: {character.alias}</p>
              )}
            </div>
            
            {character.series && (
              <span 
                className="px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: character.series.color_code }}
              >
                {character.series.name} Series
              </span>
            )}
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {character.description && (
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2">Description</h2>
                  <p className="text-gray-700">{character.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {character.created_by && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Created By</h3>
                    <p>{character.created_by}</p>
                  </div>
                )}
                
                {character.first_appearance && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">First Appearance</h3>
                    <p>{character.first_appearance}</p>
                  </div>
                )}
                
                {character.status && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p>{character.status}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {character.is_robot_master && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    Robot Master
                  </span>
                )}
                {character.is_reploid && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    Reploid
                  </span>
                )}
                {character.is_human && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                    Human
                  </span>
                )}
                {character.is_maverick && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                    Maverick
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex justify-center items-center">
              {character.portrait_url ? (
                <img 
                  src={character.portrait_url} 
                  alt={character.name} 
                  className="max-h-64 rounded-lg shadow"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Relationships */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Relationships</h2>
        
        {Object.keys(relationshipsByType).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(relationshipsByType).map(([type, relationships]) => (
              <div key={type}>
                <h3 className="text-lg font-medium mb-3 capitalize">{type}s</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {relationships.map(rel => (
                    <Link 
                      key={rel.id} 
                      to={`/characters/${rel.character.id}`}
                      className="flex items-start p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{rel.character.name}</span>
                          <span 
                            className={`text-xs px-2 py-0.5 rounded-full ${getRelationshipColor(type)}`}
                          >
                            {rel.direction === 'incoming' ? 'is' : 'has'} {type}
                          </span>
                        </div>
                        {rel.description && (
                          <p className="text-sm text-gray-600 mt-1">{rel.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No relationships recorded for this character.</p>
        )}
      </div>

      {/* Lore Entries */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Lore Entries</h2>
        
        {character.loreEntries && character.loreEntries.length > 0 ? (
          <div className="space-y-4">
            {character.loreEntries.map(entry => (
              <Link 
                key={entry.id} 
                to={`/lore/${entry.id}`}
                className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium">{entry.title}</h3>
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
                
                <p className="mt-2 text-gray-700 line-clamp-2">{entry.content}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No lore entries found for this character.</p>
        )}
      </div>

      {/* Timeline appearances */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Timeline Appearances</h2>
          <Link to={`/timeline?character=${character.id}`}>
            <Button variant="outline">View in Timeline</Button>
          </Link>
        </div>
        
        <p className="text-gray-600">
          View this character's appearances and key events in the timeline explorer.
        </p>
      </div>
    </div>
  );
};

export default CharacterDetailPage;