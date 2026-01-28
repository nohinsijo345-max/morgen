import { useState, useEffect, useCallback } from 'react';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import UserManagement from './admin/UserManagement';
import ImageSettings from './admin/ImageSettings';
import MessagesManagement from './admin/MessagesManagement';
import ProfileRequests from './admin/ProfileRequests';
import TransportManagement from './admin/TransportManagement';
import CustomerSupportManagement from './admin/CustomerSupportManagement';
import AdminModuleSelector from './admin/AdminModuleSelector';
import DriverAdmin from './admin/driver/DriverAdmin';
import AdminBuyerDashboard from './admin/buyer/AdminBuyerDashboard';
import GovernmentAdmin from './admin/government/GovernmentAdmin';

const Admin = ({ onLogout }) => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Load stored module on component mount
  useEffect(() => {
    const storedModule = sessionStorage.getItem('selectedAdminModule');
    
    if (storedModule && storedModule !== 'null' && storedModule !== '') {
      setSelectedModule(storedModule);
    }
    
    setIsLoading(false);
  }, []);

  const handleModuleSelect = useCallback((moduleId) => {
    setSelectedModule(moduleId);
    setActivePage('dashboard');
    sessionStorage.setItem('selectedAdminModule', moduleId);
  }, []);

  const handleBackToModules = useCallback(() => {
    setSelectedModule(null);
    setActivePage('dashboard');
    sessionStorage.removeItem('selectedAdminModule');
  }, []);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('selectedAdminModule');
    onLogout();
  }, [onLogout]);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement />;
      case 'images':
        return <ImageSettings />;
      case 'messages':
        return <MessagesManagement />;
      case 'profile-requests':
        return <ProfileRequests />;
      case 'transport':
        return <TransportManagement />;
      case 'customer-support':
        return <CustomerSupportManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  // Show loading while checking for stored module
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  // Show module selector if no module is selected
  if (!selectedModule) {
    return <AdminModuleSelector onModuleSelect={handleModuleSelect} />;
  }

  // Show Driver Admin module
  if (selectedModule === 'driver') {
    return (
      <DriverAdmin 
        onLogout={handleLogout} 
        onBack={handleBackToModules}
      />
    );
  }

  // Show Buyer Admin module
  if (selectedModule === 'buyer') {
    return (
      <AdminBuyerDashboard 
        onLogout={handleLogout}
        onBack={handleBackToModules}
      />
    );
  }

  // Show Government Admin module
  if (selectedModule === 'government') {
    return (
      <GovernmentAdmin 
        onLogout={handleLogout}
        onBack={handleBackToModules}
      />
    );
  }

  // Show Farmer Admin module (current admin panel)
  if (selectedModule === 'farmer') {
    return (
      <AdminLayout
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout}
        onBack={handleBackToModules}
      >
        {renderPage()}
      </AdminLayout>
    );
  }

  // Fallback to module selector
  return <AdminModuleSelector onModuleSelect={handleModuleSelect} />;
};

export default Admin;
