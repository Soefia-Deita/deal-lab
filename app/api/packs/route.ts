import { NextResponse } from "next/server";
import { createPack, type CreatePackInput } from "@/lib/pack";
import { insertPack, listPacks } from "@/lib/db";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

function token(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

export async function GET() {
  const packs = await listPacks();
  return NextResponse.json(packs);
}

export async function POST(req: Request) {
  const input = (await req.json()) as CreatePackInput;
  if (!input?.company?.trim() || !input?.participants?.length) {
    return NextResponse.json({ error: "Missing company or participants" }, { status: 400 });
  }
  const id = `${slugify(input.company) || "prospect"}-${token()}`;
  const pack = createPack(input, new Date().toISOString(), id);
  await insertPack(pack);
  return NextResponse.json(pack, { status: 201 });
}
