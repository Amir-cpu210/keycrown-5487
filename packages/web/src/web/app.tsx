import { lazy, Suspense, useEffect, useState } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import { ArrowRight, Menu, Settings as Gear, X } from "lucide-react";
import { MotionConfig } from "framer-motion";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Provider } from "./components/provider";
import Home from "./keycrown/home";
import "./keycrown/install";
import { Brand, PageHead } from "./keycrown/shared";
import { useCrown } from "./keycrown/store";
const Practice = lazy(() => import("./keycrown/practice"));
const Progress = lazy(() => import("./keycrown/progress"));
const Leaderboard = lazy(() => import("./keycrown/leaderboard"));
const Settings = lazy(() => import("./keycrown/settings"));
const Lessons = lazy(() => import("./keycrown/lessons").then((m) => ({ default: m.Lessons })));
const LessonPage = lazy(() =>
  import("./keycrown/lessons").then((m) => ({ default: m.LessonPage })),
);
const Games = lazy(() => import("./keycrown/games").then((m) => ({ default: m.Games })));
const GamePage = lazy(() => import("./keycrown/games").then((m) => ({ default: m.GamePage })));
const links = [
  ["/lessons", "Lessons"],
  ["/practice", "Practice"],
  ["/games", "Games"],
  ["/progress", "Progress"],
  ["/leaderboard", "Leaderboard"],
];
function Site() {
  const [path] = useLocation();
  const [open, setOpen] = useState(false);
  const prefs = useCrown((s) => s.settings);
  useEffect(() => {
    setOpen(false);
    if (!location.hash) window.scrollTo(0, 0);
    const label =
      links.find(([url]) => path.startsWith(url))?.[1] ??
      (path === "/settings" ? "Settings" : "Typing Academy");
    document.title = `KeyCrown · ${label}`;
  }, [path]);
  useEffect(() => {
    document.documentElement.dataset.theme = prefs.theme;
    document.documentElement.dataset.motion = prefs.reduced ? "reduce" : "auto";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", prefs.theme === "dark" ? "#07090A" : "#f5f5ec");
  }, [prefs.theme, prefs.reduced]);
  useEffect(() => {
    if (import.meta.env.MODE === "production" && "serviceWorker" in navigator)
      void navigator.serviceWorker.register("/keycrown-sw.js").catch(() => {});
  }, []);
  const active = (url: string) => path === url || path.startsWith(`${url}/`);
  return (
    <MotionConfig reducedMotion={prefs.reduced ? "always" : "user"}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="nav-wrap">
          <Brand />
          <nav
            className={open ? "site-nav open" : "site-nav"}
            aria-label="Main navigation"
            id="site-nav"
          >
            {links.map(([url, label]) => (
              <Link key={url} href={url} aria-current={active(url) ? "page" : undefined}>
                {label}
              </Link>
            ))}
            <Link
              href="/settings"
              className="mobile-settings"
              aria-current={active("/settings") ? "page" : undefined}
            >
              Settings
            </Link>
          </nav>
          <div className="nav-actions">
            <Link
              className="gear-link"
              href="/settings"
              aria-label="Settings"
              aria-current={active("/settings") ? "page" : undefined}
            >
              <Gear size={19} />
            </Link>
            <Link href="/practice" className="btn primary nav-start">
              Start typing <ArrowRight size={15} />
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="icon-button menu-button"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-controls="site-nav"
              aria-expanded={open}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>
      <div id="main-content" tabIndex={-1}>
        <Suspense fallback={<output className="shell route-loading">Loading…</output>}>
          <Switch>
            <Route path="/">
              <main>
                <Home />
              </main>
            </Route>
            <Route path="/lessons" component={Lessons} />
            <Route path="/lessons/:id" component={LessonPage} />
            <Route path="/practice" component={Practice} />
            <Route path="/games" component={Games} />
            <Route path="/games/:id" component={GamePage} />
            <Route path="/progress" component={Progress} />
            <Route path="/leaderboard" component={Leaderboard} />
            <Route path="/settings" component={Settings} />
            <Route>
              <main className="inner-page shell">
                <PageHead tag="KEYCROWN" title="Page not found" sub="That page doesn’t exist." />
                <Link className="btn primary" href="/">
                  Back to home
                </Link>
              </main>
            </Route>
          </Switch>
        </Suspense>
      </div>
      <footer className="site-footer">
        <div className="shell footer-wrap">
          <Brand />
          <span>Practice at your pace.</span>
          <nav aria-label="Footer navigation">
            <Link href="/lessons">Lessons</Link>
            <Link href="/practice?mode=daily">Daily challenge</Link>
            <Link href="/settings">Settings</Link>
          </nav>
        </div>
      </footer>
    </MotionConfig>
  );
}
export default function App() {
  return (
    <Provider>
      <Site />
      {import.meta.env.DEV && <AgentFeedback />}
      <RunableBadge />
      <SpeedInsights />
    </Provider>
  );
}
