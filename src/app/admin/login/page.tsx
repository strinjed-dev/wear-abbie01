"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [key, setKey] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (key === process.env.NEXT_PUBLIC_ADMIN_BOOTSTRAP_KEY) {
            // Simple client‑side auth – store flag in localStorage
            localStorage.setItem('isAdmin', 'true');
            router.push('/admin/dashboard');
        } else {
            alert('Invalid admin key');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
                <input
                    type="password"
                    placeholder="Bootstrap Key"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="w-full border border-gray-300 rounded-full px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
                <button
                    type="submit"
                    className="w-full bg-[#3E2723] text-white py-2 rounded-full font-black uppercase tracking-widest hover:bg-black transition"
                >
                    Sign In
                </button>
            </form>
        </div>
    );
}
