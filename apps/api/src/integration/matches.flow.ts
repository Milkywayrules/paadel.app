import { beforeEach, describe, expect, test } from "bun:test";
import { db, invites } from "@paadel/db";
import { eq } from "drizzle-orm";
import { createApp } from "../app.js";
import {
  apiRequest,
  listAuditActions,
  resetDb,
  signupUser,
} from "../test/helpers.js";

const app = createApp();

describe("match invite API integration", () => {
  beforeEach(async () => {
    await resetDb();
  });

  test("create → invite → preview → accept → list happy path", async () => {
    const host = await signupUser(app, {
      email: "host@integration.test",
      name: "Host Player",
      password: "password123",
    });
    const guest = await signupUser(app, {
      email: "guest@integration.test",
      name: "Guest Player",
      password: "password123",
    });

    const createResponse = await apiRequest<{
      data: {
        id: string;
        participants: Array<{ playerId: string; role: string }>;
        status: string;
        title: string;
      };
    }>(app, "/matches", {
      body: { title: "Friday doubles" },
      cookie: host.cookie,
      method: "POST",
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.json.data.title).toBe("Friday doubles");
    expect(createResponse.json.data.status).toBe("open");
    expect(createResponse.json.data.participants.length).toBe(1);
    expect(createResponse.json.data.participants[0]?.role).toBe("host");

    const matchId = createResponse.json.data.id;
    const matchAudit = await listAuditActions("match", matchId);
    expect(matchAudit).toContain("match.created");

    const inviteResponse = await apiRequest<{
      data: { token: string; inviteUrlPath: string };
    }>(app, `/matches/${matchId}/invites`, {
      cookie: host.cookie,
      method: "POST",
    });

    expect(inviteResponse.status).toBe(201);
    const inviteToken = inviteResponse.json.data.token;
    expect(inviteResponse.json.data.inviteUrlPath).toBe(
      `/invite/${inviteToken}`
    );

    const inviteRow = await db.query.invites.findFirst({
      where: eq(invites.token, inviteToken),
    });
    expect(inviteRow).toBeTruthy();
    const inviteId = inviteRow?.id;
    if (!inviteId) {
      throw new Error("invite row missing after create");
    }
    const inviteAudit = await listAuditActions("invite", inviteId);
    expect(inviteAudit).toContain("invite.sent");

    const previewResponse = await apiRequest<{
      data: { match: { id: string } };
    }>(app, `/invites/${inviteToken}`);
    expect(previewResponse.status).toBe(200);
    expect(previewResponse.json.data.match.id).toBe(matchId);

    const acceptResponse = await apiRequest<{
      data: {
        id: string;
        participantCount: number;
        participants: Array<{ playerId: string }>;
        status: string;
      };
    }>(app, `/invites/${inviteToken}/accept`, {
      cookie: guest.cookie,
      method: "POST",
    });

    expect(acceptResponse.status).toBe(200);
    expect(acceptResponse.json.data.participantCount).toBe(2);
    expect(acceptResponse.json.data.participants.length).toBe(2);

    const postAcceptMatchAudit = await listAuditActions("match", matchId);
    expect(postAcceptMatchAudit).toContain("player.joined");

    const postAcceptInviteAudit = await listAuditActions("invite", inviteId);
    expect(postAcceptInviteAudit).toContain("invite.accepted");

    const guestListResponse = await apiRequest<{
      data: Array<{ id: string }>;
    }>(app, "/matches", {
      cookie: guest.cookie,
    });
    expect(guestListResponse.status).toBe(200);
    expect(
      guestListResponse.json.data.some((match) => match.id === matchId)
    ).toBe(true);

    const hostListResponse = await apiRequest<{
      data: Array<{ id: string; participants: Array<{ playerId: string }> }>;
    }>(app, "/matches", {
      cookie: host.cookie,
    });
    expect(hostListResponse.status).toBe(200);
    const listedMatch = hostListResponse.json.data.find(
      (match) => match.id === matchId
    );
    expect(listedMatch).toBeTruthy();
    expect(listedMatch?.participants.length).toBe(2);
  });

  test("returns 401 for unauthenticated list", async () => {
    const response = await apiRequest<{ error: string }>(app, "/matches");
    expect(response.status).toBe(401);
    expect(response.json.error).toBe("Unauthorized");
  });

  test("returns 403 when non-host creates invite", async () => {
    const host = await signupUser(app, {
      email: "host403@integration.test",
      name: "Host 403",
      password: "password123",
    });
    const guest = await signupUser(app, {
      email: "guest403@integration.test",
      name: "Guest 403",
      password: "password123",
    });

    const createResponse = await apiRequest<{ data: { id: string } }>(
      app,
      "/matches",
      {
        body: { title: "Host only invites" },
        cookie: host.cookie,
        method: "POST",
      }
    );
    const matchId = createResponse.json.data.id;

    const inviteResponse = await apiRequest<{ error: string }>(
      app,
      `/matches/${matchId}/invites`,
      {
        cookie: guest.cookie,
        method: "POST",
      }
    );

    expect(inviteResponse.status).toBe(403);
    expect(inviteResponse.json.error).toBe("Only the host can create invites");
  });

  test("returns 410 for expired invite accept", async () => {
    const host = await signupUser(app, {
      email: "host410@integration.test",
      name: "Host 410",
      password: "password123",
    });
    const guest = await signupUser(app, {
      email: "guest410@integration.test",
      name: "Guest 410",
      password: "password123",
    });

    const createResponse = await apiRequest<{ data: { id: string } }>(
      app,
      "/matches",
      {
        body: { title: "Expired invite" },
        cookie: host.cookie,
        method: "POST",
      }
    );
    const matchId = createResponse.json.data.id;

    const inviteResponse = await apiRequest<{ data: { token: string } }>(
      app,
      `/matches/${matchId}/invites`,
      {
        cookie: host.cookie,
        method: "POST",
      }
    );
    const inviteToken = inviteResponse.json.data.token;

    await db
      .update(invites)
      .set({ expiresAt: new Date(Date.now() - 60_000) })
      .where(eq(invites.token, inviteToken));

    const previewResponse = await apiRequest<{ error: string }>(
      app,
      `/invites/${inviteToken}`
    );
    expect(previewResponse.status).toBe(410);
    expect(previewResponse.json.error).toBe("Invite expired");

    const acceptResponse = await apiRequest<{ error: string }>(
      app,
      `/invites/${inviteToken}/accept`,
      {
        cookie: guest.cookie,
        method: "POST",
      }
    );

    expect(acceptResponse.status).toBe(410);
    expect(acceptResponse.json.error).toBe("Invite expired");
  });

  test("returns 409 when match is full", async () => {
    const host = await signupUser(app, {
      email: "host409@integration.test",
      name: "Host 409",
      password: "password123",
    });
    const guestOne = await signupUser(app, {
      email: "guest409a@integration.test",
      name: "Guest 409a",
      password: "password123",
    });
    const guestTwo = await signupUser(app, {
      email: "guest409b@integration.test",
      name: "Guest 409b",
      password: "password123",
    });

    const createResponse = await apiRequest<{ data: { id: string } }>(
      app,
      "/matches",
      {
        body: { maxPlayers: 2, title: "Two player cap" },
        cookie: host.cookie,
        method: "POST",
      }
    );
    const matchId = createResponse.json.data.id;

    const inviteOne = await apiRequest<{ data: { token: string } }>(
      app,
      `/matches/${matchId}/invites`,
      {
        cookie: host.cookie,
        method: "POST",
      }
    );
    const inviteTwo = await apiRequest<{ data: { token: string } }>(
      app,
      `/matches/${matchId}/invites`,
      {
        cookie: host.cookie,
        method: "POST",
      }
    );

    const firstAccept = await apiRequest<{
      data: { participantCount: number };
    }>(app, `/invites/${inviteOne.json.data.token}/accept`, {
      cookie: guestOne.cookie,
      method: "POST",
    });
    expect(firstAccept.status).toBe(200);
    expect(firstAccept.json.data.participantCount).toBe(2);

    const secondAccept = await apiRequest<{ error: string }>(
      app,
      `/invites/${inviteTwo.json.data.token}/accept`,
      {
        cookie: guestTwo.cookie,
        method: "POST",
      }
    );

    expect(secondAccept.status).toBe(409);
    expect(secondAccept.json.error).toBe("Match is full");
  });

  test("returns 409 when invite already accepted", async () => {
    const host = await signupUser(app, {
      email: "host409dup@integration.test",
      name: "Host 409dup",
      password: "password123",
    });
    const guest = await signupUser(app, {
      email: "guest409dup@integration.test",
      name: "Guest 409dup",
      password: "password123",
    });

    const createResponse = await apiRequest<{ data: { id: string } }>(
      app,
      "/matches",
      {
        body: { title: "Double accept" },
        cookie: host.cookie,
        method: "POST",
      }
    );
    const matchId = createResponse.json.data.id;

    const inviteResponse = await apiRequest<{ data: { token: string } }>(
      app,
      `/matches/${matchId}/invites`,
      {
        cookie: host.cookie,
        method: "POST",
      }
    );
    const inviteToken = inviteResponse.json.data.token;

    const firstAccept = await apiRequest(
      app,
      `/invites/${inviteToken}/accept`,
      {
        cookie: guest.cookie,
        method: "POST",
      }
    );
    expect(firstAccept.status).toBe(200);

    const secondAccept = await apiRequest<{ error: string }>(
      app,
      `/invites/${inviteToken}/accept`,
      {
        cookie: guest.cookie,
        method: "POST",
      }
    );

    expect(secondAccept.status).toBe(409);
    expect(secondAccept.json.error).toBe("Invite already accepted");
  });
});
