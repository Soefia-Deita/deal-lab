"use client";

import { useSyncExternalStore } from "react";
import type { InitiativeType, Participant, ProofPack } from "./types";
import { STARTING_FREE_CREDITS, CREDITS_PER_SHARE } from "./types";
import { assessmentNameFor, getInitiative, getSkillPack } from "./skills";
import { generateScores } from "./generate";
import { shortId, slugify } from "./utils";

const KEY = "soefia-deal-lab:packs:v1";
const EVENT = "dl-store-change";

export interface CreatePackInput {
  company: string;
  buyerName: string;
  buyerRole: string;
  initiative: InitiativeType;
  teamSize: number;
  businessQuestion: string;
  notes?: string;
  participants: { name: string; email: string }[];
}

// ── Cached external store ──────────────────────────────────────────────
// useSyncExternalStore requires getSnapshot to return a stable reference
// while the store is unchanged, so we cache the parsed map + derived list
// and only swap references on writes.
let mapCache: Record<string, ProofPack> | null = null;
let listCache: ProofPack[] | null = null;
const EMPTY_LIST: ProofPack[] = [];

function readRaw(): Record<string, ProofPack> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, ProofPack>) : {};
  } catch {
    return {};
  }
}

function getMap(): Record<string, ProofPack> {
  if (!mapCache) mapCache = readRaw();
  return mapCache;
}

function getList(): ProofPack[] {
  if (typeof window === "undefined") return EMPTY_LIST;
  if (!listCache) {
    listCache = Object.values(getMap()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return listCache;
}

/** Persist a new map reference and notify subscribers. */
function commit(map: Record<string, ProofPack>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(map));
  mapCache = map;
  listCache = null;
  window.dispatchEvent(new CustomEvent(EVENT));
}

function invalidate() {
  mapCache = null;
  listCache = null;
}

// ── Pack construction ──────────────────────────────────────────────────
function buildParticipants(rows: { name: string; email: string }[]): Participant[] {
  return rows
    .filter((r) => r.name.trim().length > 0)
    .map((r, i) => ({
      id: shortId(`${r.name}:${r.email}:${i}`),
      name: r.name.trim(),
      email: r.email.trim() || `${slugify(r.name)}@example.com`,
      status: "invited" as const,
    }));
}

export function createPack(input: CreatePackInput, createdAt: string): ProofPack {
  const initiative = getInitiative(input.initiative);
  const skills = getSkillPack(input.initiative);
  const participants = buildParticipants(input.participants);
  const scores = generateScores(participants, skills);
  const id = `${slugify(input.company) || "prospect"}-${shortId(
    input.company + input.buyerName + input.initiative + createdAt
  )}`;

  return {
    id,
    createdAt,
    prospect: {
      company: input.company.trim(),
      buyerName: input.buyerName.trim(),
      buyerRole: input.buyerRole.trim(),
      teamSize: input.teamSize,
      businessQuestion: input.businessQuestion.trim(),
      notes: input.notes?.trim() || undefined,
    },
    initiative: input.initiative,
    title: `${input.company.trim()} · ${initiative.label} Checkup`,
    assessmentName: assessmentNameFor(input.initiative),
    skills,
    participants,
    scores,
    reportViews: 0,
    shares: [],
    freeCreditsRemaining: STARTING_FREE_CREDITS,
  };
}

export function savePack(pack: ProofPack) {
  commit({ ...getMap(), [pack.id]: pack });
}

// ── Seeded demo pack (always available so any link works cold) ──────────
export const DEMO_PACK_ID = "acme-demo";

export function defaultDemoInput(): CreatePackInput {
  return {
    company: "Acme Health",
    buyerName: "Jordan Rivera",
    buyerRole: "VP Operations",
    initiative: "ai-implementation",
    teamSize: 5,
    businessQuestion:
      "Who on this team can lead our AI rollout, and what skill gaps put the rollout at risk?",
    notes:
      "Eval underway. CFO skeptical on ROI and wants proof the team can actually execute before approving spend. Rollout targeted for next quarter.",
    participants: [
      { name: "Dana Whitfield", email: "dana.whitfield@acmehealth.com" },
      { name: "Marcus Lee", email: "marcus.lee@acmehealth.com" },
      { name: "Priya Nair", email: "priya.nair@acmehealth.com" },
      { name: "Tom Alvarez", email: "tom.alvarez@acmehealth.com" },
      { name: "Sarah Kim", email: "sarah.kim@acmehealth.com" },
    ],
  };
}

function buildDemoPack(): ProofPack {
  const pack = createPack(defaultDemoInput(), "2026-06-23T16:20:00.000Z");
  pack.id = DEMO_PACK_ID;
  pack.participants = pack.participants.map((p) => ({ ...p, status: "completed" }));
  pack.reportViews = 2;
  return pack;
}

export function ensureSeed() {
  if (typeof window === "undefined") return;
  const map = getMap();
  if (!map[DEMO_PACK_ID]) commit({ ...map, [DEMO_PACK_ID]: buildDemoPack() });
}

// ── Reads ──────────────────────────────────────────────────────────────
export function getPack(id: string): ProofPack | null {
  return getMap()[id] ?? null;
}

export function listPacks(): ProofPack[] {
  return getList();
}

// ── Mutations ──────────────────────────────────────────────────────────
export function mutatePack(id: string, fn: (p: ProofPack) => ProofPack) {
  const cur = getMap()[id];
  if (!cur) return;
  commit({ ...getMap(), [id]: fn(cur) });
}

export function markParticipantComplete(id: string, participantId: string) {
  mutatePack(id, (p) => ({
    ...p,
    participants: p.participants.map((pt) =>
      pt.id === participantId ? { ...pt, status: "completed" } : pt
    ),
  }));
}

export function markAllComplete(id: string) {
  mutatePack(id, (p) => ({
    ...p,
    participants: p.participants.map((pt) => ({ ...pt, status: "completed" as const })),
  }));
}

export function recordReportView(id: string) {
  mutatePack(id, (p) => ({ ...p, reportViews: p.reportViews + 1 }));
}

export function recordShare(id: string, sharedWith: string, at: string) {
  mutatePack(id, (p) => ({
    ...p,
    freeCreditsRemaining: p.freeCreditsRemaining + CREDITS_PER_SHARE,
    shares: [
      ...p.shares,
      { id: shortId(sharedWith + at), sharedWith, at, creditsUnlocked: CREDITS_PER_SHARE },
    ],
  }));
}

// ── React bindings (useSyncExternalStore) ──────────────────────────────
function subscribe(onChange: () => void): () => void {
  ensureSeed();
  const onLocal = () => onChange();
  const onStorage = () => {
    invalidate();
    onChange();
  };
  window.addEventListener(EVENT, onLocal);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onLocal);
    window.removeEventListener("storage", onStorage);
  };
}

const noopSubscribe = () => () => {};

/** True only after client hydration — without any setState-in-effect. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

export function usePack(id: string): { pack: ProofPack | null; mounted: boolean } {
  const pack = useSyncExternalStore(
    subscribe,
    () => getPack(id),
    () => null
  );
  return { pack, mounted: useHydrated() };
}

export function usePacks(): { packs: ProofPack[]; mounted: boolean } {
  const packs = useSyncExternalStore(subscribe, getList, () => EMPTY_LIST);
  return { packs, mounted: useHydrated() };
}
