"use client"

import { useState } from "react"
import { Menu, Zap, User, LogOut, LogIn, Gamepad2, Play, Plus } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Component() {
  const [isLoggedIn, setIsLoggedIn] = useState(true) // Toggle this to see login/logout states

  const navigationLinks = [
    { href: "/my-games", label: "My Games", icon: Gamepad2 },
    { href: "/active-games", label: "Active Games", icon: Play },
    { href: "/create-game", label: "Create Game", icon: Plus },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left Section - Mobile Menu + Logo */}
        <div className="flex items-center gap-2">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6">
                <Link href="/" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <Zap className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold">RealTimeMcqBattle</span>
                </Link>

                <nav className="flex flex-col gap-2">
                  {navigationLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto pt-6">
                  {isLoggedIn ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3 px-3 py-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">John Doe</span>
                          <span className="text-xs text-muted-foreground">john@example.com</span>
                        </div>
                      </div>
                      <Button variant="ghost" className="justify-start gap-2" onClick={() => setIsLoggedIn(false)}>
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button onClick={() => setIsLoggedIn(true)} className="justify-start gap-2">
                        <LogIn className="h-4 w-4" />
                        Login
                      </Button>
                      <Button variant="outline" className="justify-start gap-2">
                        <User className="h-4 w-4" />
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="hidden text-lg font-bold sm:inline-block">RealTimeMcqBattle</span>
          </Link>
        </div>

        {/* Center Section - Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Section - Auth (This will be at the end) */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">John Doe</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">john@example.com</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Gamepad2 className="mr-2 h-4 w-4" />
                  Game Stats
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => setIsLoggedIn(false)}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsLoggedIn(true)} className="hidden sm:inline-flex">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
              <Button size="sm">
                <User className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
