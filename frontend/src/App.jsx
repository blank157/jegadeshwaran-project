import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateMessagePage from './pages/CreateMessagePage';
import MessageInquiryPage from './pages/MessageInquiryPage';
import MessageDetailPage from './pages/MessageDetailPage';
import Layout from './components/Layout';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Clear any persisted tokens on initial app load so the Login page is always prompted first
    localStorage.removeItem('swift_token');
    localStorage.removeItem('swift_user');
    sessionStorage.removeItem('swift_token');
    sessionStorage.removeItem('swift_user');
  }, []);

  const handleLogin = (userData, token) => {
    sessionStorage.setItem('swift_token', token);
    sessionStorage.setItem('swift_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('swift_token');
    sessionStorage.removeItem('swift_user');
    localStorage.removeItem('swift_token');
    localStorage.removeItem('swift_user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#141414',
            color: '#fff',
            borderRadius: '999px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 500,
          },
          success: { style: { background: '#141414', color: '#fff' } },
          error: { style: { background: '#D94838', color: '#fff' } },
        }}
      />
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />}
        />
        <Route
          path="/"
          element={user ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="create" element={<CreateMessagePage />} />
          <Route path="inquiry" element={<MessageInquiryPage />} />
          <Route path="inquiry/:id" element={<MessageDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
