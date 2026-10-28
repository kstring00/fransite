/**
 * The free daily puzzle. One question per day, chosen by the day of the year,
 * so everyone sees the same position and it changes at midnight.
 *
 * If the bcba-prep engine is added to this project later, point
 * `getDailyPuzzle` at its question source and leave the component alone.
 */
export type PuzzleQuestion = {
  id: string;
  domain: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I";
  domainTitle: string;
  question: string;
  choices: [string, string, string, string];
  /** Index into choices. */
  answer: 0 | 1 | 2 | 3;
  explanation: string;
};

export const PUZZLE_BANK: PuzzleQuestion[] = [
  {
    id: "b-neg-reinforcement",
    domain: "B",
    domainTitle: "Concepts and Principles",
    question:
      "A child screams when a demand is presented, and the parent withdraws the demand. Over the next weeks the child screams more often when demands are presented. The screaming has been:",
    choices: ["Positively reinforced", "Negatively reinforced", "Negatively punished", "Placed on extinction"],
    answer: 1,
    explanation:
      "The behavior went up, so it was reinforced. The consequence was the removal of a stimulus, the demand, so the reinforcement is negative. Watch the direction of the behavior first, then ask whether something was added or taken away.",
  },
  {
    id: "c-total-count-ioa",
    domain: "C",
    domainTitle: "Measurement, Data Display and Interpretation",
    question:
      "Two observers count hand raises in the same 10-minute session. One records 8, the other records 10. Using total count IOA, their agreement is:",
    choices: ["20%", "80%", "90%", "125%"],
    answer: 1,
    explanation:
      "Total count IOA divides the smaller count by the larger and multiplies by 100. Eight divided by ten is 0.8, so 80%. It is the simplest IOA and also the least strict, because it says nothing about whether the observers agreed on the same hand raises.",
  },
  {
    id: "a-effective",
    domain: "A",
    domainTitle: "Behaviorism and Philosophical Foundations",
    question:
      "Baer, Wolf and Risley described seven dimensions of applied behavior analysis. Which dimension requires that the behavior change be large enough to have practical value?",
    choices: ["Applied", "Effective", "Generality", "Conceptually systematic"],
    answer: 1,
    explanation:
      "Effective means the change is big enough to matter in practice. Applied is about choosing a socially important behavior in the first place, and generality is about the change lasting and spreading to other settings.",
  },
  {
    id: "d-multiple-baseline",
    domain: "D",
    domainTitle: "Experimental Design",
    question:
      "A behavior analyst starts the same intervention with three students at different points in time, after baselines of different lengths. This is a:",
    choices: ["Reversal design", "Multiple baseline across participants", "Alternating treatments design", "Changing criterion design"],
    answer: 1,
    explanation:
      "Staggered baselines across people, with the intervention introduced to one at a time, is a multiple baseline across participants. It shows control without withdrawing treatment, which is why it is used when a reversal would be unethical or impossible.",
  },
  {
    id: "e-gifts",
    domain: "E",
    domainTitle: "Ethical and Professional Issues",
    question:
      "A client's parent offers a BCBA a weekend at their lake house as a thank-you. Under the Ethics Code for Behavior Analysts, the BCBA should:",
    choices: [
      "Accept, because thank-you gifts are allowed",
      "Accept only after services have ended",
      "Decline and explain the limit on gifts",
      "Accept if the parent signs a release",
    ],
    answer: 2,
    explanation:
      "The Ethics Code limits gifts between behavior analysts and clients, stakeholders, supervisees and trainees to a small monetary value in total. A weekend stay is far past that line, so the BCBA declines and explains why, ideally before the situation comes up by setting the expectation at intake.",
  },
  {
    id: "g-dra",
    domain: "G",
    domainTitle: "Behavior-Change Procedures",
    question:
      "A teacher reinforces hand raising and withholds attention when a student calls out. Calling out goes down and hand raising goes up. This procedure is:",
    choices: [
      "Differential reinforcement of other behavior",
      "Differential reinforcement of alternative behavior",
      "Differential reinforcement of low rates",
      "Noncontingent reinforcement",
    ],
    answer: 1,
    explanation:
      "Reinforcing a specific appropriate behavior while putting the problem behavior on extinction is DRA. DRO would reinforce the absence of calling out regardless of what else the student did, and DRL would reinforce calling out less often rather than replacing it.",
  },
  {
    id: "f-paired-stimulus",
    domain: "F",
    domainTitle: "Behavior Assessment",
    question: "A paired-stimulus preference assessment is used to:",
    choices: [
      "Identify the function of a problem behavior",
      "Rank items by how often each is chosen over the others",
      "Measure the rate of a target behavior",
      "Teach a new skill in small steps",
    ],
    answer: 1,
    explanation:
      "In a paired-stimulus assessment every item is presented against every other item, and the percentage of times each is chosen gives you a ranking. It takes longer than a multiple-stimulus assessment but produces a clearer hierarchy.",
  },
  {
    id: "h-setting-generalization",
    domain: "H",
    domainTitle: "Selecting and Implementing Interventions",
    question:
      "A skill taught in the clinic shows up at home and at school without any further teaching. This is an example of:",
    choices: ["Response maintenance", "Setting generalization", "Response generalization", "Behavioral contrast"],
    answer: 1,
    explanation:
      "The same behavior occurring in untrained settings is setting, or stimulus, generalization. Maintenance is the behavior lasting over time, and response generalization is a different, untrained behavior serving the same purpose.",
  },
  {
    id: "i-bst",
    domain: "I",
    domainTitle: "Personnel Supervision and Management",
    question: "Which supervision practice follows behavioral skills training?",
    choices: [
      "Assigning readings followed by a written quiz",
      "Instructions, modeling, rehearsal and feedback",
      "A monthly written performance review",
      "A written warning after an error",
    ],
    answer: 1,
    explanation:
      "Behavioral skills training has four parts: tell them, show them, have them practice, and give feedback, repeated until they reach criterion. Readings and reviews leave out the rehearsal and feedback that make skills stick.",
  },
];

/** Day of year in the visitor's local time, 0 to 365. */
export function dayOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

export function getDailyPuzzle(date = new Date()): PuzzleQuestion {
  return PUZZLE_BANK[dayOfYear(date) % PUZZLE_BANK.length];
}
