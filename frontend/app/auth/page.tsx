"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Mail, Lock, User, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function AuthPage() {
  const [isSignUpStep, setIsSignUpStep] = useState<"form" | "otp" | "success">("form")
  const [isLoading, setIsLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [signUpData, setSignUpData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [otp, setOtp] = useState(["", "", "", "", "", ""])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    // Handle sign in logic here
  }

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    setIsSignUpStep("otp")
  }

  const handleRequestOtp = async () => {
    setOtpLoading(true)
    // Simulate OTP request
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setOtpLoading(false)
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate OTP verification
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    setIsSignUpStep("success")
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <Gamepad2 className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">QuizBattle</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to QuizBattle</h1>
          <p className="text-gray-500 mt-2">Join the ultimate MCQ battle experience</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          {isSignUpStep === "success" ? (
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Account Created Successfully!</h2>
                <p className="text-gray-500">Your account has been verified and created. You can now start battling!</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Your First Battle</Button>
              </div>
            </CardContent>
          ) : isSignUpStep === "otp" ? (
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Button variant="ghost" size="sm" onClick={() => setIsSignUpStep("form")} className="p-1">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Verify Your Email</h2>
                    <p className="text-sm text-gray-500">We've sent a 6-digit code to {signUpData.email}</p>
                  </div>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Enter OTP Code</Label>
                    <div className="flex gap-2 justify-center">
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-12 text-center text-lg font-bold"
                          maxLength={1}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Didn't receive the code?</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRequestOtp}
                      disabled={otpLoading}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {otpLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Resend OTP"
                      )}
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading || otp.some((digit) => !digit)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify & Sign Up"
                    )}
                  </Button>
                </form>
              </div>
            </CardContent>
          ) : (
            <Tabs defaultValue="signin" className="w-full">
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="p-6 pt-0">
                <TabsContent value="signin" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">Welcome Back</CardTitle>
                    <CardDescription>Sign in to your account to continue battling</CardDescription>
                  </div>

                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-username">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signin-username"
                          type="text"
                          placeholder="Enter your username"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="remember" className="rounded border-gray-300" />
                        <Label htmlFor="remember" className="text-sm text-gray-600">
                          Remember me
                        </Label>
                      </div>
                      <Link href="#" className="text-sm text-blue-600 hover:text-blue-700">
                        Forgot password?
                      </Link>
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">Create Account</CardTitle>
                    <CardDescription>Join thousands of players in epic quiz battles</CardDescription>
                  </div>

                  <form onSubmit={handleSignUpSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-username">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-username"
                          type="text"
                          placeholder="Choose a username"
                          className="pl-10"
                          value={signUpData.username}
                          onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={signUpData.email}
                          onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password"
                          className="pl-10"
                          value={signUpData.password}
                          onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending OTP...
                          </>
                        ) : (
                          "Request OTP"
                        )}
                      </Button>

                      <div className="text-center">
                        <Badge variant="secondary" className="text-xs">
                          We'll send a verification code to your email
                        </Badge>
                      </div>
                    </div>

                    <div className="text-center text-xs text-gray-500">
                      By signing up, you agree to our{" "}
                      <Link href="#" className="text-blue-600 hover:text-blue-700">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="#" className="text-blue-600 hover:text-blue-700">
                        Privacy Policy
                      </Link>
                    </div>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          )}
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
