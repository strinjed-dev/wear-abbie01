"use client";

import React, { useEffect, useState } from 'react';
import { ShieldCheck, ArrowRight, Mail, Heart, CheckCircle2, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AuthSuccessPage() {
    const [name, setName] = useState("");

    useEffect(() => {
        const getProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "");
            }
        };
        getProfile();
    }, []);

    return (
        <div className="min-h-screen bg-white text-zinc-900 flex items-center justify-center p-6 relative overflow-hidden">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap');
                :root { 
                    --font-outfit: 'Outfit', sans-serif; 
                    --font-playfair: 'Playfair Display', serif; 
                    --gold: #D4AF37;
                }
                body { font-family: var(--font-outfit); }
                .font-serif { font-family: var(--font-playfair); }
                
                @keyframes float {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                .float { animation: float 6s ease-in-out infinite; }
                
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-content { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>

            {/* Background Aesthetics */}
            <div className="absolute top-[-10%] right-[-5%] w-[40%] aspect-square bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] aspect-square bg-[#3E2723]/5 rounded-full blur-[120px] pointer-events-none"></div>

            <main className="max-w-xl w-full text-center relative z-10 animate-content">
                {/* Brand Identity */}
                <div className="mb-12">
                    <img src="/logo.png" alt="Wear Abbie" className="h-10 mx-auto mb-10" />
                    <div className="w-24 h-24 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                        <CheckCircle2 className="w-10 h-10 text-[#D4AF37]" />
                        <div className="absolute inset-0 rounded-full border border-[#D4AF37]/20 scale-125 animate-pulse"></div>
                    </div>
                </div>

                {/* Main Message */}
                <h1 className="text-4xl md:text-6xl font-serif font-black mb-6 tracking-tight leading-tight">
                    Welcome <span className="italic font-light text-[#D4AF37]">Verified.</span>
                </h1>

                <p className="text-zinc-500 text-lg md:text-xl font-medium mb-12 px-4 leading-relaxed">
                    Welcome to the house. Your account is now fully active. We've prepared our signature collections for your refined selection.
                </p>

                {/* Actions */}
                <div className="space-y-4">
                    <a
                        href="/shop"
                        className="w-full bg-[#121212] text-white py-6 rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:bg-[#D4AF37] hover:scale-[1.02] transition-all group"
                    >
                        Enter Collections <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>

                    <div className="flex items-center justify-center gap-8 pt-8">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100">
                                <ShieldCheck className="w-5 h-5 text-zinc-400" />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Secure Protocol</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100">
                                <ShoppingBag className="w-5 h-5 text-zinc-400" />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Curated Scents</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100">
                                <Heart className="w-5 h-5 text-zinc-400" />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Member Perks</span>
                        </div>
                    </div>
                </div>

                {/* Footer Decor */}
                <p className="mt-16 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center justify-center gap-3">
                    <span className="w-10 h-px bg-zinc-100"></span>
                    Wear Abbie • Signature Est. 2026
                    <span className="w-10 h-px bg-zinc-100"></span>
                </p>
            </main>

            {/* Floating Graphic Assets */}
            <div className="absolute top-[20%] left-[10%] opacity-20 float">
                <ShoppingBag size={40} className="text-[#3E2723]" />
            </div>
            <div className="absolute bottom-[20%] right-[10%] opacity-20 float" style={{ animationDelay: '2s' }}>
                <ShoppingBag size={40} className="text-[#D4AF37]" />
            </div>
        </div>
    );
}
