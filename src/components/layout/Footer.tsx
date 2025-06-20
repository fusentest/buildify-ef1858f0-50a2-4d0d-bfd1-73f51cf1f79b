
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Mega Man Lore Timeline</h3>
            <p className="text-gray-300">
              Explore the complete lore of the Mega Man universe across all series, from Classic to Legends.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/timeline" className="text-gray-300 hover:text-white">
                  Timeline Explorer
                </Link>
              </li>
              <li>
                <Link to="/characters" className="text-gray-300 hover:text-white">
                  Character Web
                </Link>
              </li>
              <li>
                <Link to="/lore" className="text-gray-300 hover:text-white">
                  Lore Encyclopedia
                </Link>
              </li>
              <li>
                <Link to="/theories" className="text-gray-300 hover:text-white">
                  "What If?" Theories
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <p className="text-gray-300">
                  Mega Man and all related characters are property of Capcom Co., Ltd.
                  This is a fan-made site with no official affiliation.
                </p>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Mega Man Lore Timeline. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;