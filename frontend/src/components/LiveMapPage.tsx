import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../hooks/useSocket';
import MapComponent from './MapComponent';
import type { Shipment } from '../types';
import { MapPin, Truck } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
const API_URL = `${BACKEND_URL}/api`;

const LiveMapPage = () => {
  const { socket } = useSocket();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selected, setSelected] = useState<Shipment | null>(null);

  useEffect(() => { fetchShipments(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('shipment-updated', (u: Shipment) => {
      setShipments(p => p.map(s => s.shipmentId === u.shipmentId ? u : s));
      if (selected?.shipmentId === u.shipmentId) setSelected(u);
    });
    socket.on('location-updated', (d: { shipmentId: string; currentLocation: { lat: number; lng: number } }) => {
      setShipments(p => p.map(s => s.shipmentId === d.shipmentId ? { ...s, currentLocation: d.currentLocation } : s));
      if (selected?.shipmentId === d.shipmentId) setSelected(prev => prev ? { ...prev, currentLocation: d.currentLocation } : null);
    });
    return () => { socket.off('shipment-updated'); socket.off('location-updated'); };
  }, [socket, selected]);

  const fetchShipments = async () => {
    try { const r = await axios.get(`${API_URL}/shipments`); setShipments(r.data); if (r.data.length > 0) setSelected(r.data[0]); } catch (e) { console.error(e); }
  };

  // const riskColor removed to fix TS error

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Live Map</h1>
        <p className="text-sm text-gray-500 mt-1">Full-screen real-time shipment tracking</p>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Shipment List */}
        <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Truck size={16} className="text-blue-600" /> Active Shipments ({shipments.filter(s => s.status !== 'Delivered').length})</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {shipments.length === 0 && <p className="text-xs text-gray-400 text-center p-4">No shipments yet</p>}
            {shipments.map(s => (
              <button key={s._id} onClick={() => setSelected(s)} className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer ${selected?.shipmentId === s.shipmentId ? 'bg-blue-50 border border-blue-200 shadow-sm' : 'hover:bg-gray-50 border border-transparent'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-semibold text-gray-900">{s.shipmentId.replace('SHP-', '').slice(-8)}</span>
                  <span className={`w-2 h-2 rounded-full ${s.status === 'Delivered' ? 'bg-purple-500' : s.status === 'On-time' ? 'bg-green-500 animate-pulse' : 'bg-orange-500 animate-pulse'}`}></span>
                </div>
                <p className="text-[11px] text-gray-500 truncate">{s.origin?.name} → {s.destination?.name}</p>
                <div className="flex gap-2 mt-1.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${s.status === 'On-time' ? 'bg-green-100 text-green-700' : s.status === 'Delayed' ? 'bg-orange-100 text-orange-700' : s.status === 'High Risk' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}`}>{s.status}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${s.riskLevel === 'High' ? 'bg-red-100 text-red-700' : s.riskLevel === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{s.riskLevel}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-700"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>Live</span>
              {selected && <span className="text-xs text-gray-500 font-mono">{selected.shipmentId}</span>}
              {selected && <span className="text-xs text-gray-400">{selected.origin?.name} → {selected.destination?.name}</span>}
            </div>
          </div>
          {selected ? (
            <MapComponent shipmentLocation={selected.currentLocation} route={selected.route} origin={selected.origin} destination={selected.destination} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
              <MapPin size={40} className="text-gray-300" /><p className="text-sm">No shipment selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMapPage;
