"use client";

import React from 'react';
import { CheckCircle2, ShoppingBag, Truck, ArrowRight, Sparkles, Instagram, Facebook, Twitter } from 'lucide-react';

export default function OrderSuccessPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center overflow-x-hidden">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap');
                :root { --font-outfit: 'Outfit', sans-serif; --font-playfair: 'Playfair Display', serif; }
                body { font-family: var(--font-outfit); }
                .font-serif { font-family: var(--font-playfair); }
                .animate-in { animation: fade-in 0.8s ease-out forwards; }
                @keyframes fade-in { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            <div className="max-w-2xl w-full animate-in">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-emerald-50 rounded-[40px] flex items-center justify-center mx-auto mb-12 shadow-xl shadow-emerald-500/10">
                    <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-emerald-500" />
                </div>

                <div className="inline-flex items-center gap-3 bg-zinc-50 border border-zinc-100 rounded-full px-6 py-2 mb-10">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Order Confirmed</span>
                </div>

                <h1 className="text-4xl md:text-7xl font-serif font-black mb-8 tracking-tighter" style={{ fontFamily: 'var(--font-playfair), serif' }}>Thank You for <br />Choosing <span className="text-[#D4AF37] italic font-light">Wear Abbie.</span></h1>

                <p className="text-zinc-500 text-lg md:text-xl font-medium leading-relaxed mb-12 max-w-lg mx-auto">Your olfactory signature is being prepared for dispatch. We've sent a confirmation to your email with your logistics ID.</p>

                <div className="p-8 md:p-12 bg-zinc-50 rounded-[40px] border border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
                    <div className="text-center md:text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-2">Order Identifier</p>
                        <p className="text-xl font-black">WA-982341</p>
                    </div>
                    <div className="text-center md:text-left space-y-4">
                        <div className="flex items-center gap-4 justify-center md:justify-start">
                            <Truck className="w-5 h-5 text-[#D4AF37]" />
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Nationwide Express Dispatch</p>
                        </div>
                        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Expected Arrival: 24-48 Hours</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="/tracking" className="bg-[#3E2723] text-white px-10 py-6 rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-[#3E2723]/20 hover:bg-black transition-all flex items-center justify-center gap-4">
                        Track Dispatch <ArrowRight className="w-4 h-4" />
                    </a>
                    <a href="/shop" className="bg-white border border-zinc-200 text-zinc-800 px-10 py-6 rounded-full font-black uppercase tracking-widest text-[11px] hover:border-[#D4AF37] transition-all">
                        Continue Shopping
                    </a>
                </div>

                <div className="mt-24 pt-10 border-t border-zinc-100">
                    <div className="flex justify-center gap-10 mb-8">
                        <Instagram className="w-5 h-5 text-zinc-300 hover:text-[#D4AF37] transition-colors cursor-pointer" />
                        <Facebook className="w-5 h-5 text-zinc-300 hover:text-[#D4AF37] transition-colors cursor-pointer" />
                        <Twitter className="w-5 h-5 text-zinc-300 hover:text-[#D4AF37] transition-colors cursor-pointer" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300 italic">Wear Abbie Signature • Smelling nice is our priority.</p>
                </div>
            </div>
        </div>
    );
}
