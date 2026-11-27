import type { ReactNode } from "react";
import {
  ArrowRight,
  Crown,
  Flame,
  Gauge,
  Gem,
  Keyboard,
  Layers,
  Shield,
  Sparkles,
  Swords,
} from "lucide-react";
import { Link } from "wouter";
export const tierIcons = [Keyboard, Layers, Gauge, Shield, Flame, Crown];
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="KeyCrown home">
      <span className="brand-mark">
        <Crown size={20} strokeWidth={2} />
      </span>
      <span>
        Key<span>Crown</span>
      </span>
    </Link>
  );
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="eyebrow">
      <span />
      {children}
      <span />
    </div>
  );
}
export function PageHead({
  tag,
  title,
  sub,
  action,
}: {
  tag: string;
  title: string;
  sub: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        <div className="micro gold">{tag}</div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {action && <div className="head-action">{action}</div>}
    </div>
  );
}
export const features = [
  {
    icon: Keyboard,
    name: "Learn with intent",
    detail: "Build a strong foundation with guided lessons, finger cues, and clear goals.",
    to: "/lessons",
  },
  {
    icon: Swords,
    name: "Make it a game",
    detail: "Race a rival, catch falling words, or find your flow in Zen Mode.",
    to: "/games",
  },
  {
    icon: Gem,
    name: "See the difference",
    detail: "Track your pace, spot the keys that slow you down, and earn your next rank.",
    to: "/progress",
  },
];
export function DailyBanner({ done = false }: { done?: boolean }) {
  return (
    <Link className="daily-card surface" to="/practice?mode=daily">
      <span className="feature-icon gold-icon">
        <Sparkles size={21} />
      </span>
      <div>
        <span className="micro gold">DAILY CHALLENGE</span>
        <h3>{done ? "Today’s challenge complete" : "A fresh passage every day"}</h3>
        <p>
          {done
            ? "Play again and see if you can beat your time."
            : "Build a streak, one short passage at a time."}
        </p>
      </div>
      <ArrowRight className="daily-arrow" size={21} />
    </Link>
  );
}
