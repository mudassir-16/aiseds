"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/services/supabase';
import {
    History, Shield, AlertTriangle, CheckCircle2,
    ArrowRight, ExternalLink, TrendingUp, Zap, RefreshCw, X, Search
} from 'lucide-react';
import Link from 'next/link';

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' }
    })
};

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
        <span className={`px-3 py-1 text-[10px] rounded-full font-bold uppercase tracking-wider border ${cls}`}>
            {type}
        </span>
    );
}

function StatCard({ label, value, sub, color = 'primary', icon: Icon, index }) {
    return (
        <motion.div
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="glass-dark rounded-2xl p-6 border border-white/[0.07] flex flex-col gap-3"
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center
        ${color === 'danger' ? 'bg-danger-500/10 text-danger-400' :
                    color === 'green' ? 'bg-green-500/10 text-green-400' :
                        'bg-primary-500/10 text-primary-400'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-3xl font-black text-white">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
                {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
            </div>
        </motion.div>
    );
}

export default function Dashboard() {
    const [scans, setScans] = useState([]);
    const [riskReports, setRiskReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [selectedScan, setSelectedScan] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUser(user);

        const [scansRes, riskRes] = await Promise.all([
            supabase.from('scan_reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(8),
            supabase.from('risk_reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1)
        ]);

        setScans(scansRes.data || []);
        setRiskReports(riskRes.data || []);
        setLoading(false);
    };

    const latestRisk = riskReports[0];
    const highRiskScans = scans.filter(s => s.scam_probability > 70).length;
    const avgProb = scans.length > 0
        ? Math.round(scans.reduce((a, b) => a + b.scam_probability, 0) / scans.length)
        : 0;

    return (
        <div className="space-y-8 py-2">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <p className="text-xs text-primary-400 uppercase tracking-widest font-semibold mb-1">Dashboard</p>
                    <h1 className="text-3xl font-extrabold text-white">
                        Citizen Shield <span className="text-gradient">Command</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {user?.email && <span className="text-gray-400">{user.email}</span>} · Your cybersecurity at a glance
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        id="new-scan-btn"
                        href="/analyze"
                        className="bg-primary-600 hover:bg-primary-500 px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all text-white shadow-lg shadow-primary-500/20"
                    >
                        <Shield className="w-4 h-4" /> New Scan
                    </Link>
                    <button
                        id="refresh-btn"
                        onClick={fetchData}
                        className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-gray-400"
                        aria-label="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </motion.div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard index={0} label="Total Scans" value={scans.length} sub="All time" icon={History} />
                <StatCard index={1} label="High Risk Detected" value={highRiskScans} color="danger" icon={AlertTriangle} />
                <StatCard index={2} label="Avg. Scam Probability" value={`${avgProb}%`} color="green" icon={TrendingUp} />
                <StatCard
                    index={3}
                    label="Risk Score"
                    value={latestRisk ? `${latestRisk.risk_score}/100` : 'N/A'}
                    sub={latestRisk?.risk_level || 'Not assessed'}
                    color={latestRisk?.risk_level?.includes('High') ? 'danger' : 'green'}
                    icon={Zap}
                />
            </div>

            {/* Main grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Risk Summary */}
                <motion.div
                    custom={4}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="glass-dark rounded-2xl p-6 border border-white/[0.07]"
                >
                    <div className="flex items-center gap-2 text-primary-400 font-semibold text-xs uppercase tracking-widest mb-5">
                        <Shield className="w-4 h-4" /> Vulnerability Status
                    </div>

                    {latestRisk ? (
                        <div className="space-y-5">
                            {/* Score ring */}
                            <div className="text-center py-2">
                                <div className="relative inline-block">
                                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="none" />
                                        <circle
                                            cx="50" cy="50" r="40"
                                            stroke={latestRisk.risk_score > 60 ? '#f43f5e' : latestRisk.risk_score > 30 ? '#facc15' : '#22c55e'}
                                            strokeWidth="10"
                                            fill="none"
                                            strokeDasharray={`${(latestRisk.risk_score / 100) * 251.2} 251.2`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black">{latestRisk.risk_score}</span>
                                        <span className="text-xs text-gray-500">/ 100</span>
                                    </div>
                                </div>
                                <div className={`text-xs font-bold uppercase tracking-wider mt-2
                  ${latestRisk.risk_level?.includes('High') ? 'text-danger-400' :
                                        latestRisk.risk_level?.includes('Medium') ? 'text-yellow-400' : 'text-green-400'}`}>
                                    {latestRisk.risk_level}
                                </div>
                            </div>

                            <div className="p-3 bg-white/[0.04] rounded-xl border border-white/[0.07]">
                                <p className="text-[10px] text-gray-600 uppercase font-bold mb-1">Likely Target</p>
                                <p className="text-sm font-semibold text-white">{latestRisk.predicted_scam_type}</p>
                            </div>

                            <Link id="view-risk-report" href="/risk" className="flex items-center justify-center gap-1.5 text-primary-400 text-xs hover:text-primary-300 transition-colors">
                                Update Risk Assessment <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-10 space-y-4">
                            <div className="w-16 h-16 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto">
                                <Zap className="w-8 h-8 text-gray-600" />
                            </div>
                            <p className="text-gray-500 text-sm">No risk assessment yet.</p>
                            <Link
                                id="start-assessment-btn"
                                href="/risk"
                                className="inline-block w-full py-2.5 bg-primary-600/20 border border-primary-500/20 rounded-xl text-sm font-semibold text-primary-400 hover:bg-primary-600/30 transition-all text-center"
                            >
                                Start Free Assessment
                            </Link>
                        </div>
                    )}
                </motion.div>

                {/* Recent Scans */}
                <motion.div
                    custom={5}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="md:col-span-2 glass-dark rounded-2xl p-6 border border-white/[0.07]"
                >
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2 text-primary-400 font-semibold text-xs uppercase tracking-widest">
                            <History className="w-4 h-4" /> Recent Scans
                        </div>
                        {scans.length > 0 && (
                            <Link href="/analyze" className="text-xs text-gray-500 hover:text-primary-400 transition-colors">
                                + New Scan
                            </Link>
                        )}
                    </div>

                    <div className="space-y-2.5">
                        {loading ? (
                            <div className="space-y-2.5">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-14 bg-white/[0.04] rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : scans.length > 0 ? (
                            scans.map((scan, i) => (
                                <motion.div
                                    key={scan.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setSelectedScan(scan)}
                                    className="p-3.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl flex items-center justify-between transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                      ${scan.scam_probability > 70 ? 'bg-danger-500/15 text-danger-400' : 'bg-green-500/15 text-green-400'}`}>
                                            {scan.scam_probability > 70
                                                ? <AlertTriangle className="w-4 h-4" />
                                                : <CheckCircle2 className="w-4 h-4" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-white font-medium truncate max-w-[220px] md:max-w-xs">
                                                {scan.extracted_text?.slice(0, 60) || 'No text extracted'}
                                                {scan.extracted_text?.length > 60 ? '…' : ''}
                                            </p>
                                            <p className="text-[11px] text-gray-600">
                                                {new Date(scan.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className={`text-sm font-bold
                      ${scan.scam_probability > 70 ? 'text-danger-400' : 'text-green-400'}`}>
                                            {scan.scam_probability}%
                                        </span>
                                        <ExternalLink className="w-3.5 h-3.5 text-gray-700 group-hover:text-primary-400 transition-colors" />
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-16 border border-dashed border-white/[0.08] rounded-2xl">
                                <div className="w-14 h-14 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Shield className="w-7 h-7 text-gray-600" />
                                </div>
                                <p className="text-gray-500 text-sm mb-3">No scans performed yet.</p>
                                <Link href="/analyze" className="text-primary-400 text-sm font-semibold hover:underline">
                                    Analyze your first screenshot →
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Quick actions */}
            <motion.div custom={6} variants={cardVariants} initial="hidden" animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/analyze"
                    className="glass-dark border border-white/[0.07] rounded-2xl p-5 flex items-center gap-4 hover:border-primary-500/30 hover:bg-primary-500/5 transition-all group">
                    <div className="w-12 h-12 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-white">Analyze Screenshot</p>
                        <p className="text-xs text-gray-500">Upload a suspicious message to scan for scam tactics</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-primary-400 ml-auto transition-colors" />
                </Link>
                <Link href="/risk"
                    className="glass-dark border border-white/[0.07] rounded-2xl p-5 flex items-center gap-4 hover:border-primary-500/30 hover:bg-primary-500/5 transition-all group">
                    <div className="w-12 h-12 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-white">Risk Assessment</p>
                        <p className="text-xs text-gray-500">10-question quiz to evaluate your cyber vulnerability</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-primary-400 ml-auto transition-colors" />
                </Link>
            </motion.div>

            {/* Selected Scan Modal */}
            <AnimatePresence>
                {selectedScan && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedScan(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0b0c10] border border-white/[0.08] rounded-2xl p-6 max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between mb-6 shrink-0">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Search className="w-5 h-5 text-primary-400" /> Scan Report Snapshot
                                </h3>
                                <button onClick={() => setSelectedScan(null)} className="p-1.5 text-gray-500 hover:text-white bg-white/5 rounded-lg transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-6 overflow-y-auto pr-2 pb-2">
                                {/* Scam Header & Type */}
                                <div className="p-4 rounded-xl flex items-center justify-between border bg-white/[0.02] border-white/[0.05]">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-sm text-gray-400 font-semibold">Scam Probability</span>
                                        <ScamTypeBadge type={selectedScan.scam_type || 'Unknown / Other'} />
                                    </div>
                                    <span className={`text-3xl font-black ${selectedScan.scam_probability > 70 ? 'text-danger-400' : 'text-green-400'}`}>
                                        {selectedScan.scam_probability}%
                                    </span>
                                </div>

                                {/* Extracted Text */}
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Message Extracted By OCR</p>
                                    <div className="p-3 bg-black/40 border border-white/[0.05] rounded-xl text-xs text-gray-400 max-h-24 overflow-y-auto font-mono whitespace-pre-wrap">
                                        {selectedScan.extracted_text || <span className="text-gray-600 italic">No text extracted from this image.</span>}
                                    </div>

                                    {selectedScan.translated_text && (
                                        <div className="mt-4">
                                            <p className="text-[10px] text-primary-400 uppercase font-bold tracking-widest mb-2">English Translation</p>
                                            <div className="p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl text-sm text-gray-300 max-h-32 overflow-y-auto font-mono whitespace-pre-wrap">
                                                {selectedScan.translated_text}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Tactics */}
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Manipulation Tactics</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(selectedScan.tactics_detected) && selectedScan.tactics_detected.length > 0 ? (
                                            selectedScan.tactics_detected.map((tactic, i) => (
                                                <span key={i} className="px-2.5 py-1 text-xs font-semibold rounded-lg border bg-white/[0.05] border-white/10 text-gray-300">
                                                    {tactic}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-500 italic">No specific manipulation tactics detected.</span>
                                        )}
                                    </div>
                                </div>

                                {/* Explanation */}
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">AI Explanation</p>
                                    <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-primary-500/30 pl-3 py-1 italic">
                                        {selectedScan.explanation || "No explanation available for this scan."}
                                    </p>
                                </div>

                                {/* Recommendation */}
                                <div className={`p-4 rounded-xl border flex gap-3 ${selectedScan.scam_probability > 70 ? 'bg-danger-500/10 border-danger-500/20' : 'bg-primary-500/10 border-primary-500/20'}`}>
                                    <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${selectedScan.scam_probability > 70 ? 'text-danger-400' : 'text-primary-400'}`} />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-gray-400">Recommended Action</p>
                                        <p className="text-sm text-gray-200">{selectedScan.recommended_action || "Stay vigilant and verify through official channels."}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
