"use client";

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, Search, ShieldAlert, CheckCircle2,
    AlertTriangle, AlertCircle, X, FileImage, RefreshCw
} from 'lucide-react';
import { analyzeImage } from '@/services/api';

const DEMO_MESSAGES = [
    "Congratulations! You've won ₹50,000 in PhonePe lottery. Share your UPI ID & OTP to claim your prize. Act now!",
    "URGENT: Your SBI account is blocked due to KYC not updated. Click link to verify now or account will be suspended.",
    "Dear Customer, your PAN card linked to Aadhaar is expiring. Share your OTP immediately to avoid penalty."
];

function TacticBadge({ tactic }) {
    const colors = {
        Urgency: 'bg-orange-500/15 text-orange-300 border-orange-500/20',
        Fear: 'bg-red-500/15 text-red-300 border-red-500/20',
        'Authority impersonation': 'bg-purple-500/15 text-purple-300 border-purple-500/20',
        'Reward bait': 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
        Scarcity: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
        Unknown: 'bg-gray-500/15 text-gray-300 border-gray-500/20',
    };
    const cls = colors[tactic] || colors.Unknown;
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${cls}`}>
            {tactic}
        </span>
    );
}

function ScamTypeBadge({ type }) {
    const colors = {
        'UPI Refund Scam': 'bg-red-500/20 text-red-400 border-red-500/30',
        'Fake KYC Suspension': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        'OTP Theft Scam': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'Job Offer Scam': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'Prize Lottery Scam': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'Bank Account Blocked Scam': 'bg-red-500/20 text-red-500 border-red-500/30',
        'Investment / Crypto Scam': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
        'Unknown / Other': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    const cls = colors[type] || colors['Unknown / Other'];
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${cls}`}>
            {type}
        </span>
    );
}

