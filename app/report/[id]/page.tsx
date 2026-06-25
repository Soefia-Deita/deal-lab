"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  FlaskConical,
  Gift,
  Handshake,
  Lightbulb,
  Lock,
  Printer,
  Quote,
  Rocket,
  Share2,
  Sparkles,
  UserPlus,
  Users,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SectionLabel, Avatar } from "@/components/bits";
import { ReadinessScale, ScoreBar, ParticipantHeatmap, BAND_META } from "@/components/charts";
import { getInitiative, lcInitiative } from "@/lib/skills";
import { bandLabel, buildReport } from "@/lib/generate";
import { recordReportView, recordShare, usePack } from "@/lib/store";
import { CREDITS_PER_SHARE } from "@/lib/types";
import type { Recommendation } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const { pack, mounted } = usePack(id);

  // Count a view once per browser session (and avoids dev double-invoke).
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `dl-viewed:${id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    recordReportView(id);
  }, [id]);

  if (!mounted) return <div className="min-h-screen bg-background" />;
  if (!pack) return <ReportNotFound />;

  const meta = getInitiative(pack.initiative);
  const report = buildReport(pack);
  const scoreOf = (pid: string, key: string) =>
    pack.scores.find((s) => s.participantId === pid && s.skillKey === key)?.score ?? 0;
  const leadId = report.leads[0]?.participantId;
  const fn = functionWord(pack.prospect.buyerRole);

  return (
    <div className="min-h-screen">
      {/* ── Report top bar (not printed) ── */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur-md no-print">
        <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between gap-4 px-5">
          <Link href={`/pack/${pack.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Back to Deal Lab
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer /> Save as PDF
            </Button>
            <Button size="sm" onClick={() => document.getElementById("share")?.scrollIntoView({ behavior: "smooth" })}>
              <Share2 /> Share report
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-5 py-8">
        {/* ── Letterhead ── */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <Wordmark />
          </div>
          <div className="text-right">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Executive Readiness Report
            </div>
            <div className="text-sm text-foreground">
              Prepared for <span className="font-semibold">{pack.prospect.buyerName}</span> · {pack.prospect.company}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(pack.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} · Confidential
            </div>
          </div>
        </div>

        {/* ── Headline verdict (signature) ── */}
        <Card className="overflow-hidden animate-fade-up">
          <div className="p-6 md:p-7">
            <div className="flex items-center gap-2.5">
              <Badge variant="secondary">{meta.label}</Badge>
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Readiness Verdict
              </span>
            </div>
            <h1 className="mt-3 max-w-4xl font-serif text-[2rem] font-semibold leading-[1.12] tracking-tight md:text-[2.4rem]">
              {report.headline}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-[0.95rem]">
              {report.headlineDetail}
            </p>

            <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-2xl">
                <ReadinessScale value={report.overallReadiness} band={report.band} />
              </div>
              <div className="flex flex-wrap gap-2.5">
                <HeroStat label="Readiness" value={bandLabel(report.band)} />
                <HeroStat label="Assessed" value={`${pack.participants.length} of ${pack.prospect.teamSize}`} icon={Users} />
                <HeroStat label="Most likely lead" value={report.leads[0]?.name ?? "—"} icon={BadgeCheck} />
              </div>
            </div>
          </div>
        </Card>

        {/* ── Methodology / trust ── */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <FlaskConical className="size-3.5" /> Grounded in the BESSI framework
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BadgeCheck className="size-3.5" /> Evidence-based &amp; explainable
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Lock className="size-3.5" /> SOC 2-aware · Confidential
          </span>
        </div>

        {/* ── Recommended leads ── */}
        <Section title="Recommended team lead(s)" icon={BadgeCheck} sub="Who is most credible to own this initiative, based on leadership-signal skills.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {report.leads.map((lead, i) => (
              <Card key={lead.participantId} className={cn(i === 0 && "border-primary/40 ring-1 ring-primary/20")}>
                <CardContent className="space-y-3 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={lead.name} highlight={i === 0} className="size-10 text-sm" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{lead.name}</span>
                          {i === 0 ? <Badge>Primary lead</Badge> : <Badge variant="muted">Backup lead</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground">Leadership-signal score</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold tnum text-primary">{lead.leadershipScore}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {lead.strengths.map((s) => (
                      <span key={s} className="rounded-md bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm leading-snug text-foreground/80">{lead.rationale}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        {/* ── Team readiness by skill ── */}
        <Section title="Team readiness by skill" icon={Users} sub="Team averages across the BESSI-aligned skill domains for this initiative.">
          <Card>
            <CardContent className="grid grid-cols-1 gap-x-8 gap-y-4 py-5 sm:grid-cols-2">
              {report.skillSummaries.map((s) => (
                <ScoreBar
                  key={s.skill.key}
                  label={s.skill.name}
                  score={s.teamAverage}
                  band={s.band}
                  right={<span className={cn("text-[0.7rem] font-semibold uppercase", BAND_META[s.band].text)}>{BAND_META[s.band].label}</span>}
                />
              ))}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="space-y-3 py-5">
              <div className="flex items-center justify-between">
                <SectionLabel icon={Users}>Individual breakdown</SectionLabel>
                <div className="flex items-center gap-3 text-[0.7rem] font-medium text-muted-foreground">
                  <LegendDot className="bg-success" label="Strong" />
                  <LegendDot className="bg-warning" label="Moderate" />
                  <LegendDot className="bg-destructive" label="At-risk" />
                </div>
              </div>
              <ParticipantHeatmap
                participants={pack.participants}
                summaries={report.skillSummaries}
                scoreOf={scoreOf}
                leadId={leadId}
              />
            </CardContent>
          </Card>
        </Section>

        {/* ── Skill gaps: the risk + how to close it ── */}
        <Section title="Skill gaps to close" icon={Wrench} sub="The thinnest skills for this initiative — and whether to build them from within or bring in help.">
          <Card className="mb-4 border-primary/30 bg-primary/[0.04]">
            <CardContent className="flex items-start gap-3 py-4">
              <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary" />
              <p className="text-sm font-medium text-foreground">{report.buildVerdict}</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {report.buildVsHire.map((r) => (
              <BuildCard key={r.skillName} rec={r} />
            ))}
          </div>
        </Section>

        {/* ── Evidence ── */}
        <Section title="Evidence" icon={Quote} sub="Why these conclusions — straight from the team's responses.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {report.evidence.slice(0, 3).map((e, i) => {
              const tone = e.tone === "positive" ? BAND_META.strong : e.tone === "watch" ? BAND_META.moderate : BAND_META["at-risk"];
              return (
                <Card key={i} className="border-l-4" style={{ borderLeftColor: tone.hex }}>
                  <CardContent className="py-4">
                    <div className={cn("text-[0.7rem] font-semibold uppercase tracking-wider", tone.text)}>
                      {e.label}
                    </div>
                    <p className="mt-1 text-sm leading-snug text-foreground/85">{e.text}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Section>

        {/* ── Next step (paid expansion) ── */}
        <Section title="Recommended next step" icon={Rocket}>
          <Card className="overflow-hidden border-transparent bg-accent text-accent-foreground">
            <CardContent className="grid grid-cols-1 gap-5 py-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white/70">
                  <Sparkles className="size-3.5" /> Paid expansion
                </div>
                <h3 className="mt-1.5 font-serif text-xl font-semibold tracking-tight md:text-2xl">
                  Run a Soefia benchmark across the full {pack.prospect.company} {fn}
                </h3>
                <p className="mt-1.5 max-w-xl text-sm text-white/80">
                  This checkup sampled {pack.participants.length}. A full benchmark sizes the gap across the
                  whole {fn}, puts names to a development plan, and re-scores quarterly so you can prove the
                  {" "}{lcInitiative(meta.label)} is on track.
                </p>
                <ul className="mt-3 grid grid-cols-1 gap-1.5 text-sm text-white/90 sm:grid-cols-2">
                  {["Org-wide skill benchmark", "Named development plan", "Build-vs-hire roadmap", "Quarterly re-score"].map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <BadgeCheck className="size-4 text-white/70" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2 no-print">
                <Button
                  variant="default"
                  className="bg-white text-accent hover:bg-white/90"
                  onClick={() => toast.success("Flagged to your Soefia AE", { description: "We'll scope a paid benchmark for " + pack.prospect.company })}
                >
                  Scope a paid benchmark <ArrowUpRight />
                </Button>
                <span className="text-center text-xs text-white/60">No commitment · 20-min scope call</span>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* ── Share + viral mechanic ── */}
        <SharePanel
          packId={pack.id}
          credits={pack.freeCreditsRemaining}
          shareCount={pack.shares.length}
          company={pack.prospect.company}
        />

        <footer className="mt-10 border-t border-border pt-5 text-center text-xs text-muted-foreground">
          <p>
            Powered by <span className="font-medium text-foreground">Soefia</span> · Grounded in the{" "}
            <span className="font-medium text-foreground">BESSI</span> framework (Behavioral, Emotional &amp; Social
            Skills Inventory), a research-validated model of human skills. SOC 2-aware. Demo scores are illustrative.
          </p>
          <p className="mt-1">Confidential — prepared for {pack.prospect.company}. © Soefia.</p>
        </footer>
      </main>
    </div>
  );
}

// ── Share panel with free-credit loop ──────────────────────────────────
function SharePanel({
  packId,
  credits,
  shareCount,
  company,
}: {
  packId: string;
  credits: number;
  shareCount: number;
  company: string;
}) {
  const [who, setWho] = React.useState("");

  function share() {
    const name = who.trim() || "a colleague";
    recordShare(packId, name, new Date().toISOString());
    toast.success(`Report shared with ${name}`, {
      description: `+${CREDITS_PER_SHARE} free scoring reports unlocked this month`,
    });
    setWho("");
  }

  return (
    <section id="share" className="mt-8">
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto]">
          <CardContent className="py-6">
            <div className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <Share2 className="size-3.5" /> Share this report
            </div>
            <h3 className="mt-1.5 font-serif text-lg font-semibold tracking-tight">Forward to a colleague who owns this</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Send the report to your CHRO, a peer, or your exec sponsor. It&apos;s built to forward as-is.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 no-print">
              <Input
                value={who}
                onChange={(e) => setWho(e.target.value)}
                placeholder="Colleague name or email"
                className="w-full max-w-xs"
                onKeyDown={(e) => e.key === "Enter" && share()}
              />
              <Button onClick={share}>
                <Share2 /> Share &amp; unlock credits
              </Button>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-success">
              <Gift className="size-3.5" /> Each share unlocks {CREDITS_PER_SHARE} additional free scoring reports this month.
            </p>
          </CardContent>

          <div className="flex flex-col items-center justify-center gap-1 border-t border-border bg-success/[0.06] px-8 py-6 text-center md:border-l md:border-t-0">
            <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Free reports left
            </div>
            <div className="text-4xl font-bold tnum text-success">{credits}</div>
            <div className="text-xs text-muted-foreground">
              {shareCount} {shareCount === 1 ? "share" : "shares"} · {company}
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}

// ── Small building blocks ──────────────────────────────────────────────
function Section({
  title,
  icon: Icon,
  sub,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3.5 flex items-start gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          <Icon className="size-4" />
        </div>
        <div>
          <h2 className="font-serif text-lg font-semibold tracking-tight">{title}</h2>
          {sub ? <p className="text-sm text-muted-foreground">{sub}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function HeroStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
      <div className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold">
        {Icon ? <Icon className="size-3.5 text-muted-foreground" /> : null}
        {value}
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={cn("size-2 rounded-full", className)} /> {label}
    </span>
  );
}

function BuildCard({ rec }: { rec: Recommendation }) {
  const map = {
    build: { icon: Wrench, label: "Build", variant: "success" as const },
    hire: { icon: UserPlus, label: "Hire", variant: "danger" as const },
    partner: { icon: Handshake, label: "Partner", variant: "warning" as const },
  };
  const m = map[rec.kind];
  const Icon = m.icon;
  const riskLabel = rec.severity === "high" ? "High risk" : "Watch";
  return (
    <Card className="border-l-4" style={{ borderLeftColor: severityHex(rec.severity) }}>
      <CardContent className="space-y-2 py-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <Icon className="size-4" />
            </span>
            <span className="truncate text-sm font-semibold">{rec.skillName}</span>
          </div>
          <Badge variant={m.variant}>{m.label}</Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full" style={{ backgroundColor: severityHex(rec.severity) }} />
          <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">{riskLabel}</span>
        </div>
        <p className="text-sm leading-snug text-muted-foreground">{rec.detail}</p>
      </CardContent>
    </Card>
  );
}

function severityHex(sev: Recommendation["severity"]) {
  return sev === "high" ? "#c1521d" : sev === "medium" ? "#b07314" : "#94a3b8";
}

function functionWord(role: string): string {
  const r = role.toLowerCase();
  if (r.includes("oper") || r.includes("ops")) return "operations org";
  if (r.includes("hr") || r.includes("people") || r.includes("talent")) return "people org";
  if (r.includes("eng") || r.includes("tech") || r.includes("cto")) return "engineering org";
  if (r.includes("sales") || r.includes("revenue") || r.includes("cro")) return "revenue org";
  if (r.includes("market")) return "marketing org";
  return "function";
}

function ReportNotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <h1 className="text-lg font-semibold">Report not available</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This report was generated in a different browser session.
        </p>
        <Button asChild className="mt-5">
          <Link href="/">Go to Deal Lab</Link>
        </Button>
      </div>
    </div>
  );
}
