import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { useAccountStore } from '@/stores/account';
import { PLAN_CONFIG, PLAN_ORDER, type PlanTier } from '@/types/plan';
import { Illustration } from '@/components/ui/Illustration';
import { Logo } from '@/components/ui/Logo';
import { formatMoney } from '@/lib/format';

const inputClass =
  'mt-1.5 w-full rounded-[12px] border border-ink/10 bg-canvas px-4 py-3 text-[15px] focus:border-rausch focus:outline-none';

export function OnboardingPage() {
  const navigate = useNavigate();
  const completeOnboarding = useAccountStore((s) => s.completeOnboarding);
  const setPlan = useAccountStore((s) => s.setPlan);

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [chosenPlan, setChosenPlan] = useState<PlanTier>('free');

  const finish = () => {
    completeOnboarding({ name: name.trim() || 'Friend', email: email.trim(), currency });
    setPlan(chosenPlan);
    navigate('/dashboard');
  };

  const next = () => setStep((s) => Math.min(s + 1, 2));

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="grid w-full max-w-[940px] grid-cols-1 overflow-hidden rounded-[28px] border border-hairline bg-surface shadow-[0_20px_60px_rgba(26,26,26,0.08)] md:grid-cols-[1fr_1.1fr]">
        {/* Illustration panel */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-[#fbe7e5] to-[#fff5f3] p-9 md:flex">
          <Logo className="h-6 w-auto text-rausch" />
          <Illustration name="welcome" decorative={false} className="w-full object-contain" />
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-7 bg-rausch' : 'w-1.5 bg-ink/15'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="flex flex-col justify-center p-8 md:p-11">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <Illustration name="welcome" className="mb-6 h-[160px] w-full object-contain md:hidden" />
                <h1 className="text-[32px] font-light leading-[1.1] tracking-[-1.5px]">
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
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-[28px] font-light tracking-[-1px]">
                  Tell us <strong className="font-bold">about you</strong>
                </h2>
                <p className="mt-2 text-[14px] text-muted">Everything stays on your device.</p>
                <div className="mt-6 space-y-4">
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
                </div>
                <button
                  onClick={next}
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-rausch px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5"
                >
                  Continue
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="plan"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-[28px] font-light tracking-[-1px]">
                  Pick a <strong className="font-bold">plan</strong>
                </h2>
                <p className="mt-2 text-[14px] text-muted">
                  One-time purchase, no recurring fees. Start free, upgrade anytime.
                </p>
                <div className="mt-5 space-y-2.5">
                  {PLAN_ORDER.map((tier) => {
                    const plan = PLAN_CONFIG[tier];
                    const selected = chosenPlan === tier;
                    return (
                      <button
                        key={tier}
                        onClick={() => setChosenPlan(tier)}
                        className={`flex w-full items-center gap-3 rounded-[14px] border-2 px-4 py-3 text-left transition-all ${
                          selected ? 'border-rausch bg-rausch/[0.04]' : 'border-ink/8 hover:border-ink/15'
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            selected ? 'border-rausch bg-rausch text-white' : 'border-ink/20'
                          }`}
                        >
                          {selected && <Check size={12} strokeWidth={3} />}
                        </span>
                        <span className="flex-1">
                          <span className="text-[15px] font-semibold">{plan.name}</span>
                          <span className="ml-2 text-[13px] text-muted">{plan.tagline}</span>
                        </span>
                        <span className="text-[15px] font-bold">
                          {plan.price === 0 ? 'Free' : formatMoney(plan.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={finish}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-rausch px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5"
                >
                  Enter Recall
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={finish}
                  className="ml-3 text-[13px] font-medium text-muted hover:text-ink"
                >
                  Skip for now
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
