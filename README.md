# Learn React with AI

An interactive web app for practicing **React.js interview and exam questions by speaking your answers out loud**. The app draws a random React question, records your spoken answer in the browser, turns it into text, and sends it to an OpenAI model. The model acts as a React teacher and gives you feedback on what you got right, what needs work, and tips for improving.

> The user interface, the question bank and the AI feedback are in **Polish**.

![AI Learning banner](./public/ai-learning-bg.webp)

---

## Features

- **Authentication**: all pages are protected with [Clerk](https://clerk.com). Signed-out users are redirected to the sign-in page, and signed-in users see their avatar menu (`UserButton`) in the header.
- **Random question picker**: draws a question from a built-in bank of 28 React topics (hooks, Virtual DOM, props, keys, Context, Redux, React Router, `React.memo`, Suspense, lazy loading, HOCs, controlled and uncontrolled components, TypeScript with React, and more).
- **Voice answers (speech-to-text)**: records your answer with the browser's Web Speech API through `react-speech-recognition` in continuous mode. The transcript appears live in an auto-resizing textarea.
- **Recording timer**: shows how long you have been answering (`mm:ss`), and the time is saved with each answer.
- **AI feedback**: when recording stops, the transcript and question are sent to `/api/openai`. The endpoint asks `gpt-4o-mini` to review the answer as a friendly React teacher. The feedback opens in a bottom drawer (Vaul).
- **Answer history**: each answered question appears as a card with your transcript and response time. Answering the same question again replaces the earlier card, and you can delete cards.
- **Saved AI responses**: every AI response is stored in `localStorage` under its question, so you can open all earlier versions ("Version 1, Version 2, …") in a dialog.
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
       └──────────────────────────────────── │  • input validation (400)    │
                                             │  4. OpenAI Chat Completions  │
                                             │     gpt-4o-mini, 300 tokens, │
                                             │     9 s timeout              │
                                             └─────────────────────────────┘
```

1. `middleware.ts` (Clerk middleware) blocks every non-public route for unauthenticated users. Only `/sign-in` and `/sign-up` are public.
2. On the home page, the user draws a question (`questions-react.tsx`).
3. `speech-button.tsx` starts and stops speech recognition, runs the timer, and sends the transcript to the API once recording stops.
4. The API route checks that `OPENAI_API_KEY` is set and that a Clerk session exists. It validates the payload, then calls OpenAI with a system prompt ("You are a React teacher who evaluates students' answers…"). The call is wrapped in a 9-second timeout to avoid serverless function timeouts in production.
5. The feedback is shown in `ai-response.tsx` and saved in `localStorage`. The answer is added to `result-list.tsx`.

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
| UI components | [shadcn/ui](https://ui.shadcn.com) ("new-york" style) built on [Radix UI](https://www.radix-ui.com) primitives (Alert Dialog, Dialog, Dropdown Menu, Scroll Area, Slot) |
| Drawer | [Vaul](https://vaul.emilkowal.ski) |
| Icons | [Lucide React](https://lucide.dev) |
| Theming | [next-themes](https://github.com/pacocoursey/next-themes) |
| Utilities | `clsx`, `tailwind-merge`, `class-variance-authority` |
| Linting | ESLint 9 + `eslint-config-next` |
| Client-side persistence | Browser `localStorage` (AI response history) |

---

## Project structure

```
src/
├── app/
│   ├── api/openai/route.ts   # POST endpoint: auth check + OpenAI feedback
│   ├── sign-in/page.tsx      # Clerk sign-in page
│   ├── sign-up/page.tsx      # Clerk sign-up page
│   ├── layout.tsx            # ClerkProvider, ThemeProvider, header, auth gating
│   ├── page.tsx              # Main learning screen
│   └── globals.css           # Tailwind layers, CSS variables, blob animations
├── components/
│   ├── questions-react.tsx   # Question bank + random picker
│   ├── speech-button.tsx     # Speech recognition, timer, API call
│   ├── microphone-button.tsx # Start/stop recording button
│   ├── recording-timer.tsx   # mm:ss timer
│   ├── ai-response.tsx       # Drawer with AI feedback
│   ├── result-list.tsx       # Answer history cards + saved AI responses
│   ├── mode-toggle.tsx       # Light/dark/system switch
│   ├── theme-provider.tsx    # next-themes wrapper
│   └── ui/                   # shadcn/ui components
├── lib/utils.ts              # cn() helper, formatTime()
└── middleware.ts             # Clerk route protection
```

---

## Getting started

### Prerequisites

- Node.js 18.18+ (required by Next.js 15)
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

---

## Deployment

The app is ready to deploy on [Vercel](https://vercel.com). Add the three environment variables above in the project settings. The OpenAI request is capped at 300 output tokens and a 9-second timeout so it fits within the serverless function time limits of the default plan.

---

## Notes and limitations

- Answer history lives in React state and resets on reload. Only AI responses are kept in `localStorage`, and only in the current browser.
- Speech recognition uses the browser's default language. Answering in Polish works best when the browser or OS language is set to Polish.
- The question bank is hard-coded in `src/components/questions-react.tsx`. To add questions, edit that array.
