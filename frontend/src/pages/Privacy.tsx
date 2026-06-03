import { motion } from "framer-motion";

const EFFECTIVE = "June 3, 2026";

export function PrivacyPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mx-auto max-w-[740px] px-5 py-[120px] sm:px-8"
    >
      <h1 className="font-display text-[34px] font-light leading-[1.1] tracking-[-1.5px] sm:text-[40px]">
        Privacy Policy
      </h1>
      <p className="mt-3 text-[14px] text-muted">
        Effective {EFFECTIVE}
      </p>

      <div className="prose-mt mt-10 space-y-8 text-[15.5px] leading-[1.85] text-ink-soft">
        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            1. Overview
          </h2>
          <p>
            Recall is built on a local-first principle: your subscription data
            belongs to you and stays on your device by default. This policy
            explains what data we collect, why we collect it, and how we handle
            it — in plain language.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            2. Data We Do NOT Collect
          </h2>
          <p>We want to be clear about what we never collect:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1.5">
            <li>Bank account or credit card information</li>
            <li>Login credentials or passwords (we use GitHub OAuth)</li>
            <li>Transaction history from your bank</li>
            <li>Personal financial data beyond what you voluntarily enter</li>
            <li>Third-party tracking cookies or advertising data</li>
            <li>Browsing history or data from other websites</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            3. Data Stored Locally
          </h2>
          <p>
            All your subscription data, including names, costs, billing dates,
            categories, and notes, is stored in your browser's local storage. This data:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1.5">
            <li>Never leaves your device</li>
            <li>Is never transmitted to our servers</li>
            <li>Is never shared with any third party</li>
            <li>Is lost if you clear your browser data (export a backup from Settings)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            4. Authentication
          </h2>
          <p>
            Recall uses GitHub OAuth for sign-in. When you click "Continue with
            GitHub," you are redirected to GitHub's authentication page. We
            never see or store your GitHub password. Your authentication session
            is managed by Supabase and persisted in your browser's local
            storage.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            5. Analytics and Cookies
          </h2>
          <p>
            Recall does not use Google Analytics, Mixpanel, or any third-party
            analytics service. We do not set advertising or tracking cookies.
          </p>
          <p className="mt-3">
            We may use essential cookies required for authentication (GitHub
            OAuth session tokens) and preference storage (theme, currency),
            and we may collect basic download and usage metrics to evaluate the
            product's success during early access. This data is never sold or
            shared with third parties.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            6. Data Sharing
          </h2>
          <p>
            We do not sell, trade, or share your personal data with any third
            parties except:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1.5">
            <li>
              <strong>Supabase</strong> — our database and authentication
              provider. They process data on our behalf under strict data
              processing agreements.
            </li>
            <li>
              <strong>GitHub</strong> — used for authentication only. We receive
              your GitHub username and public profile; nothing else.
            </li>
            <li>
              <strong>Vercel</strong> — our hosting provider. They serve the
              application and do not access your subscription data.
            </li>
          </ul>
          <p className="mt-3">
            All third-party providers are contractually obligated to protect
            your data and are not permitted to use it for their own purposes.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            7. Data Retention
          </h2>
          <p>
            Your data stays in your browser until you clear it. We have no
            server-side copy. If you sign in with GitHub, your authentication
            session is stored locally in your browser and expires when you sign
            out.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            8. Your Rights
          </h2>
          <p>
            Depending on your jurisdiction (GDPR, CCPA, etc.), you may have the
            right to:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1.5">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your personal data</li>
            <li>Export your data in a portable format</li>
            <li>Object to processing of your data</li>
          </ul>
          <p className="mt-3">
            Since Recall stores data entirely on your device, you have full
            control — simply export or clear your browser data from Settings.
            GitHub authentication data is managed through your own GitHub
            account; you can revoke Recall's access at any time from{" "}
            <a
              href="https://github.com/settings/applications"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rausch hover:underline"
            >
              GitHub's authorized applications page
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            9. Children's Privacy
          </h2>
          <p>
            Recall is not intended for children under 13 years of age. We do
            not knowingly collect personal information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            10. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. If we make
            material changes, we will update the "Effective" date at the top of
            this page. Continued use of the Service after changes are posted
            constitutes acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            11. Contact
          </h2>
          <p>
            Recall is an open-source project maintained by the community, not a
            company offering a service. For questions about this policy, open
            an issue or discussion on{" "}
            <a
              href="https://github.com/Multazim-Al-razi/recall"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rausch hover:underline"
            >
              GitHub
            </a>
            .
          </p>
        </section>
      </div>
    </motion.div>
  );
}
