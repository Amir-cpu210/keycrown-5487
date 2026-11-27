import { useState } from "react";
import type { ReactNode } from "react";
import { Download, Moon, Sun } from "lucide-react";
import { languages } from "./content";
import { PageHead } from "./shared";
import { useCrown, type Layout, type Settings as Preferences } from "./store";
import { promptInstall } from "./install";
function Row({
  name,
  description,
  children,
}: {
  name: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="settings-row">
      <div>
        <strong>{name}</strong>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export default function Settings() {
  const prefs = useCrown((s) => s.settings),
    set = useCrown((s) => s.setSetting),
    reset = useCrown((s) => s.reset);
  const [ask, setAsk] = useState(false),
    [notice, setNotice] = useState("");
  const toggle = (name: string, k: "sound" | "keyboard" | "stop" | "reduced") => (
    <button
      className="switch"
      type="button"
      role="switch"
      aria-label={name}
      aria-checked={prefs[k]}
      onClick={() => set(k, !prefs[k])}
    >
      <i />
    </button>
  );
  return (
    <main className="shell inner-page settings-page">
      <PageHead
        tag="YOUR SETUP"
        title="Settings"
        sub="Make KeyCrown feel right for the way you type."
      />
      <section className="surface settings-card">
        <h2>Appearance</h2>
        <Row name="Theme" description="Deep emerald or soft ivory.">
          <div className="option-group">
            <button
              className="chip"
              aria-pressed={prefs.theme === "dark"}
              onClick={() => set("theme", "dark")}
            >
              <Moon size={15} /> Dark
            </button>
            <button
              className="chip"
              aria-pressed={prefs.theme === "light"}
              onClick={() => set("theme", "light")}
            >
              <Sun size={15} /> Light
            </button>
          </div>
        </Row>
        <Row name="Typing font size" description="Applies to the passage in the typing area.">
          <select
            aria-label="Typing font size"
            value={prefs.font}
            onChange={(e) => set("font", Number(e.target.value))}
          >
            {[18, 21, 25, 29, 33, 37].map((n) => (
              <option key={n} value={n}>
                {n} px
              </option>
            ))}
          </select>
        </Row>
        <Row name="Caret style" description="Choose how to mark the next character.">
          <select
            aria-label="Caret style"
            value={prefs.caret}
            onChange={(e) => set("caret", e.target.value as Preferences["caret"])}
          >
            <option value="line">Line</option>
            <option value="block">Block</option>
            <option value="underline">Underline</option>
          </select>
        </Row>
        <Row name="Reduce motion" description="Turn off decorative transitions and celebrations.">
          {toggle("Reduce motion", "reduced")}
        </Row>
      </section>
      <section className="surface settings-card">
        <h2>Typing</h2>
        <Row name="Typing sound" description="Play a quiet tone on each keystroke.">
          {toggle("Typing sound", "sound")}
        </Row>
        <Row name="Stop on error" description="Type the correct key before the caret can advance.">
          {toggle("Stop on error", "stop")}
        </Row>
        <Row
          name="On-screen keyboard"
          description="Highlight the next key and show which finger to use."
        >
          {toggle("On-screen keyboard", "keyboard")}
        </Row>
        <Row
          name="Keyboard layout"
          description="Changes the visual guide. Set your physical layout in your device settings."
        >
          <select
            aria-label="Keyboard layout"
            value={prefs.layout}
            onChange={(e) => set("layout", e.target.value as Layout)}
          >
            {["QWERTY", "AZERTY", "DVORAK", "COLEMAK"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Row>
        <Row
          name="Practice language"
          description="Applies to practice text and games. Academy lessons are in English."
        >
          <select
            aria-label="Practice language"
            value={prefs.language}
            onChange={(e) => set("language", e.target.value as Preferences["language"])}
          >
            {languages.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Row>
      </section>
      <section className="surface settings-card">
        <h2>This device</h2>
        <Row name="Display name" description="Shown next to your score on the local leaderboard.">
          <input
            aria-label="Display name"
            value={prefs.name}
            maxLength={24}
            onChange={(e) => set("name", e.target.value)}
          />
        </Row>
        <Row
          name="Install KeyCrown"
          description="Add it to your device and practice offline after the first load."
        >
          <button
            className="btn secondary"
            onClick={async () => {
              if (!(await promptInstall()))
                setNotice(
                  "Open your browser menu and choose Install or Add to Home Screen. On iOS, use Safari’s Share menu.",
                );
            }}
          >
            <Download size={16} /> Install
          </button>
        </Row>
        {notice && <output className="small-text">{notice}</output>}
        <Row
          name="Reset training data"
          description="Clears sessions, XP, lesson stars, streaks, and error history. Your settings stay."
        >
          {ask ? (
            <div className="actions">
              <button className="chip" onClick={() => setAsk(false)}>
                Cancel
              </button>
              <button
                className="btn danger"
                onClick={() => {
                  reset();
                  setAsk(false);
                  setNotice("Training data reset.");
                }}
              >
                Confirm reset
              </button>
            </div>
          ) : (
            <button className="btn danger" onClick={() => setAsk(true)}>
              Reset progress
            </button>
          )}
        </Row>
      </section>
    </main>
  );
}
