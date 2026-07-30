# MVP1 product brief — paadel.app

**Status:** accepted | **Generated:** 2026-07-30  
**Audience:** Players only (MVP1–2). Global English.

---

## Problem

Padel players waste time coordinating casual games in WhatsApp — tracking who confirmed, who cancelled, and what was played last week. Booking apps (Playtomic) help when clubs are onboarded but add payment/rating complexity and don't serve the simple "organize four friends" job.

## Solution (MVP1)

Authenticated players **create a casual match**, **invite others via shareable link**, **accept or decline**, and **view match history**.

## Core entities

### Player

- Authenticated user (Better Auth)
- Profile: display name, optional avatar, optional skill band
- Schema prep: `organizationId` nullable (no active org UX)

### Match

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | |
| hostPlayerId | FK Player | Creator |
| title | string? | Optional label |
| scheduledAt | datetime | |
| locationLabel | string? | Free text ("Court 3, XYZ Club") |
| status | enum | `draft`, `open`, `confirmed`, `completed`, `cancelled` |
| maxPlayers | int | Default 4 |
| skillBandHint | enum? | Optional filter hint |
| audit | createdAt, updatedAt, createdBy, updatedBy | Drizzle audit fields |

### Invite

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | |
| matchId | FK Match | |
| inviterPlayerId | FK Player | Usually host |
| inviteePlayerId | FK Player? | Null if link-only guest flow (MVP1.1) |
| token | string | URL-safe token for link |
| status | enum | `pending`, `accepted`, `declined`, `expired` |
| audit | standard | |

### MatchParticipant

- Join table: matchId + playerId + role (`host` | `player`) + joinedAt

## User flows

### Flow 1 — Create match + invite (MVP1)

1. Host logs in (email or GitHub)
2. Host fills: date/time, optional location label, optional skill hint
3. Host creates match → status `open`
4. Host copies **invite link** (`/invite/{token}`)
5. Invitee opens link → login/signup → accept
6. On 2+ accepts, match → `confirmed`
7. After played (manual host action MVP1), → `completed`

### Flow 2 — History

1. Player opens `/app/matches`
2. Sees upcoming + past matches they hosted or joined

## Out of scope (MVP1)

- Court booking / payments
- Algorithmic ELO rating
- Club/operator dashboards
- Active org/tenant UX
- SEO marketing homepage
- Push notifications (email invite optional MVP1.1)
- Americano/Mexicano formats

## Success criteria (stg deployable)

- [ ] Auth: email + GitHub works on stg
- [ ] Player creates match + generates invite link
- [ ] Invitee accepts via link
- [ ] Both see match in history
- [ ] Audit log records create/invite/accept
- [ ] Deployed Coolify stg + Doppler secrets

## API sketch

```
POST   /api/matches
GET    /api/matches
GET    /api/matches/:id
POST   /api/matches/:id/invites
POST   /api/invites/:token/accept
POST   /api/invites/:token/decline
```

All called from `apps/web` via TanStack Query → `apps/api` (Elysia).
