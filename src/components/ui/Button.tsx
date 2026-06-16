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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    // Solid buttons get the animated water-flow background; transparent "ghost"
    // buttons stay clean.
    const showWater = variant !== "ghost";

    return (
      <button
        ref={ref}
        className={cn(
          "relative isolate overflow-hidden",
          "inline-flex items-center justify-center gap-2 font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-glow/60",
          "disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {showWater && (
          <>
            {/* Light glowing up from beneath, then the flowing water over it. */}
            <span className="btn-underlight" aria-hidden />
            <span className="btn-water" aria-hidden />
          </>
        )}
        {/* The label always sits above the water and stays fully readable. */}
        <span className="relative z-10 inline-flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    );
  },
);
Button.displayName = "Button";
