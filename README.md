# QuizForge

Real-time multiplayer MCQ battles: create a room, invite players, generate questions with AI, and compete with live scoring.

**Live app:** [mcq-battle-app.vercel.app](https://mcq-battle-app.vercel.app/)  
**API:** [mcqbattleapp.onrender.com](https://mcqbattleapp.onrender.com/health)

---

## Tech stack

| Layer | Stack |
| --- | --- |
| Frontend | Next.js, Tailwind CSS, Pusher JS |
| Backend | Node.js, Express, Prisma, PostgreSQL |
| Realtime | Pusher |
| Auth | JWT + email OTP (Brevo) |
| AI questions | Groq LLM API |
| Hosting | Vercel (frontend), Render (backend) |

---

## Project structure

```
McqBattleApp/
├── backend/     # Express API + Prisma
└── frontend/    # Next.js app (QuizForge UI)
```

---

## Features

- Email signup with OTP verification (Brevo)
- Create private games and approve join requests
- AI question generation from a topic (Groq), plus manual questions
- Live lobby with shareable Game ID
- Real-time battle play via Pusher (answers, scores, game start/end)
- Live leaderboard during play and final results
- Played Games review: your answers, correct options, explanations, and standings

---

## Local setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted, e.g. Neon)
- Accounts: [Pusher](https://pusher.com), [Brevo](https://app.brevo.com), [Groq](https://console.groq.com)

### 1. Clone

```bash
git clone https://github.com/asr-orzz/McqBattleApp
cd McqBattleApp
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill `backend/.env`:

```env
DATABASE_URL=""
USER_JWT_SECRET_KEY=""
PUSHER_APP_ID=""
PUSHER_KEY=""
PUSHER_SECRET=""
PUSHER_CLUSTER=""
OTP_SECRET=""
FRONTEND_URL="http://localhost:3000"

# Must be an API key starting with xkeysib- (NOT an SMTP xsmtpsib- key).
# Create at Brevo → SMTP & API → API Keys.
# Verify BREVO_SENDER_EMAIL as a sender in Brevo.
BREVO_API_KEY=""
BREVO_SENDER_EMAIL=""
BREVO_SENDER_NAME="QuizForge"

GROQ_API_KEY=""
GROQ_MODEL="openai/gpt-oss-20b"
```

Generate Prisma client and push schema:

```bash
npx prisma generate
npx prisma db push
```

Start the API (dev with reload):

```bash
npm run dev
```

API runs at `http://localhost:3001`. Health check: `GET /health`.

### 3. Frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env` (or `.env.local`):

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001/api/v1"
NEXT_PUBLIC_PUSHER_KEY=""      # same as backend PUSHER_KEY
NEXT_PUBLIC_PUSHER_CLUSTER=""  # same as backend PUSHER_CLUSTER
```

Start the UI:

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## Brevo email (OTP) — important

OTP signup fails if Brevo is misconfigured. Checklist:

1. Use an **API key** (`xkeysib-...`), not an SMTP key (`xsmtpsib-...`).
2. Verify **BREVO_SENDER_EMAIL** in Brevo → Senders.
3. If Brevo has **Authorised IPs** enabled, either add your IP or **turn IP restriction off**.  
   Render’s outbound IPs change on free plans, so IP allowlists break production OTP.
4. On Render, set the same Brevo vars and redeploy after changes. SMTP ports are blocked on Render; the app uses Brevo’s HTTPS API.

---

## Deployment

### Frontend (Vercel)

Set environment variables:

- `NEXT_PUBLIC_API_BASE_URL` → `https://<your-render-service>.onrender.com/api/v1`
- `NEXT_PUBLIC_PUSHER_KEY`
- `NEXT_PUBLIC_PUSHER_CLUSTER`

### Backend (Render)

Set at least:

- `DATABASE_URL`
- `USER_JWT_SECRET_KEY`
- `OTP_SECRET`
- `FRONTEND_URL` → your Vercel URL, e.g. `https://mcq-battle-app.vercel.app` (no trailing slash)
- `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`
- `BREVO_API_KEY` (`xkeysib-...`), `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`
- `GROQ_API_KEY`, `GROQ_MODEL`

`FRONTEND_URL` must match the browser origin or CORS will block the UI.

Build/start on Render typically:

```bash
npm install
npm run build
node dist/index.js
```

(Use your service’s start command if it differs.)

---

## Useful scripts

**Backend**

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server (nodemon) |
| `npm run build` | `prisma generate` + TypeScript compile |
| `npm start` | Build then run `dist/index.js` |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:dbpush` | Push schema to DB |

**Frontend**

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve production build |

---

## Contributing

Fork the repo and open a pull request with a clear description of the change.

## License / contact

Issues and suggestions: use GitHub Issues on this repository.
