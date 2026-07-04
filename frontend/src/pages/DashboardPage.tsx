import { motion } from 'framer-motion';
import { Building2, TrendingUp, BarChart3, MapPin, DollarSign, Home, Users, ArrowUpRight } from 'lucide-react';
import { useDashboardStats, useTopCities } from '@/hooks/useAnalytics';
import { useFeaturedProperties } from '@/hooks/useProperties';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  const { data: stats } = useDashboardStats();
  const { data: featured = [] } = useFeaturedProperties();
  const { data: topCities = [] } = useTopCities(5);

  const statCards = [
    { label: 'Total Properties', value: formatNumber(stats?.total_properties ?? 0), icon: Home, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
    { label: 'Average Price', value: formatCurrency(stats?.avg_price ?? 0), icon: DollarSign, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
    { label: 'Total Cities', value: String(stats?.total_cities ?? 0), icon: MapPin, color: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/20' },
    { label: 'Median Price', value: formatCurrency(stats?.median_price ?? 0), icon: BarChart3, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
    { label: 'Highest Price', value: formatCurrency(stats?.highest_price ?? 0), icon: TrendingUp, color: 'from-rose-500 to-rose-600', shadow: 'shadow-rose-500/20' },
    { label: 'Lowest Price', value: formatCurrency(stats?.lowest_price ?? 0), icon: DollarSign, color: 'from-teal-500 to-teal-600', shadow: 'shadow-teal-500/20' },
    { label: 'Avg Price/Sqft', value: formatCurrency(stats?.avg_price_per_sqft ?? 0), icon: Building2, color: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/20' },
    { label: 'Total Value', value: formatCurrency(stats?.total_value ?? 0), icon: DollarSign, color: 'from-pink-500 to-pink-600', shadow: 'shadow-pink-500/20' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="mt-1 text-slate-400">Welcome back. Here&apos;s your property market overview.</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <motion.div
                key={card.label}
                variants={itemVariants}
                className="group rounded-2xl border border-slate-800/50 bg-slate-900/60 p-6 backdrop-blur-xl transition-all hover:border-slate-700/50 hover:bg-slate-800/60"
              >
                <div className="flex items-center justify-between">
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg', card.color, card.shadow)}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-slate-600 transition-colors group-hover:text-slate-400" />
                </div>
                <p className="mt-4 text-2xl font-bold text-white">{card.value}</p>
                <p className="mt-1 text-sm text-slate-400">{card.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <motion.div variants={itemVariants} className="rounded-2xl border border-slate-800/50 bg-slate-900/60 p-6 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Top Cities</h2>
                <Link to="/analytics" className="text-sm font-medium text-blue-400 hover:text-blue-300">View All</Link>
              </div>
              <div className="space-y-3">
                {topCities.map((city, index) => (
                  <div key={city.city} className="flex items-center justify-between rounded-xl bg-slate-800/30 p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-sm font-bold text-blue-400">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-white">{city.city}</p>
                        <p className="text-xs text-slate-500">{city.count} properties</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{formatCurrency(city.avg_price)}</p>
                      <p className="text-xs text-emerald-400">avg {formatCurrency(city.avg_price)}</p>
                    </div>
                  </div>
                ))}
                {topCities.length === 0 && (
                  <div className="flex h-32 items-center justify-center text-slate-500">Loading cities...</div>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-2xl border border-slate-800/50 bg-slate-900/60 p-6 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Featured Properties</h2>
                <Link to="/properties" className="text-sm font-medium text-blue-400 hover:text-blue-300">Browse All</Link>
              </div>
              <div className="space-y-3">
                {featured.slice(0, 5).map((property: any) => (
                  <Link
                    key={property.id}
                    to={`/properties/${property.id}`}
                    className="flex items-center justify-between rounded-xl bg-slate-800/30 p-3 transition-colors hover:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                        <Building2 className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white line-clamp-1">{property.title}</p>
                        <p className="text-xs text-slate-500">{property.city}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-white">{formatCurrency(property.price)}</p>
                  </Link>
                ))}
                {featured.length === 0 && (
                  <div className="flex h-32 items-center justify-center text-slate-500">
                    No featured properties yet
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="mt-8 rounded-2xl border border-slate-800/50 bg-slate-900/60 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'AI Price Prediction', href: '/ai-predict', icon: TrendingUp, color: 'text-blue-400' },
                { label: 'View Analytics', href: '/analytics', icon: BarChart3, color: 'text-emerald-400' },
                { label: 'Explore Maps', href: '/maps', icon: MapPin, color: 'text-purple-400' },
                { label: 'ML Models', href: '/ml-models', icon: Users, color: 'text-amber-400' },
              ].map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  className="flex items-center gap-3 rounded-xl border border-slate-800/50 bg-slate-800/30 p-4 transition-all hover:border-slate-700/50 hover:bg-slate-800/50"
                >
                  <action.icon className={cn('h-5 w-5', action.color)} />
                  <span className="font-medium text-white">{action.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
