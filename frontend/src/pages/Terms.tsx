import { motion } from "framer-motion";

const EFFECTIVE = "June 3, 2026";

export function TermsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mx-auto max-w-[740px] px-5 py-[120px] sm:px-8"
    >
      <h1 className="font-display text-[34px] font-light leading-[1.1] tracking-[-1.5px] sm:text-[40px]">
        Terms of Service
      </h1>
      <p className="mt-3 text-[14px] text-muted">
        Effective {EFFECTIVE}
      </p>

      <div className="prose-mt mt-10 space-y-8 text-[15.5px] leading-[1.85] text-ink-soft">
        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using Recall ("the Service"), you agree to be bound
            by these Terms of Service. If you do not agree, do not use the
            Service. We may update these terms from time to time; continued use
            after changes constitutes acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            2. What Recall Is
          </h2>
          <p>
            Recall is a subscription tracking tool. It helps you keep a list of
            your recurring charges, see your estimated monthly spend, and
            receive reminders before renewal dates. Recall does not connect to
            your bank, credit card, or any financial institution. You manually
            enter your subscription information.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            3. Accounts and Eligibility
          </h2>
          <p>
            You must be at least 13 years old to use Recall. The free Local plan
            requires no account — your data stays in your browser. The optional
            Sync plan requires a valid email address for authentication via
            magic link. You are responsible for the security of your email
            account.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            4. Your Data
          </h2>
          <p>
            On the free Local plan, all subscription data is stored in your
            browser's local storage and never transmitted to our servers. You
            can export your data at any time. On the Sync plan, your
            subscription data is encrypted and stored on our servers solely for
            the purpose of providing multi-device sync and reminder delivery. We
            do not sell, share, or monetize your data in any way. See our{" "}
            <a href="/privacy" className="text-rausch hover:underline">
              Privacy Policy
            </a>{" "}
            for full details.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            5. Acceptable Use
          </h2>
          <p>You agree not to:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1.5">
            <li>
              Use the Service for any unlawful purpose or in violation of any
              applicable law or regulation.
            </li>
            <li>
              Attempt to gain unauthorized access to any part of the Service, its
              servers, or connected systems.
            </li>
            <li>
              Interfere with or disrupt the Service, including through
              rate-limit bypass, injection, or denial-of-service techniques.
            </li>
            <li>
              Use automated tools (bots, scrapers) to access or interact with the
              Service without our written permission.
            </li>
            <li>
              Reverse engineer, decompile, or attempt to extract the source code
              of the Service.
            </li>
            <li>
              Resell, sublicense, or commercially exploit the Service without
              written consent.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            6. Payments and Subscriptions
          </h2>
          <p>
            The free Local plan is free forever with no account required. The
            optional Sync plan costs $1.99/month. Payments are processed by our
            payment provider (currently Lemon Squeezy). By subscribing to the
            Sync plan, you agree to the payment provider's terms as well. We do
            not store your payment card details.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            7. No Refunds
          </h2>
          <p>
            All payments for the Sync plan are final. We do not offer refunds,
            credits, or partial billing for unused portions of a subscription
            period. See our{" "}
            <a href="/refunds" className="text-rausch hover:underline">
              Refund Policy
            </a>{" "}
            for details.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            8. Intellectual Property
          </h2>
          <p>
            The Service, including its design, code, branding, and content, is
            owned by Recall and protected by applicable intellectual property
            laws. Recall is open source under the MIT license — you may view,
            fork, and contribute to the code on GitHub. The MIT license governs
            code usage; these Terms govern use of the hosted Service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            9. Service Availability
          </h2>
          <p>
            We strive to keep Recall running reliably, but we do not guarantee
            uninterrupted or error-free operation. We may temporarily suspend
            or modify the Service for maintenance, updates, or circumstances
            beyond our control. The free Local plan works offline and is
            unaffected by server downtime.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            10. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by law, Recall and its operators
            shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages, or any loss of profits or
            revenue, whether incurred directly or indirectly, or any loss of
            data, use, goodwill, or other intangible losses resulting from your
            use of the Service.
          </p>
          <p className="mt-3">
            Recall is a tracking tool, not financial advice. We are not
            responsible for any financial decisions you make based on the
            information displayed by the Service. Subscription amounts and
            renewal dates are estimates based on what you enter — they may not
            match your actual bank statements.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            11. Termination
          </h2>
          <p>
            You may stop using Recall at any time. On the Local plan, simply
            close your browser — your data stays in local storage until you
            clear it. On the Sync plan, you can delete your account from
            Settings, which permanently removes your data from our servers. We
            reserve the right to suspend or terminate access to the Service if
            you violate these terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            12. Changes to These Terms
          </h2>
          <p>
            We may revise these terms at any time. If we make material changes,
            we will update the "Effective" date at the top of this page. Your
            continued use of the Service after changes are posted constitutes
            acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            13. Contact
          </h2>
          <p>
            Questions about these terms? Reach us at{" "}
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
