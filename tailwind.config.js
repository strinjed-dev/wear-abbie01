/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                gold: "#D4AF37",
                brown: {
                    rich: "#3E2723",
                    light: "#5D4037",
                },
                grey: {
                    luxury: "#F8F8F8",
                }
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            borderRadius: {
                'pill': '9999px',
                'card': '24px',
            },
            animation: {
                'slide-in': 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            },
            keyframes: {
                slideIn: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                }
            }
        },
    },
    plugins: [],
}
