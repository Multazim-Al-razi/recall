import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { MaskDivider } from "@/components/layout/MaskDivider";

const SOLANA_ADDRESS = "XXXXX";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-full border border-ink/12 px-4 py-2 text-[13px] font-medium text-ink transition-all hover:border-rausch/40 hover:text-rausch"
    >
      {copied ? (
        <>
          <Check size={14} className="text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Copy size={14} />
          Copy address
        </>
      )}
    </button>
  );
}

export function DonatePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="mx-auto max-w-[740px] px-5 py-[120px] sm:px-8">
        <h1 className="font-display text-[34px] font-light leading-[1.1] tracking-[-1.5px] sm:text-[40px]">
          Support Recall
        </h1>
        <p className="mt-4 max-w-[520px] text-[16px] leading-[1.7] text-muted">
          Recall is free and built with care. If it has saved you money or
          peace of mind, consider buying us a coffee. Every contribution
          helps keep the project alive and ad-free.
        </p>

        {/* Solana */}
        <div className="mt-10 rounded-2xl border border-ink/8 bg-surface p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-[18px]">
              ◎
            </span>
            <div>
              <h2 className="text-[16px] font-semibold">Solana (SOL)</h2>
              <p className="text-[13px] text-muted">
                Send SOL or any SPL token to this address
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="flex-1 break-all rounded-lg bg-surface-2 px-4 py-3 font-mono text-[13px] text-ink/70">
              {SOLANA_ADDRESS}
            </code>
            <CopyButton text={SOLANA_ADDRESS} />
          </div>
        </div>

        {/* More networks placeholder */}
        <div className="mt-4 rounded-2xl border border-dashed border-ink/12 bg-surface/40 p-6 text-center">
          <p className="text-[14px] text-muted">
            More networks coming soon.
          </p>
        </div>

        <div className="mt-12 flex items-center gap-3">
          <Logo className="h-5 w-auto text-ink/30" />
          <span className="text-[13px] text-muted">
            Made with care by the Recall team.
          </span>
        </div>
      </div>

      <MaskDivider />
      <section className="pb-24 pt-8 text-center text-[13px] text-muted">
        Recall — track every subscription, never forget to cancel.
      </section>
    </motion.div>
  );
}
