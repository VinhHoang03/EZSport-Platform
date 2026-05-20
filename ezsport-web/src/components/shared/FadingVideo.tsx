import React, { useRef, useEffect } from 'react';

const FadingVideo: React.FC<{ src: string; style?: React.CSSProperties; className?: string }> = ({ src, style, className }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const fadingOut = useRef(false);
  const raf = useRef<number | null>(null);

  const fadeTo = (target: number, ms: number) => {
    if (raf.current) cancelAnimationFrame(raf.current);
    const v = ref.current; if (!v) return;
    const start = parseFloat(v.style.opacity) || 0, t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / ms, 1);
      v.style.opacity = String(start + (target - start) * p);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  return (
    <video
      ref={ref} src={src} muted playsInline preload="auto"
      style={{ ...style, opacity: 0 }} className={className}
      onLoadedData={() => { ref.current!.play().catch(() => { }); fadeTo(1, 600); }}
      onTimeUpdate={() => {
        const v = ref.current!;
        if (!fadingOut.current && v.duration - v.currentTime <= 0.55) {
          fadingOut.current = true; fadeTo(0, 500);
        }
      }}
      onEnded={() => {
        const v = ref.current!; v.style.opacity = '0';
        setTimeout(() => { v.currentTime = 0; v.play().catch(() => { }); fadingOut.current = false; fadeTo(1, 600); }, 100);
      }}
    />
  );
};

export default FadingVideo;
