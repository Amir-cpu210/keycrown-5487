import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Crown, RotateCcw, Star, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { lessons, tiers } from "./content";
import { useCrown, type Kind, type Result, type Outcome } from "./store";
export function PaceChart({ points }: { points: Result["points"] }) {
  return (
    <figure
      className="chart"
      aria-label={`Pace chart: final corrected speed ${points[points.length - 1]?.wpm ?? 0} WPM, final raw speed ${points[points.length - 1]?.raw ?? 0} WPM.`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 10, bottom: 0, left: -23 }}>
          <defs>
            <linearGradient id="pace-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--mint)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--mint)" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="time"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(n) => `${n}s`}
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
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
            labelFormatter={(n) => `${n}s`}
          />
          <Area
            type="monotone"
            dataKey="raw"
            name="Raw WPM"
            stroke="var(--gold)"
            strokeDasharray="4 5"
            strokeOpacity={0.65}
            fill="none"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="wpm"
            name="WPM"
            stroke="var(--mint)"
            strokeWidth={2}
            fill="url(#pace-fill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </figure>
  );
}
export function Results({
  metrics: r,
  outcome: o,
  kind,
  label,
  lessonId,
  onAgain,
}: {
  metrics: Result;
  outcome: Outcome;
  kind: Kind;
  label: string;
  lessonId?: number;
  onAgain: () => void;
}) {
  const reduced = useCrown((s) => s.settings.reduced);
  const lesson = lessonId === undefined ? undefined : lessons[lessonId];
  const celebrated = !!o.stars || o.personalBest || r.won;
  const title = lesson
    ? o.stars
      ? "Lesson passed"
      : "Not quite yet"
    : kind === "placement"
      ? "Placement complete"
      : kind === "race"
        ? r.won
          ? "You won the race"
          : "Race finished"
        : kind === "survival"
          ? r.won
            ? "You survived"
            : "Time ran out"
          : kind === "falling"
            ? "Round complete"
            : o.personalBest
              ? "A new personal best"
              : "Session complete";
  return (
    <section className="test-panel result-panel" aria-label="Typing results">
      <div className="test-bar">
        <span className="window-label">
          <Trophy size={16} />
          {label}
        </span>
        <span className="live">
          <i /> RESULTS
        </span>
      </div>
      <div className="result-inner">
        <div className="result-heading">
          <motion.div
            className={`result-crown ${celebrated ? "celebrated" : ""}`}
            initial={reduced || !celebrated ? false : { scale: 0.45, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 235, damping: 15 }}
          >
            <Crown size={31} />
          </motion.div>
          <div>
            <h2>{title}</h2>
            <p>
              {lesson
                ? o.stars
                  ? `+${o.xp} XP · ${o.stars} of 3 stars`
                  : `Goal: ${lesson.wpm} WPM and ${lesson.accuracy}% accuracy`
                : kind === "placement"
                  ? o.placed !== undefined && o.placed > 0
                    ? `${tiers[o.placed / 3]} lessons unlocked.`
                    : "Start with Beginner, or keep your current placement."
                  : `+${o.xp} XP${r.score !== undefined ? ` · ${r.score} words caught` : ""}`}
            </p>
          </div>
          {lesson && (
            <div className="result-stars" aria-label={`${o.stars} of 3 stars`}>
              {[1, 2, 3].map((n) => (
                <Star
                  size={21}
                  key={n}
                  fill={n <= o.stars ? "currentColor" : "none"}
                  className={n <= o.stars ? "earned" : ""}
                />
              ))}
            </div>
          )}
        </div>
        <div className="result-stats">
          {[
            [r.wpm, "WPM"],
            [r.raw, "Raw WPM"],
            [`${r.accuracy}%`, "Accuracy"],
            [`${r.consistency}%`, "Consistency"],
            [r.errors, "Errors"],
          ].map(([value, name]) => (
            <div key={name}>
              <strong>{value}</strong>
              <span>{name}</span>
            </div>
          ))}
        </div>
        <h3 className="chart-heading">
          Pace over time <span>{r.duration}s</span>
        </h3>
        <PaceChart points={r.points} />
        <div className="actions">
          <button className="btn secondary" onClick={onAgain}>
            <RotateCcw size={16} /> Try again
          </button>
          {lesson &&
            o.stars > 0 &&
            (lesson.id < lessons.length - 1 ? (
              <Link className="btn primary" to={`/lessons/${lesson.id + 2}`}>
                Next lesson <ArrowRight size={16} />
              </Link>
            ) : (
              <Link className="btn primary" to="/progress">
                View your crown <ArrowRight size={16} />
              </Link>
            ))}
          {!lesson && (
            <Link
              className="btn primary"
              to={kind === "placement" ? "/lessons" : kind === "demo" ? "/practice" : "/progress"}
            >
              {kind === "placement"
                ? "Open lessons"
                : kind === "demo"
                  ? "Full practice"
                  : "View progress"}
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
