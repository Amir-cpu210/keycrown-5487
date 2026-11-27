import {
  useCallback,
  useEffect,
  useLayoutEffect,
  lazy,
  Suspense,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowRight,
  Clock3,
  Gauge,
  Keyboard as KeyboardIcon,
  RotateCcw,
  Target,
  Volume2,
  VolumeX,
  Crown,
} from "lucide-react";
import { Keyboard } from "./keyboard";
import { addCount, fresh, keySound, result, score } from "./metrics";
import { useCrown, type Kind, type Outcome, type Result } from "./store";
const Results = lazy(() => import("./results").then((module) => ({ default: module.Results })));
export function useCapture(
  onText: (text: string) => void,
  onBack: () => void,
  onReset: () => void,
) {
  const box = useRef<HTMLTextAreaElement>(null),
    composition = useRef(false),
    select = () => {
      const el = box.current;
      if (el) {
        el.value = " ";
        el.setSelectionRange(1, 1);
      }
    };
  const [focused, setFocused] = useState(false);
  const focus = useCallback(() => {
    const el = box.current;
    if (el) {
      el.focus({ preventScroll: true });
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, []);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!focused || !vv || !matchMedia("(pointer: coarse)").matches) return;
    const keepVisible = () => {
      const r = box.current?.parentElement?.getBoundingClientRect();
      const bottom = vv.offsetTop + vv.height;
      if (r && vv.height < window.innerHeight * 0.9 && r.bottom > bottom - 12)
        window.scrollBy(0, r.bottom - bottom + 12);
    };
    vv.addEventListener("resize", keepVisible);
    return () => vv.removeEventListener("resize", keepVisible);
  }, [focused]);
  const input = (
    <textarea
      ref={box}
      className="type-input"
      aria-label="Typing input"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      inputMode="text"
      defaultValue=" "
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPaste={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
      onSelect={(e) => {
        if (!composition.current) {
          const el = e.currentTarget;
          if (el.selectionStart !== el.value.length)
            el.setSelectionRange(el.value.length, el.value.length);
        }
      }}
      onCompositionStart={() => {
        composition.current = true;
      }}
      onCompositionEnd={(e) => {
        composition.current = false;
        if (e.data) onText(e.data);
        select();
      }}
      onKeyDown={(e) => {
        if (e.nativeEvent.isComposing || composition.current) return;
        if (e.key === "Backspace") {
          e.preventDefault();
          onBack();
          select();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          onReset();
        }
      }}
      onChange={(e) => {
        if (composition.current || (e.nativeEvent as InputEvent).isComposing) return;
        const action = (e.nativeEvent as InputEvent).inputType;
        const val = e.target.value;
        if (action?.startsWith("delete") || !val) onBack();
        else if (!action?.includes("Paste") && !action?.includes("Drop"))
          onText((val.startsWith(" ") ? val.slice(1) : val).replace(/[\r\n]/g, " "));
        select();
      }}
    />
  );
  return { input, focus, focused, blur: () => box.current?.blur() };
}
export function TypingText({ text, cursor }: { text: string; cursor: string[] }) {
  const viewport = useRef<HTMLDivElement>(null),
    caret = useRef<HTMLSpanElement>(null);
  const words = useMemo(() => {
    let offset = 0;
    return text.split(/(?<= )/u).map((w) => {
      const chars = Array.from(w);
      const start = offset;
      offset += chars.length;
      return { chars, start };
    });
  }, [text]);
  useLayoutEffect(() => {
    const v = viewport.current;
    const c = caret.current;
    if (!v || !c) return;
    const delta = c.getBoundingClientRect().top - v.getBoundingClientRect().top,
      line = c.getBoundingClientRect().height;
    if (!cursor.length) v.scrollTop = 0;
    else if (delta >= line * 1.85 || delta < 0) v.scrollTop += delta - line * 0.52;
  }, [cursor.length, text]);
  return (
    <div ref={viewport} className="typing-text" aria-label={`Text to type: ${text}`}>
      <div aria-hidden="true">
        {words.map(({ chars, start }) => (
          <span className="type-word" key={start}>
            {chars.map((c, j) => {
              const i = start + j;
              const typed = cursor[i];
              const active = i === cursor.length;
              return (
                <span
                  key={i}
                  ref={active ? caret : undefined}
                  className={`${active ? "char-current" : ""} ${typed !== undefined ? (typed === c ? "char-ok" : "char-bad") : ""}`}
                >
                  {c === " " ? (typed !== undefined && typed !== " " ? "_" : "\u00a0") : c}
                </span>
              );
            })}
          </span>
        ))}
      </div>
    </div>
  );
}
export function Bots({ time, progress, speed }: { time: number; progress: number; speed: number }) {
  return (
    <div className="race-lanes">
      {[
        ["You", progress],
        ["Rook", (time * speed * 4.15) / 60],
        ["Bishop", (time * speed * 5) / 60],
        ["Queen", (time * speed * 5.75) / 60],
      ].map(([name, p]) => (
        <div key={name}>
          <span>{name}</span>
          <div>
            <i
              className={name === "You" ? "you" : ""}
              style={{ width: `${Math.min(100, Number(p))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
export type EngineConfig = {
  text: string;
  kind: Kind;
  label: string;
  seconds?: number;
  lessonId?: number;
  fullTime?: boolean;
  strict?: boolean;
  raceWpm?: number;
  onRepeat?: () => void;
  demo?: boolean;
  competitive?: boolean;
};
export function TypingEngine({
  text,
  kind,
  label,
  seconds,
  lessonId,
  fullTime,
  strict,
  raceWpm,
  onRepeat,
  demo = false,
  competitive = false,
}: EngineConfig) {
  const settings = useCrown((s) => s.settings),
    set = useCrown((s) => s.setSetting),
    save = useCrown((s) => s.save);
  const chars = useMemo(() => Array.from(text), [text]);
  const words = useMemo(() => {
    return text.split(" ").flatMap((w) => Array.from(w + " ", () => w));
  }, [text]);
  const s = useRef(fresh(seconds));
  const [version, bump] = useState(0);
  const [elapsed, tick] = useState(0);
  const [done, setDone] = useState<{ metrics: Result; outcome: Outcome } | null>(null);
  const state = s.current;
  const live = score(state, elapsed);
  const running = state.started !== null && !done;
  const clock = () =>
    s.current.started === null ? 0 : (performance.now() - s.current.started) / 1000;
  function reset() {
    s.current = fresh(seconds);
    tick(0);
    setDone(null);
    bump((i) => i + 1);
  }
  function finish(ok: boolean, limit?: number) {
    const a = s.current;
    if (a.finished || a.started === null) return;
    a.finished = true;
    const runtime = limit ?? clock();
    const metrics = result(a, runtime, ok);
    if (kind === "race") metrics.won = ok && (runtime * (raceWpm ?? 36) * 5.75) / 60 < chars.length;
    if (kind === "survival") metrics.won = ok;
    const outcome = save(kind, label, metrics, lessonId, competitive);
    setDone({ metrics, outcome });
    capture.blur();
  }
  const update = useRef<() => void>(() => {});
  const releaseAt = useRef(0);
  update.current = () => {
    const a = s.current;
    if (a.finished) return;
    if (performance.now() > releaseAt.current) a.last = "";
    let t = clock();
    if (seconds !== undefined && t >= a.budget) {
      finish(fullTime || kind !== "survival", a.budget);
      return;
    }
    if (t >= 1800) {
      finish(kind === "zen");
      return;
    }
    if (t - (a.points[a.points.length - 1]?.time ?? 0) >= 1) a.points.push(score(a, t));
    tick(t);
  };
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => update.current(), 100);
    return () => window.clearInterval(id);
  }, [running]);
  function enter(value: string) {
    const a = s.current;
    if (a.finished || !value) return;
    for (const raw of Array.from(value.normalize("NFC"))) {
      if (a.cursor.length >= chars.length) break;
      if (a.started === null) a.started = performance.now();
      if (seconds !== undefined && clock() >= a.budget) {
        finish(fullTime || kind !== "survival", a.budget);
        return;
      }
      const c = raw === "’" ? "'" : raw === "“" || raw === "”" ? '"' : raw;
      const j = a.cursor.length,
        e = chars[j],
        bad = c !== e;
      a.attempts++;
      if (bad) a.errors++;
      a.last = c;
      releaseAt.current = performance.now() + 95;
      a.lastWrong = bad;
      addCount(a.keys, e.toLowerCase(), bad);
      const word = words[j]?.toLowerCase();
      if (word) addCount(a.words, word, bad);
      if (settings.sound) keySound(bad);
      if (bad && (strict || settings.stop)) continue;
      a.cursor.push(c);
      if (!bad) a.correct++;
      if (kind === "survival" && !bad && c === " ") {
        const bonus = Math.max(0.55, 2.15 - Math.floor(a.correct / 55) * 0.32);
        a.budget = clock() + Math.min(16, Math.max(0, a.budget - clock()) + bonus);
      }
      if (a.cursor.length === chars.length) {
        finish(true);
        break;
      }
    }
    tick(clock());
    bump((i) => i + 1);
  }
  function back() {
    const a = s.current;
    if (a.finished || !a.cursor.length) return;
    const i = a.cursor.length - 1;
    if (a.cursor.pop() === chars[i]) a.correct--;
    a.last = "";
    a.lastWrong = false;
    tick(clock());
    bump((i) => i + 1);
  }
  const capture = useCapture(enter, back, reset);
  if (done)
    return (
      <Suspense fallback={<output className="surface route-loading">Loading results…</output>}>
        <Results
          {...done}
          kind={kind}
          label={label}
          lessonId={lessonId}
          onAgain={() => {
            reset();
            onRepeat?.();
          }}
        />
      </Suspense>
    );
  const remaining =
    seconds === undefined ? Math.floor(elapsed) : Math.ceil(Math.max(0, state.budget - elapsed));
  const progress = Math.round((100 * state.correct) / chars.length);
  return (
    <section
      className={`test-panel ${demo ? "demo-panel" : ""}`}
      aria-label={demo ? "Interactive typing demo" : "Typing session"}
    >
      {demo ? (
        <div className="test-bar">
          <div className="window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <span className="window-label">
            <Crown size={14} /> THE TYPING ARENA
          </span>
          <span className="live">
            <i /> LIVE DEMO
          </span>
        </div>
      ) : (
        <div className="test-bar">
          <span className="window-label">
            <KeyboardIcon size={16} />
            {label}
          </span>
          <span className="live">
            <i />
            {running ? "IN SESSION" : "READY"}
          </span>
        </div>
      )}
      <div className="test-body">
        <div className="stats-strip">
          <div>
            <Gauge />
            <strong>{version && state.attempts ? live.wpm : "0"}</strong>
            <span>WPM</span>
          </div>
          <div>
            <Target />
            <strong>{live.accuracy}%</strong>
            <span>ACCURACY</span>
          </div>
          <div>
            <Clock3 />
            <strong>
              {remaining}
              <small>s</small>
            </strong>
            <span>{seconds === undefined ? "ELAPSED" : "REMAINING"}</span>
          </div>
        </div>
        {kind === "race" && (
          <Bots time={elapsed} progress={progress} speed={((raceWpm ?? 36) * 100) / chars.length} />
        )}
        {kind === "survival" && (
          <div className="survival-meter" aria-label="Time remaining">
            <i style={{ width: `${Math.min(100, (remaining / 16) * 100)}%` }} />
          </div>
        )}
        <div
          className={`test-touch ${capture.focused ? "is-focused" : ""}`}
          style={{ "--type-size": `${settings.font}px` } as React.CSSProperties}
          data-caret={settings.caret}
        >
          {capture.input}
          <TypingText text={text} cursor={state.cursor} />
          <button
            type="button"
            className="typing-overlay"
            tabIndex={-1}
            aria-label="Focus typing area"
            onClick={capture.focus}
          />
        </div>
        <div className="typing-tools">
          <div>
            {!capture.focused ? (
              <button className="focus-prompt" onClick={capture.focus}>
                <KeyboardIcon size={15} />
                {running ? "Resume typing" : "Click here to start typing"}
                <ArrowRight size={13} />
              </button>
            ) : (
              <span className="ready-text">
                <i />
                {running
                  ? demo
                    ? "You’re typing"
                    : `${live.raw} raw WPM · ${state.errors} errors`
                  : "Ready — type the highlighted character"}
              </span>
            )}
          </div>
          <div className="tools-right">
            {kind === "zen" && running && (
              <button className="chip" onClick={() => finish(true)}>
                Finish session
              </button>
            )}
            <button
              className="icon-button"
              type="button"
              title={settings.sound ? "Mute typing sounds" : "Enable typing sounds"}
              aria-label="Typing sound"
              aria-pressed={settings.sound}
              onClick={() => set("sound", !settings.sound)}
            >
              {settings.sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
            <button
              className="icon-button keyboard-toggle"
              type="button"
              title="Toggle on-screen keyboard"
              aria-label="On-screen keyboard"
              aria-pressed={settings.keyboard}
              onClick={() => set("keyboard", !settings.keyboard)}
            >
              <KeyboardIcon size={17} />
            </button>
            <button
              className="icon-button"
              type="button"
              title="Restart (Esc)"
              aria-label="Restart session"
              onClick={() => {
                reset();
                capture.focus();
              }}
            >
              <RotateCcw size={17} />
            </button>
          </div>
        </div>
        {settings.keyboard && (
          <Keyboard
            layout={settings.layout}
            next={chars[state.cursor.length]}
            pressed={state.last}
            wrong={state.lastWrong}
            compact={demo}
          />
        )}
      </div>
    </section>
  );
}
