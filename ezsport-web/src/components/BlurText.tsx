import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { G } from '../utils/theme';

const BlurText: React.FC<{ text: string; style?: React.CSSProperties; greenWords?: string[] }> = ({ text, style, greenWords = [] }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ display: 'flex', flexWrap: 'wrap', gap: '0 0.25em', ...style }}>
      {text.split(' ').map((w, i) => (
        <motion.span key={i}
          initial={{ filter: 'blur(12px)', opacity: 0, y: 40 }}
          animate={visible ? { filter: 'blur(0px)', opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: 'easeOut', delay: i * 0.08 }}
          style={{ display: 'inline-block', color: greenWords.includes(w) ? G : 'inherit' }}
        >{w}</motion.span>
      ))}
    </div>
  );
};

export default BlurText;
