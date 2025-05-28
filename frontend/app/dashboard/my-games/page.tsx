"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Play, Trash2, Trophy, Users, Calendar, Gamepad2 } from "lucide-react"

interface Game {
  id: string
  name: string
  createdBy: string
  createdAt: string
  participants: number
  status: "active" | "completed" | "draft"
  questions: number
}

export default function MyGamesPage() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true);

  const [authorized, setAuthorized] = useState<boolean | null>(null);




  const fetchMyGames = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/my-games", {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setGames(data.games || [])
      } else {
        console.error("Failed to fetch games")
      }
    } catch (error) {
      console.error("Error fetching games:", error)
    } finally {
      setLoading(false)
    }
  }
   useEffect(() => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("Authorization");

    if (!token || !username) {
      router.push("/auth");
    } else {
      setAuthorized(true);
    }
       fetchMyGames();
  }, [router]);
  
  if (authorized === null) return null;

  const handleDeleteGame = async (gameId: string) => {
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setGames(games.filter((game) => game.id !== gameId))
      } else {
        console.error("Failed to delete game")
      }
    } catch (error) {
      console.error("Error deleting game:", error)
    }
  }

  const handleStartGame = (gameId: string) => {
    router.push(`/game/${gameId}`)
  }

  const handleCreateGame = () => {
    router.push("/create-game")
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-6">
      <div className="container mx-auto px-4">
        {/* Page Title and Create Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <Trophy className="h-6 w-6 text-blue-600 mr-2" />
              My Games
            </h1>
            <p className="text-slate-600 mt-1">Manage and play your QuizBattle games</p>
          </div>
          <Button onClick={handleCreateGame} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2">
            <Plus className="w-4 h-4 mr-2" />
            Create New Game
          </Button>
        </div>

        {/* Games Grid */}
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
        ) : games.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200 shadow-sm">
            <Gamepad2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Games Yet!</h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              You haven't created any quiz games yet. Start your first game and challenge your friends!
            </p>
            <Button
              onClick={handleCreateGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Game
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Card
                key={game.id}
                className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-slate-900 text-lg mb-1 line-clamp-2">{game.name}</CardTitle>
                      <CardDescription className="text-slate-600">Created by {game.createdBy}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        game.status === "active" ? "default" : game.status === "completed" ? "secondary" : "outline"
                      }
                      className={`ml-2 ${
                        game.status === "active"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : game.status === "completed"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                      }`}
                    >
                      {game.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-slate-600">
                      <Users className="w-4 h-4 mr-2 text-slate-500" />
                      {game.participants} players
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Trophy className="w-4 h-4 mr-2 text-slate-500" />
                      {game.questions} questions
                    </div>
                    <div className="flex items-center text-slate-600 col-span-2">
                      <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                      {new Date(game.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleStartGame(game.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Game
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border-slate-200">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Game</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{game.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteGame(game.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
