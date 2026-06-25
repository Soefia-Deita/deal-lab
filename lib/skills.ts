import type { InitiativeMeta, InitiativeType, Skill } from "./types";

// ── Initiative catalog ─────────────────────────────────────────────────
export const INITIATIVES: Record<InitiativeType, InitiativeMeta> = {
  "ai-implementation": {
    id: "ai-implementation",
    label: "AI Implementation Readiness",
    blurb:
      "Rolling out AI tooling or workflows across a team that has to adopt new ways of working under uncertainty.",
    urgency: "High",
  },
  reorganization: {
    id: "reorganization",
    label: "Reorganization Readiness",
    blurb:
      "Restructuring teams, reporting lines, or operating model and need people who can lead through ambiguity.",
    urgency: "Elevated",
  },
  "post-merger": {
    id: "post-merger",
    label: "Post-Merger Integration",
    blurb:
      "Combining two orgs, cultures, and systems where alignment and trust determine whether value is realized.",
    urgency: "High",
  },
  "leadership-transition": {
    id: "leadership-transition",
    label: "Leadership Transition",
    blurb:
      "A new leader is stepping in (or up) and you need to know who can carry influence, vision, and continuity.",
    urgency: "Elevated",
  },
  "internal-mobility": {
    id: "internal-mobility",
    label: "Internal Mobility / Reduce New Hiring",
    blurb:
      "Filling capability gaps from within instead of hiring — needs learning agility and self-direction at scale.",
    urgency: "Moderate",
  },
};

export const INITIATIVE_OPTIONS = Object.values(INITIATIVES);

// ── Skill packs ────────────────────────────────────────────────────────
// Baselines (0-100) are intentionally tuned so each initiative tells a
// realistic, stable story. AI Implementation is calibrated to read as
// "strong ownership, risk in cross-functional alignment".

const AI_IMPLEMENTATION: Skill[] = [
  {
    key: "initiative-ownership",
    name: "Initiative Ownership",
    domain: "Self-Management",
    whyItMatters:
      "AI rollouts stall without owners. People who take end-to-end accountability move pilots into production.",
    leadershipSignal: true,
    baseline: 82,
  },
  {
    key: "learning-agility",
    name: "Learning Agility",
    domain: "Innovation",
    whyItMatters:
      "Tools and best practices shift monthly. Fast learners turn new capabilities into team-wide habits.",
    leadershipSignal: false,
    baseline: 78,
  },
  {
    key: "adaptability",
    name: "Adaptability",
    domain: "Emotional Resilience",
    whyItMatters:
      "AI changes workflows people rely on. Adaptable teams absorb that disruption without losing throughput.",
    leadershipSignal: false,
    baseline: 74,
  },
  {
    key: "change-leadership",
    name: "Change Leadership",
    domain: "Social Engagement",
    whyItMatters:
      "Adoption is a people problem. Change leaders bring skeptics along instead of forcing tools on them.",
    leadershipSignal: true,
    baseline: 65,
  },
  {
    key: "judgment-uncertainty",
    name: "Judgment Under Uncertainty",
    domain: "Innovation",
    whyItMatters:
      "AI gives probabilistic, sometimes wrong answers. Sound judgment decides when to trust, verify, or escalate.",
    leadershipSignal: true,
    baseline: 66,
  },
  {
    key: "responsible-ai",
    name: "Responsible AI Decision-Making",
    domain: "Cooperation",
    whyItMatters:
      "Bias, privacy, and accountability risks scale with AI. This skill keeps adoption safe and defensible.",
    leadershipSignal: true,
    baseline: 61,
  },
  {
    key: "collaboration",
    name: "Collaboration",
    domain: "Cooperation",
    whyItMatters:
      "AI value lands across functions, not in silos. Cross-functional collaboration is where most rollouts break.",
    leadershipSignal: false,
    baseline: 56,
  },
  {
    key: "communication",
    name: "Communication",
    domain: "Social Engagement",
    whyItMatters:
      "Unclear communication breeds fear and shadow workarounds. Clarity is what makes adoption stick.",
    leadershipSignal: false,
    baseline: 53,
  },
];

const REORGANIZATION: Skill[] = [
  { key: "change-leadership", name: "Change Leadership", domain: "Social Engagement", whyItMatters: "Reorgs succeed or fail on whether leaders can rally people through structural change.", leadershipSignal: true, baseline: 70 },
  { key: "adaptability", name: "Adaptability", domain: "Emotional Resilience", whyItMatters: "New roles and reporting lines demand people who flex quickly without disengaging.", leadershipSignal: false, baseline: 72 },
  { key: "initiative-ownership", name: "Initiative Ownership", domain: "Self-Management", whyItMatters: "When org charts blur, owners step in and keep critical work from falling through the cracks.", leadershipSignal: true, baseline: 75 },
  { key: "communication", name: "Communication", domain: "Social Engagement", whyItMatters: "Rumor fills any vacuum. Clear communicators keep the team focused instead of anxious.", leadershipSignal: false, baseline: 58 },
  { key: "trust-building", name: "Trust Building", domain: "Cooperation", whyItMatters: "Restructuring strains relationships. Trust builders preserve the social fabric that gets work done.", leadershipSignal: true, baseline: 55 },
  { key: "emotional-regulation", name: "Emotional Regulation", domain: "Emotional Resilience", whyItMatters: "Uncertainty spikes stress. Regulated leaders keep teams steady through the transition.", leadershipSignal: false, baseline: 63 },
  { key: "collaboration", name: "Collaboration", domain: "Cooperation", whyItMatters: "New structures require new partnerships. Collaboration determines how fast the org re-knits.", leadershipSignal: false, baseline: 60 },
];

