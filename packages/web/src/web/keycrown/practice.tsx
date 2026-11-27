import { useState } from "react";
import { useSearch } from "wouter";
import { CalendarDays, Clock3, SlidersHorizontal, Sparkles, WholeWord } from "lucide-react";
import { dateKey, difficulty, dailyText, makeText, type Difficulty } from "./content";
import { TypingEngine } from "./engine";
import { PageHead } from "./shared";
import { adaptiveText, weakKeys, useCrown } from "./store";
export default function Practice() {
  const query = useSearch();
  return <PracticeScreen key={query} initial={new URLSearchParams(query).get("mode")} />;
}
function PracticeScreen({ initial }: { initial: string | null }) {
  const language = useCrown((s) => s.settings.language),
    keys = useCrown((s) => s.keys),
    words = useCrown((s) => s.words),
    daily = useCrown((s) => s.daily);
  const [mode, setMode] = useState(
    initial === "daily" || initial === "adaptive" ? initial : "time",
  );
  const [seconds, setSeconds] = useState(30),
    [count, setCount] = useState(25),
    [level, setLevel] = useState<Difficulty>("Common words"),
    [seed, reseed] = useState(Date.now),
    [drill, setDrill] = useState(() =>
      adaptiveText(keys, words, seed, makeText("Common words", language, 45, seed)),
    );
  const day = dateKey();
  const text =
    mode === "daily"
      ? dailyText(day, language)
      : mode === "adaptive"
        ? drill
        : makeText(level, language, mode === "time" ? seconds * 4 : count, seed);
  const label =
    mode === "daily"
      ? "Daily challenge"
      : mode === "adaptive"
        ? "Adaptive drill"
        : `${level} · ${mode === "time" ? `${seconds}s` : `${count} words`}`;
  const modes = [
    { id: "time", name: "Time", icon: Clock3 },
    { id: "words", name: "Words", icon: WholeWord },
    { id: "daily", name: "Daily challenge", icon: CalendarDays },
    { id: "adaptive", name: "Adaptive", icon: Sparkles },
  ];
  return (
    <main className="shell inner-page">
      <PageHead
        tag="THE ARENA"
        title="Free practice"
        sub="Choose a drill, get comfortable, and find a pace you can hold."
      />
      <div className="surface practice-controls">
        <div className="mode-tabs" aria-label="Practice mode">
          {modes.map(({ id, name, icon: Icon }) => (
            <button
              type="button"
              key={id}
              aria-pressed={mode === id}
              onClick={() => {
                if (id === "adaptive")
                  setDrill(
                    adaptiveText(
                      keys,
                      words,
                      Date.now(),
                      makeText("Common words", language, 45, Date.now()),
                    ),
                  );
                setMode(id);
              }}
            >
              <Icon size={16} />
              {name}
            </button>
          ))}
        </div>
        {mode === "time" || mode === "words" ? (
          <div className="practice-options">
            <div className="option-group" aria-label={mode === "time" ? "Duration" : "Word count"}>
              {(mode === "time" ? [15, 30, 60, 120] : [10, 25, 50, 100]).map((n) => (
                <button
                  type="button"
                  key={n}
                  className="chip"
                  aria-pressed={(mode === "time" ? seconds : count) === n}
                  onClick={() => (mode === "time" ? setSeconds(n) : setCount(n))}
                >
                  {n}
                  {mode === "time" ? "s" : ""}
                </button>
              ))}
            </div>
            <label className="select-label">
              <SlidersHorizontal size={16} />
              <span className="sr-only">Difficulty</span>
              <select value={level} onChange={(e) => setLevel(e.target.value as Difficulty)}>
                {difficulty.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <div className="practice-note">
            {mode === "daily"
              ? `${day} · ${daily.includes(day) ? "Completed today" : "35 bonus XP on first completion"}`
              : weakKeys(keys).length
                ? `Target keys: ${weakKeys(keys)
                    .slice(0, 5)
                    .map(([k]) => k.toUpperCase())
                    .join(" · ")}`
                : "Warm-up drill. Make a few mistakes in practice to unlock personalized text."}
          </div>
        )}
      </div>
      <TypingEngine
        key={`${mode}-${seed}-${seconds}-${count}-${level}-${language}-${day}`}
        text={text}
        kind={mode === "daily" ? "daily" : mode === "adaptive" ? "adaptive" : "practice"}
        label={label}
        seconds={mode === "time" ? seconds : undefined}
        fullTime={mode === "time"}
        competitive={mode === "time" || mode === "words" || mode === "daily"}
        onRepeat={() => {
          const now = Date.now();
          reseed(now);
          if (mode === "adaptive") {
            const state = useCrown.getState();
            setDrill(
              adaptiveText(
                state.keys,
                state.words,
                now,
                makeText("Common words", language, 45, now),
              ),
            );
          }
        }}
      />
      <p className="small-text test-foot">
        The timer starts on your first keystroke. Press <kbd>Esc</kbd> in the typing area to
        restart.
      </p>
    </main>
  );
}
