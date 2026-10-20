# Learn React with AI

An interactive web app for practicing **React.js interview and exam questions by speaking your answers out loud**. The app draws a random React question, records your spoken answer in the browser, turns it into text, and sends it to an OpenAI model. The model acts as a React teacher and gives you feedback on what you got right, what needs work, and tips for improving.

> The user interface, the question bank and the AI feedback are in **Polish**.

![AI Learning banner](./public/ai-learning-bg.webp)

---

## Features

- **Authentication**: all pages are protected with [Clerk](https://clerk.com). Signed-out users are redirected to the sign-in page, and signed-in users see their avatar menu (`UserButton`) in the header.
- **Random question picker**: draws a question from a built-in bank of 28 React topics (hooks, Virtual DOM, props, keys, Context, Redux, React Router, `React.memo`, Suspense, lazy loading, HOCs, controlled and uncontrolled components, TypeScript with React, and more). The same question never comes up twice in a row.
- **Voice answers (speech-to-text)**: records your answer in Polish (`pl-PL`) with the browser's Web Speech API through `react-speech-recognition` in continuous mode. The transcript appears live in an auto-resizing textarea.
- **Recording timer**: shows how long you have been answering (`mm:ss`). It resets on each new recording, and the time is saved with each answer.
- **AI evaluation**: when recording stops, the transcript and question are sent to `/api/openai`. The endpoint asks `gpt-4o-mini` (configurable with `OPENAI_MODEL`) to grade the answer as a friendly React teacher. It uses Structured Outputs, so every evaluation has the same shape: a score from 0 to 10, a short summary, what was right, what was missing, and tips. The evaluation opens in a bottom drawer (Vaul).
- **Answer history in the database**: every answer and its evaluation are saved in PostgreSQL (Neon) under your Clerk account, so the history survives reloads and is available on any device. Each question has one card with your latest transcript, score, response time and date. "Odpowiedź AI" opens every evaluation of that question ("Wersja 1, Wersja 2, …"), and "Usuń" deletes all your answers to it.
- **Demo mode**: the app runs on the owner's OpenAI key, so anyone whose verified email is not in `OWNER_EMAILS` gets a limited demo: 3 evaluations per account (`DEMO_QUESTION_LIMIT`) and 20 per day for all demo users together (`DEMO_DAILY_LIMIT`). A banner shows how many questions are left, and the picker is disabled when none are.
- **Privacy and your data (GDPR)**: the `/privacy` page ("Prywatność i dane", linked in the footer and the avatar menu) explains what is stored and who processes it. Signed-in users can download all their data as JSON and delete their whole answer history. Deleting the Clerk account deletes all of the user's data through a Clerk webhook.
- **Light, dark and system themes**: a theme switcher built with `next-themes`.
- **Responsive, animated UI**: a mobile-first layout with blurred gradient "blob" backgrounds, built with Tailwind CSS and shadcn/ui components.

---

## How it works

```
┌──────────────┐   1. pick random question
│   Browser    │   2. record voice → Web Speech API → transcript
│  (Next.js    │   3. POST /api/openai { question, userAnswer, durationSeconds }
│   client)    │ ─────────────────────────────────────────────┐
└──────────────┘                                              ▼
       ▲                                     ┌─────────────────────────────┐
       │  6. { evaluation, attempt } →       │  Next.js Route Handler       │
       │     drawer + history cards          │  src/app/api/openai/route.ts │
       │                                     │  • Clerk auth() check (401)  │
       │                                     │  • rate limit (429)          │
       └──────────────────────────────────── │  • known question, answer    │
                                             │    ≤ 2000 chars (400)        │
                                             │  • demo limit (403)          │
                                             │  4. OpenAI Chat Completions  │
                                             │     gpt-4o-mini, JSON schema │
                                             │     600 tokens, 9 s timeout  │
                                             │  5. save attempt + evaluation│
                                             │     in Neon (one transaction)│
                                             └─────────────────────────────┘
```

1. `middleware.ts` (Clerk middleware) protects every route except `/sign-in` and `/sign-up`. Signed-out users are redirected to the app's own sign-in page.
2. On the home page, the user draws a question (`question-picker.tsx`).
3. `speech-button.tsx` starts and stops speech recognition, runs the timer, and sends the transcript and the recording time to the API once recording stops.
4. The API route checks that `OPENAI_API_KEY` is set and that a Clerk session exists. It applies a per-user rate limit (10 requests per minute) and accepts only questions from the shared bank (`src/data/react-questions.ts`) with answers up to 2000 characters. This prevents the endpoint from being used as a general-purpose GPT proxy. Users who are not owners (`src/lib/owner.ts` checks verified Clerk emails against `OWNER_EMAILS`) must reserve a demo use first (`src/db/demo.ts`): a conditional `UPDATE` on their counter and on today's counter, so parallel requests cannot go over either limit; otherwise the route returns 403. A reserved use is given back when OpenAI fails. It then calls OpenAI with a system prompt ("You are a React teacher who evaluates students' answers…"). The reply must match a JSON schema (Structured Outputs, `src/lib/evaluation.ts`); a truncated or invalid reply returns 502. The call uses the SDK's 9-second timeout with retries disabled, so it fits within serverless function limits and aborts the request when it runs too long.
5. The route saves the user, the attempt and the evaluation in one transaction (`src/db/attempts.ts`). If saving fails, the evaluation is still returned and the drawer says it was not saved.
6. The evaluation is shown in `ai-response.tsx`, and the attempt is added to `result-list.tsx`. On page load, the history comes from `GET /api/attempts`, the demo status from `GET /api/demo` (shown in `demo-banner.tsx`), and "Usuń" calls `DELETE /api/attempts`. Deleting answers does not give demo uses back.

---

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | [Next.js 15](https://nextjs.org) (App Router, Route Handlers, Middleware) |
| UI library | [React 18](https://react.dev) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| Authentication | [Clerk](https://clerk.com) (`@clerk/nextjs`): `ClerkProvider`, `clerkMiddleware`, `<SignIn />`, `<SignUp />`, `UserButton` |
| AI | [OpenAI Node SDK](https://github.com/openai/openai-node) (`openai` v4), model **`gpt-4o-mini`** by default (`OPENAI_MODEL`) |
| Speech recognition | [`react-speech-recognition`](https://github.com/JamesBrill/react-speech-recognition) (Web Speech API) + `regenerator-runtime` polyfill |
| HTTP client | [Axios](https://axios-http.com) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com), `tailwindcss-animate`, PostCSS, Autoprefixer |
| UI components | [shadcn/ui](https://ui.shadcn.com) ("new-york" style) built on [Radix UI](https://www.radix-ui.com) primitives (Dialog, Dropdown Menu, Scroll Area, Slot) |
| Drawer | [Vaul](https://vaul.emilkowal.ski) |
| Icons | [Lucide React](https://lucide.dev) |
| Theming | [next-themes](https://github.com/pacocoursey/next-themes) |
| Utilities | `clsx`, `tailwind-merge`, `class-variance-authority` |
| Package manager | [pnpm](https://pnpm.io) (dependency install scripts are blocked unless allowed in `pnpm-workspace.yaml`) |
| Linting | ESLint 9 (flat config, `eslint.config.mjs`) + `eslint-config-next` |
| Testing | [Vitest](https://vitest.dev), [Testing Library](https://testing-library.com/docs/react-testing-library/intro/), [happy-dom](https://github.com/capricorn86/happy-dom) |
| CI | GitHub Actions: lint, type check, tests and production build on every pull request and push to `main` |
| Database | [Neon](https://neon.tech) (serverless PostgreSQL) with [Drizzle ORM](https://orm.drizzle.team) and `drizzle-kit` migrations |

---

## Project structure

```
src/
├── app/
│   ├── api/openai/route.ts   # POST endpoint: auth, validation, rate limit, OpenAI feedback, save attempt
│   ├── api/attempts/route.ts # GET history, DELETE a question's attempts (signed-in user only)
│   ├── api/demo/route.ts     # GET the signed-in user's demo status
│   ├── api/my-data/route.ts  # GET a JSON export, DELETE the whole history (signed-in user only)
│   ├── api/webhooks/clerk/route.ts  # Clerk webhook: user.deleted removes all the user's data
│   ├── privacy/page.tsx      # Privacy page (public) with export and delete buttons
│   ├── sign-in/[[...sign-in]]/page.tsx  # Clerk sign-in page (catch-all route)
│   ├── sign-up/[[...sign-up]]/page.tsx  # Clerk sign-up page (catch-all route)
│   ├── layout.tsx            # ClerkProvider, ThemeProvider, header, background blobs
│   ├── page.tsx              # Main learning screen
│   └── globals.css           # Tailwind layers, CSS variables
├── components/
│   ├── question-picker.tsx   # Random question picker (no immediate repeats)
│   ├── speech-button.tsx     # Speech recognition, timer, API call
│   ├── microphone-button.tsx # Start/stop recording button
│   ├── recording-timer.tsx   # mm:ss timer
│   ├── ai-response.tsx       # Drawer with the AI evaluation
│   ├── evaluation-view.tsx   # Score, summary, strengths, gaps and tips
│   ├── result-list.tsx       # History cards (one per question) + evaluations dialog
│   ├── demo-banner.tsx       # Demo mode banner with the remaining questions
│   ├── data-controls.tsx     # Download data / delete history buttons
│   ├── user-menu.tsx         # Clerk avatar menu with a privacy link
│   ├── mode-toggle.tsx       # Light/dark/system switch
│   ├── theme-provider.tsx    # next-themes wrapper
│   └── ui/                   # shadcn/ui components
├── data/react-questions.ts   # Question bank (text, topic, difficulty) shared by client, API and seed
├── db/
│   ├── schema.ts             # Drizzle schema: users, questions, attempts, evaluations, demo_usage
│   ├── index.ts              # Lazily created Drizzle client (Neon HTTP driver)
│   ├── attempts.ts           # Save, list and delete attempts with their evaluations
│   ├── demo.ts               # Reserve, give back and read demo uses
│   └── user-data.ts          # Export a user's data, delete their history or the whole user
├── lib/
│   ├── utils.ts              # cn() helper, formatTime()
│   ├── evaluation.ts         # Evaluation type, JSON schema and validator
│   ├── attempts.ts           # Attempt type shared by the API and the client
│   ├── demo.ts               # Demo config (env), status and messages
│   ├── owner.ts              # Owner check by verified Clerk email
│   └── rate-limit.ts         # In-memory per-user rate limiter
├── types/css.d.ts            # Type declaration for CSS imports
└── middleware.ts             # Clerk route protection
drizzle/                      # SQL migrations generated by drizzle-kit (committed)
scripts/seed-questions.ts     # Upserts the question bank into the questions table
drizzle.config.ts             # drizzle-kit config (uses DATABASE_URL_UNPOOLED)
```

---

## Getting started

### Prerequisites

- Node.js 22.12+ (required by Vitest; see `.nvmrc`)
- [pnpm](https://pnpm.io) 11 (the exact version is pinned in `package.json` under `packageManager`; run `corepack enable` to use it automatically)
- A [Clerk](https://dashboard.clerk.com) application (publishable and secret keys)
- An [OpenAI API key](https://platform.openai.com/api-keys)
- A [Neon](https://console.neon.tech) project (PostgreSQL)
- A browser that supports the Web Speech API (Chrome or Edge are recommended; Firefox does not support it)

### Installation

```bash
git clone <repository-url>
cd lern-react-main
pnpm install
```

### Environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...
# Optional: the model used for feedback (default: gpt-4o-mini)
OPENAI_MODEL=gpt-4o-mini
# Neon: pooled connection for the app, direct connection for migrations
DATABASE_URL=postgresql://...@ep-...-pooler.<region>.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://...@ep-....<region>.aws.neon.tech/neondb?sslmode=require
# Demo mode: comma-separated owner emails with no limit; everyone else gets the demo
OWNER_EMAILS=you@example.com
# Optional: evaluations per demo account (default 3, 0 turns the demo off)
DEMO_QUESTION_LIMIT=3
# Optional: evaluations per day for all demo users together, UTC (default 20)
DEMO_DAILY_LIMIT=20
# Clerk webhook signing secret (Dashboard → Webhooks → endpoint → Signing Secret)
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
```

Without `OWNER_EMAILS`, every user, including you, is in demo mode.

### Database

1. In the Neon console, create a child branch of the default branch (for example `dev`) for local development, so local data and test migrations never touch production.
2. Open **Connect**, pick that branch and copy two connection strings: with **Connection pooling** on (`DATABASE_URL`) and off (`DATABASE_URL_UNPOOLED`).
3. Create the tables and load the question bank:

```bash
pnpm db:migrate
pnpm db:seed
```

After changing `src/db/schema.ts`, run `pnpm db:generate` and commit the new file in `drizzle/`. CI fails when the schema and the migrations are out of sync.

### Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server at http://localhost:3000 |
| `pnpm build` | Create a production build |
| `pnpm start` | Run the production build |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Type-check the project with `tsc` |
| `pnpm test` | Run the test suite once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm db:generate` | Generate a SQL migration from changes in `src/db/schema.ts` |
| `pnpm db:migrate` | Apply pending migrations to the database in `DATABASE_URL_UNPOOLED` |
| `pnpm db:seed` | Upsert the question bank into the `questions` table (safe to run again) |
| `pnpm db:studio` | Browse the database in Drizzle Studio |

### Tests

Tests sit next to the code they cover (`*.test.ts` / `*.test.tsx`):

- `src/app/api/openai/route.test.ts`: the API route with Clerk and OpenAI mocked. It covers auth (401), validation (400), rate limiting (429), the OpenAI call options, invalid or truncated model replies (502), saving the attempt (and still returning the evaluation when saving fails), demo limits (403, giving a use back when OpenAI fails, no limit for owners), error handling, and that user answers are not logged.
- `src/app/api/attempts/route.test.ts`: history and delete with the database mocked: auth (401), validation (400) and database errors (500).
- `src/app/api/demo/route.test.ts`: the demo status for guests and owners.
- `src/app/api/my-data/route.test.ts`: data export and history deletion: auth (401) and database errors (500).
- `src/app/api/webhooks/clerk/route.test.ts`: the Clerk webhook with real Svix signatures: `user.deleted` removes the user, other events are ignored, bad or missing signatures return 400.
- `src/lib/*.test.ts`: `formatTime` and `cn`, the evaluation validator and JSON schema, the rate limiter, demo config and messages, and the owner check.
- `src/data/react-questions.test.ts`: the question bank (every topic is used) and `isKnownQuestion`.
- `src/components/question-picker.test.tsx`: the component in happy-dom, including the no-immediate-repeat rule.

---

## Deployment

The app is ready to deploy on [Vercel](https://vercel.com). Add the environment variables above in the project settings; connecting Neon from **Storage** in Vercel adds `DATABASE_URL` and `DATABASE_URL_UNPOOLED` automatically. Set the function region to Frankfurt (`fra1`) to match a Neon database in `eu-central-1`. Migrations are not run on deploy yet: run `pnpm db:migrate` and `pnpm db:seed` against the production branch after a schema change. To delete user data when a Clerk account is deleted, add a webhook in the Clerk Dashboard (**Webhooks → Add Endpoint**) pointing to `https://<your-domain>/api/webhooks/clerk` with the `user.deleted` event, and set its signing secret as `CLERK_WEBHOOK_SIGNING_SECRET`. The OpenAI request is capped at 600 output tokens and a 9-second timeout so it fits within the serverless function time limits of the default plan.

---

## Notes and limitations

- Demo limits protect the OpenAI key inside the app. Also set a monthly budget in the OpenAI dashboard as a last line of defense.
- The history shows your latest 100 answers. Older ones stay in the database for progress tracking.
- Speech recognition is set to Polish (`pl-PL`), so answers in other languages will be transcribed poorly.
- The rate limit is kept in memory per server instance. On serverless platforms it slows down abuse but is not a strict global limit. Use a shared store (e.g. Upstash Redis) for that.
- The Clerk sign-in and sign-up forms are in English. Clerk's `plPL` localization can translate them.
- The question bank lives in `src/data/react-questions.ts`. To add questions, edit that array and run `pnpm db:seed`. The API accepts only questions from this list. Questions removed from the list stay in the database, because past attempts reference them.

---

## Roadmap

### Stage 1: Persistent answers and progress tracking (next)

**Goal:** store every answer and its AI evaluation in a database, then let an AI agent analyze past answers and track each user's progress over time.

#### Recommended database: PostgreSQL on [Neon](https://neon.tech) with [Drizzle ORM](https://orm.drizzle.team)

| Why | Details |
|---|---|
| The data is relational | Users → attempts → evaluations → topics. Progress is an aggregation (averages, trends per topic, weakest areas), which SQL handles well (`GROUP BY`, window functions). |
| Serverless-friendly | Neon's HTTP/WebSocket driver works in Vercel functions without connection-pool issues. It scales to zero and has a free tier. |
| Vercel integration | Available in the Vercel Marketplace, which injects `DATABASE_URL` into the project automatically. |
| Room for AI features | The `pgvector` extension enables semantic search over past answers later (for example "find answers similar to this one" or tracking how an explanation evolves), with no second database. |
| Type safety | Drizzle generates TypeScript types from the schema, has lightweight SQL-first migrations, and works in serverless and edge runtimes. |

**Alternatives considered:**
- **Supabase (Postgres):** a good option with the same SQL benefits. Its main extras (auth, storage, realtime) overlap with Clerk, so Neon is the leaner choice here.
- **MongoDB:** flexible documents, but progress queries across attempts and topics are more natural in SQL.
- **Upstash Redis:** not a primary store for this data. It is still the right tool for the global rate limit (see Stage 2).

#### Proposed data model

```
users             id (Clerk userId), created_at
questions         id, text, topic, difficulty           ← migrated from src/data/react-questions.ts
attempts          id, user_id, question_id, transcript, duration_seconds, created_at
evaluations       id, attempt_id, score (0–10), feedback, strengths[], gaps[], tips[], model, created_at
progress_reports  id, user_id, summary, weak_topics[], recommended_questions[], created_at
```

#### Implementation plan

1. **Structured evaluations (done):** the OpenAI call uses [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) (JSON schema), so each answer gets a numeric `score`, `feedback`, `strengths`, `gaps` and `tips`. The topic is not taken from the model: it will come from the `questions` table, so topic names stay consistent across attempts.
2. **Database setup (done):** Neon project with a `dev` branch, Drizzle schema and migrations in `drizzle/`, a question seed with topics and difficulty, and a CI check that migrations match the schema. `progress_reports` will be added with step 5.
3. **Persist attempts (done):** `/api/openai` saves the attempt and evaluation in one transaction, keyed by the Clerk `userId`, and the history is read from the database. The old `localStorage` history was dropped, not imported.
4. **Progress in SQL:** average score per topic, trend over the last N attempts, most improved and weakest topics, and questions never answered.
5. **Progress agent:** an endpoint that loads the user's recent attempts (with the SQL aggregates) and asks the model for a progress report: what improved, recurring gaps, and which questions to practice next. Cache the report in `progress_reports` and regenerate it only after new attempts, to control cost.
6. **Adaptive question picking:** favor weak topics and questions not yet answered, instead of picking uniformly at random.
7. **Progress dashboard:** a `/progress` page with score over time, per-topic breakdown, and the latest agent report.
8. **Privacy:** users can delete their history (a "delete my data" action). Keep a retention policy for stored transcripts, which are personal data (GDPR).

### Stage 2: Hardening and production readiness

- **Global rate limit:** move `src/lib/rate-limit.ts` to [Upstash Redis](https://upstash.com) (`@upstash/ratelimit`). The in-memory limiter is only per server instance.
- **Error monitoring:** [Sentry](https://sentry.io) for server and client errors, plus Vercel Analytics or Speed Insights.
- **Spending guardrails:** a per-user daily cap on AI requests stored in the database, plus usage alerts in the OpenAI dashboard.
- **End-to-end tests:** [Playwright](https://playwright.dev) for the main flow: sign-in → draw a question → answer → feedback, with Clerk testing tokens and a mocked AI endpoint.
- **Automated dependency updates:** Dependabot or Renovate, grouped and merged only when CI passes.

### Stage 3: Learning experience

- **Text answer mode:** a textarea fallback for browsers without the Web Speech API (Firefox) and for users who prefer typing.
- **Streaming feedback:** stream the AI response into the drawer as it is generated, instead of waiting for the whole answer.
- **Richer question bank:** categories, difficulty levels, and more topics (React 19 features, Server Components, Next.js), managed in the database instead of a hard-coded array.
- **Practice modes:** a "mock interview" session with several questions in a row and a summary at the end, and spaced repetition for questions answered poorly.
- **Localization:** translate the Clerk forms (`@clerk/localizations`, `plPL`) and optionally add an English UI with matching speech recognition (`en-US`).

### Stage 4: Maintenance and upgrades

- **Framework upgrades:** move to React 19 and Next.js 16 once the dependencies (`react-speech-recognition`, Clerk) support them.
- **Browser data:** refresh it with `npx update-browserslist-db@latest`, and keep it fresh through the dependency bot.
- **AI model:** periodically compare newer or cheaper models against a small set of reference answers before switching `OPENAI_MODEL`.
