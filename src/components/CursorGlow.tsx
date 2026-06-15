"use client";

import { useEffect, useRef } from "react";

// A soft glow that follows the cursor, with a subtle backdrop "lens" distortion.
// Fixed, pointer-events-none overlay — purely decorative. Hidden on touch
// devices via CSS (@media hover: none).
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let shown = false;

    const onMove = (e: MouseEvent) => {
      if (!shown) {
        el.style.opacity = "1";
        shown = true;
      }
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      });
    };

    const onLeave = () => {
      el.style.opacity = "0";
      shown = false;
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} className="cursor-glow" aria-hidden />;
}
