import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Map,
  BrainCircuit,
  Database,
  FileText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface SidebarProps {
  activeRoute?: string;
  onNavigate?: (href: string) => void;
  user?: { name: string; role: string; avatar?: string };
}

const mainNav: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, href: '/' },
  { label: 'Properties', icon: <Building2 className="w-5 h-5" />, href: '/properties' },
  { label: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, href: '/analytics' },
  { label: 'Maps', icon: <Map className="w-5 h-5" />, href: '/maps' },
  { label: 'AI Prediction', icon: <BrainCircuit className="w-5 h-5" />, href: '/ai-predict' },
  { label: 'ML Models', icon: <Database className="w-5 h-5" />, href: '/ml-models' },
  { label: 'Reports', icon: <FileText className="w-5 h-5" />, href: '/reports' },
];

const adminNav: NavItem[] = [
  { label: 'Admin Panel', icon: <LayoutDashboard className="w-5 h-5" />, href: '/admin' },
  { label: 'Users', icon: <Users className="w-5 h-5" />, href: '/admin/users' },
  { label: 'Properties', icon: <Building2 className="w-5 h-5" />, href: '/admin/properties' },
  { label: 'Dataset', icon: <Database className="w-5 h-5" />, href: '/admin/dataset' },
];

const Sidebar: React.FC<SidebarProps> = ({
  activeRoute = '/',
  onNavigate,
  user = { name: 'Admin User', role: 'admin' },
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = user.role === 'admin';

  const SidebarLink: React.FC<{ item: NavItem }> = ({ item }) => {
    const isActive = activeRoute === item.href || (item.href !== '/' && activeRoute.startsWith(item.href));
    return (
      <motion.button
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onNavigate?.(item.href)}
        className={`relative flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group ${isActive ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-white/10"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative z-10">{item.icon}</span>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="relative z-10 whitespace-nowrap overflow-hidden"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-screen bg-white/[0.03] backdrop-blur-xl border-r border-white/10"
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
          <span className="text-white text-sm font-bold">AI</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap overflow-hidden"
            >
              AI RE
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="space-y-1">
          {mainNav.map((item) => (
            <SidebarLink key={item.href} item={item} />
          ))}
        </div>

        {isAdmin && (
          <>
            <div className="my-3 border-t border-white/10" />
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 pb-2 text-xs font-semibold text-white/30 uppercase tracking-wider"
                >
                  Admin
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-1">
              {adminNav.map((item) => (
                <SidebarLink key={item.href} item={item} />
              ))}
            </div>
          </>
        )}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-purple-500/20 text-purple-300 rounded uppercase">
                  {user.role}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!collapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-shrink-0 p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-gray-800 border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:bg-gray-700 transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
