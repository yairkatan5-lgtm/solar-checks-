import { motion } from 'framer-motion';

export default function HappyHouse({ size = 120 }) {
  return (
    <svg width={size} height={size * 1.05} viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff5ec" />
          <stop offset="100%" stopColor="#ffe5cf" />
        </linearGradient>
        <linearGradient id="roofG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ec6f1c" />
          <stop offset="100%" stopColor="#a64612" />
        </linearGradient>
        <linearGradient id="panelG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <radialGradient id="windowG" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#fb8732" />
        </radialGradient>
      </defs>

      {/* ground */}
      <ellipse cx="60" cy="120" rx="46" ry="5" fill="rgba(15,25,35,0.10)" />

      {/* body */}
      <rect x="22" y="60" width="76" height="52" rx="4" fill="url(#wallG)" stroke="#ec6f1c" strokeOpacity="0.3" />
      {/* roof */}
      <path d="M16 60 L60 28 L104 60 Z" fill="url(#roofG)" />
      {/* solar panels on roof */}
      <g transform="translate(34 36) rotate(-36)">
        <rect width="22" height="14" rx="1" fill="url(#panelG)" />
        <line x1="0" y1="7" x2="22" y2="7" stroke="#0f1923" strokeOpacity="0.35" />
        <line x1="11" y1="0" x2="11" y2="14" stroke="#0f1923" strokeOpacity="0.35" />
      </g>
      <g transform="translate(64 36) rotate(36)">
        <rect width="22" height="14" rx="1" fill="url(#panelG)" />
        <line x1="0" y1="7" x2="22" y2="7" stroke="#0f1923" strokeOpacity="0.35" />
        <line x1="11" y1="0" x2="11" y2="14" stroke="#0f1923" strokeOpacity="0.35" />
      </g>

      {/* glowing windows */}
      <motion.rect
        x="32" y="74" width="20" height="20" rx="3" fill="url(#windowG)"
        animate={{ opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.rect
        x="68" y="74" width="20" height="20" rx="3" fill="url(#windowG)"
        animate={{ opacity: [1, 0.85, 1] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* window frames */}
      <line x1="42" y1="74" x2="42" y2="94" stroke="#0f1923" strokeOpacity="0.35" />
      <line x1="32" y1="84" x2="52" y2="84" stroke="#0f1923" strokeOpacity="0.35" />
      <line x1="78" y1="74" x2="78" y2="94" stroke="#0f1923" strokeOpacity="0.35" />
      <line x1="68" y1="84" x2="88" y2="84" stroke="#0f1923" strokeOpacity="0.35" />

      {/* door */}
      <rect x="54" y="92" width="12" height="20" rx="1.5" fill="#1f9c5a" />
      <circle cx="63" cy="103" r="0.9" fill="#fde68a" />

      {/* smiling face on the wall (cute) */}
      <g transform="translate(60 60)">
        <circle cx="-12" cy="-4" r="1.6" fill="#0f1923" />
        <circle cx="12" cy="-4" r="1.6" fill="#0f1923" />
        <circle cx="-14" cy="3" r="2.2" fill="#fb8732" opacity="0.55" />
        <circle cx="14" cy="3" r="2.2" fill="#fb8732" opacity="0.55" />
        <path d="M-10 4 Q0 11 10 4" stroke="#0f1923" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </g>

      {/* sun rays from the side */}
      <motion.g
        style={{ transformOrigin: '108px 18px' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        <circle cx="108" cy="18" r="8" fill="#fde68a" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line
            key={a}
            x1={108 + Math.cos((a * Math.PI) / 180) * 12}
            y1={18 + Math.sin((a * Math.PI) / 180) * 12}
            x2={108 + Math.cos((a * Math.PI) / 180) * 18}
            y2={18 + Math.sin((a * Math.PI) / 180) * 18}
            stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round"
          />
        ))}
      </motion.g>

      {/* energy bolt floating from panels */}
      <motion.path
        d="M58 50 L54 58 L60 58 L56 66"
        stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" fill="none"
        animate={{ opacity: [0, 1, 0], y: [-2, -10, -16] }}
        transition={{ duration: 2.2, repeat: Infinity, delay: 0.5 }}
      />
    </svg>
  );
}
