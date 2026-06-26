"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock, Lock, ShieldCheck } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getInitiative, lcInitiative } from "@/lib/skills";
import { getQuestions } from "@/lib/assessment";
import { markParticipantComplete, usePack } from "@/lib/store";
import { cn, pct } from "@/lib/utils";

export default function ProspectPage() {
  const { id } = useParams<{ id: string }>();
  const { pack, mounted } = usePack(id);

  const [participantId, setParticipantId] = React.useState("");
  const [answers, setAnswers] = React.useState<Record<string, string | number>>({});
  const [done, setDone] = React.useState(false);

  const questions = React.useMemo(
    () => (pack ? getQuestions(pack.initiative) : []),
    [pack]
  );

  if (!mounted) return <div className="min-h-screen bg-background" />;
  if (!pack) return <ProspectNotFound />;

  const meta = getInitiative(pack.initiative);
  const required = questions.filter((q) => q.type !== "scenario");
  const answeredRequired = required.filter((q) => answers[q.id] !== undefined && answers[q.id] !== "").length;
  // Default to the first not-yet-completed person; the picker can override.
  const defaultId = (pack.participants.find((p) => p.status === "invited") ?? pack.participants[0])?.id ?? "";
  const selectedId = participantId || defaultId;
  const canSubmit = answeredRequired === required.length && !!selectedId;

  async function submit() {
    if (!canSubmit || !pack) return;
    await markParticipantComplete(pack.id, selectedId);
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <ProspectFrame company={pack.prospect.company}>
        <Card className="animate-fade-up">
          <CardContent className="flex flex-col items-center px-6 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-success/12 text-success">
              <CheckCircle2 className="size-7" />
            </div>
            <h1 className="mt-4 text-xl font-bold tracking-tight">Thanks — you&apos;re done.</h1>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Your responses help build {pack.prospect.company}&apos;s{" "}
              {lcInitiative(meta.label)} report — who can lead it, and where the risks are.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Button asChild>
                <Link href={`/report/${pack.id}`}>
                  See the team readiness report <ArrowRight />
                </Link>
              </Button>
              <Button variant="ghost" onClick={() => { setDone(false); setAnswers({}); }}>
                Complete for another person
              </Button>
            </div>
          </CardContent>
        </Card>
      </ProspectFrame>
    );
  }

  return (
    <ProspectFrame company={pack.prospect.company}>
      {/* Intro */}
      <div className="mb-6">
        <Badge variant="info" className="gap-1.5">
          <ShieldCheck className="size-3" /> {meta.label} Checkup
        </Badge>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">
          A 2-minute readiness check for the {pack.prospect.company} team
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          No right answers, no studying. Just be honest — it helps your leadership see where the team is
          strong and where a little support would de-risk what&apos;s ahead.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> ~2 minutes</span>
          <span className="inline-flex items-center gap-1">{questions.length} quick questions</span>
          <span className="inline-flex items-center gap-1"><Lock className="size-3.5" /> Confidential · SOC 2-aware</span>
        </div>
      </div>

      {/* Who */}
      <Card className="mb-4">
        <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium">Completing as</div>
            <div className="text-xs text-muted-foreground">Pick your name so your responses are attributed.</div>
          </div>
          <Select
            value={selectedId}
            onChange={(e) => setParticipantId(e.target.value)}
            className="sm:w-64"
          >
            {pack.participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}{p.status === "completed" ? " · done" : ""}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, i) => (
          <Card key={q.id}>
            <CardContent className="py-5">
              <div className="flex gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary tnum">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-snug text-foreground">{q.prompt}</p>
                  {q.helper ? <p className="mt-0.5 text-xs text-muted-foreground">{q.helper}</p> : null}

                  <div className="mt-3">
                    {q.type === "likert" ? (
                      <div className="flex flex-wrap gap-1.5">
                        {q.scale!.map((opt, idx) => {
                          const active = answers[q.id] === idx;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setAnswers((a) => ({ ...a, [q.id]: idx }))}
                              className={cn(
                                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                                active
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                              )}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}

                    {q.type === "forced-choice" ? (
                      <div className="space-y-2">
                        {q.options!.map((opt) => {
                          const active = answers[q.id] === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                              className={cn(
                                "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-all",
                                active
                                  ? "border-primary bg-primary/[0.06] text-foreground"
                                  : "border-border bg-card text-foreground/80 hover:border-primary/40"
                              )}
                            >
                              <span
                                className={cn(
                                  "flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                                  active ? "border-primary" : "border-muted-foreground/40"
                                )}
                              >
                                {active ? <span className="size-2 rounded-full bg-primary" /> : null}
                              </span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}

                    {q.type === "scenario" ? (
                      <Textarea
                        value={(answers[q.id] as string) ?? ""}
                        onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                        placeholder="Type a sentence or two…"
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sticky submit */}
      <div className="sticky bottom-4 mt-5">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="h-2 w-28 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct(answeredRequired, required.length)}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground tnum">
              {answeredRequired}/{required.length} answered
            </span>
          </div>
          <Button onClick={submit} disabled={!canSubmit}>
            Submit checkup <ArrowRight />
          </Button>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Powered by Soefia · Grounded in the BESSI framework of human skills
      </p>
    </ProspectFrame>
  );
}

function ProspectFrame({ company, children }: { company: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen dot-grid">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
          <Wordmark />
          <span className="hidden text-xs text-muted-foreground sm:block">
            Confidential checkup · {company}
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-8">{children}</main>
    </div>
  );
}

function ProspectNotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <h1 className="text-lg font-semibold">This checkup link is no longer active</h1>
        <p className="mt-1 text-sm text-muted-foreground">Please ask your contact for an updated link.</p>
      </div>
    </div>
  );
}
