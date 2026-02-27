"use client";

import { useState } from 'react';
import { supabase } from '@/services/supabase';
import { Shield, Mail, Lock, UserPlus, LogIn, Eye, EyeOff, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            if (isRegister) {
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                // If session returned immediately → email confirmation is disabled (auto-confirmed)
                if (data?.session) {
                    setSuccessMsg('Account created and signed in! Redirecting…');
                } else {
                    setSuccessMsg('Account created! Please check your email and click the confirmation link, then come back to sign in.');
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    // Give a helpful hint for the most common failure mode
                    if (error.message?.toLowerCase().includes('invalid login credentials') ||
                        error.status === 400) {
                        throw new Error(
                            'Invalid email or password. If you just signed up, please confirm your email first (check your inbox), then try signing in.'
                        );
                    }
                    throw error;
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070a0f] flex items-center justify-center relative overflow-hidden px-4">
            {/* Background glow orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-700/5 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md relative"
            >
                {/* Card */}
                <div className="glass-dark rounded-2xl p-8 border border-white/10">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8 text-center">
                        <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl mb-5"
                        >
                            <Shield className="w-10 h-10 text-primary-400" />
                        </motion.div>
                        <h1 className="text-3xl font-extrabold text-gradient">SEDS</h1>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Social Engineering Defense System</p>
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={isRegister ? 'reg' : 'log'}
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                className="text-gray-400 mt-4 text-sm"
                            >
                                {isRegister ? 'Create your secure account' : 'Welcome back, Citizen'}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleAuth} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    id="email-input"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 transition-all"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    id="password-input"
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder:text-gray-600 transition-all"
                                    placeholder="••••••••"
                                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-start gap-2.5 p-3 bg-danger-500/10 border border-danger-500/20 rounded-xl text-danger-400 text-sm"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                            {successMsg && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-start gap-2.5 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm"
                                >
                                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{successMsg}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit button */}
                        <button
                            id="auth-submit-btn"
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/20"
                        >
                            {loading ? (
                                <><RefreshCw className="w-4 h-4 animate-spin" /> Processing...</>
                            ) : isRegister ? (
                                <><UserPlus className="w-5 h-5" /> Create Account</>
                            ) : (
                                <><LogIn className="w-5 h-5" /> Sign In</>
                            )}
                        </button>
                    </form>

                    {/* Toggle mode */}
                    <div className="mt-6 text-center">
                        <button
                            id="toggle-auth-mode"
                            onClick={() => { setIsRegister(!isRegister); setError(null); setSuccessMsg(null); }}
                            className="text-gray-500 hover:text-primary-400 transition-colors text-sm"
                        >
                            {isRegister
                                ? 'Already have an account? Sign In'
                                : "Don't have an account? Sign Up"}
                        </button>
                    </div>
                </div>

                {/* Footer note */}
                <p className="text-center text-gray-600 text-xs mt-6">
                    🔒 Secured with Supabase Auth · AI Powered by Groq
                </p>
            </motion.div>
        </div>
    );
}
