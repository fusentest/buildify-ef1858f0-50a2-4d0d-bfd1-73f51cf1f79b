
import React from 'react';
import { Character } from '../../types';

interface CharacterEvolutionProps {
  character: Character;
}

interface EvolutionPhase {
  era: string;
  title: string;
  description: string;
  appearance: string;
  personality: string;
  keyEvents: string[];
}

const CharacterEvolution: React.FC<CharacterEvolutionProps> = ({ character }) => {
  // Generate evolution phases based on character data
  const getEvolutionPhases = (): EvolutionPhase[] => {
    // This is mock data - in a real implementation, this would come from the database
    if (character.name === 'Zero') {
      return [
        {
          era: 'Classic',
          title: 'Creation Era',
          description: 'Created by Dr. Wily as his masterpiece, but sealed away due to instability.',
          appearance: 'Original form, sealed in capsule',
          personality: 'Violent, uncontrollable',
          keyEvents: ['Created by Dr. Wily', 'Sealed away due to instability']
        },
        {
          era: 'X',
          title: 'Maverick Hunter Era',
          description: 'Awakened and reprogrammed, became a Maverick Hunter alongside X.',
          appearance: 'Red armor, long blonde hair, Z-Saber',
          personality: 'Confident, loyal, battle-hardened',
          keyEvents: ['Awakened and went on rampage', 'Defeated by Sigma', 'Reprogrammed by Dr. Cain', 'Fought alongside X', 'Sacrificed during Eurasia incident', 'Returned in new body']
        },
        {
          era: 'Zero',
          title: 'Resistance Hero Era',
          description: 'Awakened by Ciel to help the Resistance against Neo Arcadia.',
          appearance: 'Streamlined red armor, more angular design',
          personality: 'More reflective, determined, protective of humans',
          keyEvents: ['Awakened by Ciel', 'Fought against Copy X', 'Discovered Omega was his original body', 'Sacrificed to destroy Ragnarok and Dr. Weil']
        }
      ];
    } else if (character.name === 'X') {
      return [
        {
          era: 'Classic',
          title: 'Creation Era',
          description: 'Created by Dr. Light as the first robot with true free will.',
          appearance: 'Sealed in capsule for 30 years of ethical testing',
          personality: 'Untested, pure potential',
          keyEvents: ['Created by Dr. Light', 'Sealed away for testing']
        },
        {
          era: 'X',
          title: 'Maverick Hunter Era',
          description: 'Discovered by Dr. Cain and became a Maverick Hunter.',
          appearance: 'Blue armor, X-Buster',
          personality: 'Compassionate, hesitant to fight, grows more confident',
          keyEvents: ['Discovered by Dr. Cain', 'Joined Maverick Hunters', 'Fought against Sigma', 'Partnered with Zero']
        },
        {
          era: 'Zero',
          title: 'Neo Arcadia & Cyber-Elf Era',
          description: 'Founded Neo Arcadia, then became a Cyber-Elf after his body deteriorated.',
          appearance: 'Cyber-Elf form, glowing blue energy',
          personality: 'Wise, protective, sacrificial',
          keyEvents: ['Founded Neo Arcadia', 'Sealed Dark Elf with his body', 'Became a Cyber-Elf', 'Guided Zero', 'Disappeared after helping defeat Omega']
        }
      ];
    } else if (character.name === 'Mega Man') {
      return [
        {
          era: 'Classic',
          title: 'Hero Era',
          description: 'Converted from Rock to Mega Man to stop Dr. Wily.',
          appearance: 'Blue armor, Mega Buster',
          personality: 'Heroic, determined, kind-hearted',
          keyEvents: ['Converted from Rock to Mega Man', 'Defeated Dr. Wily multiple times', 'Gained various weapons and abilities']
        }
      ];
    } else {
      // Generic evolution for other characters
      return [
        {
          era: character.series?.name || 'Unknown',
          title: 'Main Appearance',
          description: character.description || 'No detailed evolution information available.',
          appearance: 'See character portrait',
          personality: 'See character description',
          keyEvents: [character.first_appearance || 'First appearance']
        }
      ];
    }
  };

  const evolutionPhases = getEvolutionPhases();

  return (
    <div className="character-evolution">
      <div className="flex items-center mb-6 overflow-x-auto pb-2">
        {evolutionPhases.map((phase, index) => (
          <React.Fragment key={index}>
            <div className="flex-shrink-0 text-center">
              <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="text-white font-bold">{phase.era}</div>
              </div>
              <div className="text-sm text-white">{phase.title}</div>
            </div>
            
            {index < evolutionPhases.length - 1 && (
              <div className="flex-shrink-0 mx-2 text-gray-400">
                ────▶
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      
      <div className="space-y-6">
        {evolutionPhases.map((phase, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-bold mb-2">
              {phase.era} Era: {phase.title}
            </h4>
            
            <p className="text-gray-300 mb-4">
              {phase.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-white font-medium mb-1">Appearance</div>
                <div className="text-gray-300 text-sm">{phase.appearance}</div>
              </div>
              
              <div>
                <div className="text-white font-medium mb-1">Personality</div>
                <div className="text-gray-300 text-sm">{phase.personality}</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="text-white font-medium mb-1">Key Events</div>
              <ul className="text-gray-300 text-sm list-disc pl-5">
                {phase.keyEvents.map((event, eventIndex) => (
                  <li key={eventIndex}>{event}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterEvolution;