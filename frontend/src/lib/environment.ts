/**
 * Environment and tier detection utility.
 * 
 * Dynamically determines if the app should run in "Local" mode (via the 
 * recall-cli companion) or "Cloud" mode (via Supabase), and enforces 
 * the 15-day cloud trial limit.
 */

const LOCAL_API_URL = 'http://localhost:21121';

export interface AccountTierInfo {
  subscriptionTier: 'local' | 'cloud_trial' | 'cloud_paid';
  trialEndsAt: string | null;
  isTrialExpired: boolean;
}

/**
 * Pings the local CLI backend to see if it's running.
 */
export async function isLocalBackendAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${LOCAL_API_URL}/api/health`, {
      method: 'GET',
      // Short timeout to prevent long hangs if the local server is not running
      signal: AbortSignal.timeout(2000), 
    });
    return response.ok;
  } catch (_error) {
    return false;
  }
}

/**
 * Evaluates the user's cloud tier status and checks for trial expiration.
 */
export function evaluateCloudTier(account: { 
  subscription_tier?: string; 
  trial_ends_at?: string | null; 
} | null): AccountTierInfo {
  if (!account) {
    return {
      subscriptionTier: 'local',
      trialEndsAt: null,
      isTrialExpired: false,
    };
  }

  const tier = (account.subscription_tier as 'local' | 'cloud_trial' | 'cloud_paid') || 'local';
  const trialEndsAt = account.trial_ends_at || null;
  
  let isTrialExpired = false;
  if (tier === 'cloud_trial' && trialEndsAt) {
    isTrialExpired = new Date(trialEndsAt) < new Date();
  }

  return {
    subscriptionTier: tier,
    trialEndsAt,
    isTrialExpired,
  };
}

/**
 * Determines the active API base URL based on local availability and tier.
 * If local is available, use it. Otherwise, fall back to cloud (empty string for relative paths / Supabase).
 */
export async function getActiveApiBaseUrl(): Promise<string> {
  const isLocal = await isLocalBackendAvailable();
  if (isLocal) {
    return LOCAL_API_URL;
  }
  // Fallback to cloud (relative paths will hit the Vercel-hosted backend or Supabase directly)
  return '';
}