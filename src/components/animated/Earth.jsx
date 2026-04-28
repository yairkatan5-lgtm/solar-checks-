import { motion } from 'framer-motion';

export default function Earth({ size = 200 }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* glow */}
      <div className="absolute inset-0 -z-10 rounded-full blob bg-brand-green-300" />
      <motion.svg
        width={size} height={size} viewBox="0 0 200 200"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        <defs>
          <radialGradient id="ocean" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="60%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#075985" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="92" fill="url(#ocean)" />
        {/* Continents — abstract organic blobs */}
        <g fill="#1f9c5a">
          <path d="M40 70 q15 -20 35 -8 q12 8 6 22 q-8 18 -28 14 q-22 -4 -13 -28 z" />
          <path d="M100 50 q22 -8 30 10 q4 16 -10 24 q-18 8 -28 -8 q-10 -16 8 -26 z" />
          <path d="M58 130 q14 -10 28 -2 q14 12 4 26 q-14 14 -28 4 q-14 -14 -4 -28 z" />
          <path d="M126 116 q22 -4 30 18 q8 22 -10 28 q-22 6 -28 -10 q-6 -22 8 -36 z" />
        </g>
        {/* clouds */}
        <g fill="#ffffff" opacity="0.65">
          <ellipse cx="50" cy="40" rx="12" ry="4" />
          <ellipse cx="150" cy="60" rx="14" ry="4" />
          <ellipse cx="80" cy="170" rx="14" ry="4" />
        </g>
      </motion.svg>

      {/* orbiting hearts/leaves */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: -360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      >
        <span className="absolute" style={{ top: -8, left: '50%', transform: 'translateX(-50%)' }}>
          <Leaf />
        </span>
      </motion.div>
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        <span className="absolute" style={{ bottom: -6, left: '50%', transform: 'translateX(-50%)' }}>
          <Sparkle />
        </span>
      </motion.div>
    </div>
  );
}

function Leaf() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28">
      <path d="M2 18 q6 -16 24 -10 q-2 18 -24 10 z" fill="#1f9c5a" />
      <path d="M4 18 q8 -8 22 -10" stroke="#0e5230" strokeWidth="1" fill="none" />
    </svg>
  );
}

function Sparkle() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22">
      <path d="M11 1 L13 9 L21 11 L13 13 L11 21 L9 13 L1 11 L9 9 Z" fill="#fbbf24" />
    </svg>
  );
}
