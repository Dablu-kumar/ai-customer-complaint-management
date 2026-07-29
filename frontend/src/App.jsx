import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Components & Pages
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import NotificationToast from './components/NotificationToast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ComplaintList from './pages/ComplaintList';
import LogComplaint from './pages/LogComplaint';
import AICopilot from './pages/AICopilot';
import ComplaintDetails from './pages/ComplaintDetails';
import Settings from './pages/Settings';

// Protected layout containing Sidebar + Navbar
const ProtectedLayout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar fixed left */}
      <Sidebar />
      
      {/* Content area scrolled right */}
      <div style={{
        marginLeft: '292px', // sidebar width (260px) + spacing (32px)
        flexGrow: 1,
        padding: '16px 32px 32px 0',
        minHeight: '100vh'
      }}>
        <Navbar />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/complaints" element={<ComplaintList />} />
          <Route path="/log" element={<LogComplaint />} />
          <Route path="/copilot" element={<AICopilot />} />
          <Route path="/complaints/:id" element={<ComplaintDetails />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <NotificationToast />
    </BrowserRouter>
  );
}

export default App;
