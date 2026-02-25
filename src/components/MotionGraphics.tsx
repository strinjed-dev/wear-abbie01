"use client";

import React, { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

export default function MotionGraphics() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // A subtle floating particle effect, without heavy JS libraries.
        const container = containerRef.current;
        if (!container) return;

        let particles: HTMLDivElement[] = [];
        const colors = ["#D4AF37", "#fdfbf7", "#3E2723"];

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement("div");
            particle.className = "absolute rounded-full opacity-0 pointer-events-none";
            const size = Math.random() * 6 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${80 + Math.random() * 20}%`;
            particle.style.boxShadow = "0 0 10px rgba(212, 175, 55, 0.4)";

            const duration = 2 + Math.random() * 3;
            const delay = Math.random() * 2;

            particle.style.animation = `spray ${duration}s ease-out ${delay}s infinite`;

            container.appendChild(particle);
            particles.push(particle);
        }

        return () => {
            particles.forEach(p => p.remove());
        };
    }, []);

    return (
        <div className="relative w-full h-48 md:h-64 overflow-hidden rounded-[30px] md:rounded-[60px] bg-gradient-to-t from-zinc-50 to-white border border-zinc-100 shadow-inner mt-8 md:mt-16 flex items-center justify-center group overflow-hidden">
            <div ref={containerRef} className="absolute inset-0 z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center p-6 bg-white/40 backdrop-blur-md rounded-[20px] shadow-sm border border-white/60 transform transition-transform duration-700 hover:scale-105">
                <Sparkles className="w-8 h-8 text-[#D4AF37] mb-3 animate-pulse" />
                <h4 className="text-xl md:text-2xl font-serif font-black text-zinc-900 mb-2">The Exquisite Spray</h4>
                <p className="text-xs md:text-sm text-zinc-500 max-w-xs font-medium leading-relaxed">
                    Watch the delicate notes of Wear Abbie unfold, a symphony of scent designed for royalty.
                </p>
            </div>

            <style jsx global>{`
        @keyframes spray {
          0% {
            transform: translateY(0) scale(0.5) rotate(0deg);
            opacity: 0;
          }
          20% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-150px) scale(1.5) rotate(180deg);
            opacity: 0;
          }
        }
      `}</style>
        </div>
    );
}
