import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';

function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login(username, password);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#0f172a] text-on-surface min-h-screen flex flex-col items-center justify-center font-body-md overflow-hidden antialiased">
      {/* Top-left header */}
      <header className="absolute top-0 left-0 w-full p-gutter flex justify-between items-start pointer-events-none z-10">
        <div className="font-code-md text-code-md font-bold tracking-tight text-on-surface">
          NETWATCH // CHR_GHASSANI_LAN
        </div>
        {/* Decorative terminal cursor effect */}
        <div className="font-code-md text-code-md text-on-surface-variant animate-pulse opacity-50">
          _
        </div>
      </header>

      {/* Main Canvas */}
      <main className="relative w-full max-w-md px-gutter z-20">
        {/* Authentication Card */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-lg shadow-none">
          {/* Header */}
          <div className="mb-lg">
            <h1 className="font-title-sm text-title-sm text-on-surface mb-xs">Authentication Required</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Enter credentials to access the network topology monitor.</p>
          </div>

          {/* Form */}
          <form id="authForm" className="space-y-md" onSubmit={handleLogin}>
            {/* Username Input */}
            <div className="space-y-sm">
              <label htmlFor="username" className="font-label-caps text-label-caps text-on-surface uppercase block">Username</label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="e.g., admin_technician"
                  className="w-full bg-[#0f172a] border border-[#334155] text-on-surface rounded font-code-md text-code-md p-sm focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none transition-colors"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
                <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={{ fontSize: '16px' }}>person</span>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-sm">
              <div className="flex justify-between items-baseline">
                <label htmlFor="password" className="font-label-caps text-label-caps text-on-surface uppercase block">Password</label>
                <button
                  type="button"
                  id="togglePassword"
                  onClick={() => setShowPassword(!showPassword)}
                  className="font-code-md text-code-md text-primary hover:text-primary-fixed-dim transition-colors cursor-pointer bg-transparent border-none p-0 outline-none focus:underline"
                >
                  {showPassword ? '[Hide]' : '[Show]'}
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#0f172a] border border-[#334155] text-on-surface rounded font-code-md text-code-md p-sm focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={{ fontSize: '16px' }}>key</span>
              </div>
            </div>

            {/* Primary Button */}
            <div className="pt-sm">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563eb] hover:bg-blue-500 text-white font-title-sm text-title-sm py-[10px] px-md rounded transition-colors flex items-center justify-center gap-sm outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1e293b] focus:ring-[#2563eb] disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Console'}
                {!loading && <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>}
              </button>
            </div>
          </form>

          {/* Status Block */}
          {!error ? (
            <div id="statusBlock" className="mt-lg pt-md border-t border-[#334155] flex items-center gap-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
              <p className="font-code-md text-code-md text-on-surface-variant text-[11px] truncate">System Status: Local Network Agent Connected</p>
            </div>
          ) : (
            <div className="mt-lg pt-md border-t border-[#334155] flex items-center gap-sm">
              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
              <p className="font-code-md text-code-md text-error text-[11px]">{error}</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 w-full p-lg flex justify-center items-center pointer-events-none z-10">
        <p className="font-code-md text-[11px] leading-[16px] font-normal text-[#434655] text-center">
          Developed by Zaikos & Bale
        </p>
      </footer>
    </div>
  );
}

export default Login;
