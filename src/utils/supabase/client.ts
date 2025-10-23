import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'porter'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'admin' | 'porter'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'porter'
          updated_at?: string
        }
      }
      fuel_entries: {
        Row: {
          id: string
          user_id: string
          stock_number: string
          vin: string | null
          gallons: number
          price_per_gallon: number
          total_amount: number
          odometer: number
          fuel_type: string
          location: string
          latitude: number | null
          longitude: number | null
          receipt_photo: string | null
          vin_photo: string | null
          notes: string | null
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stock_number: string
          vin?: string | null
          gallons: number
          price_per_gallon: number
          total_amount: number
          odometer: number
          fuel_type: string
          location: string
          latitude?: number | null
          longitude?: number | null
          receipt_photo?: string | null
          vin_photo?: string | null
          notes?: string | null
          timestamp: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stock_number?: string
          vin?: string | null
          gallons?: number
          price_per_gallon?: number
          total_amount?: number
          odometer?: number
          fuel_type?: string
          location?: string
          latitude?: number | null
          longitude?: number | null
          receipt_photo?: string | null
          vin_photo?: string | null
          notes?: string | null
          timestamp?: string
        }
      }
    }
  }
}