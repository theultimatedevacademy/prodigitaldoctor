/**
 * DateRangePicker Component
 * A button that opens a calendar dropdown for date range selection
 */

import { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';

export function DateRangePicker({ startDate, endDate, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [activeQuickSelect, setActiveQuickSelect] = useState(null);
  const dropdownRef = useRef(null);

  // Sync temp dates when props change (e.g., when filters are cleared)
  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setActiveQuickSelect(null);
  }, [startDate, endDate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Get today's date in local timezone (YYYY-MM-DD)
  const getTodayLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Apply changes immediately
  const applyDateChange = (start, end, quickSelectType = null) => {
    setTempStartDate(start);
    setTempEndDate(end);
    setActiveQuickSelect(quickSelectType);
    onChange({ startDate: start, endDate: end });
  };

  const formatDateRange = () => {
    // Handle empty or invalid dates
    if (!startDate || !endDate || startDate === '' || endDate === '') {
      return 'Select Date';
    }
    
    const today = getTodayLocal();
    
    if (startDate === today && endDate === today) {
      return 'Today';
    }
    
    if (startDate === endDate) {
      const [year, month, day] = startDate.split('-');
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
    
    const [startYear, startMonth, startDay] = startDate.split('-');
    const [endYear, endMonth, endDay] = endDate.split('-');
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    
    // Same year
    if (start.getFullYear() === end.getFullYear()) {
      // Same month
      if (start.getMonth() === end.getMonth()) {
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`;
      }
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const setQuickRange = (range) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    
    let start, end;

    switch (range) {
      case 'today':
        start = end = getTodayLocal();
        break;
      case 'yesterday':
        const yesterday = new Date(year, month, day - 1);
        start = end = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        break;
      case 'last7days':
        end = getTodayLocal();
        const weekAgo = new Date(year, month, day - 6);
        start = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`;
        break;
      case 'last30days':
        end = getTodayLocal();
        const monthAgo = new Date(year, month, day - 29);
        start = `${monthAgo.getFullYear()}-${String(monthAgo.getMonth() + 1).padStart(2, '0')}-${String(monthAgo.getDate()).padStart(2, '0')}`;
        break;
      case 'thisMonth':
        const firstDay = new Date(year, month, 1);
        start = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-${String(firstDay.getDate()).padStart(2, '0')}`;
        end = getTodayLocal();
        break;
      default:
        return;
    }

    applyDateChange(start, end, range);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <Calendar className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">{formatDateRange()}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 min-w-[320px]">
          {/* Quick Select Buttons */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">Quick Select</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setQuickRange('today')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeQuickSelect === 'today'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setQuickRange('yesterday')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeQuickSelect === 'yesterday'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                Yesterday
              </button>
              <button
                onClick={() => setQuickRange('last7days')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeQuickSelect === 'last7days'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setQuickRange('last30days')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeQuickSelect === 'last30days'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setQuickRange('thisMonth')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors col-span-2 ${
                  activeQuickSelect === 'thisMonth'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                This Month
              </button>
            </div>
          </div>

          {/* Date Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
              <input
                type="date"
                value={tempStartDate}
                onChange={(e) => {
                  const newStart = e.target.value;
                  const newEnd = tempEndDate < newStart ? newStart : tempEndDate;
                  applyDateChange(newStart, newEnd, null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
              <input
                type="date"
                value={tempEndDate}
                onChange={(e) => {
                  applyDateChange(tempStartDate, e.target.value, null);
                }}
                min={tempStartDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
