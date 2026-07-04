import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PieChartProps {
  data: Array<Record<string, unknown>>;
  title?: string;
  colors?: string[];
  height?: number;
  loading?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  const data = payload[0];
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 shadow-xl">
      <p className="text-white font-medium">{data.name}</p>
      <p className="text-gray-300 text-sm">
        Value: <span className="text-white font-medium">{data.value?.toLocaleString()}</span>
      </p>
      <p className="text-gray-300 text-sm">
        Percentage: <span className="text-white font-medium">{((data.value / data.payload.total) * 100).toFixed(1)}%</span>
      </p>
    </div>
  );
};

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const PieChart: React.FC<PieChartProps> = ({
  data,
  colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
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

  const total = data.reduce((sum, item) => sum + (item.value as number || 0), 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={dataWithTotal}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={Math.min(height, 300) * 0.4}
            innerRadius={Math.min(height, 300) * 0.2}
            paddingAngle={2}
            dataKey="value"
          >
            {dataWithTotal.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                stroke="rgba(0,0,0,0.2)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-3xl font-bold text-white">{total.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Total</p>
        </div>
      </div>
    </div>
  );
};

export default PieChart;
