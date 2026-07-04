import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

interface TreemapChartProps {
  data: Array<{
    name: string;
    value: number;
    children?: Array<{ name: string; value: number }>;
    [key: string]: unknown;
  }>;
  title?: string;
  height?: number;
  loading?: boolean;
}

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#6366f1', '#d946ef', '#f97316', '#14b8a6',
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 shadow-xl">
      <p className="text-white font-medium">{data.name}</p>
      <p className="text-gray-300 text-sm">
        Value: <span className="text-white font-medium">{data.value?.toLocaleString()}</span>
      </p>
    </div>
  );
};

const CustomContent = (props: any) => {
  const { x, y, width, height, name, value, depth, index } = props;

  if (depth === 1) {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: COLORS[index % COLORS.length],
            stroke: 'rgba(0,0,0,0.2)',
            strokeWidth: 2,
            rx: 4,
            ry: 4,
          }}
        />
        {width > 60 && height > 30 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 8}
              textAnchor="middle"
              fill="white"
              fontSize={14}
              fontWeight="bold"
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 12}
              textAnchor="middle"
              fill="rgba(255,255,255,0.8)"
              fontSize={12}
            >
              {value?.toLocaleString()}
            </text>
          </>
        )}
      </g>
    );
  }

  return null;
};

export const TreemapChart: React.FC<TreemapChartProps> = ({
  data,
  height = 300,
  loading = false,
}) => {
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

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Treemap
        data={data}
        dataKey="value"
        aspectRatio={4 / 3}
        content={<CustomContent />}
      >
        <Tooltip content={<CustomTooltip />} />
      </Treemap>
    </ResponsiveContainer>
  );
};

export default TreemapChart;
