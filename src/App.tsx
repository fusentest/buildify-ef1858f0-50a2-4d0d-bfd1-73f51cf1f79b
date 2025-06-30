
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import TimelinePage from './pages/TimelinePage';
import CharactersPage from './pages/CharactersPage';
import CharacterDetailPage from './pages/CharacterDetailPage';
import CharacterFocusPage from './pages/CharacterFocusPage';
import LorePage from './pages/LorePage';
import LoreDetailPage from './pages/LoreDetailPage';
import TheoriesPage from './pages/TheoriesPage';
import TheoryDetailPage from './pages/TheoryDetailPage';
import CreateTheoryPage from './pages/CreateTheoryPage';
import CreateLorePage from './pages/CreateLorePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import ApiKeyManagementPage from './pages/ApiKeyManagementPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="timeline" element={<TimelinePage />} />
            <Route path="characters" element={<CharactersPage />} />
            <Route path="characters/:id" element={<CharacterDetailPage />} />
            <Route path="character-focus/:id" element={<CharacterFocusPage />} />
            <Route path="lore" element={<LorePage />} />
            <Route path="lore/:id" element={<LoreDetailPage />} />
            <Route path="theories" element={<TheoriesPage />} />
            <Route path="theories/:id" element={<TheoryDetailPage />} />
            <Route path="create-theory" element={<CreateTheoryPage />} />
            <Route path="create-lore" element={<CreateLorePage />} />
            <Route path="sign-in" element={<SignInPage />} />
            <Route path="sign-up" element={<SignUpPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="api-keys" element={<ApiKeyManagementPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;