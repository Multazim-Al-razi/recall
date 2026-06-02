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
            All Sales Are Final
          </h2>
          <p>
            Recall's free Local plan requires no payment and no account — it is
            free forever. The optional Sync plan is a monthly subscription at
            $1.99/month.{" "}
            <strong className="text-ink">
              All payments for the Sync plan are final and non-refundable.
            </strong>
          </p>
          <p className="mt-3">
            We do not offer:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1.5">
            <li>Full or partial refunds for any subscription period</li>
            <li>Credits toward future billing periods</li>
            <li>Pro-rated refunds for mid-period cancellations</li>
            <li>Refunds for unused features</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            Why No Refunds?
          </h2>
          <p>
            The Sync plan is a low-cost digital service. The $1.99 monthly fee
            covers server costs, email delivery for reminders, and encryption
            infrastructure. These costs are incurred immediately when the billing
            period begins. Because the service is delivered instantly and
            continuously, we are unable to offer refunds for any portion of a
            billing period.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            Cancellation
          </h2>
          <p>
            You can cancel your Sync subscription at any time from the Settings
            page in your dashboard. Upon cancellation:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1.5">
            <li>
              Your Sync features remain active until the end of your current
              billing period
            </li>
            <li>
              No further charges will be made after the current period ends
            </li>
            <li>
              You can export your data at any time before or after cancellation
            </li>
            <li>
              After cancellation, your account reverts to the free Local plan
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            Exceptional Circumstances
          </h2>
          <p>
            In the rare event of a billing error (e.g., being charged twice for
            the same period), please contact us at{" "}
            <a
              href="mailto:hello@recall.app"
              className="text-rausch hover:underline"
            >
              hello@recall.app
            </a>{" "}
            and we will resolve it promptly. Billing errors are the only
            circumstance under which a refund may be issued.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            Payment Provider
          </h2>
          <p>
            Payments are processed by Lemon Squeezy. If you believe a charge
            was made in error, you may also contact Lemon Squeezy support
            directly. However, Lemon Squeezy's own refund terms apply, and
            Recall's no-refund policy remains in effect for the service itself.
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
