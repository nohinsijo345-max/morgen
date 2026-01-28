import { Navigate, useLocation } from 'react-router-dom';
import { SessionManager } from '../utils/sessionManager';

const ProtectedRoute = ({ 
  children, 
  userType, 
  redirectTo = '/',
  requireAuth = true 
}) => {
  const location = useLocation();
  
  // Check if user has valid session
  const user = SessionManager.getUserSession(userType);
  
  if (requireAuth && !user) {
    // User not authenticated or session expired, redirect to module selector
    console.log(`Access denied to ${location.pathname} - redirecting to module selector`);
    return <Navigate to={redirectTo} replace />;
  }
  
  if (!requireAuth && user) {
    // User is authenticated but trying to access login page, redirect to dashboard
    const dashboardRoutes = {
      farmer: '/dashboard',
      buyer: '/buyer/dashboard',
      driver: '/driver/dashboard',
      admin: '/admin',
      government: '/government/dashboard'
    };
    
    return <Navigate to={dashboardRoutes[userType] || '/dashboard'} replace />;
  }
  
  return children;
};

export default ProtectedRoute;