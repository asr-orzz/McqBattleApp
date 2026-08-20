"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Trophy,
  Clock,
  LogOut,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Crown,
  Medal,
  Award,
  Copy,
  ArrowLeft,
  Share2,
} from "lucide-react"
import pusherClient from "@/lib/pusherClient"
import { toastSuccess, toastError, toastInfo } from "@/utils/toast"
import axiosInstance from "@/lib/api/axiosInstance"
import { Toaster } from "react-hot-toast"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://mcqbattleapp.onrender.com/api/v1"

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
  status: "WAITING" | "STARTED" | "ENDED" | "COMPLETED"
  userId: string
  user: User
  players: Player[]
}

// Updated interface to match your API response
interface GameStatusResponse {
  name: string
  status: "WAITING" | "STARTED" | "ENDED" | "COMPLETED"
  ownerUsername: string
  players: Array<{
    id: string
    username: string
  }>
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

  const [questionIndex, setQuestionIndex] = useState<number>(0)
  const [loadingQuestion, setLoadingQuestion] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [showingAnswerResult, setShowingAnswerResult] = useState(false)

  // Store next question data in a ref to avoid re-renders
  const nextQuestionRef = useRef<Question | null>(null)
  const answerTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastAnsweredQuestionRef = useRef<string | null>(null)

  // Updated to work with your status endpoint
  const checkGameStatusAndLoad = async () => {
    try {
      // Use your status endpoint
      const statusResponse = await fetch(`${API_BASE}/games/${gameId}/status`)
      const statusData: GameStatusResponse = await statusResponse.json()

      const token = localStorage.getItem("Authorization")
      const userId = localStorage.getItem("userId")

      if (!token || !userId) {
        router.push("/dashboard/my-games")
        return
      }

      setCurrentUserId(userId)

      // Convert status response to game format
      const gameData: Game = {
        id: gameId,
        game: statusData.name,
        status: statusData.status,
        userId: statusData.players.find((p) => p.username === statusData.ownerUsername)?.id || "",
        user: {
          id: statusData.players.find((p) => p.username === statusData.ownerUsername)?.id || "",
          username: statusData.ownerUsername,
        },
        players: statusData.players.map((player) => ({
          id: player.id,
          userId: player.id,
          gameId: gameId,
          score: 0, // Score not available from status endpoint
          user: {
            id: player.id,
            username: player.username,
          },
        })),
      }

      setGame(gameData)
      setIsOwner(gameData.user.id === userId)

      // Handle different game states
      if (statusData.status === "WAITING") {
        console.log("Game is waiting. Players:", statusData.players)
      } else if (statusData.status === "STARTED") {
        // Game has started - check if user is a player and load first question
        const isPlayer = statusData.players.some((player) => player.id === userId)
        if (isPlayer) {
          await fetchFirstQuestion()
        }
      } else if (statusData.status === "ENDED" || statusData.status === "COMPLETED") {
        router.push(`/dashboard/played-games/${gameId}`)
        return
      }

      return statusData.status
    } catch (error) {
      console.error("Error fetching game status:", error)
      toastError("Failed to check game status")
      return null
    }
  }

  // Lightweight status check for periodic updates
  const quickStatusCheck = async () => {
    try {
      const statusResponse = await fetch(`${API_BASE}/games/${gameId}/status`)

      if (!statusResponse.ok) return

      const statusData: GameStatusResponse = await statusResponse.json()

      // Update game state with new status and players
      setGame((prevGame) => {
        if (!prevGame) return prevGame

        const updatedPlayers = statusData.players.map((statusPlayer) => {
          const existingPlayer = prevGame.players.find((p) => p.user.id === statusPlayer.id)
          return {
            id: statusPlayer.id,
            userId: statusPlayer.id,
            gameId: gameId,
            score: existingPlayer ? existingPlayer.score : 0,
            user: {
              id: statusPlayer.id,
              username: statusPlayer.username,
            },
          }
        })

        return {
          ...prevGame,
          game: statusData.name,
          status: statusData.status,
          user: {
            ...prevGame.user,
            username: statusData.ownerUsername,
          },
          players: updatedPlayers,
        }
      })

      return statusData.status
    } catch (error) {
      console.error("Error in quick status check:", error)
      return null
    }
  }

