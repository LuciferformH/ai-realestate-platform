import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: number;
  trend?: number;
  icon?: string;
  gradient?: string;
  isCurrency?: boolean;
  loading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  trend = 0,
  icon = '📊',
  gradient = 'from-blue-500 to-cyan-400',
  isCurrency = false,
  loading = false,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (loading || value === 0) return;

    let start = 0;
    const end = value;
    const duration = 1500;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, loading]);

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gray-700 rounded-xl" />
            <div className="h-4 bg-gray-700 rounded w-24" />
          </div>
          <div className="h-8 bg-gray-700 rounded w-32 mb-2" />
          <div className="h-4 bg-gray-700 rounded w-20" />
        </div>
      </div>
    );
  }

  const formatValue = (val: number) => {
    if (isCurrency) {
      if (val >= 1000000) {
        return `$${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `$${(val / 1000).toFixed(1)}K`;
      }
      return `$${val.toLocaleString()}`;
    }
    return val.toLocaleString();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-lg`}
        >
          {icon}
        </div>
        <span className="text-gray-400 text-sm font-medium">{title}</span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <motion.p
            className="text-3xl font-bold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {formatValue(displayValue)}
          </motion.p>

          <div className="flex items-center gap-1 mt-1">
            {trend !== 0 && (
              <>
                <span
                  className={`text-sm font-medium ${
                    trend > 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
                </span>
                <span className="text-gray-500 text-xs">vs last month</span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
