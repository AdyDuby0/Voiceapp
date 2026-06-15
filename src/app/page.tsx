import { Mic, MessagesSquare, Link2 } from "lucide-react";
import { JoinForm } from "@/components/JoinForm";
import { Footer } from "@/components/Footer";
import { AccountButton } from "@/components/auth/AccountButton";
import { MessagesButton } from "@/components/dm/MessagesButton";

function Feature({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent-glow">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400">{children}</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Account + messages controls, top-right. The rest of the page is unchanged. */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <MessagesButton />
        <AccountButton />
      </div>

      {/* The hero fills almost the whole screen, leaving only a thin sliver of
          the footer peeking at the bottom to invite scrolling. */}
      <main className="relative mx-auto flex min-h-[calc(100svh-1.75rem)] max-w-5xl flex-col items-center justify-center gap-12 px-6 py-16 lg:flex-row lg:gap-20">
      <section className="max-w-md">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          No install · No account
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Talk together,
          <span className="bg-gradient-to-r from-accent-soft to-accent-glow bg-clip-text text-transparent">
            {" "}
            instantly
          </span>
          .
        </h1>
        <p className="mt-4 text-lg text-slate-400">
          A friendlier alternative to Discord and TeamSpeak. Spin up a room,
          share the link, and you&apos;re talking — with clean design and
          rock-solid voice.
        </p>

        <div className="mt-8 flex flex-col gap-5">
          <Feature icon={<Mic size={18} />} title="Crystal-clear voice">
            Low-latency group audio with a clear &ldquo;who&apos;s
            speaking&rdquo; indicator.
          </Feature>
          <Feature icon={<MessagesSquare size={18} />} title="Text right there">
            Chat in the same room while you talk — no context switching.
          </Feature>
          <Feature icon={<Link2 size={18} />} title="Join by link">
            Send one link. Anyone can hop in from their browser in seconds.
          </Feature>
        </div>
      </section>

      <section className="w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-ink-800/70 p-6 shadow-2xl shadow-black/40 backdrop-blur">
          <h2 className="mb-1 text-lg font-semibold text-white">Get started</h2>
          <p className="mb-5 text-sm text-slate-400">
            Pick a name, then create or join a room.
          </p>
          <JoinForm />
        </div>
      </section>
      </main>

      <Footer />
    </>
  );
}
