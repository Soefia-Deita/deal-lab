"use client";

// Client data layer. Reads via SWR, mutations via the /api/packs routes
// (server is the source of truth, backed by Postgres / in-memory in dev).

import useSWR, { mutate as globalMutate } from "swr";
import type { ProofPack } from "./types";
import type { CreatePackInput } from "./pack";

async function fetcher(url: string): Promise<ProofPack | ProofPack[] | null> {
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export function usePack(id: string): { pack: ProofPack | null; mounted: boolean } {
  const { data, isLoading } = useSWR(id ? `/api/packs/${id}` : null, fetcher);
  return { pack: (data as ProofPack | null) ?? null, mounted: !isLoading };
}

export function usePacks(): { packs: ProofPack[]; mounted: boolean } {
  const { data, isLoading } = useSWR(`/api/packs`, fetcher);
  return { packs: (data as ProofPack[] | undefined) ?? [], mounted: !isLoading };
}

export async function createProofPack(input: CreatePackInput): Promise<ProofPack> {
  const res = await fetch(`/api/packs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create pack");
  const pack = (await res.json()) as ProofPack;
  globalMutate(`/api/packs`);
  return pack;
}

async function patch(id: string, body: Record<string, unknown>): Promise<void> {
  const res = await fetch(`/api/packs/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.ok) {
    const updated = (await res.json()) as ProofPack;
    // Optimistically update this pack's cache, then refresh the list.
    globalMutate(`/api/packs/${id}`, updated, { revalidate: false });
    globalMutate(`/api/packs`);
  }
}

export const markParticipantComplete = (id: string, participantId: string) =>
  patch(id, { action: "complete", participantId });
export const markAllComplete = (id: string) => patch(id, { action: "completeAll" });
export const recordReportView = (id: string) => patch(id, { action: "view" });
export const recordShare = (id: string, sharedWith: string, at: string) =>
  patch(id, { action: "share", sharedWith, at });
