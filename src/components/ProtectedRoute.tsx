import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'admin' | 'moderator' | 'client' }) {
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
    // Admin routes should allow both admin and moderator
    if (requiredRole === 'admin' && (role === 'admin' || role === 'moderator')) {
      return <>{children}</>;
    }

    if (requiredRole === 'client' && !role) {
      return <>{children}</>;
    }
    return <Navigate to={(role === 'admin' || role === 'moderator') ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}
