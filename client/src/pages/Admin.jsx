import { useState } from 'react';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import UserManagement from './admin/UserManagement';
import ImageSettings from './admin/ImageSettings';

const Admin = ({ onLogout }) => {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement />;
      case 'images':
        return <ImageSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout
      activePage={activePage}
      onNavigate={setActivePage}
      onLogout={onLogout}
    >
      {renderPage()}
    </AdminLayout>
  );
};

export default Admin;
