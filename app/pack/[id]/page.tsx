"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ExternalLink,
  Eye,
  Lightbulb,
  Link2,
  Lock,
  Mail,
  Plus,
  Send,
  Target,
  Users,
} from "lucide-react";
import { AppHeader } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { CopyButton } from "@/components/copy-button";
import { SectionLabel } from "@/components/bits";
import { getInitiative, lcInitiative } from "@/lib/skills";
import { buildReport, computeSignals } from "@/lib/generate";
import { markAllComplete, usePack } from "@/lib/store";
import type { QualSignal } from "@/lib/types";
import { cn, pct } from "@/lib/utils";

export default function PackPage() {
  const { id } = useParams<{ id: string }>();
  const { pack, mounted } = usePack(id);

  if (!mounted) return <LoadingShell />;
  if (!pack) return <NotFound />;

  // Safe to read window here — we're past the hydration guard.
  const origin = window.location.origin;

  const meta = getInitiative(pack.initiative);
  const report = buildReport(pack);
  const signals = computeSignals(pack, report);
  const completed = pack.participants.filter((p) => p.status === "completed").length;
  const prospectLink = `${origin}/p/${pack.id}`;

  return (
    <div className="min-h-screen">
      <AppHeader>
        <Button asChild variant="outline" size="sm">
          <Link href="/">
            <Plus /> New pack
          </Link>
        </Button>
      </AppHeader>

      <main className="mx-auto max-w-[1400px] px-5 py-7">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Deal Lab
        </Link>

        {/* ── Header ── */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{meta.label}</Badge>
              <span className="text-xs text-muted-foreground">
                {pack.assessmentName} · created {new Date(pack.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">{pack.title}</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-foreground/80">
              <span className="text-muted-foreground">Business question:</span> “{pack.prospect.businessQuestion}”
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>For: <span className="font-medium text-foreground">{pack.prospect.buyerName}</span>, {pack.prospect.buyerRole}</span>
              <span>Team size: <span className="font-medium text-foreground tnum">{pack.prospect.teamSize}</span></span>
              <span>Assessing: <span className="font-medium text-foreground tnum">{pack.participants.length}</span></span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <CopyButton value={prospectLink} label="Copy prospect link" toastMessage="Prospect link copied" />
            <Button asChild variant="outline" size="sm">
              <a href={prospectLink} target="_blank" rel="noreferrer">
                <ExternalLink /> Open prospect view
              </a>
            </Button>
            <Button asChild size="sm">
              <Link href={`/report/${pack.id}`}>
                <Eye /> Preview report
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="pack" className="mt-6">
          <TabsList>
            <TabsTrigger value="pack">
              <Target /> Proof Pack
            </TabsTrigger>
            <TabsTrigger value="gtm">
              <Lock /> GTM Follow-up
              <span className="ml-1 rounded bg-warning/15 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-warning">
                Internal
              </span>
            </TabsTrigger>
          </TabsList>

          {/* ── Proof Pack tab ── */}
          <TabsContent value="pack" className="mt-5">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-7">
                <Card>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <SectionLabel icon={Target}>Skills being assessed</SectionLabel>
                      <Badge variant="muted">{pack.skills.length} BESSI-aligned</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Why these skills decide whether {pack.prospect.company} is ready for{" "}
                      {lcInitiative(meta.label)}:
                    </p>
                    <ul className="divide-y divide-border">
                      {pack.skills.map((s) => (
                        <li key={s.key} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">{s.name}</span>
                              <span className="rounded bg-muted px-1.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-wide text-muted-foreground">
                                {s.domain}
                              </span>
                            </div>
                            <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{s.whyItMatters}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6 lg:col-span-5">
                <Card>
                  <CardContent className="space-y-3">
                    <SectionLabel icon={Link2}>Prospect link</SectionLabel>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
                      <Link2 className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm text-foreground">{prospectLink || "…"}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <CopyButton value={prospectLink} label="Copy link" />
                      <Button asChild variant="outline" size="sm">
                        <a href={prospectLink} target="_blank" rel="noreferrer">
                          <ExternalLink /> Open prospect view
                        </a>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Send this to the buyer. Their team completes a 2-minute checkup — no login required.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <SectionLabel icon={Users}>Participation</SectionLabel>
                      <Badge variant={completed === pack.participants.length ? "success" : "muted"}>
                        {completed}/{pack.participants.length} done
                      </Badge>
                    </div>
                    <Progress value={pct(completed, pack.participants.length)} />
                    <ul className="space-y-1">
                      {pack.participants.map((p) => (
                        <li key={p.id} className="flex items-center justify-between gap-2 py-1">
                          <div className="flex items-center gap-2 min-w-0">
                            {p.status === "completed" ? (
                              <CheckCircle2 className="size-4 shrink-0 text-success" />
                            ) : (
                              <Circle className="size-4 shrink-0 text-muted-foreground/50" />
                            )}
                            <span className="truncate text-sm font-medium">{p.name}</span>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {p.status === "completed" ? "Completed" : "Invited"}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {completed < pack.participants.length ? (
                      <Button variant="subtle" size="sm" onClick={() => markAllComplete(pack.id)}>
                        <CheckCircle2 /> Mark all complete (demo)
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                        <CheckCircle2 className="size-4" /> Team complete — report is ready to send.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-primary/30 bg-primary/[0.04]">
                  <CardContent className="space-y-3">
                    <SectionLabel icon={Eye}>Executive report</SectionLabel>
                    <p className="text-sm text-foreground/80">
                      The shareable, champion-ready one-pager — readiness, lead, gaps, and next step.
                    </p>
                    <Button asChild>
                      <Link href={`/report/${pack.id}`}>
                        <Eye /> Preview executive report
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── GTM Follow-up tab ── */}
          <TabsContent value="gtm" className="mt-5">
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/[0.07] px-4 py-2.5 text-sm text-foreground">
              <Lock className="size-4 shrink-0 text-warning" />
              <span>
                <span className="font-semibold">Internal only.</span> Talk track, intent signals, and a
                ready-to-send email. The prospect never sees this tab.
              </span>
            </div>

            {/* Signal strip — buyer intent at a glance */}
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {signals.slice(0, 3).map((s) => (
                <Card key={s.label}>
                  <CardContent className="px-4 py-3">
                    <SignalStat signal={s} />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Intelligence */}
              <div className="space-y-4 lg:col-span-5">
                <Card>
                  <CardContent className="space-y-4">
                    <SectionLabel icon={Lightbulb}>Deal intelligence</SectionLabel>
                    <Insight icon={Target} label="Buyer pain detected" text={report.followUp.buyerPain} />
                    <Separator />
                    <Insight icon={Send} label="Skill gap to anchor next call" text={report.followUp.anchorGap} />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-3">
                    <SectionLabel icon={Lightbulb}>Talk track</SectionLabel>
                    <ol className="space-y-2.5">
                      {report.followUp.talkTrack.slice(0, 3).map((t, i) => (
                        <li key={i} className="flex gap-2.5 text-sm leading-snug">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.7rem] font-semibold text-primary tnum">
                            {i + 1}
                          </span>
                          <span className="text-foreground/85">{t}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </div>

              {/* Email */}
              <div className="space-y-4 lg:col-span-7">
                <Card>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <SectionLabel icon={Mail}>Ready-to-send follow-up email</SectionLabel>
                      <CopyButton
                        value={`Subject: ${report.followUp.emailSubject}\n\n${report.followUp.emailBody}`}
                        label="Copy email"
                        toastMessage="Email copied — paste into your inbox"
                      />
                    </div>
                    <div className="rounded-lg border border-border bg-muted/40">
                      <div className="border-b border-border px-4 py-2.5 text-sm">
                        <span className="text-muted-foreground">Subject: </span>
                        <span className="font-medium text-foreground">{report.followUp.emailSubject}</span>
                      </div>
                      <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed text-foreground/90 no-scrollbar" style={{ fontFamily: "var(--font-sans)" }}>
{report.followUp.emailBody}
                      </pre>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pre-filled from the report. Replace <span className="font-mono">[Your name]</span> and send.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Insight({
  icon: Icon,
  label,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div>
        <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <p className="mt-0.5 text-sm leading-snug text-foreground/85">{text}</p>
      </div>
    </div>
  );
}

const TONE_DOT: Record<QualSignal["tone"], string> = {
  positive: "bg-success",
  watch: "bg-warning",
  risk: "bg-destructive",
  neutral: "bg-muted-foreground/40",
};

function SignalStat({ signal }: { signal: QualSignal }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
        <span className={cn("size-1.5 rounded-full", TONE_DOT[signal.tone])} />
        {signal.label}
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">{signal.value}</div>
    </div>
  );
}

function LoadingShell() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <div className="mx-auto max-w-[1400px] px-5 py-10">
        <div className="h-7 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-40 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="text-lg font-semibold">Proof Pack not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          It may have been created in a different browser. Create a new one to continue.
        </p>
        <Button asChild className="mt-5">
          <Link href="/">
            <Plus /> New Proof Pack
          </Link>
        </Button>
      </div>
    </div>
  );
}
