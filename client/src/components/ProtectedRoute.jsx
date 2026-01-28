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
  
  console.log(`🔒 ProtectedRoute check for ${userType} at ${location.pathname}:`, {
    requireAuth,
    user: !!user,
    userData: user
  });
  
  if (requireAuth && !user) {
    // User not authenticated or session expired, redirect to module selector
    console.log(`❌ Access denied to ${location.pathname} - redirecting to ${redirectTo}`);
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
    
    const dashboardRoute = dashboardRoutes[userType] || '/dashboard';
    console.log(`✅ User already authenticated, redirecting to ${dashboardRoute}`);
    return <Navigate to={dashboardRoute} replace />;
  }
  
  console.log(`✅ Access granted to ${location.pathname}`);
  return children;
};

export default ProtectedRoute;