  // Fetch first question separately
  const fetchFirstQuestion = async () => {
    try {
      setLoadingQuestion(true)
      const token = localStorage.getItem("Authorization")

      if (!token) {
        router.push("/auth")
        return
      }

      console.log("Fetching first question...")
      const response = await axiosInstance.post(
        `/players/first-question?gameId=${gameId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      console.log("First question response:", response.data)

      const data = response.data

      if (data.id) {
        setCurrentQuestion(data)
        setQuestionIndex(1) // Start with question 1
        console.log("First question set:", data.question)
      } else {
        console.error("No question ID in response")
      }
    } catch (error) {
      console.error("Error fetching first question:", error)
      toastError("Failed to load question")
    } finally {
      setLoadingQuestion(false)
    }
  }

  // Submit answer
  const submitAnswer = async (optionId: string) => {
    if (!currentQuestion) return

    setSubmitting(true)
    setSelectedOption(optionId)
    setShowingAnswerResult(false) // Reset this flag

    // Store the current question ID to match with Pusher event
    lastAnsweredQuestionRef.current = currentQuestion.id

    try {
      const token = localStorage.getItem("Authorization")
      const userId = localStorage.getItem("userId")

      if (!token || !userId) {
        return
      }

      console.log(`Submitting answer for question ${currentQuestion.id}, option: ${optionId}`)
      const response = await fetch(`${API_BASE}/players/player-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      console.log("Answer submission response:", data)

      // Store next question in ref but don't show it yet
      if (data.nextQuestion) {
        console.log("Next question received:", data.nextQuestion.question)
        nextQuestionRef.current = data.nextQuestion
      } else {
        console.log("No more questions")
        nextQuestionRef.current = null
      }

      // Set a fallback timeout in case Pusher event doesn't arrive
      answerTimeoutRef.current = setTimeout(() => {
        console.log("Fallback timeout triggered - Pusher event might have been missed")

        // If we haven't received a Pusher event, show a generic result
        if (lastAnsweredQuestionRef.current === currentQuestion.id && !showingAnswerResult) {
          setAnswerResult({
            isCorrect: false, // We don't know, so default to false
            message: "Answer submitted! Moving to next question...",
          })
          setShowingAnswerResult(true)
          toastInfo("Answer submitted! Moving to next question...")

          // Move to next question after showing result
          setTimeout(() => {
            moveToNextQuestion()
          }, 2000)
        }
      }, 5000) // 5 second fallback
    } catch {
      toastError("Failed to submit answer")
      // Reset states on error
      setAnswerResult(null)
      setSelectedOption(null)
      setSubmitting(false)
    }
  }

  // Move to next question after showing answer result
  const moveToNextQuestion = () => {
    // Clear any pending timeouts
    if (answerTimeoutRef.current) {
      clearTimeout(answerTimeoutRef.current)
      answerTimeoutRef.current = null
    }

    // Reset the last answered question
    lastAnsweredQuestionRef.current = null

    if (nextQuestionRef.current) {
      console.log("Moving to next question:", nextQuestionRef.current.question)
      setCurrentQuestion(nextQuestionRef.current)
      setQuestionIndex((prev) => prev + 1)
      nextQuestionRef.current = null
    } else {
      // No more questions
      console.log("No more questions, ending game")
      setCurrentQuestion(null)
      setGameEnded(true)
    }

    setSelectedOption(null)
    setAnswerResult(null)
    setSubmitting(false)
    setShowingAnswerResult(false)
  }

  // Start game
  const startGame = async () => {
    setStartingGame(true)

    try {
      const token = localStorage.getItem("Authorization")
      const userId = localStorage.getItem("userId")

      if (!token || !userId) {
        router.push("/auth")
        return
      }

      const response = await fetch(`${API_BASE}/games/${gameId}/start`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to start game")
      }

      // Don't show success toast here since Pusher will handle it
      console.log("Game start request sent successfully")
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

      const response = await fetch(`${API_BASE}/players/player-leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId,
          userId,
        }),
      })

      router.push("/dashboard/my-games")
    } catch (error) {
      console.error("Error leaving game:", error)
      toastError("Failed to leave game")
    }
  }

  // Set up Pusher subscriptions
  useEffect(() => {
    if (!gameId) return

    console.log(`Subscribing to Pusher channel: game-${gameId}`)
    const channel = pusherClient.subscribe(`game-${gameId}`)

    // Player joined - use quick status check instead of full reload
    channel.bind("player-joined", async (data: { player: Player }) => {
      await quickStatusCheck()
      toastSuccess(`${data.player.user.username} joined the game!`)
    })

    // Player left - use quick status check
    channel.bind("player-left", async (data: { userId: string }) => {
      await quickStatusCheck()
    })

    // Game started - enhanced to handle your trigger data
    channel.bind("game-started", async (data: { gameId: string; status: string; startedAt: string }) => {
      console.log("Game started event received:", data)

      // Update game state immediately
      setGame((prevGame) => {
        if (!prevGame) return prevGame
        return {
          ...prevGame,
          status: "STARTED",
        }
      })

      // Fetch the current game status to get updated player list and check if current user is a player
      const token = localStorage.getItem("Authorization")
      const userId = localStorage.getItem("userId")

      if (token && userId) {
        try {
          // Get fresh game status to ensure we have the latest player data
          const statusResponse = await fetch(`${API_BASE}/games/${gameId}/status`)
          if (statusResponse.ok) {
            const statusData: GameStatusResponse = await statusResponse.json()
            const isPlayer = statusData.players.some((player) => player.id === userId)

            if (isPlayer) {
              console.log("Current user is a player, fetching first question...")
              await fetchFirstQuestion()
            } else {
              console.log("Current user is not a player in this game")
            }
          }
        } catch (error) {
          console.error("Error checking player status after game start:", error)
        }
      }

      toastSuccess("The game has started!")
    })

    // Player answered - enhanced to show answer result to the answering user
    channel.bind(
      "player-answered",
      (data: { userId: string; isCorrect: boolean; newScore: number; questionId: string }) => {
        console.log("Player answered event received:", data)
        console.log("Current user ID:", currentUserId)
        console.log("Event user ID:", data.userId)
        console.log("Last answered question:", lastAnsweredQuestionRef.current)
        console.log("Event question ID:", data.questionId)

        // Update player scores for all users
        setGame((prevGame) => {
          if (!prevGame) return prevGame

          return {
            ...prevGame,
            players: prevGame.players.map((player) =>
              player.userId === data.userId ? { ...player, score: data.newScore } : player,
            ),
          }
        })

        // Show answer result only to the user who answered
        if (data.userId === currentUserId) {
          console.log("This is the current user's answer")

          // Clear any pending timeouts
          if (answerTimeoutRef.current) {
            clearTimeout(answerTimeoutRef.current)
            answerTimeoutRef.current = null
          }

          // Check if this is for the question we just answered
          if (lastAnsweredQuestionRef.current === data.questionId) {
            console.log("Question IDs match, setting answer result")

            // Set the answer result based on the Pusher event
            setAnswerResult({
              isCorrect: data.isCorrect,
              message: data.isCorrect ? "✅ Correct answer! +1 point" : "❌ Wrong answer!",
            })
            setShowingAnswerResult(true)

            // Show toast notification based on answer correctness
            if (data.isCorrect) {
              toastSuccess("Correct answer! +1 point")
            } else {
              toastError("Wrong answer!")
            }

            // Wait for 2.5 seconds to show the result, then move to next question
            setTimeout(() => {
              moveToNextQuestion()
            }, 2500)
          }
        }
      },
    )

    // Game ended
    channel.bind("game-ended", () => {
      toastSuccess("The game has ended!")
      router.push(`/dashboard/played-games/${gameId}`)
    })

    // Initial load
    checkGameStatusAndLoad().finally(() => {
      setLoading(false)
    })

    // Cleanup
    return () => {
      console.log(`Unsubscribing from Pusher channel: game-${gameId}`)
      if (answerTimeoutRef.current) {
        clearTimeout(answerTimeoutRef.current)
      }
      pusherClient.unsubscribe(`game-${gameId}`)
    }
  }, [gameId, router, currentUserId])

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("Authorization")
    if (!token) {
      router.push("/auth")
    }
  }, [router])

  const copyGameId = async () => {
    try {
      await navigator.clipboard.writeText(gameId)
      toastSuccess("Game ID copied")
    } catch {
      toastError("Could not copy Game ID")
    }
  }

  const rankBadge = (position: number) => {
    if (position === 1) {
      return (
        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-sm">
          <Crown className="w-4 h-4 text-white" />
        </div>
      )
    }
    if (position === 2) {
      return (
        <div className="w-8 h-8 bg-gradient-to-r from-slate-300 to-slate-500 rounded-full flex items-center justify-center shadow-sm">
          <Medal className="w-4 h-4 text-white" />
        </div>
      )
    }
    if (position === 3) {
      return (
        <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-sm">
          <Award className="w-4 h-4 text-white" />
        </div>
      )
    }
    return (
      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
        <span className="text-sm font-bold text-slate-600">#{position}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800">Loading lobby…</h2>
          <p className="text-sm text-slate-500 mt-1">Fetching players and game status</p>
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-200 shadow-lg">
          <CardContent className="text-center p-8">
            <Trophy className="w-14 h-14 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Game not found</h2>
            <p className="text-slate-600 mb-6">This game may have been deleted or you don&apos;t have access.</p>
            <Button onClick={() => router.push("/dashboard/my-games")} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Games
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score)
  const showLiveScores = game.status === "STARTED" || gameEnded

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-6 pb-10">
      <Toaster position="top-right" />

      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/my-games")}
              className="mb-3 -ml-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              My Games
            </Button>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500 shrink-0" />
              {game.game}
            </h1>
            <p className="text-slate-600 mt-1">
              Hosted by <span className="font-medium text-slate-800">{game.user.username}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              className={
                game.status === "WAITING"
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : game.status === "STARTED"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
              }
            >
              {game.status === "WAITING" ? (
                <>
                  <Clock className="h-3.5 w-3.5 mr-1" /> Waiting
                </>
              ) : game.status === "STARTED" ? (
                <>
                  <Play className="h-3.5 w-3.5 mr-1" /> Live
                </>
              ) : (
                <>
                  <Trophy className="h-3.5 w-3.5 mr-1" /> Ended
                </>
              )}
            </Badge>
            {!isOwner && game.status === "WAITING" && (
              <Button
                onClick={leaveGame}
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Leave
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-slate-200 shadow-lg overflow-hidden sticky top-6">
              <CardHeader className="border-b border-slate-100 bg-white pb-4">
                <CardTitle className="text-lg text-slate-900 flex items-center justify-between">
                  <span className="flex items-center">
                    {showLiveScores ? (
                      <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                    ) : (
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                    )}
                    {showLiveScores ? "Live leaderboard" : "Lobby"}
                  </span>
                  <span className="text-sm font-normal text-slate-500">{sortedPlayers.length} players</span>
                </CardTitle>
                <CardDescription>
                  {showLiveScores ? "Scores update as answers come in" : "Players appear here as they join"}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                {sortedPlayers.length === 0 ? (
                  <div className="text-center py-12 px-4 text-slate-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-slate-700">No players yet</p>
                    <p className="text-sm mt-1">Share the Game ID so others can join</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      <div className="col-span-2 text-center">Rank</div>
                      <div className="col-span-7">Player</div>
                      <div className="col-span-3 text-right">{showLiveScores ? "Score" : "Status"}</div>
                    </div>
                    {sortedPlayers.map((player, index) => {
                      const position = index + 1
                      const isYou = player.userId === currentUserId
                      const isHost = player.userId === game.userId

                      return (
                        <div
                          key={player.id}
                          className={`px-4 py-3 transition-colors ${
                            position === 1 && showLiveScores
                              ? "bg-gradient-to-r from-yellow-50 to-transparent"
                              : isYou
                                ? "bg-blue-50/70"
                                : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-2 flex justify-center">{rankBadge(position)}</div>
                            <div className="col-span-7 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-slate-900 truncate">{player.user.username}</span>
                                {isYou && (
                                  <Badge className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0">You</Badge>
                                )}
                                {isHost && (
                                  <Badge className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0">Host</Badge>
                                )}
                              </div>
                              {showLiveScores && position === 1 && (
                                <p className="text-xs text-yellow-700 mt-0.5 flex items-center">
                                  <Crown className="w-3 h-3 mr-1" /> Leading
                                </p>
                              )}
                            </div>
                            <div className="col-span-3 text-right">
                              {showLiveScores ? (
                                <>
                                  <div className="text-xl font-bold text-slate-900 tabular-nums">{player.score}</div>
                                  <div className="text-[10px] text-slate-500 uppercase">pts</div>
                                </>
                              ) : (
                                <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                                  Ready
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>

              {isOwner && game.status === "WAITING" && (
                <CardFooter className="border-t border-slate-100 bg-white p-4">
                  <Button
                    onClick={startGame}
                    disabled={startingGame || game.players.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {startingGame ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Starting…
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" /> Start battle ({game.players.length})
                      </>
                    )}
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {game.status === "WAITING" ? (
              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-slate-900 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Waiting room
                  </CardTitle>
                  <CardDescription>
                    {isOwner
                      ? "Start when everyone is ready. The live leaderboard will appear once the battle begins."
                      : "Hang tight — the host will start the battle shortly."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 mb-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                      <Share2 className="h-4 w-4 text-blue-600" />
                      Share Game ID
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 font-mono text-sm sm:text-base text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2.5 truncate">
                        {gameId}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={copyGameId}
                        className="shrink-0 border-slate-200"
                        aria-label="Copy game ID"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
                      <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-slate-900">{game.players.length}</div>
                      <div className="text-xs text-slate-500">Joined</div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
                      <Clock className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-slate-900">Lobby</div>
                      <div className="text-xs text-slate-500">Status</div>
                    </div>
                  </div>

                  {isOwner ? (
                    <Button
                      onClick={startGame}
                      disabled={startingGame || game.players.length === 0}
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {startingGame ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Starting…
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" /> Start battle
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-slate-600 text-sm py-3 rounded-lg bg-blue-50 border border-blue-100">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      Waiting for host to start…
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : game.status === "STARTED" ? (
              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="border-b border-slate-100">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-slate-900">
                      {loadingQuestion
                        ? "Loading question…"
                        : currentQuestion
                          ? `Question ${questionIndex}`
                          : gameEnded
                            ? "Battle complete"
                            : "Preparing question…"}
                    </CardTitle>
                    {currentQuestion && (
                      <Badge className="bg-blue-100 text-blue-800 border border-blue-200">Q{questionIndex}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {loadingQuestion ? (
                    <div className="text-center py-14">
                      <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-800">Loading question</h3>
                      <p className="text-slate-500 text-sm mt-1">Almost ready</p>
                    </div>
                  ) : currentQuestion ? (
                    <div>
                      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-lg sm:text-xl font-semibold text-slate-900 leading-snug">
                          {currentQuestion.question}
                        </p>
                      </div>

                      {answerResult && showingAnswerResult && (
                        <div
                          className={`mb-5 p-4 rounded-xl flex items-center border ${
                            answerResult.isCorrect
                              ? "bg-green-50 border-green-200 text-green-800"
                              : "bg-red-50 border-red-200 text-red-800"
                          }`}
                        >
                          {answerResult.isCorrect ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600 mr-3 shrink-0" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-500 mr-3 shrink-0" />
                          )}
                          <span className="font-semibold">
                            {answerResult.isCorrect ? "Correct! +1 point" : "Incorrect"}
                          </span>
                        </div>
                      )}

                      <p className="text-sm font-medium text-slate-600 mb-3">Choose an answer</p>
                      <div className="space-y-2.5">
                        {currentQuestion.options.map((option, index) => {
                          const selected = selectedOption === option.id
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => submitAnswer(option.id)}
                              disabled={submitting || selectedOption !== null}
                              className={`w-full text-left rounded-xl border px-4 py-3.5 transition-all ${
                                selected
                                  ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200"
                                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                              } disabled:opacity-70 disabled:cursor-not-allowed`}
                            >
                              <span className="flex items-start gap-3">
                                <span
                                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                    selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {String.fromCharCode(65 + index)}
                                </span>
                                <span className="text-slate-900 font-medium leading-snug">{option.option}</span>
                              </span>
                            </button>
                          )
                        })}
                      </div>

                      {submitting && !answerResult && (
                        <div className="mt-5 text-center py-3 rounded-lg bg-slate-50 border border-slate-200">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600 mx-auto mb-1" />
                          <p className="text-sm text-slate-600">Checking answer…</p>
                        </div>
                      )}
                    </div>
                  ) : gameEnded ? (
                    <div>
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center mx-auto mb-4">
                          <Trophy className="h-8 w-8 text-yellow-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">Thanks for playing</h3>
                        <p className="text-slate-600 text-sm">Final standings for this battle</p>
                      </div>

                      <Card className="border-slate-200 shadow-sm overflow-hidden mb-6">
                        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
                          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-600">
                            <div className="col-span-2 text-center">Rank</div>
                            <div className="col-span-7">Player</div>
                            <div className="col-span-3 text-right">Score</div>
                          </div>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {sortedPlayers.map((player, index) => {
                            const position = index + 1
                            return (
                              <div
                                key={player.id}
                                className={`px-4 py-3 ${
                                  position <= 3 ? "bg-gradient-to-r from-yellow-50 to-transparent" : ""
                                }`}
                              >
                                <div className="grid grid-cols-12 gap-2 items-center">
                                  <div className="col-span-2 flex justify-center">{rankBadge(position)}</div>
                                  <div className="col-span-7 flex items-center gap-2 min-w-0">
                                    <span className="font-semibold text-slate-900 truncate">
                                      {player.user.username}
                                    </span>
                                    {position === 1 && (
                                      <Badge className="bg-yellow-100 text-yellow-800 text-[10px]">Winner</Badge>
                                    )}
                                    {player.userId === currentUserId && (
                                      <Badge className="bg-blue-100 text-blue-800 text-[10px]">You</Badge>
                                    )}
                                  </div>
                                  <div className="col-span-3 text-right">
                                    <div className="text-xl font-bold text-slate-900">{player.score}</div>
                                    <div className="text-[10px] text-slate-500">points</div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </Card>

                      <Button
                        onClick={() => router.push(`/dashboard/played-games/${gameId}`)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        View full results
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-14">
                      <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-800">Preparing first question</h3>
                      <p className="text-slate-500 text-sm mt-1">Get ready</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-slate-900 flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                    Game ended
                  </CardTitle>
                  <CardDescription>Review answers, explanations, and the final leaderboard.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => router.push(`/dashboard/played-games/${gameId}`)}
                      className="bg-blue-600 hover:bg-blue-700 flex-1"
                    >
                      View results
                    </Button>
                    <Button
                      onClick={() => router.push("/dashboard/played-games")}
                      variant="outline"
                      className="border-slate-200 flex-1"
                    >
                      Played Games
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
