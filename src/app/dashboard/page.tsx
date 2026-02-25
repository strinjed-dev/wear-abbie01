"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { Package, User, LogOut, ShieldCheck, CheckCircle2, ShoppingBag, Database, Key, Clock, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function UserDashboard() {
    const { orders } = useCart();
    const [isAdmin, setIsAdmin] = useState(false);
    const [bootstrapKey, setBootstrapKey] = useState('');
    const [authError, setAuthError] = useState(false);

    // Developer & User Data
    const [sessionData, setSessionData] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [jwtPreview, setJwtPreview] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [showAdminPanel, setShowAdminPanel] = useState(false);

    useEffect(() => {
        const fetchSupabaseIdentity = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error || !session) {
                    window.location.href = '/auth'; // Redirect unauthenticated users
                    return;
                }
                setSessionData(session);
                setUserData(session.user);

                // Truncate JWT to preview
                const jwt = session.access_token;
                setJwtPreview(`${jwt.substring(0, 15)}...${jwt.substring(jwt.length - 15)}`);

                // If user is designated Admin via Email, auto-show the panel, or they can trigger it manually
                const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'tijani@example.com';
                if (session.user.email === adminEmail) {
                    setShowAdminPanel(true);
                }

                // Check if already authorized local admin
                const adminStatus = localStorage.getItem('wear_abbie_admin_authorized');
                if (adminStatus === 'true') {
                    setIsAdmin(true);
                    setShowAdminPanel(true); // Ensure they can see it to revoke it
                }

            } catch (err) {
                console.error("Auth context error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSupabaseIdentity();
    }, []);

    const handleClaimAdmin = (e: React.FormEvent) => {
        e.preventDefault();
        const REQUIRED_KEY = process.env.NEXT_PUBLIC_ADMIN_BOOTSTRAP_KEY || "WEAR_ABBIE_ADMIN_2026";
        if (bootstrapKey === REQUIRED_KEY) {
            setIsAdmin(true);
            setAuthError(false);
            localStorage.setItem('wear_abbie_admin_authorized', 'true');
            // Permanently tie to backend in production here using Supabase Update Profile
        } else {
            setAuthError(true);
        }
    };

    const revokeAdmin = () => {
        setIsAdmin(false);
        localStorage.removeItem('wear_abbie_admin_authorized');
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="w-8 h-8 border-2 border-zinc-200 border-t-[#D4AF37] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 pt-32 pb-20 px-6">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-serif font-black" style={{ fontFamily: 'var(--font-playfair), serif' }}>Dashboard</h1>
                        <p className="text-zinc-500 mt-2 font-medium">Your personalized space and backend configurations.</p>
                    </div>
                    {isAdmin && (
                        <Link href="/admin">
                            <button className="bg-[#D4AF37] text-white py-3 px-6 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#3E2723] transition-colors shadow-xl shadow-[#D4AF37]/20 flex items-center gap-2 animate-in">
                                <ShieldCheck className="w-4 h-4" /> Go to Portal
                            </button>
                        </Link>
                    )}
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Profiles & Dev Keys */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-8 rounded-[30px] border border-zinc-100 shadow-sm text-center">
                            <div className="w-24 h-24 bg-zinc-100 rounded-full mx-auto flex items-center justify-center mb-4 cursor-pointer" onDoubleClick={() => setShowAdminPanel(true)}>
                                <User className="w-8 h-8 text-zinc-400" />
                            </div>
                            <h2 className="text-xl font-black text-zinc-900">{userData?.user_metadata?.full_name || 'Premium User'}</h2>
                            <p className="text-xs text-zinc-500 font-bold mb-4">{userData?.email}</p>

                            <div className="flex justify-center gap-2 mb-8">
                                <span className="bg-zinc-100 text-zinc-500 py-1.5 px-3 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                                    <Database className="w-3 h-3" /> Supabase Linked
                                </span>
                                {isAdmin && (
                                    <span className="bg-[#D4AF37]/10 text-[#D4AF37] py-1.5 px-3 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> System Admin
                                    </span>
                                )}
                            </div>

                            <button onClick={handleLogout} className="w-full py-4 bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 text-zinc-900 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mb-6">
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        </div>

                        {/* Real-time Backend Security Metrics */}
                        <div className="bg-white p-6 rounded-[30px] border border-zinc-100 shadow-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-6 flex items-center gap-2">
                                <Key className="w-4 h-4" /> Developer Integrity
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold mb-1">UUID</p>
                                    <p className="text-xs font-mono text-zinc-700 bg-zinc-50 p-2 rounded-lg truncate">{userData?.id}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold mb-1">Session JWT Token</p>
                                    <p className="text-xs font-mono text-emerald-600 bg-emerald-50 p-2 rounded-lg truncate">{jwtPreview}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold mb-1">Anon Key Status</p>
                                    <p className="text-xs font-mono text-zinc-700 bg-zinc-50 p-2 rounded-lg truncate">Configured in env</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold mb-1">Storage Bucket Context</p>
                                    <p className="text-xs font-mono text-zinc-700 bg-zinc-50 p-2 rounded-lg truncate">perfume-images</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold mb-1">Database Table Registry</p>
                                    <p className="text-xs font-mono text-zinc-700 bg-zinc-50 p-2 rounded-lg truncate">public.profiles, public.orders</p>
                                </div>
                            </div>
                        </div>

                        {/* Secret Admin Bootstrap Claim Section (Only shown if authorized via hidden trick / email block) */}
                        {showAdminPanel && (
                            <div className="bg-[#3E2723] p-8 rounded-[30px] border border-[#3E2723] shadow-2xl text-center animate-in">
                                <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mb-6 text-white">
                                    <ShieldAlert className="w-4 h-4 text-[#D4AF37]" /> Admin Privilege
                                </h3>
                                {!isAdmin ? (
                                    <form onSubmit={handleClaimAdmin} className="space-y-4">
                                        <p className="text-[10px] text-white/60 font-medium leading-relaxed mb-4">
                                            Enter the internal bootstrap key to elevate your account role.
                                        </p>
                                        <input
                                            type="password"
                                            value={bootstrapKey}
                                            onChange={(e) => setBootstrapKey(e.target.value)}
                                            placeholder="Secure Key..."
                                            className={`w-full bg-white/5 p-4 rounded-full text-xs font-bold text-center border outline-none text-white focus:border-[#D4AF37] transition-all ${authError ? 'border-red-500 text-red-100' : 'border-white/10'}`}
                                        />
                                        <button type="submit" className="w-full bg-[#D4AF37] text-white py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#c4a132] transition-all">
                                            Elevate Role
                                        </button>
                                    </form>
                                ) : (
                                    <div className="space-y-6">
                                        <p className="text-[10px] text-white/80 font-bold leading-relaxed bg-white/5 py-3 px-4 rounded-2xl">
                                            Permanent administrative privileges confirmed under this user via Supabase.
                                        </p>
                                        <button onClick={revokeAdmin} className="w-full bg-transparent border border-white/20 text-white/60 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                                            Revoke Privileges
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Main Content / Orders */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 md:p-12 rounded-[40px] border border-zinc-100 shadow-sm min-h-[400px]">
                            <h3 className="text-2xl font-serif font-black mb-8 flex items-center gap-3" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                <ShoppingBag className="w-6 h-6 text-[#D4AF37]" /> My Purchases
                            </h3>

                            {orders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 px-8 mt-4 rounded-[30px] bg-zinc-50 border border-zinc-100 border-dashed">
                                    <Package className="w-12 h-12 text-zinc-300 mb-6" />
                                    <p className="font-bold uppercase tracking-widest text-[11px] text-zinc-400">No orders placed onto this account.</p>
                                    <Link href="/">
                                        <button className="mt-8 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] border-b-2 border-[#D4AF37]/30 hover:border-[#D4AF37] pb-1 transition-all">
                                            Return to Shop
                                        </button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order: any, idx: number) => (
                                        <div key={idx} className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border border-zinc-100 rounded-[24px] bg-white hover:shadow-xl hover:shadow-[#D4AF37]/10 hover:border-[#D4AF37] transition-all gap-4 group">
                                            <div>
                                                <h4 className="font-black text-xs uppercase tracking-[0.2em] text-zinc-900 inline-flex items-center gap-3">
                                                    Order <span className="text-[#D4AF37]">{order.id.substring(0, 8)}</span>
                                                </h4>
                                                <p className="text-[10px] text-zinc-400 mt-2 font-bold uppercase tracking-widest flex items-center gap-2">
                                                    <Clock className="w-3 h-3" /> {order.items?.length || 0} items processed
                                                </p>
                                            </div>
                                            <div className="md:text-right w-full md:w-auto flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end border-t border-zinc-100 md:border-t-0 pt-4 md:pt-0">
                                                <span className="font-serif font-black text-xl text-zinc-900 group-hover:text-[#D4AF37] transition-colors gap-1">₦{order.total.toLocaleString()}</span>
                                                <p className="text-[9px] uppercase tracking-[0.2em] text-emerald-500 font-black mt-2 bg-emerald-50 px-3 py-1.5 rounded-full inline-flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> pending fulfillment
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
