"use client";

import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { supabase } from "@/services/supabase";
import Navbar from "@/components/Navbar";
import { useRouter, usePathname } from "next/navigation";
import { Shield } from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session && pathname !== "/login") {
        router.push("/login");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && pathname !== "/login") {
        router.push("/login");
      } else if (session && pathname === "/login") {
        router.push("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <html lang="en">
        <head>
          <title>SEDS — AI Social Engineering Defense System</title>
          <meta name="description" content="AI-powered financial fraud prevention for Digital India" />
        </head>
        <body className={`${inter.variable}`}>
          <div className="min-h-screen bg-[#070a0f] flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-primary-500/20 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary-400 animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-primary-500/40 animate-ping" />
            </div>
            <p className="text-gray-500 text-sm tracking-widest uppercase">Initializing SEDS</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <title>SEDS — AI Social Engineering Defense System</title>
        <meta name="description" content="AI-powered financial fraud prevention for Digital India. Detect WhatsApp scams, assess cyber risk, and protect yourself from social engineering attacks." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.variable} min-h-screen bg-[#070a0f] text-white`}>
        {session && <Navbar />}
        <main className={`mx-auto max-w-6xl px-4 py-8 ${!session ? 'max-w-none px-0 py-0' : ''}`}>
          {children}
        </main>
      </body>
    </html>
  );
}
