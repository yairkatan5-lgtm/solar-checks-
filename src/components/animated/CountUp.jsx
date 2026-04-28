import { useEffect, useRef, useState } from 'react';

export default function CountUp({ value, duration = 1800, decimals = 0, prefix = '', suffix = '', className = '' }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const start = performance.now();
          const target = Number(value) || 0;
          const ease = (t) => 1 - Math.pow(1 - t, 3);
          const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            setN(target * ease(t));
            if (t < 1) requestAnimationFrame(tick);
            else setN(target);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  const display = decimals === 0
    ? new Intl.NumberFormat('he-IL', { maximumFractionDigits: 0 }).format(Math.round(n))
    : new Intl.NumberFormat('he-IL', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(n);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}{display}{suffix}
    </span>
  );
}
