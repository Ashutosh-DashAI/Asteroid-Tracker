import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Save, Shield, Zap, Eye } from 'lucide-react';
import { AlertPreference } from '@/types';
import { useAsteroidsStore } from '@/store/useAsteroidsStore';
import { useToast } from '@/context/ToastContext';
import { useAsteroidStats } from '@/hooks/useAsteroidStats';
import SkeletonCard from '@/components/ui/SkeletonCard';

export default function Alerts() {
  const {
    alertPrefs,
    alertLoading,
    fetchAlertPreferences,
    updateAlertPreferences,
  } = useAsteroidsStore();
  const toast = useToast();
  const { data: stats } = useAsteroidStats();

  const [localPrefs, setLocalPrefs] = useState<Partial<AlertPreference>>(
    (alertPrefs as Partial<AlertPreference>) || {}
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAlertPreferences();
  }, []);

  useEffect(() => {
    if (alertPrefs) {
      setLocalPrefs(alertPrefs);
    }
  }, [alertPrefs]);

  // Calculate estimated alert count for preview
  const estimatedAlertCount = React.useMemo(() => {
    if (!stats) return 0;
    let count = stats.hazardousCount || 0;
    if (!localPrefs.hazardousOnly) {
      count = stats.totalAsteroids || 0;
    }
    if (localPrefs.diameterThreshold && localPrefs.diameterThreshold > 0) {
      count = Math.round(count * 0.3);
    }
    if (localPrefs.missDistanceThreshold && localPrefs.missDistanceThreshold > 0) {
      count = Math.round(count * 0.6);
    }
    return Math.min(count, stats.totalAsteroids || 0);
  }, [stats, localPrefs]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAlertPreferences(localPrefs);
      toast.show('Alert preferences saved successfully!', 'success');
    } catch (err) {
      toast.show('Failed to save preferences. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (alertLoading) {
    return (
      <div className="space-y-6 animate-fade-slide-up">
        <SkeletonCard count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-slide-up">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <Bell size={32} style={{ color: 'var(--cyan)' }} />
          <h1 className="text-4xl md:text-5xl font-bold glow-text-cyan" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Alert Preferences
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>Customize how you want to be notified about asteroids</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preferences Card — 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 rounded-2xl p-8 space-y-6"
          style={{
            background: 'var(--bg-deep)',
            border: '1px solid #ffffff08',
            boxShadow: 'var(--glow-card)',
          }}
        >
          {/* Hazardous Only */}
          <div>
            <label className="flex items-center gap-4 cursor-pointer group">
              <input
                type="checkbox"
                checked={localPrefs.hazardousOnly || false}
                onChange={(e) => setLocalPrefs({ ...localPrefs, hazardousOnly: e.target.checked })}
                className="w-5 h-5 rounded accent-[var(--cyan)] cursor-pointer"
              />
              <div>
                <p className="font-semibold transition-colors duration-150" style={{ color: 'var(--text-primary)' }}>
                  Hazardous Only
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Only alert me about potentially hazardous asteroids</p>
              </div>
            </label>
          </div>

          <div style={{ height: '1px', background: 'linear-gradient(90deg, #ffffff10, transparent)' }} />

          {/* Diameter Threshold */}
          <div>
            <label className="block mb-3">
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Minimum Diameter (km)</span>
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Alert me only about asteroids larger than this</p>
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={localPrefs.diameterThreshold || ''}
              onChange={(e) => setLocalPrefs({ ...localPrefs, diameterThreshold: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="e.g., 1.5"
              className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid #ffffff08',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--cyan)';
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--cyan-dim)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#ffffff08';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ height: '1px', background: 'linear-gradient(90deg, #ffffff10, transparent)' }} />

          {/* Miss Distance Threshold */}
          <div>
            <label className="block mb-3">
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Maximum Miss Distance (km)</span>
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Alert me only about asteroids closer than this</p>
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={localPrefs.missDistanceThreshold || ''}
              onChange={(e) => setLocalPrefs({ ...localPrefs, missDistanceThreshold: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="e.g., 10000000"
              className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid #ffffff08',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--cyan)';
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--cyan-dim)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#ffffff08';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ height: '1px', background: 'linear-gradient(90deg, #ffffff10, transparent)' }} />

          {/* Notification Methods */}
          <div className="space-y-3">
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Notification Methods</p>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={localPrefs.notifyEmail || false}
                onChange={(e) => setLocalPrefs({ ...localPrefs, notifyEmail: e.target.checked })}
                className="w-5 h-5 rounded accent-[var(--cyan)] cursor-pointer"
              />
              <span className="transition-colors duration-150" style={{ color: 'var(--text-secondary)' }}>
                Email Notifications
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={localPrefs.notifyInApp || false}
                onChange={(e) => setLocalPrefs({ ...localPrefs, notifyInApp: e.target.checked })}
                className="w-5 h-5 rounded accent-[var(--cyan)] cursor-pointer"
              />
              <span className="transition-colors duration-150" style={{ color: 'var(--text-secondary)' }}>
                In-App Notifications
              </span>
            </label>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all duration-200 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, var(--purple), var(--cyan))',
                boxShadow: '0 0 20px rgba(0,212,255,0.2)',
              }}
              onMouseEnter={(e) => {
                if (!saving) e.currentTarget.style.boxShadow = '0 0 30px rgba(0,212,255,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0,212,255,0.2)';
              }}
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </motion.div>

        {/* Preview Panel — 1 col */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1 rounded-2xl p-6"
          style={{
            background: 'var(--bg-deep)',
            border: '1px solid #ffffff08',
            boxShadow: 'var(--glow-card)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Eye size={18} style={{ color: 'var(--cyan)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Alert Preview</h3>
          </div>

          <div
            className="rounded-xl p-4 mb-4"
            style={{ background: 'var(--bg-surface)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} style={{ color: 'var(--safe)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Estimated Alerts</span>
            </div>
            <div className="text-3xl font-bold" style={{ color: 'var(--cyan)', textShadow: 'var(--glow-cyan)' }}>
              {estimatedAlertCount}
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>asteroids in the last 30 days</p>
          </div>

          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            With your current settings, you would have been alerted about{' '}
            <span className="font-bold" style={{ color: 'var(--cyan)' }}>{estimatedAlertCount}</span>{' '}
            asteroids in the last 30 days.
          </p>

          {localPrefs.hazardousOnly && (
            <div
              className="mt-4 rounded-lg px-3 py-2 text-xs"
              style={{ background: 'var(--hazard-dim)', color: 'var(--hazard)', border: '1px solid var(--hazard-dim)' }}
            >
              Only hazardous asteroids are being tracked
            </div>
          )}

          {localPrefs.diameterThreshold && localPrefs.diameterThreshold > 0 && (
            <div
              className="mt-2 rounded-lg px-3 py-2 text-xs"
              style={{ background: 'var(--cyan-dim)', color: 'var(--cyan)', border: '1px solid var(--cyan-dim)' }}
            >
              Minimum diameter: {localPrefs.diameterThreshold} km
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}