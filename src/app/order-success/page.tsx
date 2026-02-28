"use client";

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Truck, ArrowRight, Sparkles, Copy, Check } from 'lucide-react';
import Link from 'next/link';

export default function OrderSuccessPage() {
    const [orderId, setOrderId] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Try to read real order ID from sessionStorage (set at checkout)
        const saved = sessionStorage.getItem('wear_abbie_last_order_id');
        if (saved) {
            setOrderId(saved);
            sessionStorage.removeItem('wear_abbie_last_order_id');
        } else {
            // Fallback: generate a display ID
            setOrderId(`WA-${Math.floor(Math.random() * 900000 + 100000)}`);
        }
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(orderId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center overflow-x-hidden">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap');
                :root { --font-outfit: 'Outfit', sans-serif; --font-playfair: 'Playfair Display', serif; }
                body { font-family: var(--font-outfit); }
                .font-serif { font-family: var(--font-playfair); }
                .animate-in { animation: fade-in 0.8s ease-out forwards; }
                @keyframes fade-in { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
                .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
                @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
            `}</style>

            <div className="max-w-2xl w-full animate-in">
                {/* Success Icon */}
                <div className="w-24 h-24 md:w-32 md:h-32 bg-emerald-50 rounded-[40px] flex items-center justify-center mx-auto mb-12 shadow-xl shadow-emerald-500/10 animate-bounce-slow">
                    <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-emerald-500" />
                </div>

                <div className="inline-flex items-center gap-3 bg-zinc-50 border border-zinc-100 rounded-full px-6 py-2 mb-10">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Order Dispatched to Queue</span>
                </div>

                <h1 className="text-4xl md:text-7xl font-serif font-black mb-8 tracking-tighter" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                    Thank You for <br />Choosing <span className="text-[#D4AF37] italic font-light">Wear Abbie.</span>
                </h1>

                <p className="text-zinc-500 text-lg md:text-xl font-medium leading-relaxed mb-12 max-w-lg mx-auto">
                    Your olfactory signature is being prepared for dispatch. Please save your Order ID below to track your package.
                </p>

                {/* Order Detail Card */}
                <div className="p-8 md:p-12 bg-zinc-50 rounded-[40px] border border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                    <div className="text-center md:text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-3">Order Identifier</p>
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <p className="text-xl font-black font-mono text-zinc-900">{orderId || '...'}</p>
                            <button
                                onClick={handleCopy}
                                className="w-8 h-8 flex items-center justify-center bg-white border border-zinc-200 rounded-full hover:border-[#D4AF37] transition-all"
                                title="Copy Order ID"
                            >
                                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-zinc-400" />}
                            </button>
                        </div>
                        <p className="text-[9px] uppercase tracking-widest text-zinc-400 mt-2 font-black">Save this — you'll need it to track your order</p>
                    </div>
                    <div className="text-center md:text-left space-y-4">
                        <div className="flex items-center gap-4 justify-center md:justify-start">
                            <Truck className="w-5 h-5 text-[#D4AF37]" />
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Nationwide Express Dispatch</p>
                        </div>
                        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Expected Arrival: 24-48 Hours</p>
                        <p className="text-[10px] font-medium text-zinc-400">
                            Questions? WhatsApp: <span className="font-black text-zinc-600">+234 813 248 4859</span>
                        </p>
                    </div>
                </div>

                {/* WhatsApp Notification Nudge */}
                <div className="mb-12 p-6 bg-emerald-50 border border-emerald-100 rounded-[24px] flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.563 4.13 1.54 5.858L0 24l6.335-1.54A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.803 9.803 0 01-5.147-1.46l-.369-.219-3.76.914.945-3.668-.242-.381A9.797 9.797 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182c5.421 0 9.818 4.396 9.818 9.818S17.421 21.818 12 21.818z" /></svg>
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-700 mb-1">Send us your order ID on WhatsApp</p>
                        <p className="text-[10px] text-emerald-600 font-medium">Message us at +234 813 248 4859 to get live order updates.</p>
                    </div>
                    <a
                        href={`https://wa.me/2348132484859?text=Hello%20Wear%20Abbie%2C%20I%20just%20placed%20an%20order.%20My%20Order%20ID%20is%3A%20${orderId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 bg-emerald-500 text-white px-4 py-2 rounded-full font-black uppercase tracking-widest text-[9px] hover:bg-emerald-600 transition-all"
                    >
                        Open WhatsApp
                    </a>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/tracking" className="bg-[#3E2723] text-white px-10 py-6 rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-[#3E2723]/20 hover:bg-black transition-all flex items-center justify-center gap-4">
                        Track Dispatch <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/shop" className="bg-white border border-zinc-200 text-zinc-800 px-10 py-6 rounded-full font-black uppercase tracking-widest text-[11px] hover:border-[#D4AF37] transition-all">
                        Continue Shopping
                    </Link>
                </div>

                {/* Footer */}
                <div className="mt-24 pt-10 border-t border-zinc-100">
                    <a href="https://www.tiktok.com/@wearabbie" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 text-zinc-300 hover:text-[#D4AF37] transition-colors mx-auto mb-6">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.88a8.28 8.28 0 004.84 1.54V7a4.85 4.85 0 01-1.07-.31z" /></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">@wearabbie</span>
                    </a>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300 italic">Wear Abbie Signature • Smelling nice is our priority.</p>
                </div>
            </div>
        </div>
    );
}
