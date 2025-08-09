import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', !!supabaseAnonKey)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type Database = {
  public: {
    Tables: {
      patient_records: {
        Row: {
          id: string
          record_date: string
          patient_name: string
          visit_type: string
          is_free: boolean
          consultation_fee: number
          include_procedure: boolean
          procedure_fee: number
          include_tests: boolean
          test_fee: number
          include_additional: boolean
          additional_fee: number
          notes: string
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          record_date: string
          patient_name: string
          visit_type?: string
          is_free?: boolean
          consultation_fee?: number
          include_procedure?: boolean
          procedure_fee?: number
          include_tests?: boolean
          test_fee?: number
          include_additional?: boolean
          additional_fee?: number
          notes?: string
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          record_date?: string
          patient_name?: string
          visit_type?: string
          is_free?: boolean
          consultation_fee?: number
          include_procedure?: boolean
          procedure_fee?: number
          include_tests?: boolean
          test_fee?: number
          include_additional?: boolean
          additional_fee?: number
          notes?: string
          total_amount?: number
          updated_at?: string
        }
      }
    }
  }
}