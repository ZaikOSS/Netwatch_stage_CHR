import React, { useState, useEffect } from 'react';
import api from '../api';
import Navbar from './Navbar';

function PingLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [engineStatus, setEngineStatus] = useState(null);
  const [sysTime, setSysTime] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchEngineStatus();
    
    const timeInterval = setInterval(() => {
      const now = new Date();
      setSysTime(now.toISOString().split('T')[1].split('.')[0] + ' UTC');
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`/logs?page=${page}&limit=20`);
      setLogs(response.data.logs || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch logs', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEngineStatus = async () => {
    try {
      const engRes = await api.get('/engine/status');
      setEngineStatus(engRes.data);
    } catch (err) {
      console.error('Failed to fetch engine status', err);
    }
  };

  const handleExportCSV = async () => {
    try {
      // Fetch ALL logs for export
      const response = await api.get('/logs?export=true');
      const allLogs = response.data.logs || [];
      
      const csvRows = [];
      csvRows.push(['Timestamp', 'Device Name', 'IP Address', 'Event'].join(','));
      
      allLogs.forEach(log => {
        const event = log.status === 'up' ? 'Came Online' : 'Went Offline';
        csvRows.push([
          `"${new Date(log.timestamp).toLocaleString()}"`, 
          `"${log.device_name}"`, 
          log.ip_address, 
          event
        ].join(','));
      });
      
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'ping_logs.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export CSV', error);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);
    
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="bg-[#0f172a] text-[#e1e2ed] font-body-md min-h-screen flex flex-col antialiased">
      <Navbar engineStatus={engineStatus} fetchData={() => fetchLogs(currentPage)} />

      <main className="flex-1 w-full max-w-6xl mx-auto p-lg flex flex-col gap-lg overflow-y-auto pb-24">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-[#434655] pb-md mt-sm">
          <div>
            <h1 className="font-headline-md text-headline-md text-primary">Historical Ping Logs</h1>
            <p className="font-code-md text-code-md text-on-surface-variant mt-xs">Track precisely when devices go offline and come back online.</p>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => fetchLogs(currentPage)} className="bg-[#334155] hover:bg-[#475569] text-white px-3 py-1.5 rounded transition-colors flex items-center gap-2 font-label-caps text-label-caps border border-[#334155]">
              <span className="material-symbols-outlined text-[18px]">refresh</span> Refresh
            </button>
            <button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 text-white font-body-md px-md py-[6px] rounded flex items-center gap-xs transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
              Export Full CSV
            </button>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-[#334155] rounded overflow-hidden shadow-lg">
          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="p-8 text-center text-on-surface-variant animate-pulse font-code-md">Loading logs...</div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant font-code-md">No historical logs found. The engine is tracking...</div>
            ) : (
              <table className="w-full text-left font-body-sm text-body-sm whitespace-nowrap">
                <thead className="bg-[#334155] border-b border-[#334155]">
                  <tr>
                    <th className="font-label-caps text-label-caps text-[#e1e2ed] px-md py-sm">Timestamp</th>
                    <th className="font-label-caps text-label-caps text-[#e1e2ed] px-md py-sm">Device Name</th>
                    <th className="font-label-caps text-label-caps text-[#e1e2ed] px-md py-sm">IP Address</th>
                    <th className="font-label-caps text-label-caps text-[#e1e2ed] px-md py-sm">Event</th>
                  </tr>
                </thead>
                <tbody className="font-code-md text-code-md">
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-[#334155] hover:bg-[#0f172a] transition-colors">
                      <td className="px-md py-[10px] text-[#c3c6d7] font-mono text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-md py-[10px] text-primary flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[#8d90a0]" style={{ fontSize: '14px' }}>{log.icon_type}</span>
                        {log.device_name}
                      </td>
                      <td className="px-md py-[10px] text-blue-400 font-mono text-sm">{log.ip_address}</td>
                      <td className="px-md py-[10px]">
                        {log.status === 'up' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Came Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Went Offline
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-[#0f172a] border-t border-[#334155] p-4 flex justify-between items-center text-sm">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-[#1e293b] text-[#e1e2ed] border border-[#334155] rounded hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {getPageNumbers().map((num, i) => (
                  <button
                    key={i}
                    onClick={() => num !== '...' && setCurrentPage(num)}
                    disabled={num === '...'}
                    className={`px-3 py-1 rounded border transition-colors ${
                      num === currentPage 
                        ? 'bg-primary border-primary text-white font-bold' 
                        : num === '...' 
                          ? 'bg-transparent border-transparent text-on-surface-variant cursor-default'
                          : 'bg-[#1e293b] border-[#334155] text-on-surface hover:bg-[#334155]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-[#1e293b] text-[#e1e2ed] border border-[#334155] rounded hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
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

export default PingLogs;
