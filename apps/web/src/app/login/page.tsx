"use client";

import { clientEnv } from "@paadel/env/client";
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/app";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await authClient.signIn.email({
      email,
      password,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message ?? "Sign in failed");
      return;
    }

    router.replace(next);
  }

  async function handleGitHub() {
    setError(null);
    await authClient.signIn.social({
      callbackURL: next,
      provider: "github",
    });
  }

  return (
    <Container py="xl" size="xs">
      <Stack gap="lg">
        <Stack gap="xs">
          <Title order={2}>Log in</Title>
          <Text c="dimmed" size="sm">
            Sign in to create matches and accept invites.
          </Text>
        </Stack>

        {error ? (
          <Alert color="red" title="Could not sign in">
            {error}
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              autoComplete="email"
              label="Email"
              onChange={(event) => setEmail(event.currentTarget.value)}
              required
              type="email"
              value={email}
            />
            <PasswordInput
              autoComplete="current-password"
              label="Password"
              onChange={(event) => setPassword(event.currentTarget.value)}
              required
              value={password}
            />
            <Button loading={loading} type="submit">
              Log in
            </Button>
          </Stack>
        </form>

        {clientEnv.NEXT_PUBLIC_OAUTH_GITHUB_ENABLED ? (
          <Button onClick={handleGitHub} variant="default">
            Continue with GitHub
          </Button>
        ) : null}

        <Text size="sm">
          No account?{" "}
          <Text
            component={Link}
            href={`/signup?next=${encodeURIComponent(next)}`}
            span
          >
            Sign up
          </Text>
        </Text>
      </Stack>
    </Container>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Text p="xl">Loading…</Text>}>
      <LoginForm />
    </Suspense>
  );
}
