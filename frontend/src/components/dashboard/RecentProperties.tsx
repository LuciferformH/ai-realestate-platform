import React from 'react';
import { motion } from 'framer-motion';

interface Property {
  id: string | number;
  title: string;
  price: number;
  beds: number;
  baths: number;
  area: number;
  image?: string;
  city?: string;
}

interface RecentPropertiesProps {
  properties: Property[];
  loading?: boolean;
}

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
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export const RecentProperties: React.FC<RecentPropertiesProps> = ({
  properties,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="w-16 h-16 bg-gray-700 rounded-lg" />
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No recent properties</p>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3 max-h-96 overflow-y-auto pr-2"
      >
        {properties.map((property) => (
          <motion.div
            key={property.id}
            variants={item}
            className="flex gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200 cursor-pointer group"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800">
              {property.image ? (
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  🏠
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm truncate">
                {property.title}
              </h4>
              {property.city && (
                <p className="text-gray-400 text-xs truncate">{property.city}</p>
              )}
              <p className="text-blue-400 font-bold text-sm mt-1">
                ${property.price.toLocaleString()}
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-col items-end justify-between">
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <span>🛏️</span>
                <span>{property.beds}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <span>🚿</span>
                <span>{property.baths}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* View All Link */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <a
          href="/properties"
          className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center justify-center gap-1 transition-colors"
        >
          View all properties
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default RecentProperties;
