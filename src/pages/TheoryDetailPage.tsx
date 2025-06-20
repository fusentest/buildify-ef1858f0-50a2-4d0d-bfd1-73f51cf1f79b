
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { theoryService } from '../services/theoryService';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/utils';

const TheoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  
  const { data: theory, isLoading } = useQuery({
    queryKey: ['theory', id],
    queryFn: () => theoryService.getTheory(parseInt(id!)),
    enabled: !!id
  });

  const upvoteMutation = useMutation({
    mutationFn: (data: { userId: string; theoryId: number }) => 
      theoryService.upvoteTheory(data.userId, data.theoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theory', id] });
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: (data: { content: string; userId: string; fanTheoryId: number }) => 
      theoryService.addComment(data.content, data.userId, data.fanTheoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theory', id] });
      setCommentText('');
    }
  });

  const handleUpvote = () => {
    if (!user || !id) return;
    
    upvoteMutation.mutate({
      userId: user.id,
      theoryId: parseInt(id)
    });
  };

  const handleAddComment = () => {
    if (!user || !commentText.trim() || !id) return;
    
    addCommentMutation.mutate({
      content: commentText,
      userId: user.id,
      fanTheoryId: parseInt(id)
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading theory...</div>;
  }

  if (!theory) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Theory Not Found</h2>
        <p className="mb-4">The theory you're looking for doesn't exist or has been removed.</p>
        <Link to="/theories">
          <Button variant="outline">Back to Theories</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Theory header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{theory.title}</h1>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              {theory.creator?.avatar_url ? (
                <img 
                  src={theory.creator.avatar_url} 
                  alt={theory.creator.username} 
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs text-gray-500">{theory.creator?.username.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <span className="font-medium">{theory.creator?.username || 'Unknown'}</span>
            </div>
            <span className="text-gray-500">•</span>
            <span className="text-gray-500">{formatDate(theory.created_at)}</span>
            <span className="text-gray-500">•</span>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                className={`flex items-center gap-1 ${theory.hasUpvoted ? 'text-amber-600' : 'text-gray-500 hover:text-amber-600'}`}
                onClick={handleUpvote}
                disabled={!user || upvoteMutation.isPending}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                <span>{theory.upvotes} {theory.upvotes === 1 ? 'upvote' : 'upvotes'}</span>
              </Button>
            </div>
          </div>
          
          <div className="prose max-w-none mb-6">
            <p>{theory.description}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Branching Point</h2>
            <p className="text-gray-700">{theory.branching_point}</p>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Alternate Timeline</h2>
            <div className="prose max-w-none">
              {theory.alternate_timeline.split('\n').map((paragraph, index) => (
                <p key={index} className="text-gray-700">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comments section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Discussion</h2>
        
        {/* Add comment form */}
        {user ? (
          <div className="mb-6">
            <textarea
              placeholder="Share your thoughts on this theory..."
              className="w-full p-3 border rounded-lg min-h-[100px]"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="mt-2 flex justify-end">
              <Button 
                variant="zeroRed" 
                onClick={handleAddComment}
                disabled={!commentText.trim() || addCommentMutation.isPending}
              >
                {addCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg text-center">
            <p className="mb-2">Sign in to join the discussion!</p>
            <Link to="/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        )}
        
        {/* Comments list */}
        {theory.comments && theory.comments.length > 0 ? (
          <div className="space-y-4">
            {theory.comments.map(comment => (
              <div key={comment.id} className="border-b pb-4">
                <div className="flex items-start gap-3">
                  {comment.user.avatar_url ? (
                    <img 
                      src={comment.user.avatar_url} 
                      alt={comment.user.username} 
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-500">{comment.user.username.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{comment.user.username}</span>
                      <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="mt-1 text-gray-700">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-4">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  );
};

export default TheoryDetailPage;