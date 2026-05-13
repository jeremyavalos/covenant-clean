import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <article className="legal-card">
        <p className="eyebrow">COVENANT</p>
        <h1>Terms of Service</h1>
        <p>
          By using Covenant, you agree to use the app responsibly and to keep
          your account information accurate and secure.
        </p>

        <h2>Use of Covenant</h2>
        <p>
          Covenant provides habit tracking, progress history, reflective
          sessions, and related account features. The app is not medical,
          psychological, legal, or financial advice.
        </p>

        <h2>Subscriptions</h2>
        <p>
          Covenant Pro unlocks additional app features. Pricing and availability
          may vary by platform and region when iOS and Android launch.
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
