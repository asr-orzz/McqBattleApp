"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Gamepad2, Clock, User } from "lucide-react"
import pusherClient from "@/lib/pusherClient"
import { toastPromise } from "@/utils/toast"
import { getAllGames } from "@/lib/api/game"
import { sendPlayerRequest } from "@/lib/api/player"

interface Game {
  id: string
  game: string
  userId: string
  createdAt: string
  status: "WAITING" | "ACTIVE" | "COMPLETED"
  user: {
    id: string
    username: string
    email: string
    password: string
  }
}

interface PusherGameEvent {
  id: string
  game: string
  creator: string
  status: string
  createdAt: string
}

export default function ActiveGamesPage() {
  const router = useRouter()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [joiningGame, setJoiningGame] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null)

  const fetchActiveGames = async () => {
    setLoading(true)

    try {
      const token = localStorage.getItem("Authorization")
      if (!token) {
        console.error("No authorization token found.")
        return
      }

      const response = await getAllGames();

      const data = await response
      // API returns array directly, not wrapped in games property
      setGames(data || [])
    } catch (error) {
      console.error("Error fetching active games:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const username = localStorage.getItem("username")
    const token = localStorage.getItem("Authorization")
    const userId = localStorage.getItem("userId")

    if (!token || !username) {
      router.push("/auth")
    } else {
      setAuthorized(true)
      setCurrentUser({ id: userId || "", username })
      fetchActiveGames()
    }
  }, [router])

  // Set up Pusher subscription
  useEffect(() => {
    if (!authorized) return

    const channel = pusherClient.subscribe("games")

    channel.bind("new-game", (newGameEvent: PusherGameEvent) => {
      if (newGameEvent.status === "WAITING") {
        // Convert Pusher event to Game format
        const newGame: Game = {
          id: newGameEvent.id,
          game: newGameEvent.game,
          userId: "", // Not provided in Pusher event
          createdAt: newGameEvent.createdAt,
          status: newGameEvent.status as "WAITING",
          user: {
            id: "", // Not provided in Pusher event
            username: newGameEvent.creator,
            email: "",
            password: "",
          },
        }

        setGames((prevGames) => {
          const gameExists = prevGames.some((game) => game.id === newGame.id)
          if (!gameExists) {
            return [newGame, ...prevGames]
          }
          return prevGames
        })
      }
    })

    // Add listener for game deletion
    channel.bind("game-deleted", (deletedGameEvent: { gameId: string }) => {
      setGames((prevGames) => prevGames.filter((game) => game.id !== deletedGameEvent.gameId))
    })

    // Clean up subscription on unmount
    return () => {
      pusherClient.unsubscribe("games")
    }
  }, [authorized])

  if (authorized === null) return null

  const handleJoinRequest = async (gameId: string) => {
    setJoiningGame(gameId)

    try {
      const token = localStorage.getItem("Authorization");
      if (!token) {
        throw new Error("Authorization token not found")
      }

      // await toastPromise(
      //   fetch(`/api/games/${gameId}/join-request`, {
      //     method: "POST",
      //     headers: {
      //       Authorization: token,
      //       "Content-Type": "application/json",
      //     },
      //   }),
      //   {
      //     success: "Join request sent successfully",
      //     loading: "Sending join request...",
      //     error: "Failed to send join request",
      //   },
      // )
      await toastPromise(
          sendPlayerRequest(gameId,token)
        ,
        {
          success: "Join request sent successfully",
          loading: "Sending join request...",
          error: "Failed to send join request",
        },
      )
    } catch (error) {
      console.error("Error sending join request:", error)
    } finally {
      setJoiningGame(null)
    }
  }

  const handleJoinLobby = (gameId: string) => {
    router.push(`/game/${gameId}/lobby`)
  }

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date()
    const gameDate = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - gameDate.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  // Use sample data for demonstration
  const displayGames = games

  return (
    <div className="min-h-screen bg-slate-50 pt-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <Gamepad2 className="h-6 w-6 text-blue-600 mr-2" />
              Active Games
            </h1>
            <p className="text-slate-600 mt-1">
              Join waiting games and start battling! {displayGames.length} game{displayGames.length !== 1 ? "s" : ""}{" "}
              available
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border border-slate-200 shadow-sm">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayGames.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200 shadow-sm">
            <Gamepad2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Active Games</h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              There are no games waiting for players right now. Check back later or create your own game!
            </p>
            <Button
              onClick={() => router.push("/dashboard/create-game")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2"
            >
              Create Your Own Game
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayGames.map((game) => (
              <Card
                key={game.id}
                className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-slate-900 text-lg mb-1 line-clamp-2">{game.game}</CardTitle>
                      <CardDescription className="text-slate-600 flex items-center">
                        <User className="h-3.5 w-3.5 mr-1 text-slate-400" />
                        Created by {game.user.username}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      waiting
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div className="flex items-center text-slate-600">
                      <Trophy className="w-4 h-4 mr-2 text-slate-500" />
                      Quiz Game
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {formatTimeAgo(game.createdAt)}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={() => handleJoinRequest(game.id)}
                      disabled={joiningGame === game.id}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                      {joiningGame === game.id ? "Sending Request..." : "Send Join Request"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
