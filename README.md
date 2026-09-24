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
- **AI feedback**: when recording stops, the transcript and question are sent to `/api/openai`. The endpoint asks `gpt-4o-mini` to review the answer as a friendly React teacher. The feedback opens in a bottom drawer (Vaul).
- **Answer history**: each answered question appears as a card with your transcript and response time. Answering the same question again replaces the earlier card, and you can delete cards.
- **Saved AI responses**: AI responses are stored in `localStorage` under their question (the latest 5 per question), so you can open earlier versions ("Wersja 1, Wersja 2, …") in a dialog. Deleting a card also deletes its saved responses.
- **Light, dark and system themes**: a theme switcher built with `next-themes`.
- **Responsive, animated UI**: a mobile-first layout with blurred gradient "blob" backgrounds, built with Tailwind CSS and shadcn/ui components.

---

## How it works

```
┌──────────────┐   1. pick random question
│   Browser    │   2. record voice → Web Speech API → transcript
│  (Next.js    │   3. POST /api/openai { question, userAnswer }
│   client)    │ ─────────────────────────────────────────────┐
└──────────────┘                                              ▼
       ▲                                     ┌─────────────────────────────┐
       │  5. { aiAnswer } → drawer +         │  Next.js Route Handler       │
       │     localStorage history            │  src/app/api/openai/route.ts │
       │                                     │  • Clerk auth() check (401)  │
       │                                     │  • rate limit (429)          │
       └──────────────────────────────────── │  • known question, answer    │
                                             │    ≤ 2000 chars (400)        │
                                             │  4. OpenAI Chat Completions  │
                                             │     gpt-4o-mini, 300 tokens, │
                                             │     9 s timeout, no retries  │
                                             └─────────────────────────────┘
```

1. `middleware.ts` (Clerk middleware) protects every route except `/sign-in` and `/sign-up`. Signed-out users are redirected to the app's own sign-in page.
2. On the home page, the user draws a question (`question-picker.tsx`).
3. `speech-button.tsx` starts and stops speech recognition, runs the timer, and sends the transcript to the API once recording stops.
4. The API route checks that `OPENAI_API_KEY` is set and that a Clerk session exists. It applies a per-user rate limit (10 requests per minute) and accepts only questions from the shared bank (`src/data/react-questions.ts`) with answers up to 2000 characters. This prevents the endpoint from being used as a general-purpose GPT proxy. It then calls OpenAI with a system prompt ("You are a React teacher who evaluates students' answers…"). The call uses the SDK's 9-second timeout with retries disabled, so it fits within serverless function limits and aborts the request when it runs too long.
5. The feedback is shown in `ai-response.tsx` and saved in `localStorage` (`src/lib/ai-responses-storage.ts`). The answer is added to `result-list.tsx`.

---

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | [Next.js 15](https://nextjs.org) (App Router, Route Handlers, Middleware) |
| UI library | [React 18](https://react.dev) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| Authentication | [Clerk](https://clerk.com) (`@clerk/nextjs`): `ClerkProvider`, `clerkMiddleware`, `<SignIn />`, `<SignUp />`, `UserButton` |
| AI | [OpenAI Node SDK](https://github.com/openai/openai-node) (`openai` v4), model **`gpt-4o-mini`** |
| Speech recognition | [`react-speech-recognition`](https://github.com/JamesBrill/react-speech-recognition) (Web Speech API) + `regenerator-runtime` polyfill |
| HTTP client | [Axios](https://axios-http.com) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com), `tailwindcss-animate`, PostCSS, Autoprefixer |
| UI components | [shadcn/ui](https://ui.shadcn.com) ("new-york" style) built on [Radix UI](https://www.radix-ui.com) primitives (Dialog, Dropdown Menu, Scroll Area, Slot) |
| Drawer | [Vaul](https://vaul.emilkowal.ski) |
| Icons | [Lucide React](https://lucide.dev) |
| Theming | [next-themes](https://github.com/pacocoursey/next-themes) |
| Utilities | `clsx`, `tailwind-merge`, `class-variance-authority` |
| Linting | ESLint 9 + `eslint-config-next` |
| Testing | [Vitest](https://vitest.dev), [Testing Library](https://testing-library.com/docs/react-testing-library/intro/), [happy-dom](https://github.com/capricorn86/happy-dom) |
| CI | GitHub Actions: lint, type check and tests on every pull request and push to `main` |
| Client-side persistence | Browser `localStorage` (AI response history) |

---

## Project structure

```
src/
├── app/
│   ├── api/openai/route.ts   # POST endpoint: auth, validation, rate limit, OpenAI feedback
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
│   ├── ai-response.tsx       # Drawer with AI feedback
│   ├── result-list.tsx       # Answer history cards + saved AI responses
│   ├── mode-toggle.tsx       # Light/dark/system switch
│   ├── theme-provider.tsx    # next-themes wrapper
│   └── ui/                   # shadcn/ui components
├── data/react-questions.ts   # Question bank shared by client and API
├── lib/
│   ├── utils.ts              # cn() helper, formatTime()
│   ├── ai-responses-storage.ts  # Guarded localStorage for AI response history
│   └── rate-limit.ts         # In-memory per-user rate limiter
├── types/css.d.ts            # Type declaration for CSS imports
└── middleware.ts             # Clerk route protection
```

---

## Getting started

### Prerequisites

- Node.js 22.12+ (required by Vitest; see `.nvmrc`)
- A [Clerk](https://dashboard.clerk.com) application (publishable and secret keys)
- An [OpenAI API key](https://platform.openai.com/api-keys)
- A browser that supports the Web Speech API (Chrome or Edge are recommended; Firefox does not support it)

### Installation

```bash
git clone <repository-url>
cd lern-react-main
npm install
```

### Environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server at http://localhost:3000 |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check the project with `tsc` |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |

### Tests

Tests sit next to the code they cover (`*.test.ts` / `*.test.tsx`):

- `src/app/api/openai/route.test.ts`: the API route with Clerk and OpenAI mocked. It covers auth (401), validation (400), rate limiting (429), the OpenAI call options, error handling, and that user answers are not logged.
- `src/lib/*.test.ts`: `formatTime` and `cn`, the rate limiter, and the `localStorage` helpers (including corrupted and blocked storage).
- `src/data/react-questions.test.ts`: the question bank and `isKnownQuestion`.
- `src/components/question-picker.test.tsx`: the component in happy-dom, including the no-immediate-repeat rule.

---

## Deployment

The app is ready to deploy on [Vercel](https://vercel.com). Add the three environment variables above in the project settings. The OpenAI request is capped at 300 output tokens and a 9-second timeout so it fits within the serverless function time limits of the default plan.

---

## Notes and limitations

- Answer history lives in React state and resets on reload. Only AI responses are kept in `localStorage`, and only in the current browser.
- Speech recognition is set to Polish (`pl-PL`), so answers in other languages will be transcribed poorly.
- The rate limit is kept in memory per server instance. On serverless platforms it slows down abuse but is not a strict global limit. Use a shared store (e.g. Upstash Redis) for that.
- The Clerk sign-in and sign-up forms are in English. Clerk's `plPL` localization can translate them.
- The question bank lives in `src/data/react-questions.ts`. To add questions, edit that array. The API accepts only questions from this list.
