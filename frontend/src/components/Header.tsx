import { Search, Bell } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 z-10 sticky top-0">
      <div className="relative w-96 hidden lg:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search shipments, destinations..."
          className="w-full bg-gray-100 border-none rounded-full py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center space-x-5 ml-auto">
        <button className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-px bg-gray-200"></div>
        <button className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
            JD
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">Logistics Manager</p>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
