import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <article className="legal-card">
        <p className="eyebrow">COVENANT</p>
        <h1>Privacy Policy</h1>
        <p>
          Covenant is built around private discipline. We collect only the
          information needed to run your account, save progress, and support the
          app experience.
        </p>

        <h2>Information we collect</h2>
        <p>
          We may collect your email address, authentication data, habit progress,
          subscription status, and support messages you send to us.
        </p>

        <h2>How we use it</h2>
        <p>
          We use this information to authenticate your account, save your habit
          progress, provide password reset and verification emails, manage Pro
          access, and respond to support requests.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy questions, contact{" "}
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
