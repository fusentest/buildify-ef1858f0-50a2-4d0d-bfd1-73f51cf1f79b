
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center py-16">
      <h1 className="text-6xl font-bold text-blue-900 mb-4">404</h1>
      <h2 className="text-3xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-xl text-gray-600 mb-8">
        Looks like this page has been lost in a dimensional rift...
      </p>
      <div className="flex justify-center gap-4">
        <Link to="/">
          <Button variant="megamanBlue" size="lg">
            Return Home
          </Button>
        </Link>
        <Link to="/timeline">
          <Button variant="outline" size="lg">
            Explore Timeline
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;