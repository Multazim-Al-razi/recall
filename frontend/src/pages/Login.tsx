import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/ui/Logo';
import { Illustration } from '@/components/ui/Illustration';
import { ArrowRight, Mail, Check } from 'lucide-react';

const inputClass =
  'mt-1.5 w-full rounded-md border border-ink/10 bg-canvas px-4 py-3 text-[15px] focus:border-rausch focus:outline-none';

type Step = 'email' | 'sent';

export function LoginPage() {
  const { signInWithOtp } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleSendMagicLink = async () => {
    setError(null);
    setSending(true);
    const { error: err } = await signInWithOtp(email.trim());
    setSending(false);
    if (err) {
      setError(err);
      return;
    }
    setStep('sent');
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="grid w-full max-w-[940px] grid-cols-1 overflow-hidden rounded-[28px] border border-hairline bg-surface shadow-[0_20px_60px_rgba(26,26,26,0.08)] md:grid-cols-[1fr_1.1fr]">
        {/* Illustration panel */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-[#fbe7e5] to-[#fff5f3] p-9 md:flex">
          <Logo className="h-6 w-auto text-rausch" />
          <Illustration name="welcome" decorative={false} className="w-full object-contain" />
          <p className="text-[13px] text-ink/50">
            No passwords. We send a magic link to your email.
          </p>
        </div>

        {/* Step content */}
        <div className="flex flex-col justify-center p-8 md:p-11">
          {step === 'email' && (
            <div>
              <Illustration name="welcome" className="mb-6 h-[160px] w-full object-contain md:hidden" />
              <h1 className="text-[32px] font-light leading-[1.1] tracking-[-1.5px]">
                Sign in to <strong className="font-bold"><Logo className="text-[32px]" /></strong>
              </h1>
              <p className="mt-3 text-[15px] leading-[1.6] text-muted">
                Enter your email and we'll send a magic link. No password needed —
                your subscriptions stay private and encrypted.
              </p>
              <div className="mt-6">
                <label className="block">
                  <span className="text-[13px] font-medium text-ink/70">Email address</span>
                  <div className="relative mt-1.5">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
                    <input
                      className={`${inputClass} pl-10`}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMagicLink()}
                    />
                  </div>
                </label>
              </div>
              {error && (
                <p className="mt-2 text-[13px] text-rausch">{error}</p>
              )}
              <button
                onClick={handleSendMagicLink}
                disabled={sending || !email.trim()}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-rausch px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {sending ? 'Sending…' : 'Send magic link'} <ArrowRight size={18} />
              </button>
              <p className="mt-5 text-[13px] text-muted">
                Free forever on your device. Cloud sync is $1.99/mo.
              </p>
            </div>
          )}

          {step === 'sent' && (
            <div>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <Check size={32} className="text-green-600" />
              </div>
              <h2 className="text-[28px] font-light tracking-[-1px]">
                Check your <strong className="font-bold">inbox</strong>
              </h2>
              <p className="mt-2 text-[14px] text-muted">
                We sent a magic link to <strong className="text-ink">{email}</strong>.
                Click the link in the email to sign in.
              </p>
              <p className="mt-4 text-[13px] text-muted">
                The link expires in 1 hour. Check your spam folder if you don't see it.
              </p>
              <button
                onClick={() => { setStep('email'); setError(null); }}
                className="mt-7 text-[13px] font-medium text-muted hover:text-ink"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
