import { motion } from 'framer-motion';

const PALETTE = [
  { body: '#ec6f1c', dark: '#a64612' },
  { body: '#1f9c5a', dark: '#0e5230' },
  { body: '#0ea5e9', dark: '#075985' },
  { body: '#f43f5e', dark: '#9f1239' },
  { body: '#a78bfa', dark: '#5b21b6' },
];

export function Car({ color = PALETTE[0], size = 56, withFace = false }) {
  const w = size, h = size * 0.55;
  return (
    <svg width={w} height={h} viewBox="0 0 100 55" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`g-${color.body}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color.body} />
          <stop offset="100%" stopColor={color.dark} />
        </linearGradient>
      </defs>
      {/* shadow */}
      <ellipse cx="50" cy="50" rx="40" ry="3" fill="rgba(15,25,35,0.18)" />
      {/* body */}
      <path d="M6 40 q0 -4 4 -5 l12 -2 q4 -10 14 -12 h22 q10 2 14 12 l12 2 q4 1 4 5 v6 q0 3 -3 3 H9 q-3 0 -3 -3 z"
        fill={`url(#g-${color.body})`} stroke={color.dark} strokeWidth="1.2" />
      {/* windows */}
      <path d="M30 25 q3 -8 10 -9 h20 q7 1 10 9 l-4 4 H34 z" fill="#dbeafe" stroke="#0f1923" strokeOpacity="0.18" strokeWidth="0.8" />
      <line x1="50" y1="20" x2="50" y2="29" stroke="#0f1923" strokeOpacity="0.25" strokeWidth="0.8" />
      {/* headlight */}
      <circle cx="11" cy="38" r="2.2" fill="#fde68a" />
      <circle cx="89" cy="38" r="2.2" fill="#ef4444" />
      {/* face */}
      {withFace && (
        <g>
          <circle cx="42" cy="22" r="1.6" fill="#0f1923" />
          <circle cx="58" cy="22" r="1.6" fill="#0f1923" />
          <path d="M42 27 Q50 32 58 27" stroke="#0f1923" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </g>
      )}
      {/* wheels */}
      <Wheel cx={26} cy={48} />
      <Wheel cx={74} cy={48} />
    </svg>
  );
}

function Wheel({ cx, cy }) {
  return (
    <g>
      <motion.g
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, ease: 'linear', duration: 0.7 }}
      >
        <circle cx={cx} cy={cy} r={6.5} fill="#0f1923" />
        <circle cx={cx} cy={cy} r={3} fill="#5b6a7a" />
        <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} stroke="#9aa6b5" strokeWidth="1" />
        <line x1={cx} y1={cy - 5} x2={cx} y2={cy + 5} stroke="#9aa6b5" strokeWidth="1" />
      </motion.g>
    </g>
  );
}

export function DrivingCarsLane({ count = 3, height = 80 }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      {/* road */}
      <div className="absolute bottom-2 inset-x-0 h-1 bg-brand-ink-200/70 rounded-full" />
      <div className="absolute bottom-2 inset-x-0 h-[2px] flex justify-around">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="block w-3 h-[2px] bg-brand-ink-300/70" />
        ))}
      </div>
      {Array.from({ length: count }).map((_, i) => {
        const color = PALETTE[i % PALETTE.length];
        const duration = 6 + (i % 3);
        const delay = -i * 1.2;
        return (
          <motion.div
            key={i}
            className="absolute bottom-3"
            initial={{ x: '110%' }}
            animate={{ x: '-110%' }}
            transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
          >
            <Car color={color} size={64} withFace={i === 0} />
          </motion.div>
        );
      })}
    </div>
  );
}
