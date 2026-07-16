"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if ("serviceWorker" in navigator) {
      // Drop any stale service worker from a previous deployment so it can't
      // serve mismatched cached JS chunks that crash the app.
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          void registration.unregister();
        }
      });
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  if (!mounted) {
    return <main className="min-h-screen bg-[#f7fbff]" aria-label="Loading Math Quest Kids" />;
  }

  return <AppShell />;
}
