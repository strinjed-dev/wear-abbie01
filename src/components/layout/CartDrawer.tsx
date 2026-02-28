"use client";

import React from 'react';
import { X, Trash2, ShieldCheck, LockIcon, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart, CartItem, Product } from '@/context/CartContext';
import Link from 'next/link';

export default function CartDrawer() {
    const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useCart();

    if (!isCartOpen) return null;

    const cartTotal = cart.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);

    return (
        <div className="fixed inset-0 z-[200] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md transition-opacity duration-500"
                onClick={() => setIsCartOpen(false)}
            ></div>

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-0 overflow-hidden animate-slide-in">

                {/* Header */}
                <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-serif font-black tracking-tight text-zinc-900 leading-none mb-1" style={{ fontFamily: 'var(--font-playfair), serif' }}>Your Bag</h2>
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">{cart.length} Elite Selection(s)</p>
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-zinc-100 flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-sm"
                    >
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                {/* Free Shipping Tracker */}
                {cart.length > 0 && (
                    <div className="px-8 py-4 bg-[#D4AF37]/5 border-b border-[#D4AF37]/10">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                {cartTotal >= 50000 ? (
                                    <span className="text-emerald-600 flex items-center gap-2">
                                        <ShieldCheck size={12} /> Your order ships free
                                    </span>
                                ) : (
                                    <>Add <span className="text-[#D4AF37]">₦{(50000 - cartTotal).toLocaleString()}</span> for Free Shipping</>
                                )}
                            </p>
                            <span className="text-[10px] font-black text-zinc-400">{Math.min(100, (cartTotal / 50000) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#D4AF37] transition-all duration-1000 ease-out"
                                style={{ width: `${Math.min(100, (cartTotal / 50000) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Product Items */}
                <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-8 md:space-y-10 no-scrollbar">
                    {cart.map((item: CartItem) => (
                        <div key={item.id} className="flex gap-4 md:gap-6 items-center group">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-50 rounded-[20px] flex items-center justify-center p-3 md:p-4 border border-zinc-100 transition-all duration-500 group-hover:bg-white group-hover:shadow-lg group-hover:border-[#D4AF37]/20">
                                <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110" />
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-serif font-black text-base md:text-lg text-zinc-800 leading-tight truncate w-32 md:w-40" style={{ fontFamily: 'var(--font-playfair), serif' }}>{item.name}</h4>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-zinc-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <p className="text-[#D4AF37] font-black text-sm md:text-lg mb-3">₦{item.price.toLocaleString()}</p>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center bg-zinc-50 rounded-full border border-zinc-100 p-1">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center hover:bg-white rounded-full transition-all text-zinc-400"
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <span className="w-6 md:w-8 text-center text-[10px] md:text-xs font-black">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center hover:bg-white rounded-full transition-all text-zinc-400"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                    <p className="font-black text-xs md:text-sm text-zinc-400 uppercase tracking-tighter">
                                        Sub: <span className="text-zinc-900 ml-1">₦{(item.price * item.quantity).toLocaleString()}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20">
                            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                                <ShoppingBag className="w-8 h-8 text-zinc-300" />
                            </div>
                            <p className="text-zinc-400 font-serif italic text-xl md:text-2xl mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>The Bag is Empty.</p>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="text-[#D4AF37] font-black uppercase tracking-[0.2em] text-[10px] underline underline-offset-8"
                            >
                                Continue Browsing
                            </button>
                        </div>
                    )}
                </div>

                {/* Checkout Footer */}
                {cart.length > 0 && (
                    <div className="p-8 bg-zinc-50/80 border-t border-zinc-100">
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-zinc-400 uppercase font-black text-[10px] tracking-widest">
                                <span>Subtotal</span>
                                <span className="text-zinc-900 text-sm italic">₦{cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-400 uppercase font-black text-[10px] tracking-widest">
                                <span>Fast Shipping</span>
                                <span className="text-zinc-400 text-xs lowercase">calculated next step</span>
                            </div>
                            <div className="h-[1px] w-full bg-zinc-200/50"></div>
                            <div className="flex justify-between items-center">
                                <span className="font-serif font-black text-xl md:text-2xl text-zinc-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>Total</span>
                                <span className="font-black text-xl md:text-2xl text-[#D4AF37] tracking-tight">₦{cartTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="w-full bg-[#3E2723] text-white py-5 md:py-6 rounded-full font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-4 group">
                            <LockIcon size={18} className="text-[#D4AF37] group-hover:scale-110 transition-transform" />
                            Secure Checkout <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <div className="mt-6 flex items-center justify-center gap-3 opacity-40">
                            <ShieldCheck size={14} />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Encrypted SSL Protocol Active</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
