import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { Shield, LayoutDashboard, Search, AlertTriangle, LogOut } from 'lucide-react'

export default function Navbar() {
    const navigate = useNavigate()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    return (
        <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-400">
                    <Shield className="w-6 h-6" />
                    <span>SEDS</span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-1 hover:text-primary-400 transition-colors">
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/analyze" className="flex items-center gap-1 hover:text-primary-400 transition-colors">
                        <Search className="w-4 h-4" />
                        <span>Analyzer</span>
                    </Link>
                    <Link to="/risk" className="flex items-center gap-1 hover:text-primary-400 transition-colors">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Risk Assessment</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1 text-danger-400 hover:text-danger-300 transition-colors ml-4"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    )
}
