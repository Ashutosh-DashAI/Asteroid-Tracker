import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Save } from 'lucide-react';
import { AlertPreference } from '@/types';
import { useAsteroidsStore } from '@/store/useAsteroidsStore';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

export default function Alerts() {
  const {
    alertPrefs,
    alertLoading,
    fetchAlertPreferences,
    updateAlertPreferences,
  } = useAsteroidsStore();

  const [localPrefs, setLocalPrefs] = React.useState<Partial<AlertPreference>>(
    (alertPrefs as Partial<AlertPreference>) || {}
  );
  const [saving, setSaving] = React.useState(false);

  useEffect(() => {
    fetchAlertPreferences();
  }, []);

  useEffect(() => {
    if (alertPrefs) {
      setLocalPrefs(alertPrefs);
    }
  }, [alertPrefs]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAlertPreferences(localPrefs);
    } finally {
      setSaving(false);
    }
  };

  if (alertLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <SkeletonLoader count={5} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <Bell size={32} className="text-blue-400" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Alert Preferences
          </h1>
        </div>
        <p className="text-slate-400">Customize how you want to be notified about asteroids</p>
      </motion.div>

      {/* Preferences Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 max-w-2xl space-y-6"
      >
        {/* Hazardous Only */}
        <div>
          <label className="flex items-center gap-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={localPrefs.hazardousOnly || false}
              onChange={(e) => setLocalPrefs({ ...localPrefs, hazardousOnly: e.target.checked })}
              className="w-5 h-5 accent-blue-500 cursor-pointer"
            />
            <div>
              <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                Hazardous Only
              </p>
              <p className="text-sm text-slate-400">Only alert me about potentially hazardous asteroids</p>
            </div>
          </label>
        </div>

        <div className="h-px bg-gradient-to-r from-slate-700/50 to-transparent" />

        {/* Diameter Threshold */}
        <div>
          <label className="block mb-3">
            <span className="font-semibold text-white">Minimum Diameter (km)</span>
            <p className="text-sm text-slate-400 mb-2">Alert me only about asteroids larger than this</p>
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={localPrefs.diameterThreshold || ''}
            onChange={(e) => setLocalPrefs({ ...localPrefs, diameterThreshold: e.target.value ? parseFloat(e.target.value) : undefined })}
            placeholder="e.g., 1.5"
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
        </div>

        <div className="h-px bg-gradient-to-r from-slate-700/50 to-transparent" />

        {/* Miss Distance Threshold */}
        <div>
          <label className="block mb-3">
            <span className="font-semibold text-white">Maximum Miss Distance (km)</span>
            <p className="text-sm text-slate-400 mb-2">Alert me only about asteroids closer than this</p>
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={localPrefs.missDistanceThreshold || ''}
            onChange={(e) => setLocalPrefs({ ...localPrefs, missDistanceThreshold: e.target.value ? parseFloat(e.target.value) : undefined })}
            placeholder="e.g., 10000000"
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
        </div>

        <div className="h-px bg-gradient-to-r from-slate-700/50 to-transparent" />

        {/* Notification Methods */}
        <div className="space-y-3">
          <p className="font-semibold text-white">Notification Methods</p>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={localPrefs.notifyEmail || false}
              onChange={(e) => setLocalPrefs({ ...localPrefs, notifyEmail: e.target.checked })}
              className="w-5 h-5 accent-blue-500 cursor-pointer"
            />
            <span className="text-slate-300 group-hover:text-slate-200 transition-colors">
              Email Notifications
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={localPrefs.notifyInApp || false}
              onChange={(e) => setLocalPrefs({ ...localPrefs, notifyInApp: e.target.checked })}
              className="w-5 h-5 accent-blue-500 cursor-pointer"
            />
            <span className="text-slate-300 group-hover:text-slate-200 transition-colors">
              In-App Notifications
            </span>
          </label>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 transition-all"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
