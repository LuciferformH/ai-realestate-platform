import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';

interface PredictionForm {
  bedrooms: number;
  bathrooms: number;
  area: number;
  city: string;
  propertyType: string;
  yearBuilt: number;
}

interface PredictionResult {
  predictedPrice: number;
  confidence: number;
  model: string;
  city: string;
  propertyType: string;
  priceRange: { min: number; max: number };
  comparables: Array<{
    id: number;
    address: string;
    price: number;
    area: number;
    bedrooms: number;
  }>;
}

const cities = ['San Francisco', 'New York', 'Seattle', 'Austin', 'Denver', 'Nashville', 'Phoenix', 'Raleigh'];
const propertyTypes = ['Apartment', 'House', 'Condo', 'Townhouse', 'Villa'];

const tips = [
  'Predictions are based on historical data and current market trends.',
  'Prices may vary based on specific neighborhood conditions.',
  'Recent renovations can significantly impact actual market value.',
  'Local economic factors and school districts affect pricing.',
  'Seasonal market fluctuations can influence final sale prices.'
];

const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 2 }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: 'easeOut' });
    const unsubscribe = rounded.on('change', (v) => setDisplayValue(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, count, rounded, duration]);

  return <span>${displayValue}</span>;
};

const ConfidenceCircle: React.FC<{ confidence: number }> = ({ confidence }) => {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="64" cy="64" r="54" stroke="#374151" strokeWidth="8" fill="none" />
        <motion.circle
          cx="64"
          cy="64"
          r="54"
          stroke="url(#gradientConfidence)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="gradientConfidence" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{confidence}%</span>
        <span className="text-xs text-gray-400">Confidence</span>
      </div>
    </div>
  );
};

const NumberInput: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}> = ({ label, value, onChange, min = 0, max = 100, step = 1, suffix }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-300">{label}</label>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-10 h-10 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 text-white flex items-center justify-center transition-colors"
      >
        −
      </button>
      <div className="flex-1 relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
          className="w-full h-10 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white text-center focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{suffix}</span>}
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        className="w-10 h-10 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 text-white flex items-center justify-center transition-colors"
      >
        +
      </button>
    </div>
  </div>
);

