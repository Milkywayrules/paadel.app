"use client";

import { Suspense } from "react";
import { AppShell } from "./app-shell";

export default function AppRoutePage() {
  return (
    <Suspense fallback={<div>Loading app…</div>}>
      <AppShell />
    </Suspense>
  );
}
