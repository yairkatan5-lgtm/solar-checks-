/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Heebo"', '"Rubik"', 'system-ui', 'sans-serif'],
        display: ['"Rubik"', '"Heebo"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand: matched to green-energy.co.il
        brand: {
          green: {
            50:  '#eef9f1',
            100: '#d6f1de',
            200: '#a9e1bc',
            300: '#6fcb91',
            400: '#3fb371',
            500: '#1f9c5a',   // primary headline green
            600: '#178548',
            700: '#136a3a',
            800: '#0e5230',
            900: '#0b3d24',
          },
          orange: {
            50:  '#fff5ec',
            100: '#ffe5cf',
            200: '#ffc99d',
            300: '#ffa564',
            400: '#fb8732',
            500: '#ec6f1c',   // primary CTA orange
            600: '#d05a13',
            700: '#a64612',
            800: '#7e3713',
            900: '#5d2a13',
          },
          ink: {
            50:  '#f8f9fa',
            100: '#eef0f3',
            200: '#dde2e8',
            300: '#bcc4cf',
            500: '#5b6a7a',
            700: '#2a3441',
            900: '#0f1923',
          },
          paper: '#f6f7f4',
          cream: '#fbf9f4',
        },
      },
      boxShadow: {
        soft: '0 8px 30px -10px rgba(15,25,35,0.10)',
        pill: '0 10px 25px -8px rgba(236,111,28,0.45)',
        green: '0 10px 25px -8px rgba(31,156,90,0.40)',
        card: '0 12px 40px -16px rgba(15,25,35,0.18)',
      },
      backgroundImage: {
        'brand-arc': 'conic-gradient(from 200deg at 50% 60%, #ec6f1c, #f59e0b, #f43f5e, #6fcb91, #1f9c5a, #ec6f1c)',
        'green-soft': 'linear-gradient(135deg,#eef9f1 0%, #ffffff 100%)',
        'orange-soft': 'linear-gradient(135deg,#fff5ec 0%, #ffffff 100%)',
        'hero-light': 'radial-gradient(900px 500px at 80% -10%, rgba(236,111,28,0.18), transparent 60%), radial-gradient(900px 500px at 0% 100%, rgba(31,156,90,0.20), transparent 60%), linear-gradient(180deg,#fbf9f4 0%, #ffffff 100%)',
      },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        sway: { '0%,100%': { transform: 'rotate(-2deg)' }, '50%': { transform: 'rotate(2deg)' } },
        drive: { '0%': { transform: 'translateX(120%)' }, '100%': { transform: 'translateX(-120%)' } },
        wheel: { '0%': { transform: 'rotate(0)' }, '100%': { transform: 'rotate(-360deg)' } },
        glow: { '0%,100%': { opacity: 0.7 }, '50%': { opacity: 1 } },
        wiggle: { '0%,100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
        bounceY: { '0%,100%': { transform: 'translateY(0) scale(1)' }, '50%': { transform: 'translateY(-6px) scale(1.04)' } },
        sparkle: { '0%': { opacity: 0, transform: 'scale(0)' }, '60%': { opacity: 1, transform: 'scale(1.2)' }, '100%': { opacity: 0, transform: 'scale(0.6)' } },
        cloudFade: { '0%': { opacity: 0.65, transform: 'translateX(0)' }, '100%': { opacity: 0, transform: 'translateX(-40px)' } },
      },
      animation: {
        floaty: 'floaty 5s ease-in-out infinite',
        sway: 'sway 4s ease-in-out infinite',
        wiggle: 'wiggle 1.4s ease-in-out infinite',
        bouncy: 'bounceY 2.6s ease-in-out infinite',
        glow: 'glow 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
