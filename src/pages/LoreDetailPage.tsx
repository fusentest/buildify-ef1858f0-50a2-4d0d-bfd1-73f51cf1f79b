
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loreService } from '../services/loreService';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { formatDate, getTagColor } from '../lib/utils';

const LoreDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  
  const { data: loreEntry, isLoading } = useQuery({
    queryKey: ['loreEntry', id],
    queryFn: () => loreService.getLoreEntry(parseInt(id!)),
    enabled: !!id
  });

  const addCommentMutation = useMutation({
    mutationFn: (data: { content: string; userId: string; loreEntryId: number }) => 
      loreService.addComment(data.content, data.userId, data.loreEntryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loreEntry', id] });
      setCommentText('');
    }
  });

  const handleAddComment = () => {
    if (!user || !commentText.trim() || !id) return;
    
    addCommentMutation.mutate({
      content: commentText,
      userId: user.id,
      loreEntryId: parseInt(id)
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading lore entry...</div>;
  }

  if (!loreEntry) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Lore Entry Not Found</h2>
        <p className="mb-4">The lore entry you're looking for doesn't exist or has been removed.</p>
        <Link to="/lore">
          <Button variant="outline">Back to Lore</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Lore entry header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border-t-4" style={{ borderColor: loreEntry.series?.color_code }}>
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold">{loreEntry.title}</h1>
            
            {loreEntry.series && (
              <span 
                className="px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: loreEntry.series.color_code }}
              >
                {loreEntry.series.name} Series
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {loreEntry.tags.map(tag => (
              <span 
                key={tag} 
                className={`px-2 py-1 rounded text-sm ${getTagColor(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="prose max-w-none">
            {loreEntry.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          
          {loreEntry.sources && loreEntry.sources.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Sources</h3>
              <ul className="list-disc pl-5 space-y-1">
                {loreEntry.sources.map((source, index) => (
                  <li key={index} className="text-gray-700">{source}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-500 flex justify-between items-center">
            <span>Added {formatDate(loreEntry.created_at)}</span>
            {loreEntry.creator && <span>By {loreEntry.creator.username}</span>}
          </div>
        </div>
      </div>

      {/* Related characters */}
      {loreEntry.relatedCharacters && loreEntry.relatedCharacters.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Related Characters</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {loreEntry.relatedCharacters.map(character => (
              <Link 
                key={character.id} 
                to={`/characters/${character.id}`}
                className="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                {character.portrait_url ? (
                  <img 
                    src={character.portrait_url} 
                    alt={character.name} 
                    className="w-16 h-16 object-cover rounded-full mb-2"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                    <span className="text-xs text-gray-500">No image</span>
                  </div>
                )}
                <span className="text-center font-medium">{character.name}</span>
                {character.series && (
                  <span 
                    className="mt-1 text-xs px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: character.series.color_code }}
                  >
                    {character.series.name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Comments section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Discussion</h2>
        
        {/* Add comment form */}
        {user ? (
          <div className="mb-6">
            <textarea
              placeholder="Add your thoughts or additional information..."
              className="w-full p-3 border rounded-lg min-h-[100px]"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="mt-2 flex justify-end">
              <Button 
                variant="megamanBlue" 
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
        {loreEntry.comments && loreEntry.comments.length > 0 ? (
          <div className="space-y-4">
            {loreEntry.comments.map(comment => (
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

export default LoreDetailPage;