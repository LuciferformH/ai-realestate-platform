import React, { useState } from 'react';

interface HeatMapProps {
  data: number[][];
  rowLabels: string[];
  colLabels: string[];
  title?: string;
  height?: number;
  loading?: boolean;
}

const getColor = (value: number, min: number, max: number): string => {
  const ratio = (value - min) / (max - min || 1);

  if (ratio < 0.2) return 'bg-blue-500';
  if (ratio < 0.4) return 'bg-cyan-500';
  if (ratio < 0.6) return 'bg-green-500';
  if (ratio < 0.8) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getTextColor = (value: number, min: number, max: number): string => {
  const ratio = (value - min) / (max - min || 1);
  return ratio > 0.5 ? 'text-white' : 'text-gray-900';
};

export const HeatMap: React.FC<HeatMapProps> = ({
  data,
  rowLabels,
  colLabels,
  height = 300,
  loading = false,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-pulse flex space-x-4">
          <div className="h-4 bg-gray-700 rounded w-32" />
          <div className="h-4 bg-gray-700 rounded w-24" />
          <div className="h-4 bg-gray-700 rounded w-28" />
        </div>
      </div>
    );
  }

  const allValues = data.flat();
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);

  return (
    <div style={{ height }} className="overflow-auto">
      <div className="min-w-full">
        {/* Column headers */}
        <div className="flex">
          <div className="w-24 flex-shrink-0" />
          {colLabels.map((label, colIndex) => (
            <div
              key={colIndex}
              className="flex-1 text-center text-xs text-gray-400 font-medium py-2"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {/* Row label */}
            <div className="w-24 flex-shrink-0 text-xs text-gray-400 font-medium pr-2 flex items-center justify-end">
              {rowLabels[rowIndex]}
            </div>

            {/* Cells */}
            {row.map((value, colIndex) => (
              <div
                key={colIndex}
                className={`flex-1 aspect-square flex items-center justify-center text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-105 hover:z-10 ${getColor(
                  value,
                  min,
                  max
                )} ${getTextColor(value, min, max)} ${
                  hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                    : ''
                }`}
                onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                onMouseLeave={() => setHoveredCell(null)}
                style={{ minHeight: '40px' }}
              >
                {value}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div className="fixed bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 shadow-xl z-50 pointer-events-none">
          <p className="text-white font-medium">
            {rowLabels[hoveredCell.row]} - {colLabels[hoveredCell.col]}
          </p>
          <p className="text-gray-300 text-sm">
            Value: <span className="text-white font-medium">{data[hoveredCell.row][hoveredCell.col]}</span>
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="text-xs text-gray-400">Low</span>
        <div className="flex gap-1">
          {['bg-blue-500', 'bg-cyan-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'].map(
            (color, i) => (
              <div key={i} className={`w-6 h-3 rounded ${color}`} />
            )
          )}
        </div>
        <span className="text-xs text-gray-400">High</span>
      </div>
    </div>
  );
};

export default HeatMap;
