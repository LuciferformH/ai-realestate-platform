import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Report {
  id: string;
  name: string;
  type: 'property' | 'market' | 'export';
  status: 'completed' | 'processing' | 'failed';
  date: string;
  size: string;
  format: string;
}

const recentReports: Report[] = [
  { id: '1', name: 'Austin Market Analysis Q1 2024', type: 'market', status: 'completed', date: '2024-01-15', size: '2.4 MB', format: 'PDF' },
  { id: '2', name: '123 Oak Street Property Report', type: 'property', status: 'completed', date: '2024-01-14', size: '1.8 MB', format: 'PDF' },
  { id: '3', name: 'Investment Portfolio Export', type: 'export', status: 'completed', date: '2024-01-13', size: '456 KB', format: 'Excel' },
  { id: '4', name: 'Denver Neighborhood Comparison', type: 'market', status: 'processing', date: '2024-01-12', size: '-', format: 'PDF' },
  { id: '5', name: 'Price Trends 2020-2024', type: 'market', status: 'completed', date: '2024-01-11', size: '3.1 MB', format: 'PDF' },
  { id: '6', name: '456 Maple Ave Property Report', type: 'property', status: 'failed', date: '2024-01-10', size: '-', format: 'PDF' }
];

const propertyOptions = [
  '123 Oak Street, Austin',
  '456 Maple Ave, Austin',
  '789 Pine Road, Austin',
  '321 Cedar Lane, Austin',
  '654 Birch Blvd, Austin'
];

