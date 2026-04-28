import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, Package, AlertTriangle, Clock, MapPin, Truck, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import type { Shipment } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
const API_URL = `${BACKEND_URL}/api`;

const AnalyticsPage = () => {
  const { socket } = useSocket();
  const [shipments, setShipments] = useState<Shipment[]>([]);

  useEffect(() => { fetchShipments(); }, []);
  useEffect(() => {
    if (!socket) return;
    socket.on('shipment-updated', (u: Shipment) => setShipments(p => p.map(s => s.shipmentId === u.shipmentId ? u : s)));
    return () => { socket.off('shipment-updated'); };
  }, [socket]);

  const fetchShipments = async () => {
    try { const r = await axios.get(`${API_URL}/shipments`); setShipments(r.data); } catch (e) { console.error(e); }
  };

  const total = shipments.length;
  const onTime = shipments.filter(s => s.status === 'On-time').length;
  const delayed = shipments.filter(s => s.status === 'Delayed').length;
  const highRisk = shipments.filter(s => s.status === 'High Risk').length;
  const delivered = shipments.filter(s => s.status === 'Delivered').length;
  const active = total - delivered;
  const onTimeRate = total > 0 ? Math.round((onTime / total) * 100) : 0;
  const riskRate = total > 0 ? Math.round((highRisk / total) * 100) : 0;

  // Route analytics
  const routeCounts: Record<string, number> = {};
  shipments.forEach(s => {
    const route = `${s.origin?.name || '?'} → ${s.destination?.name || '?'}`;
    routeCounts[route] = (routeCounts[route] || 0) + 1;
  });
  const topRoutes = Object.entries(routeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Risk distribution
  const lowRisk = shipments.filter(s => s.riskLevel === 'Low').length;
  const medRisk = shipments.filter(s => s.riskLevel === 'Medium').length;
  const hiRisk = shipments.filter(s => s.riskLevel === 'High').length;

  const BarVisual = ({ value, max, color }: { value: number; max: number; color: string }) => (
    <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex-1">
      <motion.div initial={{ width: 0 }} animate={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }} transition={{ duration: 0.8, ease: 'easeOut' }} className={`h-full rounded-full ${color}`} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Insights and performance metrics for your supply chain</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Shipments', value: total, icon: <Package size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'On-Time Rate', value: `${onTimeRate}%`, icon: <TrendingUp size={20} />, color: 'text-green-600', bg: 'bg-green-50', sub: `${onTime} of ${total}` },
          { label: 'Active Now', value: active, icon: <Truck size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Risk Rate', value: `${riskRate}%`, icon: <AlertTriangle size={20} />, color: riskRate > 30 ? 'text-red-600' : 'text-orange-600', bg: riskRate > 30 ? 'bg-red-50' : 'bg-orange-50', sub: `${highRisk} high risk` },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color}`}>{kpi.icon}</div>
            </div>
            <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">{kpi.label}</p>
            {kpi.sub && <p className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</p>}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-5"><BarChart3 size={18} className="text-blue-600" /> Status Distribution</h2>
          <div className="space-y-4">
            {[
              { label: 'On-time', value: onTime, color: 'bg-green-500' },
              { label: 'Delayed', value: delayed, color: 'bg-orange-500' },
              { label: 'High Risk', value: highRisk, color: 'bg-red-500' },
              { label: 'Delivered', value: delivered, color: 'bg-purple-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-600 w-20">{item.label}</span>
                <BarVisual value={item.value} max={total} color={item.color} />
                <span className="text-sm font-bold text-gray-700 w-8 text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Risk Distribution */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-5"><AlertTriangle size={18} className="text-orange-600" /> Risk Distribution</h2>
          <div className="flex items-end gap-6 h-40 px-4">
            {[
              { label: 'Low', value: lowRisk, color: 'bg-green-500', textColor: 'text-green-700' },
              { label: 'Medium', value: medRisk, color: 'bg-orange-500', textColor: 'text-orange-700' },
              { label: 'High', value: hiRisk, color: 'bg-red-500', textColor: 'text-red-700' },
            ].map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className={`text-lg font-bold ${item.textColor}`}>{item.value}</span>
                <motion.div initial={{ height: 0 }} animate={{ height: total > 0 ? `${Math.max((item.value / total) * 100, 5)}%` : '5%' }} transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }} className={`w-full rounded-t-xl ${item.color} min-h-[8px]`} />
                <span className="text-xs font-medium text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Routes */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-5"><MapPin size={18} className="text-purple-600" /> Top Routes</h2>
          {topRoutes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No route data yet</p>
          ) : (
            <div className="space-y-3">
              {topRoutes.map(([route, count], i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="flex-1 text-sm text-gray-700 truncate">{route}</span>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Performance Summary */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-5"><Clock size={18} className="text-indigo-600" /> Performance Summary</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
              <div><p className="text-xs text-green-600 font-semibold">Delivery Efficiency</p><p className="text-sm text-gray-700 mt-0.5">{delivered} out of {total} completed</p></div>
              <div className="flex items-center gap-1 text-green-600"><ArrowUp size={14} /><span className="text-lg font-bold">{total > 0 ? Math.round((delivered / total) * 100) : 0}%</span></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
              <div><p className="text-xs text-orange-600 font-semibold">Delay Ratio</p><p className="text-sm text-gray-700 mt-0.5">{delayed + highRisk} shipments affected</p></div>
              <div className="flex items-center gap-1 text-orange-600"><ArrowDown size={14} /><span className="text-lg font-bold">{total > 0 ? Math.round(((delayed + highRisk) / total) * 100) : 0}%</span></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div><p className="text-xs text-blue-600 font-semibold">Fleet Utilization</p><p className="text-sm text-gray-700 mt-0.5">{active} vehicles in transit</p></div>
              <span className="text-lg font-bold text-blue-600">{active}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
