import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAccountActions } from '@/hooks/useApiSync';
import { useAccountStore } from '@/stores/account';
import { Illustration } from '@/components/ui/Illustration';
import { Logo } from '@/components/ui/Logo';

const inputClass =
  'mt-1.5 w-full rounded-md border border-ink/10 bg-canvas px-4 py-3 text-[15px] focus:border-rausch focus:outline-none';

export function OnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeOnboarding } = useAccountActions();
  const existingProfile = useAccountStore((s) => s.profile);

  const isSignIn = location.pathname === '/signin';

  // Sign-up uses a 2-step wizard; sign-in is a single step.
  const [step, setStep] = useState(isSignIn ? 1 : 0);
  const [name, setName] = useState(isSignIn ? existingProfile.name : '');
  const [email, setEmail] = useState(isSignIn ? existingProfile.email : '');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState(existingProfile.currency || 'USD');

  const finish = () => {
    completeOnboarding({
      name: name.trim() || 'Friend',
      email: email.trim(),
      currency,
    });
    navigate('/dashboard');
  };

  const next = () => setStep((s) => Math.min(s + 1, 1));

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="grid w-full max-w-[940px] grid-cols-1 overflow-hidden rounded-[28px] border border-hairline bg-surface shadow-[0_20px_60px_rgba(26,26,26,0.08)] md:grid-cols-[1fr_1.1fr]">
        {/* Illustration panel */}
        <div className="hidden flex-col justify-between bg-surface-2 p-9 md:flex">
          <Logo className="h-6 w-auto text-rausch" />
          <Illustration name="welcome" decorative={false} className="w-full object-contain" />
          {!isSignIn && (
            <div className="flex gap-1.5">
              {[0, 1].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? 'w-7 bg-rausch' : 'w-1.5 bg-ink/15'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Step content */}
        <div className="flex flex-col justify-center p-8 md:p-11">
          <AnimatePresence mode="wait">
            {/* Sign-in flow */}
            {isSignIn && (
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="font-display text-[30px] font-light leading-[1.1] tracking-[-1.5px]">
                  Welcome <strong className="font-bold">back</strong>
                </h1>
                <p className="mt-2 text-[14px] leading-[1.6] text-muted">
                  Sign in to pick up where you left off. On the free local plan,
                  this just restores your profile on this device.
                </p>
                <form
                  className="mt-6 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    finish();
                  }}
                >
                  <label className="block">
                    <span className="text-[13px] font-medium text-ink/70">Email</span>
                    <input
                      className={inputClass}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ada@example.com"
                      autoFocus
                    />
                  </label>
                  <label className="block">
                    <span className="text-[13px] font-medium text-ink/70">Password</span>
                    <input
                      className={inputClass}
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </label>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-rausch px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5"
                  >
                    Sign in
                    <ArrowRight size={18} />
                  </button>
                </form>
                <p className="mt-6 text-[13px] text-muted">
                  New to Recall?{' '}
                  <Link to="/onboarding" className="font-medium text-rausch hover:underline">
                    Create an account
                  </Link>
                </p>
              </motion.div>
            )}

            {/* Sign-up: welcome step */}
            {!isSignIn && step === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <Illustration name="welcome" className="mb-6 h-[160px] w-full object-contain md:hidden" />
                <h1 className="font-display text-[32px] font-light leading-[1.1] tracking-[-1.5px]">
                  Welcome to <strong className="font-bold"><Logo className="text-[32px]" /></strong>
                </h1>
                <p className="mt-3 text-[15px] leading-[1.6] text-muted">
                  Let's grow your subscription garden. We'll track every recurring
                  charge so nothing renews behind your back. Takes about 20 seconds.
                </p>
                <button
                  onClick={next}
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-rausch px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5"
                >
                  Get started
                  <ArrowRight size={18} />
                </button>
                <p className="mt-6 text-[13px] text-muted">
                  Already have an account?{' '}
                  <Link to="/signin" className="font-medium text-rausch hover:underline">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}

            {/* Sign-up: profile step */}
            {!isSignIn && step === 1 && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="font-display text-[28px] font-light tracking-[-1px]">
                  Create your <strong className="font-bold">account</strong>
                </h2>
                <p className="mt-2 text-[14px] text-muted">
                  Free on the web — everything stays on your device.
                </p>
                <form
                  className="mt-6 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    finish();
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
                      Create account
                      <ArrowRight size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={finish}
                      className="text-[13px] font-medium text-muted hover:text-ink"
                    >
                      Skip for now
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
