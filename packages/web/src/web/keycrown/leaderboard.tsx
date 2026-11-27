import { useState } from "react";
import { Crown, Info, Medal, Trophy } from "lucide-react";
import { dateKey, random } from "./content";
import { PageHead } from "./shared";
import { useCrown } from "./store";
const periods = ["Daily", "Weekly", "All time"] as const;
const rivals = [
  "EmeraldFox",
  "VelvetKeys",
  "SilverRook",
  "QuietStorm",
  "SwiftQuill",
  "CopperKnight",
  "IvoryInk",
  "WolfAtDawn",
  "PaperCrown",
];
export default function Leaderboard() {
  const [period, setPeriod] = useState<(typeof periods)[number]>("Daily");
  const records = useCrown((s) => s.records),
    name = useCrown((s) => s.settings.name);
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const since = period === "Daily" ? dateKey() : period === "Weekly" ? dateKey(monday) : "";
  const rand = random(
    (period === "Daily" ? Number(since.replace(/-/g, "")) : period === "Weekly" ? 281 : 918) *
      98701,
  );
  const rows = rivals.map((name, i) => ({
    name,
    wpm: Math.floor(
      (period === "Daily" ? 105 : period === "Weekly" ? 120 : 143) - i * 7 + rand() * 5,
    ),
    accuracy: Math.round((94 + rand() * 6) * 10) / 10,
    player: false,
  }));
  const best = Object.entries(records)
    .filter(([day]) => day >= since)
    .map(([, record]) => record)
    .sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy)[0];
  if (best)
    rows.push({ name: name || "You", wpm: best.wpm, accuracy: best.accuracy, player: true });
  rows.sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy);
  return (
    <main className="shell inner-page">
      <PageHead
        tag="THE ROYAL STANDINGS"
        title="Leaderboard"
        sub="Compare your best eligible practice result with simulated rivals."
      />
      <div className="local-notice">
        <Info size={17} />{" "}
        <span>
          <strong>Demo leaderboard.</strong> Rivals are simulated, and your score only appears on
          this device. Eligible runs require at least 20 keystrokes and 80% accuracy.
        </span>
      </div>
      <div className="surface leaderboard">
        <div className="dash-head">
          <div>
            <span className="micro gold">WPM RANKING</span>
            <h2>
              <Trophy size={22} /> Standings
            </h2>
          </div>
          <div className="option-group">
            {periods.map((p) => (
              <button
                key={p}
                className="chip"
                aria-pressed={period === p}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>WPM</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.player}-${r.name}`} className={r.player ? "player-row" : ""}>
                  <td>
                    <span className={`rank-tile rank-${i}`}>
                      {i === 0 ? (
                        <Crown size={15} />
                      ) : i < 3 ? (
                        <Medal size={15} />
                      ) : (
                        String(i + 1).padStart(2, "0")
                      )}
                    </span>
                  </td>
                  <td>
                    <span className="leader-name">{r.name}</span>
                    {r.player && <span className="micro you-tag">YOU</span>}
                  </td>
                  <td>
                    <strong>{r.wpm}</strong>
                  </td>
                  <td>{r.accuracy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!best && (
          <p className="small-text leaderboard-note">
            Finish a qualifying timed, word-count, or daily practice session to add your score.
          </p>
        )}
      </div>
    </main>
  );
}
