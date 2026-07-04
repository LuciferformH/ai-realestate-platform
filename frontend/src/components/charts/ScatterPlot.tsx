import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ScatterPlotProps {
  data: Array<{
    x: number;
    y: number;
    z?: number;
    name?: string;
    [key: string]: unknown;
  }>;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  height?: number;
  loading?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 shadow-xl">
      {data.name && <p className="text-white font-medium mb-1">{data.name}</p>}
      <p className="text-gray-300 text-sm">
        X: <span className="text-white font-medium">{data.x?.toLocaleString()}</span>
      </p>
      <p className="text-gray-300 text-sm">
        Y: <span className="text-white font-medium">{data.y?.toLocaleString()}</span>
      </p>
      {data.z && (
        <p className="text-gray-300 text-sm">
          Size: <span className="text-white font-medium">{data.z?.toLocaleString()}</span>
        </p>
      )}
    </div>
  );
};

export const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  xLabel = 'X Axis',
  yLabel = 'Y Axis',
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
      <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          type="number"
          dataKey="x"
          name={xLabel}
          stroke="#9ca3af"
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          label={{
            value: xLabel,
            position: 'insideBottomRight',
            offset: -10,
            fill: '#9ca3af',
          }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={yLabel}
          stroke="#9ca3af"
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          label={{
            value: yLabel,
            angle: -90,
            position: 'insideLeft',
            fill: '#9ca3af',
          }}
        />
        {data.some(d => d.z) && (
          <ZAxis
            type="number"
            dataKey="z"
            range={[40, 400]}
          />
        )}
        <Tooltip content={<CustomTooltip />} />
        <Scatter
          name="Properties"
          data={data}
          fill="#3b82f6"
          fillOpacity={0.7}
          stroke="#3b82f6"
          strokeWidth={1}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default ScatterPlot;