const AIPredictPage: React.FC = () => {
  const [form, setForm] = useState<PredictionForm>({
    bedrooms: 3,
    bathrooms: 2,
    area: 1500,
    city: 'Austin',
    propertyType: 'House',
    yearBuilt: 2015
  });
  const [isPredicting, setIsPredicting] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [history, setHistory] = useState<Array<PredictionResult & { timestamp: string }>>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('predictionHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handlePredict = async () => {
    setIsPredicting(true);
    await new Promise((r) => setTimeout(r, 2000));

    const basePrice = {
      'San Francisco': 1200000,
      'New York': 950000,
      'Seattle': 720000,
      'Austin': 480000,
      'Denver': 450000,
      'Nashville': 390000,
      'Phoenix': 350000,
      'Raleigh': 380000
    }[form.city] || 400000;

    const typeMultiplier = {
      Apartment: 0.8,
      House: 1.0,
      Condo: 0.85,
      Townhouse: 0.9,
      Villa: 1.3
    }[form.propertyType] || 1.0;

    const areaFactor = form.area * 280;
    const bedroomFactor = form.bedrooms * 25000;
    const bathroomFactor = form.bathrooms * 15000;
    const yearFactor = (2024 - form.yearBuilt) * -2000;

    const predictedPrice = Math.round(
      (basePrice * typeMultiplier + areaFactor + bedroomFactor + bathroomFactor + yearFactor) * (0.95 + Math.random() * 0.1)
    );

    const newResult: PredictionResult = {
      predictedPrice,
      confidence: Math.round(75 + Math.random() * 20),
      model: 'XGBoost v2.1',
      city: form.city,
      propertyType: form.propertyType,
      priceRange: {
        min: Math.round(predictedPrice * 0.85),
        max: Math.round(predictedPrice * 1.15)
      },
      comparables: [
        { id: 1, address: `${Math.floor(Math.random() * 999) + 100} Oak Street`, price: predictedPrice * 0.95, area: form.area - 100, bedrooms: form.bedrooms, },
        { id: 2, address: `${Math.floor(Math.random() * 999) + 100} Maple Ave`, price: predictedPrice * 1.02, area: form.area + 50, bedrooms: form.bedrooms },
        { id: 3, address: `${Math.floor(Math.random() * 999) + 100} Pine Road`, price: predictedPrice * 0.98, area: form.area - 50, bedrooms: form.bedrooms - 1 }
      ]
    };

    setResult(newResult);
    setIsPredicting(false);

    const newHistory = [{ ...newResult, timestamp: new Date().toISOString() }, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('predictionHistory', JSON.stringify(newHistory));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950/20 to-gray-950 p-4 md:p-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl rounded-full" />
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 relative">
          AI Price <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Prediction</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto relative">
          Get accurate property valuations powered by machine learning
        </p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">🏠</span>
            Property Details
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="Bedrooms" value={form.bedrooms} onChange={(v) => setForm({ ...form, bedrooms: v })} min={1} max={10} />
              <NumberInput label="Bathrooms" value={form.bathrooms} onChange={(v) => setForm({ ...form, bathrooms: v })} min={1} max={8} />
            </div>

            <NumberInput label="Area (sqft)" value={form.area} onChange={(v) => setForm({ ...form, area: v })} min={200} max={10000} step={50} />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">City</label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full h-12 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white px-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Property Type</label>
              <select
                value={form.propertyType}
                onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                className="w-full h-12 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white px-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              >
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <NumberInput label="Year Built" value={form.yearBuilt} onChange={(v) => setForm({ ...form, yearBuilt: v })} min={1900} max={2024} />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePredict}
              disabled={isPredicting}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isPredicting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>✨ Predict Price</>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Results Section */}
        <div className="space-y-6">
          <AnimatePresence>
            {result ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
              >
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">📊</span>
                  Prediction Result
                </h2>

                <div className="text-center mb-8">
                  <p className="text-gray-400 mb-2">Estimated Market Value</p>
                  <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
                    <AnimatedCounter value={result.predictedPrice} />
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Range: ${result.priceRange.min.toLocaleString()} - ${result.priceRange.max.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center justify-center mb-8">
                  <ConfidenceCircle confidence={result.confidence} />
                </div>

                <div className="flex items-center justify-center gap-4 mb-8">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-medium">
                    Model: {result.model}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                    High Confidence
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Comparable Properties</h3>
                  <div className="space-y-3">
                    {result.comparables.map((comp) => (
                      <motion.div
                        key={comp.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: comp.id * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-gray-700/30 border border-gray-600/30"
                      >
                        <div>
                          <p className="text-white font-medium">{comp.address}</p>
                          <p className="text-sm text-gray-400">{comp.area} sqft · {comp.bedrooms} bed</p>
                        </div>
                        <p className="text-lg font-semibold text-indigo-400">${comp.price.toLocaleString()}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px]"
              >
                <div className="text-6xl mb-4">🔮</div>
                <p className="text-gray-400 text-center">Enter property details and click predict to get an AI-powered valuation</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>💡</span> Prediction Tips
            </h3>
            <ul className="space-y-2">
              {tips.map((tip, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-indigo-400 mt-1">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* History Toggle */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowHistory(!showHistory)}
            className="w-full py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
          >
            {showHistory ? 'Hide' : 'Show'} Recent Predictions ({history.length})
          </motion.button>

          <AnimatePresence>
            {showHistory && history.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Recent Predictions</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {history.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-700/30">
                      <div>
                        <p className="text-white font-medium">${item.predictedPrice.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{item.city} · {item.propertyType}</p>
                      </div>
                      <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AIPredictPage;
