import { createClient } from '@supabase/supabase-js'

// 공백·슬래시 제거 등 입력 오류 자동 보정
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '')
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

// https:// 누락된 경우 자동 보완
const supabaseUrl = rawUrl && !rawUrl.startsWith('http') ? `https://${rawUrl}` : rawUrl
const supabaseAnonKey = rawKey

export const isConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.includes('.supabase.co')
)

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)
