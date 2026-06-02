import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/ui/Logo';
import { Illustration } from '@/components/ui/Illustration';
import { GithubMark } from '@/components/layout/GithubStars';

export function LoginPage() {
  const { signInWithGitHub } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGitHubLogin = async () => {
    setError(null);
    setLoading(true);
    const { error: err } = await signInWithGitHub();
    setLoading(false);
    if (err) {
      setError(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="grid w-full max-w-[940px] grid-cols-1 overflow-hidden rounded-[28px] border border-hairline bg-surface shadow-[0_20px_60px_rgba(26,26,26,0.08)] md:grid-cols-[1fr_1.1fr]">
        {/* Illustration panel */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-[#fbe7e5] to-[#fff5f3] p-9 md:flex">
          <Logo className="h-6 w-auto text-rausch" />
          <Illustration name="welcome" decorative={false} className="w-full object-contain" />
          <p className="text-[13px] text-ink/50">
            Secure, passwordless sign-in via GitHub.
          </p>
        </div>

        {/* Login content */}
        <div className="flex flex-col justify-center p-8 md:p-11">
          <Illustration name="welcome" className="mb-6 h-[160px] w-full object-contain md:hidden" />
          <h1 className="text-[32px] font-light leading-[1.1] tracking-[-1.5px]">
            Sign in to <strong className="font-bold"><Logo className="text-[32px]" /></strong>
          </h1>
          <p className="mt-3 text-[15px] leading-[1.6] text-muted">
            Use your GitHub account for a seamless, passwordless experience.
            Your subscriptions stay private and encrypted.
          </p>

          {error && (
            <p className="mt-4 rounded-md bg-rausch/10 p-3 text-[13px] text-rausch">
              {error}
            </p>
          )}

          <button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-ink px-7 py-4 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto"
          >
            <GithubMark size={20} />
            {loading ? 'Redirecting…' : 'Continue with GitHub'}
          </button>

          <p className="mt-6 text-[13px] text-muted">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
