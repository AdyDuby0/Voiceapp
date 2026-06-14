"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn, Plus } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import {
  generateRoomCode,
  isValidRoomCode,
  normalizeRoomCode,
} from "@/lib/roomCode";
import { rememberDisplayName } from "@/lib/displayName";

export function JoinForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function go(targetCode: string) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter a display name.");
      return;
    }
    rememberDisplayName(trimmedName);
    router.push(`/room/${targetCode}`);
  }

  function handleCreate() {
    setError(null);
    go(generateRoomCode());
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const normalized = normalizeRoomCode(code);
    if (!isValidRoomCode(normalized)) {
      setError("Enter a valid room code (4–12 letters/numbers).");
      return;
    }
    go(normalized);
  }

  return (
    <form onSubmit={handleJoin} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-400">
          Your display name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Alex"
          maxLength={24}
          autoFocus
        />
      </div>

      <Button type="button" size="lg" onClick={handleCreate}>
        <Plus size={18} />
        Create a new room
      </Button>

      <div className="flex items-center gap-3 py-1 text-xs text-slate-500">
        <span className="h-px flex-1 bg-white/10" />
        or join an existing one
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(normalizeRoomCode(e.target.value))}
          placeholder="Room code"
          className="font-mono tracking-widest uppercase"
          maxLength={12}
        />
        <Button type="submit" variant="secondary" size="lg" className="shrink-0">
          <LogIn size={18} />
          Join
        </Button>
      </div>

      {error && (
        <p className="animate-fade-in text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
