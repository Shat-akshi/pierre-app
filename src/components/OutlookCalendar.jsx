import React, { useState } from 'react';
import { Calendar, Clock, User, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import TechButton from './TechButton';

// Enhanced OutlookCalendar Component
function OutlookCalendar({ events }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('agenda');
  const [hoveredEventId, setHoveredEventId] = useState(null);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColors = (priority) => {
    const baseClasses = 'border-l-4 transition-all duration-300';
    const priorityMap = {
      critical: 'border-l-red-500 bg-gradient-to-r from-red-500/10 to-transparent',
      high: 'border-l-orange-500 bg-gradient-to-r from-orange-500/10 to-transparent',
      medium: 'border-l-blue-500 bg-gradient-to-r from-blue-500/10 to-transparent'
    };
    
    return `${baseClasses} ${priorityMap[priority]}`;
  };

  const upcomingEvents = events
    .filter(event => new Date(event.start.dateTime) >= new Date())
    .sort((a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* <h4 className="font-bold text-xl flex items-center gap-3 text-white">
          <Calendar className="w-6 h-6 text-blue-400" />
          <span className="text-transparent bg-clip-text" style={{
            backgroundImage: 'linear-gradient(90deg, #f9fafb, #60a5fa)'
          }}>Executive Calendar</span>
        </h4> */}
        <div className="flex gap-2">
          {/* <TechButton
            onClick={() => setView('agenda')}
            primary={view === 'agenda'}
            className="px-4 py-2 text-sm"
          >
            <span className="font-medium">Agenda</span>
          </TechButton> */}
          <TechButton
            onClick={() => setView('calendar')}
            primary={view === 'calendar'}
            className="px-4 py-2 text-sm"
          >
            <span className="font-medium">Calendar</span>
          </TechButton>
        </div>
      </motion.div>

      <GlassCard className="p-6">
        {view === 'agenda' ? (
          <div className="space-y-4">
            <h5 className="font-semibold text-lg text-gray-300">
              Upcoming Meetings
            </h5>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <motion.div 
                    key={event.id} 
                    className={`p-5 rounded-2xl backdrop-blur-md group ${getPriorityColors(event.priority)} bg-gray-900/60`}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.5,
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100,
                      damping: 20
                    }}
                    whileHover={{ 
                      scale: 1.02, 
                      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3), 0 5px 15px rgba(59, 130, 246, 0.1)'
                    }}
                    onMouseEnter={() => setHoveredEventId(event.id)}
                    onMouseLeave={() => setHoveredEventId(null)}
                    style={{
                      boxShadow: hoveredEventId === event.id
                        ? '0 15px 30px rgba(0, 0, 0, 0.3), 0 5px 15px rgba(59, 130, 246, 0.1)'
                        : '0 5px 15px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-lg mb-2 text-white">
                          {event.subject}
                        </div>
                        <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {formatDate(event.start.dateTime)} at {formatTime(event.start.dateTime)}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{event.organizer.emailAddress.name}</span>
                          {event.organizer.emailAddress.title && (
                            <span className="ml-2">• {event.organizer.emailAddress.title}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {event.priority === 'critical' && 
                          <div className="relative">
                            <Star className="w-5 h-5 text-red-400 fill-current" />
                            <motion.div 
                              className="absolute inset-0 rounded-full bg-red-500 opacity-30"
                              animate={{ 
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 0, 0.3]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "loop"
                              }}
                            />
                          </div>
                        }
                        <ChevronRight className={`w-5 h-5 text-gray-500 transition-all duration-300 ${hoveredEventId === event.id ? 'translate-x-1 text-blue-400' : ''}`} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="text-center py-12 text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium mb-2">No upcoming meetings</div>
                <div className="text-sm">Your calendar is clear</div>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-7 gap-2 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-sm font-semibold p-3 text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - date.getDay() + i);
                const hasEvents = events.some(event => 
                  new Date(event.start.dateTime).toDateString() === date.toDateString()
                );
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <motion.button
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    className={`p-3 text-sm rounded-xl transition-all duration-300 font-medium transform perspective-[1000px] ${
                      isToday 
                        ? 'bg-blue-600 text-white' 
                        : hasEvents 
                          ? 'bg-blue-900/30 text-blue-400 border border-blue-800' 
                          : 'text-gray-500 hover:bg-gray-800'
                    }`}
                    whileHover={{ scale: 1.1, rotateX: 5, rotateY: 5, z: 5 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 0.3,
                      delay: i * 0.01,
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }}
                    style={isToday ? {
                      boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)'
                    } : {}}
                  >
                    {date.getDate()}
                    
                    {/* Event indicator */}
                    {hasEvents && !isToday && (
                      <motion.div 
                        className="absolute bottom-1 left-1/2 w-1 h-1 rounded-full bg-blue-500"
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "loop",
                          delay: i * 0.05
                        }}
                        style={{
                          boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)',
                          transform: 'translateX(-50%)'
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </GlassCard>

      <motion.div 
        className="text-xs text-center text-gray-600 flex items-center justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Clock className="w-4 h-4" />
        <span>Last synced: {new Date().toLocaleTimeString()}</span>
      </motion.div>
    </div>
  );
}

export default OutlookCalendar;