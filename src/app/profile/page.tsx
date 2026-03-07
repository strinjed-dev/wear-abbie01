"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase, getSafeSession } from '@/lib/supabase';
import { Package, User, LogOut, ShoppingBag, Truck, HeadphonesIcon, Gift, Store, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import MemberNavbar from '@/components/layout/MemberNavbar';


// --- Helper Component to Fix Hook Order Error ---
interface OrderCardProps {
    order: any;
    key?: any;
}

const OrderCard = ({ order }: OrderCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div className="p-5 md:p-8 border border-zinc-100 rounded-[24px] md:rounded-[32px] bg-white hover:border-[#D4AF37] transition-all group overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-8 mb-6">
                <div className="flex-1 space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3 md:gap-4">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-zinc-100 px-3 py-1.5 md:px-4 md:py-2 rounded-full">#{order.id?.slice(-6).toUpperCase() || 'REF'}</span>
                        <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 md:px-4 md:py-2 rounded-full ${order.status?.toLowerCase() === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {order.status || 'Processing'}
                        </span>
                    </div>
                    <div className="flex -space-x-2 md:-space-x-3 overflow-hidden">
                        {order.items?.slice(0, 3).map((item: any, i: number) => (
                            <Link key={i} href={`/product/${item.id || item.productId}`} className="block relative z-[30]">
                                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white border border-zinc-50 p-1.5 md:p-2 shadow-sm ring-2 ring-white hover:scale-110 hover:z-[40] transition-all cursor-pointer">
                                    <img src={item.image || item.image_url || '/logo.png'} alt="" className="w-full h-full object-contain" />
                                </div>
                            </Link>
                        ))}
                        {order.items?.length > 3 && (
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white text-[10px] font-black ring-2 ring-white z-[20]">
                                +{order.items.length - 3}
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-full md:w-auto text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-zinc-50 flex md:block justify-between items-center">
                    <div>
                        <p className="text-xl md:text-3xl font-serif font-black">₦{order.total?.toLocaleString()}</p>
                        <p className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{new Date(order.date || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] hover:text-black transition-colors md:block md:ml-auto md:mt-4"
                    >
                        {isExpanded ? 'Hide Details' : 'View Details'}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-zinc-50 pt-8 mt-4 animate-in">
                    <p className="text-[10px] font-black uppercase text-zinc-400 mb-6 tracking-widest">Scent Registry (Items)</p>
                    <div className="space-y-4">
                        {order.items?.map((item: any, i: number) => (
                            <Link
                                href={`/product/${item.id || item.productId}`}
                                key={i}
                                className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl hover:bg-white hover:shadow-sm transition-all group/item border border-transparent hover:border-zinc-100 cursor-pointer relative z-[20]"
                            >
                                <div className="flex items-center gap-4">
                                    <img src={item.image || item.image_url || '/logo.png'} className="w-12 h-12 object-contain bg-white rounded-xl p-1 shadow-sm group-hover/item:scale-105 transition-transform" alt={item.name} />
                                    <div>
                                        <p className="text-xs font-black text-zinc-900 group-hover/item:text-[#D4AF37] transition-colors">{item.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase">Qty: {item.quantity}</p>
                                            <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{order.current_location || 'Awaiting Logistics'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="text-xs font-black">₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                                    <ArrowRight size={12} className="text-zinc-300 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                        <div className="p-6 bg-[#3E2723]/5 rounded-[24px] border border-[#3E2723]/10">
                            <p className="text-[9px] font-black uppercase text-[#3E2723]/40 mb-3 tracking-widest">Delivery Address</p>
                            <p className="text-xs font-bold text-[#3E2723] leading-relaxed">
                                {order.customer?.address || 'Standard Delivery'}<br />
                                {order.customer?.area || ''}, {order.customer?.state || ''}
                            </p>
                        </div>
                        <div className="p-6 bg-zinc-50 rounded-[24px] border border-zinc-100 flex flex-col justify-center relative overflow-hidden">
                            <p className="text-[9px] font-black uppercase text-zinc-400 mb-2 tracking-widest">Tracking Details</p>
                            <p className="text-sm font-black text-zinc-900 mb-1">{order.tracking_code || 'ORD-' + (order.id || '000').substring(0, 8).toUpperCase()}</p>
                            {order.current_location && (
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Status: {order.current_location}</p>
                                </div>
                            )}
                            {!order.current_location && (
                                <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest italic">Awaiting dispatch...</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default function UserProfile() {
    const { orders } = useCart();
    const [activeTab, setActiveTab] = useState('purchases');

    // Wishlist Data
    const [wishlist, setWishlist] = useState<any[]>([]);

    useEffect(() => {
        const loadWishlist = () => {
            const stored = localStorage.getItem('wear_abbie_wishlist');
            if (stored) {
                try { setWishlist(JSON.parse(stored)); } catch (e) { }
            }
        };
        loadWishlist();
        window.addEventListener('storage', loadWishlist);
        return () => window.removeEventListener('storage', loadWishlist);
    }, []);

    // User Data
    const [userData, setUserData] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // Calculate stats
    const totalSpent = (orders || []).reduce((sum: number, order: any) => sum + (order.total || 0), 0);
    const activeOrders = (orders || []).filter((o: any) => o.status?.toLowerCase() === 'pending' || o.status?.toLowerCase() === 'processing').length;

    useEffect(() => {
        const fetchSupabaseIdentity = async () => {
            try {
                // LockManager Fix: Use getSafeSession to prevent parallel auth requests stalling on browser locks
                const { data: { session }, error } = await getSafeSession();
                if (error || !session) {
                    window.location.href = '/auth'; // Redirect unauthenticated users
                    return;
                }
                setUserData(session.user);

                // Fetch user profile info
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                if (profile && profile.role === 'admin') {
                    setIsAdmin(true);
                }
                setUserData({ ...session.user, profile_data: profile || {} });

                // --- Real-time Order Synchronization ---
                const channel = supabase
                    .channel('schema-db-changes')
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'orders',
                            filter: `user_id=eq.${session.user.id}`
                        },
                        (payload: any) => {
                            window.dispatchEvent(new Event("wear_abbie_orders_updated"));
                        }
                    )
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };
            } catch (err) {
                console.error("Auth context error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSupabaseIdentity();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const handleSecretBootstrap = async () => {
        const key = window.prompt("Enter Authorization Key (Cancel if unknown):");
        if (key && userData?.id) {
            const { data, error } = await supabase.rpc('set_admin_role_bootstrap', {
                user_uuid: userData.id,
                secret_bootstrap_key: key
            });

            if (!error && data) {
                alert("Authorization Successful. You now have administrative access.");
                setIsAdmin(true);
            } else {
                alert("Authorization Failed.");
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-12 h-12 border-4 border-zinc-100 border-t-[#D4AF37] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] pb-20">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');
                
                body { font-family: 'Outfit', sans-serif; }
                .font-serif { font-family: 'Playfair Display', serif; }
                
                .glass-card {
                    background: white;
                    border: 1px solid rgba(0, 0, 0, 0.04);
                    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.04);
                    border-radius: 32px;
                }
                .summary-card {
                    background: white;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    border-radius: 24px;
                    padding: 24px;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .summary-card:hover {
                    box-shadow: 0 20px 40px -10px rgba(212, 175, 55, 0.1);
                    transform: translateY(-5px);
                    border-color: #D4AF37;
                }
            `}</style>

            <MemberNavbar />

            <div className="max-w-[1400px] mx-auto pt-20 md:pt-32 px-4 md:px-10">
                {/* Simplified Premium Header */}
                <header className="mb-6 md:mb-10">
                    <div className={`rounded-[24px] md:rounded-[48px] p-6 md:p-20 relative overflow-hidden shadow-xl transition-all duration-700 ${isAdmin ? 'bg-gradient-to-br from-black via-[#1a1a1a] to-[#2a1a0a] border-2 border-[#D4AF37]/20' : 'bg-gradient-to-br from-[#121212] to-[#2D1B18]'}`}>
                        {/* Decorative background elements */}
                        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] transition-all duration-700 ${isAdmin ? 'bg-[#D4AF37]/10' : 'bg-[#D4AF37]/5'}`}></div>
                        {isAdmin && <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#3E2723]/20 rounded-full blur-[60px]"></div>}

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    {isAdmin && (
                                        <div className="px-4 py-1.5 bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-[0.3em] rounded-full flex items-center gap-2 animate-pulse">
                                            <ShieldCheck size={12} /> System Administrator
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-2xl md:text-7xl font-serif font-black text-white mb-2 tracking-tight md:tracking-tighter">
                                    Welcome, <span className="text-[#D4AF37] italic font-light">{userData?.user_metadata?.full_name?.split(' ')[0] || 'Member'}</span>
                                </h1>
                                <p className="text-zinc-400 font-medium text-[11px] md:text-lg max-w-md leading-relaxed">
                                    {isAdmin ? "Manage your products, orders, and logistics from your command center." : "View your order history and track your latest purchases."}
                                </p>
                                {isAdmin && (
                                    <div className="mt-6 md:hidden">
                                        <Link href="/admin" className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white transition-all">
                                            Admin Dashboard <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <div className="hidden sm:flex gap-4">
                                <div className="px-6 py-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-1">Account Type</p>
                                    <p className="text-white font-black text-sm uppercase">{isAdmin ? 'Administrator' : 'Valued Member'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Navigation Bar (Mobile Scrollable) */}
                <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-6 mb-8 scroll-smooth">
                    {['purchases', 'support', 'gifting', 'wishlist', 'settings'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-shrink-0 px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] transition-all duration-300 flex items-center gap-3 ${activeTab === tab
                                ? 'bg-[#3E2723] text-[#D4AF37] shadow-lg shadow-[#3E2723]/20 scale-105'
                                : 'bg-white text-zinc-400 hover:text-zinc-900 border border-zinc-100'
                                }`}
                        >
                            {tab === 'purchases' && <ShoppingBag className="w-4 h-4" />}
                            {tab === 'support' && <HeadphonesIcon className="w-4 h-4" />}
                            {tab === 'gifting' && <Gift className="w-4 h-4" />}
                            {tab === 'wishlist' && <svg className="w-4 h-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
                            {tab === 'settings' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>

                {/* Stats Overview */}
                {activeTab === 'purchases' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12">
                        {[
                            { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'brown' },
                            { label: 'Spending', value: `₦${totalSpent.toLocaleString()}`, icon: Store, color: 'gold' },
                            { label: 'In Transit', value: activeOrders, icon: Truck, color: 'emerald' },
                            { label: 'Points', value: Math.floor(totalSpent / 1000), icon: Gift, color: 'purple' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 md:p-8 rounded-[32px] border border-zinc-100 shadow-sm hover:shadow-xl transition-all group">
                                <stat.icon className="w-5 h-5 text-zinc-300 mb-4 group-hover:text-[#D4AF37] transition-colors" />
                                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{stat.label}</p>
                                <p className="text-xl md:text-2xl font-black text-zinc-900">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Secondary Navigation (Desktop Only) */}
                    <div className="hidden lg:block lg:col-span-3 space-y-4">
                        <div className="bg-white p-8 rounded-[32px] border border-zinc-100 sticky top-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-[#3E2723] rounded-2xl flex items-center justify-center text-[#D4AF37]">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-zinc-900 truncate max-w-[150px]">{userData?.user_metadata?.full_name || 'Member'}</p>
                                    <p className="text-[10px] text-zinc-400 font-medium truncate max-w-[150px]">{userData?.email}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {isAdmin && (
                                    <Link href="/admin" className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-zinc-900 text-[#D4AF37] hover:bg-white border border-zinc-800 hover:text-black transition-all shadow-xl shadow-black/10">
                                        <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest block">Store Manager</span>
                                            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block mt-0.5">Control Panel Access</span>
                                        </div>
                                    </Link>
                                )}
                                <button
                                    onClick={handleSecretBootstrap}
                                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-zinc-400 hover:bg-zinc-50 transition-all"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">System Access</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all mt-4"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content Component */}
                    <div className="lg:col-span-9">
                        <div className="glass-card min-h-[600px] p-8 md:p-12">
                            {activeTab === 'purchases' && (
                                <div className="animate-in">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                                        <div>
                                            <h3 className="text-3xl font-serif font-black" style={{ fontFamily: 'var(--font-playfair), serif' }}>Order History</h3>
                                            <p className="text-zinc-500 mt-2 text-sm font-medium">Review your past purchases and current order status.</p>
                                        </div>
                                        <Link href="/shop">
                                            <button className="bg-zinc-900 text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#D4AF37] transition-all shadow-xl shadow-black/10">
                                                New Purchase
                                            </button>
                                        </Link>
                                    </div>

                                    {orders.length === 0 ? (
                                        <div className="py-16 md:py-24 text-center bg-zinc-50 rounded-[24px] md:rounded-[40px] border border-zinc-100 border-dashed">
                                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-sm">
                                                <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-zinc-300" />
                                            </div>
                                            <p className="text-zinc-400 font-black uppercase tracking-[0.2em] text-[10px]">No orders found</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 md:space-y-6">
                                            {orders.map((order: any, idx: number) => (
                                                <OrderCard key={order.id || idx} order={order} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'support' && (
                                <div className="animate-in pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div>
                                            <h3 className="text-4xl font-serif font-black mb-6" style={{ fontFamily: 'var(--font-playfair), serif' }}>Customer <br />Support</h3>
                                            <p className="text-zinc-500 font-medium leading-relaxed mb-10">Our fragrance consultants are available to assist with any enquiries regarding your orders or scent selections.</p>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-6 p-4 bg-zinc-50 rounded-3xl border border-zinc-100">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                        <Store className="w-5 h-5 text-[#D4AF37]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Call Us</p>
                                                        <p className="text-sm font-black">+234 813 248 4859</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 p-4 bg-zinc-50 rounded-3xl border border-zinc-100">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                        <HeadphonesIcon className="w-5 h-5 text-[#D4AF37]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Us</p>
                                                        <p className="text-sm font-black">support@wearabbie.com</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <form className="space-y-6 bg-zinc-50 p-8 md:p-10 rounded-[40px] border border-zinc-100" onSubmit={async (e) => {
                                            e.preventDefault();
                                            const form = e.target as HTMLFormElement;
                                            const subject = (form.elements.namedItem('subject') as HTMLInputElement).value;
                                            const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;

                                            if (!subject || !message || !userData?.id) return;

                                            setLoading(true);
                                            try {
                                                const { error } = await supabase.from('support_tickets').insert({
                                                    user_id: userData.id,
                                                    subject,
                                                    message,
                                                    status: 'open'
                                                });

                                                if (error) {
                                                    alert("Submission failed. Please try again.");
                                                } else {
                                                    alert("Inquiry submitted successfully. Our concierge will contact you soon.");
                                                    form.reset();
                                                }
                                            } catch (err) {
                                                console.error("Support ticket error:", err);
                                                alert("Submission failed. An unexpected error occurred.");
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Subject</label>
                                                <input required name="subject" type="text" className="w-full bg-white border border-zinc-200 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-[#D4AF37]" placeholder="Order issue, Inquiry, etc." />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Message</label>
                                                <textarea required name="message" rows={5} className="w-full bg-white border border-zinc-200 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-[#D4AF37] resize-none" placeholder="How can we assist you today?"></textarea>
                                            </div>
                                            <button disabled={loading} type="submit" className="bg-[#3E2723] text-white py-5 px-8 rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition-all w-full shadow-lg shadow-[#3E2723]/20 disabled:opacity-50">
                                                {loading ? "Submitting..." : "Submit Inquiry"}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'gifting' && (
                                <div className="animate-in pt-6">
                                    <div className="relative rounded-[40px] overflow-hidden group">
                                        <img src="/perfumes/barakkat-rouge-540-maison-alhambra.png" className="w-full h-[500px] object-cover opacity-20 group-hover:scale-105 transition-transform duration-1000" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent flex flex-col items-center justify-end p-12 text-center">
                                            <Gift className="w-16 h-16 text-[#D4AF37] mb-8" />
                                            <h3 className="text-4xl font-serif font-black text-white mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>Gifting Services</h3>
                                            <p className="text-white/60 font-medium text-lg max-w-xl mb-10">Elevate your gift with our custom packaging and personalized notes. Deliver excellence directly to their doorstep.</p>
                                            <Link href="/shop">
                                                <button className="bg-[#D4AF37] text-white py-5 px-12 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-2xl">
                                                    Start Selection
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'wishlist' && (
                                <div className="animate-in pt-6">
                                    <h3 className="text-3xl font-serif font-black mb-6" style={{ fontFamily: 'var(--font-playfair), serif' }}>My Wishlist</h3>
                                    {wishlist.length === 0 ? (
                                        <div className="py-16 text-center bg-zinc-50 rounded-[24px] border border-zinc-100 border-dashed">
                                            <svg className="w-12 h-12 text-zinc-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                            <p className="text-zinc-400 font-black uppercase tracking-[0.2em] text-[10px]">Your wishlist is empty</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {wishlist.map((item, idx) => (
                                                <div key={idx} className="flex gap-4 p-4 border border-zinc-100 rounded-3xl group hover:border-[#D4AF37] transition-all bg-white">
                                                    <div className="w-24 h-24 bg-zinc-50 rounded-2xl flex items-center justify-center p-2 relative">
                                                        <img src={item.image} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-center">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">{item.category}</p>
                                                        <h4 className="text-sm font-bold font-serif my-1" style={{ fontFamily: 'var(--font-playfair), serif' }}>{item.name}</h4>
                                                        <p className="text-xs font-black">₦{item.price?.toLocaleString()}</p>
                                                        <div className="flex gap-3 mt-3">
                                                            <Link href={`/product/${item.id}`} className="text-[9px] font-black uppercase bg-black text-white px-4 py-2 rounded-full tracking-widest hover:bg-[#D4AF37] transition-colors">View</Link>
                                                            <button
                                                                onClick={() => {
                                                                    const updated = wishlist.filter(w => w.id !== item.id);
                                                                    setWishlist(updated);
                                                                    localStorage.setItem('wear_abbie_wishlist', JSON.stringify(updated));
                                                                }}
                                                                className="text-[9px] font-black uppercase text-red-500 hover:text-red-700 tracking-widest mt-2"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="animate-in pt-6 max-w-2xl">
                                    <h3 className="text-3xl font-serif font-black mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>Account Settings</h3>
                                    <p className="text-zinc-500 text-sm font-medium mb-10">Manage your delivery addresses and personal preferences.</p>

                                    <form className="space-y-6" onSubmit={async (e) => {
                                        e.preventDefault();
                                        setLoading(true);
                                        const form = e.target as HTMLFormElement;
                                        const fullName = (form.elements.namedItem('fullName') as HTMLInputElement).value;
                                        const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
                                        const address = (form.elements.namedItem('address') as HTMLInputElement).value;
                                        const theme = (form.elements.namedItem('theme') as HTMLSelectElement).value;

                                        if (userData?.id) {
                                            try {
                                                const updateFields: any = {
                                                    full_name: fullName,
                                                    phone: phone,
                                                    address: address, // Default attempt with 'address'
                                                    location: address // Also set 'location' for compatibility
                                                };

                                                let { error } = await supabase.from('profiles').update(updateFields).eq('id', userData.id);

                                                // If 'address' column is missing, retry without it (only using 'location')
                                                if (error && error.message.includes('column "address"')) {
                                                    console.warn("Retrying profile update without 'address' column...");
                                                    delete updateFields.address;
                                                    const retry = await supabase.from('profiles').update(updateFields).eq('id', userData.id);
                                                    error = retry.error;
                                                }

                                                if (!error) {
                                                    // Update user metadata for theme
                                                    await supabase.auth.updateUser({
                                                        data: { theme_preference: theme }
                                                    });

                                                    // Update local state to reflect changes immediately
                                                    setUserData((prev: any) => ({
                                                        ...prev,
                                                        profile_data: {
                                                            ...(prev?.profile_data || {}),
                                                            full_name: fullName,
                                                            phone: phone,
                                                            address: address,
                                                            location: address
                                                        },
                                                        user_metadata: {
                                                            ...(prev?.user_metadata || {}),
                                                            theme_preference: theme
                                                        }
                                                    }));

                                                    // Trigger a local storage / DOM update for theme
                                                    if (theme === 'dark') {
                                                        document.documentElement.classList.add('dark');
                                                        localStorage.setItem('theme', 'dark');
                                                    } else if (theme === 'light') {
                                                        document.documentElement.classList.remove('dark');
                                                        localStorage.setItem('theme', 'light');
                                                    } else {
                                                        localStorage.removeItem('theme');
                                                    }

                                                    alert("Settings updated successfully! Reloading to apply changes...");
                                                    window.location.reload();
                                                } else {
                                                    throw error;
                                                }
                                            } catch (err: any) {
                                                console.error("Failed to save settings:", err.message);
                                                alert("Failed to save settings: " + err.message);
                                            } finally {
                                                setLoading(false);
                                            }
                                        } else {
                                            setLoading(false);
                                        }
                                    }}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Full Name</label>
                                                <input defaultValue={userData?.profile_data?.full_name || userData?.user_metadata?.full_name} name="fullName" type="text" className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-all text-zinc-900" placeholder="John Doe" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email (Read Only)</label>
                                                <input defaultValue={userData?.email} disabled type="email" className="w-full bg-zinc-100 border border-zinc-200 rounded-2xl px-6 py-4 text-sm font-medium text-zinc-400 cursor-not-allowed" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Phone Number</label>
                                            <input defaultValue={userData?.profile_data?.phone || ""} name="phone" type="text" className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-all text-zinc-900" placeholder="+234 XXX XXXX" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Default Delivery Address</label>
                                            <textarea defaultValue={userData?.profile_data?.address || ""} name="address" rows={3} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-all text-zinc-900 resize-none" placeholder="123 Luxury Avenue, Lagos"></textarea>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Theme Preference</label>
                                            <select name="theme" defaultValue={userData?.user_metadata?.theme_preference || "system"} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-all text-zinc-900">
                                                <option value="system">System Default</option>
                                                <option value="light">Light Mode</option>
                                                <option value="dark">Dark Mode</option>
                                            </select>
                                        </div>

                                        <button disabled={loading} type="submit" className="bg-[#D4AF37] text-black py-5 px-10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-xl shadow-[#D4AF37]/20 disabled:opacity-50 flex items-center gap-3">
                                            {loading ? "Saving Changes..." : "Save Preferences"}
                                            {!loading && <ShieldCheck className="w-4 h-4" />}
                                        </button>
                                    </form>

                                    <div id="settings-success" className="fixed -bottom-24 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 transition-all duration-500 z-50">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                        Settings Saved Successfully
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
