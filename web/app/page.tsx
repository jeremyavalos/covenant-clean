import Image from "next/image";
import Link from "next/link";
import {
  TrackedButton,
  TrackedDetails,
  TrackedLink,
} from "./analytics-controls";

const habits = [
  "Cold shower",
  "Exercise",
  "Dominate the mind",
  "Mental strength",
  "No vices",
  "Writing",
  "Gratitude",
  "Silence",
  "Meditation",
];

const steps = [
  {
    number: "01",
    title: "Choose one habit",
    text: "Begin with the discipline that needs honesty before ambition.",
  },
  {
    number: "02",
    title: "Complete daily",
    text: "Return each day, mark what is true, and keep the record clean.",
  },
  {
    number: "03",
    title: "Build a 30-day covenant",
    text: "Move through a focused path designed for consistency over intensity.",
  },
  {
    number: "04",
    title: "Track progress",
    text: "Keep streaks, completed days, sessions, and history tied to your account.",
  },
];

const faqs = [
  {
    question: "What is Covenant?",
    answer:
      "Covenant is a mobile app for honest habits, daily completion, and returning to discipline through a focused 30-day structure.",
  },
  {
    question: "Is Covenant free?",
    answer:
      "Yes. Free users can work with one habit every 24 hours. Covenant Pro unlocks multiple habits, full history, deeper sessions, and extended progress.",
  },
  {
    question: "Is my progress saved?",
    answer:
      "Yes. Your progress is connected to your account so streaks, completed days, and habit history stay with you.",
  },
  {
    question: "When will iOS and Android be available?",
    answer:
      "Covenant is preparing for release on iOS and Android. Join the beta list to be notified as access opens.",
  },
  {
    question: "How do I reset my password?",
    answer:
      "Use the forgot password flow in the app. Covenant will send secure reset instructions to your email.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Email support@joincovenantapp.com and the Covenant team will respond.",
  },
];

