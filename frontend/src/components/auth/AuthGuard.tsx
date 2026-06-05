import { Navigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { useAccountStore } from '@/stores/account';
import { supabase } from '@/lib/supabaseClient';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const setupPath = useAccountStore((s) => s.profile.setupPath);
  const isCloudMode = supabase !== null;

  // No Supabase configured — local-only mode, no auth needed
  if (!isCloudMode) {
    return <>{children}</>;
  }

  // Supabase is configured, but user chose local/cli setup — no auth needed.
  // Only cloud setupPath requires GitHub authentication.
  if (setupPath === 'local' || setupPath === 'cli') {
    return <>{children}</>;
  }

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
