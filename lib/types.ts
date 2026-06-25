// ── Core domain model for Soefia Deal Lab ──────────────────────────────
// All state is local + deterministic so the demo is fully repeatable.

export type InitiativeType =
  | "ai-implementation"
  | "reorganization"
  | "post-merger"
  | "leadership-transition"
  | "internal-mobility";

export interface InitiativeMeta {
  id: InitiativeType;
  label: string;
  /** One-line description of the initiative for rep + buyer context. */
  blurb: string;
  /** Default urgency signal for the GTM panel. */
  urgency: "High" | "Elevated" | "Moderate";
}

/** A BESSI-aligned human skill domain being assessed. */
export interface Skill {
  key: string;
  name: string;
  /** Short domain grouping, e.g. "Self-Management", "Social Engagement". */
  domain: string;
  /** Why this skill matters for the chosen initiative. */
  whyItMatters: string;
  /** Whether strength in this skill signals leadership potential. */
  leadershipSignal: boolean;
  /** Tuned baseline (0-100) used to seed a compelling, stable narrative. */
  baseline: number;
}

export interface Prospect {
  company: string;
  buyerName: string;
  buyerRole: string;
  teamSize: number;
  businessQuestion: string;
  notes?: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  /** "invited" until they complete the lightweight checkup. */
  status: "invited" | "completed";
}

/** One participant's score on one skill (0-100). */
export interface SkillScore {
  participantId: string;
  skillKey: string;
  score: number;
}

export interface SkillSummary {
  skill: Skill;
  /** Team average 0-100. */
  teamAverage: number;
  /** Best individual score. */
  topScore: number;
  /** Participant id of the top scorer. */
  topParticipantId: string;
  band: ReadinessBand;
}

export type ReadinessBand = "strong" | "moderate" | "at-risk";

export interface LeadCandidate {
  participantId: string;
  name: string;
  /** 0-100 leadership-weighted composite. */
  leadershipScore: number;
  /** Their two standout skills. */
  strengths: string[];
  rationale: string;
}

export type RecommendationKind = "build" | "hire" | "partner";

export interface Recommendation {
  kind: RecommendationKind;
  skillName: string;
  title: string;
  detail: string;
  /** Severity drives ordering + color. */
  severity: "high" | "medium" | "low";
}

export interface EvidenceSnippet {
  label: string;
  text: string;
  tone: "positive" | "watch" | "risk";
}

export interface GtmFollowUp {
  buyerPain: string;
  championAngle: string;
  anchorGap: string;
  nextMotion: string;
  emailSubject: string;
  emailBody: string;
  talkTrack: string[];
}

export interface ShareEvent {
  id: string;
  sharedWith: string;
  at: string; // ISO timestamp captured at share time
  creditsUnlocked: number;
}

export interface ProofPack {
  id: string;
  createdAt: string;
  prospect: Prospect;
  initiative: InitiativeType;
  /** Display title, e.g. "Acme Health · AI Implementation Readiness Checkup". */
  title: string;
  assessmentName: string;
  skills: Skill[];
  participants: Participant[];
  scores: SkillScore[];

  // Engagement / GTM signals (mutated as the demo progresses)
  reportViews: number;
  shares: ShareEvent[];
  freeCreditsRemaining: number;
}

/** Fully derived, render-ready report (computed from a ProofPack). */
export interface GeneratedReport {
  headline: string;
  headlineDetail: string;
  overallReadiness: number; // 0-100
  band: ReadinessBand;
  skillSummaries: SkillSummary[];
  leads: LeadCandidate[];
  risks: Recommendation[];
  buildVsHire: Recommendation[];
  /** One-line build-first vs hire-first verdict. */
  buildVerdict: string;
  evidence: EvidenceSnippet[];
  followUp: GtmFollowUp;
}

export interface QualSignal {
  label: string;
  value: string;
  tone: "positive" | "watch" | "risk" | "neutral";
}

export const CREDITS_PER_SHARE = 3;
export const STARTING_FREE_CREDITS = 6;
