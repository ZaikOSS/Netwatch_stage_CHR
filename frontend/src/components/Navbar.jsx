import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import api from '../api';

function Navbar({ engineStatus, fetchData }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [pinging, setPinging] = useState(false);

  const handlePingAll = async () => {
    if (!fetchData) return;
    setPinging(true);
    try {
      await api.post('/engine/ping-all');
      fetchData();
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => setPinging(false), 1000);
  };

  if (!user) return null;

  return (
    <header className="bg-[#0f172a] border-b border-[#334155] flex justify-between items-center px-margin py-sm w-full z-50 sticky top-0 text-primary shadow-sm">
      {/* Left: Brand & Status Badge */}
      <div className="flex items-center gap-md">
        <div className="font-display-lg text-display-lg font-black tracking-tighter text-primary flex items-center gap-xs cursor-pointer" onClick={() => navigate('/')}>
          <span>NETWATCH</span>
        </div>
        {engineStatus && (
          <div className={`border font-label-caps text-label-caps px-2 py-1 flex items-center gap-2 ml-4 ${engineStatus.enabled ? 'bg-green-900/30 border-green-500/50 text-green-400' : 'bg-red-900/30 border-red-500/50 text-red-400'}`}>
            <span className={`w-2 h-2 rounded-full inline-block ${engineStatus.enabled ? 'bg-green-500 animate-blink' : 'bg-red-500'}`}></span>
            {engineStatus.enabled ? `AUTO PING: ${engineStatus.interval}S` : 'ENGINE: PAUSED'}
          </div>
        )}
      </div>
      
      {/* Center: Navigation */}
      <nav className="hidden md:flex gap-sm h-full items-end font-label-caps text-label-caps self-end">
        <a 
          onClick={() => navigate('/')} 
          className={`px-4 py-2 cursor-pointer transition-colors duration-200 rounded-t-md border-b-2 ${location.pathname === '/' ? 'bg-[#1e293b] text-primary border-primary' : 'bg-transparent text-on-surface-variant border-transparent hover:bg-[#1e293b] hover:text-primary'}`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">device_hub</span>
            Topology Map
          </div>
        </a>
        {user?.role === 'admin' && (
          <a 
            onClick={() => navigate('/admin')} 
            className={`px-4 py-2 cursor-pointer transition-colors duration-200 rounded-t-md border-b-2 ${location.pathname === '/admin' ? 'bg-[#1e293b] text-primary border-primary' : 'bg-transparent text-on-surface-variant border-transparent hover:bg-[#1e293b] hover:text-primary'}`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              Admin Panel
            </div>
          </a>
        )}
      </nav>

      {/* Right: Account & Actions */}
      <div className="flex items-center gap-md font-code-md text-code-md">
        <div className="flex items-center gap-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">person</span>
          <span>{user?.username}</span>
        </div>
        <div className="w-px h-4 bg-[#334155] mx-2"></div>
        {fetchData && (
          <button onClick={handlePingAll} disabled={pinging} className={`flex items-center gap-xs px-3 py-1.5 rounded transition-colors duration-150 ${pinging ? 'bg-orange-500/50 text-orange-200' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'}`}>
            <span className="material-symbols-outlined text-[16px]">{pinging ? 'radar' : 'bolt'}</span>
            {pinging ? 'Pinging...' : 'Ping All'}
          </button>
        )}
        <button onClick={logout} className="ml-2 bg-[#1e293b] hover:bg-red-500/20 hover:text-red-400 text-on-surface px-3 py-1.5 rounded transition-colors duration-150 font-label-caps text-label-caps flex items-center gap-1 border border-[#334155] hover:border-red-500/50">
          <span className="material-symbols-outlined text-[16px]">logout</span>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
