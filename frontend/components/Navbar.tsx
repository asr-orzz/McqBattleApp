"use client"

import { Button } from "@/components/ui/button"
import { Gamepad2, Trophy, Zap, Users, LogOut, User, History } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const links = [
  { href: "/dashboard/my-games", label: "My Games", icon: Trophy },
  { href: "/dashboard/played-games", label: "Played Games", icon: History },
  { href: "/dashboard/my-requests", label: "My Requests", icon: Users },
  { href: "/dashboard/active-games", label: "Active Games", icon: Zap },
  { href: "/dashboard/player-requests", label: "Player Requests", icon: Users },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [username, setUsername] = useState<string>("")

  useEffect(() => {
    const storedUsername = localStorage.getItem("username")
    if (storedUsername) {
      setUsername(storedUsername)
    }
  }, [])

  function logoutHandler() {
    localStorage.removeItem("Authorization")
    localStorage.removeItem("username")
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="flex h-16 w-full items-center px-4 lg:px-6 overflow-x-auto">
        <Link className="flex shrink-0 items-center mr-4" href="/">
          <Gamepad2 className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-2xl font-bold text-slate-900">QuizBattle</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const Icon = link.icon
            const active = pathname?.startsWith(link.href)
            return (
              <Link key={link.href} href={link.href} className="shrink-0">
                <Button
                  variant="ghost"
                  className={`font-medium px-3 py-2 ${
                    active
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {link.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3 pl-4">
          {username && (
            <div className="flex items-center text-slate-700 font-medium px-3 py-2 bg-slate-50 rounded-md">
              <User className="w-4 h-4 mr-2" />
              <span>{username}</span>
            </div>
          )}
          <Button
            variant="ghost"
            className="text-slate-700 hover:text-red-600 hover:bg-red-50 font-medium px-4 py-2"
            onClick={logoutHandler}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
