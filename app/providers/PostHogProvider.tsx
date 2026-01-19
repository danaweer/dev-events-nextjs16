"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: true,
    });

    // 🔥 FORCE expose for debugging
    (window as any).posthog = posthog;

    console.log("PostHog initialized", posthog);
  }, []);

  return <>{children}</>;
}
