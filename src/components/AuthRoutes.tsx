import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth, UserPermissions } from '../context/AuthContext';
import { ShieldAlert, LogOut, Home } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof UserPermissions;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return null;

  if (session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
