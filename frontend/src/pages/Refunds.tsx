import { motion } from "framer-motion";

const EFFECTIVE = "June 3, 2026";

export function RefundsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mx-auto max-w-[740px] px-5 py-[120px] sm:px-8"
    >
      <h1 className="font-display text-[34px] font-light leading-[1.1] tracking-[-1.5px] sm:text-[40px]">
        Refund Policy
      </h1>
      <p className="mt-3 text-[14px] text-muted">
        Effective {EFFECTIVE}
      </p>

      <div className="prose-mt mt-10 space-y-8 text-[15.5px] leading-[1.85] text-ink-soft">
        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            Recall Is Free
          </h2>
          <p>
            Recall is completely free to use. We do not charge for any features
            or subscriptions, so there is nothing to refund.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            Voluntary Donations
          </h2>
          <p>
            If you choose to support the project via voluntary cryptocurrency
            donations, those transactions are processed directly on the
            blockchain and are <strong className="text-ink">non-refundable</strong>.
            We have no ability to reverse or recall blockchain transactions.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            Contact
          </h2>
          <p>
            Questions about this policy? Reach us at{" "}
            <a
              href="mailto:hello@recall.app"
              className="text-rausch hover:underline"
            >
              hello@recall.app
            </a>
            .
          </p>
        </section>
      </div>
    </motion.div>
  );
}
