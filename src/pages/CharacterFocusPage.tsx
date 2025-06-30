
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import RelationshipMap from '../components/character/RelationshipMap';
import CharacterEvolution from '../components/character/CharacterEvolution';
import RelationshipDetail from '../components/character/RelationshipDetail';
import ConnectionFinder from '../components/character/ConnectionFinder';
import { Character, Relationship, Series } from '../types';

const CharacterFocusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);

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
        
        // Fetch all series for filtering
        const { data: seriesData, error: seriesError } = await supabase
          .from('series')
          .select('*');
        
        if (seriesError) throw seriesError;
        
        setCharacter(characterData);
        setRelationships(relationshipsData);
        setSeries(seriesData);
      } catch (error) {
        console.error('Error fetching character data:', error);
        setError('Failed to load character data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCharacterData();
  }, [id]);

  const getSeriesName = (seriesId: number) => {
    const seriesItem = series.find(s => s.id === seriesId);
    return seriesItem ? seriesItem.name : 'Unknown Series';
  };

  const getSeriesColor = (seriesId: number) => {
    const seriesItem = series.find(s => s.id === seriesId);
    return seriesItem ? seriesItem.color_code : '#999999';
  };

  const handleRelationshipSelect = (relationship: Relationship) => {
    setSelectedRelationship(relationship);
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

  const otherCharacters = relationships.map(rel => {
    if (rel.character1_id === parseInt(id as string)) {
      return rel.character2;
    } else {
      return rel.character1;
    }
  }).filter(Boolean);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link to="/characters" className="text-blue-500 hover:underline">
          ← Back to Character Database
        </Link>
      </div>
      
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-3xl font-bold text-white mb-2">Character Focus: {character.name}</h1>
          <div className="text-gray-300">
            Explore {character.name}'s relationships, evolution, and significance in the Mega Man universe.
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="md:col-span-1">
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <div className="aspect-w-1 aspect-h-1 bg-gray-600 rounded-lg mb-4 flex items-center justify-center">
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
              
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white mb-2">{character.name}</h2>
                {character.alias && (
                  <div className="text-gray-300 text-sm mb-2">
                    Also known as: {character.alias}
                  </div>
                )}
                <div 
                  className="text-sm px-2 py-1 rounded-full inline-block mb-2"
                  style={{ backgroundColor: getSeriesColor(character.series_id) }}
                >
                  {getSeriesName(character.series_id)} Series
                </div>
              </div>
              
              <div className="text-gray-300 mb-4">
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
              
              <div className="text-gray-300">
                {character.description}
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-4">Character Type</h3>
              <div className="space-y-2 text-gray-300">
                {character.is_human && <div>• Human</div>}
                {character.is_robot_master && <div>• Robot Master</div>}
                {character.is_reploid && <div>• Reploid</div>}
                {character.is_maverick && <div>• Maverick</div>}
                {!character.is_human && !character.is_robot_master && !character.is_reploid && !character.is_maverick && (
                  <div>• Other/Unknown</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">Relationship Map</h3>
              <RelationshipMap 
                character={character} 
                relationships={relationships} 
                onSelectRelationship={handleRelationshipSelect}
              />
            </div>
            
            {selectedRelationship && (
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <RelationshipDetail 
                  relationship={selectedRelationship} 
                  focusedCharacterId={parseInt(id as string)}
                  onClose={() => setSelectedRelationship(null)}
                />
              </div>
            )}
            
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">Character Evolution</h3>
              <CharacterEvolution character={character} />
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-4">Connection Finder</h3>
              <ConnectionFinder 
                sourceCharacter={character} 
                allCharacters={otherCharacters}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterFocusPage;