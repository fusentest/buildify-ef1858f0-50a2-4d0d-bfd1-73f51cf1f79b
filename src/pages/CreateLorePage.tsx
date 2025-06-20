
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
  const { data: allCharacters } = useQuery({
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

  const allTags = [
    'Canon',
    'Disputed',
    'Theory',
    'Game Only',
    'Manga Only'
  ];

  const handleTagToggle = (tag: string) => {
    setTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleSourceChange = (index: number, value: string) => {
    const newSources = [...sources];
    newSources[index] = value;
    setSources(newSources);
    
    // Add a new empty source field if the last one is being filled
    if (index === sources.length - 1 && value.trim()) {
      setSources([...newSources, '']);
    }
  };

  const handleCharacterToggle = (characterId: number) => {
    setCharacterIds(prev => {
      if (prev.includes(characterId)) {
        return prev.filter(id => id !== characterId);
      } else {
        return [...prev, characterId];
      }
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    