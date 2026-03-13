import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'admin' | 'client' }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full solar-gradient animate-pulse-glow" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) {
    // If role is strictly known as admin, go there. Otherwise fallback to dashboard.
    // However, if we are ALREADY going to fallback to dashboard, but requiredRole WAS client
    // (meaning role is somehow missing/null), we shouldn't infinite loop. We'll just render it as client.
    if (requiredRole === 'client' && !role) {
      return <>{children}</>;
    }
    return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}
