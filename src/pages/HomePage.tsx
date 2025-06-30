
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

const HomePage: React.FC = () => {
  const [series, setSeries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('series')
          .select('*')
          .order('id');
        
        if (error) {
          throw error;
        }
        
        setSeries(data || []);
      } catch (err) {
        console.error('Error fetching series:', err);
        setError('Failed to load series data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeries();
  }, []);

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 px-4 bg-blue-900 text-white rounded-lg shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Explore the Mega Man Universe</h1>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          Discover the complete lore, timelines, characters, and events across all Mega Man series,
          from Classic to Legends.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/timeline">
            <Button variant="megamanBlue" size="lg">
              Explore Timeline
            </Button>
          </Link>
          <Link to="/characters">
            <Button variant="xGreen" size="lg">
              Character Web
            </Button>
          </Link>
          <Link to="/theories">
            <Button variant="zeroRed" size="lg">
              "What If?" Scenarios
            </Button>
          </Link>
        </div>
      </section>

      {/* Series Overview */}
      <section>
        <h2 className="text-3xl font-bold mb-6 text-center">Mega Man Series</h2>
        
        {isLoading ? (
          <div className="text-center py-8">Loading series data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {series.map((s) => (
              <div 
                key={s.id} 
                className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                style={{ borderColor: s.color_code }}
              >
                <div 
                  className="p-4 text-white" 
                  style={{ backgroundColor: s.color_code }}
                >
                  <h3 className="text-xl font-bold">Mega Man {s.name}</h3>
                  {s.start_year && (
                    <p className="text-sm opacity-90">Era: {s.start_year}{s.end_year && s.end_year !== s.start_year ? ` - ${s.end_year}` : ''}</p>
                  )}
                </div>
                <div className="p-4">
                  <p className="mb-4">{s.description}</p>
                  <div className="flex gap-2">
                    <Link to={`/timeline?series=${s.id}`}>
                      <Button variant="outline" size="sm">
                        Timeline
                      </Button>
                    </Link>
                    <Link to={`/characters?series=${s.id}`}>
                      <Button variant="outline" size="sm">
                        Characters
                      </Button>
                    </Link>
                    <Link to={`/lore?series=${s.id}`}>
                      <Button variant="outline" size="sm">
                        Lore
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-3">Timeline Explorer</h3>
          <p className="mb-4">
            Navigate through centuries of Mega Man history with our interactive timeline.
            Filter by series, characters, or major events.
          </p>
          <Link to="/timeline">
            <Button variant="megamanBlue">Explore Timeline</Button>
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-3">Character Web</h3>
          <p className="mb-4">
            Discover the complex relationships between characters across all series.
            View detailed profiles, connections, and appearances.
          </p>
          <Link to="/characters">
            <Button variant="xGreen">View Characters</Button>
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-3">"What If?" Generator</h3>
          <p className="mb-4">
            Create and share alternate timelines based on different branching points.
            What if X never went into stasis? What if Zero wasn't discovered?
          </p>
          <Link to="/theories">
            <Button variant="zeroRed">Explore Theories</Button>
          </Link>
        </div>
      </section>

      {/* Community Section */}
      <section className="bg-gray-100 p-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">Join Our Community</h2>
        <p className="text-center text-lg mb-6">
          Contribute your knowledge, theories, and passion to the most comprehensive
          Mega Man lore database on the web.
        </p>
        <div className="flex justify-center">
          <Link to="/signup">
            <Button variant="legendsPurple" size="lg">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;