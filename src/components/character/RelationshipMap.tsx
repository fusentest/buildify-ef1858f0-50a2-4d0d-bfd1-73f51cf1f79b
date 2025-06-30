
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Character, Relationship } from '../../types';

interface RelationshipMapProps {
  character: Character;
  relationships: Relationship[];
  onSelectRelationship: (relationship: Relationship) => void;
}

interface RelationshipGroup {
  type: string;
  relationships: Relationship[];
}

const RelationshipMap: React.FC<RelationshipMapProps> = ({ 
  character, 
  relationships,
  onSelectRelationship
}) => {
  const [relationshipGroups, setRelationshipGroups] = useState<RelationshipGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  useEffect(() => {
    // Group relationships by type
    const groups: Record<string, Relationship[]> = {};
    
    relationships.forEach(rel => {
      const type = rel.relationship_type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(rel);
    });
    
    // Convert to array for rendering
    const groupsArray = Object.entries(groups).map(([type, rels]) => ({
      type,
      relationships: rels
    }));
    
    setRelationshipGroups(groupsArray);
    
    // Initially expand all groups if there are few relationships
    if (relationships.length <= 10) {
      setExpandedGroups(groupsArray.map(g => g.type));
    }
  }, [relationships]);

  const toggleGroup = (type: string) => {
    setExpandedGroups(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const getRelationshipColor = (type: string) => {
    const colors: Record<string, string> = {
      'creator': '#4CAF50',
      'creation': '#4CAF50',
      'ally': '#2196F3',
      'enemy': '#F44336',
      'sibling': '#9C27B0',
      'rival': '#FF9800',
      'complex': '#607D8B',
      'original': '#00BCD4',
      'predecessor': '#3F51B5',
    };
    
    return colors[type.toLowerCase()] || '#607D8B';
  };

  const getOtherCharacter = (rel: Relationship) => {
    if (rel.character1_id === character.id) {
      return rel.character2;
    } else {
      return rel.character1;
    }
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className="relationship-map">
      <div className="flex justify-center mb-6">
        <div className="bg-gray-600 rounded-lg p-3 text-white text-center w-40">
          <div className="font-bold">{character.name}</div>
          <div className="text-xs text-gray-300">Focus Character</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        {relationshipGroups.map(group => (
          <div 
            key={group.type}
            className="bg-gray-600 rounded-lg overflow-hidden"
          >
            <div 
              className="p-3 cursor-pointer flex justify-between items-center"
              style={{ backgroundColor: getRelationshipColor(group.type) }}
              onClick={() => toggleGroup(group.type)}
            >
              <div className="font-bold text-white">
                {capitalizeFirstLetter(group.type)}s ({group.relationships.length})
              </div>
              <div className="text-white">
                {expandedGroups.includes(group.type) ? '▼' : '►'}
              </div>
            </div>
            
            {expandedGroups.includes(group.type) && (
              <div className="p-3">
                {group.relationships.map(rel => {
                  const otherCharacter = getOtherCharacter(rel);
                  return (
                    <div 
                      key={rel.id} 
                      className="mb-2 last:mb-0 bg-gray-700 rounded p-2 hover:bg-gray-800 cursor-pointer"
                      onClick={() => onSelectRelationship(rel)}
                    >
                      <div className="font-medium text-white">{otherCharacter.name}</div>
                      <div className="text-xs text-gray-300 mt-1">
                        {rel.description ? (
                          <span>{rel.description.substring(0, 60)}...</span>
                        ) : (
                          <span>{character.name} is {group.type.toLowerCase()} of {otherCharacter.name}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex justify-center space-x-4">
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
          onClick={() => setExpandedGroups(relationshipGroups.map(g => g.type))}
        >
          Expand All
        </button>
        <button 
          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
          onClick={() => setExpandedGroups([])}
        >
          Collapse All
        </button>
      </div>
    </div>
  );
};

export default RelationshipMap;