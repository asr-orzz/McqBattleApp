"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { toastPromise } from "@/utils/toast"
import { requestOtp, verifyOtp } from "@/lib/api/auth"

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
  const signupUsernameRef = useRef<HTMLInputElement>(null)
  const signupEmailRef = useRef<HTMLInputElement>(null)
  const signupPasswordRef = useRef<HTMLInputElement>(null)

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

    const username = signupUsernameRef.current?.value
    const email = signupEmailRef.current?.value
    const password = signupPasswordRef.current?.value

    try {
      const response = await toastPromise(requestOtp(username!, email!, password!), {
        success: "OTP Sent",
        error: "There is some error in sending OTP",
        loading: "Sending OTP",
      })

      localStorage.setItem("otpToken", response.token)

      setIsSignUpStep("otp")
    } catch (err) {
      console.error("Error during OTP request:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestOtp = async () => {
    setOtpLoading(true)
    const username = signupUsernameRef.current?.value
    const email = signupEmailRef.current?.value
    const password = signupPasswordRef.current?.value
    const response = await toastPromise(requestOtp(username!, email!, password!), {
      success: "OTP Sent",
      error: "There is some error in sending OTP",
      loading: "Resending OTP",
    })

    localStorage.setItem("otpToken", response.token)
    setOtpLoading(false)
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate OTP verification
    let otpString = ""
    for (let i = 0; i < otp.length; i++) {
      otpString = otpString + otp[i]
    }
    const token = localStorage.getItem("otpToken")
    try {
      await toastPromise(verifyOtp(token!, otpString), {
        success: "OTP has been Verified",
        error: "There is some error in verifying OTP",
        loading: "Verifying OTP",
      })
    } catch (err) {
      console.error("Error during OTP request:", err)
    } finally {
      setIsLoading(false)
      setIsSignUpStep("form")
      setOtp(["", "", "", "", "", ""])
      const signinTab = document.querySelector('[value="signin"]') as HTMLButtonElement
      signinTab?.click()
    }
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
          {isSignUpStep === "otp" ? (
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
                          required
                          ref={signupUsernameRef}
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
                          required
                          ref={signupEmailRef}
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
                          required
                          ref={signupPasswordRef}
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