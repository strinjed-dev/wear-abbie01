"use client";

import React, { useState } from 'react';
import { ArrowLeft, Sparkles, User, Mail, Lock, CheckCircle2, ShoppingBag, ArrowRight, Instagram, Facebook, Twitter, Chrome, ShoppingCart } from 'lucide-react';
import { signInWithGoogle, supabase } from '@/lib/supabase';

// --- Monolithic Auth Component ---
export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [authError, setAuthError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setAuthError('');

        try {
            if (mode === 'signup') {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        }
                    }
                });
                if (error) throw error;
                if (data.user) {
                    window.location.href = '/dashboard';
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                if (data.user) {
                    window.location.href = '/dashboard';
                }
            }
        } catch (error: any) {
            setAuthError(error.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-x-hidden">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap');
                
                :root {
                    --font-outfit: 'Outfit', sans-serif;
                    --font-playfair: 'Playfair Display', serif;
                    --gold: #D4AF37;
                    --brown: #3E2723;
                }

                body {
                    font-family: var(--font-outfit);
                }

                .font-serif {
                    font-family: var(--font-playfair);
                }

                .animate-in {
                    animation: animate-in 0.6s ease-out forwards;
                }
                
                @keyframes animate-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Left Side: Visual Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#121212] relative items-center justify-center p-20 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <img
                        src="/perfumes/barakkat-rouge-540-maison-alhambra.png"
                        alt="Background"
                        className="w-full h-full object-cover scale-150 blur-3xl"
                    />
                </div>

                <div className="relative z-10 max-w-xl text-center">
                    <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-6 py-2 mb-10">
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Wear Abbie Signature</span>
                    </div>
                    <h2 className="text-6xl md:text-7xl font-serif font-black text-white mb-8 tracking-tighter" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Your Elite <br />
                        <span className="text-[#D4AF37] italic font-light text-5xl md:text-6xl">Scent Journey</span> <br />
                        Begins Here.
                    </h2>
                    <p className="text-white/40 text-lg font-medium leading-relaxed mb-12">Create an account to track your orders, save your favorite scents, and experience the full Wear Abbie service.</p>

                    <div className="grid grid-cols-2 gap-6 text-left">
                        <div className="bg-white/5 p-6 rounded-[30px] border border-white/10">
                            <CheckCircle2 className="w-6 h-6 text-[#D4AF37] mb-4" />
                            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-1">Order Tracking</h4>
                            <p className="text-white/30 text-[10px]">Real-time logistics updates</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-[30px] border border-white/10">
                            <ShoppingBag className="w-6 h-6 text-[#D4AF37] mb-4" />
                            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-1">Exclusive Access</h4>
                            <p className="text-white/30 text-[10px]">Early access to limited releases</p>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-8">
                    <Instagram className="w-5 h-5 text-white/20 hover:text-[#D4AF37] transition-all cursor-pointer" />
                    <Facebook className="w-5 h-5 text-white/20 hover:text-[#D4AF37] transition-all cursor-pointer" />
                    <Twitter className="w-5 h-5 text-white/20 hover:text-[#D4AF37] transition-all cursor-pointer" />
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-16 lg:p-24 justify-center relative">
                <a href="/" className="absolute top-10 left-8 md:left-16 lg:left-24 flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors font-black uppercase tracking-widest text-[10px]">
                    <ArrowLeft className="w-4 h-4" /> Back to Boutique
                </a>

                <div className="max-w-md mx-auto w-full animate-in">
                    <div className="mb-12">
                        <img src="/logo.png" alt="Wear Abbie" className="h-10 mb-8 lg:hidden" />
                        <h3 className="text-4xl font-serif font-black mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            {mode === 'login' ? 'Welcome Back' : 'Join the Elite'}
                        </h3>
                        <p className="text-zinc-400 font-medium">
                            {mode === 'login' ? 'Enter your details to access your account' : 'Register to begin your signature scent collection'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {authError && (
                            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold text-center">
                                {authError}
                            </div>
                        )}
                        {mode === 'signup' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                                    <input
                                        type="text"
                                        placeholder="Ibrahim Tijani"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-full px-16 py-5 text-sm font-medium focus:bg-white focus:border-[#D4AF37] focus:shadow-xl focus:shadow-[#D4AF37]/5 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-full px-16 py-5 text-sm font-medium focus:bg-white focus:border-[#D4AF37] focus:shadow-xl focus:shadow-[#D4AF37]/5 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-full px-16 py-5 text-sm font-medium focus:bg-white focus:border-[#D4AF37] focus:shadow-xl focus:shadow-[#D4AF37]/5 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            disabled={isLoading}
                            className="w-full bg-[#3E2723] text-white py-6 rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-[#3E2723]/20 hover:bg-black transition-all flex items-center justify-center gap-4 relative overflow-hidden group"
                        >
                            <span className={isLoading ? 'opacity-0' : 'flex items-center gap-4'}>
                                {mode === 'login' ? 'Access Account' : 'Create Account'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                </div>
                            )}
                        </button>

                        <div className="flex items-center gap-4 py-2">
                            <div className="h-px bg-zinc-100 flex-1"></div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-zinc-300">OR</span>
                            <div className="h-px bg-zinc-100 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={signInWithGoogle}
                                className="w-full bg-white border border-zinc-100 text-zinc-900 py-5 rounded-full font-black uppercase tracking-widest text-[10px] hover:border-zinc-300 transition-all flex items-center justify-center gap-3"
                            >
                                <Chrome className="w-4 h-4" /> Google
                            </button>
                            <button
                                type="button"
                                onClick={() => { window.location.href = '#shopify'; }}
                                className="w-full bg-[#95BF47] text-white py-5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#95BF47]/20 hover:bg-[#7da13a] transition-all flex items-center justify-center gap-3"
                            >
                                <ShoppingCart className="w-4 h-4" /> Shopify
                            </button>
                        </div>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-zinc-500 font-medium text-sm">
                            {mode === 'login' ? "Don't have an account yet?" : "Already have an account?"} <br />
                            <button
                                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                className="text-[#D4AF37] font-black uppercase tracking-widest text-[11px] mt-4 border-b-2 border-[#D4AF37]/50 hover:border-[#D4AF37] transition-all"
                            >
                                {mode === 'login' ? 'Register Now' : 'Login Instead'}
                            </button>
                        </p>
                    </div>

                    <div className="mt-16 pt-10 border-t border-zinc-50 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Fast & Resilient Authentication by Wear Abbie</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
