# KeyCrown

KeyCrown is a local-first typing academy and practice arena. The responsive web app includes a live demo, six academy stages with 18 lessons, a placement test, timed and word-count drills, daily challenges, error-driven practice, four typing games, progress charts, and an on-device demo leaderboard.

## Run and verify

```sh
bun install
bun run dev         # Managed web preview, port 4200
bun run build:web   # Type checks and production bundle
bun run lint
bun test
```

To verify the PWA, serve the built web bundle over HTTPS or localhost (`bun packages/web/src/__server.ts`). In the production build, the service worker precaches the app, route modules, fonts, and install assets. After activation, offline navigation and practice are available. During development the worker is disabled to avoid stale code.

## Where to extend it

| Module | Responsibility |
| --- | --- |
| `packages/web/src/web/keycrown/content.ts` | Academy curriculum, rank thresholds, language corpora, seeded passages |
| `packages/web/src/web/keycrown/engine.tsx` and `metrics.ts` | Native input capture, session timing, feedback, scoring |
| `packages/web/src/web/keycrown/store.ts` | Zustand persistence, unlocking, XP, date-specific records, adaptive drills |
| `packages/web/src/web/keycrown/keyboard.tsx` | Keyboard layouts, finger guide, and key heatmap |
| `packages/web/src/web/keycrown/games.tsx` | Game modes and Falling Words simulation |
| `packages/web/vite/pwa.ts` | Production service worker and hashed asset precache |

Progress and settings are stored on this device; there is no account, sync, or live leaderboard. English, Spanish, and French are available for practice and games. Academy text and the interface are in English. `design.md` describes the brand and layout.
