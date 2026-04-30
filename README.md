<div align="center">

# Whisprly.ai

**Hear the question. Nail the answer.**

The invisible AI copilot for your most important interviews. Real-time transcription and resume-aware answers — powered by GPT-4o and Claude Sonnet.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://prisma.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## What is Whisprly?

Whisprly listens to interview questions in real time, processes them using state-of-the-art LLMs, and displays contextually accurate, resume-aware answers — invisibly, without being detected by screen-sharing or proctoring software.

- **Real-time transcription** via Web Speech API with 2-second silence detection
- **Resume-aware answers** — upload your PDF once, every answer pulls from your experience
- **100% invisible** — transparent overlay that screen-sharing software cannot capture
- **Streams in under a second** — GPT-4o and Claude Sonnet stream tokens as they generate
- **End-to-end encrypted** — all transcripts encrypted with AES-GCM 256-bit at rest
- **Desktop app** — Electron overlay that floats above Zoom, Meet, Teams, and Webex

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State | Zustand |
| Speech-to-text | Web Speech API + OpenAI Whisper (fallback) |
| LLM | GPT-4o (primary) + Claude Sonnet (secondary) |
| AI streaming | Vercel AI SDK |
| ORM | Prisma 7 |
| Database | PostgreSQL via Supabase |
| Cache / Rate limiting | Redis via Upstash |
| Auth | NextAuth.js v5 (Google, GitHub, magic link) |
| File storage | Supabase Storage |
| Encryption | Web Crypto API (AES-GCM 256-bit) |
| Desktop | Electron (transparent overlay) |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- An [OpenAI](https://platform.openai.com) API key
- An [Upstash Redis](https://console.upstash.com) database
- A [Resend](https://resend.com) API key (for magic link email)
- Google or GitHub OAuth app credentials

### 1. Clone and install

```bash
git clone https://github.com/AnshuHemal/whisprly.git
cd whisprly
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local` with your credentials. See the [Environment Variables](#environment-variables) section below for details on where to get each key.

### 3. Set up the database

```bash
# Push the schema to Supabase
npm run db:push

# Seed with sample data (optional)
npm run db:seed
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Description | Where to get it |
|---|---|---|
| `NEXTAUTH_SECRET` | Random secret for JWT signing | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App base URL | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | [Google Cloud Console](https://console.cloud.google.com) |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | [GitHub Developer Settings](https://github.com/settings/developers) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | [GitHub Developer Settings](https://github.com/settings/developers) |
| `DATABASE_URL` | Supabase pooler URL (port 6543) | Supabase → Settings → Database |
| `DIRECT_URL` | Supabase session pooler (port 5432) | Supabase → Settings → Database |
| `OPENAI_API_KEY` | OpenAI API key | [platform.openai.com](https://platform.openai.com/api-keys) |
| `ANTHROPIC_API_KEY` | Anthropic API key | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase → Settings → API |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | [console.upstash.com](https://console.upstash.com) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | [console.upstash.com](https://console.upstash.com) |
| `RESEND_API_KEY` | Resend API key for magic links | [resend.com](https://resend.com) |
| `ENCRYPTION_KEY` | AES-256 key for transcript encryption | `openssl rand -base64 32` |
| `CRON_SECRET` | Secret for the cleanup cron endpoint | `openssl rand -base64 24` |

> **OAuth callback URLs**
> - GitHub: `http://localhost:3000/api/auth/callback/github`
> - Google: `http://localhost:3000/api/auth/callback/google`

---

## Available Scripts

```bash
# Development
npm run dev              # Start Next.js dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run format           # Format with Prettier

# Database
npm run db:push          # Push schema to database
npm run db:seed          # Seed with sample data
npm run db:studio        # Open Prisma Studio

# Desktop app
npm run electron:dev     # Run Next.js + Electron together
npm run electron:compile # Compile Electron TypeScript only
npm run package:win      # Build Windows installer (.exe)
npm run package:win-dir  # Build unpacked Windows app (no admin needed)
```

---

## Desktop App (Electron)

Whisprly ships as a transparent, always-on-top desktop overlay that floats above your video call without being captured by screen-sharing software.

**Run in dev mode:**
```bash
# Terminal 1
npm run dev

# Terminal 2 (once port 3000 is ready)
npm run electron:compile && node_modules\.bin\electron .
```

**Or use the combined command:**
```bash
npm run electron:dev
```

**Build a Windows `.exe`:**
```bash
# Produces dist\win-unpacked\Whisprly.exe (no admin required)
npm run package:win-dir

# Produces a full NSIS installer (requires admin for code signing tools)
# Run PowerShell as Administrator, then:
npm run package:win
```

**Global keyboard shortcut:** `Ctrl+Shift+W` toggles the overlay visibility.

---

## Project Structure

```
whisprly/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login + signup pages
│   │   ├── (dashboard)/     # Dashboard + history pages
│   │   ├── session/[id]/    # Live session UI
│   │   └── api/             # API routes
│   ├── components/
│   │   ├── auth/            # Login form
│   │   ├── dashboard/       # Dashboard components
│   │   ├── landing/         # Landing page sections
│   │   ├── session/         # Session overlay components
│   │   └── ui/              # shadcn/ui components
│   ├── hooks/               # React hooks (audio, speech, stream)
│   ├── lib/                 # Clients and utilities
│   ├── store/               # Zustand session store
│   └── types/               # TypeScript types
├── electron/                # Electron main process
├── prisma/                  # Schema and seed
└── public/                  # Static assets
```

---

## How It Works

1. **Upload your resume** — Whisprly parses the PDF and stores your experience as context
2. **Start a session** — optionally add the job title, company, and job description
3. **Press Space** — the mic activates and listens for the interviewer's question
4. **2 seconds of silence** — Whisprly detects the question is complete and starts generating
5. **Answer streams in** — read it naturally while the interviewer waits for your response
6. **Session history** — every Q&A pair is saved (encrypted) and exportable as `.txt`

---

## Security

- All transcript data is encrypted with **AES-GCM 256-bit** before being stored in the database
- Transcripts are **auto-deleted 30 days** after a session ends
- All API routes are **rate-limited** via Upstash Redis
- Input sanitization on all user-supplied text fields
- Security headers (CSP, X-Frame-Options, Referrer-Policy) on every response

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.local.example`
4. Deploy

The `vercel.json` cron job runs the transcript cleanup daily at 3am UTC.

### Database

Run migrations against your production Supabase project:
```bash
DATABASE_URL=<prod-url> DIRECT_URL=<prod-direct-url> npm run db:push
```

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

---

## License

[MIT](LICENSE) © 2026 Whisprly.ai
