
import React from 'react';
import { Link } from 'react-router-dom';
import { Relationship } from '../../types';

interface RelationshipDetailProps {
  relationship: Relationship;
  focusedCharacterId: number;
  onClose: () => void;
}

const RelationshipDetail: React.FC<RelationshipDetailProps> = ({ 
  relationship, 
  focusedCharacterId,
  onClose
}) => {
  const otherCharacter = relationship.character1_id === focusedCharacterId 
    ? relationship.character2 
    : relationship.character1;

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
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

  // Mock key moments for the relationship
  const getKeyMoments = () => {
    const keyMomentsByType: Record<string, any[]> = {
      'ally': [
        {
          title: 'First Meeting',
          description: 'When these characters first met and formed their alliance.'
        },
        {
          title: 'Fighting Together',
          description: 'Notable battles where these characters fought side by side.'
        }
      ],
      'enemy': [
        {
          title: 'First Confrontation',
          description: 'The first time these characters faced each other in battle.'
        },
        {
          title: 'Major Conflicts',
          description: 'Significant battles between these characters.'
        }
      ],
      'creator': [
        {
          title: 'Creation Process',
          description: 'Details about how and why this character was created.'
        },
        {
          title: 'First Activation',
          description: 'When this character was first activated or brought online.'
        }
      ],
      'sibling': [
        {
          title: 'Shared Origins',
          description: 'How these characters are related as siblings.'
        },
        {
          title: 'Sibling Interactions',
          description: 'Notable interactions between these sibling characters.'
        }
      ]
    };
    
    return keyMomentsByType[relationship.relationship_type.toLowerCase()] || [
      {
        title: 'Relationship Formation',
        description: 'How this relationship was established.'
      },
      {
        title: 'Key Interactions',
        description: 'Notable interactions between these characters.'
      }
    ];
  };

  const keyMoments = getKeyMoments();

  return (
    <div className="relationship-detail">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">
          Relationship Detail
        </h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="flex justify-center items-center mb-6">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center">
            {relationship.character1.portrait_url ? (
              <img 
                src={relationship.character1.portrait_url} 
                alt={relationship.character1.name} 
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="text-2xl font-bold text-white">
                {relationship.character1.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="text-sm text-white">{relationship.character1.name}</div>
        </div>
        
        <div 
          className="px-3 py-1 mx-2 rounded text-white text-sm"
          style={{ backgroundColor: getRelationshipColor(relationship.relationship_type) }}
        >
          {capitalizeFirstLetter(relationship.relationship_type)}
        </div>
        
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center">
            {relationship.character2.portrait_url ? (
              <img 
                src={relationship.character2.portrait_url} 
                alt={relationship.character2.name} 
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="text-2xl font-bold text-white">
                {relationship.character2.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="text-sm text-white">{relationship.character2.name}</div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h4 className="font-bold text-white mb-2">Relationship Overview</h4>
        <p className="text-gray-300">
          {relationship.description || `This ${relationship.relationship_type} relationship connects ${relationship.character1.name} and ${relationship.character2.name}.`}
        </p>
      </div>
      
      <div className="mb-6">
        <h4 className="font-bold text-white mb-3">Key Moments</h4>
        <div className="space-y-4">
          {keyMoments.map((moment, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-3">
              <div className="font-medium text-white mb-1">{moment.title}</div>
              <div className="text-sm text-gray-300">{moment.description}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center">
        <Link 
          to={`/characters/${otherCharacter.id}`}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-3"
        >
          View {otherCharacter.name}'s Profile
        </Link>
        <Link 
          to={`/character-focus/${otherCharacter.id}`}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
        >
          Switch Focus to {otherCharacter.name}
        </Link>
      </div>
    </div>
  );
};

export default RelationshipDetail;