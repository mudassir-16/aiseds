import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../services/supabase'
import { History, Shield, AlertTriangle, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
    const [scans, setScans] = useState([])
    const [riskReports, setRiskReports] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const [scansRes, riskRes] = await Promise.all([
            supabase.table('scan_reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
            supabase.table('risk_reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1)
        ])

        setScans(scansRes.data || [])
        setRiskReports(riskRes.data || [])
        setLoading(false)
    }

    const latestRisk = riskReports[0]

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gradient">Citizen Dashboard</h1>
                    <p className="text-gray-400 mt-2">Your cybersecurity at a glance.</p>
                </div>
                <div className="flex gap-4">
                    <Link to="/analyze" className="btn-primary bg-primary-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-500 transition-all">
                        <Shield className="w-5 h-5" />
                        New Scan
                    </Link>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Risk Summary Card */}
                <div className="md:col-span-1 glass-dark rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-2 text-primary-400 font-bold uppercase tracking-tighter text-sm">
                        <Shield className="w-4 h-4" />
                        Vulnerability Status
                    </div>

                    {latestRisk ? (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="text-5xl font-black mb-2">{latestRisk.risk_score}</div>
                                <div className={`text-sm font-bold uppercase ${latestRisk.risk_level === 'High Risk' ? 'text-danger-400' : 'text-green-400'}`}>
                                    {latestRisk.risk_level}
                                </div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Likely Target</p>
                                <p className="text-sm font-bold">{latestRisk.predicted_scam_type}</p>
                            </div>
                            <Link to="/risk" className="flex items-center justify-center gap-2 text-primary-400 text-sm hover:underline">
                                View Detailed Report <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-8 space-y-4">
                            <p className="text-gray-500 text-sm">No risk assessment found.</p>
                            <Link to="/risk" className="block w-full py-3 bg-white/5 rounded-xl text-sm font-bold hover:bg-white/10 transition-all">
                                Start Assessment
                            </Link>
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="md:col-span-2 glass-dark rounded-3xl p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-primary-400 font-bold uppercase tracking-tighter text-sm">
                            <History className="w-4 h-4" />
                            Recent Scans
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl" />)}
                            </div>
                        ) : scans.length > 0 ? (
                            scans.map((scan) => (
                                <div key={scan.id} className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex items-center justify-between transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${scan.scam_probability > 70 ? 'bg-danger-500/20 text-danger-400' : 'bg-green-500/20 text-green-400'}`}>
                                            {scan.scam_probability > 70 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold truncate max-w-[200px] md:max-w-md">{scan.extracted_text}</p>
                                            <p className="text-xs text-gray-500">{new Date(scan.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-xs font-bold ${scan.scam_probability > 70 ? 'text-danger-400' : 'text-green-400'}`}>
                                            {scan.scam_probability}%
                                        </span>
                                        <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <p className="text-gray-500">No scans performed yet.</p>
                                <Link to="/analyze" className="mt-4 inline-block text-primary-400 font-bold hover:underline">
                                    Analyze your first screenshot
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