const ReportsPage: React.FC = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState(propertyOptions[0]);
  const [marketFilters, setMarketFilters] = useState({
    city: 'Austin',
    dateRange: 'last-6-months',
    propertyType: 'all'
  });
  const [exportFormat, setExportFormat] = useState('csv');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewReport, setPreviewReport] = useState<Report | null>(null);

  const handleGenerate = async (type: string) => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsGenerating(false);
    alert(`${type} report generated successfully!`);
  };

  const handleDownload = (report: Report) => {
    alert(`Downloading ${report.name}.${report.format.toLowerCase()}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400';
      case 'processing': return 'bg-amber-500/20 text-amber-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'property': return '🏠';
      case 'market': return '📊';
      case 'export': return '📤';
      default: return '📄';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Reports</h1>
        <p className="text-gray-400">Generate and manage property and market reports</p>
      </motion.div>

      {/* Report Generation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Property Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          className={`bg-gray-900/80 backdrop-blur-sm border rounded-2xl p-6 cursor-pointer transition-all ${
            activeCard === 'property' ? 'border-indigo-500/50 ring-2 ring-indigo-500/20' : 'border-gray-700/50 hover:border-gray-600/50'
          }`}
          onClick={() => setActiveCard(activeCard === 'property' ? null : 'property')}
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-2xl mb-4">
            🏠
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Property Report</h3>
          <p className="text-gray-400 text-sm mb-4">Generate detailed report for a specific property</p>

          <AnimatePresence>
            {activeCard === 'property' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Select Property</label>
                  <select
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className="w-full h-10 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white text-sm px-3 focus:border-indigo-500 outline-none"
                  >
                    {propertyOptions.map((prop) => (
                      <option key={prop} value={prop}>{prop}</option>
                    ))}
                  </select>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => { e.stopPropagation(); handleGenerate('Property'); }}
                  disabled={isGenerating}
                  className="w-full h-10 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {isGenerating ? 'Generating...' : 'Generate PDF'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Market Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          className={`bg-gray-900/80 backdrop-blur-sm border rounded-2xl p-6 cursor-pointer transition-all ${
            activeCard === 'market' ? 'border-emerald-500/50 ring-2 ring-emerald-500/20' : 'border-gray-700/50 hover:border-gray-600/50'
          }`}
          onClick={() => setActiveCard(activeCard === 'market' ? null : 'market')}
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-2xl mb-4">
            📊
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Market Report</h3>
          <p className="text-gray-400 text-sm mb-4">Generate comprehensive market analysis report</p>

          <AnimatePresence>
            {activeCard === 'market' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">City</label>
                  <select
                    value={marketFilters.city}
                    onChange={(e) => setMarketFilters({ ...marketFilters, city: e.target.value })}
                    className="w-full h-10 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white text-sm px-3 focus:border-indigo-500 outline-none"
                  >
                    <option>Austin</option>
                    <option>Denver</option>
                    <option>Nashville</option>
                    <option>Seattle</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Date Range</label>
                  <select
                    value={marketFilters.dateRange}
                    onChange={(e) => setMarketFilters({ ...marketFilters, dateRange: e.target.value })}
                    className="w-full h-10 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white text-sm px-3 focus:border-indigo-500 outline-none"
                  >
                    <option value="last-3-months">Last 3 Months</option>
                    <option value="last-6-months">Last 6 Months</option>
                    <option value="last-year">Last Year</option>
                    <option value="all-time">All Time</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Property Type</label>
                  <select
                    value={marketFilters.propertyType}
                    onChange={(e) => setMarketFilters({ ...marketFilters, propertyType: e.target.value })}
                    className="w-full h-10 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white text-sm px-3 focus:border-indigo-500 outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                  </select>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => { e.stopPropagation(); handleGenerate('Market'); }}
                  disabled={isGenerating}
                  className="w-full h-10 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-50 transition-colors"
                >
                  {isGenerating ? 'Generating...' : 'Generate PDF'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Data Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className={`bg-gray-900/80 backdrop-blur-sm border rounded-2xl p-6 cursor-pointer transition-all ${
            activeCard === 'export' ? 'border-amber-500/50 ring-2 ring-amber-500/20' : 'border-gray-700/50 hover:border-gray-600/50'
          }`}
          onClick={() => setActiveCard(activeCard === 'export' ? null : 'export')}
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl mb-4">
            📤
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Data Export</h3>
          <p className="text-gray-400 text-sm mb-4">Export data in CSV or Excel format</p>

          <AnimatePresence>
            {activeCard === 'export' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Export Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['csv', 'excel', 'json', 'pdf'].map((format) => (
                      <button
                        key={format}
                        onClick={(e) => { e.stopPropagation(); setExportFormat(format); }}
                        className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                          exportFormat === format
                            ? 'bg-amber-600 text-white'
                            : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                        }`}
                      >
                        {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => { e.stopPropagation(); handleGenerate('Export'); }}
                  disabled={isGenerating}
                  className="w-full h-10 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-500 disabled:opacity-50 transition-colors"
                >
                  {isGenerating ? 'Exporting...' : 'Export Data'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Recent Reports Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Recent Reports</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left text-gray-400 p-3">Report Name</th>
                <th className="text-left text-gray-400 p-3">Type</th>
                <th className="text-left text-gray-400 p-3">Status</th>
                <th className="text-left text-gray-400 p-3">Date</th>
                <th className="text-left text-gray-400 p-3">Size</th>
                <th className="text-left text-gray-400 p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-gray-700/30 hover:bg-gray-800/50 transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getTypeIcon(report.type)}</span>
                      <span className="text-white font-medium">{report.name}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full bg-gray-700/50 text-xs text-gray-300 capitalize">
                      {report.type}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400">{report.date}</td>
                  <td className="p-3 text-gray-400">{report.size}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {report.status === 'completed' && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDownload(report)}
                            className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
                          >
                            ↓
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setPreviewReport(report)}
                            className="p-2 rounded-lg bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 transition-colors"
                          >
                            👁
                          </motion.button>
                        </>
                      )}
                      {report.status === 'processing' && (
                        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewReport(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-700/50 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{previewReport.name}</h3>
                  <p className="text-gray-400 text-sm">{previewReport.date} · {previewReport.format}</p>
                </div>
                <button
                  onClick={() => setPreviewReport(null)}
                  className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      {getTypeIcon(previewReport.type)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{previewReport.type.charAt(0).toUpperCase() + previewReport.type.slice(1)} Report</p>
                      <p className="text-sm text-gray-400">Generated on {previewReport.date}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-3 rounded-lg bg-gray-700/30">
                      <p className="text-sm text-gray-400">Total Pages</p>
                      <p className="text-white font-medium">12</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-700/30">
                      <p className="text-sm text-gray-400">File Size</p>
                      <p className="text-white font-medium">{previewReport.size}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-lg bg-gray-700/20 border border-gray-600/30">
                    <p className="text-sm text-gray-400 mb-2">Report Contents:</p>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• Executive Summary</li>
                      <li>• Market Overview & Trends</li>
                      <li>• Comparable Properties Analysis</li>
                      <li>• Price Predictions & Forecasts</li>
                      <li>• Investment Recommendations</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { handleDownload(previewReport); setPreviewReport(null); }}
                  className="flex-1 h-12 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
                >
                  Download Report
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPreviewReport(null)}
                  className="flex-1 h-12 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors"
                >
                  Close Preview
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportsPage;
