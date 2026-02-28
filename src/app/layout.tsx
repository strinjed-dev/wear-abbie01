import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "../globals.css";

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
    display: "swap",
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    display: "swap",
});

import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/layout/CartDrawer";
import ToastNotification from "@/components/ui/ToastNotification";

export const metadata: Metadata = {
    title: "Wear Abbie | Signature Fragrances",
    description: "Smelling nice is our priority. Experience the curated collection of Wear Abbie.",
    icons: {
        icon: "/logo.png",
        shortcut: "/logo.png",
        apple: "/logo.png",
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${outfit.variable} ${playfair.variable}`}>
            <body className="antialiased">
                <CartProvider>
                    {children}
                    <CartDrawer />
                    <ToastNotification />
                </CartProvider>
            </body>
        </html>
    );
}
