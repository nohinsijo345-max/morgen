import { useState } from 'react';
import GovernmentAdminLayout from './GovernmentAdminLayout';
import GovernmentAdminDashboard from './GovernmentAdminDashboard';

const GovernmentAdmin = ({ onLogout, onBack }) => {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <GovernmentAdminDashboard onNavigate={setActivePage} />;
      case 'subsidies':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Subsidy Management</h2>
            <p className="text-gray-600">Approve farmer subsidy requests</p>
          </div>
        );
      case 'schemes':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Government Schemes</h2>
            <p className="text-gray-600">Manage agricultural schemes and policies</p>
          </div>
        );
      case 'reports':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Reports & Analytics</h2>
            <p className="text-gray-600">View government reports and statistics</p>
          </div>
        );
      default:
        return <GovernmentAdminDashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <GovernmentAdminLayout
      activePage={activePage}
      onNavigate={setActivePage}
      onLogout={onLogout}
      onBack={onBack}
    >
      {renderPage()}
    </GovernmentAdminLayout>
  );
};

export default GovernmentAdmin;