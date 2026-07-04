import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Treemap, RadialBarChart, RadialBar
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'eda', label: 'EDA' },
  { id: 'trends', label: 'Trends' },
  { id: 'geographic', label: 'Geographic' },
  { id: 'property', label: 'Property' },
  { id: 'investment', label: 'Investment' }
];

const overviewMetrics = [
  { title: 'Total Properties', value: '12,847', change: '+8.3%', icon: '🏢', color: 'from-indigo-500 to-purple-600' },
  { title: 'Avg Price', value: '$485,200', change: '+5.2%', icon: '💰', color: 'from-emerald-500 to-teal-600' },
  { title: 'Price per Sqft', value: '$245', change: '+3.1%', icon: '📐', color: 'from-amber-500 to-orange-600' },
  { title: 'Avg Bedrooms', value: '3.2', change: '+0.1', icon: '🛏️', color: 'from-rose-500 to-pink-600' },
  { title: 'Investment Score', value: '8.4/10', change: '+0.6', icon: '📈', color: 'from-cyan-500 to-blue-600' },
  { title: 'Market Growth', value: '12.5%', change: '+2.3%', icon: '🚀', color: 'from-violet-500 to-indigo-600' }
];

const correlationData = [
  { name: 'Price', bedrooms: 0.85, bathrooms: 0.78, area: 0.92, year: 0.45, sqft: 0.88 },
  { name: 'Bedrooms', bedrooms: 1, bathrooms: 0.72, area: 0.68, year: 0.32, sqft: 0.65 },
  { name: 'Bathrooms', bedrooms: 0.72, bathrooms: 1, area: 0.75, year: 0.28, sqft: 0.71 },
  { name: 'Area', bedrooms: 0.68, bathrooms: 0.75, area: 1, year: 0.38, sqft: 0.95 },
  { name: 'Year', bedrooms: 0.32, bathrooms: 0.28, area: 0.38, year: 1, sqft: 0.35 },
  { name: 'Sqft', bedrooms: 0.65, bathrooms: 0.71, area: 0.95, year: 0.35, sqft: 1 }
];

const priceDistribution = [
  { range: '0-200K', count: 1200 },
  { range: '200-400K', count: 2800 },
  { range: '400-600K', count: 3200 },
  { range: '600-800K', count: 2100 },
  { range: '800K-1M', count: 1500 },
  { range: '1M+', count: 800 }
];

const areaDistribution = [
  { range: '500-1000', count: 900 },
  { range: '1000-1500', count: 1800 },
  { range: '1500-2000', count: 2500 },
  { range: '2000-2500', count: 2200 },
  { range: '2500-3000', count: 1600 },
  { range: '3000+', count: 1000 }
];

const missingValueData = [
  { field: 'Price', missing: 2.1 },
  { field: 'Area', missing: 3.4 },
  { field: 'Bedrooms', missing: 1.2 },
  { field: 'Bathrooms', missing: 2.8 },
  { field: 'Year Built', missing: 8.5 },
  { field: 'Address', missing: 0.5 }
];

const monthlyTrends = [
  { month: 'Jan', price: 445000, volume: 320 },
  { month: 'Feb', price: 452000, volume: 380 },
  { month: 'Mar', price: 468000, volume: 450 },
  { month: 'Apr', price: 475000, volume: 520 },
  { month: 'May', price: 482000, volume: 580 },
  { month: 'Jun', price: 495000, volume: 620 },
  { month: 'Jul', price: 508000, volume: 590 },
  { month: 'Aug', price: 498000, volume: 540 },
  { month: 'Sep', price: 488000, volume: 480 },
  { month: 'Oct', price: 478000, volume: 420 },
  { month: 'Nov', price: 472000, volume: 380 },
  { month: 'Dec', price: 485000, volume: 350 }
];

const yearlyGrowth = [
  { year: '2019', price: 380000, growth: 5.2 },
  { year: '2020', price: 395000, growth: 3.9 },
  { year: '2021', price: 425000, growth: 7.6 },
  { year: '2022', price: 465000, growth: 9.4 },
  { year: '2023', price: 485000, growth: 4.3 },
  { year: '2024', price: 510000, growth: 5.2 }
];

const cityGrowth = [
  { city: 'Austin', growth: 15.2 },
  { city: 'Denver', growth: 12.8 },
  { city: 'Nashville', growth: 11.5 },
  { city: 'Raleigh', growth: 10.9 },
  { city: 'Phoenix', growth: 9.8 },
  { city: 'Seattle', growth: 8.5 }
];

const cityAvgPrice = [
  { city: 'San Francisco', price: 1250000 },
  { city: 'New York', price: 980000 },
  { city: 'Seattle', price: 750000 },
  { city: 'Austin', price: 520000 },
  { city: 'Denver', price: 480000 },
  { city: 'Nashville', price: 420000 }
];

const topCitiesTreemap = [
  { name: 'San Francisco', size: 1250000, children: [] },
  { name: 'New York', size: 980000, children: [] },
  { name: 'Seattle', size: 750000, children: [] },
  { name: 'Austin', size: 520000, children: [] },
  { name: 'Denver', size: 480000, children: [] }
];

const pricePerSqft = [
  { city: 'San Francisco', price: 850 },
  { city: 'New York', price: 720 },
  { city: 'Seattle', price: 520 },
  { city: 'Austin', price: 320 },
  { city: 'Denver', price: 290 }
];

const propertyTypeData = [
  { name: 'Apartment', value: 35 },
  { name: 'House', value: 40 },
  { name: 'Condo', value: 15 },
  { name: 'Townhouse', value: 10 }
];