export default function AnalyzerPage() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFile = useCallback((selected) => {
        if (!selected) return;
        if (!selected.type.startsWith('image/')) {
            setError('Please upload an image file (JPG, PNG, WebP).');
            return;
        }
        if (selected.size > 5 * 1024 * 1024) {
            setError('File too large. Maximum size is 5 MB.');
            return;
        }
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
        setResult(null);
        setError(null);
    }, []);

    const handleFileChange = (e) => handleFile(e.target.files[0]);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setError(null);
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        try {
            const data = await analyzeImage(file);
            setResult(data);
        } catch (err) {
            // Distinguish network/timeout errors from backend errors
            if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
                setError('Request timed out. The OCR engine may still be loading on first use — please try again in a few seconds.');
            } else if (!err.response) {
                setError('Cannot reach the backend server. Make sure it is running on port 8000.');
            } else {
                setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const riskLevel = result
        ? result.scam_probability >= 70 ? 'high'
            : result.scam_probability >= 40 ? 'medium' : 'low'
        : null;

    return (
        <div className="max-w-5xl mx-auto space-y-6 py-2">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <p className="text-xs text-primary-400 uppercase tracking-widest font-semibold mb-2">Feature 1</p>
                <h1 className="text-4xl font-extrabold text-white mb-3">
                    Screenshot <span className="text-gradient">Analyzer</span>
                </h1>
                <p className="text-gray-500 max-w-xl mx-auto text-sm">
                    Upload a suspicious WhatsApp message, SMS, or UPI screenshot. Our AI will detect scam tactics and psychological manipulation patterns.
                </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Upload Section */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
                    {/* Drop zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-2xl transition-all overflow-hidden
              ${isDragOver ? 'border-primary-400 bg-primary-500/10' :
                                preview ? 'border-primary-500/40 bg-primary-500/5' :
                                    'border-white/10 hover:border-primary-500/30 bg-white/[0.02]'}
            `}
                    >
                        {preview ? (
                            <div className="relative">
                                <img src={preview} alt="Preview" className="w-full max-h-72 object-contain rounded-xl p-2" />
                                <button
                                    onClick={clearFile}
                                    className="absolute top-3 right-3 p-1.5 bg-black/70 hover:bg-black rounded-lg text-gray-300 hover:text-white transition-all"
                                    aria-label="Remove image"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="px-4 pb-3 flex items-center gap-2 text-xs text-gray-500">
                                    <FileImage className="w-3.5 h-3.5" />
                                    <span className="truncate">{file?.name}</span>
                                    <span className="ml-auto">{(file?.size / 1024).toFixed(0)} KB</span>
                                </div>
                            </div>
                        ) : (
                            <div className="py-16 flex flex-col items-center gap-4 text-center px-8">
                                <div className={`p-5 rounded-2xl transition-all ${isDragOver ? 'bg-primary-500/20' : 'bg-white/[0.04]'}`}>
                                    <Upload className={`w-10 h-10 ${isDragOver ? 'text-primary-400' : 'text-gray-600'}`} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 font-medium">Drag & drop or click to upload</p>
                                    <p className="text-xs text-gray-600 mt-1">JPG, PNG, WebP · Max 5 MB</p>
                                </div>
                            </div>
                        )}
                        {!preview && (
                            <input
                                id="image-upload"
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                        )}
                    </div>

                    {/* Analyze button */}
                    <button
                        id="analyze-btn"
                        disabled={!file || loading}
                        onClick={handleAnalyze}
                        className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-primary-500/20"
                    >
                        {loading ? (
                            <><RefreshCw className="w-5 h-5 animate-spin" /> Analyzing Image...</>
                        ) : (
                            <><ShieldAlert className="w-5 h-5" /> Verify Credibility</>
                        )}
                    </button>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-start gap-2.5 p-3.5 bg-danger-500/10 border border-danger-500/20 rounded-xl text-danger-400 text-sm"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Demo note */}
                    <div className="p-4 bg-white/[0.03] border border-white/[0.07] rounded-xl">
                        <p className="text-xs text-gray-600 font-semibold mb-2 uppercase tracking-wider">Example Scam Messages</p>
                        {DEMO_MESSAGES.map((msg, i) => (
                            <p key={i} className="text-xs text-gray-600 italic mb-1 last:mb-0 leading-relaxed">
                                • {msg.slice(0, 80)}…
                            </p>
                        ))}
                    </div>
                </motion.div>

                {/* Results Section */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="glass-dark rounded-2xl border border-white/[0.07] h-full min-h-[400px] flex flex-col items-center justify-center gap-6"
                            >
                                {/* Animated scan effect */}
                                <div className="relative w-24 h-24">
                                    <div className="absolute inset-0 rounded-full border-2 border-primary-500/20" />
                                    <div className="absolute inset-0 rounded-full border-t-2 border-primary-500 animate-spin" />
                                    <div className="absolute inset-4 rounded-full border-2 border-primary-500/30" />
                                    <div className="absolute inset-4 rounded-full border-t-2 border-primary-400 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                                    <ShieldAlert className="absolute inset-0 m-auto w-8 h-8 text-primary-400 animate-pulse" />
                                </div>
                                <div className="text-center">
                                    <p className="text-white font-bold">Analyzing Image</p>
                                    <p className="text-gray-500 text-sm mt-1">Running OCR + AI threat detection…</p>
                                </div>
                            </motion.div>
                        ) : !result ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="glass-dark rounded-2xl border border-white/[0.07] h-full min-h-[400px] flex flex-col items-center justify-center text-center gap-4 p-8"
                            >
                                <div className="p-5 bg-white/[0.04] rounded-2xl">
                                    <Search className="w-10 h-10 text-gray-700" />
                                </div>
                                <div>
                                    <p className="text-gray-500 font-medium">Results appear here</p>
                                    <p className="text-gray-600 text-sm mt-1">Upload an image and click Verify Credibility</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="glass-dark rounded-2xl border border-white/[0.07] p-6 space-y-5"
                            >
                                {/* Risk header */}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white mb-2">Analysis Report</h3>
                                    {result.is_scam && (
                                        <div className="flex items-center gap-2 bg-danger-500/10 border border-danger-500/20 px-3 py-1 rounded-lg">
                                            <ShieldAlert className="w-5 h-5 text-danger-400" />
                                            <span className="text-sm font-bold text-danger-400 uppercase tracking-widest">Scam Detected</span>
                                        </div>
                                    )}
                                </div>

                                {/* Scam Type Details */}
                                <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] flex items-center justify-between">
                                    <span className="text-sm text-gray-400 font-semibold">Scam Type:</span>
                                    <ScamTypeBadge type={result.scam_type || "Unknown / Other"} />
                                </div>

                                {/* Probability bar */}
                                <div>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-gray-400">Scam Probability</span>
                                        <span className={`font-bold ${riskLevel === 'high' ? 'text-danger-400' : riskLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                                            {result.scam_probability}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${result.scam_probability}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                            className={`h-full rounded-full ${riskLevel === 'high' ? 'bg-danger-500' : riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}
                                        />
                                    </div>
                                </div>

                                {/* Extracted & Translated Text */}
                                {result.extracted_text && (
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Original Extracted Text</p>
                                        <div className="p-3 bg-black/40 border border-white/[0.05] rounded-xl text-xs text-gray-400 max-h-24 overflow-y-auto font-mono whitespace-pre-wrap">
                                            {result.extracted_text}
                                        </div>
                                        {result.translated_text && (
                                            <div className="mt-3">
                                                <p className="text-[10px] text-primary-400 uppercase font-bold tracking-widest mb-2">English Translation</p>
                                                <div className="p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl text-sm text-gray-300 max-h-32 overflow-y-auto font-mono whitespace-pre-wrap">
                                                    {result.translated_text}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tactics */}
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">Manipulation Tactics</p>
                                    <div className="flex flex-wrap gap-2">
                                        {result.tactics_detected && result.tactics_detected.length > 0 ? (
                                            result.tactics_detected.map((tactic) => (
                                                <TacticBadge key={tactic} tactic={tactic} />
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-500 italic">No specific manipulation tactics detected.</span>
                                        )}
                                    </div>
                                </div>

                                {/* Explanation */}
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">AI Explanation</p>
                                    <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-primary-500/30 pl-3 py-1 italic">
                                        {result.explanation}
                                    </p>
                                </div>

                                {/* Recommended action */}
                                <div className={`p-4 rounded-xl border flex gap-3
                  ${riskLevel === 'high' ? 'bg-danger-500/10 border-danger-500/20' : 'bg-primary-500/10 border-primary-500/20'}`}>
                                    <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${riskLevel === 'high' ? 'text-danger-400' : 'text-primary-400'}`} />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-400">Recommended Action</p>
                                        <p className="text-sm text-gray-200">{result.recommended_action}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={clearFile}
                                    className="w-full py-2.5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-xl text-sm text-gray-400 transition-all"
                                >
                                    Analyze Another Screenshot
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
