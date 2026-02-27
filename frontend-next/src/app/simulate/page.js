"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Smartphone, ShieldAlert, Zap, BookOpen, AlertCircle, RefreshCw
} from 'lucide-react';
import { simulateScam } from '@/services/api';

const SCAM_TYPES = [
    "UPI Refund Scam",
    "Fake KYC Suspension",
    "OTP Theft Scam",
    "Job Offer Scam",
    "Prize Lottery Scam",
    "Bank Account Blocked Scam",
    "Investment / Crypto Scam"
];

function TacticBadge({ tactic }) {
    const colors = {
        Urgency: 'bg-orange-500/15 text-orange-300 border-orange-500/20',
        Fear: 'bg-red-500/15 text-red-300 border-red-500/20',
        'Authority impersonation': 'bg-purple-500/15 text-purple-300 border-purple-500/20',
        'Reward bait': 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
        Scarcity: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
    };

    // Fallback logic
    let cls = 'bg-gray-500/15 text-gray-300 border-gray-500/20';
    for (const [key, val] of Object.entries(colors)) {
        if (tactic.toLowerCase().includes(key.toLowerCase())) cls = val;
    }

    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${cls}`}>
            {tactic}
        </span>
    );
}

export default function SimulatorPage() {
    const [selectedType, setSelectedType] = useState(SCAM_TYPES[0]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSimulate = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await simulateScam(selectedType);
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to generate simulation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <p className="text-xs text-primary-400 uppercase tracking-widest font-semibold mb-2">Cyber Awareness Training</p>
                <h1 className="text-4xl font-extrabold text-white mb-3">
                    Scam <span className="text-gradient">Simulator</span>
                </h1>
                <p className="text-gray-500 max-w-lg mx-auto text-sm">
                    Safely generate realistic scam messages to understand their psychological mechanics and learn how to respond.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Controls */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-dark border border-white/[0.07] rounded-2xl p-6 space-y-5"
                >
                    <div>
                        <label className="block text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">
                            Select Scam Vector
                        </label>
                        <div className="space-y-2">
                            {SCAM_TYPES.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all
                                        ${selectedType === type
                                            ? 'bg-primary-500/10 border-primary-500/30 text-primary-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                                            : 'bg-white/[0.02] border-white/[0.05] text-gray-400 hover:bg-white/[0.05]'
                                        }
                                    `}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSimulate}
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-primary-600 text-black font-bold flex items-center justify-center gap-2 hover:bg-primary-500 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                        Generate Simulation
                    </button>

                    {error && (
                        <div className="p-3 bg-danger-500/10 border border-danger-500/20 rounded-xl text-center">
                            <p className="text-xs text-danger-400">{error}</p>
                        </div>
                    )}
                </motion.div>

                {/* Output Area */}
                <div className="md:col-span-2 relative">
                    <AnimatePresence mode="wait">
                        {!result && !loading && (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full border border-dashed border-white/[0.1] rounded-2xl flex flex-col items-center justify-center text-center p-10 py-24"
                            >
                                <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mb-4">
                                    <ShieldAlert className="w-8 h-8 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-400 mb-1">No Simulation Active</h3>
                                <p className="text-sm text-gray-600">Select a scam type and click Generate to see how it works.</p>
                            </motion.div>
                        )}

                        {loading && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 glass-dark border border-white/[0.07] rounded-2xl flex flex-col items-center justify-center text-center z-10"
                            >
                                <RefreshCw className="w-10 h-10 text-primary-400 animate-spin mb-4" />
                                <p className="text-white font-bold">Forging Fake Scam...</p>
                                <p className="text-xs text-gray-500">Generating psychological manipulation tactics.</p>
                            </motion.div>
                        )}

                        {result && !loading && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                {/* The Fake Message Card (styled like a phone bubble) */}
                                <div className="glass-dark border border-white/[0.07] rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        <Smartphone className="w-4 h-4 text-primary-400" /> Simulated Message
                                    </div>
                                    <div className="bg-[#1e2329] p-4 rounded-xl rounded-tl-sm border border-[#2b3139] shadow-lg max-w-md">
                                        <p className="whitespace-pre-wrap text-sm text-gray-200">
                                            {result.fake_scam_message}
                                        </p>
                                    </div>
                                </div>

                                {/* Analytics Panel */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="glass-dark border border-white/[0.07] rounded-2xl p-5">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-danger-400" /> Manipulation Tactics
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.tactics_used.map((tactic, i) => (
                                                <TacticBadge key={i} tactic={tactic} />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="glass-dark border border-white/[0.07] rounded-2xl p-5">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-primary-400" /> Psychological Exploit
                                        </h4>
                                        <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 border-primary-500/50 pl-3">
                                            "{result.psychological_explanation}"
                                        </p>
                                    </div>
                                </div>

                                {/* Defense Guide */}
                                <div className="glass-dark border border-green-500/20 bg-green-500/5 rounded-2xl p-5">
                                    <h4 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4" /> Safe Response Guide
                                    </h4>
                                    <ul className="space-y-2">
                                        {result.safe_response_guidelines.map((guide, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-green-100">
                                                <span className="text-green-500 font-bold shrink-0">•</span>
                                                {guide}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
