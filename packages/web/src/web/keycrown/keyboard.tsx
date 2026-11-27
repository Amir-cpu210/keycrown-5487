import type { Counter, Layout } from "./store";
export const boards: Record<Layout, string[]> = {
  QWERTY: ["qwertyuiop[]", "asdfghjkl;'", "zxcvbnm,./"],
  AZERTY: ["azertyuiop^$", "qsdfghjklmù", "wxcvbn,;:!"],
  DVORAK: ["',.pyfgcrl/=", "aoeuidhtns-", ";qjkxbmwvz"],
  COLEMAK: ["qwfpgjluy;[]", "arstdhneio'", "zxcvbkm,./"],
};
const shifted: Record<string, string> = Object.fromEntries(
  Array.from('~!@#$%^&*()_+{}|:"<>?').map((c, i) => [c, "`1234567890-=[]\\;',./"[i]]),
);
const fingerNames = [
  "Left pinky",
  "Left ring",
  "Left middle",
  "Left index",
  "Right index",
  "Right middle",
  "Right ring",
  "Right pinky",
  "Thumb",
];
export function locate(key: string, layout: Layout) {
  if (key === " ") return 8;
  const c = physicalKey(key, layout);
  const row = getRows(layout).find((r) => r.includes(c));
  if (!row) return -1;
  const i = row.indexOf(c) - (row[0] === "`" ? 1 : 0);
  return i <= 0
    ? 0
    : i === 1
      ? 1
      : i === 2
        ? 2
        : i < 5
          ? 3
          : i < 7
            ? 4
            : i === 7
              ? 5
              : i === 8
                ? 6
                : 7;
}
function getRows(layout: Layout) {
  return [layout === "AZERTY" ? "`1234567890)-" : "`1234567890-=", ...boards[layout]];
}
function physicalKey(k: string, layout: Layout) {
  const c = k.toLowerCase();
  return getRows(layout).some((r) => r.includes(c))
    ? c
    : (shifted[c] ?? c.normalize("NFD").replace(/\p{M}/gu, ""));
}
export function Keyboard({
  layout,
  next = "",
  pressed = "",
  wrong = false,
  heat,
  compact = false,
}: {
  layout: Layout;
  next?: string;
  pressed?: string;
  wrong?: boolean;
  heat?: Counter;
  compact?: boolean;
}) {
  const expected = physicalKey(next, layout),
    current = physicalKey(pressed, layout),
    f = locate(next, layout);
  const key = (c: string, i: number) => {
    const data = heat?.[c];
    const rate = data ? data.errors / data.attempts : 0;
    return (
      <span
        key={`${c}-${i}`}
        title={
          heat
            ? `${c === " " ? "Space" : c.toUpperCase()}: ${data ? `${data.errors} errors / ${data.attempts} attempts` : "not yet typed"}`
            : undefined
        }
        className={`keycap ${expected === c ? "nextkey" : ""} ${current === c ? (wrong ? "wrongkey" : "hitkey") : ""} ${heat ? (rate > 0.3 ? "heat-hot" : rate > 0 ? "heat-warm" : data ? "heat-cool" : "") : ""} ${c === " " ? "spacekey" : ""}`}
      >
        {c === " " ? "" : c.toUpperCase()}
      </span>
    );
  };
  return (
    <div
      className={`keyboard ${compact ? "compact" : ""}`}
      aria-label={heat ? "Typing errors by key" : `${layout} on-screen keyboard`}
    >
      {getRows(layout).map((row, i) => (
        <div key={i} className="keyrow">
          {i === 1 && <span className="keycap modifier">tab</span>}
          {i === 2 && <span className="keycap modifier">caps</span>}
          {i === 3 && <span className="keycap modifier">shift</span>}
          {Array.from(row).map(key)}
          <span className="keycap modifier">{["⌫", "\\", "enter", "shift"][i]}</span>
        </div>
      ))}
      <div className="keyrow space-row">
        <span className="keycap modifier">ctrl</span>
        <span className="keycap modifier">alt</span>
        {key(" ", 0)}
        <span className="keycap modifier">alt</span>
        <span className="keycap modifier">ctrl</span>
      </div>
      {!compact && !heat && (
        <p className="finger-hint">
          {f >= 0 ? `Next finger: ${fingerNames[f]}` : "Keyboard guide"}
        </p>
      )}
    </div>
  );
}
export function Hands() {
  const colors = ["#d4af37", "#82bb9d", "#6cd0a6", "#43e2a9"];
  return (
    <svg viewBox="0 0 300 110" className="hands" aria-labelledby="hands-label">
      <title id="hands-label">
        Home row finger placement: left hand A S D F, right hand J K L semicolon, thumbs on Space
      </title>
      <path
        d="M34 98 18 66 Q14 55 22 52 Q26 49 34 61 L41 69 V31 Q41 22 48 22 Q55 22 55 30 V49 H60 V17 Q60 8 67 8 Q74 8 74 17 V46 H78 V22 Q78 13 85 13 Q92 13 92 22 V51 H96 V34 Q96 25 103 25 Q110 25 110 34 V67 Q110 84 100 98 Z"
        transform="translate(8,0)"
      />
      <path
        d="M34 98 18 66 Q14 55 22 52 Q26 49 34 61 L41 69 V31 Q41 22 48 22 Q55 22 55 30 V49 H60 V17 Q60 8 67 8 Q74 8 74 17 V46 H78 V22 Q78 13 85 13 Q92 13 92 22 V51 H96 V34 Q96 25 103 25 Q110 25 110 34 V67 Q110 84 100 98 Z"
        transform="translate(292,0) scale(-1,1)"
      />
      {[56, 75, 93, 111, 244, 225, 207, 189].map((x, i) => (
        <text key={x} x={x} y={[41, 27, 32, 44][i % 4]} fill={colors[i % 4]} textAnchor="middle">
          {["A", "S", "D", "F", ";", "L", "K", "J"][i]}
        </text>
      ))}
      <text x="150" y="91" textAnchor="middle" fill="#a6b4ac">
        SPACE
      </text>
    </svg>
  );
}
