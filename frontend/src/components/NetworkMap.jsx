import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../AuthContext';
import api from '../api';
import Navbar from './Navbar';

// Helper to assign deterministic pseudo-random coordinates based on device ID
const getCoordinates = (id, isCore) => {
  if (isCore) return { x: 50, y: 50 }; // Center
  const positions = [
    { x: 30, y: 25 }, { x: 70, y: 30 }, { x: 65, y: 75 },
    { x: 25, y: 70 }, { x: 80, y: 50 }, { x: 20, y: 45 },
    { x: 40, y: 20 }, { x: 60, y: 80 }
  ];
  return positions[id % positions.length];
};

const getIcon = (type) => {
  switch(type) {
    case 'switch': return 'hub';
    case 'router': return 'router';
    case 'firewall': return 'security';
    case 'server': return 'dns';
    case 'pc': return 'computer';
    default: return 'hub';
  }
};

function NetworkMap() {
  const { user, logout } = useContext(AuthContext);
  const [devices, setDevices] = useState([]);
  const [links, setLinks] = useState([]);
  const [engineStatus, setEngineStatus] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Viewport state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Node dragging state
  const [nodePositions, setNodePositions] = useState({});
  const [draggingNode, setDraggingNode] = useState(null);
  const [hasMovedNode, setHasMovedNode] = useState(false);
  const canvasRef = useRef(null);

  const fetchData = async () => {
    try {
      const devRes = await api.get('/devices');
      setDevices(devRes.data);
      
      const linkRes = await api.get('/links');
      setLinks(linkRes.data);

      const engRes = await api.get('/engine/status');
      setEngineStatus(engRes.data);
    } catch (err) {
      console.error('Error fetching topology data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto refresh every 5 seconds since the engine sweeps every 10s default
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleManualPing = async (id) => {
    try {
      await api.post(`/engine/ping/${id}`);
      fetchData(); // Refresh immediately after ping
    } catch (err) {
      console.error('Manual ping failed:', err);
    }
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.node-element') || e.target.closest('.controls-block')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPos.x, y: e.clientY - panPos.y });
  };
  
  const handleMouseMove = (e) => {
    if (draggingNode && canvasRef.current) {
      setHasMovedNode(true);
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left - panPos.x) / zoomLevel / rect.width) * 100;
      const y = ((e.clientY - rect.top - panPos.y) / zoomLevel / rect.height) * 100;
      setNodePositions(prev => ({ ...prev, [draggingNode]: { x, y } }));
    } else if (isDragging) {
      setPanPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };
  
  const handleMouseUp = async () => {
    if (draggingNode) {
      const pos = nodePositions[draggingNode];
      if (pos) {
        try {
          // Fire and forget save to DB
          api.put(`/devices/${draggingNode}/position`, pos).catch(e => console.error(e));
        } catch(err) {
          console.error("Failed to save node position", err);
        }
      }
    }
    setIsDragging(false);
    // Note: Do not reset draggingNode to null here immediately, 
    // because onClick fires after onMouseUp. We will reset it in a setTimeout or just let the global click handler clear it, but onClick is on the node itself.
    // Actually, setting draggingNode=null is fine because hasMovedNode protects the onClick.
    setDraggingNode(null);
  };
  const handleMouseLeave = () => {
    setIsDragging(false);
    setDraggingNode(null);
  };

  const handleNodeMouseDown = (e, id) => {
    e.stopPropagation();
    setHasMovedNode(false);
    setDraggingNode(id);
  };

  const handleNodeClick = (e, id) => {
    e.stopPropagation();
    if (hasMovedNode) return; // Prevent opening stats if it was a drag
    setSelectedDevice(id === selectedDevice ? null : id);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel(z => Math.min(z + 0.1, 3));
    } else {
      setZoomLevel(z => Math.max(z - 0.1, 0.5));
    }
  };

  const zoomIn = () => setZoomLevel(z => Math.min(z + 0.2, 3));
  const zoomOut = () => setZoomLevel(z => Math.max(z - 0.2, 0.5));
  const resetZoom = () => { setZoomLevel(1); setPanPos({ x: 0, y: 0 }); };

  const filteredDevices = devices.filter(d => 
    d.name.toLowerCase().includes(filterText.toLowerCase()) || 
    d.ip_address.includes(filterText)
  );

  const totalDevices = devices.length;
  const onlineDevices = devices.filter(d => d.status === 'up').length;
  const criticalDevices = devices.filter(d => d.status === 'down').length;

  return (
    <div className="h-screen flex flex-col font-body-md overflow-hidden bg-[#0f172a] text-on-surface">
      <Navbar engineStatus={engineStatus} fetchData={fetchData} />

      {/* Metrics Header Slim */}
      <div className="w-full flex justify-center gap-6 px-6 py-2 border-b border-[#334155] bg-[#0f172a]/95 backdrop-blur-md z-40 shadow-sm relative">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-on-surface-variant text-[11px] font-label-caps tracking-widest">TOTAL EQUIPMENT:</span>
          <span className="text-on-surface font-code-md text-[13px]">{totalDevices}</span>
        </div>
        <div className="w-px h-4 bg-[#334155] self-center"></div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
          <span className="text-on-surface-variant text-[11px] font-label-caps tracking-widest">OPERATIONAL:</span>
          <span className="text-green-400 font-code-md text-[13px]">{onlineDevices}</span>
        </div>
        <div className="w-px h-4 bg-[#334155] self-center"></div>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${criticalDevices > 0 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-ping' : 'bg-[#334155]'}`}></div>
          <span className="text-on-surface-variant text-[11px] font-label-caps tracking-widest">CRITICAL ALERTS:</span>
          <span className={`${criticalDevices > 0 ? 'text-red-500 font-bold' : 'text-on-surface-variant'} font-code-md text-[13px]`}>{criticalDevices}</span>
        </div>
      </div>

      {/* Main Layout Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {showSidebar && (
          <aside className="w-[300px] bg-[#1e293b] border-r border-[#334155] flex flex-col flex-shrink-0 transition-all duration-300">
            <div className="p-3 border-b border-[#334155] bg-[#0f172a] font-label-caps text-label-caps flex justify-between items-center text-primary">
              <span className="tracking-wider">DEVICE DIRECTORY</span>
              <button onClick={() => setShowSidebar(false)} className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_left</span>
              </button>
            </div>
            <div className="p-2 border-b border-[#334155] bg-[#1e293b]">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2 top-1.5 text-on-surface-variant text-[16px]">search</span>
                <input 
                  className="w-full bg-[#0f172a] border border-[#334155] text-on-surface font-code-md text-code-md py-1 pl-8 pr-2 focus:border-[#2563eb] focus:outline-none placeholder-on-surface-variant rounded-sm" 
                  placeholder="Filter by IP or Name..." 
                  type="text"
                  value={filterText}
                  onChange={e => setFilterText(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ul className="font-code-md text-code-md divide-y divide-[#334155]">
                {filteredDevices.map(device => (
                  <li key={device.id} onClick={() => setSelectedDevice(device.id === selectedDevice ? null : device.id)} className={`p-3 cursor-pointer flex justify-between items-center group ${device.status === 'down' ? 'bg-red-900/20 border-l-2 border-red-500' : 'hover:bg-[#0f172a] border-l-2 border-transparent hover:border-primary'}`}>
                    <div>
                      <div className={device.status === 'down' ? 'text-red-400 font-bold' : 'text-on-surface group-hover:text-primary transition-colors'}>{device.name}</div>
                      <div className={device.status === 'down' ? 'text-red-400/70 text-[11px] mt-1' : 'text-on-surface-variant text-[11px] mt-1'}>{device.ip_address}</div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${device.status === 'down' ? 'bg-red-500 animate-blink' : 'bg-green-500'}`}></div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}

        {/* Main Canvas */}
        <main 
          ref={canvasRef}
          className={`relative overflow-hidden flex-1 ${isDragging ? 'cursor-grabbing' : (draggingNode ? 'cursor-move' : 'cursor-grab')}`} 
          style={{ backgroundSize: '40px 40px', backgroundImage: 'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
        >
          {/* Sidebar Toggle Button (when hidden) */}
          {!showSidebar && (
            <button 
              onClick={() => setShowSidebar(true)} 
              className="absolute top-4 left-4 z-30 bg-[#1e293b] p-2 hover:bg-[#32343d] text-primary transition-colors border border-[#334155] rounded-md shadow-lg flex items-center justify-center controls-block"
              title="Open Device Directory"
            >
              <span className="material-symbols-outlined text-[20px]">keyboard_double_arrow_right</span>
            </button>
          )}

          {/* Controls */}
          <div className="absolute top-4 right-4 flex gap-xs z-20 controls-block">
            <button onClick={toggleFullscreen} className="bg-[#1e293b] p-2 hover:bg-[#32343d] text-on-surface-variant transition-colors border border-[#334155] mr-2 rounded">
              <span className="material-symbols-outlined text-[18px]">fullscreen</span>
            </button>
            <button onClick={zoomIn} className="bg-[#1e293b] p-2 hover:bg-[#32343d] text-on-surface-variant transition-colors border border-[#334155]">
              <span className="material-symbols-outlined text-[18px]">zoom_in</span>
            </button>
            <button onClick={zoomOut} className="bg-[#1e293b] p-2 hover:bg-[#32343d] text-on-surface-variant transition-colors border border-[#334155]">
              <span className="material-symbols-outlined text-[18px]">zoom_out</span>
            </button>
            <button onClick={resetZoom} className="bg-[#1e293b] p-2 hover:bg-[#32343d] text-on-surface-variant transition-colors border border-[#334155]">
              <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
            </button>
          </div>

          <div style={{ transform: `translate(${panPos.x}px, ${panPos.y}px) scale(${zoomLevel})`, transformOrigin: '0 0', width: '100%', height: '100%' }} className="absolute inset-0 pointer-events-auto">
            {/* Topology Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1, overflow: 'visible' }}>
            {links.map(link => {
              const srcDev = devices.find(d => d.id === link.source_device_id);
              const tgtDev = devices.find(d => d.id === link.target_device_id);
              if (!srcDev || !tgtDev) return null;
              
              const srcPos = nodePositions[srcDev.id] || (srcDev.pos_x ? {x: srcDev.pos_x, y: srcDev.pos_y} : getCoordinates(srcDev.id, srcDev.icon_type === 'router'));
              const tgtPos = nodePositions[tgtDev.id] || (tgtDev.pos_x ? {x: tgtDev.pos_x, y: tgtDev.pos_y} : getCoordinates(tgtDev.id, tgtDev.icon_type === 'router'));
              const hasCritical = srcDev.status === 'down' || tgtDev.status === 'down';
              
              const midX = (srcPos.x + tgtPos.x) / 2;
              const midY = (srcPos.y + tgtPos.y) / 2;
              
              return (
                <g key={link.id}>
                  <line 
                    x1={`${srcPos.x}%`} 
                    y1={`${srcPos.y}%`} 
                    x2={`${tgtPos.x}%`} 
                    y2={`${tgtPos.y}%`} 
                    style={{
                      stroke: hasCritical ? '#ef4444' : '#22c55e',
                      strokeWidth: 2,
                      strokeDasharray: hasCritical ? '5, 5' : 'none',
                      animation: hasCritical ? 'dash 1s linear infinite' : 'none'
                    }}
                  />
                  {link.interface_port && (
                    <text 
                      x={`${midX}%`} 
                      y={`${midY}%`} 
                      fill={hasCritical ? '#fca5a5' : '#86efac'} 
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      dy="-5"
                      style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.8))' }}
                    >
                      {link.interface_port.toUpperCase()}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Topology Nodes */}
          <div className="absolute inset-0 w-full h-full" style={{ zIndex: 2 }}>
            {devices.map(device => {
              const isCore = device.icon_type === 'router';
              const pos = nodePositions[device.id] || (device.pos_x ? {x: device.pos_x, y: device.pos_y} : getCoordinates(device.id, isCore));
              const isDown = device.status === 'down';
              const isSelected = selectedDevice === device.id;

              return (
                <div 
                  key={device.id} 
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-transform node-element ${draggingNode === device.id ? 'scale-110 z-50' : 'hover:-translate-y-[calc(50%+2px)]'}`} 
                  style={{ top: `${pos.y}%`, left: `${pos.x}%` }} 
                  onClick={(e) => handleNodeClick(e, device.id)}
                  onMouseDown={(e) => handleNodeMouseDown(e, device.id)}
                >
                  
                  {isDown ? (
                    <div className="bg-red-600 p-2 border-2 border-red-400 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse relative z-10">
                      <span className="material-symbols-outlined text-[24px] text-white">warning</span>
                    </div>
                  ) : (
                    <div className={`bg-[#1e293b] p-2 border ${isCore ? 'border-2 border-primary shadow-lg' : 'border-green-500'} flex items-center justify-center`}>
                      <span className={`material-symbols-outlined text-[24px] ${isCore ? 'text-primary' : 'text-green-400'}`}>{getIcon(device.icon_type)}</span>
                    </div>
                  )}

                  <div className={`mt-2 ${isDown ? 'bg-red-950 border-red-500' : 'bg-[#0f172a] border-[#334155]'} border px-2 py-1 text-center z-10`}>
                    <div className={`font-label-caps text-label-caps ${isDown ? 'text-red-100' : (isCore ? 'text-primary' : 'text-on-surface')}`}>{device.name}</div>
                    <div className={`font-code-md text-[10px] ${isDown ? 'text-red-300' : 'text-on-surface-variant'}`}>{device.ip_address}</div>
                  </div>

                  {/* Diagnostic Tooltip */}
                  {isSelected && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-64 bg-[#1e293b] border border-[#334155] shadow-xl z-50">
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#334155]"></div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-[1px] w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-[#1e293b]"></div>
                      <div className={`${isDown ? 'bg-red-900/30' : 'bg-[#32343d]'} border-b border-[#334155] px-3 py-2 flex items-center gap-2`}>
                        <span className={`material-symbols-outlined text-[16px] ${isDown ? 'text-red-400' : 'text-primary'}`}>troubleshoot</span>
                        <span className="font-label-caps text-label-caps text-on-surface">DEVICE DIAGNOSTICS</span>
                      </div>
                      <div className="p-3 font-code-md text-[11px] leading-relaxed text-on-surface-variant flex flex-col gap-1">
                        <div className="flex justify-between border-b border-[#334155]/50 pb-1">
                          <span>IP:</span> <span className="text-on-surface">{device.ip_address}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#334155]/50 py-1">
                          <span>Type:</span> <span className="text-on-surface">{device.icon_type}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#334155]/50 py-1">
                          <span>Last Seen:</span> <span className={isDown ? 'text-red-400' : 'text-green-400'}>{new Date(device.last_seen).toLocaleTimeString() || 'Never'}</span>
                        </div>
                        <div className="flex justify-between pt-1 font-bold">
                          <span>Status:</span> <span className={isDown ? 'text-red-500' : 'text-green-500'}>{isDown ? 'DOWN' : 'ONLINE'}</span>
                        </div>
                      </div>
                      <div className="p-2 border-t border-[#334155] bg-[#0f172a]">
                        <button onClick={(e) => { e.stopPropagation(); handleManualPing(device.id); }} className="w-full bg-[#2563eb] hover:bg-blue-500 text-white font-label-caps text-[10px] py-1.5 transition-colors border border-blue-400 uppercase">
                          Force Manual Ping Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default NetworkMap;
