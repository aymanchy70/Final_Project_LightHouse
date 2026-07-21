import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

interface MemberRouteProps {
  children: ReactNode;
}

/**
 * MemberRoute — শুধু Member role এর user দেখতে পাবে।
 * Login নেই → /login
 * Login আছে কিন্তু Member না → /dashboard
 */
const MemberRoute = ({ children }: MemberRouteProps): JSX.Element => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isMember = user?.roles?.includes('Member') || user?.roles?.includes('Admin');

  if (!isMember) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default MemberRoute;
