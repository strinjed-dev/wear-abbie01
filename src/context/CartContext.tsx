"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    inStock: boolean;
    isCOD?: boolean;
    description?: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Order {
    id: string;
    customer: any;
    items: CartItem[];
    total: number;
    status: string;
    date: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    orders: Order[];
    placeOrder: (customerInfo: any) => void;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        const savedCart = localStorage.getItem("wear_abbie_cart");
        if (savedCart) {
            try { setCart(JSON.parse(savedCart)); } catch (e) { }
        }

        const fetchOrders = () => {
            const savedOrders = localStorage.getItem("wear_abbie_orders");
            if (savedOrders) {
                try { setOrders(JSON.parse(savedOrders)); } catch (e) { }
            }
        };
        fetchOrders();

        window.addEventListener("wear_abbie_orders_updated", fetchOrders);
        return () => window.removeEventListener("wear_abbie_orders_updated", fetchOrders);
    }, []);

    useEffect(() => {
        localStorage.setItem("wear_abbie_cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: Product) => {
        setCart((prev: CartItem[]) => {
            const existing = prev.find((item: CartItem) => item.id === product.id);
            if (existing) {
                return prev.map((item: CartItem) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId: string) => {
        setCart((prev: CartItem[]) => prev.filter((item: CartItem) => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        setCart((prev: CartItem[]) => prev.map((item: CartItem) => item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item));
    };

    const clearCart = () => {
        setCart([]);
    };

    const placeOrder = (customerInfo: any) => {
        const total = cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
        const newOrder: Order = {
            id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            customer: customerInfo,
            items: cart,
            total,
            status: 'Pending',
            date: new Date().toISOString()
        };

        const existingOrders = JSON.parse(localStorage.getItem("wear_abbie_orders") || "[]");
        const updatedOrders = [newOrder, ...existingOrders];
        localStorage.setItem("wear_abbie_orders", JSON.stringify(updatedOrders));
        setOrders(updatedOrders);
        window.dispatchEvent(new Event("wear_abbie_orders_updated"));

        clearCart();
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, orders, placeOrder, isCartOpen, setIsCartOpen }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
