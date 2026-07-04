import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SettingsState {
  name: string;
  email: string;
  phone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    priceAlerts: boolean;
    marketUpdates: boolean;
    newListings: boolean;
  };
  theme: 'dark' | 'light' | 'system';
  dataPreferences: {
    defaultCity: string;
    currency: string;
    areaUnit: string;
    priceDisplay: string;
  };
  apiKeys: Array<{ id: string; name: string; key: string; created: string; lastUsed: string }>;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    notifications: {
      email: true,
      push: true,
      sms: false,
      priceAlerts: true,
      marketUpdates: true,
      newListings: false
    },
    theme: 'dark',
    dataPreferences: {
      defaultCity: 'Austin',
      currency: 'USD',
      areaUnit: 'sqft',
      priceDisplay: 'full'
    },
    apiKeys: [
      { id: '1', name: 'Production API', key: 'sk_live_xxxxxxxxxxxx', created: '2024-01-01', lastUsed: '2024-01-15' },
      { id: '2', name: 'Development API', key: 'sk_test_xxxxxxxxxxxx', created: '2024-01-10', lastUsed: '2024-01-14' }
    ]
  });
  const [activeSection, setActiveSection] = useState('account');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);

  const handleNotificationToggle = (key: keyof typeof settings.notifications) => {
    setSettings({
      ...settings,
      notifications: { ...settings.notifications, [key]: !settings.notifications[key] }
    });
  };

  const ToggleSwitch: React.FC<{ enabled: boolean; onChange: () => void }> = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
        enabled ? 'bg-indigo-600' : 'bg-gray-600'
      }`}
    >
      <motion.div
        className="absolute top-1 w-4 h-4 rounded-full bg-white"
        animate={{ left: enabled ? 28 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );

  const sections = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'data', label: 'Data Preferences', icon: '📊' },
    { id: 'api', label: 'API Keys', icon: '🔑' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account and preferences</p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 h-fit"
        >
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeSection === section.id
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <span className="text-xl">{section.icon}</span>
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <span className="text-xl">🗑️</span>
              <span className="font-medium">Delete Account</span>
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3 bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
        >
          {activeSection === 'account' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">Account Settings</h2>

              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl text-white font-bold">
                  {settings.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-white font-medium text-lg">{settings.name}</p>
                  <p className="text-gray-400">{settings.email}</p>
                  <button className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                    Change Avatar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Full Name</label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    className="w-full h-12 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white px-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email Address</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full h-12 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white px-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Phone Number</label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full h-12 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white px-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value="••••••••"
                      readOnly
                      className="flex-1 h-12 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white px-4"
                    />
                    <button className="px-4 h-12 rounded-xl bg-gray-700/50 border border-gray-600/50 text-gray-400 hover:text-white hover:bg-gray-600/50 transition-colors">
                      Change
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
                >
                  Save Changes
                </motion.button>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-400">Receive updates via email</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.notifications.email}
                      onChange={() => handleNotificationToggle('email')}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-400">Receive push notifications</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.notifications.push}
                      onChange={() => handleNotificationToggle('push')}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-400">Receive text messages</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.notifications.sms}
                      onChange={() => handleNotificationToggle('sms')}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700/50">
                  <h3 className="text-lg font-medium text-white mb-4">Alert Types</h3>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Price Alerts</p>
                          <p className="text-sm text-gray-400">Get notified when prices change significantly</p>
                        </div>
                        <ToggleSwitch
                          enabled={settings.notifications.priceAlerts}
                          onChange={() => handleNotificationToggle('priceAlerts')}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Market Updates</p>
                          <p className="text-sm text-gray-400">Weekly market trend reports</p>
                        </div>
                        <ToggleSwitch
                          enabled={settings.notifications.marketUpdates}
                          onChange={() => handleNotificationToggle('marketUpdates')}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">New Listings</p>
                          <p className="text-sm text-gray-400">Alerts for new properties matching your criteria</p>
                        </div>
                        <ToggleSwitch
                          enabled={settings.notifications.newListings}
                          onChange={() => handleNotificationToggle('newListings')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">Appearance</h2>

              <div className="space-y-4">
                <p className="text-gray-400">Select your preferred theme</p>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'dark', label: 'Dark', preview: 'bg-gray-900' },
                    { id: 'light', label: 'Light', preview: 'bg-gray-100' },
                    { id: 'system', label: 'System', preview: 'bg-gradient-to-r from-gray-900 to-gray-100' }
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSettings({ ...settings, theme: theme.id as any })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.theme === theme.id
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-gray-700/50 hover:border-gray-600/50'
                      }`}
                    >
                      <div className={`w-full h-20 rounded-lg ${theme.preview} mb-3`} />
                      <p className="text-white font-medium">{theme.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-700/50">
                <h3 className="text-lg font-medium text-white mb-4">Accent Color</h3>
                <div className="flex gap-3">
                  {['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'].map((color) => (
                    <button
                      key={color}
                      className="w-10 h-10 rounded-full border-2 border-transparent hover:border-white/30 transition-colors"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'data' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">Data Preferences</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Default City</label>
                  <select
                    value={settings.dataPreferences.defaultCity}
                    onChange={(e) => setSettings({
                      ...settings,
                      dataPreferences: { ...settings.dataPreferences, defaultCity: e.target.value }
                    })}
                    className="w-full h-12 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white px-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  >
                    <option>Austin</option>
                    <option>Denver</option>
                    <option>Nashville</option>
                    <option>Seattle</option>
                    <option>Phoenix</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Currency</label>
                  <select
                    value={settings.dataPreferences.currency}
                    onChange={(e) => setSettings({
                      ...settings,
                      dataPreferences: { ...settings.dataPreferences, currency: e.target.value }
                    })}
                    className="w-full h-12 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white px-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Area Unit</label>
                  <select
                    value={settings.dataPreferences.areaUnit}
                    onChange={(e) => setSettings({
                      ...settings,
                      dataPreferences: { ...settings.dataPreferences, areaUnit: e.target.value }
                    })}
                    className="w-full h-12 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white px-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  >
                    <option value="sqft">Square Feet (sqft)</option>
                    <option value="sqm">Square Meters (sqm)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Price Display</label>
                  <select
                    value={settings.dataPreferences.priceDisplay}
                    onChange={(e) => setSettings({
                      ...settings,
                      dataPreferences: { ...settings.dataPreferences, priceDisplay: e.target.value }
                    })}
                    className="w-full h-12 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white px-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  >
                    <option value="full">Full ($485,000)</option>
                    <option value="abbreviated">Abbreviated ($485K)</option>
                    <option value="short">Short ($485k)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
                >
                  Save Preferences
                </motion.button>
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">API Keys</h2>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
                >
                  + Generate New Key
                </motion.button>
              </div>

              <div className="space-y-4">
                {settings.apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-medium">{apiKey.name}</p>
                        <p className="text-sm text-gray-400">Created: {apiKey.created}</p>
                      </div>
                      <button className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-red-400 transition-colors">
                        🗑️
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 text-gray-300 font-mono text-sm">
                        {showApiKey === apiKey.id ? apiKey.key : '••••••••••••••••'}
                      </code>
                      <button
                        onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                        className="px-3 py-2 rounded-lg bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600/50 transition-colors text-sm"
                      >
                        {showApiKey === apiKey.id ? 'Hide' : 'Show'}
                      </button>
                      <button className="px-3 py-2 rounded-lg bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600/50 transition-colors text-sm">
                        Copy
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Last used: {apiKey.lastUsed}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <p className="text-amber-400 text-sm">
                  <strong>Warning:</strong> Keep your API keys secure. Never share them publicly or expose them in client-side code.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 border border-gray-700/50 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-3xl mx-auto mb-4">
                ⚠️
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Account</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-12 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    alert('Account deleted');
                    setShowDeleteConfirm(false);
                  }}
                  className="flex-1 h-12 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 transition-colors"
                >
                  Delete Account
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SettingsPage;
