import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://gcwrlioiazodqqifkzvh.supabase.co"
const supabaseAnonKey =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjd3JsaW9pYXpvZHFxaWZrenZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NzU2NTcsImV4cCI6MjA2OTM1MTY1N30.OehFt-T9qZLKUAICNOfjL3sGWFv-L7AdTadVEa1oNzc"
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Always configured now
export const isSupabaseConfigured = true

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          partner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          avatar_url?: string | null
          partner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          partner_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      content: {
        Row: {
          id: string
          type: "dare" | "order" | "memory"
          title: string
          content: string
          sender_id: string
          receiver_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: "dare" | "order" | "memory"
          title: string
          content: string
          sender_id: string
          receiver_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: "dare" | "order" | "memory"
          title?: string
          content?: string
          sender_id?: string
          receiver_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      partner_invitations: {
        Row: {
          id: string
          inviter_id: string
          invitee_email: string
          invitation_code: string
          status: "pending" | "accepted" | "expired"
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          inviter_id: string
          invitee_email: string
          invitation_code: string
          status?: "pending" | "accepted" | "expired"
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          inviter_id?: string
          invitee_email?: string
          invitation_code?: string
          status?: "pending" | "accepted" | "expired"
          created_at?: string
          expires_at?: string
        }
      }
    }
  }
}
