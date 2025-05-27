"use client"

import { useState } from "react"
import { CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TabsDemo() {
  const [otpRequested, setOtpRequested] = useState(false)

  const handleRequestOtp = () => {
    setOtpRequested(true)
  }

  return (
    <Tabs defaultValue="signin" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="signin">
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="signin-username">Username</Label>
              <Input id="signin-username" placeholder="Enter your username" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="signin-password">Password</Label>
              <Input id="signin-password" type="password" placeholder="Enter your password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Sign In</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Create a new account by filling out the form below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="signup-username">Username</Label>
              <Input id="signup-username" placeholder="Choose a username" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" type="email" placeholder="Enter your email" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="signup-password">Password</Label>
              <Input id="signup-password" type="password" placeholder="Create a password" />
            </div>
            {!otpRequested ? (
              <div className="space-y-1">
                <Button variant="outline" className="w-full" onClick={handleRequestOtp}>
                  Request OTP
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                <Label htmlFor="signup-otp">OTP Code</Label>
                <Input id="signup-otp" placeholder="Enter OTP code" />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled={!otpRequested}>
              Sign Up
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
