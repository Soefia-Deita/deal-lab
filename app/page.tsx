"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FileText,
  FlaskConical,
  Plus,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { AppHeader } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SectionLabel } from "@/components/bits";
import { INITIATIVE_OPTIONS, getInitiative, getSkillPack } from "@/lib/skills";
import { createPack, defaultDemoInput, savePack, usePacks, DEMO_PACK_ID } from "@/lib/store";
import type { InitiativeType } from "@/lib/types";

type Row = { name: string; email: string };

export default function LauncherPage() {
  const router = useRouter();
  const example = React.useMemo(() => defaultDemoInput(), []);

  const [company, setCompany] = React.useState(example.company);
  const [buyerName, setBuyerName] = React.useState(example.buyerName);
  const [buyerRole, setBuyerRole] = React.useState(example.buyerRole);
  const [initiative, setInitiative] = React.useState<InitiativeType>(example.initiative);
  const [teamSize, setTeamSize] = React.useState(String(example.teamSize));
  const [question, setQuestion] = React.useState(example.businessQuestion);
  const [notes, setNotes] = React.useState(example.notes ?? "");
  const [rows, setRows] = React.useState<Row[]>(example.participants);
  const [submitting, setSubmitting] = React.useState(false);

  const skills = getSkillPack(initiative);
  const meta = getInitiative(initiative);
  const namedRows = rows.filter((r) => r.name.trim().length > 0);
  const canSubmit = company.trim().length > 0 && namedRows.length >= 3 && question.trim().length > 0;

  function setRow(i: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((rs) => (rs.length >= 10 ? rs : [...rs, { name: "", email: "" }]));
  }
  function removeRow(i: number) {
    setRows((rs) => (rs.length <= 3 ? rs : rs.filter((_, idx) => idx !== i)));
  }
  function loadExample() {
    const ex = defaultDemoInput();
    setCompany(ex.company);
    setBuyerName(ex.buyerName);
    setBuyerRole(ex.buyerRole);
    setInitiative(ex.initiative);
    setTeamSize(String(ex.teamSize));
    setQuestion(ex.businessQuestion);
    setNotes(ex.notes ?? "");
    setRows(ex.participants);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    const pack = createPack(
      {
        company,
        buyerName,
        buyerRole,
        initiative,
        teamSize: Number(teamSize) || namedRows.length,
        businessQuestion: question,
        notes,
        participants: rows,
      },
      new Date().toISOString()
    );
    savePack(pack);
    router.push(`/pack/${pack.id}`);
  }

  return (
    <div className="min-h-screen">
      <AppHeader>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/report/${DEMO_PACK_ID}`}>
            <FileText /> Sample report
          </Link>
        </Button>
      </AppHeader>

      <main className="mx-auto max-w-[1400px] px-5 py-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5">
                <FlaskConical className="size-3" /> Free readiness check
              </Badge>
              <span className="text-xs text-muted-foreground">~5 minutes · no commitment</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              See what your team is ready for
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Answer a few questions, then send a 2-minute checkup to your team. Soefia returns an
              objective readiness report — who can lead, where the skill gaps are, and what to build
              or hire. Free, no setup.
            </p>
          </div>
          <Button type="button" variant="subtle" size="sm" onClick={loadExample}>
            <Sparkles /> Try the Acme example
          </Button>
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* ── Form column ── */}
          <div className="space-y-6 lg:col-span-7">
            <Card>
              <CardContent className="space-y-5">
                <SectionLabel icon={Building2}>About you</SectionLabel>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Health" />
                  </div>
                  <div>
                    <Label htmlFor="initiative">What&apos;s ahead?</Label>
                    <Select id="initiative" value={initiative} onChange={(e) => setInitiative(e.target.value as InitiativeType)}>
                      {INITIATIVE_OPTIONS.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="buyer">Your name</Label>
                    <Input id="buyer" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Jordan Rivera" />
                  </div>
                  <div>
                    <Label htmlFor="role">Your role</Label>
                    <Input id="role" value={buyerRole} onChange={(e) => setBuyerRole(e.target.value)} placeholder="VP Operations" />
                  </div>
                  <div>
                    <Label htmlFor="team">Team size</Label>
                    <Input id="team" type="number" min={1} max={5000} value={teamSize} onChange={(e) => setTeamSize(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="question">What do you want to know?</Label>
                  <Textarea
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Who on this team can lead our AI rollout, and what skill gaps put it at risk?"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Anything else? <span className="font-normal text-muted-foreground">(optional)</span></Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Context that helps — timing, what's driving this, what success looks like…"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <SectionLabel icon={Users}>Your team</SectionLabel>
                  <span className="text-xs text-muted-foreground tnum">
                    {namedRows.length} / 10 · min 3
                  </span>
                </div>
                <div className="space-y-2">
                  {rows.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-5 text-center text-xs font-medium text-muted-foreground tnum">{i + 1}</span>
                      <Input
                        value={r.name}
                        onChange={(e) => setRow(i, { name: e.target.value })}
                        placeholder="Full name"
                        className="flex-1"
                      />
                      <Input
                        value={r.email}
                        onChange={(e) => setRow(i, { email: e.target.value })}
                        placeholder="email@company.com"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeRow(i)}
                        disabled={rows.length <= 3}
                        aria-label="Remove"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addRow} disabled={rows.length >= 10}>
                  <Plus /> Add team member
                </Button>
              </CardContent>
            </Card>

            <div className="flex items-center gap-3">
              <Button type="submit" size="lg" disabled={!canSubmit || submitting}>
                {submitting ? "Creating…" : "Create my readiness check"}
                <ArrowRight />
              </Button>
              {!canSubmit ? (
                <span className="text-xs text-muted-foreground">
                  Add a company, a question, and at least 3 team members.
                </span>
              ) : null}
            </div>
          </div>

          {/* ── Preview column ── */}
          <div className="space-y-6 lg:col-span-5">
            <Card className="overflow-hidden">
              <div className="border-b border-border bg-accent px-5 py-4 text-accent-foreground">
                <div className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white/70">
                  {meta.label}
                </div>
                <div className="mt-0.5 text-sm font-medium leading-snug text-white/95">{meta.blurb}</div>
              </div>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <SectionLabel>What this checkup measures</SectionLabel>
                  <Badge variant="muted">{skills.length} skills</Badge>
                </div>
                <ul className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
                  {skills.map((s) => (
                    <li key={s.key} className="flex items-center gap-2">
                      <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="text-sm font-medium">{s.name}</span>
                    </li>
                  ))}
                </ul>
                <p className="border-t border-border pt-3 text-[0.7rem] leading-relaxed text-muted-foreground">
                  Grounded in the <span className="font-medium text-foreground">BESSI</span> framework —
                  research-validated human-skill domains. Demo scores are illustrative.
                </p>
              </CardContent>
            </Card>

            <RecentPacks />
          </div>
        </form>
      </main>
    </div>
  );
}

function RecentPacks() {
  const { packs, mounted } = usePacks();
  if (!mounted) return null;
  return (
    <Card>
      <CardContent className="space-y-3">
        <SectionLabel>Recent proof packs</SectionLabel>
        <div className="space-y-1.5">
          {packs.map((p) => (
            <Link
              key={p.id}
              href={`/pack/${p.id}`}
              className="group flex items-center justify-between gap-3 rounded-lg border border-transparent px-2.5 py-2 transition-colors hover:border-border hover:bg-muted/60"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{p.prospect.company}</span>
                  {p.id === DEMO_PACK_ID ? <Badge variant="info" className="shrink-0">Sample</Badge> : null}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {getInitiative(p.initiative).label} · {p.participants.length} people
                </div>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
