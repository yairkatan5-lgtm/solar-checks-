import { motion } from 'framer-motion';

export default function SmilingTree({ size = 120, delay = 0, withFace = true }) {
  return (
    <motion.svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 120 140"
      initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ duration: 0.7, delay, type: 'spring', bounce: 0.45 }}
    >
      <defs>
        <radialGradient id={`leafg-${delay}`} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#6fcb91" />
          <stop offset="60%" stopColor="#1f9c5a" />
          <stop offset="100%" stopColor="#0e5230" />
        </radialGradient>
        <linearGradient id={`trunkg-${delay}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9a6b3a" />
          <stop offset="100%" stopColor="#6b4423" />
        </linearGradient>
      </defs>

      {/* trunk */}
      <rect x="54" y="86" width="12" height="38" rx="3" fill={`url(#trunkg-${delay})`} />
      <path d="M60 96 q-5 -3 -10 -3" stroke="#6b4423" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M60 104 q5 -3 10 -3" stroke="#6b4423" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* foliage cluster - sways */}
      <motion.g
        style={{ transformOrigin: '60px 60px' }}
        animate={{ rotate: [-3, 3, -3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <circle cx="60" cy="60" r="38" fill={`url(#leafg-${delay})`} />
        <circle cx="38" cy="50" r="22" fill="#3fb371" opacity="0.95" />
        <circle cx="82" cy="50" r="22" fill="#3fb371" opacity="0.95" />
        <circle cx="60" cy="32" r="22" fill="#6fcb91" opacity="0.95" />
        {withFace && (
          <g>
            <circle cx="50" cy="58" r="3" fill="#0f1923" />
            <circle cx="70" cy="58" r="3" fill="#0f1923" />
            {/* cheeks */}
            <circle cx="46" cy="68" r="3.5" fill="#fb8732" opacity="0.55" />
            <circle cx="74" cy="68" r="3.5" fill="#fb8732" opacity="0.55" />
            {/* smile */}
            <path d="M50 68 Q60 78 70 68" stroke="#0f1923" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </g>
        )}
      </motion.g>

      {/* tiny falling leaf */}
      <motion.path
        d="M22 30 q4 -6 10 -2 q-4 6 -10 2 z"
        fill="#1f9c5a"
        initial={{ x: 0, y: 0, opacity: 0 }}
        animate={{ x: [-2, 4, -2], y: [0, 80, 90], opacity: [0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: delay + 1.4 }}
      />
    </motion.svg>
  );
}
