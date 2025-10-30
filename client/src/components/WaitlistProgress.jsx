import { useState, useEffect } from "react";
import { Users, TrendingUp, Loader2 } from "lucide-react";
import { fetchWaitlistCount } from "../utils/waitlistApi";

export function WaitlistProgress() {
  const [stats, setStats] = useState({
    current: 0,
    goal: 500,
    loading: true,
  });

  useEffect(() => {
    // Fetch count on mount
    const loadCount = async () => {
      const data = await fetchWaitlistCount();
      setStats({
        current: data.count,
        goal: data.goal,
        loading: false,
      });
    };

    loadCount();

    // Refresh every 30 seconds
    const interval = setInterval(loadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const percentage = Math.min((stats.current / stats.goal) * 100, 100);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Waitlist Progress</h3>
        </div>
        <div className="flex items-center gap-1 text-green-600">
          {stats.loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <TrendingUp className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {stats.loading ? "Loading..." : `${stats.current} joined`}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {stats.loading
            ? "Loading..."
            : `${stats.current} of ${stats.goal} early adopters`}
        </span>
        <span className="font-bold text-blue-600">
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

export default WaitlistProgress;
