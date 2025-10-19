import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import CreatePass from './components/CreatePass';
import PassHistory from './components/PassHistory';
import BlockchainExplorer from './components/BlockchainExplorer';
import MempoolView from './components/MempoolView';
import RequestApproval from './components/RequestApproval';
import About from './components/About';
import Contact from './components/Contact';
import PrivacyPolicy from './components/PrivacyPolicy';
import Help from './components/Help';

function App() {
  const { isAuthenticated, user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {isAuthenticated && <Navbar />}
      <div className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
          } />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/help" element={<Help />} />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {isAdmin() ? <AdminDashboard /> : <Dashboard />}
            </ProtectedRoute>
          } />

          {/* User Routes */}
          <Route path="/user/create-pass" element={
            <ProtectedRoute requireRole="user">
              <CreatePass />
            </ProtectedRoute>
          } />
          <Route path="/user/history" element={
            <ProtectedRoute requireRole="user">
              <PassHistory />
            </ProtectedRoute>
          } />
          <Route path="/user/qr" element={
            <ProtectedRoute requireRole="user">
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/user/mine" element={
            <ProtectedRoute requireRole="user">
              <MempoolView />
            </ProtectedRoute>
          } />

          {/* Admin Routes - Load admin components directly */}
          <Route path="/admin" element={
            <ProtectedRoute requireRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/approvals" element={
            <ProtectedRoute requireRole="admin">
              <RequestApproval />
            </ProtectedRoute>
          } />
          <Route path="/admin/mempool" element={
            <ProtectedRoute requireRole="admin">
              <MempoolView />
            </ProtectedRoute>
          } />
          <Route path="/admin/blocks" element={
            <ProtectedRoute requireRole="admin">
              <BlockchainExplorer />
            </ProtectedRoute>
          } />

          {/* Common Routes */}
          <Route path="/explorer" element={
            <ProtectedRoute>
              <BlockchainExplorer />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
      {isAuthenticated && <Footer />}
    </div>
  );
}

export default App;
