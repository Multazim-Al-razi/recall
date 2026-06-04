import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Monitor, Terminal, Cloud, Check, Copy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAccountActions } from '@/hooks/useApiSync';
import { useAccountStore } from '@/stores/account';
import { Illustration } from '@/components/ui/Illustration';
import { Logo } from '@/components/ui/Logo';
import { GithubMark } from '@/components/layout/GithubStars';

const inputClass =
  'mt-1.5 w-full rounded-md border border-ink/10 bg-canvas px-4 py-3 text-[15px] focus:border-rausch focus:outline-none';

type SetupPath = 'local' | 'cli' | 'cloud' | null;

export function OnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeOnboarding } = useAccountActions();
  const { signInWithGitHub, user } = useAuth();
  const existingProfile = useAccountStore((s) => s.profile);

  const isSignIn = location.pathname === '/signin';

  const [step, setStep] = useState(isSignIn ? -1 : 0);
  const [name, setName] = useState(existingProfile.name || '');
  const [email, setEmail] = useState(existingProfile.email || '');
  const [currency, setCurrency] = useState(existingProfile.currency || 'USD');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [setupPath, setSetupPath] = useState<SetupPath>(null);
  const [copied, setCopied] = useState(false);

  // Consent checkboxes
  const [consentLocal, setConsentLocal] = useState(true);
  const [consentReminders, setConsentReminders] = useState(false);
  const [consentTos, setConsentTos] = useState(false);

  // If user authenticated via GitHub, pre-fill name/email from their profile
  const githubName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
  const githubEmail = user?.email || '';
  const githubAvatar = user?.user_metadata?.avatar_url || '';

  const finishLocal = (pathOverride: 'local' | 'cli' = setupPath === 'cli' ? 'cli' : 'local') => {
    completeOnboarding({
      name: name.trim() || 'Friend',
      email: email.trim(),
      currency,
      setupPath: pathOverride,
    });
    navigate('/dashboard');
  };

  const handleGitHubSignup = async () => {
    setAuthError(null);
    setAuthLoading(true);
    const { error: err } = await signInWithGitHub();
    setAuthLoading(false);
    if (err) {
      setAuthError(err);
    }
  };

  // After GitHub auth, complete onboarding with fetched data
  if (user && !useAccountStore.getState().onboarded && githubName) {
    completeOnboarding({
      name: githubName,
      email: githubEmail,
      avatar: githubAvatar,
      currency: existingProfile.currency || 'USD',
      setupPath: 'cloud',
    });
    navigate('/dashboard');
  }

  const copyCliCommand = () => {
    navigator.clipboard.writeText('npm i -g recall-cli && recall setup');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Sign-in flow (reuses cloud path) ──
  if (isSignIn && step === -1) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 py-16">
        <div className="grid w-full max-w-[940px] grid-cols-1 overflow-hidden rounded-[28px] border border-hairline bg-surface shadow-[0_20px_60px_rgba(26,26,26,0.08)] md:grid-cols-[1fr_1.1fr]">
          <div className="hidden flex-col justify-between bg-surface-2 p-9 md:flex">
            <Logo className="h-6 w-auto text-rausch" />
            <Illustration name="welcome" decorative={false} className="w-full object-contain" />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-11">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="font-display text-[30px] font-light leading-[1.1] tracking-[-1.5px]">
                Welcome <strong className="font-bold">back</strong>
              </h1>
              <p className="mt-2 text-[14px] leading-[1.6] text-muted">
                Sign in to sync your subscriptions across devices.
              </p>

              {authError && (
                <p className="mt-4 rounded-md bg-rausch/10 p-3 text-[13px] text-rausch">
                  {authError}
                </p>
              )}

              <button
                onClick={handleGitHubSignup}
                disabled={authLoading}
                className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-ink px-7 py-4 text-[15px] font-semibold text-canvas transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto dark:bg-white dark:text-ink dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              >
                <GithubMark size={20} className="shrink-0" />
                {authLoading ? 'Redirecting…' : 'Continue with GitHub'}
              </button>

              <p className="mt-6 text-[13px] text-muted">
                By continuing, you agree to our{' '}
                <Link to="/terms" className="text-rausch hover:underline">Terms</Link> and{' '}
                <Link to="/privacy" className="text-rausch hover:underline">Privacy Policy</Link>.
              </p>

              <div className="mt-5 rounded-xl border border-hairline bg-surface-2/50 p-4">
                <p className="text-[14px] font-medium text-ink">
                  No account needed
                </p>
                <p className="text-[13px] text-muted">
                  Use Recall entirely in your browser — data stays on this device, no sign-up required.
                </p>
                <Link
                  to="/onboarding"
                  className="mt-2 inline-flex items-center gap-1.5 text-[14px] font-semibold text-rausch hover:underline"
                >
                  Start locally <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // ── Sign-up flow ──
  const progressSteps = [0, 1, 2, 3];
  const currentProgress = step;

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="grid w-full max-w-[940px] grid-cols-1 overflow-hidden rounded-[28px] border border-hairline bg-surface shadow-[0_20px_60px_rgba(26,26,26,0.08)] md:grid-cols-[1fr_1.1fr]">
        {/* Illustration panel */}
        <div className="hidden flex-col justify-between bg-surface-2 p-9 md:flex">
          <Logo className="h-6 w-auto text-rausch" />
          <Illustration name="welcome" decorative={false} className="w-full object-contain" />
          <div className="flex gap-1.5">
            {progressSteps.map((i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentProgress ? 'w-7 bg-rausch' : 'w-1.5 bg-ink/15'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="flex flex-col justify-center p-8 md:p-11">
          <AnimatePresence mode="wait">

            {/* Step 0 — Consent */}
            {step === 0 && (
              <motion.div
                key="consent"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <Illustration name="welcome" className="mb-5 h-[140px] w-full object-contain md:hidden" />
                <h1 className="font-display text-[28px] font-light tracking-[-1px]">
                  Ready to take back <strong className="font-bold">control?</strong>
                </h1>
                <p className="mt-2 text-[14px] leading-[1.6] text-muted">
                  Review how Recall handles your data before we get started.
                </p>

                <div className="mt-6 space-y-2">
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-canvas">
                    <input
                      type="checkbox"
                      checked={consentTos}
                      onChange={(e) => setConsentTos(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-rausch"
                    />
                    <span className="text-[14px] text-ink">
                      I agree to the{' '}
                      <Link to="/terms" target="_blank" className="text-rausch hover:underline">Terms of Service</Link>
                      {' '}and{' '}
                      <Link to="/privacy" target="_blank" className="text-rausch hover:underline">Privacy Policy</Link>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-canvas">
                    <input
                      type="checkbox"
                      checked={consentLocal}
                      onChange={(e) => setConsentLocal(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-rausch"
                    />
                    <span className="text-[14px] text-ink">
                      My subscription data stays on this device by default
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-canvas">
                    <input
                      type="checkbox"
                      checked={consentReminders}
                      onChange={(e) => setConsentReminders(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-rausch"
                    />
                    <span className="text-[14px] text-ink">
                      I'd like to receive renewal reminders by email{' '}
                      <span className="text-muted">(optional)</span>
                    </span>
                  </label>
                </div>

                <button
                  onClick={() => setStep(1)}
                  disabled={!consentTos}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rausch px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0 sm:w-auto"
                >
                  Continue
                  <ArrowRight size={18} />
                </button>

                <p className="mt-4 text-[12px] text-muted">
                  You can change these preferences anytime in Settings.
                </p>

                <p className="mt-3 text-[13px] text-muted">
                  Already have an account?{' '}
                  <Link to="/signin" className="font-medium text-rausch hover:underline">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}

            {/* Step 1 — Setup path */}
            {step === 1 && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="font-display text-[28px] font-light tracking-[-1px]">
                  Choose your <strong className="font-bold">setup</strong>
                </h1>
                <p className="mt-2 text-[14px] text-muted">
                  Where do you want Recall to live?
                </p>

                <div className="mt-6 space-y-3">
                  {/* Local */}
                  <button
                    onClick={() => setStep(2)}
                    className="flex w-full items-start gap-4 rounded-xl border border-hairline bg-canvas p-4 text-left transition-all hover:-translate-y-0.5 hover:border-rausch/30 hover:shadow-[var(--shadow-sm)]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rausch/10 text-rausch">
                      <Monitor size={20} />
                    </span>
                    <div>
                      <div className="text-[15px] font-semibold text-ink">Local</div>
                      <div className="mt-0.5 text-[13px] leading-[1.5] text-muted">
                        Everything stays in your browser. No account needed.
                      </div>
                    </div>
                  </button>

                  {/* Cloud */}
                  <button
                    onClick={() => { setSetupPath('cloud'); handleGitHubSignup(); }}
                    disabled={authLoading}
                    className="flex w-full items-start gap-4 rounded-xl border border-hairline bg-canvas p-4 text-left transition-all hover:-translate-y-0.5 hover:border-rausch/30 hover:shadow-[var(--shadow-sm)] disabled:opacity-50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/8 text-ink">
                      <Cloud size={20} />
                    </span>
                    <div>
                      <div className="text-[15px] font-semibold text-ink">Cloud</div>
                      <div className="mt-0.5 text-[13px] leading-[1.5] text-muted">
                        Sync across devices with GitHub sign-in.
                      </div>
                    </div>
                  </button>
                </div>

                {authError && (
                  <p className="mt-3 rounded-md bg-rausch/10 p-3 text-[13px] text-rausch">
                    {authError}
                  </p>
                )}

                <button
                  onClick={() => setStep(0)}
                  className="mt-4 text-[13px] font-medium text-muted hover:text-ink"
                >
                  Back
                </button>
              </motion.div>
            )}

            {/* Step 2 — Local sub-picker: Web app or CLI companion */}
            {step === 2 && setupPath === null && (
              <motion.div
                key="local-picker"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="font-display text-[28px] font-light tracking-[-1px]">
                  How will you <strong className="font-bold">use Recall?</strong>
                </h1>
                <p className="mt-2 text-[14px] text-muted">
                  Pick how you'd like to interact. You can always add the other later.
                </p>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => { setSetupPath('local'); setStep(3); }}
                    className="flex w-full items-start gap-4 rounded-xl border border-hairline bg-canvas p-4 text-left transition-all hover:-translate-y-0.5 hover:border-rausch/30 hover:shadow-[var(--shadow-sm)]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rausch/10 text-rausch">
                      <Monitor size={20} />
                    </span>
                    <div>
                      <div className="text-[15px] font-semibold text-ink">Web app</div>
                      <div className="mt-0.5 text-[13px] leading-[1.5] text-muted">
                        Continue in your browser. No install required.
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setSetupPath('cli'); }}
                    className="flex w-full items-start gap-4 rounded-xl border border-hairline bg-canvas p-4 text-left transition-all hover:-translate-y-0.5 hover:border-rausch/30 hover:shadow-[var(--shadow-sm)]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
                      <Terminal size={20} />
                    </span>
                    <div>
                      <div className="text-[15px] font-semibold text-ink">CLI companion</div>
                      <div className="mt-0.5 text-[13px] leading-[1.5] text-muted">
                        Background service with native OS notifications.
                      </div>
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="mt-4 text-[13px] font-medium text-muted hover:text-ink"
                >
                  Back
                </button>
              </motion.div>
            )}

            {/* Step 2 — Profile (or CLI instructions) */}
            {step === 2 && setupPath === 'cli' && (
              <motion.div
                key="cli-setup"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="font-display text-[28px] font-light tracking-[-1px]">
                  Install the <strong className="font-bold">CLI companion</strong>
                </h2>
                <p className="mt-2 text-[14px] text-muted">
                  Run this in your terminal to install and configure Recall:
                </p>

                <div className="mt-5 overflow-hidden rounded-lg border border-hairline bg-ink font-mono text-[13px] text-canvas">
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <code>npm i -g recall-cli && recall setup</code>
                    <button
                      onClick={copyCliCommand}
                      className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-muted transition-colors hover:bg-canvas/10 hover:text-canvas"
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <p className="mt-4 text-[13px] text-muted">
                  The setup wizard will configure auto-startup and native notifications.
                  You can continue setting up your profile while it installs.
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 rounded-full bg-rausch px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5"
                  >
                    Continue to profile
                    <ArrowRight size={18} />
                  </button>
                </div>

                <button
                  onClick={() => { setSetupPath(null); setStep(1); }}
                  className="mt-4 text-[13px] font-medium text-muted hover:text-ink"
                >
                  Back
                </button>
              </motion.div>
            )}

            {(
              (step === 2 && setupPath === 'cli') ||
              (step === 3 && setupPath === 'local')
            ) && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="font-display text-[28px] font-light tracking-[-1px]">
                  Set up your <strong className="font-bold">profile</strong>
                </h2>
                <p className="mt-2 text-[14px] text-muted">
                  {setupPath === 'cli'
                    ? 'Your CLI companion will sync with this profile.'
                    : 'Free on your device. No account needed.'}
                </p>
                <form
                  className="mt-6 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    finishLocal();
                  }}
                >
                  <label className="block">
                    <span className="text-[13px] font-medium text-ink/70">Your name</span>
                    <input
                      className={inputClass}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ada Lovelace"
                      autoFocus
                    />
                  </label>
                  <label className="block">
                    <span className="text-[13px] font-medium text-ink/70">Email (optional)</span>
                    <input
                      className={inputClass}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ada@example.com"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[13px] font-medium text-ink/70">Preferred currency</span>
                    <select
                      className={inputClass}
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-full bg-rausch px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5"
                    >
                      Create profile
                      <ArrowRight size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => finishLocal()}
                      className="text-[13px] font-medium text-muted hover:text-ink"
                    >
                      Skip for now
                    </button>
                  </div>
                </form>

                <button
                  onClick={() => setStep(setupPath === 'cli' ? 1 : 2)}
                  className="mt-4 text-[13px] font-medium text-muted hover:text-ink"
                >
                  Back
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
