
# 🧠 McqBattleApp

A real-time multiplayer MCQ battle game where users can challenge each other, join private rooms, and play quiz battles with live question delivery and scoring. Built with a modern stack — Express, Prisma, PostgreSQL, Pusher, and Next.js.

---

## 🔧 Tech Stack

- **Frontend:** Next.js, Tailwind CSS, Pusher
- **Backend:** Node.js, Express.js, Prisma, PostgreSQL
- **Real-Time Communication:** Pusher
- **Authentication:** JWT
- **Email Service:** Gmail SMTP
- **Deployment:** Vercel (Frontend), Render (Backend)

---

## 📦 Folder Structure

```

mcq-battle-app/
├── backend/
└── frontend/

````

---

## 🚀 Getting Started Locally

### 1. Clone the repository

```bash
git clone https://github.com/asr-orzz/McqBattleApp
cd McqBattleApp
````

---

## ⚙️ Backend Setup

### Step 1: Navigate to the backend directory

```bash
cd backend
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Create your `.env` file

Copy the example file:

```bash
cp .env.example .env
```

Fill in the following values in `.env`:

```env
DATABASE_URL=""               # PostgreSQL connection string
USER_JWT_SECRET_KEY=""        # Secret key for JWT signing
PUSHER_APP_ID=""              # From your Pusher dashboard
PUSHER_KEY=""
PUSHER_SECRET=""
PUSHER_CLUSTER=""
OTP_SECRET=""                 # Any random string used for OTP encryption
GMAIL_USER=""                 # Gmail address used to send OTPs
GMAIL_APP_PASS=""             # App-specific password from Gmail
```

### Step 4: Run database migrations (if using Prisma)

```bash
npx prisma generate
npx prisma migrate dev
```

### Step 5: Start the backend server

```bash
npm run start
```

The backend should now be running on `http://localhost:3001` (or your configured port).

---

## 🌐 Frontend Setup

### Step 1: Navigate to the frontend directory

```bash
cd ../frontend
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Create your `.env.local` file

```bash
touch .env.local
```

Fill in the following environment variables:

```env
NEXT_PUBLIC_PUSHER_KEY=""     # Same as PUSHER_KEY from backend
NEXT_PUBLIC_PUSHER_CLUSTER="" # Same as PUSHER_CLUSTER
```

### Step 4: Run the frontend dev server

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`.

---

## ✅ Features

* 🔐 Secure Signup & Login with JWT
* 📩 OTP Verification via Email
* 👥 Real-Time 1v1 Multiplayer Matchmaking
* 🧠 Live MCQ Questions with Timed Answers
* 📊 Game Stats & Leaderboard (optional)
* 🔒 Private Games with Invite System

---

## 📦 Deployment

* **Frontend:** Deployed to [Vercel](https://vercel.com/)
* **Backend:** Deployed on Render

---

## 🤝 Contributing

Feel free to fork this repo and contribute via pull requests! Let’s build the ultimate quiz battle experience together.

---

## 📧 Contact

For issues or suggestions, feel free to reach out via GitHub Issues or contact the maintainer directly.


