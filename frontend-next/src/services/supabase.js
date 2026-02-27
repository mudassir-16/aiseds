import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are missing.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
        /**
         * Override the Web LockManager used for cross-tab session sync.
         * The default implementation times out after 10 s when multiple
         * tabs compete for the same lock.  Replacing it with a pass-through
         * lets each tab manage its own token without contention.
         */
        lock: (name, acquireTimeout, fn) => fn(),
    },
})

