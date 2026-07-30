"use client";

import { Button, Container, Stack, Text, Title } from "@paadel/ui";
import Link from "next/link";

export default function HomePage() {
  return (
    <Container py="xl" size="sm">
      <Stack align="center" gap="md">
        <Title order={1}>Paadel</Title>
        <Text c="dimmed" ta="center">
          Casual padel match management for players. MVP1 is on the way.
        </Text>
        <Text fw={600}>Coming soon</Text>
        <Button component={Link} href="/app">
          Open app shell
        </Button>
      </Stack>
    </Container>
  );
}
