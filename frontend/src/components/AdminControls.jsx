import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from './Navbar';

function AdminControls() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [devices, setDevices] = useState([]);
  const [links, setLinks] = useState([]);
  const [engineStatus, setEngineStatus] = useState({ enabled: false, interval: 10 });
  const [sysTime, setSysTime] = useState('');

  // Forms
  const [newDevice, setNewDevice] = useState({ name: '', ip_address: '', icon_type: 'switch' });
  const [newLink, setNewLink] = useState({ source_device_id: '', target_device_id: '', interface_port: 'backbone' });
  const [newInterval, setNewInterval] = useState('');
  const [newUser, setNewUser] = useState({ username: '', password: '' });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    } else {
      fetchData();
    }
    
    const timeInterval = setInterval(() => {
      const now = new Date();
      setSysTime(now.toISOString().split('T')[1].split('.')[0] + ' UTC');
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [user]);

  const fetchData = async () => {
    try {
      const [devRes, linkRes, engRes] = await Promise.all([
        api.get('/devices'),
        api.get('/links'),
        api.get('/engine/status')
      ]);
      setDevices(devRes.data);
      setLinks(linkRes.data);
      setEngineStatus(engRes.data);
      setNewInterval(engRes.data.interval.toString());
      
      if (devRes.data.length > 1 && !newLink.source_device_id) {
        setNewLink(prev => ({
          ...prev,
          source_device_id: devRes.data[0].id.toString(),
          target_device_id: devRes.data[1].id.toString()
        }));
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) return;
    try {
      await api.post('/users', { ...newUser, role: 'visitor' });
      setNewUser({ username: '', password: '' });
      alert('Visitor account created successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (!newDevice.name || !newDevice.ip_address) return;
    try {
      await api.post('/devices', newDevice);
      setNewDevice({ name: '', ip_address: '', icon_type: 'switch' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDevice = async (id) => {
    if (!window.confirm('Delete this device? Links will cascade.')) return;
    try {
      await api.delete(`/devices/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newLink.source_device_id || !newLink.target_device_id) return;
    try {
      await api.post('/links', newLink);
      fetchData();
      alert('Link created successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to create link');
    }
  };

  const handleDeleteLink = async (id) => {
    try {
      await api.delete(`/links/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleEngine = async () => {
    try {
      await api.post('/engine/toggle', { enabled: !engineStatus.enabled });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateInterval = async (e) => {
    e.preventDefault();
    const val = parseInt(newInterval, 10);
    if (!val || val < 1) return;
    try {
      await api.post('/engine/interval', { interval: val });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePingAll = async () => {
    try {
      await api.post('/engine/ping-all');
      alert('Global ping sweep completed!');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    const csvRows = [];
    csvRows.push(['Type', 'ID', 'Name/Source', 'IP/Target', 'Icon/Port', 'Status'].join(','));
    
    // Devices
    devices.forEach(d => {
      csvRows.push(['Device', d.id, `"${d.name}"`, d.ip_address, d.icon_type, d.status].join(','));
    });
    
    // Links
    links.forEach(l => {
      const src = devices.find(d => d.id === l.source_device_id)?.name || l.source_device_id;
      const tgt = devices.find(d => d.id === l.target_device_id)?.name || l.target_device_id;
      csvRows.push(['Link', l.id, `"${src}"`, `"${tgt}"`, l.interface_port, ''].join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'network_inventory.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-[#0f172a] text-[#e1e2ed] font-body-md min-h-screen flex flex-col antialiased">
      
      <Navbar engineStatus={engineStatus} fetchData={fetchData} />

      {/* Main Workspace */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-lg flex flex-col gap-lg overflow-y-auto pb-16">
        
        {/* User Account Controls Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-[#434655] pb-md mt-sm">
          <div>
            <h1 className="font-headline-md text-headline-md text-primary">Access Control</h1>
            <p className="font-code-md text-code-md text-on-surface-variant mt-xs">Create visitor accounts to view the topology and ping statuses.</p>
          </div>
        </div>
        
        <form onSubmit={handleAddUser} className="bg-[#1e293b] border border-[#334155] rounded p-md flex flex-col gap-md relative">
          <div className="absolute top-0 right-0 p-xs bg-[#334155] text-[#0f172a] font-label-caps text-label-caps px-sm rounded-bl">FORM: VISITOR_ACCOUNT</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md items-end pt-sm">
            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-[#c3c6d7]">USERNAME</label>
              <input required value={newUser.username} onChange={e=>setNewUser({...newUser, username: e.target.value})} className="bg-[#0f172a] border border-[#334155] text-on-surface font-code-md text-code-md px-sm py-sm rounded focus:outline-none focus:border-[#2563eb] w-full" placeholder="visitor_user" type="text"/>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-[#c3c6d7]">PASSWORD</label>
              <input required value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})} className="bg-[#0f172a] border border-[#334155] text-on-surface font-code-md text-code-md px-sm py-sm rounded focus:outline-none focus:border-[#2563eb] w-full" placeholder="••••••••" type="password"/>
            </div>
            <div className="flex flex-col gap-xs justify-end">
               <button type="submit" className="bg-[#2563eb] text-white font-body-md font-medium px-md py-[6px] rounded flex items-center justify-center gap-xs hover:bg-[#0053db] transition-colors h-full">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                  Create Visitor
              </button>
            </div>
          </div>
        </form>

        {/* Engine Controls Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-[#434655] pb-md mt-lg">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">Dynamic Background Ping Engine</h2>
            <p className="font-code-md text-code-md text-on-surface-variant mt-xs">Identify the time of the auto ping or force a manual ping all.</p>
          </div>
        </div>
        
        <div className="bg-[#1e293b] border border-dashed border-[#434655] rounded p-md flex flex-col gap-md relative">
           <div className="absolute top-0 right-0 p-xs bg-[#434655] text-[#0f172a] font-label-caps text-label-caps px-sm rounded-bl">FORM: ENGINE_CONTROLS</div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-lg items-end pt-sm">
              <div className="flex flex-col gap-md">
                 <div className="font-label-caps text-label-caps text-[#c3c6d7]">ENGINE STATUS</div>
                 <div className="flex items-center gap-4">
                    <button onClick={handleToggleEngine} className={`font-body-md font-bold px-md py-[6px] rounded flex items-center justify-center transition-colors ${engineStatus.enabled ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}>
                        {engineStatus.enabled ? 'Pause Sweep' : 'Enable Sweep'}
                    </button>
                 </div>
              </div>

              <form onSubmit={handleUpdateInterval} className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-[#c3c6d7]">POLLING INTERVAL (SECONDS)</label>
                <div className="flex gap-2">
                  <input required min="1" value={newInterval} onChange={e=>setNewInterval(e.target.value)} className="bg-[#0f172a] border border-[#334155] text-[#e1e2ed] font-code-md text-code-md px-sm py-sm rounded focus:outline-none focus:border-[#2563eb] w-full" type="number"/>
                  <button type="submit" className="bg-[#32343d] hover:bg-[#434655] text-[#e1e2ed] px-3 rounded font-label-caps transition-colors">Apply</button>
                </div>
              </form>

              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-[#c3c6d7]">GLOBAL ACTION</label>
                <button onClick={handlePingAll} className="bg-transparent border border-orange-500 text-orange-400 font-body-md font-bold px-md py-sm rounded flex items-center justify-center gap-xs hover:bg-orange-500 hover:text-white transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>radar</span>
                    PING ALL
                </button>
              </div>
           </div>
        </div>

        {/* Equipment Inventory Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-[#434655] pb-md mt-lg">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">Equipment Inventory Control</h2>
            <p className="font-code-md text-code-md text-on-surface-variant mt-xs">Manage network topologies, assign IPs, and define link parents.</p>
          </div>
          <button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 text-white font-body-md px-md py-sm rounded flex items-center gap-xs transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            Export CSV
          </button>
        </div>

        {/* Add Node Form */}
        <form onSubmit={handleAddDevice} className="bg-[#1e293b] border border-[#334155] rounded p-md flex flex-col gap-md relative">
          <div className="absolute top-0 right-0 p-xs bg-[#434655] text-[#0f172a] font-label-caps text-label-caps px-sm rounded-bl">FORM: ADD_NODE</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-md items-end pt-sm">
            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-[#c3c6d7]">EQUIPMENT NAME</label>
              <input required value={newDevice.name} onChange={e=>setNewDevice({...newDevice, name: e.target.value})} className="bg-[#0f172a] border border-[#334155] text-on-surface font-code-md text-code-md px-sm py-sm rounded focus:outline-none focus:border-[#2563eb] w-full" placeholder="e.g., SW-GASTRO" type="text"/>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-[#c3c6d7]">IP ADDRESS</label>
              <input required value={newDevice.ip_address} onChange={e=>setNewDevice({...newDevice, ip_address: e.target.value})} className="bg-[#0f172a] border border-[#334155] text-on-surface font-code-md text-code-md px-sm py-sm rounded focus:outline-none focus:border-[#2563eb] w-full" placeholder="e.g., 10.121.64.13" type="text"/>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-[#c3c6d7]">ICON TYPE</label>
              <div className="relative">
                <select value={newDevice.icon_type} onChange={e=>setNewDevice({...newDevice, icon_type: e.target.value})} className="bg-[#0f172a] border border-[#334155] text-on-surface font-code-md text-code-md px-sm py-sm rounded focus:outline-none focus:border-[#2563eb] appearance-none w-full cursor-pointer">
                  <option value="switch">Switch</option>
                  <option value="router">Router</option>
                  <option value="firewall">Firewall</option>
                  <option value="server">Server</option>
                  <option value="pc">PC</option>
                </select>
                <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-[#8d90a0] pointer-events-none" style={{ fontSize: '16px' }}>expand_more</span>
              </div>
            </div>
            <div className="flex flex-col gap-xs justify-end">
               <button type="submit" className="bg-[#2563eb] text-white font-body-md font-medium px-md py-[6px] rounded flex items-center justify-center gap-xs hover:bg-[#0053db] transition-colors h-full">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                  Create Node
              </button>
            </div>
          </div>
        </form>

        {/* Devices Table */}
        <div className="bg-[#1e293b] border border-[#334155] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm whitespace-nowrap">
              <thead className="bg-[#334155] border-b border-[#334155]">
                <tr>
                  <th className="font-label-caps text-label-caps text-[#e1e2ed] px-md py-sm">ID</th>
                  <th className="font-label-caps text-label-caps text-[#e1e2ed] px-md py-sm">EQUIPMENT NAME</th>
                  <th className="font-label-caps text-label-caps text-[#e1e2ed] px-md py-sm">IP ADDRESS</th>
                  <th className="font-label-caps text-label-caps text-[#e1e2ed] px-md py-sm">ICON TYPE</th>
                  <th className="font-label-caps text-label-caps text-[#e1e2ed] px-md py-sm text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="font-code-md text-code-md">
                {devices.map((device) => (
                  <tr key={device.id} className="border-b border-[#334155] hover:bg-[#0f172a] transition-colors">
                    <td className="px-md py-[10px] text-[#c3c6d7]">{device.id}</td>
                    <td className="px-md py-[10px] text-primary flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[#8d90a0]" style={{ fontSize: '14px' }}>{device.icon_type === 'router' ? 'router' : 'hub'}</span>
                      {device.name}
                    </td>
                    <td className="px-md py-[10px] text-[#e1e2ed]">{device.ip_address}</td>
                    <td className="px-md py-[10px] text-[#c3c6d7] uppercase text-[11px]">{device.icon_type}</td>
                    <td className="px-md py-[10px] text-right">
                      <div className="flex items-center justify-end gap-sm">
                        <button onClick={() => handleDeleteDevice(device.id)} className="text-red-400 hover:text-red-300 transition-colors text-[12px] uppercase font-bold tracking-wider">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Links Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-[#434655] pb-md mt-lg">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">Network Topology Connections</h2>
            <p className="font-code-md text-code-md text-on-surface-variant mt-xs">Define and manage logical and physical links between devices.</p>
          </div>
        </div>

        {/* Add Link Form */}
        <form onSubmit={handleAddLink} className="bg-[#1e293b] border border-[#334155] rounded p-md flex flex-col gap-md relative">
          <div className="absolute top-0 right-0 p-xs bg-[#334155] text-[#0f172a] font-label-caps text-label-caps px-sm rounded-bl">FORM: CREATE_LINK</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-md items-end pt-sm">
            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-[#c3c6d7]">SOURCE DEVICE</label>
              <div className="relative">
                <select required value={newLink.source_device_id} onChange={e=>setNewLink({...newLink, source_device_id: e.target.value})} className="bg-[#0f172a] border border-[#334155] text-on-surface font-code-md text-code-md px-sm py-sm rounded focus:outline-none focus:border-[#2563eb] appearance-none w-full cursor-pointer">
                  <option value="" disabled>Select device</option>
                  {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-[#8d90a0] pointer-events-none" style={{ fontSize: '16px' }}>expand_more</span>
              </div>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-[#c3c6d7]">TARGET DEVICE</label>
              <div className="relative">
                <select required value={newLink.target_device_id} onChange={e=>setNewLink({...newLink, target_device_id: e.target.value})} className="bg-[#0f172a] border border-[#334155] text-on-surface font-code-md text-code-md px-sm py-sm rounded focus:outline-none focus:border-[#2563eb] appearance-none w-full cursor-pointer">
                  <option value="" disabled>Select device</option>
                  {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-[#8d90a0] pointer-events-none" style={{ fontSize: '16px' }}>expand_more</span>
              </div>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-[#c3c6d7]">LINK TYPE</label>
              <div className="relative">
                <select value={newLink.interface_port} onChange={e=>setNewLink({...newLink, interface_port: e.target.value})} className="bg-[#0f172a] border border-[#334155] text-on-surface font-code-md text-code-md px-sm py-sm rounded focus:outline-none focus:border-[#2563eb] appearance-none w-full cursor-pointer">
                  <option value="backbone">Backbone</option>
                  <option value="fiber">Fiber</option>
                  <option value="copper">Copper</option>
                  <option value="virtual">Virtual</option>
                </select>
                <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-[#8d90a0] pointer-events-none" style={{ fontSize: '16px' }}>expand_more</span>
              </div>
            </div>
            <div className="flex flex-col gap-xs justify-end">
               <button type="submit" className="bg-[#2563eb] text-white font-body-md font-medium px-md py-[6px] rounded flex items-center justify-center gap-xs hover:bg-[#0053db] transition-colors h-full">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>link</span>
                  Create Link
              </button>
            </div>
          </div>
        </form>

        {/* Links Table */}
        <div className="bg-[#1e293b] border border-[#334155] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm whitespace-nowrap">
              <thead className="bg-[#334155] border-b border-[#334155]">
                <tr>
                  <th className="font-label-caps text-label-caps text-[#e1e2ed] px-md py-sm">SOURCE</th>
                  <th className="font-label-caps text-label-caps text-[#e1e2ed] px-md py-sm">TARGET</th>
                  <th className="font-label-caps text-label-caps text-[#e1e2ed] px-md py-sm">LINK TYPE</th>
                  <th className="font-label-caps text-label-caps text-[#e1e2ed] px-md py-sm text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="font-code-md text-code-md">
                {links.map((link) => {
                  const src = devices.find(d => d.id === link.source_device_id)?.name || 'Unknown';
                  const tgt = devices.find(d => d.id === link.target_device_id)?.name || 'Unknown';
                  return (
                    <tr key={link.id} className="border-b border-[#334155] hover:bg-[#0f172a] transition-colors">
                      <td className="px-md py-[10px] text-primary">{src}</td>
                      <td className="px-md py-[10px] text-on-surface">{tgt}</td>
                      <td className="px-md py-[10px] text-on-surface-variant uppercase text-[11px]">{link.interface_port}</td>
                      <td className="px-md py-[10px] text-right">
                        <button onClick={() => handleDeleteLink(link.id)} className="text-red-400 hover:text-red-300 transition-colors text-[12px] uppercase font-bold tracking-wider">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Bottom Utility Bar */}
      <footer className="fixed bottom-0 left-0 w-full h-8 bg-[#1d1f27] border-t border-[#434655] z-50 flex items-center px-md">
        <div className="w-full max-w-[1600px] mx-auto flex justify-between items-center font-code-md text-[11px] text-[#8d90a0]">
          <div className="flex items-center gap-sm">
            <span className="w-2 h-2 rounded-full bg-primary opacity-80 animate-pulse"></span>
            <span>Active database connection: /database/network.sqlite</span>
            <span className="mx-sm">|</span>
            <span>Mode: Read/Write</span>
          </div>
          <div className="hidden sm:block">
            SYS_TIME: <span id="sys-time">{sysTime}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AdminControls;
