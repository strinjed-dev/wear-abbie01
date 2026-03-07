"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { Bell, Info, Package, ShieldCheck, Tag, Trash2, Check, ArrowLeft } from 'lucide-react';
import MemberNavbar from '@/components/layout/MemberNavbar';
import Link from 'next/link';

const typeIcon = (type: string) => {
    switch (type) {
        case 'order': return <Package className="w-5 h-5" />;
        case 'promo': return <Tag className="w-5 h-5" />;
        case 'payment': return <ShieldCheck className="w-5 h-5" />;
        case 'system': return <Info className="w-5 h-5" />;
        default: return <Info className="w-5 h-5" />;
    }
};

const typeBg = (type: string) => {
    switch (type) {
        case 'order': return 'bg-amber-50 text-amber-600 border-amber-100';
        case 'promo': return 'bg-purple-50 text-purple-600 border-purple-100';
        case 'payment': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case 'system': return 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20';
        default: return 'bg-zinc-50 text-zinc-500 border-zinc-100';
    }
};

export default function NotificationsPage() {
    const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useCart();
    const [userData, setUserData] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                window.location.href = '/auth';
                return;
            }
            setUserData(session.user);

            const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
            if (profile?.role === 'admin') setIsAdmin(true);
            setLoading(false);
        };
        fetchUser();
    }, []);

    const handleDeleteNotification = async (id: string) => {
        const { error } = await supabase.from('notifications').delete().eq('id', id);
        if (!error) {
            // Local update handles via Realtime/Context usually, but alert or trigger re-fetch if needed
            window.dispatchEvent(new Event("wear_abbie_notifications_updated"));
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
            `}</style>

            <MemberNavbar />

            <div className="max-w-[1000px] mx-auto pt-28 md:pt-40 px-4 md:px-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-in">
                    <div>
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] hover:text-black transition-colors mb-4 group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tight">Recent <span className="text-[#D4AF37] italic font-light">Updates</span></h1>
                        <p className="text-zinc-500 font-medium mt-2">Stay updated on your orders and rewards.</p>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={markAllNotificationsRead}
                            className="bg-zinc-900 text-[#D4AF37] px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center gap-3"
                        >
                            <Check className="w-4 h-4" /> Clear Unread
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-[40px] border border-zinc-100 shadow-xl shadow-black/[0.02] overflow-hidden min-h-[500px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center px-10">
                            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6 border border-zinc-100">
                                <Bell className="w-10 h-10 text-zinc-200" />
                            </div>
                            <h3 className="text-xl font-serif font-black mb-2">No notifications yet</h3>
                            <p className="text-zinc-400 font-medium max-w-xs">We'll let you know when there's an update on your order or a special reward for you.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-50">
                            {notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((n) => (
                                <div
                                    key={n.id}
                                    className={`p-6 md:p-10 flex items-start gap-6 transition-all hover:bg-zinc-50/50 relative group ${!n.is_read ? 'bg-amber-50/20' : ''}`}
                                >
                                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 ${typeBg(n.type)}`}>
                                        {typeIcon(n.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${n.type === 'system' ? 'text-[#D4AF37]' : 'text-zinc-400'}`}>
                                                {n.type} Alert
                                            </p>
                                            <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
                                                {new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} • {new Date(n.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <h3 className="text-lg md:text-xl font-serif font-black text-zinc-900 mb-2 truncate">
                                            {n.title}
                                        </h3>
                                        <p className="text-zinc-500 font-medium leading-relaxed max-w-2xl">
                                            {n.message}
                                        </p>

                                        <div className="flex items-center gap-6 mt-6">
                                            {!n.is_read && (
                                                <button
                                                    onClick={() => markNotificationRead(n.id)}
                                                    className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] hover:text-black transition-colors"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                            {n.order_id && (
                                                <Link
                                                    href={isAdmin ? `/admin` : `/dashboard`}
                                                    className="text-[9px] font-black uppercase tracking-widest text-zinc-900 underline decoration-[#D4AF37] underline-offset-4 hover:text-[#D4AF37] transition-colors"
                                                >
                                                    {isAdmin ? 'View in Admin' : 'View Order'}
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => handleDeleteNotification(n.id)}
                                                className="md:opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-zinc-300 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
