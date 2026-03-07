import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const missingCredentials = !supabaseUrl || !supabaseAnonKey

if (missingCredentials) {
    console.warn('Supabase environment variables are missing.')
}

const createFallbackSupabase = () => {
    const noop = async () => ({ data: { session: null } })
    const noopSubscription = { unsubscribe: () => {} }

    return {
        auth: {
            getSession: noop,
            getUser: noop,
            onAuthStateChange: () => ({ data: { subscription: noopSubscription } }),
            signInWithPassword: async () => ({ error: new Error('Supabase not configured') }),
            signUp: async () => ({ error: new Error('Supabase not configured') }),
            signOut: async () => ({ error: new Error('Supabase not configured') }),
        },
        from: () => ({ select: async () => ({ data: [], error: null }) }),
    }
}

export const supabase = missingCredentials
    ? createFallbackSupabase()
    : createClient(supabaseUrl, supabaseAnonKey, {
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

