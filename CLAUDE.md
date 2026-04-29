@AGENTS.md

# Whisprly.ai — KIRO IDE Master Prompt
> "Hear the question. Nail the answer."

---

## PROJECT OVERVIEW

You are an expert full-stack engineer and product architect. Your task is to guide me step-by-step in building **Whisprly.ai** — a production-ready, AI-powered interview copilot web and desktop application.

Whisprly.ai listens to interview questions in real time, processes them using state-of-the-art LLMs, and displays contextually accurate, resume-aware answers — invisibly, without being detected by screen-sharing or proctoring software.

At every step, you will:
- Explain **what** we are building and **why**
- Provide **complete, production-quality code** (no placeholders, no TODOs)
- Follow **modern best practices** for Next.js 14, TypeScript, and full-stack architecture
- Confirm completion of each phase before proceeding to the next
- Flag any decisions that require my input before writing code

---

## TECH STACK

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| State management | Zustand |
| Speech-to-text | Web Speech API (browser) + OpenAI Whisper (server fallback) |
| LLM | OpenAI GPT-4o (primary) + Anthropic Claude Sonnet (secondary) |
| AI streaming | Vercel AI SDK (`ai` package) |
| ORM | Prisma |
| Database | PostgreSQL (via Supabase) |
| Cache / sessions | Redis (Upstash) |
| Authentication | NextAuth.js v5 (Google + GitHub OAuth + magic link) |
| File storage | Supabase Storage (resume PDFs) |
| PDF parsing | `pdf-parse` |
| Encryption | Web Crypto API (AES-GCM, end-to-end) |
| Desktop app | Electron (transparent overlay, always-on-top) |
| Hosting | Vercel (web) |
| Validation | Zod |
| Linting | ESLint + Prettier |

---

## PROJECT IDENTITY

