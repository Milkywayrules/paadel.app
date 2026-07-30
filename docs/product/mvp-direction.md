# MVP direction — fusion synthesis

**Mode:** fusion (single-context synthesis of four research briefs)  
**Inputs:** `docs/research/padel-competitors-landscape/`, `padel-competitor-pain-points-usp/`, `padel-domain-enhancement-opportunities/`, `padel-codebase-readiness-prep/`  
**Generated:** 2026-07-30

---

## answer

**paadel.app MVP1** should be a **free, global-English, player-only app** that does one job exceptionally well: **create a casual doubles match, invite players by link, accept/decline, and show basic history** — without court booking, without algorithmic rating wars, without club onboarding.

### MVP1 product direction (locked)

| Dimension | Decision |
| --- | --- |
| Core loop | Host creates match → sends invite link → invitees accept → match appears in history |
| Invite model | **Share link** (simplest shippable); in-app invite to existing users as fast-follow |
| Players | 4 slots default (doubles); allow 2–4 for partial fill |
| Level | Optional self-declared band (1–7 or beginner/intermediate/advanced) |
| Location | Free-text court/place label — no booking integration |
| Auth | Email/password + GitHub OAuth |
| UI | Mantine via `packages/ui`; client-first Next.js |
| Public `/` | "Coming soon" placeholder — no SEO |

### Competitive positioning

- **Not competing with** Playtomic/MATCHi on court networks (supply-side moat takes years).
- **Competing with** WhatsApp coordination + Ace/Padel Mixer invite UX.
- **Differentiator:** Low friction, trustworthy roster, persistent history, no open-match payment traps.

### MVP2 parking lot (from research)

1. Waitlist auto-promote on cancel (Padel Mixer pattern)
2. Guest player via link (no account required)
3. Host approve/decline for public matches
4. Optional set score on match record
5. Americano/Mexicano event mode with rotation engine
6. Verified rating (TrueSkill-style) — only after match volume
7. Realtime roster via WebSocket
8. In-app notifications (email first, push later)
9. Court booking exploration — MVP3+
10. Club/org dashboards — post-MVP-n

### Codebase prep priorities (ordered)

1. ✅ Monorepo scaffold + env guards + biome/lefthook
2. Drizzle migrate + Better Auth flows on real Postgres
3. Match/Invite API vertical slice
4. Web create/accept/history UI
5. Audit log on key actions
6. Redis + R2 smoke (prefix enforcement)
7. Coolify stg deploy + Doppler
8. CI wire to turbo + biome

### BMAD / harness (optional — not blocking)

- Keep decisions on disk: ADRs, research briefs, `docs/tech-stack.md`
- BMAD setup: propose after MVP1 stg deploy; no implementation without King approval
- MCP/plugins: defer; Cursor + existing verasic skills sufficient for MVP1

---

## reasoning

All four briefs converge: **coordination + trust** beat **booking + rating** for a new entrant. Competitors solve coordination only where clubs exist; Ace and Padel Mixer validate player-only coordination demand. Domain brief confirms friendly doubles + invite is the correct MVP1 entity model. Readiness brief lists smoke gates before features.

---

## conflicts

| Topic | Tension | Resolution |
| --- | --- | --- |
| Rating importance | Users care about level (Playtomic) vs distrust algorithms | Self-declared optional in MVP1 |
| Event vs match | Padel Mixer is event-centric | paadel MVP1 = single casual match, not mixer rounds |
| Indonesia vs global | Courtside dominates ID | Global English MVP1; geo expansion later |

---

## by model

Single-context fusion (orchestrator synthesis). Multi-model parallel fusion (`composer-2.5-fast`, `cursor-grok-4.5-medium`, `claude-opus-5-medium`, `gpt-5.6-sol-medium`) deferred to save latency; synthesis applies adversarial inputs from Hunter/Practitioner/Skeptic/Arbiter T2 runs on research #1 and web-verified sources across all briefs.

---

## recommendation

Proceed to MVP1 implementation slice on scaffolded monorepo. First user-visible milestone: authenticated user creates match and shares invite link that another user can accept.
