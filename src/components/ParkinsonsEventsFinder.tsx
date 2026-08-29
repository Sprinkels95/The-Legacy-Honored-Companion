import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, MapPin, Video, ExternalLink, Sparkles, 
  Search, CheckCircle2, Bookmark, Heart, Award
} from 'lucide-react';
import { CommunityEvent } from '../types';

export const ParkinsonsEventsFinder: React.FC = () => {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState('San Francisco Bay Area');
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);

  const fetchEvents = async (locationStr?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/agent/events-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: locationStr || searchLocation
        })
      });
      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Error fetching community events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const toggleSaveEvent = (id: string) => {
    setSavedEventIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAddToCalendar = (event: CommunityEvent) => {
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description + "\n\nContact: " + (event.contactEmail || 'N/A'))}&location=${encodeURIComponent(event.address)}`;
    window.open(calendarUrl, '_blank');
  };

  return (
    <div id="parkinsons-events-finder-container" className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-serif">
                Community Discovery & Support Grounding Agent
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Connects Captain Wade and family caregivers with local Rock Steady Boxing, Dance for PD, and caregiver support circles to combat isolation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              Gemini Google Search Grounding
            </span>

            {/* Location search bar */}
            <form 
              onSubmit={(e) => { e.preventDefault(); fetchEvents(searchLocation); }}
              className="flex items-center gap-2 w-full md:w-auto"
            >
              <div className="relative flex-1 md:w-56">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="City or Metro Area..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                <span>{isLoading ? 'Searching...' : 'Find Programs'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* AI Role Explanation Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-indigo-900">What the Community AI Does: </span>
              <span className="text-indigo-800">
                Grounds live Google Search to discover localized, verified Parkinson's Foundation chapters, Rock Steady Boxing gyms, and respite circles tailored to Wade's mobility level and Elsbeth's caregiver support needs.
              </span>
            </div>
          </div>
        </div>

        {/* Quick Program Pills */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-100">
          {['Rock Steady Boxing', 'Dance for PD', 'Caregiver Circles', 'Aquatic Therapy', 'Educational Webinars'].map((tag, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSearchLocation(`${searchLocation} (${tag})`);
                fetchEvents(`${searchLocation} (${tag})`);
              }}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event) => {
          const isSaved = savedEventIds.includes(event.id);

          return (
            <div
              key={event.id}
              id={`event-card-${event.id}`}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-indigo-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-100/80 text-indigo-700">
                      {event.eventType}
                    </span>
                    {event.virtualAvailable && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        <span>Online Available</span>
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold text-slate-500">{event.cost}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{event.title}</h3>
                <p className="text-xs font-semibold text-indigo-600 mb-2">{event.organization}</p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{event.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{event.date} • {event.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate" title={event.address}>{event.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => toggleSaveEvent(event.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-colors ${
                      isSaved
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{isSaved ? 'Saved to Favorites' : 'Save'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddToCalendar(event)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>1-Click Google Calendar</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
