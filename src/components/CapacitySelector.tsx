"use client";

import { cn } from "./ui/cn";

// Toggle between an unlimited room and a custom participant cap. Shared by the
// create-room form and the in-room editor.
export function CapacitySelector({
  unlimited,
  setUnlimited,
  limit,
  setLimit,
}: {
  unlimited: boolean;
  setUnlimited: (v: boolean) => void;
  limit: string;
  setLimit: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex rounded-xl border border-white/10 bg-ink-700 p-1">
        <button
          type="button"
          onClick={() => setUnlimited(true)}
          className={cn(
            "flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors",
            unlimited ? "bg-accent text-white" : "text-slate-300 hover:text-white",
          )}
        >
          Unlimited
        </button>
        <button
          type="button"
          onClick={() => setUnlimited(false)}
          className={cn(
            "flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors",
            !unlimited ? "bg-accent text-white" : "text-slate-300 hover:text-white",
          )}
        >
          Custom
        </button>
      </div>

      {!unlimited && (
        <label className="flex items-center justify-between gap-2 text-sm text-slate-400">
          Max people
          <input
            type="number"
            min={2}
            max={100}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="h-9 w-20 rounded-lg border border-white/10 bg-ink-800 px-2 text-center text-slate-100 focus:border-accent-soft/60 focus:outline-none"
          />
        </label>
      )}
    </div>
  );
}
