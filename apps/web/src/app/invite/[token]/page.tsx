"use client";

import {
  Alert,
  Badge,
  Button,
  Container,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from "@paadel/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  apiFetch,
  type InvitePreviewResponse,
  type MatchResponse,
} from "../../../lib/api";
import { authClient } from "../../../lib/auth-client";

function formatWhen(value: string | Date | null | undefined) {
  if (!value) {
    return "Time TBD";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const previewQuery = useQuery({
    queryFn: () => apiFetch<InvitePreviewResponse>(`/invites/${token}`),
    queryKey: ["invite-preview", token],
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: () =>
      apiFetch<MatchResponse>(`/invites/${token}/accept`, { method: "POST" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["matches"] });
      router.push("/app?view=matches");
    },
  });

  const declineMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ data: { status: string } }>(`/invites/${token}/decline`, {
        method: "POST",
      }),
    onSuccess: () => {
      router.push("/app");
    },
  });

  const loginHref = `/login?next=${encodeURIComponent(`/invite/${token}`)}`;

  return (
    <Container py="xl" size="sm">
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>Match invite</Title>
          {session ? (
            <Button
              onClick={() => authClient.signOut()}
              size="xs"
              variant="subtle"
            >
              Sign out
            </Button>
          ) : (
            <Text component={Link} href={loginHref} size="sm">
              Log in
            </Text>
          )}
        </Group>

        {previewQuery.isLoading ? (
          <Stack align="center" py="xl">
            <Loader size="sm" />
            <Text c="dimmed" size="sm">
              Loading invite…
            </Text>
          </Stack>
        ) : null}

        {previewQuery.isError ? (
          <Alert color="red" title="Invite unavailable">
            This invite link is invalid or expired.
          </Alert>
        ) : null}

        {previewQuery.data ? (
          <Stack gap="lg">
            <Stack gap="xs">
              <Group gap="sm">
                <Title order={2}>{previewQuery.data.data.match.title}</Title>
                <Badge>{previewQuery.data.data.match.status}</Badge>
              </Group>
              <Text c="dimmed">
                {formatWhen(previewQuery.data.data.match.scheduledAt)}
              </Text>
              {previewQuery.data.data.match.locationLabel ? (
                <Text size="sm">
                  {previewQuery.data.data.match.locationLabel}
                </Text>
              ) : null}
            </Stack>

            <Text size="sm">
              {previewQuery.data.data.match.participantCount} /{" "}
              {previewQuery.data.data.match.maxPlayers} players joined
            </Text>

            {sessionPending ? (
              <Text c="dimmed" size="sm">
                Checking session…
              </Text>
            ) : null}

            {session || sessionPending ? null : (
              <Alert color="blue" title="Sign in to respond">
                <Stack gap="sm">
                  <Text size="sm">
                    Log in or create an account to accept this invite.
                  </Text>
                  <Group>
                    <Button component={Link} href={loginHref}>
                      Log in
                    </Button>
                    <Button
                      component={Link}
                      href={`/signup?next=${encodeURIComponent(`/invite/${token}`)}`}
                      variant="default"
                    >
                      Sign up
                    </Button>
                  </Group>
                </Stack>
              </Alert>
            )}

            {session && previewQuery.data.data.invite.status === "pending" ? (
              <Group>
                <Button
                  loading={acceptMutation.isPending}
                  onClick={() => acceptMutation.mutate()}
                >
                  Accept invite
                </Button>
                <Button
                  loading={declineMutation.isPending}
                  onClick={() => declineMutation.mutate()}
                  variant="default"
                >
                  Decline
                </Button>
              </Group>
            ) : null}

            {session && previewQuery.data.data.invite.status !== "pending" ? (
              <Alert
                color="blue"
                title={`Invite ${previewQuery.data.data.invite.status}`}
              >
                This invite is no longer pending.
              </Alert>
            ) : null}

            {(acceptMutation.error ?? declineMutation.error) ? (
              <Alert color="red" title="Action failed">
                {acceptMutation.error?.message ??
                  declineMutation.error?.message}
              </Alert>
            ) : null}

            {session ? (
              <Text component={Link} href="/app?view=matches" size="sm">
                Go to your matches
              </Text>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Container>
  );
}
