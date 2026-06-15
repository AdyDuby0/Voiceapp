"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn, Plus } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Avatar } from "./ui/Avatar";
import {
  generateRoomCode,
  isValidRoomCode,
  normalizeRoomCode,
} from "@/lib/roomCode";
import { rememberDisplayName } from "@/lib/displayName";
import { useAuth } from "./auth/AuthProvider";

export function JoinForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [capacity, setCapacity] = useState(""); // "" = no limit
  const [error, setError] = useState<string | null>(null);

  function go(targetCode: string) {
    // Logged-in users join as their account, so no display name is needed.
    if (!user) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        setError("Please enter a display name.");
        return;
      }
      rememberDisplayName(trimmedName);
    }
    router.push(`/room/${targetCode}`);
  }

  async function handleCreate() {
    setError(null);
    const newCode = generateRoomCode();
    // Logged-in users own the room they create (enabling capacity + kicking).
    if (user) {
      try {
        const res = await fetch("/api/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: newCode, maxParticipants: capacity || null }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Could not create the room.");
          return;
        }
      } catch {
        setError("Network error while creating the room.");
        return;
      }
    }
    go(newCode);
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
      {user ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-ink-800 px-3 py-2.5">
          <Avatar name={user.username} src={user.avatarUrl} size={32} />
          <div className="text-sm">
            <span className="text-slate-400">Joining as </span>
            <span className="font-medium text-slate-100">{user.username}</span>
          </div>
        </div>
      ) : (
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
      )}

      {user && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-ink-800 px-3 py-2 text-sm">
          <label htmlFor="capacity" className="text-slate-400">
            Room capacity
          </label>
          <select
            id="capacity"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="rounded-lg border border-white/10 bg-ink-700 px-2 py-1 text-slate-100 focus:outline-none"
          >
            <option value="">No limit</option>
            <option value="2">2 people</option>
            <option value="5">5 people</option>
            <option value="10">10 people</option>
            <option value="25">25 people</option>
          </select>
        </div>
      )}

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
