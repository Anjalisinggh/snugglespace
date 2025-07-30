"use client"

import { motion } from "framer-motion"
import { Heart, Database, Key, CheckCircle, ExternalLink, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SetupPage() {
  const setupSteps = [
    {
      icon: <Database className="w-6 h-6" />,
      title: "Create Supabase Project",
      description: "Sign up at supabase.com and create a new project",
      status: "pending",
    },
    {
      icon: <Key className="w-6 h-6" />,
      title: "Add Environment Variables",
      description: "Add your Supabase URL and API key to the project",
      status: "pending",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Start Using SnuggleSpace",
      description: "Create accounts and invite your partner",
      status: "pending",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-6"
          >
            <Heart className="w-10 h-10 text-white" fill="currentColor" />
          </motion.div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Setup Required 💕
          </h1>
          <p className="text-xl text-gray-600">Let's connect SnuggleSpace to your Supabase database</p>
        </div>

        <Alert className="mb-8 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Supabase not configured:</strong> You need to set up your Supabase project and add environment
            variables to use SnuggleSpace.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Setup Steps */}
          <Card className="border-pink-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-pink-500" />
                Setup Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {setupSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-gray-100 text-gray-400">{step.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border-pink-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-pink-500" />
                Quick Setup Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                  <h4 className="font-semibold text-pink-800 mb-1">Step 1: Create Supabase Project</h4>
                  <p className="text-sm text-pink-700">
                    Go to <strong>supabase.com</strong> → Sign up → Create new project
                  </p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-1">Step 2: Get Your Credentials</h4>
                  <p className="text-sm text-purple-700">
                    In your project dashboard → Settings → API → Copy URL and anon key
                  </p>
                </div>

                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-800 mb-1">Step 3: Add Integration</h4>
                  <p className="text-sm text-indigo-700">
                    Click "Add Supabase integration" below to add environment variables
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center space-y-4">
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8"
            >
              <Heart className="w-4 h-4 mr-2" />
              Check Connection
            </Button>
            <Button
              onClick={() => window.open("https://supabase.com", "_blank")}
              variant="outline"
              className="border-pink-200"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Go to Supabase
            </Button>
          </div>

          <div className="bg-pink-50 p-4 rounded-lg border border-pink-200 max-w-2xl mx-auto">
            <h3 className="font-semibold text-pink-800 mb-2">Need Help?</h3>
            <div className="text-sm text-pink-700 space-y-1">
              <p>📧 The environment variables should be:</p>
              <p>
                <code className="bg-pink-100 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code>
              </p>
              <p>
                <code className="bg-pink-100 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
