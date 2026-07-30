# Better Auth with multi-tenant schema prep only

Authentication uses Better Auth with email/password and GitHub OAuth. Tables include nullable `organizationId` (or equivalent org relation) and Better Auth organization plugin schema prep, but there is no active organization UX in MVP1–2.

Preparing tenant columns now avoids painful migrations when club/operator features arrive. Building org UX early would scope-creep MVP1 and duplicate Courtside/Playtomic club-admin strengths we explicitly defer.