export default function Home() {
  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/">
          COVENANT
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#what">What</a>
          <a href="#how">How</a>
          <a href="#plans">Plans</a>
          <a href="#faq">FAQ</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <Image
            className="hero-image"
            src="/images/covenant-ritual-bg.png"
            alt=""
            fill
            priority
            sizes="100vw"
          />
          <div className="hero-shade" />
          <div className="hero-inner">
            <p className="eyebrow">COVENANT</p>
            <h1>Discipline, remembered.</h1>
            <p className="hero-copy">
              A quiet system for honest habits, daily progress, and returning
              to yourself.
            </p>
            <div className="hero-actions">
              <TrackedLink
                className="button button-primary"
                eventName="cta_clicked"
                eventProperties={{
                  cta: "download_ios_hero",
                  location: "hero",
                }}
                href="#download"
              >
                Download for iOS
              </TrackedLink>
              <TrackedLink
                className="button"
                eventName="cta_clicked"
                eventProperties={{
                  cta: "download_android_hero",
                  location: "hero",
                }}
                href="#download"
              >
                Download for Android
              </TrackedLink>
              <span>Coming soon on iOS and Android</span>
            </div>
          </div>
        </section>

        <section id="what" className="section what-section">
          <div className="section-heading">
            <p className="eyebrow">What is Covenant?</p>
            <h2>A private discipline system, not a performance feed.</h2>
          </div>
          <div className="text-columns">
            <p>
              Covenant helps you build habits without noise. You choose the
              practice, return each day, and keep an honest record of the work.
            </p>
            <p>
              The app is built for people who do not need louder motivation.
              They need a place to remember what they said they would become.
            </p>
          </div>
        </section>

        <section id="how" className="section">
          <div className="section-heading">
            <p className="eyebrow">How it works</p>
            <h2>One vow. One day. Repeated.</h2>
          </div>
          <div className="steps-grid">
            {steps.map((step) => (
              <article className="step-card" key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section habits-section">
          <div className="section-heading">
            <p className="eyebrow">Habits</p>
            <h2>Practices that make avoidance visible.</h2>
          </div>
          <div className="habit-list">
            {habits.map((habit) => (
              <span key={habit}>{habit}</span>
            ))}
          </div>
        </section>

        <section className="section philosophy-section">
          <div className="section-heading">
            <p className="eyebrow">Philosophy</p>
            <h2>Discipline is not intensity. It is return.</h2>
          </div>
          <div className="text-columns">
            <p>
              Covenant is quiet on purpose. It does not turn your life into a
              feed, a contest, or a performance. It gives the day a place to
              answer.
            </p>
            <p>
              The work is simple: choose the habit, complete what is true, and
              come back when comfort asks you to forget.
            </p>
          </div>
        </section>

        <section id="plans" className="section plans-section">
          <div className="section-heading">
            <p className="eyebrow">Free vs Pro</p>
            <h2>Start with restraint. Expand with intent.</h2>
          </div>
          <div className="plans-grid">
            <article className="plan-card">
              <p className="plan-label">Free</p>
              <h3>One habit, clearly held.</h3>
              <p className="price">1 habit / 24 hrs</p>
              <ul>
                <li>Daily completion</li>
                <li>30-day progress</li>
                <li>Account-based saving</li>
              </ul>
            </article>

            <article className="plan-card pro-card">
              <p className="plan-label">Pro</p>
              <h3>The fuller covenant.</h3>
              <p className="price">$1.99 USD / month</p>
              <ul>
                <li>Multiple habits</li>
                <li>Full history</li>
                <li>Night sessions</li>
                <li>Deeper confrontations</li>
                <li>Extended progress</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="section mockup-section">
          <div className="section-heading">
            <p className="eyebrow">Screens</p>
            <h2>Built for focus after the noise ends.</h2>
          </div>
          <div className="mockup-grid">
            <div className="phone-frame tall">
              <Image
                src="/images/covenant-habit-bg.png"
                alt="Covenant habit screen preview"
                fill
                sizes="(max-width: 760px) 90vw, 360px"
              />
              <div className="phone-copy">
                <span>REAL PROGRESS</span>
                <strong>Day 01 / 30</strong>
              </div>
            </div>
            <div className="phone-frame">
              <Image
                src="/images/covenant-deeper-bg.png"
                alt="Covenant deeper confrontation preview"
                fill
                sizes="(max-width: 760px) 90vw, 360px"
              />
              <div className="phone-copy">
                <span>DEEPER</span>
                <strong>Confront what repeats.</strong>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="section faq-section">
          <div className="section-heading">
            <p className="eyebrow">FAQ</p>
            <h2>Before launch.</h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq) => (
              <TrackedDetails
                answer={faq.answer}
                key={faq.question}
                question={faq.question}
              />
            ))}
          </div>
        </section>

        <section id="download" className="section download-section">
          <div>
            <p className="eyebrow">Download</p>
            <h2>Coming soon on iOS and Android.</h2>
            <p>
              Join the beta list and be notified when Covenant opens for early
              users.
            </p>
          </div>
          <div className="store-actions">
            <TrackedButton
              eventName="app_store_button_clicked"
              eventProperties={{
                location: "download_section",
              }}
            >
              App Store — Coming soon
            </TrackedButton>
            <TrackedButton
              eventName="google_play_button_clicked"
              eventProperties={{
                location: "download_section",
              }}
            >
              Google Play — Coming soon
            </TrackedButton>
            <TrackedLink
              eventName="join_beta_clicked"
              eventProperties={{
                location: "download_section",
              }}
              href="mailto:support@joincovenantapp.com?subject=Covenant%20beta"
            >
              Join the beta
            </TrackedLink>
          </div>
        </section>

        <section className="section origin-section">
          <div className="origin-inner">
            <p className="eyebrow">Why Covenant exists</p>
            <h2>Visible change begins in a place no one can see.</h2>
            <div className="origin-line" />
            <p>
              Covenant exists for the quiet work beneath the surface: the
              discipline to tell the truth, the patience to rebuild character,
              and the strength to let the inner order become visible through
              the body, the mind, and the life one constructs.
            </p>
          </div>
        </section>

        <section id="support" className="section support-section">
          <p className="eyebrow">Support</p>
          <h2>Questions should not become friction.</h2>
          <p>
            For account help, password reset issues, beta access, or launch
            questions, contact{" "}
            <a href="mailto:support@joincovenantapp.com">
              support@joincovenantapp.com
            </a>
            .
          </p>
        </section>
      </main>

      <footer className="site-footer">
        <Link className="footer-brand" href="/">
          COVENANT
        </Link>
        <div className="footer-links">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Use</Link>
          <Link href="/support">Support</Link>
          <a href="mailto:support@joincovenantapp.com">
            support@joincovenantapp.com
          </a>
        </div>
        <p className="footer-credit">Created by Jeremy Ávalos</p>
      </footer>
    </>
  );
}
