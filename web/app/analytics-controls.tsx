"use client";

import { MouseEvent, ReactNode, SyntheticEvent, useState } from "react";
import { captureWebEvent } from "./posthog-provider";

type TrackedLinkProps = {
  children: ReactNode;
  className?: string;
  eventName: string;
  eventProperties?: Record<string, unknown>;
  href: string;
};

export function TrackedLink({
  children,
  className,
  eventName,
  eventProperties,
  href,
}: TrackedLinkProps) {
  function handleClick() {
    captureWebEvent(eventName, {
      href,
      ...eventProperties,
    });
  }

  return (
    <a className={className} href={href} onClick={handleClick}>
      {children}
    </a>
  );
}

type TrackedButtonProps = {
  children: ReactNode;
  eventName: string;
  eventProperties?: Record<string, unknown>;
};

export function TrackedButton({
  children,
  eventName,
  eventProperties,
}: TrackedButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.currentTarget.blur();
    captureWebEvent(eventName, eventProperties);
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
}

type TrackedDetailsProps = {
  answer: string;
  question: string;
};

export function TrackedDetails({ answer, question }: TrackedDetailsProps) {
  const [hasOpened, setHasOpened] = useState(false);

  function handleToggle(event: SyntheticEvent<HTMLDetailsElement>) {
    if (event.currentTarget.open && !hasOpened) {
      setHasOpened(true);
      captureWebEvent("faq_opened", {
        question,
      });
    }
  }

  return (
    <details onToggle={handleToggle}>
      <summary>{question}</summary>
      <p>{answer}</p>
    </details>
  );
}
