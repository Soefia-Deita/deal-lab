import type { InitiativeType } from "./types";
import { getInitiative, lcInitiative } from "./skills";

export type QuestionType = "likert" | "scenario" | "forced-choice";

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  helper?: string;
  /** Likert option labels, low → high. */
  scale?: string[];
  /** Forced-choice options. */
  options?: string[];
}

const LIKERT_FREQ = ["Rarely", "Sometimes", "Often", "Usually", "Almost always"];
const LIKERT_AGREE = [
  "Not like me",
  "A little like me",
  "Somewhat like me",
  "Mostly like me",
  "Very like me",
];

/**
 * 8 business-friendly questions. The initiative label is woven into a couple
 * of prompts so the checkup feels tailored without bloating the question bank.
 */
export function getQuestions(initiative: InitiativeType): AssessmentQuestion[] {
  // Short, prose-friendly form, e.g. "AI implementation", "post-merger".
  const label = lcInitiative(getInitiative(initiative).label.replace(/ Readiness| Integration/g, ""));

  return [
    {
      id: "q1",
      type: "likert",
      prompt: "When priorities shift suddenly, I adjust my plan and keep moving without losing momentum.",
      scale: LIKERT_AGREE,
    },
    {
      id: "q2",
      type: "likert",
      prompt: "I take ownership of outcomes even when the work crosses team boundaries and no one assigned it to me.",
      scale: LIKERT_AGREE,
    },
    {
      id: "q3",
      type: "forced-choice",
      prompt: `Your team is kicking off this ${label} effort. Where do you naturally gravitate first?`,
      helper: "Pick the one that fits you best.",
      options: [
        "Map the plan and own the moving pieces end-to-end",
        "Bring the cross-functional people together and align them",
        "Pressure-test the risks and unknowns before we commit",
        "Get hands-on and learn the new tools fast",
      ],
    },
    {
      id: "q4",
      type: "likert",
      prompt: "I keep stakeholders in other functions genuinely informed — not just looped in after decisions are made.",
      helper: "Cross-functional alignment.",
      scale: LIKERT_FREQ,
    },
    {
      id: "q5",
      type: "scenario",
      prompt: "A new tool gives you an answer you're not fully sure about, and a decision is due today. What do you do?",
      helper: "A sentence or two is plenty.",
    },
    {
      id: "q6",
      type: "likert",
      prompt: "When something I rely on changes, I get up to speed quickly rather than waiting for formal training.",
      scale: LIKERT_FREQ,
    },
    {
      id: "q7",
      type: "forced-choice",
      prompt: "Which best describes how you handle disagreement on your team?",
      options: [
        "I surface it early and work it to a shared decision",
        "I focus on the goal and find the practical middle",
        "I defer to whoever owns the call and commit fully",
        "I avoid it unless it's blocking the work",
      ],
    },
    {
      id: "q8",
      type: "scenario",
      prompt: `What would make this ${label} effort most likely to succeed on your team — and what worries you about it?`,
      helper: "Optional, but the most useful signal for your leadership.",
    },
  ];
}
