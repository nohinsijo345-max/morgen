import { useState } from 'react';
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
import AdminBuyerLayout from './admin/buyer/AdminBuyerLayout';

const Admin = ({ onLogout }) => {
  // Always start with module selector for admin
  const [selectedModule, setSelectedModule] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');

  const handleModuleSelect = (moduleId) => {
    setSelectedModule(moduleId);
    setActivePage('dashboard'); // Reset to dashboard when switching modules
    // Store the selected module
    sessionStorage.setItem('selectedAdminModule', moduleId);
  };

  const handleBackToModules = () => {
    setSelectedModule(null); // This will show the module selector
    setActivePage('dashboard');
    // Clear stored module selection
    sessionStorage.removeItem('selectedAdminModule');
  };

  const handleLogout = () => {
    // Clear admin session storage
    sessionStorage.removeItem('selectedAdminModule');
    // Call parent logout
    onLogout();
  };

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
      <AdminBuyerLayout 
        currentPage="dashboard"
        onLogout={handleLogout}
        onBack={handleBackToModules}
      >
        <AdminBuyerDashboard />
      </AdminBuyerLayout>
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
