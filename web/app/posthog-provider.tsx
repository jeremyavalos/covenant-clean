"use client";

import posthogClient from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

const posthogKey =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ||
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let posthogInitialized = false;

function initPostHog() {
  if (!posthogKey || posthogInitialized) {
    return;
  }

  posthogClient.init(posthogKey, {
    api_host: posthogHost,
    capture_pageview: false,
    capture_pageleave: true,
    loaded: () => {
      posthogInitialized = true;
    },
  });
}

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initPostHog();

    if (!posthogKey) {
      return;
    }

    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;

    posthogClient.capture("$pageview", {
      $current_url: window.location.href,
      path,
    });
  }, [pathname, searchParams]);

  return null;
}

export function captureWebEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  initPostHog();

  if (!posthogKey) {
    return;
  }

  posthogClient.capture(eventName, properties);
}

export default function PostHogProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </>
  );
}
