"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, CheckCircle2, ShieldCheck,
    RefreshCw, ChevronLeft, Zap, Shield
} from 'lucide-react';
import { assessRisk } from '@/services/api';

const QUESTIONS = [
    { id: 'reuse_passwords', label: 'Do you reuse the same password for banking and social media?', unsafe: 'Yes', icon: '🔑', risk: 'Password reuse is one of the most common ways accounts get hacked.' },
    { id: 'enable_2fa', label: 'Do you enable Two-Factor Authentication (2FA) on all financial accounts?', unsafe: 'No', icon: '🛡️', risk: '2FA blocks 99% of automated account compromise attacks.' },
    { id: 'click_unknown_links', label: 'Do you click on links sent via SMS from unknown numbers?', unsafe: 'Yes', icon: '🔗', risk: 'SMS phishing (smishing) is the #1 vector for UPI fraud in India.' },
    { id: 'verify_upi', label: 'Do you verify the name on a UPI request before entering your PIN?', unsafe: 'No', icon: '💳', risk: 'Unverified UPI requests are a primary source of direct payment fraud.' },
    { id: 'shared_otp', label: 'Have you ever shared an OTP with someone claiming to be a bank official?', unsafe: 'Yes', icon: '📱', risk: 'Real banks NEVER ask for OTPs. Sharing OTPs is an instant account compromise.' },
    { id: 'public_wifi', label: 'Do you use public WiFi to access your banking application?', unsafe: 'Yes', icon: '📡', risk: 'Public WiFi allows man-in-the-middle attacks to intercept your credentials.' },
    { id: 'unknown_apps', label: 'Do you install apps not from the Official Play Store/App Store?', unsafe: 'Yes', icon: '📲', risk: 'Sideloaded apps often contain malware that can steal banking credentials.' },
    { id: 'update_phone', label: 'Do you update your phone system software regularly?', unsafe: 'No', icon: '🔄', risk: 'Unpatched phones are vulnerable to known exploits used in financial attacks.' },
    { id: 'verify_messages', label: 'Do you verify messages from your bank via official customer care numbers?', unsafe: 'No', icon: '📞', risk: 'Fraudsters spoof bank SMS. Always verify via official numbers.' },
    { id: 'backup_data', label: 'Do you have a secure backup of your critical financial data?', unsafe: 'No', icon: '💾', risk: 'Without backups, ransomware or device loss can permanently compromise your finances.' },
];

