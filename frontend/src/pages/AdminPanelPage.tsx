import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  MapPin,
  Brain,
  Plus,
  Upload,
  Cog,
  Activity,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useDashboardStats } from '@/hooks/useAnalytics';
import { useModels } from '@/hooks/useML';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { formatNumber, formatDate } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const userGrowthData = [
  { name: 'Jan', users: 120, properties: 340 },
  { name: 'Feb', users: 180, properties: 420 },
  { name: 'Mar', users: 250, properties: 510 },
  { name: 'Apr', users: 310, properties: 580 },
  { name: 'May', users: 420, properties: 650 },
  { name: 'Jun', users: 530, properties: 720 },
  { name: 'Jul', users: 640, properties: 810 },
  { name: 'Aug', users: 780, properties: 920 },
  { name: 'Sep', users: 890, properties: 1050 },
  { name: 'Oct', users: 1020, properties: 1180 },
  { name: 'Nov', users: 1180, properties: 1340 },
  { name: 'Dec', users: 1350, properties: 1500 },
];

interface Activity {
  id: number;
  type: string;
  message: string;
  timestamp: string;
}

export default function AdminPanelPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: stats } = useDashboardStats();
  const { data: models = [] } = useModels();

  const { data: activity = [] } = useQuery<Activity[]>({
    queryKey: ['admin', 'activity'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/admin/activity?limit=8');
        return data.items ?? data;
      } catch {
        return [];
      }
    },
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['admin', 'users-count'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/admin/users?per_page=1');
        return data.items ?? data;
      } catch {
        return [];
      }
    },
  });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user && user.role !== 'admin') return null;

  const activeModels = models.filter((m) => m.is_active).length;

  const systemHealth = [
    { name: 'API Server', status: 'healthy', icon: CheckCircle2 },
    { name: 'Database', status: 'healthy', icon: CheckCircle2 },
    { name: 'ML Pipeline', status: activeModels > 0 ? 'healthy' : 'warning', icon: activeModels > 0 ? CheckCircle2 : AlertTriangle },
    { name: 'Storage', status: 'healthy', icon: CheckCircle2 },
  ];

  const quickActions = [
    { label: 'Add Property', icon: Plus, href: '/admin/properties', color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/25' },
    { label: 'Upload Data', icon: Upload, href: '/admin/dataset', color: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/25' },
    { label: 'Train Model', icon: Brain, href: '/ml-models', color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/25' },
    { label: 'Manage Users', icon: Users, href: '/admin/users', color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/25' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl">
        <p className="text-white font-medium text-sm mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-white/50">{entry.name}:</span>
            <span className="text-white font-medium">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface-950 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            <p className="mt-1 text-surface-400">Platform administration and management overview</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <AdminStatsCard
              icon={<Users className="h-5 w-5 text-blue-400" />}
              value={users.length || 0}
              label="Total Users"
              change={12}
              sparklineData={[120, 180, 250, 310, 420, 530, 640]}
              gradient="from-blue-500/20 to-blue-600/5"
            />
            <AdminStatsCard
              icon={<Building2 className="h-5 w-5 text-purple-400" />}
              value={stats?.total_properties ?? 0}
              label="Total Properties"
              change={8}
              sparklineData={[340, 420, 510, 580, 650, 720, 810]}
              gradient="from-purple-500/20 to-purple-600/5"
            />
            <AdminStatsCard
              icon={<MapPin className="h-5 w-5 text-emerald-400" />}
              value={stats?.total_cities ?? 0}
              label="Total Cities"
              change={3}
              sparklineData={[6, 7, 7, 8, 8, 9, 10]}
              gradient="from-emerald-500/20 to-emerald-600/5"
            />
            <AdminStatsCard
              icon={<Brain className="h-5 w-5 text-amber-400" />}
              value={activeModels}
              label="Active ML Models"
              change={models.length > 0 ? 15 : 0}
              sparklineData={[1, 2, 2, 3, 3, 4, activeModels]}
              gradient="from-amber-500/20 to-orange-500/5"
            />
          </div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all hover:bg-white/10 hover:border-white/20"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} shadow-lg ${action.shadow}`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium text-white/80 group-hover:text-white text-sm">{action.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
            {/* User Growth Chart */}
            <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">User Growth</h2>
                <Link to="/analytics" className="text-sm text-blue-400 hover:text-blue-300">
                  View All
                </Link>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Users" />
                  <Bar dataKey="properties" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Properties" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* System Health */}
            <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">System Health</h2>
              <div className="space-y-3">
                {systemHealth.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={`h-4 w-4 ${
                          item.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      />
                      <span className="text-sm text-white/70">{item.name}</span>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        item.status === 'healthy'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {item.status === 'healthy' ? 'Operational' : 'Warning'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-white/30">
                <Activity className="w-3.5 h-3.5" />
                Last checked: Just now
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              <Link to="/admin/users" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {activity.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="mx-auto h-8 w-8 text-white/20 mb-2" />
                <p className="text-sm text-white/40">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="mt-0.5">
                      {item.type === 'user_created' && <Users className="w-4 h-4 text-blue-400" />}
                      {item.type === 'property_added' && <Building2 className="w-4 h-4 text-purple-400" />}
                      {item.type === 'model_trained' && <Brain className="w-4 h-4 text-amber-400" />}
                      {item.type === 'dataset_uploaded' && <Upload className="w-4 h-4 text-emerald-400" />}
                      {!['user_created', 'property_added', 'model_trained', 'dataset_uploaded'].includes(item.type) && (
                        <Activity className="w-4 h-4 text-white/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/70">{item.message}</p>
                      <p className="text-xs text-white/30 mt-0.5">{formatDate(item.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
