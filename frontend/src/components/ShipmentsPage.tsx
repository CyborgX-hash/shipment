import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, MapPin, Clock, AlertTriangle, TrendingUp, Search, Filter, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import type { Shipment } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
const API_URL = `${BACKEND_URL}/api`;

const ShipmentsPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { socket } = useSocket();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  useEffect(() => { fetchShipments(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('shipment-updated', (u: Shipment) => setShipments(p => p.map(s => s.shipmentId === u.shipmentId ? u : s)));
    socket.on('location-updated', (d: { shipmentId: string; currentLocation: { lat: number; lng: number } }) => {
      setShipments(p => p.map(s => s.shipmentId === d.shipmentId ? { ...s, currentLocation: d.currentLocation } : s));
    });
    return () => { socket.off('shipment-updated'); socket.off('location-updated'); };
  }, [socket]);

  const fetchShipments = async () => {
    try { const r = await axios.get(`${API_URL}/shipments`); setShipments(r.data); } catch (e) { console.error(e); }
  };

  const createMock = async () => {
    try { await axios.post(`${API_URL}/shipments`); fetchShipments(); } catch (e) { console.error(e); }
  };

  const riskBadge = (r: string) => r === 'High' ? 'bg-red-100 text-red-700' : r === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700';
  const statusBadge = (s: string) => s === 'Delayed' ? 'bg-orange-50 text-orange-700' : s === 'High Risk' ? 'bg-red-50 text-red-700' : s === 'Delivered' ? 'bg-purple-50 text-purple-700' : 'bg-green-50 text-green-700';

  const filtered = shipments.filter(s => {
    if (filterStatus !== 'All' && s.status !== filterStatus) return false;
    if (searchTerm && !s.shipmentId.toLowerCase().includes(searchTerm.toLowerCase()) && !s.origin?.name?.toLowerCase().includes(searchTerm.toLowerCase()) && !s.destination?.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipments</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and monitor all active shipments</p>
        </div>
        <button onClick={createMock} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer">
          <Package size={18} /> New Shipment
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: shipments.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: <Package size={18} /> },
          { label: 'On-time', value: shipments.filter(s => s.status === 'On-time').length, color: 'text-green-600', bg: 'bg-green-50', icon: <TrendingUp size={18} /> },
          { label: 'Delayed', value: shipments.filter(s => s.status === 'Delayed' || s.status === 'High Risk').length, color: 'text-orange-600', bg: 'bg-orange-50', icon: <AlertTriangle size={18} /> },
          { label: 'Delivered', value: shipments.filter(s => s.status === 'Delivered').length, color: 'text-purple-600', bg: 'bg-purple-50', icon: <MapPin size={18} /> },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>{stat.icon}</div>
            <div><p className="text-xs text-gray-500 font-medium">{stat.label}</p><p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p></div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by ID, origin, destination..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="pl-8 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="All">All Status</option><option value="On-time">On-time</option><option value="Delayed">Delayed</option><option value="High Risk">High Risk</option><option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center"><Package size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500 text-sm">No shipments found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Route</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ETA</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((s, i) => (
                  <motion.tr key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-900">{s.shipmentId}</td>
                    <td className="px-6 py-4 text-sm"><span className="text-gray-700">{s.origin?.name || '—'}</span> <span className="text-gray-400">→</span> <span className="text-gray-700">{s.destination?.name || '—'}</span></td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${statusBadge(s.status)}`}>{s.status}</span></td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${riskBadge(s.riskLevel)}`}>{s.riskLevel}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-700 flex items-center gap-1.5"><Clock size={14} className="text-gray-400" />{new Date(s.eta).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-6 py-4 text-right"><button onClick={() => setSelectedShipment(s)} className="p-2 hover:bg-blue-100 rounded-lg cursor-pointer" title="View Details"><Eye size={16} className="text-blue-600" /></button></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedShipment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-end" onClick={() => setSelectedShipment(null)}>
            <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-full max-w-md h-full bg-white shadow-2xl p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Shipment Details</h2>
                <button onClick={() => setSelectedShipment(null)} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer text-gray-500">✕</button>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Shipment ID</p><p className="font-mono font-bold text-gray-900">{selectedShipment.shipmentId}</p></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-xl p-3 border border-green-100"><p className="text-xs text-green-600 font-semibold mb-1">Origin</p><p className="text-sm font-medium text-gray-900">{selectedShipment.origin?.name || '—'}</p></div>
                  <div className="bg-red-50 rounded-xl p-3 border border-red-100"><p className="text-xs text-red-600 font-semibold mb-1">Destination</p><p className="text-sm font-medium text-gray-900">{selectedShipment.destination?.name || '—'}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-gray-200 rounded-xl p-3"><p className="text-xs text-gray-500 mb-1">Status</p><span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(selectedShipment.status)}`}>{selectedShipment.status}</span></div>
                  <div className="bg-white border border-gray-200 rounded-xl p-3"><p className="text-xs text-gray-500 mb-1">Risk</p><span className={`px-2 py-0.5 rounded text-xs font-semibold ${riskBadge(selectedShipment.riskLevel)}`}>{selectedShipment.riskLevel}</span></div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs text-blue-600 font-semibold mb-1">Current Location</p>
                  <p className="text-sm font-mono text-gray-800">{selectedShipment.currentLocation.lat.toFixed(5)}, {selectedShipment.currentLocation.lng.toFixed(5)}</p>
                  <div className="flex items-center gap-1.5 mt-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span><span className="text-xs text-green-700 font-medium">Live tracking active</span></div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">ETA</p><p className="text-lg font-bold text-gray-900">{new Date(selectedShipment.eta).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
                <button onClick={() => { setSelectedShipment(null); onNavigate('Dashboard'); }} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl cursor-pointer flex items-center justify-center gap-2"><Eye size={16} />Track on Dashboard</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShipmentsPage;
