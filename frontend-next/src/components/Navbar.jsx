"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/services/supabase';
import { Shield, LayoutDashboard, Search, AlertTriangle, LogOut, Smartphone } from 'lucide-react';

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/analyze', label: 'Analyzer', icon: Search },
    { href: '/risk', label: 'Risk Assessment', icon: AlertTriangle },
    { href: '/simulate', label: 'Simulator', icon: Smartphone },
];

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <nav className="border-b border-white/[0.06] bg-black/60 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="p-1.5 rounded-lg bg-primary-500/10 border border-primary-500/20 group-hover:bg-primary-500/20 transition-all">
                        <Shield className="w-5 h-5 text-primary-400" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">
                        <span className="text-gradient">SEDS</span>
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-1">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${isActive
                                        ? 'bg-primary-500/15 text-primary-300 border border-primary-500/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden md:inline">{label}</span>
                            </Link>
                        );
                    })}

                    <div className="w-px h-6 bg-white/10 mx-2" />

                    <button
                        id="logout-btn"
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-danger-400 hover:bg-danger-400/10 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden md:inline">Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
