"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, User, X, LogOut, LayoutDashboard, Bell, Store, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import NotificationBell from "@/components/ui/NotificationBell";

interface NavItem {
    label: string;
    href: string;
}

const mainMenu: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "Shop Scents", href: "/shop" },
    { label: "Track Order", href: "/tracking" },
    { label: "Journal", href: "/journal" },
    { label: "Contact Us", href: "https://wa.me/2348132484859" },
];

export default function MemberNavbar() {
    const { cart, setIsCartOpen, searchQuery, setSearchQuery } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();

    const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUserData(session?.user || null);
            if (session?.user) {
                // Fetch user role for specialized dashboard links
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
                setUserRole(profile?.role || 'member');
            }
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
            setUserData(session?.user || null);
            if (session?.user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
                setUserRole(profile?.role || 'member');
            } else {
                setUserRole(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (pathname !== '/shop' && query.trim().length > 0) {
            router.push('/shop');
        }
    };

    return (
        <>
            {/* TOP NAVBAR */}
            <nav className="w-full h-[70px] bg-white/90 backdrop-blur-md flex items-center justify-between px-4 md:px-8 border-b border-neutral-100 fixed top-0 left-0 z-50">

                {/* LEFT: BURGER */}
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex flex-col gap-[5px] group p-2"
                >
                    <span className="w-6 h-[2.5px] bg-black group-hover:w-7 transition-all rounded-full"></span>
                    <span className="w-5 h-[2.5px] bg-black group-hover:w-6 transition-all rounded-full"></span>
                    <span className="w-4 h-[2.5px] bg-black group-hover:w-5 transition-all rounded-full"></span>
                </button>

                {/* LOGO: CENTERED */}
                <Link href="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
                    <img src="/logo.png" alt="Wear Abbie" className="h-10 md:h-12 w-auto" />
                    <span className="text-lg font-black tracking-tighter hidden sm:block">
                        Wear<span className="text-[#D4AF37]">Abbie</span>
                    </span>
                </Link>

                {/* RIGHT: SEARCH & CART */}
                <div className="flex items-center gap-2 md:gap-5">
                    {/* Search Toggle/Field (Desktop) */}
                    <div className="hidden md:flex items-center bg-neutral-50 px-4 py-2 rounded-full border border-neutral-100 focus-within:bg-white focus-within:border-[#D4AF37] transition-all">
                        <Search className="w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Find a scent..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="bg-transparent border-none outline-none text-[11px] ml-2 w-24 lg:w-40 font-bold uppercase tracking-widest text-zinc-900"
                        />
                    </div>

                    {userData && (
                        <Link href="/dashboard" className="hidden sm:flex w-9 h-9 rounded-full bg-zinc-100 items-center justify-center hover:bg-[#D4AF37]/10 transition-colors">
                            <User className="w-4 h-4 text-zinc-600" />
                        </Link>
                    )}

                    {/* Cart Icon */}
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2"
                    >
                        <ShoppingBag className="w-6 h-6 text-black" />
                        {cartCount > 0 && (
                            <span className="absolute -top-0 -right-0 bg-[#D4AF37] text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {userData && <NotificationBell />}
                </div>

            </nav>

            {/* SLIDE MENU */}
            <AnimatePresence>

                {isOpen && (
                    <>
                        {/* OVERLAY */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black z-[60]"
                        />

                        {/* SIDEBAR */}
                        <motion.div
                            initial={{ x: -420 }}
                            animate={{ x: 0 }}
                            exit={{ x: -420 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 h-full w-[320px] bg-white z-[70] shadow-2xl flex flex-col"
                        >

                            {/* HEADER */}
                            <div className="flex items-center justify-between px-6 h-[70px] border-b border-neutral-50">

                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                                        WA
                                    </div>
                                    <span className="text-lg font-black tracking-tighter">
                                        Wear<span className="text-[#D4AF37]">Abbie</span>
                                    </span>
                                </div>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-9 h-9 flex items-center justify-center hover:bg-neutral-50 rounded-full transition text-lg"
                                >
                                    ✕
                                </button>

                            </div>

                            {/* MENU */}
                            <div className="flex flex-col px-6 py-8 gap-2 overflow-y-auto no-scrollbar">

                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-4 ml-3">
                                    Menu
                                </span>

                                {mainMenu.map((item, index) => (
                                    <motion.div
                                        key={item.label}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`block py-4 px-4 rounded-2xl transition-all text-sm font-bold flex items-center justify-between group
                        ${pathname === item.href ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'hover:bg-neutral-50 text-neutral-700'}`}
                                        >
                                            {item.label}
                                            <div className={`w-1.5 h-1.5 rounded-full bg-[#D4AF37] transition-all opacity-0 group-hover:opacity-100 ${pathname === item.href ? 'opacity-100 scale-125' : ''}`} />
                                        </Link>
                                    </motion.div>
                                ))}

                                <div className="mt-8 pt-8 border-t border-neutral-100">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-4 ml-3">
                                        Your Account
                                    </span>

                                    {userData ? (
                                        <div className="space-y-3 mt-4">
                                            {/* Standard User Dashboard */}
                                            <Link
                                                href="/dashboard"
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-neutral-50 transition-all border border-neutral-50"
                                            >
                                                <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37]">
                                                    <LayoutDashboard size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-zinc-900">My Dashboard</p>
                                                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black">Orders & Tracking</p>
                                                </div>
                                            </Link>

                                            {/* Admin Hub - Special Highlight */}
                                            {userRole === 'admin' && (
                                                <Link
                                                    href="/admin"
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950 text-white transition-all shadow-xl shadow-black/10 border border-zinc-800"
                                                >
                                                    <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-white">
                                                        <ShieldCheck size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">Control Panel</p>
                                                        <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-black">Store Management</p>
                                                    </div>
                                                </Link>
                                            )}

                                            <Link
                                                href="/profile"
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-neutral-50 transition-all"
                                            >
                                                <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-zinc-900">Profile Settings</p>
                                                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black">Account Details</p>
                                                </div>
                                            </Link>

                                            <button
                                                onClick={async () => {
                                                    await supabase.auth.signOut();
                                                    window.location.href = '/';
                                                }}
                                                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 text-red-500 transition-all group"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center group-hover:bg-red-100">
                                                    <LogOut size={18} />
                                                </div>
                                                <span className="font-bold text-sm">Sign Out</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <Link
                                            href="/auth"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-4 p-5 mt-4 bg-black text-white rounded-3xl hover:bg-zinc-800 transition-all shadow-xl shadow-black/10"
                                        >
                                            <User size={20} />
                                            <div className="text-left">
                                                <p className="font-black text-[10px] uppercase tracking-widest text-[#D4AF37]">Sign In</p>
                                                <p className="text-[10px] text-zinc-400">Manage your orders</p>
                                            </div>
                                        </Link>
                                    )}
                                </div>

                            </div>

                            {/* FOOTER */}
                            <div className="mt-auto px-8 py-8 border-t border-neutral-50 bg-neutral-50/30">

                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-neutral-300">
                                    © {new Date().getFullYear()} Wear Abbie
                                </p>

                                <p className="text-[9px] font-bold text-neutral-300 mt-2 uppercase">
                                    Premium Quality Fragrances
                                </p>

                            </div>

                        </motion.div>
                    </>
                )}

            </AnimatePresence>

            {/* Spacer for fixed nav */}
            <div className="h-[70px] w-full" />
        </>
    );
}

