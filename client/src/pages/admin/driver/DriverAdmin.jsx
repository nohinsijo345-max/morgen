import { useState } from 'react';
import DriverAdminLayout from './DriverAdminLayout';
import DriverAdminDashboard from './DriverAdminDashboard';
import DriverManagement from './DriverManagement';
import TransportManagement from '../TransportManagement';
import CancellationRequestsManagement from './CancellationRequestsManagement';
import OrderDetailsManagement from './OrderDetailsManagement';

const DriverAdmin = ({ onLogout, onBack }) => {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DriverAdminDashboard onNavigate={setActivePage} />;
      case 'drivers':
        return <DriverManagement />;
      case 'vehicles':
        return <TransportManagement />;
      case 'bookings':
        return <TransportManagement />;
      case 'cancellation-requests':
        return <CancellationRequestsManagement />;
      case 'order-details':
        return <OrderDetailsManagement />;
      default:
        return <DriverAdminDashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <DriverAdminLayout
      activePage={activePage}
      onNavigate={setActivePage}
      onLogout={onLogout}
      onBack={onBack}
    >
      {renderPage()}
    </DriverAdminLayout>
  );
};

export default DriverAdmin;