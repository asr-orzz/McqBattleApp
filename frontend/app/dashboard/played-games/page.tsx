"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { History, Trophy, Users, HelpCircle, ArrowRight } from "lucide-react"
import { getPlayedGames } from "@/lib/api/player"

interface PlayedGame {
  id: string
  name: string
  status: "WAITING" | "STARTED" | "COMPLETED"
  createdAt: string
  creatorUsername: string
  myScore: number
  playerCount: number
  questionCount: number
  answeredCount: number
}

export default function PlayedGamesPage() {
  const router = useRouter()
  const [games, setGames] = useState<PlayedGame[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("Authorization")
      if (!token) {
        router.push("/auth")
        return
      }

      try {
        const data = await getPlayedGames(token)
        setGames(data.games || [])
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status
        if (status === 401) {
          router.push("/auth")
          return
        }
        setGames([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  const statusBadge = (status: PlayedGame["status"]) => {
    if (status === "COMPLETED") return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    if (status === "STARTED") return <Badge className="bg-blue-100 text-blue-800">In progress</Badge>
    return <Badge className="bg-slate-100 text-slate-700">Waiting</Badge>
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-6">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <History className="h-6 w-6 text-blue-600 mr-2" />
            Played Games
          </h1>
          <p className="text-slate-600 mt-1">Review your answers, explanations, and each game&apos;s leaderboard</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : games.length === 0 ? (
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="text-center py-12">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No games played yet</h3>
              <p className="text-slate-600 mb-4">Join an active game to start building your history</p>
              <Button onClick={() => router.push("/dashboard/active-games")} className="bg-blue-600 hover:bg-blue-700">
                Browse Active Games
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {games.map((game) => (
              <Card key={game.id} className="border border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg text-slate-900">{game.name}</CardTitle>
                      <CardDescription>Created by {game.creatorUsername}</CardDescription>
                    </div>
                    {statusBadge(game.status)}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <span className="flex items-center">
                      <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                      Score {game.myScore}/{game.questionCount}
                    </span>
                    <span className="flex items-center">
                      <HelpCircle className="w-4 h-4 mr-1 text-blue-500" />
                      Answered {game.answeredCount}/{game.questionCount}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1 text-slate-500" />
                      {game.playerCount} players
                    </span>
                  </div>
                  <Button
                    onClick={() => router.push(`/dashboard/played-games/${game.id}`)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    View review
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
