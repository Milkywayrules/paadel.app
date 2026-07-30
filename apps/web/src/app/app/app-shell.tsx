"use client";

import { skillBandHintSchema } from "@paadel/domain";
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  CopyButton,
  Group,
  Select,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@paadel/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { SessionGate } from "../../components/session-gate";
import {
  apiFetch,
  buildInviteUrl,
  type InviteCreateResponse,
  type MatchListResponse,
  type MatchResponse,
} from "../../lib/api";
import { authClient } from "../../lib/auth-client";

const viewOptions = ["home", "matches", "create"] as const;

const skillOptions = skillBandHintSchema.options.map((value) => ({
  label: value.charAt(0).toUpperCase() + value.slice(1),
  value,
}));

function formatWhen(value: string | Date | null | undefined) {
  if (!value) {
    return "Time TBD";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function MatchesPanel() {
  const queryClient = useQueryClient();
  const matchesQuery = useQuery({
    queryFn: () => apiFetch<MatchListResponse>("/matches"),
    queryKey: ["matches"],
  });

  const inviteMutation = useMutation({
    mutationFn: (matchId: string) =>
      apiFetch<InviteCreateResponse>(`/matches/${matchId}/invites`, {
        method: "POST",
      }),
  });

  const completeMutation = useMutation({
    mutationFn: (matchId: string) =>
      apiFetch<MatchResponse>(`/matches/${matchId}/complete`, {
        method: "POST",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });

  const [copiedMatchId, setCopiedMatchId] = useState<string | null>(null);

  if (matchesQuery.isLoading) {
    return <Text size="sm">Loading matches…</Text>;
  }

  if (matchesQuery.isError) {
    return (
      <Alert color="red" title="Could not load matches">
        {matchesQuery.error.message}
      </Alert>
    );
  }

  const matches = matchesQuery.data?.data ?? [];

  if (matches.length === 0) {
    return (
      <Stack gap="sm">
        <Text c="dimmed">
          No matches yet. Create one and share the invite link.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {matches.map((match) => {
        const inviteUrl =
          copiedMatchId === match.id && inviteMutation.data
            ? buildInviteUrl(inviteMutation.data.data.token)
            : null;

        return (
          <Card key={match.id} padding="md" radius="md" withBorder>
            <Stack gap="sm">
              <Group justify="space-between">
                <Group gap="sm">
                  <Text fw={600}>{match.title}</Text>
                  <Badge>{match.status}</Badge>
                </Group>
                <Text c="dimmed" size="sm">
                  {match.participantCount}/{match.maxPlayers} players
                </Text>
              </Group>

              <Text c="dimmed" size="sm">
                {formatWhen(match.scheduledAt)}
                {match.locationLabel ? ` · ${match.locationLabel}` : ""}
              </Text>

              {match.participants.length > 0 ? (
                <Text size="sm">
                  {match.participants.map((p) => p.displayName).join(", ")}
                </Text>
              ) : null}

              <Group>
                <Button
                  loading={
                    inviteMutation.isPending &&
                    inviteMutation.variables === match.id
                  }
                  onClick={async () => {
                    const result = await inviteMutation.mutateAsync(match.id);
                    setCopiedMatchId(match.id);
                    const url = buildInviteUrl(result.data.token);
                    await navigator.clipboard.writeText(url);
                  }}
                  size="xs"
                  variant="light"
                >
                  Copy invite link
                </Button>

                {inviteUrl ? (
                  <CopyButton timeout={2000} value={inviteUrl}>
                    {({ copied, copy }) => (
                      <Button onClick={copy} size="xs" variant="subtle">
                        {copied ? "Copied" : "Copy again"}
                      </Button>
                    )}
                  </CopyButton>
                ) : null}

                {match.status === "completed" ? null : (
                  <Button
                    loading={
                      completeMutation.isPending &&
                      completeMutation.variables === match.id
                    }
                    onClick={() => completeMutation.mutate(match.id)}
                    size="xs"
                    variant="default"
                  >
                    Mark played
                  </Button>
                )}
              </Group>
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}

function CreateMatchPanel({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [skillBandHint, setSkillBandHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<MatchResponse>("/matches", {
        body: JSON.stringify({
          locationLabel: locationLabel || undefined,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
          skillBandHint: skillBandHint ?? undefined,
          title,
        }),
        method: "POST",
      }),
    onError: (mutationError) => {
      setError(mutationError.message);
    },
    onSuccess: () => {
      setTitle("");
      setScheduledAt("");
      setLocationLabel("");
      setSkillBandHint(null);
      setError(null);
      onCreated();
    },
  });

  return (
    <Stack gap="md">
      {error ? (
        <Alert color="red" title="Could not create match">
          {error}
        </Alert>
      ) : null}

      <TextInput
        label="Match title"
        onChange={(event) => setTitle(event.currentTarget.value)}
        placeholder="Saturday morning doubles"
        required
        value={title}
      />
      <TextInput
        label="When"
        onChange={(event) => setScheduledAt(event.currentTarget.value)}
        type="datetime-local"
        value={scheduledAt}
      />
      <Textarea
        label="Location"
        onChange={(event) => setLocationLabel(event.currentTarget.value)}
        placeholder="Court 3, XYZ Club"
        value={locationLabel}
      />
      <Select
        clearable
        data={skillOptions}
        label="Skill hint (optional)"
        onChange={setSkillBandHint}
        value={skillBandHint}
      />

      <Button
        disabled={!title.trim()}
        loading={createMutation.isPending}
        onClick={() => createMutation.mutate()}
      >
        Create match
      </Button>
    </Stack>
  );
}

function AppShellContent() {
  const { data: session } = authClient.useSession();
  const [view, setView] = useQueryState(
    "view",
    parseAsStringLiteral(viewOptions).withDefault("matches")
  );
  const queryClient = useQueryClient();

  const handleTabChange = useCallback(
    (value: string | null) => {
      if (value === "home" || value === "matches" || value === "create") {
        setView(value).catch(() => undefined);
      }
    },
    [setView]
  );

  const userLabel = useMemo(
    () => session?.user.name ?? session?.user.email ?? "Player",
    [session]
  );

  return (
    <Container py="xl" size="md">
      <Stack gap="lg">
        <Group justify="space-between">
          <Stack gap={4}>
            <Title order={2}>Paadel</Title>
            <Text c="dimmed" size="sm">
              Signed in as {userLabel}
            </Text>
          </Stack>
          <Group gap="sm">
            <Text component={Link} href="/" size="sm">
              Home
            </Text>
            <Button
              onClick={() => authClient.signOut()}
              size="xs"
              variant="subtle"
            >
              Sign out
            </Button>
          </Group>
        </Group>

        <Tabs onChange={handleTabChange} value={view}>
          <Tabs.List>
            <Tabs.Tab value="matches">Matches</Tabs.Tab>
            <Tabs.Tab value="create">Create</Tabs.Tab>
            <Tabs.Tab value="home">About</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel pt="md" value="home">
            <Stack gap="sm">
              <Text>
                MVP1: create a casual padel match, copy an invite link, and
                track who joined. After you play, mark the match as completed.
              </Text>
              <Text c="dimmed" size="sm">
                Real-world flow: create match → WhatsApp the link → friends
                accept → play → mark played.
              </Text>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="matches">
            <MatchesPanel />
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="create">
            <CreateMatchPanel
              onCreated={async () => {
                await queryClient.invalidateQueries({ queryKey: ["matches"] });
                await setView("matches");
              }}
            />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}

export function AppShell() {
  return (
    <SessionGate>
      <AppShellContent />
    </SessionGate>
  );
}
