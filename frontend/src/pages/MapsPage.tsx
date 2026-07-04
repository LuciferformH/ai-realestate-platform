import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Property {
  id: number;
  address: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  type: string;
  lat: number;
  lng: number;
  city: string;
  image?: string;
}

const properties: Property[] = [
  { id: 1, address: '123 Oak Street', price: 485000, area: 1500, bedrooms: 3, bathrooms: 2, type: 'House', lat: 30.2672, lng: -97.7431, city: 'Austin' },
  { id: 2, address: '456 Maple Ave', price: 320000, area: 1100, bedrooms: 2, bathrooms: 1, type: 'Apartment', lat: 30.2682, lng: -97.7401, city: 'Austin' },
  { id: 3, address: '789 Pine Road', price: 725000, area: 2200, bedrooms: 4, bathrooms: 3, type: 'House', lat: 30.2652, lng: -97.7461, city: 'Austin' },
  { id: 4, address: '321 Cedar Lane', price: 285000, area: 900, bedrooms: 1, bathrooms: 1, type: 'Condo', lat: 30.2692, lng: -97.7421, city: 'Austin' },
  { id: 5, address: '654 Birch Blvd', price: 550000, area: 1800, bedrooms: 3, bathrooms: 2, type: 'Townhouse', lat: 30.2662, lng: -97.7441, city: 'Austin' },
  { id: 6, address: '987 Elm Court', price: 890000, area: 3000, bedrooms: 5, bathrooms: 4, type: 'House', lat: 30.2642, lng: -97.7471, city: 'Austin' },
  { id: 7, address: '147 Willow Way', price: 415000, area: 1400, bedrooms: 3, bathrooms: 2, type: 'House', lat: 30.2702, lng: -97.7391, city: 'Austin' },
  { id: 8, address: '258 Spruce Street', price: 340000, area: 1050, bedrooms: 2, bathrooms: 2, type: 'Condo', lat: 30.2675, lng: -97.7455, city: 'Austin' },
  { id: 9, address: '369 Aspen Drive', price: 620000, area: 2000, bedrooms: 4, bathrooms: 3, type: 'House', lat: 30.2645, lng: -97.7415, city: 'Austin' },
  { id: 10, address: '741 Poplar Place', price: 295000, area: 850, bedrooms: 1, bathrooms: 1, type: 'Apartment', lat: 30.2685, lng: -97.7435, city: 'Austin' }
];

const cityFilters = ['All Cities', 'Austin', 'Denver', 'Nashville', 'Seattle', 'Phoenix'];
const typeFilters = ['All Types', 'House', 'Apartment', 'Condo', 'Townhouse'];

