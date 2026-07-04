import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AdminStatsCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  change?: number;
  sparklineData?: number[];
  gradient?: string;
  className?: string;
}

function useAnimatedCounter(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      if (current !== start) {
        start = current;
        setCount(current);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
}

function MiniSparkline({ data, color = '#3b82f6' }: { data: number[]; color?: string }) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 32;
  const padding = 2;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = padding + ((max - val) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathD = `M${points.join(' L')}`;
  const areaD = `${pathD} L${width - padding},${height - padding} L${padding},${height - padding} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#spark-${color.replace('#', '')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const AdminStatsCard: React.FC<AdminStatsCardProps> = ({
  icon,
  value,
  label,
  change,
  sparklineData,
  gradient = 'from-blue-500/20 to-purple-500/20',
  className = '',
}) => {
  const animatedValue = useAnimatedCounter(value);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`
        relative overflow-hidden rounded-2xl border border-white/10
        bg-white/5 backdrop-blur-xl shadow-xl shadow-black/10
        ${className}
      `}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`} />
      <div className="relative p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-3">
              <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                {icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-white tabular-nums">
              {animatedValue.toLocaleString()}
            </p>
            <p className="text-sm text-white/50 mt-1">{label}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {sparklineData && (
              <MiniSparkline data={sparklineData} color={change !== undefined && change >= 0 ? '#10b981' : '#ef4444'} />
            )}
            {change !== undefined && (
              <div
                className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
                  ${change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}
                `}
              >
                {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(change)}%
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminStatsCard;
