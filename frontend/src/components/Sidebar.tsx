import { Home, Package, Activity, Settings, Bell, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PageName } from '../types';

interface SidebarProps {
  activePage: PageName;
  onNavigate: (page: PageName) => void;
}

const Sidebar = ({ activePage, onNavigate }: SidebarProps) => {
  const menuItems: { name: PageName; icon: React.ReactNode }[] = [
    { name: 'Dashboard', icon: <Home size={20} /> },
    { name: 'Shipments', icon: <Package size={20} /> },
    { name: 'Live Map', icon: <Map size={20} /> },
    { name: 'Alerts', icon: <Bell size={20} /> },
    { name: 'Analytics', icon: <Activity size={20} /> },
    { name: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col items-center py-6 shadow-sm z-10 hidden md:flex">
      <div className="flex items-center space-x-3 w-full px-6 mb-10">
        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/30">
          <Activity size={24} />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">SmartSupply</span>
      </div>

      <nav className="flex-1 w-full px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = activePage === item.name;
          return (
            <button
              key={item.name}
              onClick={() => onNavigate(item.name)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute right-4 w-1.5 h-8 bg-blue-600 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="w-full px-6 mt-auto">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl text-white shadow-xl">
          <h4 className="font-semibold text-sm mb-1">Pro Plan</h4>
          <p className="text-xs text-white/80 mb-3">AI Engine Active</p>
          <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors backdrop-blur-sm cursor-pointer">
            Manage
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
