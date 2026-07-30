"use client";

import {
  Alert,
  Button,
  Container,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@paadel/ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { authClient } from "../../lib/auth-client";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/app";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await authClient.signUp.email({
      email,
      name,
      password,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message ?? "Sign up failed");
      return;
    }

    router.replace(next);
  }

  return (
    <Container py="xl" size="xs">
      <Stack gap="lg">
        <Stack gap="xs">
          <Title order={2}>Sign up</Title>
          <Text c="dimmed" size="sm">
            Create a player account for casual match invites.
          </Text>
        </Stack>

        {error ? (
          <Alert color="red" title="Could not sign up">
            {error}
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Display name"
              onChange={(event) => setName(event.currentTarget.value)}
              required
              value={name}
            />
            <TextInput
              autoComplete="email"
              label="Email"
              onChange={(event) => setEmail(event.currentTarget.value)}
              required
              type="email"
              value={email}
            />
            <PasswordInput
              autoComplete="new-password"
              description="At least 8 characters"
              label="Password"
              onChange={(event) => setPassword(event.currentTarget.value)}
              required
              value={password}
            />
            <Button loading={loading} type="submit">
              Create account
            </Button>
          </Stack>
        </form>

        <Text size="sm">
          Already have an account?{" "}
          <Text
            component={Link}
            href={`/login?next=${encodeURIComponent(next)}`}
            span
          >
            Log in
          </Text>
        </Text>
      </Stack>
    </Container>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<Text p="xl">Loading…</Text>}>
      <SignupForm />
    </Suspense>
  );
}
