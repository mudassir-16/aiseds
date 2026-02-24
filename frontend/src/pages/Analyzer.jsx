import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Search, ShieldAlert, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'
import { analyzeImage } from '../services/api'

export default function Analyzer() {
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    const handleFileChange = (e) => {
        const selected = e.target.files[0]
        if (selected) {
            setFile(selected)
            setPreview(URL.createObjectURL(selected))
            setResult(null)
            setError(null)
        }
    }

    const handleAnalyze = async () => {
        if (!file) return
        setLoading(true)
        setError(null)
        try {
            const data = await analyzeImage(file)
            setResult(data)
        } catch (err) {
            setError(err.response?.data?.detail || 'Analysis failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gradient mb-4">Screenshot Analyzer</h1>
                <p className="text-gray-400">Upload a suspicious screenshot to detect financial scam tactics.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="space-y-6">
                    <div
                        className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-4 transition-all
              ${preview ? 'border-primary-500/50 bg-primary-500/5' : 'border-white/10 hover:border-primary-500/30 bg-black/20'}`}
                    >
                        {preview ? (
                            <img src={preview} alt="Preview" className="max-h-64 rounded-xl shadow-2xl" />
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="p-4 bg-white/5 rounded-2xl inline-block">
                                    <Upload className="w-10 h-10 text-gray-500" />
                                </div>
                                <p className="text-sm text-gray-400">Drag and drop or click to upload screenshot</p>
                            </div>
                        )}
                        <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                    </div>

                    <button
                        disabled={!file || loading}
                        onClick={handleAnalyze}
                        className="w-full bg-primary-600 hover:bg-primary-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Search className="w-5 h-5 animate-spin" />
                                <span>Analyzing Image...</span>
                            </>
                        ) : (
                            <>
                                <ShieldAlert className="w-5 h-5" />
                                <span>Verify Credibility</span>
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="p-4 bg-danger-400/10 border border-danger-400/20 rounded-2xl flex gap-3 text-danger-400">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                </div>

                {/* Results Section */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {!result ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full glass-dark rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 text-gray-500"
                            >
                                <div className="p-4 bg-white/5 rounded-full">
                                    <Search className="w-8 h-8 opacity-20" />
                                </div>
                                <p>Results will appear here after analysis</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-dark rounded-3xl p-8 space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold">Analysis Report</h3>
                                    <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                    ${result.scam_probability > 70 ? 'bg-danger-500/20 text-danger-400' : 'bg-green-500/20 text-green-400'}`}>
                                        {result.scam_probability > 70 ? 'High Risk' : 'Low Risk'}
                                    </div>
                                </div>

                                <div className="relative pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-400">Scam Probability</span>
                                        <span className={`text-lg font-bold ${result.scam_probability > 70 ? 'text-danger-400' : 'text-green-400'}`}>
                                            {result.scam_probability}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${result.scam_probability}%` }}
                                            className={`h-full ${result.scam_probability > 70 ? 'bg-danger-500' : 'bg-green-500'}`}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-gray-300">Detected Tactics:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {result.tactics_detected.map((tactic) => (
                                            <span key={tactic} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs">
                                                {tactic}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-gray-300">Explanation:</p>
                                    <p className="text-sm text-gray-400 leading-relaxed italic border-l-2 border-primary-500/30 pl-4">
                                        "{result.explanation}"
                                    </p>
                                </div>

                                <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-primary-400 shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-primary-400 uppercase tracking-tighter mb-1">Recommended Action</p>
                                        <p className="text-sm text-gray-300">{result.recommended_action}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
