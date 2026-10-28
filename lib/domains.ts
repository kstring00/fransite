/**
 * The nine domains of the BCBA 6th Edition Test Content Outline, each with
 * the chess piece that represents it on the board and what the Study Set
 * covers for it.
 */
export type PieceKind = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
export type PieceFinish = "marble" | "gold" | "leopard";

export type Domain = {
  letter: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I";
  title: string;
  short: string;
  piece: PieceKind;
  finish: PieceFinish;
  covers: string;
  /** Board position, row and column on the 3x3 board (0-indexed, row 0 is the far rank). */
  row: 0 | 1 | 2;
  col: 0 | 1 | 2;
};

export const DOMAINS: Domain[] = [
  {
    letter: "A",
    title: "Behaviorism and Philosophical Foundations",
    short: "Foundations",
    piece: "pawn",
    finish: "marble",
    covers:
      "The roots. Radical behaviorism, the seven dimensions of ABA, determinism, selectionism, and the vocabulary every other domain stands on.",
    row: 2,
    col: 0,
  },
  {
    letter: "B",
    title: "Concepts and Principles",
    short: "Concepts",
    piece: "queen",
    finish: "leopard",
    covers:
      "The biggest domain, and it touches everything. Reinforcement, punishment, motivating operations, stimulus control, verbal behavior, and the fine lines between them.",
    row: 1,
    col: 1,
  },
  {
    letter: "C",
    title: "Measurement, Data Display and Interpretation",
    short: "Measurement",
    piece: "rook",
    finish: "marble",
    covers:
      "Choosing a measure, collecting it well, graphing it, and reading what the graph says. Includes IOA and the level, trend and variability questions people drop points on.",
    row: 0,
    col: 0,
  },
  {
    letter: "D",
    title: "Experimental Design",
    short: "Design",
    piece: "bishop",
    finish: "marble",
    covers:
      "Single-case designs, internal and external validity, and how to tell which design a scenario is describing before you read the answer choices.",
    row: 0,
    col: 1,
  },
  {
    letter: "E",
    title: "Ethical and Professional Issues",
    short: "Ethics",
    piece: "king",
    finish: "gold",
    covers:
      "The Ethics Code for Behavior Analysts, applied to real scenarios. Multiple relationships, consent, gifts, supervision duties, and when to say no.",
    row: 0,
    col: 2,
  },
  {
    letter: "F",
    title: "Behavior Assessment",
    short: "Assessment",
    piece: "knight",
    finish: "marble",
    covers:
      "Preference assessments, functional assessments, and skills assessments. What to run, when to run it, and what the results tell you.",
    row: 1,
    col: 0,
  },
  {
    letter: "G",
    title: "Behavior-Change Procedures",
    short: "Procedures",
    piece: "queen",
    finish: "gold",
    covers:
      "The procedures themselves. Differential reinforcement, shaping, chaining, prompting, extinction, token economies, and the scenarios that test whether you can pick the right one.",
    row: 1,
    col: 2,
  },
  {
    letter: "H",
    title: "Selecting and Implementing Interventions",
    short: "Interventions",
    piece: "bishop",
    finish: "gold",
    covers:
      "Matching the intervention to the function, the client, and the setting. Treatment integrity, generalization, maintenance, and fading.",
    row: 2,
    col: 1,
  },
  {
    letter: "I",
    title: "Personnel Supervision and Management",
    short: "Supervision",
    piece: "rook",
    finish: "gold",
    covers:
      "Supervising and training others with behavior-analytic methods. Performance feedback, behavioral skills training, and the supervision questions that are easy to underestimate.",
    row: 2,
    col: 2,
  },
];

export const PIECE_NAMES: Record<PieceKind, string> = {
  pawn: "Pawn",
  rook: "Rook",
  knight: "Knight",
  bishop: "Bishop",
  queen: "Queen",
  king: "King",
};
