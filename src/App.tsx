
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import TimelinePage from './pages/TimelinePage';
import CharactersPage from './pages/CharactersPage';
import CharacterDetailPage from './pages/CharacterDetailPage';
import LorePage from './pages/LorePage';
import LoreDetailPage from './pages/LoreDetailPage';
import TheoriesPage from './pages/TheoriesPage';
import TheoryDetailPage from './pages/TheoryDetailPage';
import CreateTheoryPage from './pages/CreateTheoryPage';
import CreateLorePage from './pages/CreateLorePage';
import ProfilePage from './pages/ProfilePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import NotFoundPage from './pages/NotFoundPage';

// Layout
import Layout from './components/layout/Layout';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="timeline" element={<TimelinePage />} />
              <Route path="characters" element={<CharactersPage />} />
              <Route path="characters/:id" element={<CharacterDetailPage />} />
              <Route path="lore" element={<LorePage />} />
              <Route path="lore/:id" element={<LoreDetailPage />} />
              <Route path="lore/create" element={<CreateLorePage />} />
              <Route path="theories" element={<TheoriesPage />} />
              <Route path="theories/:id" element={<TheoryDetailPage />} />
              <Route path="theories/create" element={<CreateTheoryPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="signin" element={<SignInPage />} />
              <Route path="signup" element={<SignUpPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;