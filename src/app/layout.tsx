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
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
    title: "Wear Abbie | Luxury Fragrances",
    description: "Wear Abbie • Smelling nice is our priority. Discover high-quality fragrances with curated collections and nationwide delivery.",
    keywords: ["perfumes", "fragrances", "Nigeria perfumes", "luxury scents", "Wear Abbie", "buy perfume online", "Lagos fragrances"],
    openGraph: {
        title: "Wear Abbie | Premium Fragrances",
        description: "Nigeria's curated source for exceptional scents. Authentic quality guaranteed.",
        images: ["/logo.png"],
    },
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
            <body className="antialiased font-outfit">
                <CartProvider>
                    <NextTopLoader color="#D4AF37" showSpinner={false} height={3} />
                    {children}
                    <CartDrawer />
                    <ToastNotification />
                </CartProvider>
                <script src="https://js.paystack.co/v1/inline.js" async></script>
            </body>
        </html>
    );
}
