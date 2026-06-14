import { forwardRef } from "react";
import { cn } from "./cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl bg-ink-800 px-4 text-sm text-slate-100",
          "border border-white/10 placeholder:text-slate-500",
          "focus:border-accent-soft/60 focus:outline-none focus:ring-2 focus:ring-accent-glow/30",
          "transition-colors",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
