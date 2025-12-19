import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/neumorphic-theme.css";
import { ThemeProvider } from "./context/ThemeContext";
import { AdminThemeProvider } from "./context/AdminThemeContext";
import { SessionManager, startSessionMonitoring } from "./utils/sessionManager";
import ProtectedRoute from "./components/ProtectedRoute";
import SessionExpiryWarning from "./components/SessionExpiryWarning";
import ModuleSelector from "./pages/ModuleSelector";
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
    // Load sessions using SessionManager (with expiry check)
    console.log('🔧 Loading sessions on app start...');
    const farmer = SessionManager.getUserSession('farmer');
    const admin = SessionManager.getUserSession('admin');
    const driver = SessionManager.getUserSession('driver');
    
    console.log('🔧 Loaded sessions:', { farmer: !!farmer, admin: !!admin, driver: !!driver });
    if (farmer) console.log('🔧 Farmer session data:', farmer);
    
    setFarmerUser(farmer);
    setAdminUser(admin);
    setDriverUser(driver);
    setLoading(false);

    // Start session monitoring for auto-logout
    const stopMonitoring = startSessionMonitoring((userType) => {
      console.log(`${userType} session expired - auto logout`);
      if (userType === 'farmer') setFarmerUser(null);
      if (userType === 'admin') setAdminUser(null);
      if (userType === 'driver') setDriverUser(null);
    });

    return stopMonitoring;
  }, []);

  const handleFarmerLogin = (userData) => {
    console.log('🔧 Setting farmer session with data:', userData);
    setFarmerUser(userData);
    SessionManager.setUserSession('farmer', userData);
  };

  const handleAdminLogin = (userData) => {
    setAdminUser(userData);
    SessionManager.setUserSession('admin', userData);
  };

  const handleDriverLogin = (userData) => {
    setDriverUser(userData);
    SessionManager.setUserSession('driver', userData);
  };

  const handleFarmerLogout = () => {
    setFarmerUser(null);
    SessionManager.clearUserSession('farmer');
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    SessionManager.clearUserSession('admin');
  };

  const handleDriverLogout = () => {
    setDriverUser(null);
    SessionManager.clearUserSession('driver');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        {/* Session Expiry Warnings */}
        {farmerUser && (
          <SessionExpiryWarning 
            userType="farmer" 
            onLogout={handleFarmerLogout}
            onExtend={() => console.log('Farmer session extended')}
          />
        )}
        {adminUser && (
          <SessionExpiryWarning 
            userType="admin" 
            onLogout={handleAdminLogout}
            onExtend={() => console.log('Admin session extended')}
          />
        )}
        {driverUser && (
          <SessionExpiryWarning 
            userType="driver" 
            onLogout={handleDriverLogout}
            onExtend={() => console.log('Driver session extended')}
          />
        )}

        <Routes>
        {/* Module Selector - Always accessible */}
        <Route 
          path="/" 
          element={<ModuleSelector />} 
        />
        
        {/* Login Routes - Redirect to dashboard if already logged in */}
        <Route 
          path="/login" 
          element={
            <ProtectedRoute userType="farmer" requireAuth={false}>
              <Login onLogin={handleFarmerLogin} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-login" 
          element={
            <ProtectedRoute userType="admin" requireAuth={false}>
              <AdminLogin onLogin={handleAdminLogin} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/driver-login" 
          element={
            <ProtectedRoute userType="driver" requireAuth={false}>
              <DriverLogin onLogin={handleDriverLogin} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <ProtectedRoute userType="farmer" requireAuth={false}>
              <ForgotPassword />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected Farmer Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute userType="farmer">
              <FarmerDashboard user={farmerUser} onLogout={handleFarmerLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/updates" 
          element={
            <ProtectedRoute userType="farmer">
              <Updates />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/account" 
          element={
            <ProtectedRoute userType="farmer">
              <AccountCentre />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/weather" 
          element={
            <ProtectedRoute userType="farmer">
              <Weather />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/leaderboard" 
          element={
            <ProtectedRoute userType="farmer">
              <Leaderboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/harvest-countdown" 
          element={
            <ProtectedRoute userType="farmer">
              <HarvestCountdown />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/price-forecast" 
          element={
            <ProtectedRoute userType="farmer">
              <PriceForecast />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/local-transport" 
          element={
            <ProtectedRoute userType="farmer">
              <LocalTransport />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/local-transport/vehicle/:vehicleId" 
          element={
            <ProtectedRoute userType="farmer">
              <VehicleDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/local-transport/booking/:vehicleId" 
          element={
            <ProtectedRoute userType="farmer">
              <TransportBooking />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/order-tracking" 
          element={
            <ProtectedRoute userType="farmer">
              <OrderTracking />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/order-history" 
          element={
            <ProtectedRoute userType="farmer">
              <OrderHistory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customer-support" 
          element={
            <ProtectedRoute userType="farmer">
              <CustomerSupport />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ai-doctor" 
          element={
            <ProtectedRoute userType="farmer">
              <AIPlantDoctor />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute userType="admin">
              <AdminThemeProvider>
                <Admin onLogout={handleAdminLogout} />
              </AdminThemeProvider>
            </ProtectedRoute>
          } 
        />
        
        {/* Protected Driver Routes */}
        <Route 
          path="/driver/dashboard" 
          element={
            <ProtectedRoute userType="driver">
              <DriverDashboard user={driverUser} onLogout={handleDriverLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/driver/orders" 
          element={
            <ProtectedRoute userType="driver">
              <DriverOrderDetails user={driverUser} onBack={() => window.history.back()} />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all route - redirect any unknown URL to module selector */}
        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
