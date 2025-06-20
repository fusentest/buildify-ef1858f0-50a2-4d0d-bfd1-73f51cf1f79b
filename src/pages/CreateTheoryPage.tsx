
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { theoryService } from '../services/theoryService';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const CreateTheoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [branchingPoint, setBranchingPoint] = useState('');
  const [alternateTimeline, setAlternateTimeline] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createTheoryMutation = useMutation({
    mutationFn: (data: { 
      title: string; 
      description: string; 
      branchingPoint: string; 
      alternateTimeline: string; 
      creatorId: string;
    }) => theoryService.createTheory(
      data.title,
      data.description,
      data.branchingPoint,
      data.alternateTimeline,
      data.creatorId
    ),
    onSuccess: () => {
      navigate('/theories');
    }
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!branchingPoint.trim()) {
      newErrors.branchingPoint = 'Branching point is required';
    }
    
    if (!alternateTimeline.trim()) {
      newErrors.alternateTimeline = 'Alternate timeline is required';
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
    
    createTheoryMutation.mutate({
      title,
      description,
      branchingPoint,
      alternateTimeline,
      creatorId: user.id
    });
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
        <p className="mb-4">You need to be signed in to create a theory.</p>
        <Link to="/signin">
          <Button variant="outline">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create a "What If?" Theory</h1>
        <p className="text-gray-600">
          Share your alternate timeline theory with the Mega Man community.
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
              placeholder="E.g., 'What if X never went into stasis?'"
              className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : ''}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Provide a brief overview of your theory..."
              className={`w-full p-2 border rounded-md min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
          
          {/* Branching Point */}
          <div>
            <label htmlFor="branchingPoint" className="block text-sm font-medium text-gray-700 mb-1">
              Branching Point
            </label>
            <input
              type="text"
              id="branchingPoint"
              placeholder="E.g., 'X is never sealed for 30 years of testing'"
              className={`w-full p-2 border rounded-md ${errors.branchingPoint ? 'border-red-500' : ''}`}
              value={branchingPoint}
              onChange={(e) => setBranchingPoint(e.target.value)}
            />
            <p className="mt-1 text-sm text-gray-500">
              The specific event or decision that changes from the original timeline.
            </p>
            {errors.branchingPoint && (
              <p className="mt-1 text-sm text-red-600">{errors.branchingPoint}</p>
            )}
          </div>
          
          {/* Alternate Timeline */}
          <div>
            <label htmlFor="alternateTimeline" className="block text-sm font-medium text-gray-700 mb-1">
              Alternate Timeline
            </label>
            <textarea
              id="alternateTimeline"
              placeholder="Describe how events would unfold differently..."
              className={`w-full p-2 border rounded-md min-h-[200px] ${errors.alternateTimeline ? 'border-red-500' : ''}`}
              value={alternateTimeline}
              onChange={(e) => setAlternateTimeline(e.target.value)}
            />
            <p className="mt-1 text-sm text-gray-500">
              Detail the consequences and how the Mega Man timeline would change as a result.
            </p>
            {errors.alternateTimeline && (
              <p className="mt-1 text-sm text-red-600">{errors.alternateTimeline}</p>
            )}
          </div>
          
          {/* Submission note */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your theory will be reviewed by moderators before being published.
              This helps ensure all content meets our community guidelines.
            </p>
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end gap-3">
            <Link to="/theories">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button 
              variant="zeroRed" 
              type="submit"
              disabled={createTheoryMutation.isPending}
            >
              {createTheoryMutation.isPending ? 'Submitting...' : 'Submit Theory'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTheoryPage;