
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Character } from '../../types';

interface ConnectionFinderProps {
  sourceCharacter: Character;
  allCharacters: Character[];
}

interface ConnectionPath {
  path: Character[];
  connections: string[];
  strength: 'Strong' | 'Moderate' | 'Theoretical';
  description: string;
}

const ConnectionFinder: React.FC<ConnectionFinderProps> = ({ 
  sourceCharacter, 
  allCharacters 
}) => {
  const [targetCharacter, setTargetCharacter] = useState<Character | null>(null);
  const [connectionPath, setConnectionPath] = useState<ConnectionPath | null>(null);
  const [loading, setLoading] = useState(false);

  // Popular characters to connect to
  const popularConnections = allCharacters.slice(0, 4);

  const findConnection = async (target: Character) => {
    setLoading(true);
    setTargetCharacter(target);
    
    // Simulate API call to find connection
    setTimeout(() => {
      // This is mock data - in a real implementation, this would come from an algorithm
      // that finds the shortest path between characters
      const mockPath: ConnectionPath = {
        path: [sourceCharacter, ...generateIntermediateNodes(sourceCharacter, target), target],
        connections: generateConnectionTypes(sourceCharacter, target),
        strength: determineConnectionStrength(sourceCharacter, target),
        description: generateConnectionDescription(sourceCharacter, target)
      };
      
      setConnectionPath(mockPath);
      setLoading(false);
    }, 1500);
  };

  // Helper functions to generate mock connection data
  const generateIntermediateNodes = (source: Character, target: Character): Character[] => {
    // This would be replaced by actual path-finding logic
    if (source.series_id === target.series_id) {
      // If same series, direct or one-hop connection
      return allCharacters.filter(c => 
        c.series_id === source.series_id && 
        c.id !== source.id && 
        c.id !== target.id
      ).slice(0, 1);
    } else {
      // If different series, need intermediate connections
      const seriesBridge = allCharacters.find(c => 
        c.series_id !== source.series_id && 
        c.series_id !== target.series_id
      );
      
      const sourceSeries = allCharacters.find(c => 
        c.series_id === source.series_id && 
        c.id !== source.id
      );
      
      const targetSeries = allCharacters.find(c => 
        c.series_id === target.series_id && 
        c.id !== target.id
      );
      
      return [sourceSeries, seriesBridge, targetSeries].filter(Boolean) as Character[];
    }
  };

  const generateConnectionTypes = (source: Character, target: Character): string[] => {
    const types = ['created', 'ally', 'enemy', 'influenced', 'predecessor', 'successor'];
    const result = [];
    
    // Generate random connection types
    for (let i = 0; i < Math.floor(Math.random() * 3) + 2; i++) {
      result.push(types[Math.floor(Math.random() * types.length)]);
    }
    
    return result;
  };

  const determineConnectionStrength = (source: Character, target: Character): 'Strong' | 'Moderate' | 'Theoretical' => {
    // Determine connection strength based on series proximity
    if (source.series_id === target.series_id) {
      return 'Strong';
    } else if (Math.abs(source.series_id - target.series_id) === 1) {
      return 'Moderate';
    } else {
      return 'Theoretical';
    }
  };

  const generateConnectionDescription = (source: Character, target: Character): string => {
    // Generate a description based on the characters and their series
    const descriptions = [
      `${source.name} and ${target.name} are connected through a series of pivotal events spanning the Mega Man timeline.`,
      `The connection between ${source.name} and ${target.name} represents the evolution of the Mega Man universe across different eras.`,
      `Though separated by time, ${source.name} and ${target.name} share a legacy that spans multiple generations of the Mega Man series.`
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  return (
    <div className="connection-finder">
      <div className="mb-6">
        <div className="text-white mb-2">Find how {sourceCharacter.name} connects to:</div>
        <div className="flex flex-wrap items-center">
          <select
            className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 mr-3 mb-2"
            value=""
            onChange={(e) => {
              const selectedId = parseInt(e.target.value);
              const selected = allCharacters.find(c => c.id === selectedId);
              if (selected) {
                setTargetCharacter(selected);
              }
            }}
          >
            <option value="">Select a character...</option>
            {allCharacters.map(character => (
              <option key={character.id} value={character.id}>
                {character.name}
              </option>
            ))}
          </select>
          
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-2"
            onClick={() => targetCharacter && findConnection(targetCharacter)}
            disabled={!targetCharacter || loading}
          >
            {loading ? 'Finding...' : 'Find Connection'}
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-white mb-2">Popular connections:</div>
        <div className="flex flex-wrap">
          {popularConnections.map(character => (
            <button
              key={character.id}
              className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded mr-2 mb-2 text-sm"
              onClick={() => findConnection(character)}
            >
              {character.name}
            </button>
          ))}
        </div>
      </div>
      
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-300 mt-2">Finding connection path...</p>
        </div>
      )}
      
      {connectionPath && !loading && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-bold mb-4">Connection Found</h4>
          
          <div className="mb-4">
            <div className="flex items-center flex-wrap">
              {connectionPath.path.map((character, index) => (
                <React.Fragment key={character.id}>
                  <div className="bg-gray-700 rounded-lg p-2 mb-2">
                    <div className="text-white font-medium">{character.name}</div>
                  </div>
                  
                  {index < connectionPath.path.length - 1 && (
                    <div className="mx-2 text-gray-400 mb-2">
                      ────▶
                      <div className="text-xs text-center">
                        {connectionPath.connections[index] || 'connected to'}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-white font-medium mb-1">Connection Strength:</div>
            <div className="text-gray-300">
              {connectionPath.strength === 'Strong' && '🟢 Strong (Canonical)'}
              {connectionPath.strength === 'Moderate' && '🟡 Moderate (Canonical with some gaps)'}
              {connectionPath.strength === 'Theoretical' && '🟠 Theoretical (Based on fan theories)'}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-white font-medium mb-1">Connection Description:</div>
            <div className="text-gray-300">
              {connectionPath.description}
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded mr-3"
              onClick={() => setConnectionPath(null)}
            >
              Find Another Connection
            </button>
            <Link
              to={`/character-focus/${targetCharacter?.id}`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Focus on {targetCharacter?.name}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionFinder;