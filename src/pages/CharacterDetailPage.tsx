
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Character, Relationship } from '../types';

const CharacterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacterData = async () => {
      try {
        setLoading(true);
        
        // Fetch character data
        const { data: characterData, error: characterError } = await supabase
          .from('characters')
          .select('*, series(*)')
          .eq('id', id)
          .single();
        
        if (characterError) throw characterError;
        
        // Fetch relationships where this character is involved
        const { data: relationshipsData, error: relationshipsError } = await supabase
          .from('relationships')
          .select('*, character1:characters!relationships_character1_id_fkey(*), character2:characters!relationships_character2_id_fkey(*)')
          .or(`character1_id.eq.${id},character2_id.eq.${id}`);
        
        if (relationshipsError) throw relationshipsError;
        
        setCharacter(characterData);
        setRelationships(relationshipsData);
      } catch (error) {
        console.error('Error fetching character data:', error);
        setError('Failed to load character data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCharacterData();
  }, [id]);

  const getOtherCharacter = (relationship: Relationship) => {
    if (relationship.character1_id.toString() === id) {
      return relationship.character2;
    } else {
      return relationship.character1;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading character data...</p>
        </div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Character not found'}</p>
          <Link to="/characters" className="text-blue-500 hover:underline mt-2 inline-block">
            Return to Character Database
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link to="/characters" className="text-blue-500 hover:underline">
          ← Back to Character Database
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-1/3 bg-gray-100 p-6">
            <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              {character.portrait_url ? (
                <img 
                  src={character.portrait_url} 
                  alt={character.name} 
                  className="object-cover rounded-lg"
                />
              ) : (
                <div className="text-gray-400 text-center p-8">
                  No portrait available
                </div>
              )}
            </div>
            
            <h1 className="text-2xl font-bold mb-2">{character.name}</h1>
            {character.alias && (
              <div className="text-gray-600 mb-2">
                Also known as: {character.alias}
              </div>
            )}
            
            <div className="mb-4">
              <span 
                className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                style={{ 
                  backgroundColor: character.series?.color_code || '#999',
                  color: 'white'
                }}
              >
                {character.series?.name || 'Unknown'} Series
              </span>
            </div>
            
            <div className="mb-4">
              <div className="mb-2">
                <span className="font-semibold">First Appearance:</span> {character.first_appearance}
              </div>
              {character.created_by && (
                <div className="mb-2">
                  <span className="font-semibold">Created by:</span> {character.created_by}
                </div>
              )}
              {character.status && (
                <div className="mb-2">
                  <span className="font-semibold">Status:</span> {character.status}
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Character Type</h3>
              <ul className="list-disc pl-5">
                {character.is_human && <li>Human</li>}
                {character.is_robot_master && <li>Robot Master</li>}
                {character.is_reploid && <li>Reploid</li>}
                {character.is_maverick && <li>Maverick</li>}
                {!character.is_human && !character.is_robot_master && !character.is_reploid && !character.is_maverick && (
                  <li>Other/Unknown</li>
                )}
              </ul>
            </div>
            
            <Link 
              to={`/character-focus/${character.id}`}
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2 px-4 rounded"
            >
              View Character Focus
            </Link>
          </div>
          
          <div className="md:w-2/3 p-6">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <div className="mb-6">
              {character.description || 'No description available.'}
            </div>
            
            <h2 className="text-xl font-bold mb-4">Relationships</h2>
            {relationships.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relationships.map(relationship => {
                  const otherCharacter = getOtherCharacter(relationship);
                  return (
                    <div key={relationship.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link 
                            to={`/characters/${otherCharacter.id}`}
                            className="font-semibold text-blue-500 hover:underline"
                          >
                            {otherCharacter.name}
                          </Link>
                          <div className="text-sm text-gray-600">
                            {relationship.relationship_type}
                          </div>
                        </div>
                        <span 
                          className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                          style={{ 
                            backgroundColor: otherCharacter.series?.color_code || '#999',
                            color: 'white'
                          }}
                        >
                          {otherCharacter.series?.name || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {relationship.description || `${character.name} is ${relationship.relationship_type} of ${otherCharacter.name}.`}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600">No known relationships.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetailPage;