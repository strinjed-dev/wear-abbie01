"use client";

import React, { useState, useEffect } from 'react';
import { Truck, Search, Package, MapPin, Clock, ArrowRight, ShieldCheck, CheckCircle2, Circle } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';

const statusSteps = ['pending', 'confirmed', 'dispatched', 'in_transit', 'delivered'];
const statusLabels: Record<string, string> = {
    pending: 'Order Received',
    confirmed: 'Order Confirmed',
    dispatched: 'Dispatched from Hub',
    in_transit: 'Out for Delivery',
    delivered: 'Delivered ✓',
    cancelled: 'Cancelled',
};
const statusColor: Record<string, string> = {
    pending: 'text-amber-600 bg-amber-50 border-amber-100',
    confirmed: 'text-blue-600 bg-blue-50 border-blue-100',
    dispatched: 'text-purple-600 bg-purple-50 border-purple-100',
    in_transit: 'text-orange-600 bg-orange-50 border-orange-100',
    delivered: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    cancelled: 'text-red-600 bg-red-50 border-red-100',
};

export default function TrackingPage() {
    const [inputCode, setInputCode] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [trackData, setTrackData] = useState<any>(null);
    const [error, setError] = useState("");
    const [guestOrders, setGuestOrders] = useState<any[]>([]);

    useEffect(() => {
        // Pre-fill from sessionStorage (redirected from order success)
        const saved = sessionStorage.getItem('wear_abbie_last_order_id');
        if (saved) setInputCode(saved);

        // Load guest orders from localStorage
        const guests = localStorage.getItem("wear_abbie_guest_orders");
        if (guests) {
            try { setGuestOrders(JSON.parse(guests)); } catch (e) { }
        }
    }, []);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputCode.trim()) return;
        setIsSearching(true);
        setError("");
        setTrackData(null);

        const code = inputCode.trim().toUpperCase();

        // Try to find by tracking_code first, then by partial ID
        const { data, error: dbError } = await supabase
            .from('orders')
            .select('id, tracking_code, status, shipping_state, shipping_area, shipping_address, contact_phone, total_amount, created_at, updated_at, items, payment_method')
            .or(`tracking_code.eq.${code},id.eq.${code}`)
            .maybeSingle();

        setIsSearching(false);

        if (dbError || !data) {
            // Also check guest localStorage orders
            const guest = guestOrders.find((o: any) => o.tracking_code?.toUpperCase() === code);
            if (guest) {
                setTrackData({ ...guest, isGuest: true });
            } else {
                setError("Order not found. Double-check your tracking code (format: WA-2026-XXXXXX) or contact support on WhatsApp.");
            }
            return;
        }

        setTrackData(data);
    };

    const currentStepIndex = trackData ? statusSteps.indexOf(trackData.status) : -1;

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
            <nav className="border-b border-zinc-100 py-5 bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <a href="/"><img src="/logo.png" alt="Wear Abbie" className="h-8 md:h-10" /></a>
                    <div className="hidden lg:flex gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        <a href="/" className="hover:text-[#D4AF37] transition-colors">Home</a>
                        <a href="/shop" className="hover:text-[#D4AF37] transition-colors">Collections</a>
                    </div>
                    <a href="/auth" className="hover:text-[#D4AF37] transition-colors uppercase font-black tracking-widest text-[10px]">My Account</a>
                </div>
            </nav>

            <main className="flex-grow flex flex-col lg:flex-row items-stretch min-h-[calc(100vh-120px)]">
                {/* Left: Search */}
                <div className="w-full lg:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col justify-center bg-zinc-50 border-r border-zinc-100 animate-in">
                    <div className="max-w-md w-full mx-auto">
                        <div className="inline-flex items-center gap-3 bg-white border border-zinc-100 rounded-full px-6 py-2 mb-10">
                            <Truck className="w-4 h-4 text-[#D4AF37]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Live Order Tracker</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-serif font-black mb-6 tracking-tighter" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            Trace Your <br /><span className="text-[#D4AF37] italic font-light">Signature.</span>
                        </h1>
                        <p className="text-zinc-500 font-medium text-lg leading-relaxed mb-12">
                            Enter your tracking code (format: <strong>WA-2026-XXXXXX</strong>) to see your order&apos;s live status.
                        </p>

                        <form onSubmit={handleTrack} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Tracking Code</label>
                                <div className="relative">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                                    <input
                                        type="text"
                                        placeholder="WA-2026-XXXXXX"
                                        required
                                        className="w-full bg-white border border-zinc-100 rounded-full px-16 py-6 text-sm font-medium focus:border-[#D4AF37] focus:shadow-xl focus:shadow-[#D4AF37]/5 outline-none transition-all uppercase"
                                        value={inputCode}
                                        onChange={(e) => setInputCode(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 border border-red-100 rounded-2xl px-5 py-4 text-xs font-medium flex items-start gap-3">
                                    <span className="text-red-400 mt-0.5">⚠️</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                disabled={isSearching}
                                className="w-full bg-[#3E2723] text-white py-6 rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-[#3E2723]/20 hover:bg-black transition-all flex items-center justify-center gap-4 relative overflow-hidden"
                            >
                                <span className={isSearching ? 'opacity-0' : 'flex items-center gap-4'}>Locate Dispatch <ArrowRight className="w-4 h-4" /></span>
                                {isSearching && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    </div>
                                )}
                            </button>
                        </form>

                        {/* Recent guest orders */}
                        {guestOrders.length > 0 && !trackData && (
                            <div className="mt-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Recent Orders on This Device</p>
                                <div className="space-y-3">
                                    {guestOrders.slice(0, 3).map((o: any, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => setInputCode(o.tracking_code || '')}
                                            className="w-full text-left bg-white border border-zinc-100 rounded-[20px] px-5 py-4 hover:border-[#D4AF37] transition-all group"
                                        >
                                            <p className="text-xs font-black text-zinc-800 group-hover:text-[#D4AF37] transition-colors">{o.tracking_code}</p>
                                            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{new Date(o.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* WhatsApp Support */}
                        <a
                            href="https://wa.me/2348132484859?text=Hello%20Wear%20Abbie%2C%20I%20need%20help%20tracking%20my%20order."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-8 flex items-center gap-3 text-zinc-400 hover:text-emerald-600 transition-colors text-[10px] font-black uppercase tracking-widest"
                        >
                            <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.563 4.13 1.54 5.858L0 24l6.335-1.54A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.803 9.803 0 01-5.147-1.46l-.369-.219-3.76.914.945-3.668-.242-.381A9.797 9.797 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182c5.421 0 9.818 4.396 9.818 9.818S17.421 21.818 12 21.818z" /></svg>
                            </div>
                            Can't find your order? Chat with us
                        </a>
                    </div>
                </div>

                {/* Right: Status Display */}
                <div className="w-full lg:w-1/2 p-8 md:p-16 lg:p-24 bg-white flex flex-col justify-center">
                    {trackData ? (
                        <div className="max-w-md w-full mx-auto space-y-10 animate-in">
                            {/* Order Header */}
                            <header>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-2">
                                    Tracking: {trackData.tracking_code || trackData.id}
                                </p>
                                <div className="flex items-center gap-4">
                                    <h2 className="text-3xl font-serif font-black" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                        {statusLabels[trackData.status] || trackData.status}
                                    </h2>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${statusColor[trackData.status] || 'bg-zinc-50 text-zinc-500'}`}>
                                        {trackData.status}
                                    </span>
                                </div>
                            </header>

                            {/* Order Meta */}
                            <div className="p-6 bg-zinc-50 rounded-[32px] border border-zinc-100 grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total</p>
                                    <p className="font-black text-lg">₦{Number(trackData.total_amount || trackData.total || 0).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Destination</p>
                                    <p className="font-bold text-sm">{trackData.shipping_area || trackData.shipping_state || 'Nigeria'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Order Date</p>
                                    <p className="font-bold text-sm">{new Date(trackData.created_at || trackData.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Payment</p>
                                    <p className="font-bold text-sm capitalize">{trackData.payment_method || 'Transfer'}</p>
                                </div>
                            </div>

                            {/* Progress Steps */}
                            {trackData.status !== 'cancelled' && (
                                <div className="space-y-6 relative">
                                    <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-zinc-100" />
                                    {statusSteps.map((step, i) => {
                                        const isDone = i <= currentStepIndex;
                                        const isCurrent = i === currentStepIndex;
                                        return (
                                            <div key={step} className="flex gap-5 items-center relative z-10">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm flex-shrink-0 transition-all
                                                    ${isDone ? 'bg-[#D4AF37] text-white' : 'bg-zinc-100 text-zinc-300'}`}>
                                                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <h4 className={`text-sm font-black uppercase tracking-widest ${isDone ? 'text-zinc-900' : 'text-zinc-300'}`}>
                                                        {statusLabels[step]}
                                                    </h4>
                                                    {isCurrent && <p className="text-[10px] font-bold text-[#D4AF37] uppercase mt-0.5">Current Status</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* WhatsApp Update */}
                            <a
                                href={`https://wa.me/2348132484859?text=Hello%20Wear%20Abbie%2C%20please%20update%20me%20on%20order%20${trackData.tracking_code || trackData.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 rounded-[24px] p-5 hover:bg-emerald-100 transition-all"
                            >
                                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.563 4.13 1.54 5.858L0 24l6.335-1.54A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.803 9.803 0 01-5.147-1.46l-.369-.219-3.76.914.945-3.668-.242-.381A9.797 9.797 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182c5.421 0 9.818 4.396 9.818 9.818S17.421 21.818 12 21.818z" /></svg>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Get Live Update on WhatsApp</p>
                                    <p className="text-[10px] text-emerald-600 font-medium mt-0.5">+234 813 248 4859</p>
                                </div>
                            </a>
                        </div>
                    ) : (
                        <div className="max-w-md w-full mx-auto text-center py-20">
                            <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-10 shadow-sm border border-zinc-50">
                                <Truck className="w-10 h-10 text-zinc-200" />
                            </div>
                            <h3 className="text-2xl font-serif font-black mb-4 tracking-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>Awaiting Code</h3>
                            <p className="text-zinc-400 font-medium leading-relaxed">Enter your tracking code on the left to see your order's real-time status.</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
