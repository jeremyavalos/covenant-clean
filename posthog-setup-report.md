<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Covenant Expo app. Here's what was done:

**New files created:**
- `app.config.js` — Dynamic Expo config (replaces static `app.json` at build time) that reads `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` from `.env` and exposes them via `expo-constants`.
- `config/posthog.ts` — PostHog client singleton configured with lifecycle capture, batching, and feature flags. Gracefully disables itself if no token is set.
- `.env` — Created with `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` (covered by `.gitignore`).

**Modified files:**
- `app/_layout.tsx` — Added `PostHogProvider` wrapping the `Stack` navigator, manual screen tracking via `posthog.screen()` on pathname changes, user identification by numeric ID on login, and `user_signed_out` + `posthog.reset()` on logout.
- `app/habits.tsx` — Added `habit_opened`, `paywall_shown`, `subscription_started`, and `$exception` capture on subscription errors.
- `app/habit/[habit].tsx` — Added `habit_completed` (with streak/progress metadata) and `deeper_entered` capture.

**Note on auth.tsx:** PostHog calls were intentionally kept out of `auth.tsx` because it handles email/password fields. Sign-in identification and `user_signed_in` events are fired from `_layout.tsx` by watching the auth token state — this keeps PII off event properties entirely.

| Event | Description | File |
|-------|-------------|------|
| `user_signed_in` | User successfully logs into Covenant | `app/_layout.tsx` |
| `user_signed_out` | User logs out from the app | `app/_layout.tsx` |
| `habit_opened` | User opens a habit session screen | `app/habits.tsx` |
| `paywall_shown` | Paywall modal shown to a non-Pro user | `app/habits.tsx` |
| `subscription_started` | User completes a Covenant Pro purchase | `app/habits.tsx` |
| `habit_completed` | User marks a habit session as done for the day | `app/habit/[habit].tsx` |
| `deeper_entered` | User navigates to the deep reading section | `app/habit/[habit].tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1581436)
- [Daily Active Users (Sign-ins)](/insights/RK2ToBNo) — Unique daily active users signing in (line chart, last 30 days)
- [New Registrations](/insights/AdC0qT1j) — Total new registrations per day (bar chart, last 30 days)
- [Habit Completions Over Time](/insights/0vs9L9LO) — Total habit sessions completed per day (line chart, last 30 days)
- [Sign-in → Habit Completion Funnel](/insights/hkf2cuoF) — Conversion: signed in → habit opened → habit completed
- [Paywall → Subscription Conversion](/insights/erA8zPjg) — Conversion: paywall shown → subscription started

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
