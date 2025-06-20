
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { theoryService } from '../services/theoryService';
import { FanTheory } from '../types';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { formatDate, truncateText } from '../lib/utils';

const TheoriesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch fan theories
  const { data: theories, isLoading } = useQuery({
    queryKey: ['theories'],
    queryFn: theoryService.getTheories
  });

  // Filter theories by search term
  const filteredTheories = theories?.filter(theory =>
    theory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    theory.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    theory.branching_point.toLowerCase().includes(searchTerm.toLowerCase()) ||
    theory.alternate_timeline.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">"What If?" Theories</h1>
          <p className="text-gray-600">
            Explore alternate timelines and fan theories about the Mega Man universe.
          </p>
        </div>
        
        {user ? (
          <Link to="/theories/create">
            <Button variant="zeroRed">
              Create Your Theory
            </Button>
          </Link>
        ) : (
          <Link to="/signin">
            <Button variant="outline">
              Sign In to Create Theories
            </Button>
          </Link>
        )}
      </div>

      {/* Intro section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-3">What Are "What If?" Theories?</h2>
        <p className="mb-4">
          "What If?" theories explore alternate timelines and scenarios in the Mega Man universe.
          What if X never went into stasis? What if Zero wasn't discovered? What if Dr. Wily succeeded?
          Create your own theories or explore those created by other fans!
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Alternate History</span>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Fan Theories</span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Branching Timelines</span>
          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">Speculative Fiction</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
          Search Theories
        </label>
        <input
          type="text"
          id="search"
          placeholder="Search by title, description, or content..."
          className="w-full p-2 border rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Theories list */}
      {isLoading ? (
        <div className="text-center py-8">Loading theories...</div>
      ) : filteredTheories && filteredTheories.length > 0 ? (
        <div className="space-y-6">
          {filteredTheories.map(theory => (
            <TheoryCard key={theory.id} theory={theory} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-600">No theories found matching your search.</p>
          {searchTerm && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSearchTerm('')}
            >
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

interface TheoryCardProps {
  theory: FanTheory;
}

const TheoryCard: React.FC<TheoryCardProps> = ({ theory }) => {
  return (
    <Link 
      to={`/theories/${theory.id}`}
      className="block bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-1">{theory.title}</h3>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-500">
            By {theory.creator?.username || 'Unknown'}
          </span>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">
            {formatDate(theory.created_at)}
          </span>
          <span className="text-sm text-gray-500">•</span>
          <div className="flex items-center gap-1 text-amber-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span>{theory.upvotes}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">Branching Point:</span>
            <span className="text-sm text-gray-700">{theory.branching_point}</span>
          </div>
          
          <p className="text-gray-700 mb-3">
            {truncateText(theory.description, 150)}
          </p>
          
          <div className="bg-gray-100 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Alternate Timeline:</h4>
            <p className="text-sm text-gray-700">
              {truncateText(theory.alternate_timeline, 200)}
            </p>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-amber-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span className="font-medium">{theory.upvotes} upvotes</span>
          </div>
          
          <span className="text-blue-600 hover:underline">Read more</span>
        </div>
      </div>
    </Link>
  );
};

export default TheoriesPage;