import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

interface Model {
  id: string;
  name: string;
  accuracy: number;
  mae: number;
  rmse: number;
  r2Score: number;
  date: string;
  status: 'active' | 'training' | 'inactive';
  features?: string[];
}

const models: Model[] = [
  { id: '1', name: 'XGBoost v2.1', accuracy: 94.2, mae: 12500, rmse: 18200, r2Score: 0.942, date: '2024-01-15', status: 'active' },
  { id: '2', name: 'Random Forest v1.8', accuracy: 91.5, mae: 15800, rmse: 22100, r2Score: 0.915, date: '2024-01-10', status: 'active' },
  { id: '3', name: 'Neural Network v3.0', accuracy: 89.8, mae: 18200, rmse: 25800, r2Score: 0.898, date: '2024-01-08', status: 'active' },
  { id: '4', name: 'Linear Regression', accuracy: 82.3, mae: 28500, rmse: 38200, r2Score: 0.823, date: '2024-01-05', status: 'inactive' },
  { id: '5', name: 'LightGBM v1.5', accuracy: 93.8, mae: 13200, rmse: 19500, r2Score: 0.938, date: '2024-01-12', status: 'training' }
];

const featureImportance = [
  { feature: 'Area (sqft)', importance: 0.32 },
  { feature: 'Location Score', importance: 0.25 },
  { feature: 'Bedrooms', importance: 0.18 },
  { feature: 'Year Built', importance: 0.12 },
  { feature: 'Bathrooms', importance: 0.08 },
  { feature: 'Lot Size', importance: 0.05 }
];

const actualVsPredicted = Array.from({ length: 50 }, (_, i) => ({
  actual: 200000 + Math.random() * 800000,
  predicted: 200000 + Math.random() * 800000 + (Math.random() - 0.5) * 50000
}));

const modelTypes = ['XGBoost', 'Random Forest', 'Neural Network', 'LightGBM', 'CatBoost', 'Linear Regression'];

