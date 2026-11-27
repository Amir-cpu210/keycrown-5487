import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  CalendarDays,
  Crown,
  Flame,
  Gauge,
  Keyboard as KeyIcon,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { Link } from "wouter";
import { dateKey, rankFor, ranks, rankXP } from "./content";
import { Keyboard } from "./keyboard";
import { DailyBanner, PageHead } from "./shared";
import { useCrown, streak, weakKeys } from "./store";
export default function Progress() {
  const { runs, xp, stars, keys, settings, dates, daily, records, bestAccuracy } = useCrown();
  const rank = rankFor(xp),
    next = rankXP[rank + 1];
  const [chart, setChart] = useState<"wpm" | "accuracy" | "streak">("wpm");
  const best = Object.values(records).sort((a, b) => b.wpm - a.wpm)[0];
  const chain = streak(dates);
  const weak = weakKeys(keys);
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 13 + i);
    const day = dateKey(d);
    const r = runs.filter((x) => x.date === day && x.attempts >= 5);
    const average = (k: "wpm" | "accuracy") =>
      r.length ? Math.round(r.reduce((sum, m) => sum + m[k], 0) / r.length) : null;
    return {
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      wpm: average("wpm"),
      accuracy: average("accuracy"),
      streak: streakAsOf(d, dates),
    };
  });
  const badges = [
    {
      label: "First keystrokes",
      description: "Finish a session",
      earned: runs.length >= 1,
      Icon: KeyIcon,
    },
    {
      label: "On a roll",
      description: "Build a 3-day streak",
      earned: dates.some((d) => streakAsOf(new Date(`${d}T12:00`), dates) >= 3),
      Icon: Flame,
    },
    {
      label: "Full marks",
      description: "Earn 3 stars in a lesson",
      earned: Object.values(stars).includes(3),
      Icon: Star,
    },
    {
      label: "Speed knight",
      description: "Reach 50 WPM in practice",
      earned: (best?.wpm ?? 0) >= 50,
      Icon: Gauge,
    },
    {
      label: "Daily ritual",
      description: "Complete 5 daily challenges",
      earned: daily.length >= 5,
      Icon: CalendarDays,
    },
    { label: "Crowned", description: "Pass the Crown Test", earned: !!stars[17], Icon: Crown },
  ];
  return (
    <main className="shell inner-page">
      <PageHead
        tag="YOUR TRAINING RECORD"
        title="Progress"
        sub="See what’s improving and what to practice next. Your history stays on this device."
        action={
          <Link className="btn secondary" to="/practice">
            <ArrowRight size={17} /> New session
          </Link>
        }
      />
      <div className="metric-grid">
        {[
          [Gauge, "Personal best", best ? `${best.wpm} WPM` : "—"],
          [Target, "Best accuracy", bestAccuracy ? `${bestAccuracy}%` : "—"],
          [Flame, "Current streak", `${chain} ${chain === 1 ? "day" : "days"}`],
          [Trophy, "Lessons passed", String(Object.keys(stars).length)],
        ].map(([Icon, label, value]) => {
          const Glyph = Icon as typeof Gauge;
          return (
            <div className="surface metric-card" key={String(label)}>
              <Glyph size={19} />
              <span>{String(label)}</span>
              <strong>{String(value)}</strong>
            </div>
          );
        })}
      </div>
      <div className="dash-grid">
        <section className="surface dash-card">
          <div className="dash-head">
            <div>
              <div className="micro gold">LAST 14 DAYS</div>
              <h2>Practice trends</h2>
            </div>
            <div className="option-group">
              {(
                [
                  ["wpm", "WPM"],
                  ["accuracy", "Accuracy"],
                  ["streak", "Streak"],
                ] as const
              ).map(([k, label]) => (
                <button
                  className="chip"
                  key={k}
                  aria-pressed={chart === k}
                  onClick={() => setChart(k)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {!runs.length ? (
            <div className="empty">
              <Gauge size={28} />
              <p>Finish a typing session to see your trends here.</p>
              <Link to="/practice" className="text-link">
                Open practice <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <figure className="chart trend-chart" aria-label={`14-day ${chart} chart`}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={days} margin={{ top: 8, right: 5, bottom: 0, left: -25 }}>
                  <defs>
                    <linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--mint)" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="var(--mint)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    minTickGap={30}
                    tick={{ fill: "var(--muted)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    domain={[0, chart === "accuracy" ? 100 : "auto"]}
                    tick={{ fill: "var(--muted)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--panel)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  />
                  <Area
                    dataKey={chart}
                    name={
                      chart === "wpm"
                        ? "Average WPM"
                        : chart === "accuracy"
                          ? "Average accuracy %"
                          : "Streak days"
                    }
                    stroke="var(--mint)"
                    strokeWidth={2}
                    fill="url(#trend-fill)"
                    activeDot={{ r: 5 }}
                    dot={{ r: 2, fill: "var(--mint)" }}
                    connectNulls
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </figure>
          )}
        </section>
        <section className="surface dash-card rank-card">
          <span className="feature-icon gold-icon">
            <Crown size={26} />
          </span>
          <div className="micro gold">CURRENT RANK · LEVEL {rank + 1}</div>
          <h2>{ranks[rank]}</h2>
          <p>{next ? `${next - xp} XP to ${ranks[rank + 1]}` : "Highest rank achieved"}</p>
          <div className="progress-bar">
            <i
              style={{
                width: `${next ? ((xp - rankXP[rank]) / (next - rankXP[rank])) * 100 : 100}%`,
              }}
            />
          </div>
          <div className="small-text">{xp} XP earned</div>
        </section>
      </div>
      <section className="surface dash-card heat-card">
        <div className="dash-head">
          <div>
            <div className="micro gold">ACCURACY BY KEY</div>
            <h2>Weakest keys</h2>
            <p>
              {weak.length
                ? `Focus on ${weak
                    .slice(0, 5)
                    .map(([k]) => k.toUpperCase())
                    .join(", ")}. Warmer keys show more frequent errors.`
                : "Your key-by-key error patterns will appear here as you practice."}
            </p>
          </div>
          <Link className="btn secondary" to="/practice?mode=adaptive">
            <Sparkles size={17} /> Adaptive drill
          </Link>
        </div>
        <Keyboard layout={settings.layout} heat={keys} />
        <div className="heat-legend small-text">
          <span>
            <i className="heat-cool" /> No errors
          </span>
          <span>
            <i className="heat-warm" /> Some errors
          </span>
          <span>
            <i className="heat-hot" /> Over 30% errors
          </span>
        </div>
      </section>
      <section className="surface dash-card">
        <div className="dash-head">
          <div>
            <div className="micro gold">MILESTONES</div>
            <h2>Achievements</h2>
          </div>
        </div>
        <div className="badges-grid">
          {badges.map(({ label, description, earned, Icon }) => (
            <div key={label} className={`badge-card ${earned ? "is-earned" : ""}`}>
              <span className={`feature-icon ${earned ? "gold-icon" : ""}`}>
                <Icon size={21} />
              </span>
              <strong>{label}</strong>
              <span>{description}</span>
              <span className="micro">{earned ? "EARNED" : "LOCKED"}</span>
            </div>
          ))}
        </div>
      </section>
      <DailyBanner done={daily.includes(dateKey())} />
      <section className="surface dash-card">
        <div className="dash-head">
          <div>
            <div className="micro gold">TRAINING LOG</div>
            <h2>Recent sessions</h2>
          </div>
        </div>
        {runs.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Date</th>
                  <th>WPM</th>
                  <th>Accuracy</th>
                  <th>XP</th>
                </tr>
              </thead>
              <tbody>
                {runs.slice(0, 12).map((r) => (
                  <tr key={r.id}>
                    <td>{r.label}</td>
                    <td>{r.date}</td>
                    <td>{r.wpm}</td>
                    <td>{r.accuracy}%</td>
                    <td>+{r.xp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="small-text">No sessions yet.</p>
        )}
      </section>
    </main>
  );
}
function streakAsOf(d: Date, dates: string[]) {
  let count = 0;
  const x = new Date(d);
  while (dates.includes(dateKey(x))) {
    count++;
    x.setDate(x.getDate() - 1);
  }
  return count;
}
