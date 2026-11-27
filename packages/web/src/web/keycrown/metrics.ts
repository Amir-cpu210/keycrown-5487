import type { Counter, Result, Sample } from "./store";
export function addCount(data: Counter, key: string, error: boolean) {
  const cell = data[key] ?? (data[key] = { attempts: 0, errors: 0 });
  cell.attempts++;
  if (error) cell.errors++;
}
export type Session = {
  started: number | null;
  cursor: string[];
  correct: number;
  attempts: number;
  errors: number;
  keys: Counter;
  words: Counter;
  points: Sample[];
  finished: boolean;
  last: string;
  lastWrong: boolean;
  budget: number;
};
export function fresh(budget = 0): Session {
  return {
    started: null,
    cursor: [],
    correct: 0,
    attempts: 0,
    errors: 0,
    keys: Object.create(null),
    words: Object.create(null),
    points: [],
    finished: false,
    last: "",
    lastWrong: false,
    budget,
  };
}
export function score(s: Session, elapsed: number): Sample {
  const minutes = Math.max(1, elapsed) / 60;
  return {
    time: Math.round(elapsed * 10) / 10,
    wpm: Math.round(s.correct / 5 / minutes),
    raw: Math.round(s.attempts / 5 / minutes),
    accuracy: s.attempts ? Math.round(1000 * (1 - s.errors / s.attempts)) / 10 : 100,
  };
}
export function result(s: Session, elapsed: number, completed: boolean): Result {
  const m = score(s, elapsed);
  const points = [
    { time: 0, wpm: 0, raw: 0, accuracy: 100 },
    ...s.points.filter((p) => p.time < m.time),
    m,
  ];
  const pace = points.slice(1).map((p, i) => {
    const prev = points[i];
    return (p.wpm * p.time - prev.wpm * prev.time) / Math.max(0.25, p.time - prev.time);
  });
  const avg = pace.reduce((a, n) => a + n, 0) / pace.length;
  const sd = Math.sqrt(pace.reduce((a, n) => a + (n - avg) ** 2, 0) / pace.length);
  const { time, ...metrics } = m;
  return {
    ...metrics,
    duration: time,
    consistency: avg > 0 ? Math.round(Math.max(0, 100 * (1 - sd / avg))) : 0,
    correct: s.correct,
    attempts: s.attempts,
    errors: s.errors,
    points,
    keys: s.keys,
    words: s.words,
    completed,
  };
}
let context: AudioContext | undefined;
export function keySound(error: boolean) {
  try {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume();
    const t = context.currentTime;
    const sound = context.createOscillator(),
      volume = context.createGain();
    sound.type = "sine";
    sound.frequency.setValueAtTime(error ? 175 : 480, t);
    sound.frequency.exponentialRampToValueAtTime(error ? 100 : 270, t + 0.042);
    volume.gain.setValueAtTime(0.029, t);
    volume.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    sound.connect(volume);
    volume.connect(context.destination);
    sound.start(t);
    sound.stop(t + 0.05);
  } catch {
    /* Audio is optional. */
  }
}
