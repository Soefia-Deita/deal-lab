import type {
  EvidenceSnippet,
  GeneratedReport,
  GtmFollowUp,
  LeadCandidate,
  Participant,
  ProofPack,
  QualSignal,
  ReadinessBand,
  Recommendation,
  Skill,
  SkillScore,
  SkillSummary,
} from "./types";
import { getInitiative, getSkillPack, lcInitiative } from "./skills";
import { clamp, firstName, hashString, seededInt } from "./utils";

// ── Deterministic scoring ──────────────────────────────────────────────
// Score = skill baseline + per-participant talent + per-cell variance,
// all seeded from stable strings. Same inputs → identical report, always.

export function generateScores(participants: Participant[], skills: Skill[]): SkillScore[] {
  const scores: SkillScore[] = [];
  for (const p of participants) {
    const talent = seededInt(`talent:${p.id}`, -8, 12); // some people are stronger overall
    for (const s of skills) {
      const variance = seededInt(`cell:${p.id}:${s.key}`, -15, 15);
      const score = clamp(s.baseline + talent + variance, 24, 97);
      scores.push({ participantId: p.id, skillKey: s.key, score });
    }
  }
  return scores;
}

// ── Banding ────────────────────────────────────────────────────────────
export function bandFromScore(score: number): ReadinessBand {
  if (score >= 72) return "strong";
  if (score >= 58) return "moderate";
  return "at-risk";
}

export function bandLabel(band: ReadinessBand): string {
  return band === "strong" ? "Strong" : band === "moderate" ? "Moderate" : "At-risk";
}

// Short, human phrasing used in the readiness headline.
const STRONG_PHRASE: Record<string, string> = {
  "initiative-ownership": "ownership",
  "change-leadership": "change leadership",
  "learning-agility": "learning agility",
  adaptability: "adaptability",
  "judgment-uncertainty": "judgment under uncertainty",
  "trust-building": "trust-building",
  influence: "influence",
  "self-direction": "self-direction",
  curiosity: "curiosity",
};

const RISK_PHRASE: Record<string, string> = {
  collaboration: "cross-functional alignment",
  communication: "cross-functional alignment",
  "conflict-resolution": "conflict resolution",
  "trust-building": "trust between teams",
  coaching: "developing others",
  "responsible-ai": "responsible-AI guardrails",
  "emotional-regulation": "composure under pressure",
};

function strongPhrase(s: Skill): string {
  return STRONG_PHRASE[s.key] ?? s.name.toLowerCase();
}
function riskPhrase(s: Skill): string {
  return RISK_PHRASE[s.key] ?? s.name.toLowerCase();
}

