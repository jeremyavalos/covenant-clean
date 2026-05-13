import Link from "next/link";

export const metadata = {
  title: "Support",
};

export default function SupportPage() {
  return (
    <main className="legal-page">
      <article className="legal-card">
        <p className="eyebrow">COVENANT</p>
        <h1>Support</h1>
        <p>
          If something blocks your return to the work, send a clear note and we
          will help.
        </p>

        <h2>Contact</h2>
        <p>
          Email{" "}
          <a href="mailto:support@joincovenantapp.com">
            support@joincovenantapp.com
          </a>{" "}
          for account access, beta questions, password reset issues, or launch
          support.
        </p>

        <h2>Helpful details</h2>
        <ul>
          <li>The email address on your Covenant account</li>
          <li>Your device type, if the issue is app-related</li>
          <li>A short description of what happened</li>
        </ul>

        <p>
          <Link href="/">Return to Covenant</Link>
        </p>
      </article>
    </main>
  );
}
