"use client";

import { Search, ShoppingBag, User, Menu } from 'lucide-react';

export default function Navbar({ cartCount, onCartClick, onSearch }: { cartCount: number, onCartClick: () => void, onSearch: (val: string) => void }) {
    return (
        <nav className="glass-nav">
            <div className="container flex items-center justify-between">
                <div className="flex items-center gap-10">
                    <a href="/" className="cursor-pointer group">
                        <img src="/logo.png" alt="Wear Abbie" className="h-10 md:h-14 transition-transform duration-500 group-hover:scale-110" />
                    </a>
                    <div className="hidden lg:flex gap-8 text-[13px] font-bold uppercase tracking-widest text-zinc-500">
                        <a href="/" className="hover:text-gold transition-colors">Home</a>
                        <a href="/shop" className="hover:text-gold transition-colors">Collections</a>
                        <a href="#" className="hover:text-gold transition-colors">The Scent Journal</a>
                    </div>
                </div>

                <div className="flex items-center gap-4 md:gap-8">
                    <div className="hidden md:flex items-center w-80">
                        <div className="search-pill w-full">
                            <Search className="w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search catalog..."
                                className="bg-transparent border-none outline-none text-sm ml-3 w-full font-medium"
                                onChange={(e) => onSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative cursor-pointer group" onClick={onCartClick}>
                            <ShoppingBag className="w-6 h-6 group-hover:text-gold transition-colors" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-gold text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <User className="w-6 h-6 cursor-pointer hidden sm:block hover:text-gold transition-colors" />
                        <Menu className="w-6 h-6 lg:hidden cursor-pointer" />
                    </div>
                </div>
            </div>
        </nav>
    );
}
