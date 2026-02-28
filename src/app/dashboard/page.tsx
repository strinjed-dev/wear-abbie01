"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { Package, User, LogOut, ShoppingBag, Truck, HeadphonesIcon, Gift, Store, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import MemberNavbar from '@/components/layout/MemberNavbar';


export default function UserDashboard() {
    const { orders } = useCart();
    const [activeTab, setActiveTab] = useState('purchases');

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
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error || !session) {
                    window.location.href = '/auth'; // Redirect unauthenticated users
                    return;
                }
                setUserData(session.user);

                // Fetch user role
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
                if (profile && profile.role === 'admin') {
                    setIsAdmin(true);
                }

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
                alert("God Mode Enabled. Welcome back, Administrator.");
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
                    <div className="bg-gradient-to-br from-[#121212] to-[#2D1B18] rounded-[24px] md:rounded-[48px] p-6 md:p-20 relative overflow-hidden shadow-xl">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-[60px]"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
                            <div>
                                <h1 className="text-2xl md:text-7xl font-serif font-black text-white mb-2 tracking-tight md:tracking-tighter">
                                    Hello, <span className="text-[#D4AF37] italic font-light">{userData?.user_metadata?.full_name?.split(' ')[0] || 'Member'}</span>
                                </h1>
                                <p className="text-zinc-400 font-medium text-[11px] md:text-lg max-w-md leading-relaxed">
                                    Manage your scents and tracking.
                                </p>
                            </div>
                            <div className="hidden sm:flex gap-4">
                                <div className="px-6 py-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-1">Status</p>
                                    <p className="text-white font-black text-sm uppercase">Gold Member</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Navigation Bar (Mobile Scrollable) */}
                <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-6 mb-8 scroll-smooth">
                    {['purchases', 'tracking', 'support', 'gifting'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-shrink-0 px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] transition-all duration-300 flex items-center gap-3 ${activeTab === tab
                                ? 'bg-[#3E2723] text-[#D4AF37] shadow-lg shadow-[#3E2723]/20 scale-105'
                                : 'bg-white text-zinc-400 hover:text-zinc-900 border border-zinc-100'
                                }`}
                        >
                            {tab === 'purchases' && <ShoppingBag className="w-4 h-4" />}
                            {tab === 'tracking' && <Truck className="w-4 h-4" />}
                            {tab === 'support' && <HeadphonesIcon className="w-4 h-4" />}
                            {tab === 'gifting' && <Gift className="w-4 h-4" />}
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
                                    <Link href="/admin" className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-zinc-900 text-[#D4AF37] hover:bg-black transition-all">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Admin Hub</span>
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
                                            <p className="text-zinc-500 mt-2 text-sm font-medium">Review and track your curated collection purchases.</p>
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
                                                <div key={idx} className="p-5 md:p-8 border border-zinc-100 rounded-[24px] md:rounded-[32px] bg-white hover:border-[#D4AF37] transition-all group">
                                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-8">
                                                        <div className="flex-1 space-y-4 md:space-y-6">
                                                            <div className="flex items-center gap-3 md:gap-4">
                                                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-zinc-100 px-3 py-1.5 md:px-4 md:py-2 rounded-full">#{order.id.slice(-6).toUpperCase()}</span>
                                                                <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 md:px-4 md:py-2 rounded-full ${order.status?.toLowerCase() === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                                    }`}>
                                                                    {order.status || 'Processing'}
                                                                </span>
                                                            </div>
                                                            <div className="flex -space-x-2 md:-space-x-3 overflow-hidden">
                                                                {order.items?.slice(0, 3).map((item: any, i: number) => (
                                                                    <div key={i} className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white border border-zinc-50 p-1.5 md:p-2 shadow-sm ring-2 ring-white">
                                                                        <img src={item.image} alt="" className="w-full h-full object-contain" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="w-full md:w-auto text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-zinc-50 flex md:block justify-between items-center">
                                                            <div>
                                                                <p className="text-xl md:text-3xl font-serif font-black">₦{order.total.toLocaleString()}</p>
                                                                <p className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                                                            </div>
                                                            <button className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] hover:text-black transition-colors md:block md:ml-auto md:mt-4">Details</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'tracking' && (
                                <div className="animate-in pt-6">
                                    <div className="text-center max-w-xl mx-auto mb-16">
                                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                            <Truck className="w-10 h-10 text-emerald-600" />
                                        </div>
                                        <h3 className="text-4xl font-serif font-black mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>Track Your Scent</h3>
                                        <p className="text-zinc-500 font-medium">Get real-time updates on your curated collection journey through our luxury logistics network.</p>
                                    </div>

                                    <div className="bg-zinc-50 p-10 md:p-14 rounded-[40px] border border-zinc-100 relative overflow-hidden">
                                        <input
                                            type="text"
                                            placeholder="Enter Tracking ID (e.g., ORD-123456)"
                                            className="w-full bg-white border border-zinc-200 rounded-full px-10 py-6 text-base font-bold text-center mb-6 focus:outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 transition-all shadow-sm"
                                        />
                                        <button className="w-full bg-[#121212] text-[#D4AF37] py-6 px-8 rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10">
                                            Locate Package
                                        </button>
                                        <p className="text-[10px] text-zinc-400 text-center mt-8 font-bold uppercase tracking-widest">Tracking provided by Wear Abbie Logistics</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'support' && (
                                <div className="animate-in pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div>
                                            <h3 className="text-4xl font-serif font-black mb-6" style={{ fontFamily: 'var(--font-playfair), serif' }}>Concierge <br />Support</h3>
                                            <p className="text-zinc-500 font-medium leading-relaxed mb-10">Our luxury fragrance consultants are available to assist with any enquiries regarding your orders or scent selections.</p>

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
                                        <form className="space-y-6 bg-zinc-50 p-8 md:p-10 rounded-[40px] border border-zinc-100">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Subject</label>
                                                <input type="text" className="w-full bg-white border border-zinc-200 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-[#D4AF37]" placeholder="Order issue, Inquiry, etc." />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Message</label>
                                                <textarea rows={5} className="w-full bg-white border border-zinc-200 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-[#D4AF37] resize-none" placeholder="How can we assist you today?"></textarea>
                                            </div>
                                            <button type="button" className="bg-[#3E2723] text-white py-5 px-8 rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition-all w-full shadow-lg shadow-[#3E2723]/20">
                                                Submit Inquiry
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
                                            <h3 className="text-4xl font-serif font-black text-white mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>The Art of Gifting</h3>
                                            <p className="text-white/60 font-medium text-lg max-w-xl mb-10">Elevate your gift with our signature gold-embossed packaging and personalized luxury notes. Deliver excellence directly to their doorstep.</p>
                                            <Link href="/shop">
                                                <button className="bg-[#D4AF37] text-white py-5 px-12 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-2xl">
                                                    Start Selection
                                                </button>
                                            </Link>
                                        </div>
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
