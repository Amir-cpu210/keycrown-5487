import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CloudRain,
  Flag,
  HeartPulse,
  Keyboard as KeyIcon,
  Leaf,
  Play,
  RotateCcw,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { makeText, random } from "./content";
import { TypingEngine, useCapture } from "./engine";
import { addCount, fresh, keySound, result, score } from "./metrics";
import { Results } from "./results";
import { PageHead } from "./shared";
import { useCrown, type Outcome, type Result } from "./store";
const options = [
  {
    id: "falling",
    name: "Falling Words",
    Icon: CloudRain,
    detail: "Catch words before they reach the floor. Five misses end the round.",
    tag: "REFLEX",
  },
  {
    id: "race",
    name: "Race",
    Icon: Flag,
    detail: "Take on three rivals and reach the end of the passage first.",
    tag: "SPEED",
  },
  {
    id: "survival",
    name: "Survival",
    Icon: HeartPulse,
    detail: "Type to buy time. Each word gives you a little less breathing room.",
    tag: "ENDURANCE",
  },
  {
    id: "zen",
    name: "Zen Mode",
    Icon: Leaf,
    detail: "No countdown and no opponents. Finish whenever you’re ready.",
    tag: "FOCUS",
  },
];
export function Games() {
  return (
    <main className="shell inner-page">
      <PageHead
        tag="THE PLAYGROUND"
        title="Typing games"
        sub="A change of pace can make practice easier to stick with."
      />
      <div className="games-grid">
        {options.map(({ id, name, Icon, detail, tag }) => (
          <Link key={id} to={`/games/${id}`} className="surface game-card">
            <span className="feature-icon">
              <Icon size={24} />
            </span>
            <div className="micro gold">{tag}</div>
            <h2>{name}</h2>
            <p>{detail}</p>
            <span className="text-link">
              Play now <ArrowRight size={16} />
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
export function GamePage() {
  const { id } = useParams<{ id: string }>();
  return <GameScreen key={id} id={id} />;
}
function GameScreen({ id }: { id: string }) {
  const item = options.find((x) => x.id === id);
  const [speed, setSpeed] = useState(36),
    [seed, setSeed] = useState(Date.now);
  const lang = useCrown((s) => s.settings.language);
  if (!item)
    return (
      <main className="shell inner-page">
        <PageHead
          tag="THE PLAYGROUND"
          title="Game not found"
          sub="Choose a game from the playground."
        />
        <Link className="btn primary" to="/games">
          Back to games
        </Link>
      </main>
    );
  const kind = item.id as "falling" | "race" | "survival" | "zen";
  return (
    <main className="shell inner-page">
      <Link className="text-link back" to="/games">
        <ArrowLeft size={16} /> All games
      </Link>
      <PageHead
        tag={item.tag}
        title={item.name}
        sub={item.detail}
        action={
          kind === "race" ? (
            <div className="option-group">
              <span className="small-text">Rival pace</span>
              {[
                [20, "Casual"],
                [36, "Swift"],
                [55, "Elite"],
              ].map(([w, l]) => (
                <button
                  key={w}
                  className="chip"
                  aria-pressed={speed === w}
                  onClick={() => setSpeed(Number(w))}
                >
                  {l}
                </button>
              ))}
            </div>
          ) : undefined
        }
      />
      {kind === "falling" ? (
        <Falling key={seed} seed={seed} onRepeat={() => setSeed(Date.now())} />
      ) : (
        <TypingEngine
          key={`${seed}:${speed}`}
          kind={kind}
          label={item.name}
          text={makeText(
            kind === "race" ? "Sentences" : kind === "zen" ? "Easy words" : "Common words",
            lang,
            kind === "race" ? 26 : kind === "survival" ? 42 : 180,
            seed,
          )}
          seconds={kind === "survival" ? 13 : undefined}
          raceWpm={speed}
          strict={kind === "race" || kind === "survival"}
          onRepeat={() => setSeed(Date.now())}
        />
      )}
    </main>
  );
}
const ROUND = 35,
  LIFE = 5.8,
  STEP = 1.85;
function Falling({ seed, onRepeat }: { seed: number; onRepeat: () => void }) {
  const settings = useCrown((s) => s.settings),
    save = useCrown((s) => s.save);
  const words = useMemo(() => {
    const r = random(seed + 1);
    return makeText("Easy words", settings.language, Math.ceil(ROUND / STEP), seed)
      .split(" ")
      .map((word, i) => ({ word, i, spawn: i * STEP, lane: i === 0 ? 1 : Math.floor(r() * 3) }));
  }, [seed, settings.language]);
  const session = useRef(fresh()),
    caught = useRef(new Set<number>()),
    selected = useRef<number | null>(null),
    prefix = useRef("");
  const [time, setTime] = useState(0),
    [active, setActive] = useState(false),
    [done, setDone] = useState<{ metrics: Result; outcome: Outcome } | null>(null);
  const a = session.current;
  const missed = (t: number) =>
    words.filter((w) => w.spawn + LIFE <= t && !caught.current.has(w.i)).length;
  const runningTime = () => (a.started === null ? 0 : (performance.now() - a.started) / 1000);
  function finish(t: number) {
    if (a.finished) return;
    a.finished = true;
    const metrics = {
      ...result(a, t, true),
      score: caught.current.size,
      won: t >= ROUND && caught.current.size > 0,
    };
    setDone({ metrics, outcome: save("falling", "Falling Words", metrics) });
    capture.blur();
  }
  useEffect(() => {
    if (!active || done) return;
    const timer = window.setInterval(() => {
      const t = Math.min(ROUND, runningTime());
      if (t >= ROUND || missed(t) >= 5) {
        finish(t);
        return;
      }
      if (selected.current !== null && words[selected.current].spawn + LIFE <= t) {
        selected.current = null;
        prefix.current = "";
      }
      if (t - (a.points[a.points.length - 1]?.time ?? 0) >= 1) a.points.push(score(a, t));
      setTime(t);
    }, 55);
    return () => window.clearInterval(timer);
  });
  function start() {
    if (a.started === null) {
      a.started = performance.now();
      setActive(true);
    }
    capture.focus();
  }
  function type(text: string) {
    if (a.finished || !active) return;
    for (const c of Array.from(text.toLowerCase().normalize("NFC"))) {
      const t = runningTime();
      const visible = words.filter(
        (w) => w.spawn <= t && w.spawn + LIFE > t && !caught.current.has(w.i),
      );
      const current =
        selected.current === null
          ? (visible.find((w) => w.word.startsWith(c)) ?? visible[0])
          : visible.find((w) => w.i === selected.current);
      if (!current) continue;
      const expected =
        selected.current === null ? current.word[0] : current.word[prefix.current.length];
      const bad = c !== expected;
      a.attempts++;
      if (bad) a.errors++;
      addCount(a.keys, expected, bad);
      addCount(a.words, current.word, bad);
      if (settings.sound) keySound(bad);
      if (bad) continue;
      a.correct++;
      prefix.current += c;
      selected.current = current.i;
      if (prefix.current === current.word) {
        caught.current.add(current.i);
        selected.current = null;
        prefix.current = "";
      }
    }
    setTime(runningTime());
  }
  const capture = useCapture(
    type,
    () => {
      if (prefix.current) {
        prefix.current = prefix.current.slice(0, -1);
        a.correct--;
        if (!prefix.current) selected.current = null;
        setTime(runningTime());
      }
    },
    onRepeat,
  );
  if (done) return <Results {...done} kind="falling" label="Falling Words" onAgain={onRepeat} />;
  return (
    <section className="test-panel falling-panel">
      <div className="test-bar">
        <span className="window-label">
          <CloudRain size={16} />
          Falling Words
        </span>
        <button className="icon-button" aria-label="Restart game" onClick={onRepeat}>
          <RotateCcw size={17} />
        </button>
      </div>
      <div className="test-body">
        <div className="falling-stats">
          <span>
            <strong>{caught.current.size}</strong> caught
          </span>
          <span>
            <strong>{Math.max(0, 5 - missed(time))}</strong> lives
          </span>
          <span>
            <strong>{Math.ceil(ROUND - time)}s</strong> remaining
          </span>
        </div>
        <div className="falling-field">
          {capture.input}
          {!active ? (
            <div className="game-start">
              <span className="feature-icon">
                <CloudRain size={26} />
              </span>
              <h2>Ready to catch?</h2>
              <p>Type any falling word to catch it. No space or Enter needed.</p>
              <button className="btn primary" onClick={start}>
                <Play size={17} /> Start round
              </button>
            </div>
          ) : (
            words
              .filter((w) => w.spawn <= time && w.spawn + LIFE > time && !caught.current.has(w.i))
              .map((w) => (
                <div
                  className={`falling-word ${w.i === selected.current ? "selected" : ""}`}
                  key={w.i}
                  style={{
                    left: `${18 + w.lane * 32}%`,
                    top: `${6 + (w.i === 0 && time < 0.01 ? 0 : (time - w.spawn) / LIFE) * 79}%`,
                  }}
                >
                  {w.i === selected.current ? (
                    <>
                      <b>{prefix.current}</b>
                      {w.word.slice(prefix.current.length)}
                    </>
                  ) : (
                    w.word
                  )}
                </div>
              ))
          )}
          {active && (
            <button
              type="button"
              className="typing-overlay"
              tabIndex={-1}
              aria-label="Focus falling words"
              onClick={capture.focus}
            />
          )}
        </div>
        {active && (
          <button className="focus-prompt" onClick={capture.focus}>
            <KeyIcon size={16} />
            {capture.focused ? "Type a falling word" : "Tap to resume"}
          </button>
        )}
      </div>
    </section>
  );
}
