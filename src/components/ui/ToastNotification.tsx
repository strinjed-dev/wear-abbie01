"use client";

import React, { useEffect, useState } from 'react';
import { ShoppingBag, CheckCircle, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function ToastNotification() {
    const { lastAddedItem, clearLastAddedItem } = useCart();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (lastAddedItem) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(clearLastAddedItem, 300); // Wait for fade out
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [lastAddedItem, clearLastAddedItem]);

    if (!lastAddedItem && !visible) return null;

    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <div className="bg-white/95 backdrop-blur-xl border border-[#D4AF37]/20 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl p-4 flex items-center gap-4 min-w-[320px] max-w-[90vw]">
                <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center p-2 border border-zinc-100">
                    <img src={lastAddedItem?.image} alt={lastAddedItem?.name} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-0.5">
                        <CheckCircle size={12} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Added to bag</span>
                    </div>
                    <h4 className="text-xs font-bold text-zinc-900 truncate max-w-[150px]">{lastAddedItem?.name}</h4>
                </div>
                <div className="h-10 w-px bg-zinc-100 mx-1"></div>
                <button
                    onClick={() => {
                        // For a cool effect, the toast could trigger open the cart, but user asked NOT to disrupt.
                        // So we just show it.
                        setVisible(false);
                    }}
                    className="p-2 hover:bg-zinc-50 rounded-full transition-colors"
                >
                    <X size={16} className="text-zinc-400" />
                </button>
            </div>
        </div>
    );
}
