"use client";

import { useState } from "react";
import { X, Sparkles } from "lucide-react";

// Changelog shown behind a button on the landing page. Add new entries at the top.
const ENTRIES: { date: string; items: string[] }[] = [
  {
    date: "June 2026",
    items: [
      "Accounts: sign up with a username and password.",
      "Profile pictures you can upload and change.",
      "Direct messages between friends (with friend requests).",
      "Logged-in users show their name and picture in rooms.",
      "Room capacity limits and creator-only moderation (kick).",
      "Privacy Policy, Terms, and a support contact.",
    ],
  },
  {
    date: "Launch",
    items: [
      "Voice rooms you can join by link — no install.",
      "In-room text chat and a live who's-speaking indicator.",
      "Mute and push-to-talk controls.",
    ],
  },
];

export function UpdateLog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-ink-800/70 px-3 text-sm text-slate-300 backdrop-blur transition-colors hover:bg-ink-700 hover:text-white"
        title="What's new"
      >
        <Sparkles size={15} />
        Updates
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-ink-800 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Sparkles size={18} className="text-accent-glow" />
                What&apos;s new
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 transition-colors hover:text-white"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {ENTRIES.map((entry) => (
                <div key={entry.date}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {entry.date}
                  </p>
                  <ul className="space-y-1.5">
                    {entry.items.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-300">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent-glow" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
