import { Navigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const isCloudMode = supabase !== null;

  // No Supabase configured — genuine local-only mode, no auth needed.
  // This is the only safe bypass: the user has no auth infrastructure
  // available, so there's nothing to circumvent.
  if (!isCloudMode) {
    return <>{children}</>;
  }

  // Supabase is configured — authentication is required regardless of
  // client-side setupPath. localStorage can be manipulated via DevTools,
  // so we never trust it for auth decisions when cloud auth is available.
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
