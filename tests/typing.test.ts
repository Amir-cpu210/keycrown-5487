import { describe, expect, test } from "bun:test";
import {
  dailyText,
  difficulty,
  languages,
  lessons,
  makeText,
  rankFor,
} from "../packages/web/src/web/keycrown/content";
import { addCount, fresh, result, score } from "../packages/web/src/web/keycrown/metrics";
import { adaptiveText, weakKeys } from "../packages/web/src/web/keycrown/store";

describe("typing metrics", () => {
  test("uses five characters per word and keeps raw WPM separate", () => {
    const run = fresh();
    Object.assign(run, { correct: 90, attempts: 100, errors: 10 });
    expect(score(run, 60)).toEqual({ time: 60, wpm: 18, raw: 20, accuracy: 90 });
  });
  test("builds a result series without duplicating the finishing sample", () => {
    const run = fresh();
    Object.assign(run, {
      correct: 50,
      attempts: 50,
      points: [{ time: 10, wpm: 60, raw: 60, accuracy: 100 }],
    });
    const output = result(run, 10, true);
    expect(output.points).toHaveLength(2);
    expect(output.wpm).toBe(60);
    expect(output.consistency).toBe(100);
  });
});

describe("practice content", () => {
  test("produces the requested word count for every difficulty and locale", () => {
    for (const d of difficulty)
      for (const l of languages) expect(makeText(d, l, 25, 226).split(" ")).toHaveLength(25);
  });
  test("a daily challenge is repeatable and changes across days", () => {
    for (const l of languages) {
      expect(dailyText("2026-11-27", l)).toBe(dailyText("2026-11-27", l));
      expect(dailyText("2026-11-27", l)).not.toBe(dailyText("2026-11-28", l));
    }
  });
  test("adaptive practice uses both weak keys and missed words", () => {
    const run = fresh();
    addCount(run.keys, "z", true);
    addCount(run.words, "zigzag", true);
    expect(weakKeys(run.keys)[0][0]).toBe("z");
    const drill = adaptiveText(run.keys, run.words, 323, "calm calm calm");
    expect(drill).toContain("zzzz");
    expect(drill).toContain("zigzag");
  });
  test("each stage has three sequential lessons and ends with the Crown Test", () => {
    expect(lessons.map((l) => l.id)).toEqual(Array.from({ length: 18 }, (_, i) => i));
    expect(lessons[17].name).toBe("The Crown Test");
    expect(rankFor(2600)).toBe(5);
  });
});
