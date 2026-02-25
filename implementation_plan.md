# Wear Abbie Elite - Premium Next.js Implementation Plan

## 1. Visual Identity & Design System (Luxury Upgrade)
- **Extreme Aesthetics**: "Next-grade" tints, smooth gradients, and micro-interactions.
- **Color Palette**:
  - **Primary Gold**: `#D4AF37` (Glowing/Metallic)
  - **Chocolate Brown**: `#3E2723` (Deep, rich base for luxury)
  - **Deep Charcoal**: `#121212` (For high-contrast elements)
  - **White/Inverse Black**: Pure white vs deep off-black for text/surfaces.
- **Pill Design**: All inputs (search) and buttons use a full pill-radius (`9999px`) for a modern, fluid feel.
- **Glowing Alive Shadows**: Elements have subtle, gold-tinted "glow" shadows that activate on interaction.

## 2. Dynamic Product Inventory (Ready)
- **Renamed Assets**: All 60+ images have been cataloged and renamed according to their real perfume names extracted via AI.
- **Structured Data**: `src/data/products.json` acts as the single source of truth for the boutique.
- **Category Support**: Automatic categorization into "Eau de Parfum", "Body Spray", and "Mini Collection".

## 3. High-Performance E-Commerce Engine
- **Next.js Optimized**: App Router with SSR for fast landing and client-side transitions for the shopping experience.
- **Mobile First**: Smooth gesture-based interactions (swipeable drawers).
- **Cart Management**: Real-time cart state with persistent storage capability.
- **Checkout Workflow**:
  - Optimized for WhatsApp or Mobile Pay checkout (Admin choice).
  - COD (Cash on Delivery) indicators on premium items.

## 4. Business Power-User Admin Dashboard
- **Product Management**: 
  - Dynamic naming/categorization.
  - Stock toggle (In-stock/Out-of-stock).
  - COD Availability toggle per product.
- **B2C Analytics**: Revenue tracking, order status management, and customer behavior insights.

## 5. Technical Stack
- **Framework**: Next.js 15 (App Router) with React 19.
- **Styling**: Tailwind CSS + Custom Vanilla CSS Design System.
- **Icons**: Lucide-React.
- **Database/Auth**: Supabase (PostgreSQL).
- **Animations**: CSS Keyframes + Framer Motion (optional for complex transitions).

---
**Status**: [Phase 1 Complete] Asset renaming and data mapping finished.
**Next Step**: Implementing the dynamic Product Grid and Hero sections using real data.
