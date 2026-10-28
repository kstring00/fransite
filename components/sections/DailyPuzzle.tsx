"use client";
import { useRef, useState, useSyncExternalStore } from "react";
import { PUZZLE } from "@/lib/content";
import { SECTION_IDS } from "@/lib/config";
import { PUZZLE_BANK, getDailyPuzzle, type PuzzleQuestion } from "@/lib/puzzle";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { useReveal } from "@/components/motion/useReveal";
import "./DailyPuzzle.css";

const LETTERS = ["A", "B", "C", "D"] as const;
const subscribeNoop = () => () => {};
const getServerPuzzle = () => PUZZLE_BANK[0];

/**
 * 5.4 Daily puzzle. One free question a day, no account. Answers reveal with a
 * gold or oxblood sweep, then the explanation and a link to the Study Set.
 */
export function DailyPuzzle() {
  const sectionRef = useRef<HTMLElement>(null);
  // Today's position is picked on the client; the server renders the first
  // question so the markup matches during hydration.
  const question = useSyncExternalStore<PuzzleQuestion>(subscribeNoop, getDailyPuzzle, getServerPuzzle);
  const [chosen, setChosen] = useState<number | null>(null);

  useReveal(sectionRef, { stagger: 0.1 });

  const answered = chosen !== null;
  const correct = answered && chosen === question.answer;

  const stateFor = (i: number): "idle" | "correct" | "wrong" | "reveal" => {
    if (!answered) return "idle";
    if (i === chosen) return correct ? "correct" : "wrong";
    if (i === question.answer) return "reveal";
    return "idle";
  };

  return (
    <section id={SECTION_IDS.puzzle} ref={sectionRef} className="section" aria-labelledby="puzzle-heading">
      <div className="container">
        <SectionHeading
          id="puzzle-heading"
          num={PUZZLE.num}
          label={PUZZLE.label}
          align="center"
          title={
            <>
              One <em>free</em> position, every day.
            </>
          }
          lede={PUZZLE.lede}
        />

        <GlassCard className="puzzle-card mx-auto mt-14 w-full max-w-[760px] md:mt-16" padding="lg" data-enter>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="label-mono label-mono--gold">
              Domain {question.domain}, {question.domainTitle}
            </span>
            <Badge>Free, no account</Badge>
          </div>

          <p className="h-card mt-7 text-[clamp(22px,2.2vw,30px)] leading-[1.25]">{question.question}</p>

          <div className="puzzle-choices mt-8" role="group" aria-label="Answer choices">
            {question.choices.map((choice, i) => {
              const state = stateFor(i);
              return (
                <button
                  key={`${question.id}-${i}`}
                  type="button"
                  className="puzzle-choice"
                  data-state={state}
                  disabled={answered}
                  aria-pressed={answered ? chosen === i : undefined}
                  onClick={() => setChosen(i)}
                >
                  <span className="puzzle-choice__letter" aria-hidden="true">
                    {LETTERS[i]}
                  </span>
                  <span>
                    <span className="sr-only">{LETTERS[i]}. </span>
                    {choice}
                    {answered && i === question.answer ? <span className="sr-only"> (correct answer)</span> : null}
                  </span>
                </button>
              );
            })}
          </div>

          {!answered ? (
            <p className="label-mono mt-6 opacity-70" aria-hidden="true">
              {PUZZLE.submitHint}
            </p>
          ) : null}

          <div className={`puzzle-result mt-8 ${answered ? "is-shown" : ""}`} aria-live="polite" aria-atomic="true">
            {answered ? (
              <>
                <p className={`puzzle-result__verdict ${correct ? "puzzle-result__verdict--correct" : "puzzle-result__verdict--wrong"}`}>
                  {correct ? PUZZLE.correct : PUZZLE.wrong}
                </p>
                <p className="mt-4 text-[16px] leading-relaxed text-cream-2">{question.explanation}</p>
                <div className="hairline mt-8" />
                <p className="mt-6 text-[16px] leading-relaxed text-cream">{PUZZLE.after}</p>
                <a href={`#${SECTION_IDS.buy}`} className="link-draw mt-3 inline-block font-medium text-gold">
                  {PUZZLE.afterLink}
                </a>
              </>
            ) : null}
          </div>
        </GlassCard>

        <p className="label-mono mt-8 text-center" data-enter="none">
          {PUZZLE.newDaily}
        </p>
      </div>
    </section>
  );
}
