"use client";

import { useEffect, useRef } from "react";

// Number of nodes in the trailing comet tail.
const TRAIL = 16;
// Easing per node: lower = longer, lazier trail.
const EASE = 0.32;

// A flowing "trail of light" that streams behind the cursor with a watery tint.
// It renders at z-index -1 (just above the page background, behind all content)
// so it stays hidden behind buttons and cards. Pointer-events-none; hidden on
// touch / reduced-motion via CSS.
export function CursorGlow() {
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const target = { x: -9999, y: -9999 };
    const pts = Array.from({ length: TRAIL }, () => ({ x: -9999, y: -9999 }));
    let shown = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      shown = true;
    };

    const onLeave = () => {
      shown = false;
      nodeRefs.current.forEach((el) => el && (el.style.opacity = "0"));
    };

    const tick = () => {
      // Each node eases toward the one ahead of it, forming a flowing tail.
      let prevX = target.x;
      let prevY = target.y;
      for (let i = 0; i < TRAIL; i++) {
        const p = pts[i];
        p.x += (prevX - p.x) * EASE;
        p.y += (prevY - p.y) * EASE;
        const el = nodeRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
          el.style.opacity = shown ? String((1 - i / TRAIL) * 0.5) : "0";
        }
        prevX = p.x;
        prevY = p.y;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      {Array.from({ length: TRAIL }).map((_, i) => {
        // Taper the size from head to tail.
        const size = 26 - (i / TRAIL) * 18;
        return (
          <div
            key={i}
            ref={(el) => {
              nodeRefs.current[i] = el;
            }}
            className="cursor-trail"
            style={{ width: `${size}px`, height: `${size}px` }}
            aria-hidden
          />
        );
      })}
    </>
  );
}
