"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy, Clock, Gamepad2, LogOut, Play, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import pusherClient from "@/lib/pusherClient"
import { toastSuccess, toastError } from "@/utils/toast"

interface User {
  id: string
  username: string
}

interface Player {
  id: string
  userId: string
  gameId: string
  score: number
  user: User
}

interface Option {
  id: string
  option: string
  isCorrect?: boolean
}

interface Question {
  id: string
  question: string
  options: Option[]
}

interface Game {
  id: string
  game: string
  status: "WAITING" | "STARTED" | "ENDED"
  userId: string
  user: User
  players: Player[]
}

export default function GameLobbyPage() {
  const router = useRouter()
  const params = useParams()
  const gameId = params.gameId as string

  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [answerResult, setAnswerResult] = useState<{ isCorrect: boolean; message: string } | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [startingGame, setStartingGame] = useState(false)

  // Fetch game details
  const fetchGameDetails = async () => {
    try {
      const token = localStorage.getItem("Authorization")
      const userId = localStorage.getItem("userId")

      if (!token || !userId) {
        router.push("/auth")
        return
      }

      setCurrentUserId(userId)

      const response = await fetch(`/api/v1/games/${gameId}`, {
        headers: {
          Authorization: token,
        },
      })

      const data = await response.json()
      setGame(data.game)
      setIsOwner(data.game.userId === userId)

      if (data.game.status === "STARTED") {
        fetchFirstQuestion()
      }
    } catch (error) {
      console.error("Error fetching game details:", error)
      toastError("Failed to load game details")
    } finally {
      setLoading(false)
    }
  }

  // Fetch first question when game starts
  const fetchFirstQuestion = async () => {
    try {
      const token = localStorage.getItem("Authorization")

      if (!token) {
        router.push("/auth")
        return
      }

      const response = await fetch(`/api/players/first-question?gameId=${gameId}`, {
        headers: {
          Authorization: token,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch first question")
      }

      const data = await response.json()

      if (data.id) {
        setCurrentQuestion(data)
      }
    } catch (error) {
      console.error("Error fetching first question:", error)
      toastError("Failed to load question")
    }
  }

  // Submit answer
  const submitAnswer = async (optionId: string) => {
    setSubmitting(true)
    setSelectedOption(optionId)

    try {
      const token = localStorage.getItem("Authorization")
      const userId = localStorage.getItem("userId")

      if (!token || !userId || !currentQuestion) {
        return
      }

      const response = await fetch("/api/players/player-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          gameId,
          userId,
          questionId: currentQuestion.id,
          optionId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit answer")
      }

      const data = await response.json()

      // Show result
      setAnswerResult({
        isCorrect: data.isCorrect,
        message: data.isCorrect ? "Correct answer!" : "Wrong answer!",
      })

      // Load next question after a delay
      setTimeout(() => {
        setAnswerResult(null)
        setSelectedOption(null)

        if (data.nextQuestion) {
          setCurrentQuestion(data.nextQuestion)
        } else {
          setCurrentQuestion(null)
          toastSuccess("You've answered all questions!")
        }
      }, 2000)
    } catch (error) {
      console.error("Error submitting answer:", error)
      toastError("Failed to submit answer")
    } finally {
      setSubmitting(false)
    }
  }

  // Start game (for game owner)
  const startGame = async () => {
    setStartingGame(true)

    try {
      const token = localStorage.getItem("Authorization")

      if (!token) {
        router.push("/auth")
        return
      }

      const response = await fetch(`/api/games/${gameId}/start`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to start game")
      }

      toastSuccess("The game has started!")

      // Game will be updated via Pusher
    } catch (error) {
      console.error("Error starting game:", error)
      toastError("Failed to start game")
    } finally {
      setStartingGame(false)
    }
  }

  // Leave game
  const leaveGame = async () => {
    try {
      const token = localStorage.getItem("Authorization")
      const userId = localStorage.getItem("userId")

      if (!token || !userId) {
        router.push("/auth")
        return
      }

      const response = await fetch("/api/players/player-leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          gameId,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to leave game")
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Error leaving game:", error)
      toastError("Failed to leave game")
    }
  }

  // Set up Pusher subscriptions
  useEffect(() => {
    if (!gameId) return

    const channel = pusherClient.subscribe(`game-${gameId}`)

    // Player joined
    channel.bind("player-joined", (data: { player: Player }) => {
      setGame((prevGame) => {
        if (!prevGame) return prevGame

        return {
          ...prevGame,
          players: [...prevGame.players, data.player],
        }
      })

      toastSuccess(`${data.player.user.username} joined the game!`)
    })

    // Player left
    channel.bind("player-left", (data: { userId: string }) => {
      setGame((prevGame) => {
        if (!prevGame) return prevGame

        return {
          ...prevGame,
          players: prevGame.players.filter((player) => player.userId !== data.userId),
        }
      })
    })

    // Game started
    channel.bind("game-started", () => {
      setGame((prevGame) => {
        if (!prevGame) return prevGame

        return {
          ...prevGame,
          status: "STARTED",
        }
      })

      fetchFirstQuestion()

      toastSuccess("The game has started!")
    })

    // Player answered
    channel.bind("player-answered", (data: { userId: string; isCorrect: boolean; newScore: number }) => {
      setGame((prevGame) => {
        if (!prevGame) return prevGame

        return {
          ...prevGame,
          players: prevGame.players.map((player) =>
            player.userId === data.userId ? { ...player, score: data.newScore } : player,
          ),
        }
      })
    })

    // Game ended
    channel.bind("game-ended", () => {
      setGame((prevGame) => {
        if (!prevGame) return prevGame

        return {
          ...prevGame,
          status: "ENDED",
        }
      })

      toastSuccess("The game has ended!")
    })

    // Initial fetch
    fetchGameDetails()

    // Cleanup
    return () => {
      pusherClient.unsubscribe(`game-${gameId}`)
    }
  }, [gameId, router])

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("Authorization")

    if (!token) {
      router.push("/auth")
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-blue-400">Loading Game Lobby...</h2>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-400">Game not found</h2>
              <p className="mt-2 text-slate-300">This game may have been deleted or you don't have access.</p>
              <Button onClick={() => router.push("/dashboard")} className="mt-4 bg-blue-600 hover:bg-blue-700">
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Sort players by score (highest first)
  const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4 md:p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Game Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 bg-slate-800 rounded-lg p-4 border border-slate-700 shadow-lg">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-400 flex items-center">
              <Gamepad2 className="h-7 w-7 mr-2 text-blue-500" />
              {game.game}
            </h1>
            <p className="text-slate-300 mt-1">
              Hosted by <span className="font-medium">{game.user.username}</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <Badge
              className={`
                px-3 py-1 text-sm font-medium rounded-full
                ${
                  game.status === "WAITING"
                    ? "bg-amber-600 text-amber-100"
                    : game.status === "STARTED"
                      ? "bg-green-600 text-green-100"
                      : "bg-red-600 text-red-100"
                }
              `}
            >
              {game.status === "WAITING" ? (
                <>
                  <Clock className="h-3.5 w-3.5 mr-1" /> Waiting
                </>
              ) : game.status === "STARTED" ? (
                <>
                  <Play className="h-3.5 w-3.5 mr-1" /> In Progress
                </>
              ) : (
                <>
                  <Trophy className="h-3.5 w-3.5 mr-1" /> Ended
                </>
              )}
            </Badge>

            {!isOwner && (
              <Button
                onClick={leaveGame}
                variant="outline"
                size="sm"
                className="ml-3 border-red-800 text-red-400 hover:bg-red-900 hover:text-red-200"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Leave
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Players List */}
          <div className="md:col-span-1">
            <Card className="bg-slate-800 border-slate-700 shadow-lg">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-blue-400 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Players ({game.players.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {sortedPlayers.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No players have joined yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedPlayers.map((player) => (
                      <div
                        key={player.id}
                        className={`
                          flex items-center justify-between p-3 rounded-md
                          ${player.userId === currentUserId ? "bg-blue-900/30 border border-blue-800" : "bg-slate-700/50"}
                        `}
                      >
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {player.user.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="ml-3 font-medium">
                            {player.user.username}
                            {player.userId === game.userId && (
                              <span className="ml-2 text-xs bg-amber-800 text-amber-200 px-1.5 py-0.5 rounded">
                                Host
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="font-bold">{player.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              {isOwner && game.status === "WAITING" && (
                <CardFooter className="border-t border-slate-700 pt-4">
                  <Button
                    onClick={startGame}
                    disabled={startingGame || game.players.length === 0}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {startingGame ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Starting Game...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" /> Start Game
                      </>
                    )}
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>

          {/* Game Content */}
          <div className="md:col-span-2">
            {game.status === "WAITING" ? (
              <Card className="bg-slate-800 border-slate-700 shadow-lg h-full">
                <CardHeader className="border-b border-slate-700">
                  <CardTitle className="text-blue-400">Waiting for Game to Start</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <div className="w-24 h-24 rounded-full bg-blue-900/30 border-4 border-blue-600/50 flex items-center justify-center mx-auto mb-6">
                      <Clock className="h-12 w-12 text-blue-400 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-300 mb-2">Game Lobby</h3>
                    <p className="text-slate-300 mb-6 max-w-md mx-auto">
                      {isOwner
                        ? "You can start the game when all players have joined."
                        : "Waiting for the host to start the game..."}
                    </p>

                    {isOwner && (
                      <Button
                        onClick={startGame}
                        disabled={startingGame || game.players.length === 0}
                        size="lg"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {startingGame ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Starting Game...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" /> Start Game
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : game.status === "STARTED" ? (
              <Card className="bg-slate-800 border-slate-700 shadow-lg">
                <CardHeader className="border-b border-slate-700">
                  <CardTitle className="text-blue-400">
                    {currentQuestion ? "Answer the Question" : "Game Complete"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {currentQuestion ? (
                    <div>
                      {/* Question */}
                      <div className="mb-6 p-4 bg-slate-700 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-1">Question:</h3>
                        <p className="text-xl text-blue-200">{currentQuestion.question}</p>
                      </div>

                      {/* Answer Result Feedback */}
                      {answerResult && (
                        <div
                          className={`mb-6 p-4 rounded-lg flex items-center ${
                            answerResult.isCorrect
                              ? "bg-green-900/40 border border-green-700"
                              : "bg-red-900/40 border border-red-700"
                          }`}
                        >
                          {answerResult.isCorrect ? (
                            <CheckCircle2 className="h-6 w-6 text-green-400 mr-3" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-400 mr-3" />
                          )}
                          <span
                            className={`text-lg font-medium ${
                              answerResult.isCorrect ? "text-green-300" : "text-red-300"
                            }`}
                          >
                            {answerResult.message}
                          </span>
                        </div>
                      )}

                      {/* Options */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium text-white mb-2">Select your answer:</h3>
                        {currentQuestion.options.map((option) => (
                          <Button
                            key={option.id}
                            onClick={() => submitAnswer(option.id)}
                            disabled={submitting || selectedOption !== null}
                            className={`w-full justify-start text-left p-4 h-auto ${
                              selectedOption === option.id
                                ? "bg-blue-700 hover:bg-blue-700 border-2 border-blue-400"
                                : "bg-slate-700 hover:bg-slate-600"
                            }`}
                          >
                            <span className="text-lg">{option.option}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 rounded-full bg-green-900/30 border-4 border-green-600/50 flex items-center justify-center mx-auto mb-6">
                        <Trophy className="h-12 w-12 text-yellow-400" />
                      </div>
                      <h3 className="text-xl font-bold text-green-300 mb-2">All Questions Answered!</h3>
                      <p className="text-slate-300 mb-6">You've completed all questions in this game.</p>
                      <Button onClick={() => router.push("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
                        Return to Dashboard
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700 shadow-lg">
                <CardHeader className="border-b border-slate-700">
                  <CardTitle className="text-blue-400">Game Ended</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <div className="w-24 h-24 rounded-full bg-blue-900/30 border-4 border-blue-600/50 flex items-center justify-center mx-auto mb-6">
                      <Trophy className="h-12 w-12 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-300 mb-2">Game Complete</h3>
                    <p className="text-slate-300 mb-6">This game has ended. Check the final scores!</p>
                    <Button onClick={() => router.push("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
                      Return to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

