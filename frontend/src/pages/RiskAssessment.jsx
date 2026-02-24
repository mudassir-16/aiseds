import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ClipboardList, CheckCircle2, ShieldInfo, RefreshCw } from 'lucide-react'
import { assessRisk } from '../services/api'

const QUESTIONS = [
    { id: 'reuse_passwords', label: 'Do you reuse the same password for banking and social media?', unsafe: 'Yes' },
    { id: 'enable_2fa', label: 'Do you enable Two-Factor Authentication (2FA) on all financial accounts?', unsafe: 'No' },
    { id: 'click_unknown_links', label: 'Do you click on links sent via SMS from unknown numbers?', unsafe: 'Yes' },
    { id: 'verify_upi', label: 'Do you verify the name on a UPI request before entering your PIN?', unsafe: 'No' },
    { id: 'shared_otp', label: 'Have you ever shared an OTP with someone claiming to be a bank official?', unsafe: 'Yes' },
    { id: 'public_wifi', label: 'Do you use public WiFi to access your banking application?', unsafe: 'Yes' },
    { id: 'unknown_apps', label: 'Do you install apps that are not from the Official Play Store/App Store?', unsafe: 'Yes' },
    { id: 'update_phone', label: 'Do you update your phone system software regularly?', unsafe: 'No' },
    { id: 'verify_messages', label: 'Do you verify messages from bank via official customer care numbers?', unsafe: 'No' },
    { id: 'backup_data', label: 'Do you have a secure backup of your critical financial data?', unsafe: 'No' }
]

export default function RiskAssessment() {
    const [answers, setAnswers] = useState({})
    const [step, setStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)

    const handleAnswer = (val) => {
        const newAnswers = { ...answers, [QUESTIONS[step].id]: val }
        setAnswers(newAnswers)
        if (step < QUESTIONS.length - 1) {
            setStep(step + 1)
        } else {
            handleSubmit(newAnswers)
        }
    }

    const handleSubmit = async (finalAnswers) => {
        setLoading(true)
        try {
            const data = await assessRisk(finalAnswers)
            setResult(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const reset = () => {
        setAnswers({})
        setStep(0)
        setResult(null)
    }

    return (
        <div className="max-w-3xl mx-auto py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gradient mb-4">Cyber Risk Assessment</h1>
                <p className="text-gray-400">Evaluate your digital habits and predict your scam vulnerability.</p>
            </div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="glass-dark rounded-3xl p-12 text-center space-y-4"
                    >
                        <RefreshCw className="w-12 h-12 text-primary-500 animate-spin mx-auto" />
                        <h2 className="text-2xl font-bold">Calculating Risk Score</h2>
                        <p className="text-gray-400">Our AI is analyzing your behavioral patterns...</p>
                    </motion.div>
                ) : result ? (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-dark rounded-3xl p-8 space-y-8"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">Your Risk Score</p>
                                <h2 className="text-5xl font-black text-gradient">{result.risk_score}/100</h2>
                            </div>
                            <div className={`px-6 py-2 rounded-2xl text-lg font-bold
                ${result.risk_level === 'Low Risk' ? 'bg-green-500/20 text-green-400' :
                                    result.risk_level === 'Medium Risk' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-danger-500/20 text-danger-400'}`}>
                                {result.risk_level}
                            </div>
                        </div>

                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                            <div className="flex items-center gap-2 text-primary-400 mb-2">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="font-bold uppercase tracking-tight text-sm">Predicted Scams Target</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{result.predicted_scam_type}</p>
                            <p className="text-gray-400 text-sm leading-relaxed">{result.explanation}</p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <ShieldInfo className="w-5 h-5 text-primary-400" />
                                Personalized Prevention Plan
                            </h3>
                            <div className="grid gap-3">
                                {result.recommendations.map((rec, i) => (
                                    <div key={i} className="flex gap-4 p-4 bg-black/20 rounded-xl border border-white/5">
                                        <span className="text-primary-500 font-bold">#{i + 1}</span>
                                        <p className="text-sm text-gray-300">{rec}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={reset}
                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl transition-all"
                        >
                            Retake Assessment
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="question"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-dark rounded-3xl p-12 space-y-8"
                    >
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-500 uppercase tracking-widest">
                                <span>Question {step + 1} of {QUESTIONS.length}</span>
                                <span>{Math.round(((step + 1) / QUESTIONS.length) * 100)}%</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary-500 transition-all duration-300"
                                    style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold leading-tight">{QUESTIONS[step].label}</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleAnswer('Yes')}
                                className="py-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary-500 hover:bg-primary-500/5 transition-all text-xl font-bold"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => handleAnswer('No')}
                                className="py-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary-500 hover:bg-primary-500/5 transition-all text-xl font-bold"
                            >
                                No
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