const trainingLogs = [
  '[00:00:01] Loading dataset... 12,847 samples found',
  '[00:00:02] Splitting data: 80% train, 20% test',
  '[00:00:03] Feature engineering: 24 features selected',
  '[00:00:05] Training started with XGBoost...',
  '[00:00:10] Epoch 1/100 - Loss: 0.2847',
  '[00:00:15] Epoch 25/100 - Loss: 0.1253',
  '[00:00:20] Epoch 50/100 - Loss: 0.0892',
  '[00:00:25] Epoch 75/100 - Loss: 0.0734',
  '[00:00:30] Epoch 100/100 - Loss: 0.0681',
  '[00:00:31] Training complete!',
  '[00:00:32] Evaluating on test set...',
  '[00:00:33] Accuracy: 94.2% | MAE: $12,500 | R²: 0.942',
  '[00:00:34] Model saved: models/xgboost_v2.1.pkl'
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-gray-300 text-sm font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MLModelsPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<Model>(models[0]);
  const [sortField, setSortField] = useState<keyof Model>('accuracy');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [selectedModelType, setSelectedModelType] = useState('XGBoost');
  const [logs, setLogs] = useState<string[]>([]);

  const sortedModels = [...models].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const dir = sortDirection === 'asc' ? 1 : -1;
    if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
    return String(aVal).localeCompare(String(bVal)) * dir;
  });

  const handleSort = (field: keyof Model) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleTrain = async () => {
    setIsTraining(true);
    setTrainingProgress(0);
    setLogs([]);

    for (let i = 0; i < trainingLogs.length; i++) {
      await new Promise((r) => setTimeout(r, 300));
      setLogs((prev) => [...prev, trainingLogs[i]]);
      setTrainingProgress(Math.round(((i + 1) / trainingLogs.length) * 100));
    }

    setIsTraining(false);
  };

  const SortIcon: React.FC<{ field: keyof Model }> = ({ field }) => {
    if (sortField !== field) return <span className="text-gray-600 ml-1">↕</span>;
    return <span className="text-indigo-400 ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">ML Models</h1>
        <p className="text-gray-400">Train, compare, and deploy machine learning models</p>
      </motion.div>

      {/* Model Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-8 overflow-x-auto"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Model Comparison</h2>
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-700/50">
              {[
                { key: 'name', label: 'Model Name' },
                { key: 'accuracy', label: 'Accuracy' },
                { key: 'mae', label: 'MAE' },
                { key: 'rmse', label: 'RMSE' },
                { key: 'r2Score', label: 'R² Score' },
                { key: 'date', label: 'Date' },
                { key: 'status', label: 'Status' }
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key as keyof Model)}
                  className="text-left text-gray-400 p-3 cursor-pointer hover:text-white transition-colors"
                >
                  {col.label}
                  <SortIcon field={col.key as keyof Model} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedModels.map((model) => (
              <motion.tr
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={`border-b border-gray-700/30 cursor-pointer transition-colors ${
                  selectedModel.id === model.id
                    ? 'bg-indigo-500/10 border-indigo-500/30'
                    : 'hover:bg-gray-800/50'
                } ${model.accuracy === Math.max(...models.map((m) => m.accuracy)) ? 'bg-emerald-500/5' : ''}`}
              >
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{model.name}</span>
                    {model.accuracy === Math.max(...models.map((m) => m.accuracy)) && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">Best</span>
                    )}
                  </div>
                </td>
                <td className="p-3 text-white">{model.accuracy}%</td>
                <td className="p-3 text-white">${model.mae.toLocaleString()}</td>
                <td className="p-3 text-white">${model.rmse.toLocaleString()}</td>
                <td className="p-3 text-white">{model.r2Score}</td>
                <td className="p-3 text-gray-400">{model.date}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    model.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                    model.status === 'training' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {model.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Performance Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Model Accuracy Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={models}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} angle={-20} textAnchor="end" height={60} />
              <YAxis stroke="#9ca3af" fontSize={12} domain={[70, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="accuracy" name="Accuracy %" radius={[4, 4, 0, 0]}>
                {models.map((model, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={model.id === selectedModel.id ? '#6366f1' : '#4b5563'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Actual vs Predicted Prices</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" dataKey="actual" name="Actual" stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <YAxis type="number" dataKey="predicted" name="Predicted" stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={actualVsPredicted} fill="#6366f1" opacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Feature Importance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Feature Importance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={featureImportance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} domain={[0, 0.35]} />
              <YAxis dataKey="feature" type="category" stroke="#9ca3af" fontSize={12} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="importance" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Model Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Model Details</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-800/50">
              <span className="text-gray-400">Model Name</span>
              <span className="text-white font-medium">{selectedModel.name}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-800/50">
              <span className="text-gray-400">Accuracy</span>
              <span className="text-emerald-400 font-medium">{selectedModel.accuracy}%</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-800/50">
              <span className="text-gray-400">MAE</span>
              <span className="text-white font-medium">${selectedModel.mae.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-800/50">
              <span className="text-gray-400">RMSE</span>
              <span className="text-white font-medium">${selectedModel.rmse.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-800/50">
              <span className="text-gray-400">R² Score</span>
              <span className="text-indigo-400 font-medium">{selectedModel.r2Score}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-800/50">
              <span className="text-gray-400">Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedModel.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                selectedModel.status === 'training' ? 'bg-amber-500/20 text-amber-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {selectedModel.status}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Train New Model */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Train New Model</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Model Type</label>
              <select
                value={selectedModelType}
                onChange={(e) => setSelectedModelType(e.target.value)}
                className="w-full h-12 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white px-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              >
                {modelTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Train Size</label>
                <select className="w-full h-12 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white px-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all">
                  <option>70%</option>
                  <option>80%</option>
                  <option>85%</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Cross Validation</label>
                <select className="w-full h-12 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white px-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all">
                  <option>5-Fold</option>
                  <option>10-Fold</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Hyperparameters</label>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Learning Rate" defaultValue={0.01} className="h-10 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white px-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
                <input type="number" placeholder="Max Depth" defaultValue={6} className="h-10 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white px-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
                <input type="number" placeholder="Estimators" defaultValue={100} className="h-10 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white px-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
                <input type="number" placeholder="Min Samples" defaultValue={5} className="h-10 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white px-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTrain}
              disabled={isTraining}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isTraining ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Training... {trainingProgress}%
                </>
              ) : (
                <>🚀 Start Training</>
              )}
            </motion.button>
          </div>

          {/* Training Log */}
          <div className="bg-gray-950 rounded-xl border border-gray-700/50 p-4 font-mono text-sm max-h-[400px] overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Training log will appear here...</p>
            ) : (
              logs.map((log, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`mb-1 ${
                    log.includes('Accuracy') ? 'text-emerald-400 font-bold' :
                    log.includes('Error') ? 'text-red-400' :
                    'text-gray-400'
                  }`}
                >
                  {log}
                </motion.p>
              ))
            )}
          </div>
        </div>

        {isTraining && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Training Progress</span>
              <span>{trainingProgress}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${trainingProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MLModelsPage;