const MapsPage: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [viewMode, setViewMode] = useState<'markers' | 'heatmap' | 'cluster'>('markers');
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [mapZoom, setMapZoom] = useState(13);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const filteredProperties = properties.filter((p) => {
    if (cityFilter !== 'All Cities' && p.city !== cityFilter) return false;
    if (typeFilter !== 'All Types' && p.type !== typeFilter) return false;
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
    return true;
  });

  const getPriceColor = (price: number) => {
    if (price < 300000) return '#10b981';
    if (price < 500000) return '#6366f1';
    if (price < 700000) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className={`min-h-screen bg-gray-950 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Property Map</h1>
            <p className="text-gray-400 text-sm">{filteredProperties.length} properties found</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
            >
              {isFullscreen ? '⊡' : '⊞'}
            </button>
            <button
              onClick={() => setShowSidePanel(!showSidePanel)}
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
            >
              ☰
            </button>
          </div>
        </div>
      </motion.div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Map Area */}
        <div className="flex-1 relative">
          {/* Simulated Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800">
            {/* Grid pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-10">
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Property Markers */}
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="absolute cursor-pointer group"
                style={{
                  left: `${15 + (index % 4) * 22}%`,
                  top: `${20 + Math.floor(index / 4) * 25}%`
                }}
                onClick={() => setSelectedProperty(property)}
              >
                <div className="relative">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg transition-transform group-hover:scale-125"
                    style={{ backgroundColor: getPriceColor(property.price) }}
                  >
                    ${(property.price / 1000).toFixed(0)}K
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl whitespace-nowrap">
                    <p className="text-white font-medium">{property.address}</p>
                    <p className="text-indigo-400 font-bold">${property.price.toLocaleString()}</p>
                    <p className="text-gray-400 text-sm">{property.area} sqft · {property.bedrooms} bed</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Floating Control Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 left-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-64 z-10"
          >
            <h3 className="text-white font-semibold mb-4">Filters</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">City</label>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full h-10 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white text-sm px-3 focus:border-indigo-500 outline-none transition-all"
                >
                  {cityFilters.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Property Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full h-10 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white text-sm px-3 focus:border-indigo-500 outline-none transition-all"
                >
                  {typeFilters.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="50000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="flex-1 accent-indigo-500"
                  />
                </div>
                <p className="text-xs text-gray-500">Up to ${(priceRange[1] / 1000).toFixed(0)}K</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">View Mode</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['markers', 'heatmap', 'cluster'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                        viewMode === mode
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                      }`}
                    >
                      {mode === 'markers' ? '📍' : mode === 'heatmap' ? '🌡️' : '👥'} {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Zoom Controls */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-10">
            <button
              onClick={() => setMapZoom(Math.min(18, mapZoom + 1))}
              className="w-10 h-10 rounded-lg bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 text-white hover:bg-gray-800/90 transition-colors flex items-center justify-center"
            >
              +
            </button>
            <button
              onClick={() => setMapZoom(Math.max(1, mapZoom - 1))}
              className="w-10 h-10 rounded-lg bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 text-white hover:bg-gray-800/90 transition-colors flex items-center justify-center"
            >
              −
            </button>
            <button
              onClick={() => setMapZoom(13)}
              className="w-10 h-10 rounded-lg bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 text-white hover:bg-gray-800/90 transition-colors flex items-center justify-center text-xs"
            >
              ⟲
            </button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 z-10">
            <p className="text-xs text-gray-400 mb-2">Price Legend</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-gray-300">&lt; $300K</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-xs text-gray-300">$300K - $500K</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-xs text-gray-300">$500K - $700K</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-gray-300">&gt; $700K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <AnimatePresence>
          {showSidePanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 350, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-gray-900/80 backdrop-blur-sm border-l border-gray-700/50 overflow-hidden"
            >
              <div className="w-[350px] h-full overflow-y-auto p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Properties in View</h3>
                <div className="space-y-3">
                  {filteredProperties.map((property) => (
                    <motion.div
                      key={property.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedProperty(property)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedProperty?.id === property.id
                          ? 'bg-indigo-500/10 border-indigo-500/30'
                          : 'bg-gray-800/50 border-gray-700/30 hover:border-gray-600/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-white font-medium">{property.address}</p>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getPriceColor(property.price) }}
                        />
                      </div>
                      <p className="text-indigo-400 font-bold text-lg">${property.price.toLocaleString()}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span>{property.area} sqft</span>
                        <span>{property.bedrooms} bed</span>
                        <span>{property.bathrooms} bath</span>
                      </div>
                      <div className="mt-2">
                        <span className="px-2 py-1 rounded-full bg-gray-700/50 text-xs text-gray-300">{property.type}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Property Detail Modal */}
        <AnimatePresence>
          {selectedProperty && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedProperty(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 border border-gray-700/50 rounded-2xl p-6 max-w-md w-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedProperty.address}</h3>
                    <p className="text-gray-400">{selectedProperty.city}</p>
                  </div>
                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-3xl font-bold text-indigo-400">${selectedProperty.price.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-gray-800/50">
                    <p className="text-sm text-gray-400">Area</p>
                    <p className="text-white font-medium">{selectedProperty.area} sqft</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-800/50">
                    <p className="text-sm text-gray-400">Bedrooms</p>
                    <p className="text-white font-medium">{selectedProperty.bedrooms}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-800/50">
                    <p className="text-sm text-gray-400">Bathrooms</p>
                    <p className="text-white font-medium">{selectedProperty.bathrooms}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-800/50">
                    <p className="text-sm text-gray-400">Type</p>
                    <p className="text-white font-medium">{selectedProperty.type}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 h-12 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
                  >
                    View Details
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 h-12 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors"
                  >
                    Save Property
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MapsPage;
