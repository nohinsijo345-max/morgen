import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/neumorphic-theme.css";
import { ThemeProvider } from "./context/ThemeContext";
import { AdminThemeProvider } from "./context/AdminThemeContext";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import FarmerDashboard from "./pages/FarmerDashboard";
import Admin from "./pages/Admin";
import Updates from "./pages/Updates";
import AccountCentre from "./pages/AccountCentre";
import Weather from "./pages/Weather";
import Leaderboard from "./pages/Leaderboard";
import HarvestCountdown from "./pages/farmer/HarvestCountdown";
import PriceForecast from "./pages/farmer/PriceForecast";
import LocalTransport from "./pages/farmer/LocalTransport";
import VehicleDetails from "./pages/farmer/VehicleDetails";
import TransportBooking from "./pages/farmer/TransportBooking";
import OrderTracking from "./pages/farmer/OrderTracking";
import OrderHistory from "./pages/farmer/OrderHistory";
import CustomerSupport from "./pages/farmer/CustomerSupport";
import AIPlantDoctor from "./pages/farmer/AIPlantDoctor";
import DriverLogin from "./pages/DriverLogin";
import DriverDashboard from "./pages/DriverDashboard";
import DriverOrderDetails from "./pages/DriverOrderDetails";

export default function App() {
  const [farmerUser, setFarmerUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [driverUser, setDriverUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load farmer, admin, and driver sessions separately
    const savedFarmer = localStorage.getItem('farmerUser');
    const savedAdmin = localStorage.getItem('adminUser');
    const savedDriver = localStorage.getItem('driverUser');
    
    if (savedFarmer) {
      setFarmerUser(JSON.parse(savedFarmer));
    }
    if (savedAdmin) {
      setAdminUser(JSON.parse(savedAdmin));
    }
    if (savedDriver) {
      setDriverUser(JSON.parse(savedDriver));
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

  const handleDriverLogin = (userData) => {
    setDriverUser(userData);
    localStorage.setItem('driverUser', JSON.stringify(userData));
  };

  const handleFarmerLogout = () => {
    setFarmerUser(null);
    localStorage.removeItem('farmerUser');
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('adminUser');
  };

  const handleDriverLogout = () => {
    setDriverUser(null);
    localStorage.removeItem('driverUser');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <ThemeProvider>
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
          path="/weather" 
          element={farmerUser ? <Weather /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/leaderboard" 
          element={farmerUser ? <Leaderboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/harvest-countdown" 
          element={farmerUser ? <HarvestCountdown /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/price-forecast" 
          element={farmerUser ? <PriceForecast /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/local-transport" 
          element={farmerUser ? <LocalTransport /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/local-transport/vehicle/:vehicleId" 
          element={farmerUser ? <VehicleDetails /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/local-transport/booking/:vehicleId" 
          element={farmerUser ? <TransportBooking /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/order-tracking" 
          element={farmerUser ? <OrderTracking /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/order-history" 
          element={farmerUser ? <OrderHistory /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/customer-support" 
          element={farmerUser ? <CustomerSupport /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/ai-doctor" 
          element={farmerUser ? <AIPlantDoctor /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin" 
          element={adminUser ? (
            <AdminThemeProvider>
              <Admin onLogout={handleAdminLogout} />
            </AdminThemeProvider>
          ) : <Navigate to="/admin-login" />} 
        />
        <Route 
          path="/driver-login" 
          element={driverUser ? <Navigate to="/driver-dashboard" /> : <DriverLogin onLogin={handleDriverLogin} />} 
        />
        <Route 
          path="/driver-dashboard" 
          element={driverUser ? <DriverDashboard user={driverUser} onLogout={handleDriverLogout} /> : <Navigate to="/driver-login" />} 
        />
        <Route 
          path="/driver-orders" 
          element={driverUser ? <DriverOrderDetails user={driverUser} onBack={() => window.history.back()} /> : <Navigate to="/driver-login" />} 
        />
        <Route 
          path="/" 
          element={
            farmerUser ? <Navigate to="/dashboard" /> : 
            adminUser ? <Navigate to="/admin" /> : 
            driverUser ? <Navigate to="/driver-dashboard" /> :
            <Navigate to="/login" />
          } 
        />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
