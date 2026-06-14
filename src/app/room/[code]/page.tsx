// Placeholder room screen for the M0 scaffold. Wired up to LiveKit (presence,
// voice, chat) in the next milestone.
export default async function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-sm text-slate-400">Room</p>
        <p className="font-mono text-3xl tracking-widest text-white">{code}</p>
        <p className="mt-4 text-sm text-slate-500">
          Voice &amp; chat coming online…
        </p>
      </div>
    </main>
  );
}
