import { forwardRef } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-accent hover:bg-accent-soft text-white shadow-lg shadow-accent/20",
  secondary:
    "bg-ink-600 hover:bg-ink-500 text-slate-100 border border-white/5",
  ghost: "bg-transparent hover:bg-white/5 text-slate-300",
  danger: "bg-red-500/90 hover:bg-red-500 text-white",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-xl",
};

// Emit a "water" ripple from the click point. Respects reduced-motion.
function spawnRipple(e: React.PointerEvent<HTMLButtonElement>) {
  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }
  const button = e.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const circle = document.createElement("span");
  circle.className = "ripple";
  circle.style.width = circle.style.height = `${size}px`;
  circle.style.left = `${e.clientX - rect.left - size / 2}px`;
  circle.style.top = `${e.clientY - rect.top - size / 2}px`;
  button.appendChild(circle);
  circle.addEventListener("animationend", () => circle.remove());
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, onPointerDown, ...props }, ref) => {
    return (
      <button
        ref={ref}
        onPointerDown={(e) => {
          spawnRipple(e);
          onPointerDown?.(e);
        }}
        className={cn(
          "relative overflow-hidden",
          "inline-flex items-center justify-center gap-2 font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-glow/60",
          "disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
