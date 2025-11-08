import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

export default function UpcomingEvents({ limit = 5 }) {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents((response.data.data || []).slice(0, limit));
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type) => {
    const colors = {
      holiday: 'from-red-500 to-rose-500',
      exam: 'from-orange-500 to-red-500',
      meeting: 'from-blue-500 to-cyan-500',
      sports: 'from-green-500 to-emerald-500',
      cultural: 'from-purple-500 to-pink-500',
      academic: 'from-indigo-500 to-blue-500',
      other: 'from-gray-500 to-slate-500'
    };
    return colors[type] || 'from-blue-500 to-cyan-500';
  };

  const isToday = (date) => {
    const today = new Date();
    const eventDate = new Date(date);
    return eventDate.toDateString() === today.toDateString();
  };

  const isTomorrow = (date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const eventDate = new Date(date);
    return eventDate.toDateString() === tomorrow.toDateString();
  };

  const getDateLabel = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isToday(startDate)) return 'Today';
    if (isTomorrow(startDate)) return 'Tomorrow';
    
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }
    
    return `${start.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
          <FaCalendarAlt className="text-blue-600" />
          Upcoming Events
        </h3>
        <div className="text-center py-8">
          <div className="animate-spin text-3xl mx-auto mb-2">⏳</div>
          <p className="text-gray-500 text-sm">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
        <FaCalendarAlt className="text-blue-600" />
        Upcoming Events
      </h3>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <FaCalendarAlt className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">No upcoming events</p>
          <p className="text-gray-400 text-sm">Check back later for updates</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event._id}
              className={`bg-gradient-to-r ${getEventTypeColor(event.eventType)} rounded-xl p-4 text-white hover:shadow-lg transition-all`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-black text-sm">{event.title}</h4>
                    {isToday(event.startDate) && (
                      <span className="px-2 py-0.5 bg-white bg-opacity-30 rounded-full text-xs font-bold">
                        TODAY
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-xs opacity-90 mb-2 line-clamp-2">{event.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-1 bg-white bg-opacity-20 px-2 py-1 rounded-full">
                      <FaCalendarAlt />
                      <span>{getDateLabel(event.startDate, event.endDate)}</span>
                    </div>
                    {event.startTime && (
                      <div className="flex items-center gap-1 bg-white bg-opacity-20 px-2 py-1 rounded-full">
                        <FaClock />
                        <span>{event.startTime}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-1 bg-white bg-opacity-20 px-2 py-1 rounded-full">
                        <FaMapMarkerAlt />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-bold uppercase">
                    {event.eventType}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

