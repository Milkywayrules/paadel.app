"use client";

import { clientEnv } from "@paadel/env/client";
import { Container, Group, Stack, Tabs, Text, Title } from "@paadel/ui";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useCallback } from "react";

const viewOptions = ["home", "matches"] as const;

async function fetchHealth() {
  const response = await fetch(`${clientEnv.NEXT_PUBLIC_API_URL}/health`);
  if (!response.ok) {
    throw new Error("API health check failed");
  }
  return response.json() as Promise<{
    status: string;
    service: string;
    timestamp: string;
  }>;
}

export function AppShell() {
  const [view, setView] = useQueryState(
    "view",
    parseAsStringLiteral(viewOptions).withDefault("home")
  );

  const healthQuery = useQuery({
    queryFn: fetchHealth,
    queryKey: ["api-health"],
    retry: 1,
  });

  const handleTabChange = useCallback(
    (value: string | null) => {
      if (value === "home" || value === "matches") {
        setView(value).catch(() => undefined);
      }
    },
    [setView]
  );

  return (
    <Container py="xl" size="md">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>Paadel App</Title>
          <Text component={Link} href="/" size="sm">
            Back
          </Text>
        </Group>

        <Text c="dimmed">
          Client-first shell with Mantine, TanStack Query, and nuqs URL state.
        </Text>

        <Tabs onChange={handleTabChange} value={view}>
          <Tabs.List>
            <Tabs.Tab value="home">Home</Tabs.Tab>
            <Tabs.Tab value="matches">Matches</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel pt="md" value="home">
            <Stack gap="xs">
              <Text fw={600}>API health</Text>
              {healthQuery.isLoading ? (
                <Text size="sm">Checking API…</Text>
              ) : null}
              {healthQuery.isError ? (
                <Text c="red" size="sm">
                  API unreachable — start `apps/api` and docker-compose
                  services.
                </Text>
              ) : null}
              {healthQuery.data ? (
                <Text size="sm">
                  {healthQuery.data.service}: {healthQuery.data.status} (
                  {healthQuery.data.timestamp})
                </Text>
              ) : null}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="matches">
            <Text>Matches view placeholder — wired to Elysia in MVP1.</Text>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
