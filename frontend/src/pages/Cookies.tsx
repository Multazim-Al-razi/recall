import { motion } from "framer-motion";

const EFFECTIVE = "June 3, 2026";

export function CookiesPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mx-auto max-w-[740px] px-5 py-[120px] sm:px-8"
    >
      <h1 className="font-display text-[34px] font-light leading-[1.1] tracking-[-1.5px] sm:text-[40px]">
        Cookie Policy
      </h1>
      <p className="mt-3 text-[14px] text-muted">
        Effective {EFFECTIVE}
      </p>

      <div className="prose-mt mt-10 space-y-8 text-[15.5px] leading-[1.85] text-ink-soft">
        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            What Are Cookies?
          </h2>
          <p>
            Cookies are small text files stored on your device by your web
            browser. They are commonly used to remember preferences, maintain
            sessions, and enable website functionality.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            How Recall Uses Cookies
          </h2>
          <p>
            Recall is designed to be privacy-respecting. We use a minimal number
            of cookies, all of which are strictly necessary for the Service to
            function. We do not use advertising, analytics, or social media
            cookies.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            Cookies We Use
          </h2>

          <div className="mt-4 overflow-hidden rounded-xl border border-ink/8">
            <table className="w-full text-left text-[14px]">
              <thead className="border-b border-ink/8 bg-surface-2">
                <tr>
                  <th className="px-4 py-3 font-semibold text-ink">Cookie</th>
                  <th className="px-4 py-3 font-semibold text-ink">Purpose</th>
                  <th className="px-4 py-3 font-semibold text-ink">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                <tr>
                  <td className="px-4 py-3 font-medium">sb-*-auth-token</td>
                  <td className="px-4 py-3 text-muted">
                    Supabase authentication session. Keeps you signed in after
                    GitHub OAuth.
                  </td>
                  <td className="px-4 py-3 text-muted">Session / 1 year</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">sb-*-refresh-token</td>
                  <td className="px-4 py-3 text-muted">
                    Supabase refresh token. Allows your session to be renewed
                    without re-authenticating.
                  </td>
                  <td className="px-4 py-3 text-muted">Until revoked</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4">
            These cookies are set by Supabase (our authentication provider) and
            are essential for maintaining your login session. They contain no
            personally identifiable information beyond an opaque session
            identifier.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            Local Storage (Not Cookies)
          </h2>
          <p>
            Recall also uses your browser's local storage to persist your
            subscription data on the free Local plan and your preferences
            (theme, currency) on all plans. Local storage is similar to cookies
            but is not transmitted with every HTTP request — it is only
            accessible by JavaScript running on our domain. This data never
            leaves your device.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            Third-Party Cookies
          </h2>
          <p>
            We do not allow any third-party cookies on our site. There are no
            tracking pixels, no advertising networks, no social media embeds
            that set cookies, and no analytics scripts that use cookies.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            Managing Cookies
          </h2>
          <p>
            You can control or delete cookies through your browser settings.
            Most browsers allow you to block all cookies or only third-party
            cookies. However, blocking the essential Supabase authentication
            cookies described above will prevent you from signing in.
          </p>
          <p className="mt-3">
            Browser-specific instructions:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1.5">
            <li>
              <strong>Chrome:</strong> Settings → Privacy and security → Cookies
            </li>
            <li>
              <strong>Firefox:</strong> Settings → Privacy & Security → Cookies
              and Site Data
            </li>
            <li>
              <strong>Safari:</strong> Settings → Privacy → Manage Website Data
            </li>
            <li>
              <strong>Edge:</strong> Settings → Cookies and site permissions
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            Changes to This Policy
          </h2>
          <p>
            We may update this Cookie Policy from time to time. If we make
            material changes, we will update the "Effective" date at the top of
            this page.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[20px] font-semibold text-ink">
            Contact
          </h2>
          <p>
            Questions about our use of cookies? Reach us at{" "}
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
