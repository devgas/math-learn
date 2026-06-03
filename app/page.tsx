"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  if (!mounted) {
    return <main className="min-h-screen bg-[#f7fbff]" aria-label="Loading Math Quest Kids" />;
  }

  return <AppShell />;
}
