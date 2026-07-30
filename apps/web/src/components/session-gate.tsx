"use client";

import { Loader, Stack, Text } from "@paadel/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "../lib/auth-client";

export function SessionGate({
  children,
  redirectTo,
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending || session) {
      return;
    }

    const next =
      redirectTo ??
      (typeof window === "undefined"
        ? "/app"
        : `${window.location.pathname}${window.location.search}`);

    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [isPending, redirectTo, router, session]);

  if (isPending) {
    return (
      <Stack align="center" gap="sm" py="xl">
        <Loader size="sm" />
        <Text c="dimmed" size="sm">
          Checking session…
        </Text>
      </Stack>
    );
  }

  if (!session) {
    return (
      <Stack align="center" gap="sm" py="xl">
        <Loader size="sm" />
        <Text c="dimmed" size="sm">
          Redirecting to login…
        </Text>
      </Stack>
    );
  }

  return children;
}
