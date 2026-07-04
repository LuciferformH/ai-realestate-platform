import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  onTimeRangeChange?: (range: string) => void;
  onExport?: (format: string) => void;
}

const timeRanges = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
  { label: '1y', value: '1y' },
];

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  onTimeRangeChange,
  onExport,
}) => {
  const [activeRange, setActiveRange] = useState('30d');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleRangeChange = (range: string) => {
    setActiveRange(range);
    onTimeRangeChange?.(range);
  };

  const handleExport = (format: string) => {
    onExport?.(format);
    setShowExportMenu(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl hover:bg-white/10 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          {onTimeRangeChange && (
            <div className="flex bg-white/5 rounded-lg p-1">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => handleRangeChange(range.value)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeRange === range.value
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}

          {/* Export Button */}
          {onExport && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                title="Export"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>

              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-10"
                >
                  <button
                    onClick={() => handleExport('png')}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 rounded-t-lg transition-colors"
                  >
                    Export PNG
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 rounded-b-lg transition-colors"
                  >
                    Export CSV
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chart Content */}
      <div className="w-full">{children}</div>
    </motion.div>
  );
};

export default ChartCard;
