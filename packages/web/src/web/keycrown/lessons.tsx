import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, Check, Crosshair, Lock, Star } from "lucide-react";
import { lessons, tiers, tierNotes } from "./content";
import { TypingEngine } from "./engine";
import { Hands } from "./keyboard";
import { PageHead, tierIcons } from "./shared";
import { useCrown } from "./store";
export const placement =
  "Every steady step brings us closer to the summit. A clear morning, a quiet desk, and a little patience can make difficult work feel possible. Keep your hands relaxed, stay focused, and let the words come one at a time.";
export function isOpen(id: number, stars: Record<number, number>, start: number) {
  return (id % 3 === 0 && id <= start) || Boolean(stars[id] || stars[id - 1]);
}
export function Lessons() {
  const stars = useCrown((s) => s.stars),
    start = useCrown((s) => s.placement);
  const count = Object.keys(stars).length;
  useEffect(() => {
    if (location.hash.startsWith("#tier-"))
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: "start" });
  }, []);
  return (
    <main className="shell inner-page">
      <PageHead
        tag="THE ACADEMY"
        title="Lesson roadmap"
        sub="Start with the home row and work your way up. Pass a lesson to unlock the next one."
        action={
          <Link className="btn secondary" to="/lessons/placement">
            <Crosshair size={17} /> Placement test
          </Link>
        }
      />
      <div className="surface map-summary">
        <span>
          <strong>
            {count} / {lessons.length}
          </strong>{" "}
          lessons passed
        </span>
        <progress
          className="progress-bar native-progress"
          aria-label="Lessons passed"
          value={count}
          max={lessons.length}
        />
        <span className="micro">
          {Object.values(stars).reduce((a, b) => a + b, 0)} STARS EARNED
        </span>
      </div>
      <div className="lesson-map">
        {tiers.map((name, t) => {
          const Icon = tierIcons[t];
          return (
            <section className="tier surface" key={name} id={`tier-${t}`}>
              <div className="tier-heading">
                <span className="feature-icon">
                  <Icon size={24} />
                </span>
                <div>
                  <div className="micro gold">LEVEL 0{t + 1}</div>
                  <h2>{name}</h2>
                  <p>{tierNotes[t]}</p>
                </div>
              </div>
              {lessons
                .filter((l) => l.tier === t)
                .map((l) => {
                  const n = stars[l.id] ?? 0;
                  const open = isOpen(l.id, stars, start);
                  const contents = (
                    <>
                      <div className={`lesson-state ${n ? "passed" : open ? "available" : ""}`}>
                        {n ? (
                          <Check size={17} />
                        ) : open ? (
                          <span>{String(l.id + 1).padStart(2, "0")}</span>
                        ) : (
                          <Lock size={16} />
                        )}
                      </div>
                      <div className="lesson-title">
                        <strong>{l.name}</strong>
                        <span>
                          {l.focus} · {l.wpm} WPM · {l.accuracy}%
                        </span>
                      </div>
                      <div className="lesson-stars" aria-label={`${n} of 3 stars`}>
                        {[1, 2, 3].map((i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i <= n ? "earned" : ""}
                            fill={i <= n ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                      {open && <ArrowRight size={17} className="row-arrow" />}
                    </>
                  );
                  return open ? (
                    <Link className="lesson-row" key={l.id} to={`/lessons/${l.id + 1}`}>
                      {contents}
                    </Link>
                  ) : (
                    <div className="lesson-row locked" key={l.id} aria-label={`${l.name}, locked`}>
                      {contents}
                    </div>
                  );
                })}
            </section>
          );
        })}
      </div>
    </main>
  );
}
export function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const stars = useCrown((s) => s.stars),
    start = useCrown((s) => s.placement);
  const l = lessons[Number(id) - 1];
  const test = id === "placement";
  if (!test && (!l || !isOpen(l.id, stars, start)))
    return (
      <main className="shell inner-page">
        <PageHead
          tag="THE ACADEMY"
          title={l ? "Lesson locked" : "Lesson not found"}
          sub="Open the roadmap to see your available lessons."
        />
        <Link className="btn primary" to="/lessons">
          <ArrowLeft size={16} /> Back to lessons
        </Link>
      </main>
    );
  return (
    <main className="shell inner-page">
      <Link className="text-link back" to="/lessons">
        <ArrowLeft size={16} /> Lesson roadmap
      </Link>
      <PageHead
        tag={test ? "FIND YOUR LEVEL" : `LEVEL 0${l.tier + 1} / ${tiers[l.tier].toUpperCase()}`}
        title={test ? "Placement test" : l.name}
        sub={
          test
            ? "Finish the passage with 95% accuracy or better. Your speed determines which level you unlock."
            : `${l.focus}. Reach ${l.wpm} WPM and ${l.accuracy}% accuracy to pass.`
        }
      />
      <TypingEngine
        key={id}
        text={test ? placement : l.seconds ? Array(16).fill(l.text).join(" ") : l.text}
        kind={test ? "placement" : "lesson"}
        seconds={test ? undefined : l.seconds}
        fullTime={!!l?.seconds}
        label={test ? "Placement test" : l.name}
        lessonId={test ? undefined : l.id}
        strict={l?.accuracy === 100}
      />
      {!test && l.tier === 0 && (
        <section className="surface guide">
          <div>
            <div className="micro gold">TECHNIQUE</div>
            <h2>Start with the home row.</h2>
            <p>
              Rest your left fingers on A, S, D, F and your right fingers on J, K, L, and semicolon.
              Use the bumps on F and J to re-center without looking.
            </p>
            <p>
              Sit upright, relax your shoulders, and keep your wrists neutral. Let either thumb tap
              Space. The lesson uses QWERTY home-row positions.
            </p>
          </div>
          <Hands />
        </section>
      )}
    </main>
  );
}
