
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-blue-900 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and site title */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold">Mega Man Lore Timeline</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/timeline" className="px-3 py-2 rounded-md hover:bg-blue-800">
              Timeline
            </Link>
            <Link to="/characters" className="px-3 py-2 rounded-md hover:bg-blue-800">
              Characters
            </Link>
            <Link to="/lore" className="px-3 py-2 rounded-md hover:bg-blue-800">
              Lore
            </Link>
            <Link to="/theories" className="px-3 py-2 rounded-md hover:bg-blue-800">
              What If?
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/profile" className="px-3 py-2 rounded-md hover:bg-blue-800">
                  Profile
                </Link>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="border-white text-white hover:bg-blue-800"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/sign-in">
                  <Button 
                    variant="outline"
                    className="border-white text-white hover:bg-blue-800"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/sign-up">
                  <Button 
                    variant="megamanBlue"
                    className="border border-white"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-800 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/timeline"
              className="block px-3 py-2 rounded-md hover:bg-blue-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Timeline
            </Link>
            <Link
              to="/characters"
              className="block px-3 py-2 rounded-md hover:bg-blue-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Characters
            </Link>
            <Link
              to="/lore"
              className="block px-3 py-2 rounded-md hover:bg-blue-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Lore
            </Link>
            <Link
              to="/theories"
              className="block px-3 py-2 rounded-md hover:bg-blue-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              What If?
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md hover:bg-blue-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md hover:bg-blue-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/sign-in"
                  className="block px-3 py-2 rounded-md hover:bg-blue-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="block px-3 py-2 rounded-md hover:bg-blue-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;