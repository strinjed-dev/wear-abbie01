"use client";

import React, { useState } from 'react';
import { Truck, Search, Package, MapPin, Clock, ArrowRight, ShieldCheck, ShieldCheck as ShieldIcon } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export default function TrackingPage() {
    const [orderId, setOrderId] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [trackData, setTrackData] = useState<any>(null);

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        // Simulate tracking search
        setTimeout(() => {
            setIsSearching(false);
            setTrackData({
                id: orderId || "WA-982341",
                status: "In Transit",
                location: "Mainland Hub, Lagos",
                lastUpdate: "Today, 10:45 AM",
                steps: [
                    { label: "Order Dispatched", time: "Feb 22, 09:00 AM", done: true },
                    { label: "Arrived at Hub", time: "Feb 22, 10:45 AM", done: true },
                    { label: "Out for Delivery", time: "Pending", done: false },
                    { label: "Delivered", time: "Pending", done: false }
                ]
            });
        }, 1500);
    };

    return (
        <div className="min-h-screen flex flex-col bg-white text-zinc-900 overflow-x-hidden">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap');
                :root { --font-outfit: 'Outfit', sans-serif; --font-playfair: 'Playfair Display', serif; }
                body { font-family: var(--font-outfit); }
                .font-serif { font-family: var(--font-playfair); }
                @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-in { animation: fade-in 0.6s ease-out forwards; }
            `}</style>

            {/* Navbar */}
            <nav className="border-b border-zinc-100 py-6 md:py-8 bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <a href="/" className="group">
                        <img src="/logo.png" alt="Wear Abbie" className="h-8 md:h-10" />
                    </a>
                    <div className="flex gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 hidden lg:flex">
                        <a href="/" className="hover:text-[#D4AF37] transition-colors">Home</a>
                        <a href="/shop" className="hover:text-[#D4AF37] transition-colors">Collections</a>
                        <a href="/journal" className="hover:text-[#D4AF37] transition-colors">The Journal</a>
                    </div>
                    <a href="/auth" className="hover:text-[#D4AF37] transition-colors uppercase font-black tracking-widest text-[10px]">Portal</a>
                </div>
            </nav>

            <main className="flex-grow flex flex-col lg:flex-row items-stretch min-h-[calc(100vh-100px)]">
                {/* Left: Search */}
                <div className="w-full lg:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col justify-center bg-zinc-50 border-r border-zinc-100 animate-in">
                    <div className="max-w-md w-full mx-auto">
                        <div className="inline-flex items-center gap-3 bg-white border border-zinc-100 rounded-full px-6 py-2 mb-10">
                            <Truck className="w-4 h-4 text-[#D4AF37]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Logistics Hub</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-serif font-black mb-6 tracking-tighter" style={{ fontFamily: 'var(--font-playfair), serif' }}>Trace Your <br /><span className="text-[#D4AF37] italic font-light">Signature.</span></h1>
                        <p className="text-zinc-500 font-medium text-lg leading-relaxed mb-12">Enter your Order ID or Tracking Number to see the real-time status of your Wear Abbie dispatch.</p>

                        <form onSubmit={handleTrack} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Order Identifier</label>
                                <div className="relative">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                                    <input
                                        type="text"
                                        placeholder="WA-XXXXXX"
                                        required
                                        className="w-full bg-white border border-zinc-100 rounded-full px-16 py-6 text-sm font-medium focus:border-[#D4AF37] focus:shadow-xl focus:shadow-[#D4AF37]/5 outline-none transition-all"
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                disabled={isSearching}
                                className="w-full bg-[#3E2723] text-white py-6 rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-[#3E2723]/20 hover:bg-black transition-all flex items-center justify-center gap-4 relative overflow-hidden"
                            >
                                <span className={isSearching ? 'opacity-0' : 'flex items-center gap-4'}>Locate Dispatch <ArrowRight className="w-4 h-4" /></span>
                                {isSearching && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: Status Display */}
                <div className="w-full lg:w-1/2 p-8 md:p-16 lg:p-24 bg-white flex flex-col justify-center animate-in">
                    {trackData ? (
                        <div className="max-w-md w-full mx-auto space-y-12">
                            <header className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-2">Order Tracking: {trackData.id}</p>
                                    <h2 className="text-3xl font-serif font-black" style={{ fontFamily: 'var(--font-playfair), serif' }}>{trackData.status}</h2>
                                </div>
                                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-3xl border border-emerald-100">
                                    <Package className="w-6 h-6" />
                                </div>
                            </header>

                            <div className="p-8 bg-zinc-50 rounded-[40px] border border-zinc-100 space-y-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                        <MapPin className="w-5 h-5 text-[#D4AF37]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Current Node</p>
                                        <p className="font-bold text-sm tracking-tight">{trackData.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5">
                                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                        <Clock className="w-5 h-5 text-[#D4AF37]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Last Check-in</p>
                                        <p className="font-bold text-sm tracking-tight">{trackData.lastUpdate}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8 relative">
                                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-zinc-100"></div>
                                {trackData.steps.map((s: any, i: number) => (
                                    <div key={i} className="flex gap-6 items-start relative z-10">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${s.done ? "bg-[#D4AF37] text-white" : "bg-zinc-100 text-zinc-300"}`}>
                                            <ShieldIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-black uppercase tracking-widest ${s.done ? "text-zinc-900" : "text-zinc-300"}`}>{s.label}</h4>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">{s.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-md w-full mx-auto text-center py-20">
                            <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-10 shadow-sm border border-zinc-50">
                                <Truck className="w-10 h-10 text-zinc-100" />
                            </div>
                            <h3 className="text-2xl font-serif font-black mb-4 tracking-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>Awaiting Input</h3>
                            <p className="text-zinc-400 font-medium leading-relaxed">Please enter your tracking details on the left to activate dispatch visualization.</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