const POST_MERGER: Skill[] = [
  { key: "trust-building", name: "Trust Building", domain: "Cooperation", whyItMatters: "Two cultures must learn to trust each other before any synergy is realized.", leadershipSignal: true, baseline: 54 },
  { key: "communication", name: "Communication", domain: "Social Engagement", whyItMatters: "Integration runs on over-communication; silence is read as threat by both sides.", leadershipSignal: false, baseline: 57 },
  { key: "collaboration", name: "Cross-Functional Collaboration", domain: "Cooperation", whyItMatters: "Value comes from teams that didn't used to work together now shipping together.", leadershipSignal: false, baseline: 52 },
  { key: "adaptability", name: "Adaptability", domain: "Emotional Resilience", whyItMatters: "Systems, processes, and norms all change at once; adaptable people absorb the shock.", leadershipSignal: false, baseline: 68 },
  { key: "change-leadership", name: "Change Leadership", domain: "Social Engagement", whyItMatters: "Someone has to make the combined entity feel like one team, not winners and losers.", leadershipSignal: true, baseline: 64 },
  { key: "conflict-resolution", name: "Conflict Resolution", domain: "Cooperation", whyItMatters: "Overlapping roles create friction; resolvers turn turf wars into shared ownership.", leadershipSignal: true, baseline: 59 },
  { key: "initiative-ownership", name: "Initiative Ownership", domain: "Self-Management", whyItMatters: "Integration plans are huge; owners keep workstreams from quietly stalling.", leadershipSignal: true, baseline: 71 },
];

const LEADERSHIP_TRANSITION: Skill[] = [
  { key: "influence", name: "Influence", domain: "Social Engagement", whyItMatters: "A new leader needs people who carry credibility and can move others without authority.", leadershipSignal: true, baseline: 66 },
  { key: "judgment-uncertainty", name: "Judgment Under Uncertainty", domain: "Innovation", whyItMatters: "Transitions create gray zones; sound judgment maintains good decisions in the gap.", leadershipSignal: true, baseline: 68 },
  { key: "communication", name: "Communication", domain: "Social Engagement", whyItMatters: "Continuity depends on leaders who can articulate direction clearly and often.", leadershipSignal: false, baseline: 70 },
  { key: "coaching", name: "Developing Others", domain: "Cooperation", whyItMatters: "Bench strength is built by people who grow others, not just deliver themselves.", leadershipSignal: true, baseline: 58 },
  { key: "change-leadership", name: "Change Leadership", domain: "Social Engagement", whyItMatters: "A handoff is a change event; change leaders keep momentum from leaking away.", leadershipSignal: true, baseline: 62 },
  { key: "emotional-regulation", name: "Emotional Regulation", domain: "Emotional Resilience", whyItMatters: "Teams watch how leaders handle pressure; composure sets the tone for everyone.", leadershipSignal: false, baseline: 65 },
  { key: "initiative-ownership", name: "Initiative Ownership", domain: "Self-Management", whyItMatters: "In a vacuum, owners step up and keep priorities from drifting during the handoff.", leadershipSignal: true, baseline: 72 },
];

const INTERNAL_MOBILITY: Skill[] = [
  { key: "learning-agility", name: "Learning Agility", domain: "Innovation", whyItMatters: "Filling gaps from within depends on people who can learn new domains fast.", leadershipSignal: false, baseline: 73 },
  { key: "adaptability", name: "Adaptability", domain: "Emotional Resilience", whyItMatters: "Moving into a new role means new context; adaptable people ramp without hand-holding.", leadershipSignal: false, baseline: 70 },
  { key: "self-direction", name: "Self-Direction", domain: "Self-Management", whyItMatters: "Internal moves come with less onboarding; self-directed people make their own runway.", leadershipSignal: true, baseline: 66 },
  { key: "initiative-ownership", name: "Initiative Ownership", domain: "Self-Management", whyItMatters: "Mobility works when people claim scope rather than wait to be told what to own.", leadershipSignal: true, baseline: 68 },
  { key: "collaboration", name: "Collaboration", domain: "Cooperation", whyItMatters: "Cross-team moves require fast partnership-building in unfamiliar groups.", leadershipSignal: false, baseline: 61 },
  { key: "coaching", name: "Developing Others", domain: "Cooperation", whyItMatters: "Internal talent compounds when movers also lift the people around them.", leadershipSignal: true, baseline: 55 },
  { key: "curiosity", name: "Curiosity", domain: "Innovation", whyItMatters: "Curious people seek out the gaps worth filling instead of staying in their lane.", leadershipSignal: false, baseline: 64 },
];

export const SKILL_PACKS: Record<InitiativeType, Skill[]> = {
  "ai-implementation": AI_IMPLEMENTATION,
  reorganization: REORGANIZATION,
  "post-merger": POST_MERGER,
  "leadership-transition": LEADERSHIP_TRANSITION,
  "internal-mobility": INTERNAL_MOBILITY,
};

export function getInitiative(id: InitiativeType): InitiativeMeta {
  return INITIATIVES[id];
}

export function getSkillPack(id: InitiativeType): Skill[] {
  return SKILL_PACKS[id];
}

export function assessmentNameFor(id: InitiativeType): string {
  return `${INITIATIVES[id].label} Checkup`;
}

/** Lowercase an initiative label for inline prose, preserving the "AI" acronym. */
export function lcInitiative(label: string): string {
  return label.toLowerCase().replace(/\bai\b/g, "AI");
}
