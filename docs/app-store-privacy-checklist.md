# Covenant App Store Privacy Checklist

Use this as the working privacy declaration before App Store Connect and Google Play submission.

## Data Collected

- Email address: used for account registration, login, verification emails, password reset, and support lookup.
- Authentication data: used to keep the user signed in and protect account access.
- Habit progress: completed days, streaks, selected habit, completion dates, sessions, and progress totals. Used to save and sync the user's Covenant progress.
- Subscription status: used to determine Free vs Covenant Pro access.
- Purchase identifiers and subscription events: handled by Apple/Google and RevenueCat to manage purchases, renewals, entitlement status, and restore purchases.
- Device/app diagnostics from analytics: used to understand app usage, debug issues, and improve the experience.
- Support messages: used only to respond to user support requests.

## Data Use

- App functionality: account access, email verification, password reset, progress sync, subscription access, and restore purchases.
- Analytics: product usage patterns and app improvement.
- Customer support: resolving login, purchase, billing, beta, or app issues.

## Data Processors / Services

- Railway backend: stores account and progress data required for the app.
- RevenueCat: manages subscription entitlement status and purchase restoration.
- Apple App Store / Google Play Billing: processes in-app purchases and subscriptions.
- Email provider used by the backend: sends verification and password reset emails.
- PostHog: product analytics.

## App Store Privacy Notes

- The app requires account login.
- The app does not include a public social feed.
- The app does not sell user data.
- The app uses subscriptions for Covenant Pro.
- Habit progress is linked to the user's account so it can persist across login sessions.
- Subscription data is linked to the user for entitlement management.
- Analytics should be declared according to the final PostHog event configuration.

## Review Before Submission

- Confirm the public Privacy Policy page is live.
- Confirm the public Support page is live.
- Confirm Terms of Use references Apple's Standard EULA.
- Confirm App Store Connect privacy answers match actual backend, RevenueCat, and analytics behavior.
- Confirm Google Play Data Safety answers match the same data model.
