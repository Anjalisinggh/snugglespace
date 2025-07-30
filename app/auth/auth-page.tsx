"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Heart, Mail, Lock, User, ArrowRight, Sparkles, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [invitationCode, setInvitationCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    // Check if there's an invitation code in the URL
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("invite")
    if (code) {
      setInvitationCode(code)
      setIsLogin(false) // Switch to signup mode for invitations
    }
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        setMessage("Welcome back! 💕")
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              invitation_code: invitationCode || null,
            },
          },
        })
        if (error) throw error
        setMessage("Account created! Check your email to verify your account. 📧")
      }
    } catch (error: any) {
      setError(error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Hero */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-6"
          >
            <Heart className="w-10 h-10 text-white" fill="currentColor" />
          </motion.div>

          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            SnuggleSpace
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Create your own private love space where you and your partner can share cute dares, love orders, and
            precious memories together. 💕
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-pink-100"
            >
              <Sparkles className="w-8 h-8 text-pink-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Cute Dares</h3>
              <p className="text-sm text-gray-600">Challenge each other with fun tasks</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-purple-100"
            >
              <Gift className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Love Orders</h3>
              <p className="text-sm text-gray-600">Playful commands with romance</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-indigo-100"
            >
              <Heart className="w-8 h-8 text-indigo-500 mx-auto mb-2" fill="currentColor" />
              <h3 className="font-semibold text-gray-800">Sweet Memories</h3>
              <p className="text-sm text-gray-600">Capture and share special moments</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right side - Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="border-pink-200 bg-white/80 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {invitationCode ? "Join Your Partner! 💕" : isLogin ? "Welcome Back! 💕" : "Start Your Love Journey ✨"}
              </CardTitle>
              <p className="text-gray-600">
                {invitationCode
                  ? "Your partner invited you to join their SnuggleSpace"
                  : isLogin
                    ? "Sign in to access your private couple space"
                    : "Create your account and invite your partner"}
              </p>
            </CardHeader>
            <CardContent>
              {invitationCode && (
                <Alert className="mb-4 border-pink-200 bg-pink-50">
                  <Gift className="h-4 w-4" />
                  <AlertDescription className="text-pink-800">
                    <strong>Invitation Code:</strong> {invitationCode}
                  </AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">{message}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="What should your partner call you?"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 border-pink-200 focus:border-pink-400"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 border-pink-200 focus:border-pink-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 border-pink-200 focus:border-pink-400"
                      required
                      minLength={6}
                    />
                  </div>
                  {!isLogin && <p className="text-xs text-gray-500">Password must be at least 6 characters</p>}
                </div>

                {!isLogin && !invitationCode && (
                  <div className="space-y-2">
                    <Label htmlFor="inviteCode">Invitation Code (Optional)</Label>
                    <div className="relative">
                      <Gift className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="inviteCode"
                        type="text"
                        placeholder="Enter invitation code"
                        value={invitationCode}
                        onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                        className="pl-10 border-pink-200 focus:border-pink-400"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Have an invitation from your partner? Enter it here!</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 h-12"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      {invitationCode
                        ? "Join Your Partner's Space"
                        : isLogin
                          ? "Sign In to Your Space"
                          : "Create Your Love Space"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {!invitationCode && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setMessage("")
                      setError("")
                    }}
                    className="text-sm text-gray-600 hover:text-pink-600 transition-colors"
                  >
                    {isLogin ? "New to SnuggleSpace? Create your account" : "Already have an account? Sign in"}
                  </button>
                </div>
              )}

              {!isLogin && !invitationCode && (
                <div className="mt-4 p-3 bg-pink-50 rounded-lg border border-pink-100">
                  <p className="text-xs text-pink-700 text-center">
                    💡 After creating your account, you can invite your partner to join your private space!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
