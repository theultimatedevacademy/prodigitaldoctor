/**
 * Countdown Timer Component
 * Shows time remaining until launch date
 */

import { useState, useEffect } from 'react';
import { getTimeUntilLaunch } from '../config/launchConfig';

export function CountdownTimer({ className = '' }) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilLaunch());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilLaunch());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 px-4 py-3 sm:px-6 sm:py-4 min-w-[70px] sm:min-w-[90px]">
        <div className="text-2xl sm:text-4xl font-bold text-blue-600 tabular-nums">
          {String(value).padStart(2, '0')}
        </div>
      </div>
      <div className="text-xs sm:text-sm font-medium text-gray-600 mt-2">
        {label}
      </div>
    </div>
  );

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return (
      <div className={`text-center ${className}`}>
        <div className="inline-block bg-green-100 border-2 border-green-500 rounded-xl px-6 py-3">
          <p className="text-lg sm:text-xl font-bold text-green-700">
            🎉 We're Live Now!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        <TimeUnit value={timeLeft.days} label="Days" />
        <div className="text-2xl sm:text-4xl font-bold text-gray-400 pb-6">:</div>
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <div className="text-2xl sm:text-4xl font-bold text-gray-400 pb-6">:</div>
        <TimeUnit value={timeLeft.minutes} label="Minutes" />
        <div className="text-2xl sm:text-4xl font-bold text-gray-400 pb-6">:</div>
        <TimeUnit value={timeLeft.seconds} label="Seconds" />
      </div>
    </div>
  );
}

export default CountdownTimer;
