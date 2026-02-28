"use client";

import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, X, ChevronLeft, LogOut, LayoutDashboard, Store, Bell, Settings } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function MemberNavbar() {
    const { cart, setIsCartOpen, searchQuery, setSearchQuery } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (pathname !== '/shop' && query.trim().length > 0) {
            router.push('/shop');
        }
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUserData(session?.user || null);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setUserData(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    return (
        <>
            <style jsx global>{`
                .member-nav {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                }
                .member-search-pill {
                    background: #f4f4f5;
                    border: 1px solid transparent;
                    transition: all 0.3s ease;
                }
                .member-search-pill:focus-within {
                    background: white;
                    border-color: #D4AF37;
                    box-shadow: 0 10px 25px -5px rgba(212, 175, 55, 0.1);
                }
            `}</style>

            <nav className="member-nav fixed top-0 left-0 right-0 z-50 flex flex-col">
                {/* Top Row: Logo & Actions */}
                <div className="h-16 md:h-24 flex items-center justify-between px-4 md:px-10 max-w-[1400px] mx-auto w-full">
                    {/* Left: Branding */}
                    <div className="flex items-center gap-12">
                        <Link href="/" className="group flex items-center gap-2">
                            <img src="/logo.png" alt="Wear Abbie" className="h-7 md:h-10 transition-transform duration-500 group-hover:scale-105" />
                        </Link>

                        <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">
                            <Link href="/shop" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                                <Store className="w-4 h-4" /> Shop
                            </Link>
                            <Link href="/dashboard" className="text-zinc-900 flex items-center gap-2">
                                <LayoutDashboard className="w-4 h-4 text-[#D4AF37]" /> Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 md:gap-8">
                        {/* Search (Desktop) */}
                        <div className="hidden md:flex member-search-pill flex items-center px-5 py-2 rounded-full group mr-4">
                            <Search className="w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                className="bg-transparent border-none outline-none text-xs ml-3 w-40 font-medium"
                                onChange={handleSearchChange}
                            />
                        </div>

                        {/* Cart */}
                        <button
                            className="relative p-2"
                            onClick={() => setIsCartOpen(true)}
                        >
                            <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-zinc-900" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0 -right-0 bg-[#D4AF37] text-white text-[8px] min-w-[16px] h-4 rounded-full flex items-center justify-center font-black">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {/* Account */}
                        <div className="flex items-center gap-2 pl-2 border-l border-zinc-100">
                            {userData ? (
                                <Link href="/dashboard" className="w-8 h-8 md:w-10 md:h-10 bg-[#3E2723] rounded-full flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20">
                                    <User className="w-4 h-4 md:w-5 md:h-5" />
                                </Link>
                            ) : (
                                <Link href="/auth" className="p-2 text-zinc-400">
                                    <User className="w-5 h-5" />
                                </Link>
                            )}

                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="lg:hidden p-2 text-zinc-900"
                            >
                                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Second Row: Mobile Search (More Compact) */}
                <div className="lg:hidden px-4 pb-4 flex items-center gap-2">
                    <div className="flex-1 member-search-pill flex items-center px-4 py-2.5 rounded-xl group border border-zinc-100 bg-zinc-50/50">
                        <Search className="w-3.5 h-3.5 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Find a scent..."
                            value={searchQuery}
                            className="bg-transparent border-none outline-none text-[11px] ml-2 w-full font-bold uppercase tracking-widest text-zinc-900 placeholder:text-zinc-300"
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>

                {/* Mobile Side Drawer Menu */}
                <div
                    className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-[6px]"
                        onClick={() => setIsMenuOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div
                        className={`absolute top-0 left-0 w-[80%] h-full bg-white transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
                    >
                        {/* Drawer Header */}
                        <div className="p-8 flex items-center justify-between border-b border-zinc-100 bg-zinc-50/30">
                            <img src="/logo.png" alt="Wear Abbie" className="h-8" />
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="w-10 h-10 bg-white border border-zinc-100 rounded-full flex items-center justify-center text-zinc-900 shadow-sm hover:scale-110 active:scale-90 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Drawer Links */}
                        <div className="flex-grow overflow-y-auto py-10 px-8 space-y-12 no-scrollbar">
                            <div className="flex flex-col gap-8 text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">
                                <div className="text-[#D4AF37] opacity-60 tracking-[0.4em] mb-2 font-black flex items-center gap-3">
                                    <div className="h-[1px] w-4 bg-[#D4AF37]"></div> Boutique Collections
                                </div>
                                <Link
                                    href="/"
                                    className={`flex items-center gap-4 py-2 transition-all ${pathname === '/' ? 'text-zinc-900 translate-x-1' : 'hover:text-zinc-900 hover:translate-x-1'}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full bg-[#D4AF37] ${pathname === '/' ? 'opacity-100' : 'opacity-0'}`}></div> Home Premiere
                                </Link>
                                <Link
                                    href="/shop"
                                    className={`flex items-center gap-4 py-2 transition-all ${pathname === '/shop' ? 'text-zinc-900 translate-x-1' : 'hover:text-zinc-900 hover:translate-x-1'}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full bg-[#D4AF37] ${pathname === '/shop' ? 'opacity-100' : 'opacity-0'}`}></div> The Scent Catalog
                                </Link>
                                <Link
                                    href="/order-tracking"
                                    className={`flex items-center gap-4 py-2 transition-all ${pathname === '/tracking' ? 'text-zinc-900 translate-x-1' : 'hover:text-zinc-900 hover:translate-x-1'}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full bg-[#D4AF37] ${pathname === '/tracking' ? 'opacity-100' : 'opacity-0'}`}></div> Track My Scents
                                </Link>
                            </div>

                            <div className="flex flex-col gap-8 text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">
                                <div className="text-[#3E2723] opacity-60 tracking-[0.4em] mb-2 font-black flex items-center gap-3">
                                    <div className="h-[1px] w-4 bg-[#3E2723]"></div> Membership Suite
                                </div>
                                {userData ? (
                                    <>
                                        <Link href="/dashboard" className="text-zinc-900 flex items-center gap-4 py-2 group transition-all hover:translate-x-2" onClick={() => setIsMenuOpen(false)}>
                                            <div className="w-10 h-10 bg-[#3E2723] rounded-2xl flex items-center justify-center text-[#D4AF37] shadow-lg shadow-black/5 group-hover:bg-black transition-all">
                                                <LayoutDashboard className="w-4 h-4" />
                                            </div> Member Dashboard
                                        </Link>
                                        <Link href="/profile" className="flex items-center gap-4 py-2 group transition-all hover:translate-x-2" onClick={() => setIsMenuOpen(false)}>
                                            <div className="w-10 h-10 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 border border-zinc-100 transition-all group-hover:text-[#D4AF37]">
                                                <Settings className="w-4 h-4" />
                                            </div> Concierge & Settings
                                        </Link>
                                        <button onClick={handleLogout} className="text-red-500 flex items-center gap-4 py-2 group transition-all hover:translate-x-2">
                                            <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shadow-lg shadow-red-500/5 transition-all group-hover:bg-red-500 group-hover:text-white">
                                                <LogOut className="w-4 h-4" />
                                            </div> Experience Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <Link href="/auth" className="text-zinc-900 flex items-center gap-4 group p-4 bg-zinc-50 rounded-[30px] border border-zinc-100 transition-all hover:bg-white hover:border-[#D4AF37]" onClick={() => setIsMenuOpen(false)}>
                                        <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#D4AF37]/20 group-hover:scale-110 transition-all">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-[10px] uppercase tracking-widest text-[#D4AF37]">Join The House</p>
                                            <p className="text-[9px] font-bold text-zinc-400 lowercase">Sign in to sync your bag</p>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Extended Drawer Footer */}
                        <div className="p-10 border-t border-zinc-100 bg-zinc-50/50 flex flex-col gap-6">
                            <div className="flex items-center gap-6 text-zinc-300">
                                <Link href="#" className="hover:text-[#D4AF37] transition-colors"><Bell size={18} /></Link>
                                <Link href="https://www.tiktok.com/@wear.abbie?_r=1&_t=ZS-94I4fSegq5S" target="_blank" className="hover:text-zinc-900 transition-colors">
                                    <img src="https://www.svgrepo.com/show/333611/tiktok.svg" className="w-4 h-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all" alt="TikTok" />
                                </Link>
                                <Link href="https://wa.me/2348132484859" className="hover:text-emerald-500 transition-colors flex items-center gap-3">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Concierge Help</p>
                                </Link>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300">Wear Abbie Signature • v2.6</p>
                                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Smelling Nice is our priority.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

        </>
    );
}
