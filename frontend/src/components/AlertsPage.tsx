import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, AlertTriangle, Info, ShieldAlert, RefreshCw, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import type { Alert } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
const API_URL = `${BACKEND_URL}/api`;

const AlertsPage = () => {
  const { socket } = useSocket();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  // shipments state removed to fix TS error
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('new-alert', (a: Alert) => setAlerts(p => [a, ...p]));
    return () => { socket.off('new-alert'); };
  }, [socket]);

  const fetchAll = async () => {
    try {
      const shipRes = await axios.get(`${API_URL}/shipments`);
      // setShipments(shipRes.data);
      const allAlerts: Alert[] = [];
      for (const s of shipRes.data) {
        try {
          const aRes = await axios.get(`${API_URL}/shipments/${s._id}/alerts`);
          allAlerts.push(...aRes.data.map((a: Alert) => ({ ...a, shipmentId: s.shipmentId })));
        } catch {}
      }
      allAlerts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setAlerts(allAlerts);
    } catch (e) { console.error(e); }
  };

  const filtered = alerts.filter(a => {
    if (filterSeverity !== 'All' && a.severity !== filterSeverity) return false;
    if (searchTerm && !a.message.toLowerCase().includes(searchTerm.toLowerCase()) && !a.shipmentId.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const severityIcon = (s: string) => s === 'Critical' ? <ShieldAlert size={18} className="text-red-500" /> : s === 'Warning' ? <AlertTriangle size={18} className="text-orange-500" /> : <Info size={18} className="text-blue-500" />;
  const severityStyle = (s: string) => s === 'Critical' ? 'border-l-red-500 bg-red-50' : s === 'Warning' ? 'border-l-orange-500 bg-orange-50' : 'border-l-blue-500 bg-blue-50';
  const severityText = (s: string) => s === 'Critical' ? 'text-red-700' : s === 'Warning' ? 'text-orange-700' : 'text-blue-700';

  const criticalCount = alerts.filter(a => a.severity === 'Critical').length;
  const warningCount = alerts.filter(a => a.severity === 'Warning').length;
  const infoCount = alerts.filter(a => a.severity === 'Info').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-sm text-gray-500 mt-1">AI-powered risk alerts across all shipments</p>
        </div>
        <button onClick={fetchAll} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all flex items-center gap-2 cursor-pointer">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Alerts', value: alerts.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: <Bell size={18} /> },
          { label: 'Critical', value: criticalCount, color: 'text-red-600', bg: 'bg-red-50', icon: <ShieldAlert size={18} /> },
          { label: 'Warnings', value: warningCount, color: 'text-orange-600', bg: 'bg-orange-50', icon: <AlertTriangle size={18} /> },
          { label: 'Info', value: infoCount, color: 'text-blue-600', bg: 'bg-blue-50', icon: <Info size={18} /> },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>{stat.icon}</div>
            <div><p className="text-xs text-gray-500 font-medium">{stat.label}</p><p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p></div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search alerts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="pl-8 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="All">All Severity</option><option value="Critical">Critical</option><option value="Warning">Warning</option><option value="Info">Info</option>
          </select>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm">No alerts found. Simulate events from the Dashboard to generate alerts.</p>
          </div>
        )}
        <AnimatePresence>
          {filtered.map((alert, i) => (
            <motion.div key={alert._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden border-l-4 ${severityStyle(alert.severity)}`}>
              <div className="p-4 flex items-start gap-3">
                <div className="mt-0.5">{severityIcon(alert.severity)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${severityText(alert.severity)}`}>{alert.severity}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 font-mono">{alert.shipmentId}</span>
                    {alert.createdAt && <>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{new Date(alert.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </>}
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">{alert.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AlertsPage;
