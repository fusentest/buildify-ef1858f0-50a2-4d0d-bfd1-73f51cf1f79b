
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { loreService } from '../services/loreService';
import { seriesService } from '../services/seriesService';
import { characterService } from '../services/characterService';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const CreateLorePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [seriesId, setSeriesId] = useState<number | ''>('');
  const [tags, setTags] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>(['']);
  const [characterIds, setCharacterIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch series for dropdown
  const { data: allSeries } = useQuery({
    queryKey: ['series'],
    queryFn: seriesService.getAllSeries
  });

  // Fetch characters for selection
  const { data: characters } = useQuery({
    queryKey: ['characters'],
    queryFn: () => characterService.getAllCharacters()
  });

  const createLoreMutation = useMutation({
    mutationFn: (data: { 
      title: string; 
      content: string; 
      seriesId: number; 
      tags: string[];
      sources: string[];
      creatorId: string;
      characterIds: number[];
    }) => loreService.createLoreEntry(
      data.title,
      data.content,
      data.seriesId,
      data.tags,
      data.sources.filter(s => s.trim()),
      data.creatorId,
      data.characterIds
    ),
    onSuccess: () => {
      navigate('/lore');
    }
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (!seriesId) {
      newErrors.seriesId = 'Series is required';
    }
    
    if (tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/signin');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    createLoreMutation.mutate({
      title,
      content,
      seriesId: seriesId as number,
      tags,
      sources,
      creatorId: user.id,
      characterIds
    });
  };

  const handleTagToggle = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const handleCharacterToggle = (characterId: number) => {
    setCharacterIds(prev => 
      prev.includes(characterId) 
        ? prev.filter(id => id !== characterId) 
        : [...prev, characterId]
    );
  };

  const handleAddSource = () => {
    setSources(prev => [...prev, '']);
  };

  const handleSourceChange = (index: number, value: string) => {
    setSources(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleRemoveSource = (index: number) => {
    setSources(prev => prev.filter((_, i) => i !== index));
  };

  // All possible tags
  const allTags = [
    'Canon',
    'Disputed',
    'Theory',
    'Game Only',
    'Manga Only'
  ];

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
        <p className="mb-4">You need to be signed in to contribute lore entries.</p>
        <Link to="/signin">
          <Button variant="outline">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contribute Lore Entry</h1>
        <p className="text-gray-600">
          Share your knowledge about the Mega Man universe with the community.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              placeholder="E.g., 'The Origin of the Maverick Virus'"
              className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : ''}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>
          
          {/* Series */}
          <div>
            <label htmlFor="series" className="block text-sm font-medium text-gray-700 mb-1">
              Series
            </label>
            <select
              id="series"
              className={`w-full p-2 border rounded-md ${errors.seriesId ? 'border-red-500' : ''}`}
              value={seriesId}
              onChange={(e) => setSeriesId(e.target.value ? parseInt(e.target.value) : '')}
            >
              <option value="">Select a series</option>
              {allSeries?.map(series => (
                <option key={series.id} value={series.id}>
                  {series.name}
                </option>
              ))}
            </select>
            {errors.seriesId && (
              <p className="mt-1 text-sm text-red-600">{errors.seriesId}</p>
            )}
          </div>
          
          {/* Tags */}
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    tags.includes(tag) 
                      ? 'bg-blue-100 text-blue-800 border-blue-300 border' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {errors.tags && (
              <p className="mt-1 text-sm text-red-600">{errors.tags}</p>
            )}
          </div>
          
          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              id="content"
              placeholder="Provide detailed information about this lore topic..."
              className={`w-full p-2 border rounded-md min-h-[200px] ${errors.content ? 'border-red-500' : ''}`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
          </div>
          
          {/* Sources */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Sources
              </label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleAddSource}
              >
                Add Source
              </Button>
            </div>
            <div className="space-y-2">
              {sources.map((source, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="E.g., 'Mega Man X4 (1997)' or 'Developer Interview'"
                    className="flex-1 p-2 border rounded-md"
                    value={source}
                    onChange={(e) => handleSourceChange(index, e.target.value)}
                  />
                  {sources.length > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemoveSource(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Cite your sources to increase credibility.
            </p>
          </div>
          
          {/* Related Characters */}
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Related Characters
            </span>
            <div className="max-h-60 overflow-y-auto border rounded-md p-2">
              {characters?.map(character => (
                <div key={character.id} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id={`character-${character.id}`}
                    checked={characterIds.includes(character.id)}
                    onChange={() => handleCharacterToggle(character.id)}
                    className="rounded"
                  />
                  <label htmlFor={`character-${character.id}`} className="flex items-center gap-2">
                    <span>{character.name}</span>
                    {character.series && (
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: character.series.color_code }}
                      >
                        {character.series.name}
                      </span>
                    )}
                  </label>
                </div>
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Select characters that are mentioned in this lore entry.
            </p>
          </div>
          
          {/* Submission note */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your lore entry will be reviewed by moderators before being published.
              This helps ensure accuracy and consistency in our lore database.
            </p>
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end gap-3">
            <Link to="/lore">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button 
              variant="megamanBlue" 
              type="submit"
              disabled={createLoreMutation.isPending}
            >
              {createLoreMutation.isPending ? 'Submitting...' : 'Submit Lore Entry'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLorePage;