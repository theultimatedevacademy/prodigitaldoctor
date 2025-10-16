/**
 * FirstVisitForm Component
 * Form for booking first visit appointments
 */

import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Calendar } from 'lucide-react';

const FirstVisitForm = ({ formData, onChange, errors, doctors, selectedClinic }) => {
  const [quickDates, setQuickDates] = useState([]);
  const [quickTimes, setQuickTimes] = useState([]);
  const [timeHour, setTimeHour] = useState('');
  const [timeMinute, setTimeMinute] = useState('');
  const [timePeriod, setTimePeriod] = useState('AM');

  useEffect(() => {
    // Generate quick date options (today, tomorrow, day after)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    const day3 = new Date(today);
    day3.setDate(day3.getDate() + 3);
    const day4 = new Date(today);
    day4.setDate(day4.getDate() + 4);
    const day5 = new Date(today);
    day5.setDate(day5.getDate() + 5);

    setQuickDates([
      { label: 'Today', value: formatDate(today), date: today },
      { label: 'Tomorrow', value: formatDate(tomorrow), date: tomorrow },
      { label: formatDateDisplay(dayAfter), value: formatDate(dayAfter), date: dayAfter },
      { label: formatDateDisplay(day3), value: formatDate(day3), date: day3 },
      { label: formatDateDisplay(day4), value: formatDate(day4), date: day4 },
      { label: formatDateDisplay(day5), value: formatDate(day5), date: day5 },
    ]);

    // Generate quick time options
    setQuickTimes([
      { label: '9:00', hour: '9', minute: '00', period: 'AM', value: '09:00', isPM: false },
      { label: '9:30', hour: '9', minute: '30', period: 'AM', value: '09:30', isPM: false },
      { label: '10:00', hour: '10', minute: '00', period: 'AM', value: '10:00', isPM: false },
      { label: '10:30', hour: '10', minute: '30', period: 'AM', value: '10:30', isPM: false },
      { label: '11:00', hour: '11', minute: '00', period: 'AM', value: '11:00', isPM: false },
      { label: '11:30', hour: '11', minute: '30', period: 'AM', value: '11:30', isPM: false },
      { label: '6:00', hour: '6', minute: '00', period: 'PM', value: '18:00', isPM: true },
      { label: '6:30', hour: '6', minute: '30', period: 'PM', value: '18:30', isPM: true },
      { label: '7:00', hour: '7', minute: '00', period: 'PM', value: '19:00', isPM: true },
      { label: '7:30', hour: '7', minute: '30', period: 'PM', value: '19:30', isPM: true },
      { label: '8:00', hour: '8', minute: '00', period: 'PM', value: '20:00', isPM: true },
      { label: '8:30', hour: '8', minute: '30', period: 'PM', value: '20:30', isPM: true },
    ]);

    // Auto-fill today's date if not set
    if (!formData.date) {
      onChange({ target: { name: 'date', value: formatDate(today) } });
    }
  }, []);

  useEffect(() => {
    // Auto-select first doctor if available and not already selected
    if (doctors.length > 0 && !formData.doctor) {
      onChange({ target: { name: 'doctor', value: doctors[0]._id } });
    }
  }, [doctors]);

  // Sync time components with formData.time
  useEffect(() => {
    if (formData.time) {
      const parsed = parseTime(formData.time);
      setTimeHour(parsed.hour);
      setTimeMinute(parsed.minute);
      setTimePeriod(parsed.period);
    }
  }, []);

  const formatDate = (date) => {
    // Format date in local timezone, not UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateToDDMMYYYY = (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatDateFromDDMMYYYY = (ddmmyyyy) => {
    if (!ddmmyyyy) return '';
    const [day, month, year] = ddmmyyyy.split('/');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date) => {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Parse time from HH:mm format to hour, minute, period
  const parseTime = (time) => {
    if (!time) return { hour: '', minute: '', period: 'AM' };
    const [hourStr, minuteStr] = time.split(':');
    const hour24 = parseInt(hourStr);
    
    if (hour24 === 0) {
      return { hour: '12', minute: minuteStr, period: 'AM' };
    } else if (hour24 < 12) {
      return { hour: String(hour24), minute: minuteStr, period: 'AM' };
    } else if (hour24 === 12) {
      return { hour: '12', minute: minuteStr, period: 'PM' };
    } else {
      return { hour: String(hour24 - 12), minute: minuteStr, period: 'PM' };
    }
  };

  // Convert hour, minute, period to HH:mm format
  const formatTimeToHHMM = (hour, minute, period) => {
    if (!hour || !minute || !period) return '';
    let hour24 = parseInt(hour);
    
    if (period === 'AM') {
      if (hour24 === 12) hour24 = 0;
    } else {
      if (hour24 !== 12) hour24 += 12;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
  };

  const handleTimeChange = (field, value) => {
    let newHour = timeHour;
    let newMinute = timeMinute;
    let newPeriod = timePeriod;
    
    if (field === 'hour') {
      newHour = value;
      setTimeHour(value);
    } else if (field === 'minute') {
      newMinute = value;
      setTimeMinute(value);
    } else if (field === 'period') {
      newPeriod = value;
      setTimePeriod(value);
    }
    
    // Only set the time if all components are selected
    if (newHour && newMinute && newPeriod) {
      const formattedTime = formatTimeToHHMM(newHour, newMinute, newPeriod);
      onChange({ target: { name: 'time', value: formattedTime } });
    }
  };

  const hours = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const minutes = ['00', '15', '30', '45'];

  return (
    <div className="space-y-6">
      {/* Doctor Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Doctor *
        </label>
        <select
          name="doctor"
          value={formData.doctor}
          onChange={onChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.doctor ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor._id} value={doctor._id}>
              {doctor.name} {doctor.isOwner ? '(Owner)' : ''}
            </option>
          ))}
        </select>
        {errors.doctor && (
          <p className="text-red-500 text-sm mt-1">{errors.doctor}</p>
        )}
      </div>

      {/* Patient Name and Phone Number - Same line on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Patient Name *
          </label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="Enter patient's full name"
            error={errors.name}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            placeholder="10-digit mobile number"
            error={errors.phone}
            maxLength="10"
          />
        </div>
      </div>

      {/* Date and Time - Same line on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date *
          </label>
          <input
            type="text"
            name="date"
            value={formData.date ? formatDateToDDMMYYYY(formData.date) : ''}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
              
              // Auto-format with slashes as user types
              if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
              }
              if (value.length >= 5) {
                value = value.substring(0, 5) + '/' + value.substring(5);
              }
              
              // Limit to 10 characters (DD/MM/YYYY)
              value = value.substring(0, 10);
              
              // If complete date entered, convert to ISO format
              if (value.length === 10) {
                const [day, month, year] = value.split('/');
                if (day && month && year) {
                  const dayNum = parseInt(day);
                  const monthNum = parseInt(month);
                  const yearNum = parseInt(year);
                  
                  // Basic validation
                  if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900) {
                    const isoDate = `${year}-${month}-${day}`;
                    onChange({ target: { name: 'date', value: isoDate } });
                    return;
                  }
                }
              }
              
              // For partial input, temporarily store in a custom attribute
              e.target.setAttribute('data-partial-date', value);
            }}
            onKeyUp={(e) => {
              // Show the formatted partial input
              const partial = e.target.getAttribute('data-partial-date');
              if (partial && partial.length < 10) {
                e.target.value = partial;
              }
            }}
            placeholder="DD/MM/YYYY"
            maxLength="10"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date}</p>
          )}
          
          {/* Quick Date Selector */}
          <div className="mt-3 grid grid-cols-6 gap-2">
            {quickDates.map((quickDate) => (
              <button
                key={quickDate.value}
                type="button"
                onClick={() => onChange({ target: { name: 'date', value: quickDate.value } })}
                className={`col-span-2 px-2 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  formData.date === quickDate.value
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <Calendar className="w-3 h-3 inline mr-1" />
                {quickDate.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection - Hour, Minute, AM/PM */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time *
          </label>
          <div className="flex gap-2">
            {/* Hour */}
            <select
              value={timeHour}
              onChange={(e) => handleTimeChange('hour', e.target.value)}
              className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.time ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">HH</option>
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h.padStart(2, '0')}
                </option>
              ))}
            </select>
            
            <span className="flex items-center text-gray-500 font-semibold">:</span>
            
            {/* Minute */}
            <select
              value={timeMinute}
              onChange={(e) => handleTimeChange('minute', e.target.value)}
              className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.time ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">MM</option>
              {minutes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            
            {/* AM/PM */}
            <select
              value={timePeriod}
              onChange={(e) => handleTimeChange('period', e.target.value)}
              className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.time ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
          {errors.time && (
            <p className="text-red-500 text-sm mt-1">{errors.time}</p>
          )}
          
          {/* Quick Time Selector */}
          <div className="mt-3 grid grid-cols-6 gap-2">
            {quickTimes.map((quickTime) => (
              <button
                key={quickTime.value}
                type="button"
                onClick={() => {
                  setTimeHour(quickTime.hour);
                  setTimeMinute(quickTime.minute);
                  setTimePeriod(quickTime.period);
                  onChange({ target: { name: 'time', value: quickTime.value } });
                }}
                className={`px-2 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  formData.time === quickTime.value
                    ? quickTime.isPM ? 'bg-blue-600 text-white border-blue-600' : 'bg-amber-500 text-white border-amber-500'
                    : quickTime.isPM ? 'bg-blue-50 text-gray-700 border-blue-200 hover:bg-blue-100' : 'bg-amber-50 text-gray-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                {quickTime.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstVisitForm;
