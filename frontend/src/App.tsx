import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ShipmentsPage from './components/ShipmentsPage';
import LiveMapPage from './components/LiveMapPage';
import AlertsPage from './components/AlertsPage';
import AnalyticsPage from './components/AnalyticsPage';
import SettingsPage from './components/SettingsPage';
import type { PageName } from './types';

function App() {
  const [activePage, setActivePage] = useState<PageName>('Dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard': return <Dashboard />;
      case 'Shipments': return <ShipmentsPage onNavigate={(p) => setActivePage(p as PageName)} />;
      case 'Live Map': return <LiveMapPage />;
      case 'Alerts': return <AlertsPage />;
      case 'Analytics': return <AnalyticsPage />;
      case 'Settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="flex-1 flex flex-col relative w-full">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
