# Covenant App Store Submission Checklist

## Screenshots Needed

- Welcome / Covenant opening screen
- Login or registration screen
- Habit selection screen
- Free habit choice state
- Daily habit screen with progress
- Completed habit state
- Deeper reflection screen
- Covenant Pro paywall showing $1.99/month and subscription wording

Prepare screenshots for the required App Store and Google Play device sizes before submission.

## App Icon Status

- App icon configured in `app.json`: `./assets/images/icon.png`
- iOS icon configured in `app.json`: `./assets/images/icon.png`
- Android adaptive icon foreground: `./assets/images/android-icon-foreground.png`
- Android adaptive icon background: `./assets/images/android-icon-background.png`
- Android monochrome icon: `./assets/images/android-icon-monochrome.png`
- Web favicon: `./assets/images/favicon.png`

## Metadata Checklist

- App name: Covenant
- Subtitle / short description: Become honest with yourself. One habit at a time.
- Category: Health & Fitness
- Secondary category: Lifestyle
- Age rating completed
- Privacy Policy URL verified live
- Support URL verified live
- Terms of Use / EULA verified
- Subscription name: Covenant Pro
- Subscription duration: Monthly
- Subscription price: $1.99/month
- Subscription wording says auto-renewing monthly subscription
- Review notes prepared

## Category Suggestions

- Primary category: Health & Fitness
- Secondary category: Lifestyle

## Apple Reviewer Notes

Suggested reviewer note:

Covenant is a habit and discipline app. Users create an account, verify email, choose a habit, complete daily habit sessions, and track 30-day progress. Free users can use 1 habit every 24 hours. Covenant Pro is an auto-renewing monthly subscription at $1.99/month that unlocks additional habits, deeper sessions, full history, and extended progress. Purchases are managed through RevenueCat and Apple in-app purchase. The app includes links to Privacy Policy, Terms of Use using Apple's Standard EULA, Support, and Restore Purchases.

Include a test account only if Apple review cannot create one during review. Do not include private credentials in this repository.

## Final Build Checks

- `app.json` version and build numbers are correct.
- `eas.json` production Android build creates AAB.
- iOS production build is ready for TestFlight/App Review.
- RevenueCat products and entitlements match store products.
- Subscription product is approved or ready for review with the app.
- Paywall price matches App Store Connect and Google Play Console.
- Privacy labels / Data Safety answers match the app behavior.
