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

  // Cloud mode but user chose local-only access — skip auth
  // This is stored in the account store's setupPath field.
  // Check localStorage directly to avoid import cycle.
  const setupPath = getLocalSetupPath();
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

/**
 * Read the setupPath from localStorage without importing the account store.
 * Avoids circular dependency between AuthGuard and the account store.
 */
function getLocalSetupPath(): string | null {
  try {
    const raw = localStorage.getItem('recall-account');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.profile?.setupPath ?? null;
  } catch {
    return null;
  }
}
