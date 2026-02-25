"use client";

import { ShoppingBag } from 'lucide-react';

import { Product } from '@/lib/types';

export default function ProductCard({ product, addToCart }: { product: Product, addToCart: (p: Product) => void }) {
    return (
        <div className="product-card-elite group">
            <div className="product-image-container relative">
                <img
                    src={product.image}
                    alt={product.name}
                    className="max-w-[85%] max-h-[85%] object-contain transition-transform duration-1000 group-hover:scale-110"
                />
                {!product.inStock && (
                    <span className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center text-[10px] tracking-[0.3em] uppercase font-black text-red-500">
                        Out of Stock
                    </span>
                )}
                {product.isCOD && (
                    <span className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-[9px] tracking-widest uppercase font-black px-4 py-2 rounded-full shadow-lg border border-gold/10 text-zinc-800">
                        COD
                    </span>
                )}
            </div>

            <div className="mt-6">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-black mb-2 block">{product.category}</span>
                <h3 className="font-serif font-bold text-lg md:text-xl mb-3 truncate text-zinc-800">{product.name}</h3>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Price</span>
                        <span className="font-black text-xl text-zinc-900">₦{product.price.toLocaleString()}</span>
                    </div>
                    <button
                        onClick={() => addToCart(product)}
                        className="btn-pill btn-gold p-0 w-12 h-12 flex items-center justify-center"
                    >
                        <ShoppingBag className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