// ── Report builder ─────────────────────────────────────────────────────
export function buildReport(pack: ProofPack): GeneratedReport {
  const skills = getSkillPack(pack.initiative);
  const initiative = getInitiative(pack.initiative);
  // Short, prose-friendly form, e.g. "AI implementation", "post-merger".
  const initShort = lcInitiative(initiative.label.replace(/ Readiness| Integration/g, ""));
  const participants = pack.participants;
  const n = participants.length;

  const scoreOf = (pid: string, key: string) =>
    pack.scores.find((s) => s.participantId === pid && s.skillKey === key)?.score ?? 0;

  // Per-skill summaries
  const skillSummaries: SkillSummary[] = skills.map((skill) => {
    const cells = participants.map((p) => ({ pid: p.id, v: scoreOf(p.id, skill.key) }));
    const teamAverage = Math.round(cells.reduce((a, c) => a + c.v, 0) / Math.max(1, n));
    const top = cells.reduce((a, c) => (c.v > a.v ? c : a), cells[0] ?? { pid: "", v: 0 });
    return {
      skill,
      teamAverage,
      topScore: top.v,
      topParticipantId: top.pid,
      band: bandFromScore(teamAverage),
    };
  });

  const sortedByAvg = [...skillSummaries].sort((a, b) => b.teamAverage - a.teamAverage);
  const strongest = sortedByAvg[0];
  const weakest = sortedByAvg[sortedByAvg.length - 1];

  const overallReadiness = Math.round(
    skillSummaries.reduce((a, s) => a + s.teamAverage, 0) / Math.max(1, skillSummaries.length)
  );
  const band = bandFromScore(overallReadiness);

  // Headline
  const headline = `${bandLabel(band)} readiness: strong ${strongPhrase(strongest.skill)}, risk in ${riskPhrase(
    weakest.skill
  )}`;
  const headlineDetail = `Across ${n} ${n === 1 ? "person" : "people"}, ${pack.prospect.company} shows real strength in ${strongPhrase(
    strongest.skill
  )} (team avg ${strongest.teamAverage}) but thin coverage in ${riskPhrase(weakest.skill)} (team avg ${
    weakest.teamAverage
  }) — the difference between landing this ${initShort} effort and watching it stall.`;

  // Leads — composite over leadership-signal skills
  const leadSkills = skills.filter((s) => s.leadershipSignal);
  const leadScored = participants
    .map((p) => {
      const composite = Math.round(
        leadSkills.reduce((a, s) => a + scoreOf(p.id, s.key), 0) / Math.max(1, leadSkills.length)
      );
      const ranked = [...skills]
        .map((s) => ({ s, v: scoreOf(p.id, s.key) }))
        .sort((a, b) => b.v - a.v);
      return { p, composite, ranked };
    })
    .sort((a, b) => b.composite - a.composite);

  const leads: LeadCandidate[] = leadScored.slice(0, n >= 4 ? 2 : 1).map((entry, i) => {
    const s1 = entry.ranked[0];
    const s2 = entry.ranked[1];
    const rationale =
      i === 0
        ? `Top leadership-signal composite on the team (${entry.composite}). Pairs ${s1.s.name.toLowerCase()} with ${s2.s.name.toLowerCase()} — credible to own the rollout and bring others along.`
        : `A strong secondary lead (${entry.composite}). Best used to anchor ${s1.s.name.toLowerCase()} while the primary lead drives alignment.`;
    return {
      participantId: entry.p.id,
      name: entry.p.name,
      leadershipScore: entry.composite,
      strengths: [`${s1.s.name} ${s1.v}`, `${s2.s.name} ${s2.v}`],
      rationale,
    };
  });

  // Risk areas — lowest team averages
  const weakAreas = sortedByAvg.slice(-3).reverse(); // 3 weakest, worst first
  const risks: Recommendation[] = weakAreas.map((w) => {
    const severity: Recommendation["severity"] =
      w.teamAverage < 52 ? "high" : w.teamAverage < 60 ? "medium" : "low";
    return {
      kind: "build",
      skillName: w.skill.name,
      severity,
      title: `${w.skill.name} is thin (${w.teamAverage})`,
      detail: `${w.skill.whyItMatters} Right now the team sits at ${w.teamAverage}, with the strongest individual only at ${w.topScore} — a real exposure for this ${initShort} effort.`,
    };
  });

  // Build vs hire
  const buildVsHire: Recommendation[] = weakAreas.map((w) => {
    const hasAnchor = w.topScore >= 74;
    const specialized = w.skill.key === "responsible-ai";
    let kind: Recommendation["kind"];
    let title: string;
    let detail: string;
    const topName = firstName(
      participants.find((p) => p.id === w.topParticipantId)?.name ?? "your strongest member"
    );
    if (hasAnchor) {
      kind = "build";
      title = `Build ${w.skill.name} from within`;
      detail = `${topName} already scores ${w.topScore} here and can model it. A focused uplift program closes most of the gap without adding headcount.`;
    } else if (specialized) {
      kind = "partner";
      title = `Partner for ${w.skill.name}`;
      detail = `No internal anchor (top score ${w.topScore}). Bring in advisory or guardrails for ${w.skill.name.toLowerCase()} rather than trying to build it under deadline.`;
    } else if (w.skill.leadershipSignal) {
      kind = "hire";
      title = `Hire an anchor for ${w.skill.name}`;
      detail = `No one clears the bar (top score ${w.topScore}) on a leadership-critical skill. One experienced hire de-risks the whole ${initShort} effort.`;
    } else {
      kind = "build";
      title = `Build ${w.skill.name} — but invest`;
      detail = `Top score is only ${w.topScore}, so coaching alone is slow. Pair structured practice with an external sprint to move the team line.`;
    }
    return { kind, skillName: w.skill.name, severity: bandFromScore(w.teamAverage) === "at-risk" ? "high" : "medium", title, detail };
  });

  const buildCount = buildVsHire.filter((r) => r.kind === "build").length;
  const externalCount = buildVsHire.length - buildCount;
  const verdictLead = buildCount >= externalCount ? "Build-first" : "Hire-first";
  const buildVerdict = `${verdictLead}: ${buildCount} of ${buildVsHire.length} gaps are closeable from within${
    externalCount > 0 ? `, ${externalCount} need targeted outside support` : ""
  }. ${
    externalCount === 0
      ? "No new headcount required — this is a development plan, not a hiring plan."
      : "Coach where you can; bring in outside help only where there's no internal anchor."
  }`;

  // Evidence
  const strongCount = participants.filter((p) => scoreOf(p.id, strongest.skill.key) >= 72).length;
  const alignKey =
    skills.find((s) => s.key === "collaboration")?.key ??
    skills.find((s) => s.key === "communication")?.key ??
    weakest.skill.key;
  const alignSkill = skillSummaries.find((s) => s.skill.key === alignKey)!;
  const alignedCount = participants.filter((p) => scoreOf(p.id, alignKey) >= 65).length;
  const evidence: EvidenceSnippet[] = [
    {
      label: "Strength is real",
      tone: "positive",
      text: `${strongCount} of ${n} scored "strong" on ${strongest.skill.name} (team avg ${strongest.teamAverage}). That's a genuine foundation to build on.`,
    },
    {
      label: "Where it breaks",
      tone: "risk",
      text: `${alignSkill.skill.name} trails at a team average of ${alignSkill.teamAverage}. For this ${initShort} effort, that's exactly where pilots quietly stall.`,
    },
    {
      label: "Alignment gap",
      tone: "watch",
      text: `Only ${alignedCount} of ${n} keep cross-functional stakeholders genuinely aligned — the difference between a working pilot and an org-wide rollout.`,
    },
  ];
  if (leads[0]) {
    const [s1, s2] = leads[0].strengths;
    evidence.push({
      label: "You have a lead",
      tone: "positive",
      text: `${leads[0].name} is a credible internal lead — ${s1} and ${s2}, both well above the team line.`,
    });
  }

  // GTM follow-up
  const followUp = buildFollowUp(pack, { strongest, weakest, alignSkill, leads, overallReadiness, band });

  return {
    headline,
    headlineDetail,
    overallReadiness,
    band,
    skillSummaries,
    leads,
    risks,
    buildVsHire,
    buildVerdict,
    evidence,
    followUp,
  };
}

