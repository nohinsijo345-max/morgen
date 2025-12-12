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

const Admin = ({ onLogout }) => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');

  const handleModuleSelect = (moduleId) => {
    setSelectedModule(moduleId);
    setActivePage('dashboard'); // Reset to dashboard when switching modules
  };

  const handleBackToModules = () => {
    setSelectedModule(null);
    setActivePage('dashboard');
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
        onLogout={onLogout} 
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
        onLogout={onLogout}
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
