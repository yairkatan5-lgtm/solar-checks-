import { motion } from 'framer-motion';

export default function ChargingPhone({ size = 100 }) {
  return (
    <svg width={size} height={size * 1.6} viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="phoneBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a3441" />
          <stop offset="100%" stopColor="#0f1923" />
        </linearGradient>
        <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff5ec" />
          <stop offset="100%" stopColor="#ffe5cf" />
        </linearGradient>
      </defs>
      {/* phone body */}
      <rect x="14" y="12" width="72" height="136" rx="14" fill="url(#phoneBody)" />
      {/* screen */}
      <rect x="20" y="22" width="60" height="116" rx="8" fill="url(#screen)" />
      {/* notch */}
      <rect x="40" y="24" width="20" height="3" rx="1.5" fill="#0f1923" opacity="0.45" />

      {/* battery icon shape */}
      <g transform="translate(34 50)">
        <rect width="32" height="58" rx="6" fill="#fff" stroke="#0f1923" strokeOpacity="0.15" />
        <rect x="11" y="-4" width="10" height="4" rx="1" fill="#0f1923" opacity="0.3" />
        {/* fill clip */}
        <clipPath id="bclip"><rect x="2" y="2" width="28" height="54" rx="4" /></clipPath>
        <motion.rect
          x="2" width="28" rx="4"
          clipPath="url(#bclip)"
          fill="#1f9c5a"
          initial={{ y: 56, height: 0 }}
          animate={{ y: [56, 2], height: [0, 54] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* bolt */}
        <motion.path
          d="M18 14 L10 32 L18 32 L14 46"
          stroke="#fde68a" strokeWidth="3" strokeLinecap="round" fill="none"
          animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.1, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '15px 30px' }}
        />
      </g>

      {/* tiny sparkles around */}
      {[
        { cx: 8, cy: 30, d: 0 },
        { cx: 92, cy: 40, d: 0.4 },
        { cx: 6, cy: 110, d: 0.8 },
        { cx: 94, cy: 120, d: 1.2 },
      ].map((s, i) => (
        <motion.circle
          key={i} cx={s.cx} cy={s.cy} r="2.2" fill="#fbbf24"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: s.d }}
        />
      ))}
    </svg>
  );
}
