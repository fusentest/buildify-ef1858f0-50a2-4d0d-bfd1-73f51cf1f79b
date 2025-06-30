
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiKeyService, ApiKey } from '../services/apiKeyService';
import { Button } from '../components/ui/Button';

const ApiKeyManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [serviceName, setServiceName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  
  // Fetch API keys on component mount
  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
      return;
    }
    
    const fetchApiKeys = async () => {
      try {
        setLoading(true);
        const keys = await apiKeyService.getUserApiKeys();
        setApiKeys(keys);
      } catch (err) {
        console.error('Error fetching API keys:', err);
        setError('Failed to load API keys. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApiKeys();
  }, [user, navigate]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceName.trim() || !apiKey.trim()) {
      setFormError('Please fill in all fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError(null);
      setFormSuccess(null);
      
      await apiKeyService.saveApiKey(serviceName, apiKey);
      
      // Refresh the API keys list
      const keys = await apiKeyService.getUserApiKeys();
      setApiKeys(keys);
      
      // Reset form
      setServiceName('');
      setApiKey('');
      setFormSuccess('API key saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setFormSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error saving API key:', err);
      setFormError('Failed to save API key. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle API key deletion
  const handleDeleteKey = async (id: number) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return;
    }
    
    try {
      await apiKeyService.deleteApiKey(id);
      
      // Update the list
      setApiKeys(apiKeys.filter(key => key.id !== id));
      
    } catch (err) {
      console.error('Error deleting API key:', err);
      setError('Failed to delete API key. Please try again.');
    }
  };
  
  // Handle toggling API key status
  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const updatedKey = await apiKeyService.toggleApiKeyStatus(id, !currentStatus);
      
      // Update the list
      setApiKeys(apiKeys.map(key => key.id === id ? updatedKey : key));
      
    } catch (err) {
      console.error('Error toggling API key status:', err);
      setError('Failed to update API key status. Please try again.');
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Mask API key for display
  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };
  
  if (!user) {
    return null; // Redirect handled in useEffect
  }
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">API Key Management</h1>
      
      {/* Add new API key form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New API Key</h2>
        
        {formError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {formError}
          </div>
        )}
        
        {formSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {formSuccess}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700 mb-1">
              Service Name
            </label>
            <input
              type="text"
              id="serviceName"
              className="w-full p-2 border rounded-md"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g., OpenAI, GitHub, etc."
              required
            />
          </div>
          
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              id="apiKey"
              className="w-full p-2 border rounded-md"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Your API key will be encrypted before storage for security.
            </p>
          </div>
          
          <Button
            type="submit"
            variant="megamanBlue"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save API Key'}
          </Button>
        </form>
      </div>
      
      {/* API keys list */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your API Keys</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-4">Loading API keys...</div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            You haven't added any API keys yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiKeys.map((key) => (
                  <tr key={key.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{key.service_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-500 font-mono">{maskApiKey(key.api_key)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          key.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {key.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(key.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleToggleStatus(key.id, key.is_active)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        {key.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeyManagementPage;