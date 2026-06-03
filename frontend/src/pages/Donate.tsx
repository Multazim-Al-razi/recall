import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const SOLANA_ADDRESS = "DYr3t5vEWt6bw6QPARegm62XBpBCBT7MRnCipBtMq8D3";
const MIN_USDT = "$2";
const MIN_SOL = "0.1 SOL";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ink/12 px-4 py-2 text-[13px] font-medium text-ink transition-all hover:border-rausch/40 hover:text-rausch"
    >
      {copied ? (
        <>
          <Check size={14} className="text-success" />
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
      <div className="mx-auto max-w-[740px] px-5 py-16 sm:px-8 md:py-[120px]">
        <h1 className="text-center font-display text-[34px] font-light leading-[1.1] tracking-[-1.5px] sm:text-[40px]">
          Support Recall
        </h1>
        <p className="text-center mx-auto mt-4 max-w-[520px] text-[16px] leading-[1.7] text-muted">
          Recall is free and built with care. If it has saved you money or
          peace of mind, consider sending a tip. Every contribution
          helps keep the project alive and ad-free.
        </p>

        {/* USDT on Solana */}
        <div className="mt-10 rounded-2xl border border-ink/8 bg-surface p-6">
          <div className="flex items-center gap-3">
            <img
              src="https://cdn.simpleicons.org/tether/26A17B"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0"
            />
            <div>
              <h2 className="text-[16px] font-semibold">USDT on Solana</h2>
              <p className="text-[13px] text-muted">
                Send USDT (SPL token) to this address
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="flex-1 break-all rounded-lg bg-surface-2 px-4 py-3 font-mono text-[11px] sm:text-[12px] text-ink/70">
              {SOLANA_ADDRESS}
            </code>
            <CopyButton text={SOLANA_ADDRESS} />
          </div>
          <p className="mt-3 text-[12px] text-muted">
            Minimum donation: {MIN_USDT}. Only send USDT on the Solana network — other tokens or networks will be lost.
          </p>
        </div>

        {/* SOL on Solana */}
        <div className="mt-4 rounded-2xl border border-ink/8 bg-surface p-6">
          <div className="flex items-center gap-3">
            <img
              src="https://cdn.simpleicons.org/solana/9945FF"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0"
            />
            <div>
              <h2 className="text-[16px] font-semibold">SOL on Solana</h2>
              <p className="text-[13px] text-muted">
                Send native SOL to the same address
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="flex-1 break-all rounded-lg bg-surface-2 px-4 py-3 font-mono text-[11px] sm:text-[12px] text-ink/70">
              {SOLANA_ADDRESS}
            </code>
            <CopyButton text={SOLANA_ADDRESS} />
          </div>
          <p className="mt-3 text-[12px] text-muted">
            Minimum donation: {MIN_SOL}. Only send SOL on the Solana network — other networks will be lost.
          </p>
        </div>

        <div className="mt-12 flex items-center justify-center gap-3">
          <Logo className="h-5 w-auto text-ink/30" />
          <span className="text-[13px] text-muted">
            Made with care by the Recall team.
          </span>
        </div>
      </div>
    </motion.div>
  );
}
