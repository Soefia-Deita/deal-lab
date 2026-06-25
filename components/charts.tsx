import * as React from "react";
import type { Participant, ReadinessBand, SkillSummary } from "@/lib/types";
import { bandFromScore } from "@/lib/generate";
import { cn, initials } from "@/lib/utils";

// ── Band → color mapping ───────────────────────────────────────────────
export const BAND_META: Record<
  ReadinessBand,
  { label: string; hex: string; text: string; bg: string; chip: string }
> = {
  strong: {
    label: "Strong",
    hex: "#2f7a4f",
    text: "text-success",
    bg: "bg-success",
    chip: "bg-success/12 text-success border-success/20",
  },
  moderate: {
    label: "Moderate",
    hex: "#b07314",
    text: "text-warning",
    bg: "bg-warning",
    chip: "bg-warning/12 text-warning border-warning/20",
  },
  "at-risk": {
    label: "At-risk",
    hex: "#c1521d",
    text: "text-destructive",
    bg: "bg-destructive",
    chip: "bg-destructive/12 text-destructive border-destructive/20",
  },
};

export function bandHex(band: ReadinessBand) {
  return BAND_META[band].hex;
}

// ── Radial readiness gauge ─────────────────────────────────────────────
export function ReadinessGauge({
  value,
  band,
  size = 168,
  label = "Team readiness",
}: {
  value: number;
  band: ReadinessBand;
  size?: number;
  label?: string;
}) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  const hex = bandHex(band);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={hex}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          className="animate-draw"
          style={{ ["--draw-len" as string]: c }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[2.6rem] font-bold leading-none tracking-tight tnum text-foreground">
          {value}
        </span>
        <span className="text-xs font-medium text-muted-foreground">out of 100</span>
        <span
          className="mt-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold"
          style={{ color: hex, borderColor: `${hex}33`, backgroundColor: `${hex}1f` }}
        >
          {BAND_META[band].label}
        </span>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

// ── Readiness scale (signature instrument) ─────────────────────────────
// A tri-band spectrum with a needle at the team's position. The bands encode
// the real thresholds (at-risk < 58, moderate 58–71, strong ≥ 72).
export function ReadinessScale({ value, band }: { value: number; band: ReadinessBand }) {
  const zones = [
    { key: "at-risk" as const, label: "At-risk", basis: 58 },
    { key: "moderate" as const, label: "Moderate", basis: 14 },
    { key: "strong" as const, label: "Strong", basis: 28 },
  ];
  const hex = bandHex(band);
  return (
    <div className="w-full">
      {/* number + verdict chip on the needle */}
      <div className="relative mb-2 h-8">
        <div
          className="animate-needle absolute -translate-x-1/2"
          style={{ ["--needle-pos" as string]: `${value}%` }}
        >
          <div className="flex flex-col items-center">
            <span className="font-serif text-2xl font-semibold leading-none tnum" style={{ color: hex }}>
              {value}
            </span>
          </div>
        </div>
      </div>
      {/* track */}
      <div className="relative">
        <div className="flex h-3 overflow-hidden rounded-full">
          {zones.map((z) => (
            <div
              key={z.key}
              style={{ flexBasis: `${z.basis}%`, backgroundColor: `${BAND_META[z.key].hex}${z.key === band ? "59" : "24"}` }}
            />
          ))}
        </div>
        {/* needle */}
        <div
          className="animate-needle absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] bg-card shadow"
          style={{ ["--needle-pos" as string]: `${value}%`, borderColor: hex }}
        />
      </div>
      {/* zone labels */}
      <div className="mt-2 flex">
        {zones.map((z) => (
          <div
            key={z.key}
            style={{ flexBasis: `${z.basis}%` }}
            className={cn(
              "text-[0.7rem] font-semibold uppercase tracking-wide",
              z.key === "moderate" ? "text-center" : z.key === "strong" ? "text-right" : "text-left",
              z.key === band ? BAND_META[z.key].text : "text-muted-foreground/50"
            )}
          >
            {z.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Horizontal skill bar ───────────────────────────────────────────────
export function ScoreBar({
  label,
  score,
  band,
  right,
  className,
}: {
  label: React.ReactNode;
  score: number;
  band?: ReadinessBand;
  right?: React.ReactNode;
  className?: string;
}) {
  const b = band ?? bandFromScore(score);
  return (
    <div className={cn("group", className)}>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="truncate text-sm font-medium text-foreground">{label}</span>
        <span className="flex shrink-0 items-center gap-2">
          <span className={cn("text-sm font-semibold tnum", BAND_META[b].text)}>{score}</span>
          {right}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", BAND_META[b].bg)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// ── Team skill radar ───────────────────────────────────────────────────
export function SkillRadar({
  summaries,
  size = 320,
}: {
  summaries: SkillSummary[];
  size?: number;
}) {
  const HP = 76; // horizontal gutter so long axis labels don't clip
  const W = size + HP * 2;
  const cx = W / 2;
  const cy = size / 2;
  const maxR = size / 2 - 30;
  const n = summaries.length;
  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, value: number) => {
    const a = angleFor(i);
    const r = (value / 100) * maxR;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  };
  const rings = [25, 50, 75, 100];
  const polygon = summaries.map((s, i) => point(i, s.teamAverage).join(",")).join(" ");

  return (
    <svg width={W} height={size} viewBox={`0 0 ${W} ${size}`} className="max-w-full">
      {/* grid rings */}
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={summaries
            .map((_, i) => {
              const a = angleFor(i);
              const r = (ring / 100) * maxR;
              return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
            })
            .join(" ")}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
        />
      ))}
      {/* axes + labels */}
      {summaries.map((s, i) => {
        const a = angleFor(i);
        const [ex, ey] = [cx + maxR * Math.cos(a), cy + maxR * Math.sin(a)];
        const [lx, ly] = [cx + (maxR + 16) * Math.cos(a), cy + (maxR + 16) * Math.sin(a)];
        const anchor = Math.abs(Math.cos(a)) < 0.3 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
        const short = s.skill.name.split(" ").slice(0, 2).join(" ");
        return (
          <g key={s.skill.key}>
            <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="var(--border)" strokeWidth={1} />
            <text
              x={lx}
              y={ly}
              textAnchor={anchor as "start" | "middle" | "end"}
              dominantBaseline="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 10, fontWeight: 600 }}
            >
              {short}
            </text>
          </g>
        );
      })}
      {/* data polygon */}
      <polygon points={polygon} fill="rgb(43 76 126 / 0.16)" stroke="var(--primary)" strokeWidth={2} />
      {summaries.map((s, i) => {
        const [px, py] = point(i, s.teamAverage);
        return <circle key={s.skill.key} cx={px} cy={py} r={3.5} fill="var(--primary)" />;
      })}
    </svg>
  );
}

// ── Participant × skill heatmap ────────────────────────────────────────
function cellStyle(score: number): React.CSSProperties {
  const band = bandFromScore(score);
  const hex = bandHex(band);
  // intensity scales with how far above the band floor the score is
  const alpha = 0.16 + (score / 100) * 0.55;
  return { backgroundColor: `${hex}${Math.round(alpha * 255).toString(16).padStart(2, "0")}` };
}

export function ParticipantHeatmap({
  participants,
  summaries,
  scoreOf,
  leadId,
}: {
  participants: Participant[];
  summaries: SkillSummary[];
  scoreOf: (pid: string, key: string) => number;
  leadId?: string;
}) {
  return (
    <div className="overflow-x-auto no-scrollbar">
      <table className="w-full border-separate border-spacing-1 text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-card text-left text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Team member
            </th>
            {summaries.map((s) => (
              <th
                key={s.skill.key}
                className="px-1 pb-1 text-center align-bottom text-[0.65rem] font-medium leading-tight text-muted-foreground"
                style={{ minWidth: 52 }}
              >
                {s.skill.name.split(" ").slice(0, 2).join(" ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => (
            <tr key={p.id}>
              <td className="sticky left-0 z-10 bg-card pr-3 whitespace-nowrap">
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex size-6 items-center justify-center rounded-full text-[0.65rem] font-semibold",
                      p.id === leadId
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {initials(p.name)}
                  </span>
                  <span className="text-sm font-medium text-foreground">{p.name}</span>
                  {p.id === leadId ? (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-primary">
                      Lead
                    </span>
                  ) : null}
                </span>
              </td>
              {summaries.map((s) => {
                const v = scoreOf(p.id, s.skill.key);
                return (
                  <td key={s.skill.key} className="p-0">
                    <div
                      className="flex h-9 items-center justify-center rounded-md text-xs font-semibold tnum text-foreground/90"
                      style={cellStyle(v)}
                      title={`${p.name} · ${s.skill.name}: ${v}`}
                    >
                      {v}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
