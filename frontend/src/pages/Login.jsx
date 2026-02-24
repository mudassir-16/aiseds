import { useState } from 'react'
import { supabase } from '../services/supabase'
import { Shield, Mail, Lock, UserPlus, LogIn } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isRegister, setIsRegister] = useState(false)
    const [error, setError] = useState(null)

    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isRegister) {
                const { error } = await supabase.auth.signUp({ email, password })
                if (error) throw error
                alert('Check your email for confirmation!')
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 glass-dark rounded-2xl"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-primary-500/20 rounded-xl mb-4 text-primary-400">
                        <Shield className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-gradient">SEDS</h1>
                    <p className="text-gray-400 mt-2">
                        {isRegister ? 'Create your account' : 'Welcome back, Citizen'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-primary-500 outline-none transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-primary-500 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && <p className="text-danger-400 text-sm bg-danger-400/10 p-3 rounded-lg border border-danger-400/20">{error}</p>}

                    <button
                        disabled={loading}
                        className="w-full btn-primary bg-primary-600 hover:bg-primary-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            'Processing...'
                        ) : (
                            <>
                                {isRegister ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                                {isRegister ? 'Sign Up' : 'Sign In'}
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                    >
                        {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
