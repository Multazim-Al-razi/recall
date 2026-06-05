import { Navigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const isCloudMode = supabase !== null;

  // No Supabase configured — local-only mode, no auth needed
  if (!isCloudMode) {
    return <>{children}</>;
  }

  // Cloud mode requires authentication regardless of setupPath.
  // setupPath controls which data source (local backend vs Supabase)
  // is used, not whether auth is enforced.

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-rausch border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
