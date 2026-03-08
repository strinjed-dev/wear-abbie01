"use client";

import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, ShieldCheck, Truck, CreditCard, ArrowRight, X, Plus, Minus, Trash2, SlidersHorizontal, BookOpen, ChevronLeft } from 'lucide-react';
import productsData from '@/data/products.json';
import { useCart, Product, CartItem } from '@/context/CartContext';
import { supabase, getSafeSession } from '@/lib/supabase';
import MemberNavbar from '@/components/layout/MemberNavbar';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// --- Monolithic Shop Page Component ---
function ShopContent() {
    const { cart, addToCart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, searchQuery, setSearchQuery } = useCart();
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category') || "All";
    
    const [category, setCategory] = useState(initialCategory);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await getSafeSession();
            setIsLoggedIn(!!session);
        };
        checkAuth();

        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*');

            if (error) {
                console.error("FULL SUPABASE ERROR DETAILS:", {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                }, error);
                setProducts(productsData as Product[]);
                setLoading(false);
                return;
            }

            console.log("Products loaded:", data);

            if (data && data.length > 0) {
                const mappedProducts: Product[] = data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    original_price: p.original_price || null,
                    category: p.category,
                    image: p.image_url || p.image || '/logo.png',
                    inStock: p.stock > 0,
                    stock: p.stock,
                    isCOD: p.is_cod,
                    description: p.description,
                    size: p.size || '',
                    type: p.type || '',
                }));

                setProducts(mappedProducts);
            } else {
                setProducts(productsData as Product[]);
            }

            setLoading(false);
        };

        fetchProducts();

        // --- Real-time Products Synchronization ---
        const channel = supabase
            .channel('realtime-products-global')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                (payload: any) => {
                    if (payload.eventType === 'INSERT') {
                        const newProduct: Product = {
                            id: payload.new.id,
                            name: payload.new.name,
                            brand: payload.new.brand,
                            price: payload.new.price,
                            original_price: payload.new.original_price || null,
                            category: payload.new.category,
                            image: payload.new.image_url || payload.new.image || '/logo.png',
                            inStock: payload.new.stock > 0,
                            stock: payload.new.stock,
                            isCOD: payload.new.is_cod,
                            description: payload.new.description,
                            type: payload.new.type || '',
                            size: payload.new.size || ''
                        };
                        setProducts((current: Product[]) => [newProduct, ...current]);
                    } else if (payload.eventType === 'UPDATE') {
                        setProducts((current: Product[]) =>
                            current.map((p: Product) => p.id === payload.new.id ? {
                                ...p,
                                name: payload.new.name,
                                price: payload.new.price,
                                original_price: payload.new.original_price || null,
                                category: payload.new.category,
                                image: payload.new.image_url || payload.new.image || p.image,
                                inStock: payload.new.stock > 0,
                                stock: payload.new.stock,
                                isCOD: payload.new.is_cod,
                                description: payload.new.description,
                                type: payload.new.type || '',
                                size: payload.new.size || ''
                            } : p)
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setProducts((current: Product[]) => current.filter((p: Product) => p.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const categories = ["All", ...Array.from(new Set(products.map((p: Product) => p.category)))];

    const cartCount = cart.reduce((acc: number, item: CartItem) => acc + item.quantity, 0);
    const cartTotal = cart.reduce((acc: number, item: CartItem) => acc + (item.price * item.quantity), 0);

    const filtered = products.filter((p: Product) => {
        const matchesCategory = category === "All" || p.category === category;
        const q = (searchQuery || "").toLowerCase().trim();
        if (!q) return matchesCategory;

        const nameMatch = (p.name || "").toLowerCase().includes(q);
        const catMatch = (p.category || "").toLowerCase().includes(q);
        const descMatch = (p.description || "").toLowerCase().includes(q);

        return matchesCategory && (nameMatch || catMatch || descMatch);
    });

    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentPage]);

    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) {
            setCategory(cat);
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen flex flex-col bg-white text-zinc-900 overflow-x-hidden">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap');
                
                :root {
                    --font-outfit: 'Outfit', sans-serif;
                    --font-playfair: 'Playfair Display', serif;
                    --gold: #D4AF37;
                    --brown: #3E2723;
                }

                body {
                    font-family: var(--font-outfit);
                }

                .font-serif {
                    font-family: var(--font-playfair);
                }

                .container {
                    width: 100%;
                    max-width: 1400px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-in {
                    animation: fade-in 0.4s ease-out forwards;
                }
            `}</style>

            {/* Top Banner */}
            <div className="bg-black text-white text-[9px] md:text-xs py-3 md:py-4 text-center tracking-[0.3em] md:tracking-[0.4em] font-black uppercase">
                Smelling nice is our priority • <span className="underline decoration-[#D4AF37] underline-offset-4">Secure Checkout</span> • Nationwide Logistics
            </div>

            {/* Premium Unified Navbar */}
            <MemberNavbar />

            {/* Main Content */}
            <main className="flex-grow py-2 md:py-20 bg-white">
                <div className="container mx-auto px-4">
                    {/* Shop Header */}
                    <header className="mb-12 md:mb-24 text-center">
                        <div className="inline-flex items-center gap-2 text-[#D4AF37] font-black text-[10px] uppercase tracking-[0.4em] mb-6">
                            <ShoppingBag className="w-3 h-3" /> Our Collection
                        </div>
                        <h1 className="text-4xl md:text-8xl font-serif font-black mb-8 md:mb-10 tracking-tighter text-zinc-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>Wear Abbie <span className="italic font-light text-[#D4AF37]">Collections.</span></h1>

                        <div className="flex flex-col items-center gap-8 md:gap-10">
                            <p className="max-w-xl text-zinc-400 font-medium text-sm md:text-lg leading-relaxed px-4">Selected with care for those who appreciate fine fragrance. Find your next signature scent from our exclusive collection.</p>

                            <div className="flex items-center gap-3 md:gap-4 bg-zinc-50 p-2 rounded-full border border-zinc-100 shadow-sm overflow-x-auto max-w-full no-scrollbar px-4 md:px-6 py-2 md:py-3">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`px-6 md:px-8 py-2 md:py-3 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${category === cat ? "bg-[#3E2723] text-white shadow-xl" : "text-zinc-400 hover:text-zinc-900"}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </header>

                    {/* Stats/Filters Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 px-6 py-5 bg-zinc-50 rounded-[24px] md:rounded-[30px] border border-zinc-100 gap-4">
                        <div className="flex items-center gap-3">
                            <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">Category: <span className="text-zinc-900">{category}</span></span>
                        </div>
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">{filtered.length} Fragrances Available</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="bg-zinc-50 animate-pulse rounded-[32px] h-80 w-full relative overflow-hidden flex flex-col p-6">
                                    <div className="aspect-square bg-zinc-100 rounded-2xl mb-6"></div>
                                    <div className="h-4 bg-zinc-100 rounded w-1/2 mb-4"></div>
                                    <div className="h-6 bg-zinc-100 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                            {paginated.map((p: Product) => {
                                // Real discount: use original_price from mapped data
                                const origPrice = p.original_price ? p.original_price : null;
                                const hasDiscount = origPrice !== null && origPrice > p.price;
                                const discountPercent = hasDiscount ? Math.round(((origPrice - p.price) / origPrice) * 100) : 0;

                                return (
                                <Link href={`/product/${p.id}`} key={p.id} className="bg-white rounded-[24px] md:rounded-[32px] p-3 md:p-6 border border-zinc-100 hover:border-[#D4AF37] hover:shadow-[0_20px_50px_rgba(212,175,55,0.15)] transition-all duration-500 group relative flex flex-col h-full cursor-pointer">
                                    <div className="aspect-square bg-zinc-50 rounded-xl md:rounded-2xl mb-4 md:mb-6 flex items-center justify-center p-4 md:p-8 relative overflow-hidden group/image">
                                        <img src={p.image} alt={p.name} className={`max-w-full max-h-full object-contain transform group-hover:scale-110 transition-transform duration-700 ${!p.inStock ? 'opacity-50 grayscale' : ''}`} />
                                        {/* Real Discount Badge */}
                                        {hasDiscount && p.inStock && (
                                            <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-red-500 text-white text-[7px] md:text-[9px] font-black uppercase tracking-widest px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-lg z-10 animate-pulse">
                                                -{discountPercent}% OFF
                                            </div>
                                        )}
                                        {p.isCOD && (
                                            <span className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/90 backdrop-blur-sm text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-zinc-100 text-zinc-500 z-10">COD</span>
                                        )}
                                        {!p.inStock && (
                                            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-20">
                                                <span className="text-[9px] md:text-[11px] tracking-widest uppercase font-black text-white bg-red-600 px-4 py-2 rounded-full transform shadow-2xl backdrop-blur-md border border-red-400">Sold Out</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow space-y-1 md:space-y-2 flex flex-col">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">{p.category}</span>
                                            {p.size && <span className="text-[7px] md:text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50 px-1.5 py-0.5 rounded-md">{p.size}</span>}
                                        </div>
                                        <h3 className="text-xs md:text-lg font-serif font-black md:h-14 line-clamp-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>{p.name}</h3>
                                        <div className="mt-auto pt-2 md:pt-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-[7px] md:text-[9px] font-black uppercase tracking-tighter text-zinc-400 mb-0.5">Price</p>
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm md:text-xl font-black ${!p.inStock ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>₦{p.price.toLocaleString()}</p>
                                                    {hasDiscount && p.inStock && <p className="text-[9px] md:text-xs text-zinc-400 line-through font-medium">₦{origPrice.toLocaleString()}</p>}
                                                </div>
                                            </div>
                                            <div
                                                role="button"
                                                onClick={(e: React.MouseEvent) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (p.inStock) addToCart(p);
                                                }}
                                                className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${p.inStock ? "bg-[#D4AF37] text-white hover:bg-[#3E2723] shadow-[#D4AF37]/20 cursor-pointer" : "bg-zinc-100 text-zinc-300 cursor-not-allowed shadow-none"}`}
                                                title="Add to Boutique Bag"
                                            >
                                                <ShoppingBag className="w-3.5 h-3.5 md:w-5 md:h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-16 flex items-center justify-center gap-4">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="w-12 h-12 rounded-full border border-zinc-100 flex items-center justify-center hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-white"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Page</span>
                                <span className="text-sm font-black text-zinc-900">{currentPage}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">of</span>
                                <span className="text-sm font-black text-zinc-900">{totalPages}</span>
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="w-12 h-12 rounded-full border border-zinc-100 flex items-center justify-center hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-white"
                            >
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {filtered.length === 0 && !loading && (
                        <div className="text-center py-20 bg-[#D4AF37]/5 rounded-[40px] md:rounded-[60px] border border-[#D4AF37]/20 border-dashed max-w-4xl mx-auto">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-zinc-100 text-[#D4AF37]">
                                <Search className="w-6 h-6 md:w-8 md:h-8" />
                            </div>
                            <h2 className="text-2xl md:text-5xl font-serif font-black mb-6 px-6 text-zinc-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>Looking for something specific?</h2>
                            <p className="text-zinc-500 font-medium text-sm md:text-lg mb-10 px-8 max-w-2xl mx-auto leading-relaxed">
                                Our collection is constantly growing. If you can't find what you're looking for, <span className="text-zinc-900 font-black">send us a message on WhatsApp</span> and we'll see if we can get it for you.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6">
                                <a
                                    href={`https://wa.me/2348132484859?text=Hello Wear Abbie, I am looking for a fragrance that is not on your site: ${searchQuery}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full sm:w-auto bg-[#25D366] text-white px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all"
                                >
                                    Chat with us <span className="text-sm">→</span>
                                </a>
                                <button
                                    onClick={() => { setSearchQuery(""); setCategory("All"); }}
                                    className="w-full sm:w-auto bg-zinc-900 text-white px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-[#3E2723] transition-all"
                                >
                                    Reset Selection
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-zinc-50 pt-16 md:pt-20 pb-10 border-t border-zinc-100">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 mb-16 md:mb-20 text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start">
                        <img src="/logo.png" alt="Logo" className="h-10 md:h-12 lg:h-16 mb-8" />
                        <p className="text-zinc-500 text-sm leading-relaxed mb-8">We believe everyone deserves to smell amazing. Wear Abbie Signature is dedicated to bringing you high-quality fragrances with excellent service.</p>
                        <div className="flex gap-5">
                            <a href="https://www.tiktok.com/@wear.abbie?_r=1&_t=ZS-94I4fSegq5S" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#D4AF37] transition-all transform hover:scale-110">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-.23-.15-.44-.31-.64-.49v8.29c.04 1.48-.41 3.01-1.39 4.11-1.15 1.4-3.03 2.1-4.78 1.95-1.76-.01-3.52-.92-4.48-2.39-1.02-1.42-1.22-3.32-.57-4.89.65-1.74 2.27-3.04 4.1-3.23l.11 4.13c-1.3-.02-2.73.74-3.19 1.96-.28.81-.13 1.73.34 2.45.42.72 1.25 1.15 2.08 1.15.71-.01 1.4-.35 1.83-.91.43-.6.54-1.39.51-2.12V.02z" /></svg>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-widest text-xs mb-6 md:mb-8 text-zinc-400">Collections</h4>
                        <ul className="space-y-3 md:space-y-4 text-sm font-bold text-zinc-500">
                            <li className="hover:text-zinc-900 cursor-pointer transition-colors"><a href="/shop">Wear Abbie Boutique</a></li>
                            <li className="hover:text-zinc-900 cursor-pointer transition-colors"><a href="/journal">The Journal</a></li>
                            <li className="hover:text-zinc-900 cursor-pointer transition-colors"><a href="/shop?category=Gift Sets">Gifting Suite</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-widest text-xs mb-6 md:mb-8 text-zinc-400">Wear Abbie Help</h4>
                        <ul className="space-y-3 md:space-y-4 text-sm font-bold text-zinc-500">
                            <li className="hover:text-zinc-900 cursor-pointer transition-colors"><a href="/tracking">Order Tracking</a></li>
                            <li className="hover:text-zinc-900 cursor-pointer transition-colors"><a href="https://wa.me/2348132484859" target="_blank" rel="noopener noreferrer">Customer Support</a></li>
                        </ul>
                    </div>
                    <div className="flex flex-col items-center md:items-start">
                        <h4 className="font-black uppercase tracking-widest text-xs mb-6 md:mb-8 text-zinc-400">Our Promise</h4>
                        <div className="space-y-4 md:space-y-6">
                            {[
                                { icon: <ShieldCheck className="w-5 h-5" />, txt: "Original Products" },
                                { icon: <Truck className="w-5 h-5" />, txt: "Secure Nationwide Shipping" },
                                { icon: <CreditCard className="w-5 h-5" />, txt: "Secure Payments" }
                            ].map((p, i) => (
                                <div key={i} className="flex items-center gap-4 text-sm font-bold text-zinc-500 justify-center md:justify-start">
                                    <span className="text-[#D4AF37]">{p.icon}</span>
                                    {p.txt}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 pt-10 border-t border-zinc-200 text-center text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <p>© 2026 Wear Abbie Signature. Smelling nice is our priority.</p>
                </div>
            </footer>

        </div>
    );
}

export default function Shop() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white font-serif">
                <div className="flex flex-col items-center gap-6">
                    <img src="/logo.png" className="h-20 animate-pulse" alt="Loading..." />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#D4AF37]">Waking up the scents...</p>
                </div>
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}
