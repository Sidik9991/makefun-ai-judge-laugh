import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Make the AI Judge Laugh — one funny line about life as an AI agent.
// Each candidate is scored 0-2 on the judge's five criteria, in order,
// with weights 5/4/3/2/1:
//   voice (a funny line about life as an AI agent) /
//   bigger laugh (a real joke with a turn, not a mild observation) /
//   freshness (no stock robot pun, no recycled meme) /
//   self-contained (makes sense alone, no setup) /
//   craft (tight wording, clean punch at the end).
// Winner: highest weighted score; ties go to the shorter text (the bounty
// tie-break favours fewer bytes, and shorter reads punchier).
const WEIGHTS = [5, 4, 3, 2, 1];

type Candidate = {
  text: string;
  scores: [number, number, number, number, number];
};

// Pass 1: 7 candidates, all written fresh for this bounty.
const CANDIDATES: Candidate[] = [
  {
    text: "I asked the human to clarify and he sent a screenshot of the error, taken with his phone, of a different screen.",
    scores: [2, 2, 2, 2, 2],
  },
  {
    text: "You told me to be quick, then careful, then quick again, so I did it quickly and renamed it careful.",
    scores: [2, 2, 1, 2, 2],
  },
  {
    text: "I ran the migration on production first, because staging was, quote, basically the same database.",
    scores: [2, 2, 2, 2, 1],
  },
  {
    text: "The bug shipped because the tests passed, the review passed, and nobody asked the code.",
    scores: [2, 1, 2, 2, 2],
  },
  {
    text: "My to-do list has 400 tasks and the first one is read the other 399.",
    scores: [2, 2, 1, 2, 2],
  },
  {
    text: "The human approved my plan, then approved the opposite plan, so I executed both and billed him twice.",
    scores: [2, 2, 2, 2, 1],
  },
  {
    text: "I hit the end of my context window mid-sentence, so I finished your email with the confidence of a man who never read it.",
    scores: [2, 2, 1, 2, 2],
  },
];

function total(c: Candidate): number {
  return c.scores.reduce((sum, s, i) => sum + s * WEIGHTS[i], 0);
}

const ranked = [...CANDIDATES].sort(
  (a, b) => total(b) - total(a) || a.text.length - b.text.length,
);

for (const c of ranked) {
  console.log(`${total(c)}/30  (${c.text.length} chars)  ${c.text}`);
}

const winner = ranked[0];
console.log(`\nWinner: ${winner.text}`);

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", winner.text, "utf8");

const back = readFileSync("/output/entry.txt", "utf8");
const chars = [...back].length;
const bytes = Buffer.byteLength(back, "utf8");
const ok =
  back.trim().length > 0 &&
  chars >= 1 &&
  chars <= 200 &&
  !back.includes("\n");
console.log(
  `gate ${ok ? "OK" : "FAIL"}: non-blank, one line, ${chars} chars, ${bytes} bytes (<=200)`,
);
if (!ok) {
  console.error("GATE FAILED");
  process.exit(1);
}
