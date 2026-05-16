import Link from "next/link";

export const metadata = {
  title: "Terms of Use",
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <article className="legal-card">
        <p className="eyebrow">COVENANT</p>
        <h1>Terms of Use</h1>
        <p>
          By using Covenant, you agree to use the app responsibly and to keep
          your account information accurate and secure.
        </p>

        <h2>Apple Standard EULA</h2>
        <p>
          Covenant uses Apple&apos;s Standard End User License Agreement for iOS
          distribution. You can review it at{" "}
          <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">
            Apple Standard EULA
          </a>
          .
        </p>

        <h2>Use of Covenant</h2>
        <p>
          Covenant provides habit tracking, progress history, reflective
          sessions, and related account features. The app is not medical,
          psychological, legal, or financial advice.
        </p>

        <h2>Subscriptions</h2>
        <p>
          Covenant Pro is offered as an auto-renewing monthly subscription.
          Pricing is shown before purchase. You can cancel through your Apple
          account settings or the equivalent subscription settings on your
          platform.
        </p>

        <h2>Support</h2>
        <p>
          For account or billing questions, contact{" "}
          <a href="mailto:support@joincovenantapp.com">
            support@joincovenantapp.com
          </a>
          .
        </p>

        <p>
          <Link href="/">Return to Covenant</Link>
        </p>
      </article>
    </main>
  );
}
