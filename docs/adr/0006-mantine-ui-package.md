# Mantine-only UI via packages/ui

All shared UI uses Mantine v7 through `packages/ui` (theme, provider, primitives). shadcn/Tailwind is not adopted as primary UI despite appearing in personal tech stack notes.

Mantine gives a cohesive component system with theming and a11y baseline in one package ownership boundary. A split UI stack would increase agent confusion and bundle inconsistency. Mantine v7 is pinned because v9 targets React canary APIs not in stable React 19.
