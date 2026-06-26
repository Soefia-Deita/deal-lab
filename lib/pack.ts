// Pure pack construction + mutation logic — safe to import on both the server
// (API routes) and the client (form defaults). No browser or DB dependencies.

import type { InitiativeType, Participant, ProofPack } from "./types";
import { STARTING_FREE_CREDITS, CREDITS_PER_SHARE } from "./types";
import { assessmentNameFor, getInitiative, getSkillPack } from "./skills";
import { generateScores } from "./generate";
import { shortId, slugify } from "./utils";

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

export const DEMO_PACK_ID = "acme-demo";

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

/** Build a ProofPack. `id` is supplied by the caller (server generates a token). */
export function createPack(input: CreatePackInput, createdAt: string, id: string): ProofPack {
  const initiative = getInitiative(input.initiative);
  const skills = getSkillPack(input.initiative);
  const participants = buildParticipants(input.participants);
  const scores = generateScores(participants, skills);

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

/** The pre-seeded sample pack, always available so any link works cold. */
export function buildDemoPack(): ProofPack {
  const pack = createPack(defaultDemoInput(), "2026-06-23T16:20:00.000Z", DEMO_PACK_ID);
  pack.participants = pack.participants.map((p) => ({ ...p, status: "completed" }));
  pack.reportViews = 2;
  return pack;
}

// ── Pure mutators (server applies these to the stored JSON) ─────────────
export function applyParticipantComplete(p: ProofPack, participantId: string): ProofPack {
  return {
    ...p,
    participants: p.participants.map((pt) =>
      pt.id === participantId ? { ...pt, status: "completed" } : pt
    ),
  };
}

export function applyAllComplete(p: ProofPack): ProofPack {
  return { ...p, participants: p.participants.map((pt) => ({ ...pt, status: "completed" as const })) };
}

export function applyReportView(p: ProofPack): ProofPack {
  return { ...p, reportViews: p.reportViews + 1 };
}

export function applyShare(p: ProofPack, sharedWith: string, at: string): ProofPack {
  return {
    ...p,
    freeCreditsRemaining: p.freeCreditsRemaining + CREDITS_PER_SHARE,
    shares: [
      ...p.shares,
      { id: shortId(sharedWith + at), sharedWith, at, creditsUnlocked: CREDITS_PER_SHARE },
    ],
  };
}
