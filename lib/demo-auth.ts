// Demo authentication system for when Supabase isn't configured
interface DemoUser {
  id: string
  email: string
  user_metadata: {
    name: string
  }
}

interface DemoSession {
  user: DemoUser
}

class DemoAuth {
  private currentUser: DemoUser | null = null
  private listeners: ((session: DemoSession | null) => void)[] = []

  async signUp({
    email,
    password,
    options,
  }: { email: string; password: string; options?: { data: { name: string } } }) {
    // Simulate signup
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user: DemoUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      user_metadata: {
        name: options?.data?.name || email.split("@")[0],
      },
    }

    this.currentUser = user
    this.notifyListeners({ user })

    return { error: null }
  }

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user: DemoUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      user_metadata: {
        name: email.split("@")[0],
      },
    }

    this.currentUser = user
    this.notifyListeners({ user })

    return { error: null }
  }

  async signOut() {
    this.currentUser = null
    this.notifyListeners(null)
  }

  async getSession() {
    return {
      data: {
        session: this.currentUser ? { user: this.currentUser } : null,
      },
    }
  }

  onAuthStateChange(callback: (event: string, session: DemoSession | null) => void) {
    this.listeners.push((session) => callback("SIGNED_IN", session))

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.listeners.indexOf((session) => callback("SIGNED_IN", session))
            if (index > -1) {
              this.listeners.splice(index, 1)
            }
          },
        },
      },
    }
  }

  private notifyListeners(session: DemoSession | null) {
    this.listeners.forEach((listener) => listener(session))
  }
}

export const demoAuth = new DemoAuth()
