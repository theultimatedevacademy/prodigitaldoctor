/**
 * Waitlist Progress Component
 * Shows current waitlist signup progress
 */

import { Users, TrendingUp } from "lucide-react";
import { launchConfig } from "../config/launchConfig";

export function WaitlistProgress({ className = "" }) {
  const { current, goal } = launchConfig.waitlist;
  const progressPercentage = launchConfig.waitlist.percentage;

  return (
    <div
      className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Waitlist Progress</h3>
        </div>
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">Growing</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold text-blue-600">{current}</span>
          <span className="text-sm text-gray-600">of {goal} goal</span>
        </div>
        <div className="h-3 bg-blue-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-gray-700">
        <strong>{goal - current} spots remaining</strong> for early bird pricing
      </p>
    </div>
  );
}

export default WaitlistProgress;
