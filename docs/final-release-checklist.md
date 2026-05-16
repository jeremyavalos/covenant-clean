# Covenant Final Release Checklist

## Production Configuration

- [x] App name is `Covenant`.
- [x] Expo slug is `covenant-clean`.
- [x] URL scheme is `covenant`.
- [x] iOS bundle identifier is `com.joincovenantapp.covenant`.
- [x] Android package is `com.joincovenantapp.covenant`.
- [x] App version is `1.0.0`.
- [x] iOS build number is `1`.
- [x] Android version code is `2`.
- [x] Production Android EAS build uses `app-bundle`.
- [x] Production iOS EAS build is configured for device/TestFlight builds.
- [x] Production API fallback points to Railway, not localhost.

## Brand Assets

- [x] App icon uses the Covenant eclipse mark.
- [x] Splash screen uses the Covenant eclipse mark.
- [x] Android adaptive icon foreground/background/monochrome assets use the Covenant eclipse system.
- [x] Web and landing favicons use the Covenant eclipse mark.
- [x] Expo starter React logo assets were removed.

## Website / Legal Pages

- [x] Next website includes `/privacy`.
- [x] Next website includes `/terms`.
- [x] Next website includes `/support`.
- [x] Static landing includes `privacy.html`, `terms.html`, and `support.html`.
- [x] Static landing build copies all HTML legal pages into `dist`.
- [x] Footer includes subtle credit: `Created by Jeremy Ávalos`.
- [ ] Verify live production URLs after deployment:
  - `https://joincovenantapp.com/privacy`
  - `https://joincovenantapp.com/terms`
  - `https://joincovenantapp.com/support`

## In-App Compliance

- [x] Login/register screen includes tappable Privacy, Terms, and Support links.
- [x] Paywall includes tappable Privacy, Terms, and Support links.
- [x] Account/habits area includes tappable Privacy, Terms, and Support links.
- [x] Terms link points to Apple Standard EULA.
- [x] Restore Purchases is available from the paywall.
- [x] Paywall wording clearly says auto-renewing monthly subscription.
- [x] Paywall shows `$1.99 USD / month`.
- [x] iOS paywall says cancellation is available through Apple settings.
- [x] Android paywall uses platform-neutral app store subscription settings wording.

## Language QA

- [x] Language selection intentionally shows both Spanish and English.
- [x] After language selection, active app flow uses the saved language.
- [x] Old Spanish-only `home` route was removed.
- [ ] Device QA: choose English, complete register/login, paywall, habit, deeper, restore, logout/login and confirm no Spanish copy appears outside intentional bilingual language selection.

## Subscription Readiness

- [x] Free tier copy: 1 habit every 24 hours.
- [x] Pro tier copy: $1.99/month.
- [x] App paywall is monthly-only.
- [x] Annual plan UI was removed.
- [x] Purchase flow requests the monthly RevenueCat package.
- [x] Restore purchases flow calls RevenueCat restore.
- [ ] Confirm RevenueCat offering `default` has a monthly package.
- [ ] Confirm RevenueCat entitlement matches app entitlement IDs.
- [ ] Confirm App Store Connect subscription product is approved or submitted with the app.
- [ ] Confirm Google Play subscription product is active for closed testing.
- [ ] Replace local/test RevenueCat keys with production public SDK keys in EAS secrets if needed.

## Privacy / Data Declarations

- [x] Privacy checklist exists: `docs/app-store-privacy-checklist.md`.
- [x] Submission checklist exists: `docs/app-store-submission-checklist.md`.
- [ ] Complete App Store privacy labels using the privacy checklist.
- [ ] Complete Google Play Data Safety using the same data model.
- [ ] Confirm PostHog events match declared analytics data.

## Production QA

- [x] Dead Expo starter assets removed.
- [x] Unused legacy route/module files removed.
- [x] Debug `console.log` calls removed from active app code.
- [x] TypeScript check passes.
- [x] Expo lint passes cleanly.
- [x] Next web production build passes.
- [x] Static landing production build passes.
- [ ] Run a fresh EAS preview Android APK and smoke test on a physical Android device.
- [ ] Run a fresh TestFlight build and smoke test on a physical iPhone.
- [ ] Verify email verification and password reset emails from production.
- [ ] Verify purchase and restore in sandbox/TestFlight.
- [ ] Verify Android closed testing purchase and restore.
- [ ] Prepare App Store and Google Play screenshots.
- [ ] Provide Apple reviewer account only outside the repository if self-registration is not enough.

## Submission Commands

```bash
eas build --profile production --platform ios
eas submit --profile production --platform ios
eas build --profile production --platform android
eas submit --profile production --platform android
```
