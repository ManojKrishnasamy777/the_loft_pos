import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { POSProvider } from './contexts/POSContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Navbar } from './components/Layout/Navbar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { POSInterface } from './components/POS/POSInterface';
import { ReportsPage } from './components/Reports/ReportsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <LoginForm />;
  }

  return (
    <POSProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<POSInterface />} />
          <Route path="/orders" element={<div className="p-6">Orders Page - Coming Soon</div>} />
          <Route path="/menu" element={<div className="p-6">Menu Management - Coming Soon</div>} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<div className="p-6">Settings - Coming Soon</div>} />
        </Routes>
      </div>
    </POSProvider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProtectedRoute>
          <AppContent />
        </ProtectedRoute>
      </AuthProvider>
    </Router>
  );
}

export default App;