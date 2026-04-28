import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Map as MapIcon, AlertTriangle, TrendingUp, CloudRain, ShieldAlert, Navigation, Bell, ChevronDown, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import MapComponent from './MapComponent';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
const API_URL = `${BACKEND_URL}/api`;

interface Shipment {
  _id: string;
  shipmentId: string;
  origin: { lat: number; lng: number; name?: string };
  destination: { lat: number; lng: number; name?: string };
  currentLocation: { lat: number; lng: number };
  route: { lat: number; lng: number }[];
  status: string;
  riskLevel: string;
  eta: string;
}

interface Alert {
  _id?: string;
  shipmentId: string;
  message: string;
  severity: string;
  createdAt?: string;
}

const Dashboard = () => {
  const { socket } = useSocket();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [activeShipment, setActiveShipment] = useState<Shipment | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showShipmentPicker, setShowShipmentPicker] = useState(false);

  useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('shipment-updated', (updatedShipment: Shipment) => {
      setShipments(prev => prev.map(s => s.shipmentId === updatedShipment.shipmentId ? updatedShipment : s));
      if (activeShipment?.shipmentId === updatedShipment.shipmentId) {
        setActiveShipment(updatedShipment);
      }
    });

    socket.on('location-updated', (data: { shipmentId: string; currentLocation: { lat: number; lng: number } }) => {
      setShipments(prev => prev.map(s => 
        s.shipmentId === data.shipmentId ? { ...s, currentLocation: data.currentLocation } : s
      ));
      if (activeShipment?.shipmentId === data.shipmentId) {
        setActiveShipment(prev => prev ? { ...prev, currentLocation: data.currentLocation } : null);
      }
    });

    socket.on('new-alert', (alert: Alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 10)); // Keep latest 10
    });

    return () => {
      socket.off('shipment-updated');
      socket.off('location-updated');
      socket.off('new-alert');
    };
  }, [socket, activeShipment]);

  const fetchShipments = async () => {
    try {
      const res = await axios.get(`${API_URL}/shipments`);
      setShipments(res.data);
      if (res.data.length > 0) {
        setActiveShipment(res.data[0]);
        fetchAlerts(res.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch shipments', err);
    }
  };

  const fetchAlerts = async (id: string) => {
    try {
      const res = await axios.get(`${API_URL}/shipments/${id}/alerts`);
      setAlerts(res.data);
    } catch (err) {
      console.error('Failed to fetch alerts', err);
    }
  };

  const createMockShipment = async () => {
    try {
      const res = await axios.post(`${API_URL}/shipments`);
      await fetchShipments();
      // Auto-select the newly created shipment
      setActiveShipment(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const selectShipment = (shipment: Shipment) => {
    setActiveShipment(shipment);
    fetchAlerts(shipment._id);
    setShowShipmentPicker(false);
  };

  const simulateEvent = async (eventType: string) => {
    if (!activeShipment) return;
    setLoadingAction(eventType);
    try {
      await axios.post(`${API_URL}/simulate/event`, {
        eventType,
        shipmentId: activeShipment.shipmentId
      });
      // Refresh after simulation
      setTimeout(() => fetchShipments(), 500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-orange-600 bg-orange-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delayed': return 'text-orange-600';
      case 'High Risk': return 'text-red-600';
      case 'Delivered': return 'text-purple-600';
      default: return 'text-green-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supply Chain Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time tracking and predictive risk analysis</p>
        </div>
        <button onClick={createMockShipment} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer">
          <Package size={18} />
          Demo Shipment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Active Shipments", value: shipments.filter(s => s.status !== 'Delivered').length, icon: <Package />, color: "text-blue-600", bg: "bg-blue-100" },
          { title: "ETA", value: activeShipment ? new Date(activeShipment.eta).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--', icon: <TrendingUp />, color: "text-green-600", bg: "bg-green-100" },
          { title: "Status", value: activeShipment?.status || 'N/A', icon: <AlertTriangle />, color: getStatusColor(activeShipment?.status || ''), bg: getRiskColor(activeShipment?.riskLevel || '').split(' ')[1] || 'bg-green-100' },
          { title: "Risk Level", value: activeShipment?.riskLevel || 'N/A', icon: <MapIcon />, color: getRiskColor(activeShipment?.riskLevel || '').split(' ')[0], bg: getRiskColor(activeShipment?.riskLevel || '').split(' ')[1] },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{card.title}</p>
              <h3 className={`text-2xl font-bold mt-0.5 ${card.color}`}>{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        {/* Main Map View */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 w-full">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <MapIcon size={18} className="text-blue-600" />
                Live Tracking Map
              </h2>
              {/* Shipment selector */}
              {shipments.length > 0 && (
                <div className="relative">
                  <button 
                    onClick={() => setShowShipmentPicker(!showShipmentPicker)} 
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                  >
                    <Truck size={14} />
                    {activeShipment?.shipmentId || 'Select'}
                    <ChevronDown size={12} />
                  </button>
                  {showShipmentPicker && (
                    <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-[100] min-w-[220px] max-h-[200px] overflow-y-auto">
                      {shipments.map((s) => (
                        <button
                          key={s._id}
                          onClick={() => selectShipment(s)}
                          className={`w-full text-left px-4 py-2.5 text-xs hover:bg-blue-50 transition-colors flex items-center justify-between cursor-pointer ${
                            activeShipment?.shipmentId === s.shipmentId ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                          }`}
                        >
                          <span className="font-mono">{s.shipmentId}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getRiskColor(s.riskLevel)}`}>{s.status}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2 relative z-50">
              {activeShipment && (
                <span className="hidden sm:flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md bg-gray-50 text-gray-500">
                  {activeShipment.origin?.name} → {activeShipment.destination?.name}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-green-50 text-green-700 shadow-sm relative z-50">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse relative z-50"></span>
                Live Sync
              </span>
            </div>
          </div>
          <div className="flex-1 bg-gray-50 relative pointer-events-auto">
            {activeShipment ? (
              <MapComponent 
                shipmentLocation={activeShipment.currentLocation} 
                route={activeShipment.route}
                origin={activeShipment.origin}
                destination={activeShipment.destination}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                <Package size={40} className="text-gray-300" />
                <p className="text-sm">No active shipment. Click <strong>"Demo Shipment"</strong> to create one.</p>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel: Scenario Simulator & Alerts */}
        <div className="flex flex-col gap-6 h-full">
          {/* Scenario Simulation */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex-1 max-h-[45%] flex flex-col">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
              <ShieldAlert size={18} className="text-purple-600" />
              Scenario Simulator
            </h2>
            <p className="text-xs text-gray-500 mb-4">Inject events to test AI risk prediction.</p>
            
            <div className="space-y-2 flex-1 overflow-y-auto pr-1 pb-1">
              <button disabled={loadingAction !== null || !activeShipment} onClick={() => simulateEvent('rain')} className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-700 rounded-xl transition-colors font-medium text-sm border border-blue-200/50 cursor-pointer disabled:cursor-not-allowed">
                <CloudRain size={18} />
                {loadingAction === 'rain' ? 'Simulating...' : 'Simulate Rain Storm'}
              </button>
              <button disabled={loadingAction !== null || !activeShipment} onClick={() => simulateEvent('traffic')} className="w-full flex items-center gap-3 px-4 py-3 bg-orange-50 hover:bg-orange-100 disabled:opacity-50 text-orange-700 rounded-xl transition-colors font-medium text-sm border border-orange-200/50 cursor-pointer disabled:cursor-not-allowed">
                <Navigation size={18} />
                {loadingAction === 'traffic' ? 'Simulating...' : 'Simulate Heavy Traffic'}
              </button>
              <button disabled={loadingAction !== null || !activeShipment} onClick={() => simulateEvent('roadblock')} className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 rounded-xl transition-colors font-medium text-sm border border-red-200/50 cursor-pointer disabled:cursor-not-allowed">
                <AlertTriangle size={18} />
                {loadingAction === 'roadblock' ? 'Simulating...' : 'Simulate Road Block'}
              </button>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex-1 max-h-[55%] flex flex-col overflow-hidden">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Bell size={18} className="text-red-500" />
              Recent AI Alerts
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-2">
               <AnimatePresence>
                 {alerts.length === 0 && (
                   <p className="text-xs text-gray-400 text-center mt-4">No alerts recorded yet.</p>
                 )}
                 {alerts.map((alert, i) => (
                   <motion.div
                     key={alert._id || i}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className={`p-3 border-l-4 rounded-r-lg ${alert.severity === 'Critical' ? 'bg-red-50 border-red-500' : alert.severity === 'Warning' ? 'bg-orange-50 border-orange-500' : 'bg-blue-50 border-blue-500'}`}
                   >
                     <p className={`text-xs font-semibold mb-1 ${alert.severity === 'Critical' ? 'text-red-700' : alert.severity === 'Warning' ? 'text-orange-700' : 'text-blue-700'}`}>
                       {alert.severity === 'Critical' ? '🚨' : alert.severity === 'Warning' ? '⚠️' : 'ℹ️'} {alert.severity.toUpperCase()} RISK
                     </p>
                     <p className="text-sm text-gray-800 leading-snug">{alert.message}</p>
                   </motion.div>
                 ))}
               </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
