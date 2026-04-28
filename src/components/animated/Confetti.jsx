import { motion } from 'framer-motion';

const COLORS = ['#ec6f1c', '#1f9c5a', '#fbbf24', '#f43f5e', '#0ea5e9', '#a78bfa'];

export default function Confetti({ count = 28 }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const left = Math.random() * 100;
        const size = 6 + Math.random() * 10;
        const duration = 4 + Math.random() * 4;
        const delay = Math.random() * 6;
        const rotateEnd = (Math.random() - 0.5) * 720;
        const color = COLORS[i % COLORS.length];
        return (
          <motion.span
            key={i}
            className="absolute block"
            style={{
              left: `${left}%`,
              top: '-20px',
              width: size,
              height: size * 0.6,
              background: color,
              borderRadius: 2,
            }}
            initial={{ y: -20, opacity: 0, rotate: 0 }}
            animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: rotateEnd }}
            transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
          />
        );
      })}
    </div>
  );
}