function buildFollowUp(
  pack: ProofPack,
  ctx: {
    strongest: SkillSummary;
    weakest: SkillSummary;
    alignSkill: SkillSummary;
    leads: LeadCandidate[];
    overallReadiness: number;
    band: ReadinessBand;
  }
): GtmFollowUp {
  const { prospect, initiative } = { prospect: pack.prospect, initiative: getInitiative(pack.initiative) };
  const buyer = prospect.buyerName;
  const buyerFirst = firstName(buyer);
  const leadName = ctx.leads[0]?.name ?? "your strongest team member";
  const leadFirst = firstName(leadName);
  const gap = ctx.alignSkill.skill.name;
  const initiativeShort = initiative.label.replace(" Readiness", "").replace(" Integration", "");
  const initLc = lcInitiative(initiative.label);
  const initShortLc = lcInitiative(initiativeShort);

  const emailSubject = `${prospect.company}: who can lead your ${initShortLc} — and the 2 gaps to close first`;
  const emailBody = `Hi ${buyerFirst},

Thanks for the conversation about ${initLc} at ${prospect.company}. I ran the quick Soefia checkup we discussed across your team — here's the headline.

• Readiness: ${bandLabel(ctx.band)} (${ctx.overallReadiness}/100). The strength is real — your team scores high on ${ctx.strongest.skill.name.toLowerCase()}.
• Most likely lead: ${leadName} stood out as the clearest internal lead for this.
• Biggest risk: ${gap} is your thinnest coverage (team avg ${ctx.alignSkill.teamAverage}). That's usually where rollouts like this stall.

The full one-page report is attached — built to forward to your leadership as-is.

If it's useful, the natural next step is a paid Soefia benchmark across the wider ${prospect.buyerRole.toLowerCase().includes("oper") ? "operations" : "function"} so you can size the gap and put names to a development plan before you commit budget. Happy to scope it on a 20-minute call this week.

Best,
[Your name]
Soefia`;

  return {
    buyerPain: `${prospect.buyerRole} is on the hook to deliver ${initLc} but has no objective read on who's ready or where it breaks. The checkup turns that anxiety into a plan.`,
    championAngle: `Make ${buyerFirst} the leader who brought evidence, not opinions. Naming ${leadFirst} as the likely lead gives them a safe, credible first move to champion internally.`,
    anchorGap: `${gap} (team avg ${ctx.alignSkill.teamAverage}). Anchor the next call here — it's concrete, fixable, and directly tied to rollout risk.`,
    nextMotion: `Paid Soefia benchmark across the full ${initShortLc} population to size the gap and build a named development plan. Expansion path: org-wide skill benchmark + quarterly re-score.`,
    emailSubject,
    emailBody,
    talkTrack: [
      `Lead with the strength: "${prospect.company}'s ${ctx.strongest.skill.name.toLowerCase()} is genuinely strong — that's your foundation."`,
      `Pivot to the risk: "The one thing I'd watch is ${gap.toLowerCase()} — it's the quiet killer for ${initShortLc}."`,
      `Name the lead: "${leadFirst} is your most credible internal lead — want a plan to set them up?"`,
      `Close to next motion: "Let's benchmark the wider team so you walk into the rollout with names, not guesses."`,
    ],
  };
}