export default function RiskAssessmentPage() {
    const [answers, setAnswers] = useState({});
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleAnswer = (val) => {
        const newAnswers = { ...answers, [QUESTIONS[step].id]: val };
        setAnswers(newAnswers);
        if (step < QUESTIONS.length - 1) {
            setStep(step + 1);
        } else {
            handleSubmit(newAnswers);
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleSubmit = async (finalAnswers) => {
        setLoading(true);
        setError(null);
        try {
            const data = await assessRisk(finalAnswers);
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Assessment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setAnswers({});
        setStep(0);
        setResult(null);
        setError(null);
    };

    const progress = ((step + 1) / QUESTIONS.length) * 100;
    const currentQ = QUESTIONS[step];

    const riskColor = (level) => {
        if (!level) return '';
        if (level.includes('High')) return 'danger';
        if (level.includes('Medium')) return 'warn';
        return 'green';
    };

    return (
        <div className="max-w-2xl mx-auto py-2 space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <p className="text-xs text-primary-400 uppercase tracking-widest font-semibold mb-2">Feature 3 & 4</p>
                <h1 className="text-4xl font-extrabold text-white mb-3">
                    Cyber <span className="text-gradient">Risk Assessment</span>
                </h1>
                <p className="text-gray-500 max-w-lg mx-auto text-sm">
                    Answer 10 behavioral questions. Our AI evaluates your digital habits and predicts your most likely fraud vulnerability.
                </p>
            </motion.div>

            <AnimatePresence mode="wait">
                {/* Loading */}
                {loading && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="glass-dark rounded-2xl border border-white/[0.07] p-16 text-center space-y-6">
                        <div className="relative w-20 h-20 mx-auto">
                            <div className="absolute inset-0 rounded-full border-2 border-primary-500/20" />
                            <div className="absolute inset-0 rounded-full border-t-2 border-primary-400 animate-spin" />
                            <Zap className="absolute inset-0 m-auto w-8 h-8 text-primary-400 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Calculating Risk Score</h2>
                            <p className="text-gray-500 text-sm mt-1">Our AI is analyzing your behavioral patterns…</p>
                        </div>
                    </motion.div>
                )}

                {/* Error */}
                {!loading && error && (
                    <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="glass-dark rounded-2xl border border-danger-500/20 p-8 text-center space-y-4">
                        <AlertTriangle className="w-12 h-12 text-danger-400 mx-auto" />
                        <p className="text-white font-bold">Assessment Failed</p>
                        <p className="text-gray-500 text-sm">{error}</p>
                        <button onClick={reset} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl text-sm font-bold transition-all">
                            Try Again
                        </button>
                    </motion.div>
                )}

                {/* Result */}
                {!loading && !error && result && (
                    <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                        className="space-y-5">
                        {/* Score banner */}
                        <div className={`glass-dark rounded-2xl border p-6 flex items-center justify-between
              ${riskColor(result.risk_level) === 'danger' ? 'border-danger-500/30' :
                                riskColor(result.risk_level) === 'warn' ? 'border-yellow-500/30' : 'border-green-500/30'}`}>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Your Risk Score</p>
                                <h2 className="text-5xl font-black text-gradient">{result.risk_score}<span className="text-2xl text-gray-600">/100</span></h2>
                            </div>
                            <div className={`text-center px-6 py-3 rounded-xl border font-bold text-lg
                ${riskColor(result.risk_level) === 'danger' ? 'bg-danger-500/15 border-danger-500/30 text-danger-300' :
                                    riskColor(result.risk_level) === 'warn' ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300' :
                                        'bg-green-500/15 border-green-500/30 text-green-300'}`}>
                                {result.risk_level}
                            </div>
                        </div>

                        {/* Score bar */}
                        <div className="glass-dark rounded-2xl border border-white/[0.07] p-5">
                            <div className="flex justify-between text-xs text-gray-500 mb-3">
                                <span>Low Risk</span><span>Medium</span><span>High Risk</span>
                            </div>
                            <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden relative">
                                <div className="absolute inset-0 flex">
                                    <div className="h-full w-1/3 bg-green-500/20" />
                                    <div className="h-full w-1/3 bg-yellow-500/20" />
                                    <div className="h-full w-1/3 bg-danger-500/20" />
                                </div>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${result.risk_score}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className={`absolute h-full rounded-full top-0 left-0
                    ${riskColor(result.risk_level) === 'danger' ? 'bg-danger-500' :
                                            riskColor(result.risk_level) === 'warn' ? 'bg-yellow-500' : 'bg-green-500'}`}
                                />
                                <motion.div
                                    initial={{ left: '0%' }}
                                    animate={{ left: `${result.risk_score}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-gray-800 shadow-lg"
                                />
                            </div>
                        </div>

                        {/* Predicted scam */}
                        <div className="glass-dark rounded-2xl border border-white/[0.07] p-5 space-y-3">
                            <div className="flex items-center gap-2 text-primary-400 text-xs font-bold uppercase tracking-wider">
                                <AlertTriangle className="w-4 h-4" /> Predicted Scam Vulnerability
                            </div>
                            <p className="text-2xl font-bold text-white">{result.predicted_scam_type}</p>
                            <p className="text-gray-400 text-sm leading-relaxed">{result.explanation}</p>
                        </div>

                        {/* Behavioral Risk Correlation Engine (BRCE) */}
                        {result.correlation_insight && result.correlation_insight.risky_behaviors?.length > 0 && (
                            <div className="glass-dark rounded-2xl border border-primary-500/20 bg-primary-500/5 p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-primary-400 text-xs font-bold uppercase tracking-wider">
                                        <Zap className="w-4 h-4" /> Behavioral Risk Correlation
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full bg-danger-500/20 text-danger-400 text-xs font-black border border-danger-500/30">
                                        {result.correlation_insight.risk_multiplier}x RISK MULTIPLIER
                                    </span>
                                </div>

                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Key Contributing Behaviors</p>
                                    <div className="flex flex-wrap gap-2">
                                        {result.correlation_insight.risky_behaviors.map((behavior, idx) => (
                                            <span key={idx} className="px-2.5 py-1 text-xs font-semibold rounded-lg border bg-white/[0.05] border-white/10 text-gray-300 capitalize">
                                                {behavior}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-2 pt-3 border-t border-white/[0.05]">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Intelligence Insight</p>
                                    <p className="text-sm text-gray-300 italic">
                                        "{result.correlation_insight.insight_text}"
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        <div className="glass-dark rounded-2xl border border-white/[0.07] p-5 space-y-4">
                            <div className="flex items-center gap-2 text-primary-400 text-xs font-bold uppercase tracking-wider">
                                <ShieldCheck className="w-4 h-4" /> Personalized Prevention Plan
                            </div>
                            <ol className="space-y-3">
                                {result.recommendations?.map((rec, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className="flex gap-3 p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl"
                                    >
                                        <span className="shrink-0 w-6 h-6 rounded-lg bg-primary-500/20 border border-primary-500/20 text-primary-400 text-xs font-bold flex items-center justify-center">
                                            {i + 1}
                                        </span>
                                        <p className="text-sm text-gray-300 leading-relaxed">{rec}</p>
                                    </motion.li>
                                ))}
                            </ol>
                        </div>

                        <button
                            id="retake-btn"
                            onClick={reset}
                            className="w-full py-3 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-all"
                        >
                            <RefreshCw className="w-4 h-4 inline mr-2" /> Retake Assessment
                        </button>
                    </motion.div>
                )}

                {/* Quiz */}
                {!loading && !error && !result && (
                    <motion.div key={`q-${step}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="glass-dark rounded-2xl border border-white/[0.07] p-8 space-y-8">

                        {/* Progress */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span className="font-semibold">Question {step + 1} of {QUESTIONS.length}</span>
                                <span className="text-primary-400 font-bold">{Math.round(progress)}% Complete</span>
                            </div>
                            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                    className="h-full bg-primary-500 rounded-full"
                                />
                            </div>
                        </div>

                        {/* Question body */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <span className="text-3xl">{currentQ.icon}</span>
                                <h2 className="text-2xl font-bold text-white leading-snug">{currentQ.label}</h2>
                            </div>
                            <p className="text-xs text-gray-600 italic pl-10">{currentQ.risk}</p>
                        </div>

                        {/* Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                id="answer-yes"
                                onClick={() => handleAnswer('Yes')}
                                className="py-5 rounded-2xl bg-white/[0.04] border border-white/[0.09] text-white text-xl font-bold hover:border-primary-500/50 hover:bg-primary-500/10 hover:text-primary-300 transition-all active:scale-95"
                            >
                                Yes
                            </button>
                            <button
                                id="answer-no"
                                onClick={() => handleAnswer('No')}
                                className="py-5 rounded-2xl bg-white/[0.04] border border-white/[0.09] text-white text-xl font-bold hover:border-primary-500/50 hover:bg-primary-500/10 hover:text-primary-300 transition-all active:scale-95"
                            >
                                No
                            </button>
                        </div>

                        {/* Back button */}
                        {step > 0 && (
                            <button
                                id="back-btn"
                                onClick={handleBack}
                                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" /> Previous Question
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Steps overview (non-active) */}
            {!result && !loading && (
                <div className="flex gap-1.5 justify-center">
                    {QUESTIONS.map((_, i) => (
                        <div key={i} className={`h-1 rounded-full transition-all ${i < step ? 'bg-primary-500 w-4' :
                            i === step ? 'bg-primary-400 w-6' :
                                'bg-white/10 w-4'
                            }`} />
                    ))}
                </div>
            )}
        </div>
    );
}
