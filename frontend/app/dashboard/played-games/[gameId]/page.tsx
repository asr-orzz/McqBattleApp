"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Trophy, Crown, CheckCircle2, XCircle, HelpCircle } from "lucide-react"
import { getPlayedGameReview } from "@/lib/api/player"

type ReviewData = Awaited<ReturnType<typeof getPlayedGameReview>>

export default function PlayedGameReviewPage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.gameId as string
  const [data, setData] = useState<ReviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("Authorization")
      if (!token) {
        router.push("/auth")
        return
      }

      try {
        const review = await getPlayedGameReview(token, gameId)
        setData(review)
      } catch {
        setError("Could not load this game review")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [gameId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-6">
        <div className="container mx-auto px-4 max-w-6xl space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 pt-6">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-700 mb-4">{error || "Game review not found"}</p>
              <Button onClick={() => router.push("/dashboard/played-games")} className="bg-blue-600 hover:bg-blue-700">
                Back to played games
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-6 pb-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/played-games")}
          className="mb-4 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Played Games
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{data.game.name}</h1>
          <p className="text-slate-600">
            Created by {data.game.creatorUsername} · Your score {data.myScore}/{data.questionCount}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border border-slate-200 shadow-sm lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                Leaderboard
              </CardTitle>
              <CardDescription>Scores for this game</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.leaderboard.map((player) => (
                <div
                  key={player.userId}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                    player.isCurrentUser ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {player.rank === 1 ? (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <span className="w-4 text-sm text-slate-500">{player.rank}</span>
                    )}
                    <span className="font-medium text-slate-900">
                      {player.username}
                      {player.isCurrentUser ? " (you)" : ""}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">{player.score}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            {data.questions.map((question, index) => (
              <Card key={question.id} className="border border-slate-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base text-slate-900">
                      {index + 1}. {question.question}
                    </CardTitle>
                    {question.selectedOptionId == null ? (
                      <Badge className="bg-slate-100 text-slate-700">Not answered</Badge>
                    ) : question.isCorrect ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Correct
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Incorrect
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {question.options.map((option) => {
                      const selected = option.id === question.selectedOptionId
                      const correct = option.isCorrect === true
                      let className = "rounded-md border px-3 py-2 text-sm border-slate-200 bg-white text-slate-700"
                      if (correct) {
                        className = "rounded-md border px-3 py-2 text-sm border-green-300 bg-green-50 text-green-900"
                      } else if (selected) {
                        className = "rounded-md border px-3 py-2 text-sm border-red-300 bg-red-50 text-red-900"
                      }
                      return (
                        <div key={option.id} className={className}>
                          {option.option}
                          {selected ? " · your answer" : ""}
                          {correct ? " · correct answer" : ""}
                        </div>
                      )
                    })}
                  </div>
                  {question.explanation ? (
                    <div className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-700">
                      <span className="font-medium text-slate-900 flex items-center mb-1">
                        <HelpCircle className="w-4 h-4 mr-1 text-blue-600" />
                        Explanation
                      </span>
                      {question.explanation}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Explanation is shown after you answer this question.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
