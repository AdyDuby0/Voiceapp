"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

// Shown when someone opens a room link directly and hasn't picked a name yet.
export function NamePrompt({
  code,
  onSubmit,
}: {
  code: string;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onSubmit(trimmed);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-ink-800/70 p-6 shadow-2xl shadow-black/40 backdrop-blur"
      >
        <h1 className="text-lg font-semibold text-white">Join room</h1>
        <p className="mb-5 mt-1 text-sm text-slate-400">
          You&apos;re joining{" "}
          <span className="font-mono tracking-widest text-accent-glow">
            {code}
          </span>
          . What should we call you?
        </p>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Display name"
          maxLength={24}
          autoFocus
        />
        <Button type="submit" size="lg" className="mt-4 w-full">
          Join
        </Button>
      </form>
    </main>
  );
}
