"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/states";

// Route-level error boundary. Renders inside the root layout, so the i18n
// provider and the persistent Call 998 bar remain available.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // surface for debugging; replace with real telemetry in production
    console.error(error);
  }, [error]);
  return (
    <div className="pt-8">
      <ErrorState onRetry={reset} />
    </div>
  );
}
