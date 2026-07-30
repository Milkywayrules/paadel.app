"use client";

import { Button, Container, Stack, Text, Title } from "@paadel/ui";
import Link from "next/link";

export default function HomePage() {
  return (
    <Container py="xl" size="sm">
      <Stack align="center" gap="md">
        <Title order={1}>Paadel</Title>
        <Text c="dimmed" ta="center">
          Create casual padel matches, share invite links, and track who joined.
        </Text>
        <Button component={Link} href="/app">
          Open app
        </Button>
        <Text c="dimmed" size="sm">
          MVP1 — players only. No court booking yet.
        </Text>
      </Stack>
    </Container>
  );
}
