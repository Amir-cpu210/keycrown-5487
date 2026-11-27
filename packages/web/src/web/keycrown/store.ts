import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dateKey, lessons, random, type Language } from "./content";
export type Layout = "QWERTY" | "AZERTY" | "DVORAK" | "COLEMAK";
export type Settings = {
  theme: "dark" | "light";
  sound: boolean;
  font: number;
  layout: Layout;
  caret: "line" | "block" | "underline";
  language: Language;
  keyboard: boolean;
  stop: boolean;
  reduced: boolean;
  name: string;
};
export const defaults: Settings = {
  theme: "dark",
  sound: false,
  font: 25,
  layout: "QWERTY",
  caret: "line",
  language: "English",
  keyboard: true,
  stop: false,
  reduced: false,
  name: "You",
};
export type Kind =
  | "demo"
  | "practice"
  | "daily"
  | "adaptive"
  | "lesson"
  | "placement"
  | "race"
  | "survival"
  | "zen"
  | "falling";
export type Sample = { time: number; wpm: number; raw: number; accuracy: number };
export type Counter = Record<string, { attempts: number; errors: number }>;
export type Result = {
  wpm: number;
  raw: number;
  accuracy: number;
  consistency: number;
  duration: number;
  correct: number;
  attempts: number;
  errors: number;
  points: Sample[];
  keys: Counter;
  words: Counter;
  completed: boolean;
  note?: string;
  score?: number;
  won?: boolean;
};
export type Run = Omit<Result, "keys" | "words"> & {
  id: string;
  date: string;
  stamp: number;
  kind: Kind;
  label: string;
  xp: number;
  leaderboard: boolean;
};
export type DayRecord = { wpm: number; accuracy: number };
export type Outcome = { xp: number; stars: number; personalBest: boolean; placed?: number };
function merge(a: Counter, b: Counter): Counter {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) {
    const prev = Object.prototype.hasOwnProperty.call(a, k) ? a[k] : undefined;
    Object.defineProperty(out, k, {
      value: {
        attempts: (prev?.attempts ?? 0) + v.attempts,
        errors: (prev?.errors ?? 0) + v.errors,
      },
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }
  return out;
}
type State = {
  settings: Settings;
  runs: Run[];
  stars: Record<number, number>;
  placement: number;
  xp: number;
  keys: Counter;
  words: Counter;
  dates: string[];
  daily: string[];
  records: Record<string, DayRecord>;
  bestAccuracy: number;
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  reset: () => void;
  save: (kind: Kind, label: string, r: Result, lessonId?: number, competitive?: boolean) => Outcome;
};
export const useCrown = create<State>()(
  persist(
    (set, get) => ({
      settings: defaults,
      runs: [],
      stars: {},
      placement: 0,
      xp: 0,
      keys: {},
      words: {},
      dates: [],
      daily: [],
      records: {},
      bestAccuracy: 0,
      setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),
      reset: () =>
        set({
          runs: [],
          stars: {},
          placement: 0,
          xp: 0,
          keys: {},
          words: {},
          dates: [],
          daily: [],
          records: {},
          bestAccuracy: 0,
        }),
      save: (kind, label, r, lessonId, competitive) => {
        const s = get();
        const day = dateKey();
        const l = lessonId !== undefined ? lessons[lessonId] : undefined;
        const passed = !!(l && r.completed && r.wpm >= l.wpm && r.accuracy >= l.accuracy);
        const stars =
          passed && l
            ? r.wpm >= l.wpm * 1.25 && r.accuracy >= Math.max(99, l.accuracy)
              ? 3
              : r.wpm >= l.wpm * 1.1 && r.accuracy >= Math.max(97, l.accuracy)
                ? 2
                : 1
            : 0;
        const leaderboard = !!competitive && r.attempts >= 20 && r.accuracy >= 80;
        const prior = Object.values(s.records).reduce((a, x) => Math.max(a, x.wpm), 0);
        const bestToday = s.records[day];
        const personalBest = leaderboard && r.wpm > prior;
        const placed =
          kind === "placement" && r.completed && r.attempts >= 55 && r.accuracy >= 95
            ? r.wpm >= 55 && r.accuracy >= 98
              ? 15
              : r.wpm >= 42
                ? 12
                : r.wpm >= 32
                  ? 9
                  : r.wpm >= 24
                    ? 6
                    : r.wpm >= 16
                      ? 3
                      : 0
            : undefined;
        const earned =
          Math.min(70, Math.round(r.correct / 4)) +
          (passed && l && !s.stars[l.id] ? 30 : 0) +
          (kind === "daily" && r.completed && !s.daily.includes(day) ? 35 : 0) +
          (r.won ? 20 : 0);
        if (!r.attempts) return { xp: 0, stars: 0, personalBest: false, placed };
        const { keys, words, ...metrics } = r;
        set({
          runs: [
            {
              ...metrics,
              id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
              date: day,
              stamp: Date.now(),
              kind,
              label,
              xp: earned,
              leaderboard,
            },
            ...s.runs,
          ].slice(0, 120),
          stars: stars && l ? { ...s.stars, [l.id]: Math.max(stars, s.stars[l.id] ?? 0) } : s.stars,
          records:
            leaderboard &&
            (!bestToday ||
              r.wpm > bestToday.wpm ||
              (r.wpm === bestToday.wpm && r.accuracy > bestToday.accuracy))
              ? { ...s.records, [day]: { wpm: r.wpm, accuracy: r.accuracy } }
              : s.records,
          bestAccuracy: r.attempts >= 20 ? Math.max(s.bestAccuracy, r.accuracy) : s.bestAccuracy,
          placement: Math.max(s.placement, placed ?? 0),
          xp: s.xp + earned,
          keys: merge(s.keys, keys),
          words: merge(s.words, words),
          dates: s.dates.includes(day) ? s.dates : [...s.dates, day],
          daily:
            kind === "daily" && r.completed && !s.daily.includes(day) ? [...s.daily, day] : s.daily,
        });
        return { xp: earned, stars, personalBest, placed };
      },
    }),
    {
      name: "keycrown-v1",
      partialize: ({
        settings,
        runs,
        stars,
        placement,
        xp,
        keys,
        words,
        dates,
        daily,
        records,
        bestAccuracy,
      }) => ({
        settings,
        runs,
        stars,
        placement,
        xp,
        keys,
        words,
        dates,
        daily,
        records,
        bestAccuracy,
      }),
      merge: (persisted, current) => {
        const previous = persisted as Partial<State> | undefined;
        const records = previous?.records ?? {};
        let bestAccuracy = previous?.bestAccuracy ?? 0;
        for (const run of previous?.runs ?? []) {
          if (run.attempts >= 20) bestAccuracy = Math.max(bestAccuracy, run.accuracy);
          const old = records[run.date];
          if (
            run.leaderboard &&
            (!old || run.wpm > old.wpm || (run.wpm === old.wpm && run.accuracy > old.accuracy))
          )
            records[run.date] = { wpm: run.wpm, accuracy: run.accuracy };
        }
        return {
          ...current,
          ...previous,
          records,
          bestAccuracy,
          settings: { ...defaults, ...previous?.settings },
        };
      },
    },
  ),
);
export function streak(dates: string[]) {
  const d = new Date();
  if (!dates.includes(dateKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (dates.includes(dateKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
export function weakKeys(data: Counter) {
  return Object.entries(data)
    .filter(([k, v]) => k !== " " && v.errors > 0)
    .sort(
      (a, b) =>
        b[1].errors / b[1].attempts - a[1].errors / a[1].attempts || b[1].errors - a[1].errors,
    );
}
export function adaptiveText(keys: Counter, words: Counter, seed: number, fallback: string) {
  const letters = weakKeys(keys)
    .slice(0, 5)
    .map(([k]) => k);
  const missed = Object.entries(words)
    .filter(([, w]) => w.errors)
    .sort((a, b) => b[1].errors - a[1].errors)
    .slice(0, 12)
    .map(([k]) => k);
  const base = fallback.split(" ");
  const pool = [
    ...missed,
    ...missed,
    ...base.filter((w) => letters.some((k) => w.toLowerCase().includes(k))),
  ];
  if (!pool.length && !letters.length) return fallback;
  const rng = random(seed);
  return Array.from({ length: 30 }, (_, i) =>
    letters.length && (i % 4 === 0 || !pool.length)
      ? Array.from({ length: 4 }, () => letters[Math.floor(rng() * letters.length)]).join("")
      : pool[Math.floor(rng() * pool.length)],
  ).join(" ");
}