const priceVsArea = [
  { area: 800, price: 280000, type: 'Apartment' },
  { area: 1200, price: 380000, type: 'House' },
  { area: 1500, price: 450000, type: 'Condo' },
  { area: 2000, price: 580000, type: 'House' },
  { area: 2500, price: 720000, type: 'Townhouse' },
  { area: 3000, price: 850000, type: 'House' }
];

const featureImportance = [
  { feature: 'Area (sqft)', importance: 0.32 },
  { feature: 'Location', importance: 0.25 },
  { feature: 'Bedrooms', importance: 0.18 },
  { feature: 'Year Built', importance: 0.12 },
  { feature: 'Bathrooms', importance: 0.08 },
  { feature: 'Condition', importance: 0.05 }
];

const investmentScores = [
  { city: 'Austin', investment: 92, rental: 7.2, demand: 88, health: 85 },
  { city: 'Denver', investment: 87, rental: 6.8, demand: 82, health: 80 },
  { city: 'Nashville', investment: 85, rental: 7.5, demand: 79, health: 78 },
  { city: 'Raleigh', investment: 83, rental: 6.5, demand: 85, health: 82 },
  { city: 'Phoenix', investment: 80, rental: 7.8, demand: 76, health: 75 }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-gray-300 text-sm font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' && entry.value > 1000
              ? `$${entry.value.toLocaleString()}`
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ChartCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 ${className}`}
  >
    <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
    {children}
  </motion.div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-48">
    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Comprehensive real estate market insights</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {loading ? <LoadingSpinner /> : renderTabContent(activeTab)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

function renderTabContent(tab: string) {
  switch (tab) {
    case 'overview':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {overviewMetrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-indigo-500/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{metric.icon}</span>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  metric.change.startsWith('+') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {metric.change}
                </span>
              </div>
              <h3 className="text-gray-400 text-sm mb-1">{metric.title}</h3>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
              <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${metric.color}`} />
            </motion.div>
          ))}
        </div>
      );

    case 'eda':
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Correlation Matrix" className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-gray-400 p-2"></th>
                    {correlationData.map((col) => (
                      <th key={col.name} className="text-center text-gray-400 p-2 text-sm">{col.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {correlationData.map((row) => (
                    <tr key={row.name}>
                      <td className="text-gray-400 p-2 text-sm font-medium">{row.name}</td>
                      {Object.entries(row).slice(1).map(([key, value]) => (
                        <td key={key} className="text-center p-2">
                          <div
                            className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center text-xs font-medium text-white"
                            style={{
                              backgroundColor: `rgba(99, 102, 241, ${Number(value)})`,
                              opacity: 0.3 + Number(value) * 0.7
                            }}
                          >
                            {typeof value === 'number' ? value.toFixed(2) : String(value)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>

          <ChartCard title="Price Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="range" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Area Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={areaDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="range" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Missing Value Analysis" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={missingValueData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis dataKey="field" type="category" stroke="#9ca3af" fontSize={12} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="missing" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      );

    case 'trends':
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Monthly Price Trends" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} activeDot={{ r: 7 }} name="Avg Price" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Yearly Growth Trends">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={yearlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="price" stroke="#8b5cf6" fill="url(#gradientPrice)" strokeWidth={2} />
                <defs>
                  <linearGradient id="gradientPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Growth Rate by City">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cityGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="city" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="growth" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      );

    case 'geographic':
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Average Price by City">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={cityAvgPrice}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="city" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                  {cityAvgPrice.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top Cities Treemap">
            <ResponsiveContainer width="100%" height={350}>
              <Treemap
                data={topCitiesTreemap}
                dataKey="size"
                nameKey="name"
                stroke="#374151"
                fill="#6366f1"
                content={({ x, y, width, height, name, size }: any) => (
                  <g>
                    <rect x={x} y={y} width={width} height={height} fill={COLORS[Math.floor(Math.random() * COLORS.length)]} rx={4} />
                    {width > 80 && height > 40 && (
                      <>
                        <text x={x + width / 2} y={y + height / 2 - 8} textAnchor="middle" fill="white" fontSize={12} fontWeight="bold">
                          {name}
                        </text>
                        <text x={x + width / 2} y={y + height / 2 + 12} textAnchor="middle" fill="white" fontSize={10} opacity={0.8}>
                          ${(size / 1000).toFixed(0)}K
                        </text>
                      </>
                    )}
                  </g>
                )}
              />
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Average Price per Sqft" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pricePerSqft} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${v}`} />
                <YAxis dataKey="city" type="category" stroke="#9ca3af" fontSize={12} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="price" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      );

    case 'property':
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Average Price by Property Type">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={propertyTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {propertyTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Price vs Area Scatter Plot">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" dataKey="area" name="Area" stroke="#9ca3af" fontSize={12} unit=" sqft" />
                <YAxis type="number" dataKey="price" name="Price" stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter data={priceVsArea} fill="#6366f1" />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Feature Importance" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={featureImportance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} domain={[0, 0.35]} />
                <YAxis dataKey="feature" type="category" stroke="#9ca3af" fontSize={12} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="importance" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      );

    case 'investment':
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Investment Scores by City" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={investmentScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="city" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="investment" fill="#6366f1" name="Investment Score" radius={[4, 4, 0, 0]} />
                <Bar dataKey="demand" fill="#10b981" name="Demand Score" radius={[4, 4, 0, 0]} />
                <Bar dataKey="health" fill="#f59e0b" name="Health Score" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Rental Yield Comparison">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={investmentScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="city" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rental" fill="#8b5cf6" name="Rental Yield %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Market Health Scores">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={investmentScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="city" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="health" fill="#06b6d4" name="Health Score" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      );

    default:
      return null;
  }
}

export default AnalyticsPage;
