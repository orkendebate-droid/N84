import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Используем service_role ключ для админских действий (создание профилей и т.д.)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

// Для обычных действий на клиенте
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
