import { NextResponse } from "next/server";
import { getPack, savePack } from "@/lib/db";
import {
  applyAllComplete,
  applyParticipantComplete,
  applyReportView,
  applyShare,
} from "@/lib/pack";
import type { ProofPack } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PatchBody {
  action: "complete" | "completeAll" | "view" | "share";
  participantId?: string;
  sharedWith?: string;
  at?: string;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pack = await getPack(id);
  if (!pack) return new NextResponse(null, { status: 404 });
  return NextResponse.json(pack);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pack = await getPack(id);
  if (!pack) return new NextResponse(null, { status: 404 });

  const body = (await req.json()) as PatchBody;
  let updated: ProofPack = pack;
  switch (body.action) {
    case "complete":
      if (body.participantId) updated = applyParticipantComplete(pack, body.participantId);
      break;
    case "completeAll":
      updated = applyAllComplete(pack);
      break;
    case "view":
      updated = applyReportView(pack);
      break;
    case "share":
      updated = applyShare(pack, body.sharedWith ?? "a colleague", body.at ?? new Date().toISOString());
      break;
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  await savePack(updated);
  return NextResponse.json(updated);
}
