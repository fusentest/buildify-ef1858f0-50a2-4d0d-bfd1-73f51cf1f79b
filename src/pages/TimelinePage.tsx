
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { timelineService } from '../services/timelineService';
import { seriesService } from '../services/seriesService';
import { TimelineEvent, Series } from '../types';
import { Button } from '../components/ui/Button';
import { getSeriesColor } from '../lib/utils';

const TimelinePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const seriesParam = searchParams.get('series');
  const timelineId = searchParams.get('id') || '1'; // Default to official timeline
  
  const [selectedSeries, setSelectedSeries] = useState<number[]>(
    seriesParam ? [parseInt(seriesParam)] : []
  );
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isOfficialTimeline, setIsOfficialTimeline] = useState<boolean>(true);

  // Fetch timelines
  const { data: timelines, isLoading: timelinesLoading } = useQuery({
    queryKey: ['timelines', isOfficialTimeline],
    queryFn: () => timelineService.getTimelines(isOfficialTimeline)
  });

  // Fetch series for filtering
  const { data: allSeries, isLoading: seriesLoading } = useQuery({
    queryKey: ['series'],
    queryFn: seriesService.getAllSeries
  });

  // Fetch timeline events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['timelineEvents', timelineId, selectedSeries],
    queryFn: () => timelineService.getTimelineEvents(
      parseInt(timelineId),
      selectedSeries.length === 1 ? selectedSeries[0] : undefined
    )
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('id', timelineId);
    
    if (selectedSeries.length === 1) {
      params.set('series', selectedSeries[0].toString());
    }
    
    setSearchParams(params);
  }, [timelineId, selectedSeries, setSearchParams]);

  const handleSeriesToggle = (seriesId: number) => {
    setSelectedSeries(prev => {
      if (prev.includes(seriesId)) {
        return prev.filter(id => id !== seriesId);
      } else {
        return [...prev, seriesId];
      }
    });
  };

  const handleSelectAllSeries = () => {
    if (allSeries) {
      setSelectedSeries(allSeries.map(s => s.id));
    }
  };

  const handleClearAllSeries = () => {
    setSelectedSeries([]);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleTimelineChange = (id: string) => {
    setSearchParams({ id });
  };

  // Group events by year for display
  const groupedEvents: Record<string, TimelineEvent[]> = {};
  events?.forEach(event => {
    if (!groupedEvents[event.year]) {
      groupedEvents[event.year] = [];
    }
    groupedEvents[event.year].push(event);
  });

  // Sort years chronologically (with special handling for "XX" years)
  const sortedYears = Object.keys(groupedEvents).sort((a, b) => {
    // Extract numeric parts if possible
    const aNum = a.replace(/[^0-9]/g, '');
    const bNum = b.replace(/[^0-9]/g, '');
    
    if (aNum && bNum) {
      return parseInt(aNum) - parseInt(bNum);
    }
    
    // Fallback to string comparison
    return a.localeCompare(b);
  });

  const isLoading = timelinesLoading || seriesLoading || eventsLoading;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Timeline Explorer</h1>
          <p className="text-gray-600">
            Navigate through the history of the Mega Man universe across all series.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOfficialTimeline(true)}
            className={isOfficialTimeline ? 'bg-blue-100' : ''}
          >
            Official Timeline
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOfficialTimeline(false)}
            className={!isOfficialTimeline ? 'bg-blue-100' : ''}
          >
            Fan Timelines
          </Button>
        </div>
      </div>

      {/* Timeline selector */}
      {!timelinesLoading && timelines && timelines.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Select Timeline</h2>
          <div className="flex flex-wrap gap-2">
            {timelines.map(timeline => (
              <Button
                key={timeline.id}
                variant="outline"
                size="sm"
                onClick={() => handleTimelineChange(timeline.id.toString())}
                className={timelineId === timeline.id.toString() ? 'bg-blue-100' : ''}
              >
                {timeline.title}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Series filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">Filter by Series</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAllSeries}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAllSeries}>
              Clear All
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {allSeries?.map(series => (
            <Button
              key={series.id}
              variant="outline"
              size="sm"
              onClick={() => handleSeriesToggle(series.id)}
              className={selectedSeries.includes(series.id) ? 'bg-blue-100' : ''}
              style={{
                borderColor: selectedSeries.includes(series.id) ? series.color_code : undefined,
                color: selectedSeries.includes(series.id) ? series.color_code : undefined
              }}
            >
              {series.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Zoom controls */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleZoomOut}>
          <span className="text-lg">−</span>
        </Button>
        <Button variant="outline" size="sm" onClick={handleZoomIn}>
          <span className="text-lg">+</span>
        </Button>
      </div>

      {/* Timeline visualization */}
      <div 
        className="bg-white p-6 rounded-lg shadow-lg overflow-x-auto"
        style={{ 
          transform: `scale(${zoomLevel})`, 
          transformOrigin: 'top left',
          minHeight: '500px'
        }}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading timeline data...</p>
          </div>
        ) : events && events.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-24 top-0 bottom-0 w-1 bg-gray-300"></div>
            
            {/* Timeline events */}
            <div className="space-y-12">
              {sortedYears.map(year => (
                <div key={year} className="relative">
                  {/* Year marker */}
                  <div className="absolute left-0 top-6 w-24 text-right pr-4 font-bold text-gray-700">
                    {year}
                  </div>
                  
                  {/* Year dot */}
                  <div className="absolute left-24 top-6 w-4 h-4 rounded-full bg-blue-500 -ml-1.5 z-10"></div>
                  
                  {/* Events for this year */}
                  <div className="ml-32 space-y-4">
                    {groupedEvents[year].map(event => (
                      <div 
                        key={event.id} 
                        className="p-4 rounded-lg shadow border-l-4"
                        style={{ 
                          borderLeftColor: event.series?.color_code || getSeriesColor(event.series_id),
                          opacity: event.importance ? 0.5 + (event.importance * 0.1) : 1
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                          {event.series && (
                            <span 
                              className="text-xs px-2 py-1 rounded"
                              style={{ 
                                backgroundColor: event.series.color_code,
                                color: 'white'
                              }}
                            >
                              {event.series.name}
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="mt-2 text-gray-700">{event.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p>No timeline events found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelinePage;