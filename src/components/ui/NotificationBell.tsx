"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Package, ShieldCheck, Info, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

const typeIcon = (type: string) => {
    switch (type) {
        case 'order': return <Package className="w-4 h-4" />;
        case 'promo': return <Tag className="w-4 h-4" />;
        case 'payment': return <ShieldCheck className="w-4 h-4" />;
        case 'system': return <Info className="w-4 h-4" />;
        default: return <Info className="w-4 h-4" />;
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

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useCart();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-all"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 text-zinc-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-[24px] shadow-2xl border border-zinc-100 z-[999] overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-50">
                        <div>
                            <h3 className="font-black text-xs uppercase tracking-widest">Notifications</h3>
                            {unreadCount > 0 && (
                                <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{unreadCount} unread</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllNotificationsRead}
                                    className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest hover:text-black transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-900 transition-colors ml-2">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[420px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <Bell className="w-8 h-8 text-zinc-200 mx-auto mb-3" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => !n.is_read && markNotificationRead(n.id)}
                                    className={`px-5 py-4 border-b border-zinc-50 last:border-0 cursor-pointer transition-all hover:bg-zinc-50/60 ${!n.is_read ? 'bg-amber-50/30' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${typeBg(n.type)}`}>
                                            {typeIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <p className="font-black text-xs text-zinc-900 truncate">{n.title}</p>
                                                {!n.is_read && (
                                                    <span className="w-2 h-2 bg-[#D4AF37] rounded-full flex-shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">{n.message}</p>
                                            <p className="text-[9px] text-zinc-300 font-black uppercase tracking-widest mt-1.5">
                                                {new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <Link
                        href="/notifications"
                        onClick={() => setOpen(false)}
                        className="block w-full py-4 text-center border-t border-zinc-50 bg-zinc-50/20 text-[9px] font-black uppercase tracking-[0.2em] text-[#D4AF37] hover:bg-zinc-50 hover:text-black transition-all"
                    >
                        View Registry Archive
                    </Link>
                </div>
            )}
        </div>
    );
}
