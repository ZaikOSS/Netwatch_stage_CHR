import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Login from './components/Login';
import NetworkMap from './components/NetworkMap';
import AdminControls from './components/AdminControls';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <NetworkMap /> : <Login />} />
        <Route 
          path="/admin" 
          element={user && user.role === 'admin' ? <AdminControls /> : <Navigate to="/" replace />} 
        />
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
