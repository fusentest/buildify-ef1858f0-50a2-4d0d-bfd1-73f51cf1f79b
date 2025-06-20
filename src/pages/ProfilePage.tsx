
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { formatDate } from '../lib/utils';

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  // Fetch user's lore entries
  const { data: loreEntries, isLoading: loreLoading } = useQuery({
    queryKey: ['userLoreEntries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('lore_entries')
        .select(`
          *,
          series:series_id(id, name, color_code)
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch user's fan theories
  const { data: theories, isLoading: theoriesLoading } = useQuery({
    queryKey: ['userTheories', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('fan_theories')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch user's comments
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['userComments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          lore_entry:lore_entry_id(id, title),
          fan_theory:fan_theory_id(id, title)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Avatar image must be less than 2MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('File must be an image');
        return;
      }
      
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;
    
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('user-content')
      .upload(filePath, avatarFile);
      
    if (uploadError) {
      throw uploadError;
    }
    
    const { data } = supabase.storage
      .from('user-content')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  };

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      let newAvatarUrl = avatarUrl;
      
      // Upload new avatar if changed
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          newAvatarUrl = uploadedUrl;
        }
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          bio,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      return { username, bio, avatar_url: newAvatarUrl };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setIsEditing(false);
      
      // Update local user state
      if (user) {
        user.username = data.username;
        user.bio = data.bio;
        user.avatar_url = data.avatar_url;
      }
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    }
  });

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await updateProfileMutation.mutateAsync();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleCancelEdit = () => {
    // Reset form values to current user values
    if (user) {
      setUsername(user.username || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatar_url || '');
    }
    setAvatarFile(null);
    setError(null);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
        <p className="mb-4">You need to be signed in to view your profile.</p>
        <Link to="/signin">
          <Button variant="outline">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          
          {isEditing ? (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button 
                variant="megamanBlue" 
                onClick={handleSaveProfile}
                disabled={isLoading || updateProfileMutation.isPending}
              >
                {isLoading || updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="flex flex-col items-center">
              {isEditing ? (
                <div className="mb-4">
                  <div className="relative w-32 h-32 group">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt={username} 
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-4xl text-gray-500">{username.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-sm">Change Avatar</span>
                    </div>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    Click to upload a new avatar<br />(Max 2MB)
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={username} 
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-4xl text-gray-500">{username.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
              )}
              
              {!isEditing ? (
                <h2 className="text-xl font-semibold">{username}</h2>
              ) : (
                <div className="w-full">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="w-full p-2 border rounded-md"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              )}
              
              <p className="text-gray-500 mt-1">Member since {formatDate(user.created_at)}</p>
              <p className="text-gray-500">Role: {user.role}</p>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              
              {!isEditing ? (
                <p className="text-gray-700">
                  {user.bio || 'No bio provided yet.'}
                </p>
              ) : (
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    className="w-full p-2 border rounded-md min-h-[100px]"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself and your interest in Mega Man..."
                  />
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Account Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Email:</span>
                  <span className="ml-2">{user.email}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                  <span className="ml-2">{formatDate(user.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User's Contributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lore Entries */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Lore Entries</h2>
            <Link to="/lore/create">
              <Button variant="outline" size="sm">
                Create New
              </Button>
            </Link>
          </div>
          
          {loreLoading ? (
            <p className="text-center py-4">Loading your lore entries...</p>
          ) : loreEntries && loreEntries.length > 0 ? (
            <div className="space-y-4">
              {loreEntries.map(entry => (
                <Link 
                  key={entry.id} 
                  to={`/lore/${entry.id}`}
                  className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{entry.title}</h3>
                    {entry.series && (
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: entry.series.color_code }}
                      >
                        {entry.series.name}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-gray-500">{formatDate(entry.created_at)}</span>
                    <span className={`px-2 py-0.5 rounded-full ${entry.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {entry.is_approved ? 'Approved' : 'Pending Review'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-2">You haven't created any lore entries yet.</p>
              <Link to="/lore/create">
                <Button variant="megamanBlue" size="sm">
                  Contribute Lore
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Fan Theories */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your "What If?" Theories</h2>
            <Link to="/theories/create">
              <Button variant="outline" size="sm">
                Create New
              </Button>
            </Link>
          </div>
          
          {theoriesLoading ? (
            <p className="text-center py-4">Loading your theories...</p>
          ) : theories && theories.length > 0 ? (
            <div className="space-y-4">
              {theories.map(theory => (
                <Link 
                  key={theory.id} 
                  to={`/theories/${theory.id}`}
                  className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium">{theory.title}</h3>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-1">
                    {theory.branching_point}
                  </p>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-gray-500">{formatDate(theory.created_at)}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full ${theory.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {theory.is_approved ? 'Approved' : 'Pending Review'}
                      </span>
                      <span className="flex items-center gap-1 text-amber-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        {theory.upvotes}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-2">You haven't created any theories yet.</p>
              <Link to="/theories/create">
                <Button variant="zeroRed" size="sm">
                  Create Theory
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* User's Comments */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Your Comments</h2>
        
        {commentsLoading ? (
          <p className="text-center py-4">Loading your comments...</p>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-700">{comment.content}</p>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(comment.created_at)}</p>
                  </div>
                  <div>
                    {comment.lore_entry && (
                      <Link 
                        to={`/lore/${comment.lore_entry.id}`}
                        className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                      >
                        On: {comment.lore_entry.title}
                      </Link>
                    )}
                    {comment.fan_theory && (
                      <Link 
                        to={`/theories/${comment.fan_theory.id}`}
                        className="text-sm px-2 py-1 bg-red-100 text-red-800 rounded-full hover:bg-red-200"
                      >
                        On: {comment.fan_theory.title}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-gray-600">
            You haven't made any comments yet. Join the discussion on lore entries and theories!
          </p>
        )}
      </div>

      {/* User Stats */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <span className="text-3xl font-bold text-blue-600">{loreEntries?.length || 0}</span>
            <p className="text-blue-800">Lore Entries</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <span className="text-3xl font-bold text-red-600">{theories?.length || 0}</span>
            <p className="text-red-800">Theories</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <span className="text-3xl font-bold text-purple-600">{comments?.length || 0}</span>
            <p className="text-purple-800">Comments</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;