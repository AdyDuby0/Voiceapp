import { notFound } from "next/navigation";
import { RoomClient } from "@/components/RoomClient";
import { normalizeRoomCode, isValidRoomCode } from "@/lib/roomCode";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const normalized = normalizeRoomCode(code);

  if (!isValidRoomCode(normalized)) {
    notFound();
  }

  return <RoomClient code={normalized} />;
}
