import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import FarmerDashboard from "./pages/FarmerDashboard";
import Admin from "./pages/Admin";
import Updates from "./pages/Updates";
import AccountCentre from "./pages/AccountCentre";

export default function App() {
  const [farmerUser, setFarmerUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load both farmer and admin sessions separately
    const savedFarmer = localStorage.getItem('farmerUser');
    const savedAdmin = localStorage.getItem('adminUser');
    
    if (savedFarmer) {
      setFarmerUser(JSON.parse(savedFarmer));
    }
    if (savedAdmin) {
      setAdminUser(JSON.parse(savedAdmin));
    }
    setLoading(false);
  }, []);

  const handleFarmerLogin = (userData) => {
    setFarmerUser(userData);
    localStorage.setItem('farmerUser', JSON.stringify(userData));
  };

  const handleAdminLogin = (userData) => {
    setAdminUser(userData);
    localStorage.setItem('adminUser', JSON.stringify(userData));
  };

  const handleFarmerLogout = () => {
    setFarmerUser(null);
    localStorage.removeItem('farmerUser');
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('adminUser');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={farmerUser ? <Navigate to="/dashboard" /> : <Login onLogin={handleFarmerLogin} />} 
        />
        <Route 
          path="/admin-login" 
          element={adminUser ? <Navigate to="/admin" /> : <AdminLogin onLogin={handleAdminLogin} />} 
        />
        <Route 
          path="/forgot-password" 
          element={farmerUser ? <Navigate to="/dashboard" /> : <ForgotPassword />} 
        />
        <Route 
          path="/dashboard" 
          element={farmerUser ? <FarmerDashboard user={farmerUser} onLogout={handleFarmerLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/updates" 
          element={farmerUser ? <Updates /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/account" 
          element={farmerUser ? <AccountCentre /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin" 
          element={adminUser ? <Admin onLogout={handleAdminLogout} /> : <Navigate to="/admin-login" />} 
        />
        <Route 
          path="/" 
          element={
            farmerUser ? <Navigate to="/dashboard" /> : 
            adminUser ? <Navigate to="/admin" /> : 
            <Navigate to="/login" />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