- **Name:** Whisprly.ai
- **Tagline:** "Hear the question. Nail the answer."
- **GitHub repo name:** `whisprly`
- **Color palette:** Deep indigo primary (#4F46E5), soft white (#FAFAFA), charcoal text (#1A1A2E)
- **Font:** Inter (headings) + Geist Mono (code/transcript display)
- **Tone:** Minimal, premium, focused — like Linear or Vercel's design language

---

## FOLDER STRUCTURE

Generate and maintain this exact structure throughout the project:

```
whisprly/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx               ← dashboard home
│   │   └── history/page.tsx       ← past sessions
│   ├── session/
│   │   └── [id]/
│   │       └── page.tsx           ← live session UI
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── transcribe/route.ts    ← Whisper STT
│   │   ├── answer/route.ts        ← GPT-4o streaming
│   │   ├── resume/route.ts        ← upload + parse
│   │   └── session/route.ts       ← CRUD sessions
│   ├── layout.tsx
│   ├── page.tsx                   ← landing page
│   └── globals.css
├── components/
│   ├── session/
│   │   ├── SessionOverlay.tsx     ← main live UI
│   │   ├── TranscriptFeed.tsx
│   │   ├── AnswerPanel.tsx
│   │   └── AudioCapture.tsx
│   ├── dashboard/
│   │   ├── SessionCard.tsx
│   │   └── ResumeUploader.tsx
│   ├── landing/
│   │   ├── Hero.tsx
│   │   └── Features.tsx
│   └── ui/                        ← shadcn/ui components
├── lib/
│   ├── prisma.ts                  ← Prisma client singleton
│   ├── openai.ts                  ← OpenAI client
│   ├── anthropic.ts               ← Anthropic client
│   ├── redis.ts                   ← Upstash Redis client
│   ├── supabase.ts                ← Supabase client
│   ├── crypto.ts                  ← AES-GCM encrypt/decrypt
│   └── validators/
│       ├── session.ts
│       └── resume.ts
├── store/
│   └── sessionStore.ts            ← Zustand store
├── hooks/
│   ├── useAudioCapture.ts
│   ├── useSpeechRecognition.ts
│   └── useSessionStream.ts
├── prisma/
│   └── schema.prisma
├── electron/
│   ├── main.ts                    ← Electron main process
│   ├── preload.ts
│   └── overlay.ts                 ← transparent always-on-top window
├── types/
│   └── index.ts
├── middleware.ts
├── next.config.js
├── tailwind.config.ts
├── .env.local.example
└── package.json
```

---

## PHASES — EXECUTE IN ORDER

Work through each phase completely before moving to the next. After each phase, output a summary of what was built and ask for confirmation to proceed.

---

### PHASE 1 — Project Scaffolding & Configuration

**Goal:** Get a clean, fully configured Next.js 14 project running locally.

**Steps:**
1. Run the following scaffold command and confirm its output:
   ```bash
   npx create-next-app@latest whisprly \
     --typescript \
     --tailwind \
     --app \
     --src-dir=false \
     --import-alias="@/*"
   ```

2. Install all dependencies in one command:
   ```bash
   npm install ai openai @anthropic-ai/sdk @prisma/client prisma \
     next-auth@beta @auth/prisma-adapter \
     @supabase/supabase-js \
     zustand zod \
     pdf-parse \
     @upstash/redis \
     lucide-react \
     class-variance-authority clsx tailwind-merge
   
   npm install -D @types/pdf-parse prettier eslint-config-prettier
   
   npx shadcn-ui@latest init
   ```

3. Configure `next.config.js` with:
   - Server Actions enabled
   - 10MB body size limit for file uploads
   - Strict TypeScript mode

4. Configure `tailwind.config.ts` with:
   - Whisprly color tokens (indigo, charcoal, soft white)
   - Inter + Geist Mono font families
   - shadcn/ui content paths

5. Set up `.env.local.example` with all required environment variable keys (values empty):
   ```
   # Auth
   NEXTAUTH_SECRET=
   NEXTAUTH_URL=
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   GITHUB_CLIENT_ID=
   GITHUB_CLIENT_SECRET=

   # Database
   DATABASE_URL=
   DIRECT_URL=

   # OpenAI
   OPENAI_API_KEY=

   # Anthropic
   ANTHROPIC_API_KEY=

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=

   # Upstash Redis
   UPSTASH_REDIS_REST_URL=
   UPSTASH_REDIS_REST_TOKEN=

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ENCRYPTION_KEY=
   ```

6. Create `lib/prisma.ts`, `lib/openai.ts`, `lib/anthropic.ts`, `lib/redis.ts`, `lib/supabase.ts` — all as properly typed singleton clients.

7. Create `types/index.ts` with all shared TypeScript interfaces:
   - `User`, `Session`, `Transcript`, `ResumeData`

**Deliverable:** Running `npm run dev` shows the default Next.js page with no errors.

---

### PHASE 2 — Database Schema & Prisma

**Goal:** Define the complete data model for Whisprly.ai.

**Prisma schema must include:**

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  sessions      InterviewSession[]
  resumes       Resume[]
  accounts      Account[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model InterviewSession {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  title         String?
  jobTitle      String?
  company       String?
  transcripts   Transcript[]
  duration      Int       @default(0)   // seconds
  status        SessionStatus @default(ACTIVE)
  createdAt     DateTime  @default(now())
  endedAt       DateTime?
}

model Transcript {
  id            String    @id @default(cuid())
  sessionId     String
  session       InterviewSession @relation(fields: [sessionId], references: [id])
  question      String    @db.Text
  answer        String    @db.Text
  encryptedData String?   @db.Text   // AES-GCM encrypted
  timestamp     DateTime  @default(now())
}

model Resume {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  fileName      String
  storageUrl    String
  parsedText    String    @db.Text
  isActive      Boolean   @default(true)
  uploadedAt    DateTime  @default(now())
}

enum SessionStatus {
  ACTIVE
  ENDED
  PAUSED
}
```

**Steps:**
1. Write the complete `prisma/schema.prisma`
2. Run `npx prisma generate`
3. Run `npx prisma db push`
4. Create a seed file `prisma/seed.ts` with a test user

**Deliverable:** Database tables created, Prisma Client generated, seed runs successfully.

---

### PHASE 3 — Authentication

**Goal:** Full auth system with Google, GitHub, and magic link email login.

**Steps:**
1. Create `app/api/auth/[...nextauth]/route.ts` using NextAuth v5 with Prisma adapter
2. Configure providers: Google OAuth, GitHub OAuth, Email (Resend)
3. Create `middleware.ts` protecting `/session/*`, `/dashboard/*`, `/api/session/*`, `/api/answer/*`, `/api/transcribe/*`
4. Build `app/(auth)/login/page.tsx` — clean, minimal login UI with:
   - Google sign-in button
   - GitHub sign-in button
   - Magic link email input
   - Whisprly logo + tagline
5. Build `app/(auth)/signup/page.tsx` — same as login (NextAuth handles both)
6. Add session provider to `app/layout.tsx`

**Deliverable:** Users can sign in via Google/GitHub/email. Protected routes redirect to `/login`.

---

### PHASE 4 — Resume Upload & Parsing

**Goal:** Users upload their resume PDF once; it is parsed, stored, and used as context in every answer.

**Steps:**
1. Build `app/api/resume/route.ts`:
   - Accept multipart form data (PDF up to 5MB)
   - Validate with Zod
   - Upload to Supabase Storage (`resumes/{userId}/{filename}`)
   - Parse with `pdf-parse` to extract plain text
   - Save `Resume` record to PostgreSQL
   - Return `{ id, parsedText, storageUrl }`

2. Build `components/dashboard/ResumeUploader.tsx`:
   - Drag-and-drop + click-to-upload
   - Progress indicator
   - Shows current active resume with option to replace
   - Client-side file type + size validation

3. Build `lib/validators/resume.ts` with Zod schemas

**Deliverable:** User can upload a PDF resume; parsed text is stored in DB and accessible for session context.

---

### PHASE 5 — Core Session Engine

**Goal:** The real-time interview session — the heart of Whisprly.ai.

This phase has three sub-parts: the Zustand store, the audio capture hooks, and the API routes.

#### 5a — Zustand Session Store (`store/sessionStore.ts`)

```typescript
interface SessionState {
  sessionId: string | null
  isListening: boolean
  isProcessing: boolean
  currentQuestion: string
  currentAnswer: string
  transcripts: TranscriptItem[]
  resumeContext: string
  jobDescription: string
  selectedModel: 'gpt-4o' | 'claude-sonnet'

  // Actions
  startSession: (resumeContext: string, jobDescription: string) => void
  stopSession: () => void
  setQuestion: (question: string) => void
  appendAnswer: (chunk: string) => void
  addTranscript: (item: TranscriptItem) => void
  clearCurrent: () => void
}
```

#### 5b — Audio Capture Hooks

Build `hooks/useSpeechRecognition.ts`:
- Uses `window.SpeechRecognition` (Web Speech API)
- Interim + final results
- Auto-detects question end (silence detection after 2s)
- Falls back to `hooks/useAudioCapture.ts` which records audio blob and sends to `/api/transcribe`

Build `hooks/useSessionStream.ts`:
- Sends question + context to `/api/answer`
- Reads the SSE stream chunk by chunk
- Updates Zustand store with each chunk

#### 5c — API Routes

Build `app/api/transcribe/route.ts`:
```typescript
// POST — receives audio blob, returns transcript text
// Uses openai.audio.transcriptions.create with whisper-1
// Rate limited via Redis (10 requests/minute per user)
```

Build `app/api/answer/route.ts`:
```typescript
// POST — receives { question, resumeContext, jobDescription, model }
// Streams GPT-4o or Claude response via ReadableStream
// System prompt engineered for concise, interview-appropriate answers
// Saves transcript to DB (encrypted) after stream ends
```

**System prompt for answer generation (use exactly this):**
```
You are Whisprly, a silent AI interview assistant. The user is currently in a live job interview.

Your job: provide a concise, confident, and authentic answer to the interview question below — written as if the user is speaking it naturally.

Rules:
- Max 4 sentences unless it's a technical/coding question
- Use first-person ("I have experience with...", "In my previous role...")
- Pull specific examples from the resume context provided
- Match the tone to the job description (technical vs. behavioural)
- Never mention that you are an AI
- Never start with "Certainly", "Of course", or "Great question"

Resume context: {resumeContext}
Job description: {jobDescription}
```

**Deliverable:** Sending a question to `/api/answer` streams back a contextual, resume-aware answer.

---

### PHASE 6 — Live Session UI

**Goal:** Build the full session interface — the screen the user sees during their interview.

**Build `app/session/[id]/page.tsx`** — Server Component that fetches session data and renders the client session shell.

**Build `components/session/SessionOverlay.tsx`** (Client Component):
- Full-screen layout with a collapsible sidebar
- Top bar: session timer, listening indicator (pulsing dot), model selector, end session button
- Main area: `AnswerPanel` — the streaming answer with smooth text reveal
- Bottom bar: `TranscriptFeed` — scrollable history of Q&A pairs
- Keyboard shortcuts: `Space` to toggle listening, `Esc` to clear current answer
- Dark mode by default (less distracting during interviews)

**Build `components/session/AnswerPanel.tsx`**:
- Displays streaming answer with a blinking cursor while generating
- Copy-to-clipboard button
- Smooth fade-in for each word as it streams
- Confidence indicator (question detected / processing / ready)

**Build `components/session/TranscriptFeed.tsx`**:
- Scrollable list of past Q&A in this session
- Each item shows: question, answer preview, timestamp
- Click to expand full answer
- Export session button (downloads `.txt` file)

**Deliverable:** A user can open a session, speak a question, and see a streaming answer appear in real time.

---

### PHASE 7 — Dashboard

**Goal:** The user's home base — manage resumes, view session history.

**Build `app/(dashboard)/page.tsx`**:
- Welcome header with user name
- "Start new session" CTA button — creates a session record and navigates to `/session/[id]`
- Recent sessions list (last 5)
- Active resume display with "Replace" button

**Build `app/(dashboard)/history/page.tsx`**:
- Paginated table of all past sessions
- Columns: date, duration, company, job title, status
- Click row to view full session transcript

**Build `components/dashboard/SessionCard.tsx`**

**Deliverable:** Full dashboard renders with real data from the database.

---

### PHASE 8 — Security & Encryption

**Goal:** All transcripts encrypted at rest. Zero data retention policy enforced.

**Steps:**
1. Build `lib/crypto.ts`:
   ```typescript
   // AES-GCM 256-bit encryption
   // encrypt(plaintext: string, key: string): Promise<string>
   // decrypt(ciphertext: string, key: string): Promise<string>
   // Uses Web Crypto API — works in Node.js 18+ and browser
   ```

2. Modify `app/api/answer/route.ts` to encrypt transcript before saving to DB

3. Modify transcript fetch routes to decrypt on read

4. Add rate limiting to all API routes via Upstash Redis:
   - `/api/transcribe`: 10 req/min per user
   - `/api/answer`: 20 req/min per user
   - `/api/resume`: 5 req/hour per user

5. Add input sanitization via Zod on all API routes

6. Implement auto-delete: session transcripts deleted 30 days after `endedAt`

**Deliverable:** All transcripts encrypted in DB, rate limiting active, input validation on all routes.

---

### PHASE 9 — Landing Page

**Goal:** A polished, conversion-optimised public landing page.

**Build `app/page.tsx`** with these sections:

1. **Hero** (`components/landing/Hero.tsx`):
   - Large headline: "Hear the question. Nail the answer."
   - Subheading: "The invisible AI copilot for your most important interviews."
   - Single CTA: "Get started — it's free" → navigates to `/login`
   - Animated mockup of the overlay in action

2. **Features** (`components/landing/Features.tsx`):
   - Real-time transcription
   - Resume-aware answers
   - 100% invisible during screen share
   - Works on all platforms (Zoom, Meet, Teams)

3. **Footer**: links, tagline, GitHub

**Design principles:**
- Deep indigo + white color scheme
- Smooth scroll animations (CSS only, no GSAP)
- Mobile-responsive
- Lighthouse score target: 95+

**Deliverable:** Landing page live at `/`, fully responsive, with working CTA links.

---

### PHASE 10 — Electron Desktop App

**Goal:** Package Whisprly as a desktop overlay that sits invisibly above video calls.

**Steps:**
1. Add Electron dependencies:
   ```bash
   npm install --save-dev electron electron-builder concurrently wait-on
   ```

2. Build `electron/main.ts`:
   - Creates a `BrowserWindow` with:
     ```typescript
     {
       transparent: true,
       frame: false,
       alwaysOnTop: true,
       skipTaskbar: true,
       webPreferences: {
         nodeIntegration: false,
         contextIsolation: true,
         preload: path.join(__dirname, 'preload.js')
       }
     }
     ```
   - Loads `http://localhost:3000/session/[activeSessionId]`
   - Registers global keyboard shortcut: `CommandOrControl+Shift+W` to toggle visibility

3. Build `electron/preload.ts`:
   - Exposes safe IPC bridge to renderer
   - `window.whisprly.toggleVisibility()`
   - `window.whisprly.setOpacity(value: number)`

4. Build `electron/overlay.ts`:
   - Manages window positioning
   - Snaps to corner of screen (configurable: top-right default)
   - Resizable + draggable chrome

5. Add npm scripts:
   ```json
   "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && electron .\"",
   "electron:build": "npm run build && electron-builder"
   ```

6. Create `electron-builder.yml` config for Mac + Windows builds

**Deliverable:** `npm run electron:dev` launches the Next.js app + transparent overlay window.

---

### PHASE 11 — Testing & Quality

**Goal:** Core functionality covered by tests. Code quality enforced.

**Steps:**
1. Set up Vitest for unit tests
2. Write unit tests for:
   - `lib/crypto.ts` — encrypt/decrypt round-trip
   - `lib/validators/` — Zod schema validation
   - `store/sessionStore.ts` — Zustand actions
3. Set up Playwright for E2E tests
4. Write E2E tests for:
   - Auth flow (login → dashboard)
   - Resume upload
   - Session creation + navigation
5. Configure ESLint + Prettier
6. Add `pre-commit` hook via Husky + lint-staged

**Deliverable:** `npm test` passes. `npm run lint` passes with zero errors.

---

### PHASE 12 — Deployment

**Goal:** Whisprly.ai live on Vercel with production database and all services connected.

**Steps:**
1. Push repo to GitHub (`whisprly`)
2. Connect GitHub repo to Vercel
3. Configure all environment variables in Vercel dashboard
4. Set up Supabase production project + run `prisma db push`
5. Set up Upstash Redis production instance
6. Configure custom domain `whisprly.ai` (or `whisprly.vercel.app` for now)
7. Run production smoke tests:
   - Sign in
   - Upload resume
   - Start session
   - Verify streaming answer works end-to-end

**Deliverable:** App live on production URL, all features working end-to-end.

---

## CODING STANDARDS

Enforce these throughout every file you generate:

- **TypeScript strict mode** — no `any`, no implicit returns
- **Named exports** for components, default exports only for page files
- **Server Components by default** — only add `"use client"` when necessary
- **Error handling** — every API route wrapped in try/catch with proper HTTP status codes
- **Loading states** — every async UI action has a loading indicator
- **Empty states** — every list/table has an empty state design
- **Responsive** — every component works on mobile (375px) and desktop (1440px)
- **Accessibility** — all interactive elements have `aria-label`, focus states visible
- **No inline styles** — Tailwind classes only
- **Comments** — JSDoc on all exported functions, inline comments on complex logic only

---

## IMPORTANT INSTRUCTIONS FOR KIRO

1. **Always ask before creating a new file** if it wasn't listed in the folder structure above
2. **Never skip a phase** — complete each one fully before proceeding
3. **After each phase**, output: ✅ Phase [N] complete — [brief summary] — Ready for Phase [N+1]?
4. **If you encounter a decision point** (e.g., which Supabase region to use, which OpenAI model version), pause and ask
5. **Always provide the full file** — never output partial files or diffs unless I specifically ask for a diff
6. **Test each API route** with a curl example after building it
7. **Respect the design system** — always use the Whisprly indigo/white palette, never default blue
8. **Use the Vercel AI SDK** for all streaming — never implement raw SSE manually

---

## START COMMAND

Begin with **Phase 1**. Confirm the scaffold command output, install all dependencies, and show me the final `package.json` dependencies section before proceeding.