// ── GTM qualification signals ──────────────────────────────────────────
export function computeSignals(pack: ProofPack, report: GeneratedReport): QualSignal[] {
  const completed = pack.participants.filter((p) => p.status === "completed").length;
  const total = pack.participants.length;
  const initiative = getInitiative(pack.initiative);
  const gapAvg = report.skillSummaries.reduce(
    (min, s) => Math.min(min, s.teamAverage),
    100
  );
  const gapSeverity = gapAvg < 52 ? "Severe" : gapAvg < 60 ? "Elevated" : "Moderate";

  return [
    {
      label: "Report viewed",
      value: pack.reportViews > 0 ? `Yes · ${pack.reportViews}×` : "Not yet",
      tone: pack.reportViews > 0 ? "positive" : "neutral",
    },
    {
      label: "Shared internally",
      value: pack.shares.length > 0 ? `Yes · ${pack.shares.length}` : "No",
      tone: pack.shares.length > 0 ? "positive" : "neutral",
    },
    {
      label: "Participants completed",
      value: `${completed} of ${total}`,
      tone: completed >= Math.ceil(total / 2) ? "positive" : "watch",
    },
    {
      label: "Initiative urgency",
      value: initiative.urgency,
      tone: initiative.urgency === "High" ? "risk" : initiative.urgency === "Elevated" ? "watch" : "neutral",
    },
    {
      label: "Gap severity",
      value: `${gapSeverity} (${gapAvg})`,
      tone: gapSeverity === "Severe" ? "risk" : gapSeverity === "Elevated" ? "watch" : "neutral",
    },
  ];
}

/** A simple 0-100 deal-temperature derived from the live signals. */
export function dealScore(pack: ProofPack): number {
  let s = 35;
  s += Math.min(20, pack.reportViews * 8);
  s += Math.min(20, pack.shares.length * 12);
  const completed = pack.participants.filter((p) => p.status === "completed").length;
  s += Math.round((completed / Math.max(1, pack.participants.length)) * 20);
  if (getInitiative(pack.initiative).urgency === "High") s += 5;
  return clamp(s, 0, 100);
}

export { hashString };
