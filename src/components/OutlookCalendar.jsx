
import React, { useState } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

function OutlookCalendar({ events = [] }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const hasEvents = events.some(event => {
        try {
          return new Date(event.start?.dateTime).toDateString() === date.toDateString();
        } catch {
          return false;
        }
      });
      
      const isToday = date.toDateString() === new Date().toDateString();
      const isCurrentMonth = date.getMonth() === month;
      const isSelected = date.toDateString() === selectedDate.toDateString();
      
      days.push({
        date,
        hasEvents,
        isToday,
        isCurrentMonth,
        isSelected,
        dayNumber: date.getDate()
      });
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const calendarDays = generateCalendarDays();
  const monthYear = selectedDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <div className="space-y-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-600">
              {monthYear}
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={index} className="text-xs font-medium text-gray-500 text-center py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => (
              <motion.button
                key={`${day.date.toISOString()}-${i}`}
                onClick={() => setSelectedDate(day.date)}
                className={`
                  relative h-10 w-full text-sm font-medium rounded-lg transition-all duration-200
                  ${day.isToday 
                    ? 'border-2 border-blue-300 bg-white text-black'

                    : day.isSelected && !day.isToday
                      ? 'bg-gray-700 text-white'
                      :day.isCurrentMonth
  ? 'text-black hover:bg-blue-50 hover:text-black'
  : 'text-gray-400 hover:bg-gray-100'

                  }
                  ${!day.isCurrentMonth ? 'opacity-40' : ''}
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ 
                  duration: 0.2,
                  delay: i * 0.005,
                }}
              >
                {day.dayNumber}
                
                {/* Event indicator - subtle dot */}
                {day.hasEvents && day.isCurrentMonth && (
                  <div className={`
                    absolute bottom-1 left-1/2 transform -translate-x-1/2 
                    w-1 h-1 rounded-full
                    ${day.isToday 
                      ? 'bg-white/80' 
                      : day.isSelected 
                        ? 'bg-blue-400' 
                        : 'bg-blue-500'
                    }
                  `} />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Simple footer */}
      <div className="flex items-center justify-center">
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>Updated {new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}</span>
        </div>
      </div>
    </div>
  );
}

export default OutlookCalendar;
