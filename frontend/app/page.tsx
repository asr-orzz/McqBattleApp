"use client"

import type { ComponentType } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  Users,
  Trophy,
  Clock,
  Brain,
  Sparkles,
  Play,
  CheckCircle,
  Gamepad2,
  History,
  ShieldCheck,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/60 lg:px-6">
        <Link className="flex items-center" href="/">
          <Gamepad2 className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-2xl font-bold text-gray-900">QuizBattle</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-6 sm:flex">
          <Link className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600" href="#how-it-works">
            How It Works
          </Link>
        </nav>
        <div className="ml-6 flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-gray-700 hover:text-blue-600" onClick={() => router.push("/auth")}>
            Sign In
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/auth")}>
            Get Started
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative w-full overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 md:py-24 lg:py-32">
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />
          <div className="container relative px-4 md:px-6">
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              <div className="flex flex-col justify-center space-y-6">
                <Badge variant="secondary" className="w-fit border border-blue-100 bg-white text-blue-700">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI question generation included
                </Badge>
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl xl:text-6xl">
                    Host live MCQ battles.
                    <span className="block text-blue-600">Generate questions in seconds.</span>
                  </h1>
                  <p className="max-w-[580px] text-lg text-gray-500 md:text-xl">
                    QuizBattle lets you create timed quiz rooms, invite players, and compete in real time. Type a topic
                    and let AI write the questions, options, answers, and explanations for you.
                  </p>
                </div>
                <div className="flex flex-col gap-3 min-[400px]:flex-row">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/auth")}>
                    <Play className="mr-2 h-4 w-4" />
                    Start a Battle
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => router.push("/auth")}
                  >
                    Create free account
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Free to play
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    No downloads
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    AI + manual questions
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-6 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-25 blur-3xl" />
                <Card className="relative border-0 bg-white/90 shadow-2xl backdrop-blur">
                  <CardHeader className="pb-3">
                    <div className="mb-1 flex items-center justify-between">
                      <Badge className="bg-blue-600">Create Game</Badge>
                      <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                        <Sparkles className="mr-1 h-3 w-3" />
                        AI ready
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">JavaScript Fundamentals</CardTitle>
                    <CardDescription>Topic generated in one click</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Generate with AI</p>
                      <p className="mt-1 text-sm text-gray-700">Topic: Closures, promises, and event loop · 8 questions</p>
                    </div>
                    <div className="space-y-2">
                      <div className="rounded-lg border border-gray-100 p-3">
                        <p className="text-sm font-medium text-gray-900">What does Array.prototype.map return?</p>
                        <p className="mt-1 text-xs text-gray-500">A new array · Correct answer highlighted</p>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-sm">
                        <span className="text-gray-600">Players waiting</span>
                        <span className="font-medium text-gray-900">3 / 6</span>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Game</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Built for serious quiz battles</h2>
              <p className="mt-4 text-lg text-gray-500">
                Everything you need to create, host, and review MCQ games — without leaving the browser.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Sparkles}
                iconClass="bg-purple-100 text-purple-600"
                title="AI question generation"
                description="Enter a topic and question count. QuizBattle drafts MCQs with four options, a correct answer, and an explanation you can edit before publishing."
              />
              <FeatureCard
                icon={Gamepad2}
                iconClass="bg-blue-100 text-blue-600"
                title="Host your own rooms"
                description="Create a game, set the player limit, and approve who joins. You stay in control of the lobby until you start the battle."
              />
              <FeatureCard
                icon={Zap}
                iconClass="bg-indigo-100 text-indigo-600"
                title="Live multiplayer"
                description="Players answer in real time. Scores update as the round moves, so every question feels like a match, not a form."
              />
              <FeatureCard
                icon={Clock}
                iconClass="bg-orange-100 text-orange-600"
                title="Timed scoring"
                description="Each question runs on a clock. Fast, accurate answers climb the leaderboard before the next prompt appears."
              />
              <FeatureCard
                icon={Trophy}
                iconClass="bg-green-100 text-green-600"
                title="Instant leaderboards"
                description="See who led the room when the game ends. Rankings stay attached to that battle so rematches stay competitive."
              />
              <FeatureCard
                icon={History}
                iconClass="bg-red-100 text-red-600"
                title="Played-game review"
                description="Revisit answers, explanations, and scores after a match. Hosts can review a game even if they did not play."
              />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">From topic to live battle</h2>
              <p className="mt-4 text-lg text-gray-500">Four steps. Generate questions or write your own, then go live.</p>
            </div>
            <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: "1",
                  title: "Create a game",
                  text: "Name the room and add questions by hand, or generate a full set from a topic in seconds.",
                },
                {
                  step: "2",
                  title: "Share the lobby",
                  text: "Players find your game and send a join request. You accept the challengers you want.",
                },
                {
                  step: "3",
                  title: "Start the round",
                  text: "Launch the battle when the lobby is ready. Everyone sees the same timed MCQs.",
                },
                {
                  step: "4",
                  title: "Review the match",
                  text: "Check the leaderboard, explanations, and who got each question right after the game ends.",
                },
              ].map((item) => (
                <div key={item.step} className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-12 max-w-6xl rounded-2xl border border-blue-100 bg-white p-8 shadow-sm md:p-10">
              <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
                <div>
                  <Badge variant="secondary" className="mb-3 bg-purple-50 text-purple-700">
                    <Brain className="mr-1 h-3 w-3" />
                    Question studio
                  </Badge>
                  <h3 className="text-2xl font-bold text-gray-900">Write less. Host more.</h3>
                  <p className="mt-3 text-gray-500">
                    Pick a topic like “World Capitals” or “Data Structures”, choose 1–15 questions, and generate a
                    ready-to-edit set. Keep full control: tweak wording, swap options, or add your own items before the
                    room goes live.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <MiniStat icon={Users} label="Join requests" value="Approve who plays" />
                  <MiniStat icon={ShieldCheck} label="Email OTP" value="Verified accounts only" />
                  <MiniStat icon={Sparkles} label="AI drafts" value="Options + explanations" />
                  <MiniStat icon={Trophy} label="After the game" value="Scores and review" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-blue-600 py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">Ready to run your first battle?</h2>
              <p className="mt-4 max-w-xl text-lg text-blue-100">
                Create an account, generate a quiz from any topic, and start a live MCQ room in minutes.
              </p>
              <div className="mt-8 flex flex-col gap-3 min-[400px]:flex-row">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50" onClick={() => router.push("/auth")}>
                  <Play className="mr-2 h-4 w-4" />
                  Get started free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-transparent text-white hover:bg-white/10"
                  onClick={() => router.push("/auth")}
                >
                  Sign in
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} QuizBattle. All rights reserved.</p>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link className="text-xs text-gray-500 hover:text-blue-600" href="#features">
            Features
          </Link>
          <Link className="text-xs text-gray-500 hover:text-blue-600" href="#how-it-works">
            How it works
          </Link>
          <Link className="text-xs text-gray-500 hover:text-blue-600" href="/auth">
            Sign in
          </Link>
        </nav>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  iconClass,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>
  iconClass: string
  title: string
  description: string
}) {
  return (
    <Card className="h-full border-gray-100 shadow-sm">
      <CardHeader>
        <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-lg ${iconClass}`}>
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gradient-to-br from-blue-50/80 to-white p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  )
}
