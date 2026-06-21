"use client";

import { useState } from "react";
import { useMediaDeviceSelect } from "@livekit/components-react";
import { Settings } from "lucide-react";

function DeviceList({
  kind,
  label,
}: {
  kind: MediaDeviceKind;
  label: string;
}) {
  const { devices, activeDeviceId, setActiveMediaDevice } =
    useMediaDeviceSelect({ kind });

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-400">
        {label}
      </span>
      <select
        value={activeDeviceId}
        onChange={(e) => setActiveMediaDevice(e.target.value)}
        className="h-9 w-full rounded-lg border border-white/10 bg-ink-700 px-2 text-sm text-slate-100 focus:outline-none"
      >
        {devices.length === 0 && <option>Default</option>}
        {devices.map((d) => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label || "Unnamed device"}
          </option>
        ))}
      </select>
    </label>
  );
}

// Gear button that opens a popover to pick the microphone and speaker.
export function DeviceSettings() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-600 text-slate-200 transition-colors hover:bg-ink-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-glow/60"
        aria-label="Audio devices"
        title="Audio devices"
      >
        <Settings size={20} />
      </button>

      {open && (
        <div className="absolute bottom-full left-1/2 mb-2 w-64 -translate-x-1/2 space-y-3 rounded-xl border border-white/10 bg-ink-800 p-3 shadow-2xl">
          <DeviceList kind="audioinput" label="Microphone" />
          <DeviceList kind="audiooutput" label="Speaker" />
        </div>
      )}
    </div>
  );
}
