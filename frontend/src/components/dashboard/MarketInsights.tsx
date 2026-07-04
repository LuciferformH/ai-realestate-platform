import React from 'react';
import { motion } from 'framer-motion';

interface MarketInsightsProps {
  loading?: boolean;
}

const insights = [
  {
    category: 'Top Performing Cities',
    items: [
      { name: 'San Francisco', growth: '+12.5%', positive: true },
      { name: 'Austin', growth: '+9.8%', positive: true },
      { name: 'Miami', growth: '+8.2%', positive: true },
      { name: 'Seattle', growth: '+7.5%', positive: true },
    ],
  },
  {
    category: 'Price Trends',
    items: [
      { name: 'Single Family', trend: 'Rising', positive: true },
      { name: 'Condos', trend: 'Stable', positive: true },
      { name: 'Townhouses', trend: 'Rising', positive: true },
      { name: 'Multi-Family', trend: 'Declining', positive: false },
    ],
  },
  {
    category: 'Investment Opportunities',
    items: [
      { name: 'Emerging Neighborhoods', score: '8.5/10', positive: true },
      { name: 'Undervalued Markets', score: '7.8/10', positive: true },
      { name: 'High ROI Areas', score: '9.2/10', positive: true },
      { name: 'Growth Corridors', score: '8.0/10', positive: true },
    ],
  },
  {
    category: 'Market Health',
    items: [
      { name: 'Inventory Level', status: 'Low', positive: false },
      { name: 'Days on Market', status: '18 days', positive: true },
      { name: 'Absorption Rate', status: 'High', positive: true },
      { name: 'Price-to-Rent', status: '28.5', positive: true },
    ],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const MarketInsights: React.FC<MarketInsightsProps> = ({ loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-4" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-700 rounded w-full" />
              <div className="h-3 bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-700 rounded w-5/6" />
              <div className="h-3 bg-gray-700 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {insights.map((insight) => (
        <motion.div
          key={insight.category}
          variants={item}
          className="bg-white/5 rounded-xl p-4 border border-white/10"
        >
          <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {insight.category}
          </h4>

          <ul className="space-y-2">
            {insight.items.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-300 truncate">{item.name}</span>
                <span
                  className={`font-medium ${
                    item.positive ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {'growth' in item ? item.growth : 'trend' in item ? item.trend : 'score' in item ? item.score : item.status}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MarketInsights;
