
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

const ProfilePage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/sign-in');
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }
  
  if (!user) {
    return null; // Redirect handled in useEffect
  }
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.username || 'User'}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
          <div className="space-y-2">
            <Link to="/edit-profile" className="block text-blue-600 hover:underline">
              Edit Profile
            </Link>
            <Link to="/change-password" className="block text-blue-600 hover:underline">
              Change Password
            </Link>
            <Link to="/api-keys" className="block text-blue-600 hover:underline">
              Manage API Keys
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Contributions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Lore Entries</h3>
              <p className="text-gray-600">You have created 0 lore entries</p>
              <Link to="/create-lore" className="text-blue-600 hover:underline text-sm">
                Create New Lore Entry
              </Link>
            </div>
            
            <div>
              <h3 className="font-medium">Fan Theories</h3>
              <p className="text-gray-600">You have created 0 fan theories</p>
              <Link to="/create-theory" className="text-blue-600 hover:underline text-sm">
                Create New Theory
              </Link>
            </div>
            
            <div>
              <h3 className="font-medium">Comments</h3>
              <p className="text-gray-600">You have posted 0 comments</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Activity Feed</h2>
          <div className="text-center py-8 text-gray-500">
            No recent activity to display.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;