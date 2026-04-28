import { motion } from 'framer-motion';

export default function CleanFactory({ size = 130 }) {
  return (
    <svg width={size} height={size * 0.95} viewBox="0 0 130 124" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bldg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a5568" />
          <stop offset="100%" stopColor="#2d3748" />
        </linearGradient>
      </defs>
      {/* ground */}
      <ellipse cx="65" cy="116" rx="58" ry="5" fill="rgba(15,25,35,0.20)" />
      {/* building */}
      <rect x="22" y="60" width="86" height="50" rx="2" fill="url(#bldg)" />
      {/* sawtooth roof */}
      <path d="M22 60 L34 52 L46 60 L58 52 L70 60 L82 52 L94 60 L106 52 L106 60 Z" fill="#718096" />
      {/* chimneys */}
      <rect x="78" y="36" width="10" height="24" rx="1" fill="#4a5568" />
      <rect x="92" y="42" width="8" height="18" rx="1" fill="#4a5568" />

      {/* black smoke */}
      {[0, 0.4, 0.8, 1.2].map((d, i) => (
        <motion.g key={i} initial={{ opacity: 0, y: 0, x: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.9, 0], y: [-5, -40, -60], x: [0, -10, -20], scale: [0.5, 1.5, 2.5] }}
          transition={{ duration: 4, delay: d, repeat: Infinity, ease: 'easeOut' }}>
          <circle cx="83" cy="30" r="8" fill="#1a202c" opacity="0.8" />
          <circle cx="89" cy="26" r="6" fill="#2d3748" opacity="0.9" />
          <circle cx="78" cy="24" r="7" fill="#4a5568" opacity="0.7" />
        </motion.g>
      ))}

      {/* windows */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={28 + i * 14} y={74} width="10" height="10" rx="1" fill="#f6e05e" />
      ))}

      {/* big NO symbol overlay (no pollution) */}
      <g transform="translate(98 34)">
        <motion.g animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ transformOrigin: '12px 12px' }}>
          <circle cx="12" cy="12" r="14" fill="#fff" stroke="#ef4444" strokeWidth="4" />
          <line x1="2" y1="22" x2="22" y2="2" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
        </motion.g>
      </g>
    </svg>
  );
}
