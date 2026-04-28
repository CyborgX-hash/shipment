import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Map, Truck, Shield, Moon, Sun, Globe, Database, Wifi, Save, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    soundAlerts: true,
    autoRefresh: true,
    refreshInterval: 8,
    mapStyle: 'default',
    units: 'metric',
    riskThreshold: 'medium',
    liveTracking: true,
    showDelivered: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const handleReset = () => {
    setSettings({ darkMode: false, notifications: true, soundAlerts: true, autoRefresh: true, refreshInterval: 8, mapStyle: 'default', units: 'metric', riskThreshold: 'medium', liveTracking: true, showDelivered: true });
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${value ? 'bg-blue-600' : 'bg-gray-300'}`}>
      <motion.div animate={{ x: value ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
    </button>
  );

  const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-5">{icon}{title}</h2>
      <div className="space-y-5">{children}</div>
    </motion.div>
  );

  const Row = ({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between">
      <div><p className="text-sm font-medium text-gray-800">{label}</p><p className="text-xs text-gray-500 mt-0.5">{desc}</p></div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your SmartSupply dashboard</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all flex items-center gap-2 cursor-pointer">
            <RotateCcw size={16} /> Reset
          </button>
          <button onClick={handleSave} className={`px-4 py-2 font-medium rounded-xl transition-all flex items-center gap-2 cursor-pointer ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
            <Save size={16} /> {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      <Section title="Appearance" icon={<Moon size={18} className="text-indigo-600" />}>
        <Row label="Dark Mode" desc="Switch to dark theme"><Toggle value={settings.darkMode} onChange={v => setSettings(s => ({ ...s, darkMode: v }))} /></Row>
        <Row label="Map Style" desc="Choose map visual style">
          <select value={settings.mapStyle} onChange={e => setSettings(s => ({ ...s, mapStyle: e.target.value }))} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="default">Default</option><option value="satellite">Satellite</option><option value="terrain">Terrain</option>
          </select>
        </Row>
      </Section>

      <Section title="Notifications" icon={<Bell size={18} className="text-orange-600" />}>
        <Row label="Push Notifications" desc="Get notified about shipment events"><Toggle value={settings.notifications} onChange={v => setSettings(s => ({ ...s, notifications: v }))} /></Row>
        <Row label="Sound Alerts" desc="Play sound for critical alerts"><Toggle value={settings.soundAlerts} onChange={v => setSettings(s => ({ ...s, soundAlerts: v }))} /></Row>
        <Row label="Risk Alert Threshold" desc="Minimum severity to trigger alerts">
          <select value={settings.riskThreshold} onChange={e => setSettings(s => ({ ...s, riskThreshold: e.target.value }))} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="low">Low & Above</option><option value="medium">Medium & Above</option><option value="high">High Only</option>
          </select>
        </Row>
      </Section>

      <Section title="Tracking" icon={<Truck size={18} className="text-blue-600" />}>
        <Row label="Live Tracking" desc="Enable real-time GPS tracking"><Toggle value={settings.liveTracking} onChange={v => setSettings(s => ({ ...s, liveTracking: v }))} /></Row>
        <Row label="Auto Refresh" desc="Automatically refresh shipment data"><Toggle value={settings.autoRefresh} onChange={v => setSettings(s => ({ ...s, autoRefresh: v }))} /></Row>
        <Row label="Refresh Interval" desc="Seconds between data refreshes">
          <select value={settings.refreshInterval} onChange={e => setSettings(s => ({ ...s, refreshInterval: Number(e.target.value) }))} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none">
            <option value={5}>5s</option><option value={8}>8s</option><option value={15}>15s</option><option value={30}>30s</option>
          </select>
        </Row>
        <Row label="Show Delivered" desc="Include delivered shipments in lists"><Toggle value={settings.showDelivered} onChange={v => setSettings(s => ({ ...s, showDelivered: v }))} /></Row>
      </Section>

      <Section title="System" icon={<Database size={18} className="text-gray-600" />}>
        <Row label="Units" desc="Distance and speed units">
          <select value={settings.units} onChange={e => setSettings(s => ({ ...s, units: e.target.value }))} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="metric">Metric (km)</option><option value="imperial">Imperial (mi)</option>
          </select>
        </Row>
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Wifi size={16} className="text-green-600" />
            <div><p className="text-xs font-medium text-gray-800">Backend Connection</p><p className="text-[10px] text-gray-500 font-mono">{import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'}</p></div>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-green-600 font-medium"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>Connected</span>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <Globe size={16} className="text-blue-600" />
          <div><p className="text-xs font-medium text-gray-800">Google Maps API</p><p className="text-[10px] text-gray-500 font-mono">{import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? '••••' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY.slice(-6) : 'Not configured'}</p></div>
          <span className={`ml-auto text-xs font-medium ${import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'text-green-600' : 'text-red-600'}`}>{import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Active' : 'Missing'}</span>
        </div>
      </Section>
    </div>
  );
};

export default SettingsPage;
